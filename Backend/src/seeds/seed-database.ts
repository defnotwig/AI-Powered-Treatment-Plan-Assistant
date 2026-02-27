import { DrugInteraction, Contraindication, DosageGuideline } from '../models';
import { testConnection, syncDatabase } from '../config/database';
import logger from '../config/logger';
import {
  COMPREHENSIVE_DRUG_INTERACTIONS,
  COMPREHENSIVE_CONTRAINDICATIONS,
  COMPREHENSIVE_DOSAGE_GUIDELINES,
} from '../data/medical-knowledge-base';

/**
 * Transform comprehensive knowledge base entries for Sequelize models.
 * Maps the rich typed data to the simpler model format used by Sequelize.
 */

const drugInteractions = COMPREHENSIVE_DRUG_INTERACTIONS.map(entry => ({
  drug1: entry.drug1,
  drug2: entry.drug2,
  severity: entry.severity,
  effect: entry.effect,
  mechanism: entry.mechanism,
  management: entry.management,
  evidence: entry.evidence === 'suspected' ? 'probable' : entry.evidence,
}));

const contraindications = COMPREHENSIVE_CONTRAINDICATIONS.map(entry => ({
  drug: entry.drug,
  condition: entry.condition,
  type: entry.type === 'pregnancy' ? 'absolute' as const : entry.type,
  reason: entry.reason,
  alternatives: entry.alternatives,
}));

const dosageGuidelines = COMPREHENSIVE_DOSAGE_GUIDELINES.map(entry => ({
  drug: entry.drug,
  indication: entry.indication,
  standardDose: entry.standardDose,
  maxDose: entry.maxDose,
  renalAdjustment: entry.renalAdjustment,
  hepaticAdjustment: entry.hepaticAdjustment,
  geriatricAdjustment: entry.geriatricAdjustment,
}));

// Seed function
export const seedDatabase = async (): Promise<void> => {
  try {
    logger.info('Starting database seeding');
    
    // Connect and sync
    await testConnection();
    await syncDatabase(true); // Force sync to reset tables
    
    // Seed drug interactions
    logger.info('Seeding drug interactions');
    await DrugInteraction.bulkCreate(drugInteractions);
    logger.info('Created drug interactions', { count: drugInteractions.length });
    
    // Seed contraindications
    logger.info('Seeding contraindications');
    await Contraindication.bulkCreate(contraindications);
    logger.info('Created contraindications', { count: contraindications.length });
    
    // Seed dosage guidelines
    logger.info('Seeding dosage guidelines');
    await DosageGuideline.bulkCreate(dosageGuidelines);
    logger.info('Created dosage guidelines', { count: dosageGuidelines.length });
    
    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Database seeding failed', { error: (error as Error).message });
    throw error;
  }
};

// Run if executed directly
async function main() {
  try {
    await seedDatabase();
    process.exit(0);
  } catch {
    process.exit(1);
  }
}

if (require.main === module) {
  void main(); // NOSONAR — top-level await is unavailable in CommonJS module target
}
