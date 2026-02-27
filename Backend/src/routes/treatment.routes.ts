import { Router } from 'express';
import {
  analyzePatient,
  analyzeNewPatient,
  getTreatmentPlan,
  getPatientTreatmentPlans,
  approveTreatmentPlan,
  modifyTreatmentPlan,
  rejectTreatmentPlan,
} from '../controllers/treatment.controller';
import { cacheResponse } from '../middleware/cache.middleware';

const router = Router();

// Treatment plan routes
router.post('/analyze', analyzeNewPatient); // For new patient intake
router.post('/analyze/:patientId', analyzePatient); // For existing patient
router.get('/:id', cacheResponse({ ttlMs: 10000, tags: ['treatment-plans', 'analytics', 'patients'] }), getTreatmentPlan);
router.get('/patient/:patientId', cacheResponse({ ttlMs: 10000, tags: ['treatment-plans', 'analytics', 'patients'] }), getPatientTreatmentPlans);
router.post('/:patientId/approve', approveTreatmentPlan);
router.post('/:patientId/modify', modifyTreatmentPlan);
router.post('/:patientId/reject', rejectTreatmentPlan);

export default router;
