import { Request, Response } from 'express';
import logger from '../config/logger';
import { DrugInteraction, Contraindication, DosageGuideline } from '../models';
import { config } from '../config';
import {
  COMPREHENSIVE_DRUG_INTERACTIONS,
  COMPREHENSIVE_CONTRAINDICATIONS,
  COMPREHENSIVE_DOSAGE_GUIDELINES,
  ALLERGY_CROSS_REACTIVITY,
  MEDICAL_KNOWLEDGE_BASE,
} from '../data/medical-knowledge-base';
import { MedicalDataScraper } from '../services/medical-data-scraper.service';
import { invalidateCacheTags } from '../middleware/cache.middleware';

// Initialize the medical data scraper for real-time lookups
const medicalScraper = new MedicalDataScraper();

// Get all drug interactions
export const getDrugInteractions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { drug, severity } = req.query;
    
    // Demo mode - use comprehensive knowledge base
    if (config.demoMode) {
      let filteredInteractions = [...COMPREHENSIVE_DRUG_INTERACTIONS];
      if (drug) {
        const drugLower = (drug as string).toLowerCase();
        filteredInteractions = filteredInteractions.filter(i => 
          i.drug1.toLowerCase().includes(drugLower) || i.drug2.toLowerCase().includes(drugLower)
        );
      }
      if (severity) {
        filteredInteractions = filteredInteractions.filter(i => i.severity === severity);
      }
      res.json({ success: true, data: filteredInteractions, total: filteredInteractions.length, demoMode: true });
      return;
    }
    
    const where: Record<string, unknown> = {};
    
    if (drug) {
      where.drug1 = drug;
    }
    
    if (severity) {
      where.severity = severity;
    }
    
    const interactions = await DrugInteraction.findAll({
      where: Object.keys(where).length > 0 ? where : undefined,
      order: [['severity', 'ASC'], ['drug1', 'ASC']],
    });

    res.json({
      success: true,
      data: interactions,
    });
  } catch (error) {
    logger.error('Get drug interactions error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get drug interactions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Check specific drug interaction
export const checkDrugInteraction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { drug1, drug2 } = req.query;
    
    if (!drug1 || !drug2) {
      res.status(400).json({
        success: false,
        message: 'Both drug1 and drug2 are required',
      });
      return;
    }
    
    // Demo mode - use comprehensive knowledge base
    if (config.demoMode) {
      const d1 = (drug1 as string).toLowerCase();
      const d2 = (drug2 as string).toLowerCase();
      const interaction = MEDICAL_KNOWLEDGE_BASE.checkDrugPair(d1, d2);
      res.json({
        success: true,
        data: { hasInteraction: !!interaction, interaction: interaction || null },
        demoMode: true,
      });
      return;
    }
    
    const interaction = await DrugInteraction.findOne({
      where: {
        drug1: (drug1 as string).toLowerCase(),
        drug2: (drug2 as string).toLowerCase(),
      },
    });
    
    // Also check reverse order
    const reverseInteraction = interaction || await DrugInteraction.findOne({
      where: {
        drug1: (drug2 as string).toLowerCase(),
        drug2: (drug1 as string).toLowerCase(),
      },
    });

    res.json({
      success: true,
      data: {
        hasInteraction: !!reverseInteraction,
        interaction: reverseInteraction,
      },
    });
  } catch (error) {
    logger.error('Check drug interaction error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to check drug interaction',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get all contraindications
export const getContraindications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { drug, condition, type } = req.query;
    
    // Demo mode - use comprehensive knowledge base
    if (config.demoMode) {
      let filtered = [...COMPREHENSIVE_CONTRAINDICATIONS];
      if (drug) {
        const drugLower = (drug as string).toLowerCase();
        filtered = filtered.filter(c => c.drug.toLowerCase().includes(drugLower));
      }
      if (condition) {
        const condLower = (condition as string).toLowerCase();
        filtered = filtered.filter(c => c.condition.toLowerCase().includes(condLower));
      }
      if (type) {
        filtered = filtered.filter(c => c.type === type);
      }
      res.json({ success: true, data: filtered, total: filtered.length, demoMode: true });
      return;
    }
    
    const where: Record<string, unknown> = {};
    
    if (drug) {
      where.drug = drug;
    }
    
    if (condition) {
      where.condition = condition;
    }
    
    if (type) {
      where.type = type;
    }
    
    const contraindications = await Contraindication.findAll({
      where: Object.keys(where).length > 0 ? where : undefined,
      order: [['type', 'ASC'], ['drug', 'ASC']],
    });

    res.json({
      success: true,
      data: contraindications,
    });
  } catch (error) {
    logger.error('Get contraindications error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get contraindications',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get all dosage guidelines
export const getDosageGuidelines = async (req: Request, res: Response): Promise<void> => {
  try {
    const { drug, indication } = req.query;
    
    // Demo mode - use comprehensive knowledge base
    if (config.demoMode) {
      let filtered = [...COMPREHENSIVE_DOSAGE_GUIDELINES];
      if (drug) {
        const drugLower = (drug as string).toLowerCase();
        filtered = filtered.filter(g => g.drug.toLowerCase().includes(drugLower));
      }
      if (indication) {
        const indLower = (indication as string).toLowerCase();
        filtered = filtered.filter(g => g.indication.toLowerCase().includes(indLower));
      }
      res.json({ success: true, data: filtered, total: filtered.length, demoMode: true });
      return;
    }
    
    const where: Record<string, unknown> = {};
    
    if (drug) {
      where.drug = drug;
    }
    
    if (indication) {
      where.indication = indication;
    }
    
    const guidelines = await DosageGuideline.findAll({
      where: Object.keys(where).length > 0 ? where : undefined,
      order: [['drug', 'ASC']],
    });

    res.json({
      success: true,
      data: guidelines,
    });
  } catch (error) {
    logger.error('Get dosage guidelines error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get dosage guidelines',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Create drug interaction
export const createDrugInteraction = async (req: Request, res: Response): Promise<void> => {
  try {
    const interaction = await DrugInteraction.create(req.body);
    invalidateCacheTags(['drug-db', 'drug-lookup']);

    res.status(201).json({
      success: true,
      message: 'Drug interaction created',
      data: interaction,
    });
  } catch (error) {
    logger.error('Create drug interaction error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to create drug interaction',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Create contraindication
export const createContraindication = async (req: Request, res: Response): Promise<void> => {
  try {
    const contraindication = await Contraindication.create(req.body);
    invalidateCacheTags(['drug-db', 'drug-lookup']);

    res.status(201).json({
      success: true,
      message: 'Contraindication created',
      data: contraindication,
    });
  } catch (error) {
    logger.error('Create contraindication error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to create contraindication',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Create dosage guideline
export const createDosageGuideline = async (req: Request, res: Response): Promise<void> => {
  try {
    const guideline = await DosageGuideline.create(req.body);
    invalidateCacheTags(['drug-db', 'drug-lookup']);

    res.status(201).json({
      success: true,
      message: 'Dosage guideline created',
      data: guideline,
    });
  } catch (error) {
    logger.error('Create dosage guideline error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to create dosage guideline',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ===== NEW ENDPOINTS =====

/**
 * Real-time drug lookup via OpenFDA/RxNorm/DailyMed APIs
 * GET /api/drug-database/lookup/:drugName
 */
export const lookupDrug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { drugName } = req.params;
    if (!drugName) {
      res.status(400).json({ success: false, message: 'Drug name is required' });
      return;
    }

    const result = await medicalScraper.lookupDrug(drugName);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Drug lookup error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to look up drug',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Check multi-drug interactions via RxNorm API
 * POST /api/drug-database/interactions/multi-check
 * Body: { drugs: string[] }
 */
export const checkMultiDrugInteractions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { drugs } = req.body;
    if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
      res.status(400).json({ success: false, message: 'At least 2 drugs required in array' });
      return;
    }

    // Check local knowledge base first
    const localResults: Array<{ drug1: string; drug2: string; interaction: unknown }> = [];
    for (let i = 0; i < drugs.length; i++) {
      for (let j = i + 1; j < drugs.length; j++) {
        const found = MEDICAL_KNOWLEDGE_BASE.checkDrugPair(drugs[i], drugs[j]);
        if (found) {
          localResults.push({ drug1: drugs[i], drug2: drugs[j], interaction: found });
        }
      }
    }

    // Also check via external API
    let externalResults;
    try {
      externalResults = await medicalScraper.checkMultiDrugInteractions(drugs);
    } catch {
      externalResults = null;
    }

    res.json({
      success: true,
      data: {
        localInteractions: localResults,
        externalInteractions: externalResults,
        totalLocalFound: localResults.length,
        drugsChecked: drugs,
      },
    });
  } catch (error) {
    logger.error('Multi-drug interaction check error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to check multi-drug interactions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Check allergy cross-reactivity
 * GET /api/drug-database/allergy-cross-reactivity?allergen=penicillin
 */
export const checkAllergyCrossReactivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { allergen } = req.query;
    if (!allergen) {
      res.status(400).json({ success: false, message: 'Allergen query parameter is required' });
      return;
    }

    const groups = MEDICAL_KNOWLEDGE_BASE.checkCrossReactivity(allergen as string);
    res.json({
      success: true,
      data: {
        allergen,
        crossReactivityGroups: groups,
        totalGroups: groups.length,
        allGroups: ALLERGY_CROSS_REACTIVITY.map(g => g.groupName),
      },
    });
  } catch (error) {
    logger.error('Allergy cross-reactivity check error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to check allergy cross-reactivity',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get knowledge base statistics
 * GET /api/drug-database/stats
 */
export const getKnowledgeBaseStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = MEDICAL_KNOWLEDGE_BASE.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Knowledge base stats error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get knowledge base stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
