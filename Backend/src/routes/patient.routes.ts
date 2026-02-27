import { Router } from 'express';
import {
  createPatient,
  getPatient,
  getAllPatients,
  deletePatient,
  searchPatients,
  getPatientStatistics,
  getComprehensiveAnalytics,
} from '../controllers/patient.controller';
import { cacheResponse } from '../middleware/cache.middleware';

const router = Router();

// Statistics route (must be before /:id to avoid conflict)
router.get('/statistics', cacheResponse({ ttlMs: 15000, tags: ['patients', 'analytics'] }), getPatientStatistics);

// Comprehensive analytics for dashboard
router.get('/analytics', cacheResponse({ ttlMs: 10000, tags: ['patients', 'analytics'] }), getComprehensiveAnalytics);

// Search route
router.get('/search', cacheResponse({ ttlMs: 10000, tags: ['patients'] }), searchPatients);

// Patient routes
router.post('/', createPatient);
router.get('/', cacheResponse({ ttlMs: 15000, tags: ['patients'] }), getAllPatients);
router.get('/:id', cacheResponse({ ttlMs: 10000, tags: ['patients'] }), getPatient);
router.delete('/:id', deletePatient);

export default router;
