import { Router } from 'express';
import { config } from '../config';
import { CURRENT_VERSION, SUPPORTED_VERSIONS, versionHeaders } from '../middleware/api-version.middleware';
import patientRoutes from './patient.routes';
import treatmentRoutes from './treatment.routes';
import auditRoutes from './audit.routes';
import drugDatabaseRoutes from './drug-database.routes';
import realtimeRoutes from './realtime.routes';
import mlRoutes from './ml.routes';

const startTime = Date.now();

// ---------------------------------------------------------------------------
// Infrastructure routes (unversioned — always at /api/*)
// ---------------------------------------------------------------------------
export const infrastructureRouter = Router();

// Health check — enhanced for production readiness
infrastructureRouter.get('/health', (_req, res) => {
  const uptimeSeconds = Math.floor(process.uptime());
  const mem = process.memoryUsage();

  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    apiVersion: CURRENT_VERSION,
    supportedVersions: [...SUPPORTED_VERSIONS],
    uptime: {
      seconds: uptimeSeconds,
      human: formatUptime(uptimeSeconds),
    },
    memory: {
      rssBytes: mem.rss,
      heapUsedBytes: mem.heapUsed,
      heapTotalBytes: mem.heapTotal,
      externalBytes: mem.external,
      rssMB: Math.round(mem.rss / 1024 / 1024),
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
    },
    environment: config.nodeEnv,
    demoMode: config.demoMode,
    version: '1.0.0',
    node: process.version,
    openaiConfigured: Boolean(config.openai.apiKey && config.openai.apiKey !== 'your_openai_api_key_here'),
    serverStartedAt: new Date(startTime).toISOString(),
  });
});

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
}

// ---------------------------------------------------------------------------
// Versioned domain routes — mounted at /api/v1/*
// ---------------------------------------------------------------------------
export const v1Router = Router();

// Stamp version headers on every v1 response
v1Router.use((req, res, next) => {
  req.apiVersion = CURRENT_VERSION;
  next();
});
v1Router.use(versionHeaders);

// Mount domain routes
v1Router.use('/patients', patientRoutes);
v1Router.use('/treatment-plans', treatmentRoutes);
v1Router.use('/audit-logs', auditRoutes);
v1Router.use('/drug-database', drugDatabaseRoutes);
v1Router.use('/realtime', realtimeRoutes);
v1Router.use('/ml', mlRoutes);

// Default export kept for backward compatibility (points to v1)
export default v1Router;
