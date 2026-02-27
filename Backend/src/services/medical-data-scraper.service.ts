/**
 * Medical Data Web Scraper Service
 * 
 * Fetches real-time medical data from public APIs:
 * - OpenFDA: Drug adverse events, labels, interactions
 * - RxNorm (NLM): Drug normalization, RxCUI lookups, interaction checking
 * - DailyMed (NLM): Drug labels, SPL documents
 * - WHO ATC Classification: Drug therapeutic classification
 * 
 * All data sources are public, free, and do not require API keys.
 * Rate-limited to respect API usage policies.
 */

import https from 'node:https';
import http from 'node:http';
import logger from '../config/logger';

// ===================== TYPES =====================

export interface OpenFDADrugLabel {
  brandName: string;
  genericName: string;
  manufacturer: string;
  route: string[];
  dosageForm: string;
  activeIngredients: string[];
  warnings: string[];
  contraindications: string[];
  drugInteractions: string[];
  adverseReactions: string[];
  boxedWarning?: string;
  pregnancyCategory?: string;
  indicationsAndUsage: string[];
}

export interface RxNormDrug {
  rxcui: string;
  name: string;
  synonym: string[];
  tty: string; // Term type (SBD, SCD, GPCK, etc.)
}

export interface RxNormInteraction {
  drug1: { rxcui: string; name: string };
  drug2: { rxcui: string; name: string };
  severity: string;
  description: string;
  source: string;
}

export interface DrugAdverseEvent {
  drugName: string;
  reactionName: string;
  count: number;
  serious: boolean;
  outcome: string;
}

export interface DailyMedDrugInfo {
  setId: string;
  title: string;
  splVersion: number;
  publishedDate: string;
  sections: {
    name: string;
    text: string;
  }[];
}

export interface ScrapedDrugData {
  source: string;
  timestamp: Date;
  drugName: string;
  data: OpenFDADrugLabel | RxNormDrug | RxNormInteraction[] | DrugAdverseEvent[] | DailyMedDrugInfo;
}

// ===================== RATE LIMITER =====================

class RateLimiter {
  private readonly queue: Array<() => void> = [];
  private activeRequests = 0;
  private readonly maxConcurrent: number;
  private readonly minDelay: number;
  private lastRequestTime = 0;

  constructor(maxConcurrent = 3, minDelayMs = 200) {
    this.maxConcurrent = maxConcurrent;
    this.minDelay = minDelayMs;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const run = async () => {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minDelay) {
          await new Promise(r => setTimeout(r, this.minDelay - timeSinceLastRequest));
        }

        this.activeRequests++;
        this.lastRequestTime = Date.now();

        try {
          const result = await fn();
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          this.activeRequests--;
          this.processQueue();
        }
      };

