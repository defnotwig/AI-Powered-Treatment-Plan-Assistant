import { Request, Response } from 'express';
import { config } from '../config';
import { demoStorage } from '../services/demo-storage.service';
import { getMedicalDataScraper } from '../services/medical-data-scraper.service';
import { adaptiveLearningService } from '../services/adaptive-learning.service';
import { responseCache } from '../services/response-cache.service';
import { Patient, TreatmentPlan } from '../models';

const LIVE_SOURCES = [
  { name: 'OpenFDA Drug Labels', url: 'https://api.fda.gov/drug/label.json', provider: 'U.S. FDA' },
  { name: 'OpenFDA Adverse Events', url: 'https://api.fda.gov/drug/event.json', provider: 'U.S. FDA' },
  { name: 'RxNorm', url: 'https://rxnav.nlm.nih.gov/REST/', provider: 'U.S. National Library of Medicine' },
  { name: 'DailyMed', url: 'https://dailymed.nlm.nih.gov/dailymed/services/v2/', provider: 'U.S. National Library of Medicine' },
];

async function buildRealtimeSnapshot() {
  const memoryUsage = process.memoryUsage();
  const baseSnapshot = {
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    memory: {
      rssMb: Number((memoryUsage.rss / (1024 * 1024)).toFixed(2)),
      heapUsedMb: Number((memoryUsage.heapUsed / (1024 * 1024)).toFixed(2)),
      heapTotalMb: Number((memoryUsage.heapTotal / (1024 * 1024)).toFixed(2)),
    },
    caching: responseCache.getStats(),
    scraperCache: getMedicalDataScraper().getCacheStats(),
    adaptiveLearning: adaptiveLearningService.getStats(),
    liveSources: LIVE_SOURCES,
  };

  if (config.demoMode) {
    return {
      ...baseSnapshot,
      analytics: demoStorage.getComprehensiveAnalytics(),
      mode: 'demo',
    };
  }

  const [totalPatients, totalTreatmentPlans] = await Promise.all([
    Patient.count(),
    TreatmentPlan.count(),
  ]);

  return {
    ...baseSnapshot,
    analytics: {
      totalPatients,
      totalTreatmentPlans,
    },
    mode: 'production',
  };
}

export const getRealtimeSources = async (_req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: LIVE_SOURCES,
  });
};

export const streamRealtimeTelemetry = async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let interval: NodeJS.Timeout | null = null;
  let closed = false;
  let inFlight = false;

  const sendEvent = async () => {
    if (closed || inFlight) return;
    inFlight = true;

    try {
      const snapshot = await buildRealtimeSnapshot();
      res.write(`event: snapshot\n`);
      res.write(`data: ${JSON.stringify(snapshot)}\n\n`);
    } catch (error) {
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({
        message: 'Failed to generate realtime snapshot',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      })}\n\n`);
    } finally {
      inFlight = false;
    }
  };

  await sendEvent();
  interval = setInterval(sendEvent, 5000);

  req.on('close', () => {
    closed = true;
    if (interval) clearInterval(interval);
  });
};
