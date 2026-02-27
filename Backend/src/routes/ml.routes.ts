import { Router } from 'express';
import {
  getAdaptiveTrainingData,
  getAdaptiveLearningStats,
  ingestAdaptiveSample,
} from '../controllers/ml.controller';

const router = Router();

router.get('/training-data', getAdaptiveTrainingData);
router.get('/stats', getAdaptiveLearningStats);
router.post('/feedback', ingestAdaptiveSample);

export default router;