      if (this.activeRequests < this.maxConcurrent) {
        run();
      } else {
        this.queue.push(run);
      }
    });
  }

  private processQueue(): void {
    if (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

// ===================== HTTP HELPER =====================

function fetchJSON(url: string, timeoutMs = 15000): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout: timeoutMs }, (res) => {
      let data = '';

      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        fetchJSON(res.headers.location, timeoutMs).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
        reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        return;
      }

      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error(`Invalid JSON response from ${url}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

// ===================== OPENFDA SERVICE =====================

const openFDALimiter = new RateLimiter(2, 500); // OpenFDA: max 240 req/min

export class OpenFDAService {
  private readonly baseUrl = 'https://api.fda.gov';

  /**
   * Search for drug labels by name
   */
  async searchDrugLabels(drugName: string, limit = 5): Promise<OpenFDADrugLabel[]> {
    return openFDALimiter.execute(async () => {
      const encodedName = encodeURIComponent(drugName);
      const url = `${this.baseUrl}/drug/label.json?search=openfda.generic_name:"${encodedName}"+openfda.brand_name:"${encodedName}"&limit=${limit}`;

      try {
        const response = await fetchJSON(url) as { results?: Array<Record<string, unknown>> };
        if (!response.results) return [];

        return response.results.map((result: Record<string, unknown>) => this.parseDrugLabel(result));
      } catch (error) {
        logger.warn('OpenFDA label search failed', { drugName, error: (error as Error).message });
        return [];
      }
    });
  }

  /**
   * Get adverse event reports for a drug
   */
  async getAdverseEvents(drugName: string, limit = 20): Promise<DrugAdverseEvent[]> {
    return openFDALimiter.execute(async () => {
      const encodedName = encodeURIComponent(drugName);
      const url = `${this.baseUrl}/drug/event.json?search=patient.drug.medicinalproduct:"${encodedName}"&count=patient.reaction.reactionmeddrapt.exact&limit=${limit}`;

      try {
        const response = await fetchJSON(url) as { results?: Array<{ term: string; count: number }> };
        if (!response.results) return [];

        return response.results.map(r => ({
          drugName,
          reactionName: r.term,
          count: r.count,
          serious: false,
          outcome: 'reported',
        }));
      } catch (error) {
        logger.warn('OpenFDA adverse events failed', { drugName, error: (error as Error).message });
        return [];
      }
    });
  }

  /**
   * Get drug recall information
   */
  async getDrugRecalls(drugName: string, limit = 5): Promise<Array<{
    recallNumber: string;
    reason: string;
    status: string;
    classification: string;
    recallingFirm: string;
    reportDate: string;
  }>> {
    return openFDALimiter.execute(async () => {
      const encodedName = encodeURIComponent(drugName);
      const url = `${this.baseUrl}/drug/enforcement.json?search=openfda.generic_name:"${encodedName}"&limit=${limit}`;

      try {
        const response = await fetchJSON(url) as { results?: Array<Record<string, string>> };
        if (!response.results) return [];

        return response.results.map(r => ({
          recallNumber: r.recall_number || '',
          reason: r.reason_for_recall || '',
          status: r.status || '',
          classification: r.classification || '',
          recallingFirm: r.recalling_firm || '',
          reportDate: r.report_date || '',
        }));
      } catch (error) {
        logger.warn('OpenFDA recalls failed', { drugName, error: (error as Error).message });
        return [];
      }
    });
  }

  private parseDrugLabel(result: Record<string, unknown>): OpenFDADrugLabel {
    const openfda = (result.openfda || {}) as Record<string, string[]>;

    return {
      brandName: openfda.brand_name?.[0] || '',
      genericName: openfda.generic_name?.[0] || '',
      manufacturer: openfda.manufacturer_name?.[0] || '',
      route: openfda.route || [],
      dosageForm: openfda.dosage_form?.[0] || '',
      activeIngredients: openfda.substance_name || [],
      warnings: this.extractArrayField(result, 'warnings'),
      contraindications: this.extractArrayField(result, 'contraindications'),
      drugInteractions: this.extractArrayField(result, 'drug_interactions'),
      adverseReactions: this.extractArrayField(result, 'adverse_reactions'),
      boxedWarning: this.extractStringField(result, 'boxed_warning'),
      pregnancyCategory: openfda.pregnancy_category?.[0],
      indicationsAndUsage: this.extractArrayField(result, 'indications_and_usage'),
    };
  }

  private extractArrayField(result: Record<string, unknown>, field: string): string[] {
    const value = result[field];
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === 'string') return [value];
    return [];
  }

  private extractStringField(result: Record<string, unknown>, field: string): string | undefined {
    const value = result[field];
    if (Array.isArray(value)) return value[0] as string;
    if (typeof value === 'string') return value;
    return undefined;
  }
}

// ===================== RXNORM SERVICE =====================

const rxNormLimiter = new RateLimiter(3, 300); // RxNorm: 20 req/sec max

export class RxNormService {
  private readonly baseUrl = 'https://rxnav.nlm.nih.gov/REST';
  private readonly interactionUrl = 'https://rxnav.nlm.nih.gov/REST/interaction';

  /**
   * Search for a drug by name and get its RxCUI 
   */
  async findDrugByName(drugName: string): Promise<RxNormDrug[]> {
    return rxNormLimiter.execute(async () => {
      const encodedName = encodeURIComponent(drugName);
      const url = `${this.baseUrl}/drugs.json?name=${encodedName}`;

      try {
        const response = await fetchJSON(url) as { drugGroup?: { conceptGroup?: Array<{ conceptProperties?: Array<{ rxcui: string; name: string; synonym: string; tty: string }> }> } };
        const groups = response.drugGroup?.conceptGroup || [];
        const drugs: RxNormDrug[] = [];

        for (const group of groups) {
          if (group.conceptProperties) {
            for (const prop of group.conceptProperties) {
              drugs.push({
                rxcui: prop.rxcui,
                name: prop.name,
                synonym: prop.synonym ? [prop.synonym] : [],
                tty: prop.tty,
              });
            }
          }
        }

        return drugs;
      } catch (error) {
        logger.warn('RxNorm search failed', { drugName, error: (error as Error).message });
        return [];
      }
    });
  }

  /**
   * Get RxCUI for a drug name (returns first match)
   */
  async getRxCUI(drugName: string): Promise<string | null> {
    return rxNormLimiter.execute(async () => {
      const encodedName = encodeURIComponent(drugName);
      const url = `${this.baseUrl}/rxcui.json?name=${encodedName}&search=1`;

      try {
        const response = await fetchJSON(url) as { idGroup?: { rxnormId?: string[] } };
        const ids = response.idGroup?.rxnormId;
        return ids && ids.length > 0 ? ids[0] : null;
      } catch (error) {
        logger.warn('RxNorm RxCUI lookup failed', { drugName, error: (error as Error).message });
        return null;
      }
    });
  }

  /**
   * Check drug-drug interactions by RxCUI
   */
  async checkInteractions(rxcui: string): Promise<RxNormInteraction[]> {
    return rxNormLimiter.execute(async () => {
      const url = `${this.interactionUrl}/interaction.json?rxcui=${rxcui}&sources=DrugBank`;

      try {
        const response = await fetchJSON(url) as { interactionTypeGroup?: Array<{ interactionType?: Array<{ interactionPair?: Array<{ interactionConcept: Array<{ minConceptItem: { rxcui: string; name: string } }>; severity: string; description: string }> }> }> };
        const interactions: RxNormInteraction[] = [];

        const groups = response.interactionTypeGroup || [];
        for (const group of groups) {
          const types = group.interactionType || [];
          for (const type of types) {
            const pairs = type.interactionPair || [];
            for (const pair of pairs) {
              if (pair.interactionConcept?.length >= 2) {
                interactions.push({
                  drug1: {
                    rxcui: pair.interactionConcept[0].minConceptItem.rxcui,
                    name: pair.interactionConcept[0].minConceptItem.name,
                  },
                  drug2: {
                    rxcui: pair.interactionConcept[1].minConceptItem.rxcui,
                    name: pair.interactionConcept[1].minConceptItem.name,
                  },
                  severity: pair.severity || 'unknown',
                  description: pair.description || '',
                  source: 'DrugBank via RxNorm',
                });
              }
            }
          }
        }

        return interactions;
      } catch (error) {
        logger.warn('RxNorm interaction check failed', { rxcui, error: (error as Error).message });
        return [];
      }
    });
  }

  /**
   * Check interactions between a list of drugs by RxCUI
   */
  async checkMultiDrugInteractions(rxcuis: string[]): Promise<RxNormInteraction[]> {
    if (rxcuis.length < 2) return [];

    return rxNormLimiter.execute(async () => {
      const url = `${this.interactionUrl}/list.json?rxcuis=${rxcuis.join('+')}`;

      try {
        const response = await fetchJSON(url) as { fullInteractionTypeGroup?: Array<{ fullInteractionType?: Array<{ interactionPair?: Array<{ interactionConcept: Array<{ minConceptItem: { rxcui: string; name: string } }>; severity: string; description: string }> }> }> };
        const interactions: RxNormInteraction[] = [];

        const groups = response.fullInteractionTypeGroup || [];
        for (const group of groups) {
          const types = group.fullInteractionType || [];
          for (const type of types) {
            const pairs = type.interactionPair || [];
            for (const pair of pairs) {
              if (pair.interactionConcept?.length >= 2) {
                interactions.push({
                  drug1: {
                    rxcui: pair.interactionConcept[0].minConceptItem.rxcui,
                    name: pair.interactionConcept[0].minConceptItem.name,
                  },
                  drug2: {
                    rxcui: pair.interactionConcept[1].minConceptItem.rxcui,
                    name: pair.interactionConcept[1].minConceptItem.name,
                  },
                  severity: pair.severity || 'unknown',
                  description: pair.description || '',
                  source: 'RxNorm Interactions API',
                });
              }
            }
          }
        }

        return interactions;
      } catch (error) {
        logger.warn('RxNorm multi-drug interaction check failed', { error: (error as Error).message });
        return [];
      }
    });
  }

  /**
   * Get drug class information
   */
  async getDrugClasses(rxcui: string): Promise<Array<{ className: string; classId: string; classType: string }>> {
    return rxNormLimiter.execute(async () => {
      const url = `${this.baseUrl}/rxclass/class/byRxcui.json?rxcui=${rxcui}`;

      try {
        const response = await fetchJSON(url) as { rxclassDrugInfoList?: { rxclassDrugInfo?: Array<{ rxclassMinConceptItem: { className: string; classId: string; classType: string } }> } };
        const infos = response.rxclassDrugInfoList?.rxclassDrugInfo || [];

        return infos.map(info => ({
          className: info.rxclassMinConceptItem.className,
          classId: info.rxclassMinConceptItem.classId,
          classType: info.rxclassMinConceptItem.classType,
        }));
      } catch (error) {
        logger.warn('RxNorm drug class lookup failed', { rxcui, error: (error as Error).message });
        return [];
      }
    });
  }

  /**
   * Get related drugs (same ingredient, different forms/strengths)
   */
  async getRelatedDrugs(rxcui: string): Promise<RxNormDrug[]> {
    return rxNormLimiter.execute(async () => {
      const url = `${this.baseUrl}/rxcui/${rxcui}/related.json?tty=SBD+SCD`;

      try {
        const response = await fetchJSON(url) as { relatedGroup?: { conceptGroup?: Array<{ conceptProperties?: Array<{ rxcui: string; name: string; synonym: string; tty: string }> }> } };
        const groups = response.relatedGroup?.conceptGroup || [];
        const drugs: RxNormDrug[] = [];

        for (const group of groups) {
          if (group.conceptProperties) {
            for (const prop of group.conceptProperties) {
              drugs.push({
                rxcui: prop.rxcui,
                name: prop.name,
                synonym: prop.synonym ? [prop.synonym] : [],
                tty: prop.tty,
              });
            }
          }
        }

        return drugs;
      } catch (error) {
        logger.warn('RxNorm related drugs failed', { rxcui, error: (error as Error).message });
        return [];
      }
    });
  }
}

// ===================== DAILYMED SERVICE =====================

const dailyMedLimiter = new RateLimiter(2, 500);

export class DailyMedService {
  private readonly baseUrl = 'https://dailymed.nlm.nih.gov/dailymed/services/v2';

  /**
   * Search for drug information by name
   */
  async searchDrug(drugName: string, limit = 5): Promise<Array<{ setId: string; title: string; publishedDate: string }>> {
    return dailyMedLimiter.execute(async () => {
      const encodedName = encodeURIComponent(drugName);
      const url = `${this.baseUrl}/spls.json?drug_name=${encodedName}&page=1&pagesize=${limit}`;

      try {
        const response = await fetchJSON(url) as { data?: Array<{ setid: string; title: string; published_date: string }> };
        if (!response.data) return [];

        return response.data.map(d => ({
          setId: d.setid,
          title: d.title,
          publishedDate: d.published_date,
        }));
      } catch (error) {
        logger.warn('DailyMed search failed', { drugName, error: (error as Error).message });
        return [];
      }
    });
  }

  /**
   * Get detailed drug label by setId 
   */
  async getDrugLabel(setId: string): Promise<DailyMedDrugInfo | null> {
    return dailyMedLimiter.execute(async () => {
      const url = `${this.baseUrl}/spls/${setId}.json`;

      try {
        const response = await fetchJSON(url) as { data?: { setid: string; title: string; spl_version: number; published_date: string } };
        if (!response.data) return null;

        return {
          setId: response.data.setid,
          title: response.data.title,
          splVersion: response.data.spl_version,
          publishedDate: response.data.published_date,
          sections: [],
        };
      } catch (error) {
        logger.warn('DailyMed label failed', { setId, error: (error as Error).message });
        return null;
      }
    });
  }
}

// ===================== UNIFIED SCRAPER =====================

export interface DrugLookupResult {
  drugName: string;
  rxcui: string | null;
  fdaLabel: OpenFDADrugLabel | null;
  interactions: RxNormInteraction[];
  adverseEvents: DrugAdverseEvent[];
  drugClasses: Array<{ className: string; classId: string; classType: string }>;
  dailyMedInfo: { setId: string; title: string; publishedDate: string } | null;
  scrapedAt: Date;
  sources: string[];
}

export class MedicalDataScraper {
  private readonly openFDA = new OpenFDAService();
  private readonly rxNorm = new RxNormService();
  private readonly dailyMed = new DailyMedService();
  private readonly cache = new Map<string, { data: DrugLookupResult; timestamp: number }>();
  private readonly cacheTTL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Comprehensive drug lookup across all data sources
   */
  async lookupDrug(drugName: string, useCache = true): Promise<DrugLookupResult> {
    const cacheKey = drugName.toLowerCase().trim();

    // Check cache
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      }
    }

    const sources: string[] = [];
    const result: DrugLookupResult = {
      drugName,
      rxcui: null,
      fdaLabel: null,
      interactions: [],
      adverseEvents: [],
      drugClasses: [],
      dailyMedInfo: null,
      scrapedAt: new Date(),
      sources: [],
    };

    // Step 1: Get RxCUI (needed for interaction checking)
    try {
      result.rxcui = await this.rxNorm.getRxCUI(drugName);
      if (result.rxcui) sources.push('RxNorm');
    } catch { /* continue without RxCUI */ }

    // Step 2: Parallel fetch from all sources
    const promises: Promise<void>[] = [];

    // OpenFDA label + adverse events + DailyMed
    promises.push(
      this.openFDA.searchDrugLabels(drugName, 1).then(labels => {
        if (labels.length > 0) {
          result.fdaLabel = labels[0];
          sources.push('OpenFDA');
        }
      }).catch(() => { /* non-fatal */ }),
      this.openFDA.getAdverseEvents(drugName, 10).then(events => {
        result.adverseEvents = events;
        if (events.length > 0) sources.push('OpenFDA Adverse Events');
      }).catch(() => { /* non-fatal */ }),
      this.dailyMed.searchDrug(drugName, 1).then(results => {
        if (results.length > 0) {
          result.dailyMedInfo = results[0];
          sources.push('DailyMed');
        }
      }).catch(() => { /* non-fatal */ })
    );

    // RxNorm interactions (if RxCUI available)
    if (result.rxcui) {
      promises.push(
        this.rxNorm.checkInteractions(result.rxcui).then(interactions => {
          result.interactions = interactions;
          if (interactions.length > 0) sources.push('RxNorm Interactions');
        }).catch(() => { /* non-fatal */ }),
        this.rxNorm.getDrugClasses(result.rxcui).then(classes => {
          result.drugClasses = classes;
          if (classes.length > 0) sources.push('RxNorm Drug Classes');
        }).catch(() => { /* non-fatal */ })
      );
    }

    await Promise.allSettled(promises);
    result.sources = sources;

    // Cache the result
    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return result;
  }

  /**
   * Check interactions between multiple drugs using RxNorm
   */
  async checkMultiDrugInteractions(drugNames: string[]): Promise<{
    interactions: RxNormInteraction[];
    unresolvedDrugs: string[];
  }> {
    const rxcuis: string[] = [];
    const unresolvedDrugs: string[] = [];

    // Resolve all drug names to RxCUIs
    for (const name of drugNames) {
      const rxcui = await this.rxNorm.getRxCUI(name);
      if (rxcui) {
        rxcuis.push(rxcui);
      } else {
        unresolvedDrugs.push(name);
      }
    }

    // Check interactions between resolved drugs
    let interactions: RxNormInteraction[] = [];
    if (rxcuis.length >= 2) {
      interactions = await this.rxNorm.checkMultiDrugInteractions(rxcuis);
    }

    return { interactions, unresolvedDrugs };
  }

  /**
   * Batch lookup for multiple drugs (rate-limited)
   */
  async batchLookup(drugNames: string[]): Promise<Map<string, DrugLookupResult>> {
    const results = new Map<string, DrugLookupResult>();

    for (const name of drugNames) {
      try {
        const result = await this.lookupDrug(name);
        results.set(name, result);
      } catch (error) {
        logger.warn('Batch lookup failed', { name, error: (error as Error).message });
      }
    }

    return results;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; oldestEntry: Date | null } {
    let oldest = Infinity;
    for (const entry of this.cache.values()) {
      if (entry.timestamp < oldest) oldest = entry.timestamp;
    }
    return {
      size: this.cache.size,
      oldestEntry: oldest === Infinity ? null : new Date(oldest),
    };
  }
}

// Singleton instance
let scraperInstance: MedicalDataScraper | null = null;

export function getMedicalDataScraper(): MedicalDataScraper {
  scraperInstance ??= new MedicalDataScraper();
  return scraperInstance;
}
