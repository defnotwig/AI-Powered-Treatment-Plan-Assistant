import { CompletePatientData } from '../types';
import {
  DrugLookupResult,
  getMedicalDataScraper,
} from './medical-data-scraper.service';

export interface ClinicalContextSnapshot {
  generatedAt: string;
  drugsAnalyzed: string[];
  sources: string[];
  summary: string;
}

interface ClinicalContextOptions {
  maxDrugLookups?: number;
  lookupDrug?: (drugName: string, useCache?: boolean) => Promise<DrugLookupResult>;
}

const DEFAULT_MAX_DRUG_LOOKUPS = 3;

const COMPLAINT_DRUG_HINTS: Array<{ keywords: string[]; drugs: string[] }> = [
  {
    keywords: ['erectile dysfunction', 'ed ', 'impotence'],
    drugs: ['sildenafil', 'tadalafil'],
  },
  {
    keywords: ['chest pain', 'angina'],
    drugs: ['nitroglycerin'],
  },
  {
    keywords: ['hair loss', 'baldness'],
    drugs: ['finasteride', 'minoxidil'],
  },
  {
    keywords: ['diabetes', 'high blood sugar'],
    drugs: ['metformin'],
  },
];

function normalizeDrugName(name: string): string {
  return name.trim().toLowerCase();
}

function truncateText(text: string, maxLength = 180): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

function extractComplaintHints(chiefComplaint: string): string[] {
  const normalizedComplaint = chiefComplaint.toLowerCase();
  const hintedDrugs: string[] = [];

  for (const hint of COMPLAINT_DRUG_HINTS) {
    const hasKeyword = hint.keywords.some(keyword => normalizedComplaint.includes(keyword));
    if (hasKeyword) {
      hintedDrugs.push(...hint.drugs);
    }
  }

  return hintedDrugs;
}

export function extractCandidateDrugNames(patientData: CompletePatientData): string[] {
  const medicationNames = patientData.currentMedications.medications.flatMap(medication => [
    medication.drugName,
    medication.genericName,
  ]);

  const complaint = patientData.lifestyle?.chiefComplaint?.complaint || '';
  const hintedDrugs = complaint ? extractComplaintHints(complaint) : [];

  const uniqueDrugNames = new Set<string>();
  for (const candidate of [...medicationNames, ...hintedDrugs]) {
    const normalized = normalizeDrugName(candidate);
    if (normalized) {
      uniqueDrugNames.add(normalized);
    }
  }

  return Array.from(uniqueDrugNames);
}

function summarizeLookup(result: DrugLookupResult): string[] {
  const lines: string[] = [];
  const heading = result.drugName.toUpperCase();
  lines.push(`${heading}:`);

  const warning = result.fdaLabel?.warnings?.[0];
  if (warning) {
    lines.push(`- FDA warning: ${truncateText(warning)}`);
  }

  const contraindication = result.fdaLabel?.contraindications?.[0];
  if (contraindication) {
    lines.push(`- FDA contraindication: ${truncateText(contraindication)}`);
  }

  const interactionSnippet = result.interactions.slice(0, 2).map(interaction => {
    const pair = `${interaction.drug1.name} + ${interaction.drug2.name}`;
    const severity = interaction.severity || 'unknown';
    return `${pair} [${severity}]`;
  });
  if (interactionSnippet.length > 0) {
    lines.push(`- RxNorm interactions: ${interactionSnippet.join('; ')}`);
  }

  const adverseSnippet = result.adverseEvents.slice(0, 2).map(event => {
    return `${event.reactionName} (${event.count})`;
  });
  if (adverseSnippet.length > 0) {
    lines.push(`- OpenFDA adverse events: ${adverseSnippet.join('; ')}`);
  }

  if (result.drugClasses.length > 0) {
    const topClasses = result.drugClasses
      .slice(0, 2)
      .map(c => c.className)
      .filter(Boolean);
    if (topClasses.length > 0) {
      lines.push(`- Drug classes: ${topClasses.join(', ')}`);
    }
  }

  return lines;
}

export async function buildRealtimeClinicalContext(
  patientData: CompletePatientData,
  options: ClinicalContextOptions = {},
): Promise<ClinicalContextSnapshot> {
  const maxDrugLookups = options.maxDrugLookups ?? DEFAULT_MAX_DRUG_LOOKUPS;
  const lookupDrug = options.lookupDrug
    ?? ((drugName: string, useCache = true) => getMedicalDataScraper().lookupDrug(drugName, useCache));

  const candidateDrugNames = extractCandidateDrugNames(patientData).slice(0, maxDrugLookups);

  if (candidateDrugNames.length === 0) {
    return {
      generatedAt: new Date().toISOString(),
      drugsAnalyzed: [],
      sources: [],
      summary: 'No candidate medications available for real-time clinical evidence lookup.',
    };
  }

  const lookupResults = await Promise.allSettled(
    candidateDrugNames.map(drug => lookupDrug(drug, true)),
  );

  const sources = new Set<string>();
  const summaryLines: string[] = [];
  const resolvedDrugs: string[] = [];

  for (let i = 0; i < lookupResults.length; i++) {
    const result = lookupResults[i];
    const requestedDrug = candidateDrugNames[i];

    if (result.status !== 'fulfilled') {
      summaryLines.push(`${requestedDrug.toUpperCase()}: live evidence lookup failed.`);
      continue;
    }

    resolvedDrugs.push(requestedDrug);
    result.value.sources.forEach(source => sources.add(source));
    summaryLines.push(...summarizeLookup(result.value));
  }

  return {
    generatedAt: new Date().toISOString(),
    drugsAnalyzed: resolvedDrugs,
    sources: Array.from(sources),
    summary: summaryLines.join('\n'),
  };
}
