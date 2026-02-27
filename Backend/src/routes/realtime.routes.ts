import { Router } from 'express';
import { getRealtimeSources, streamRealtimeTelemetry } from '../controllers/realtime.controller';

const router = Router();

router.get('/sources', getRealtimeSources);
router.get('/stream', streamRealtimeTelemetry);

export default router;
