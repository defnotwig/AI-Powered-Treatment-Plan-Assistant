import { Router } from 'express';
import {
  getDrugInteractions,
  checkDrugInteraction,
  getContraindications,
  getDosageGuidelines,
  createDrugInteraction,
  createContraindication,
  createDosageGuideline,
  lookupDrug,
  checkMultiDrugInteractions,
  checkAllergyCrossReactivity,
  getKnowledgeBaseStats,
} from '../controllers/drug-database.controller';
import { cacheResponse } from '../middleware/cache.middleware';

const router = Router();

// Knowledge base stats
router.get('/stats', cacheResponse({ ttlMs: 30000, tags: ['drug-db'] }), getKnowledgeBaseStats);

// Drug database routes
router.get('/interactions', cacheResponse({ ttlMs: 30000, tags: ['drug-db'] }), getDrugInteractions);
router.get('/interactions/check', cacheResponse({ ttlMs: 30000, tags: ['drug-db'] }), checkDrugInteraction);
router.post('/interactions', createDrugInteraction);
router.post('/interactions/multi-check', checkMultiDrugInteractions);

router.get('/contraindications', cacheResponse({ ttlMs: 30000, tags: ['drug-db'] }), getContraindications);
router.post('/contraindications', createContraindication);

router.get('/dosage-guidelines', cacheResponse({ ttlMs: 30000, tags: ['drug-db'] }), getDosageGuidelines);
router.post('/dosage-guidelines', createDosageGuideline);

// Real-time drug lookup (OpenFDA/RxNorm/DailyMed)
router.get('/lookup/:drugName', cacheResponse({ ttlMs: 120000, tags: ['drug-db', 'drug-lookup'] }), lookupDrug);

// Allergy cross-reactivity
router.get('/allergy-cross-reactivity', cacheResponse({ ttlMs: 60000, tags: ['drug-db'] }), checkAllergyCrossReactivity);

export default router;
