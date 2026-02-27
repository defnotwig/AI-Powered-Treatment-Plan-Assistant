import express, { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { Server } from 'node:http';
import { config } from './config';
import logger from './config/logger';
import { validateConfig } from './config/validate-config';
import { swaggerSpec } from './config/swagger';
import { correlationId } from './middleware/correlation-id.middleware';
import { testConnection, syncDatabase } from './config/database';
import { v1Router, infrastructureRouter } from './routes';
import { CURRENT_VERSION, SUPPORTED_VERSIONS, deprecatedUnversionedProxy } from './middleware/api-version.middleware';
import { seedDemoData } from './seeds/demo-seeder';

// Import models to ensure they're initialized
import './models';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Correlation ID — unique request tracing
app.use(correlationId);

// Compression - gzip/brotli responses for bandwidth reduction
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging — structured, includes correlation ID
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      correlationId: req.correlationId,
    });
  });
  next();
});

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'APTP API Documentation',
}));
app.get('/api/docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Infrastructure routes (unversioned) — health check, etc.
app.use('/api', infrastructureRouter);

// Versioned API routes — canonical path: /api/v1/*
app.use('/api/v1', v1Router);

// Backward-compatible aliases: /api/patients → /api/v1/patients (with deprecation headers)
app.use('/api', deprecatedUnversionedProxy(v1Router));

// Root route — API discovery
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'AI-Powered Treatment Plan Assistant API',
    version: '1.0.0',
    apiVersion: CURRENT_VERSION,
    supportedVersions: [...SUPPORTED_VERSIONS],
    demoMode: config.demoMode,
    endpoints: {
      health: '/api/health',
      docs: '/api/docs',
      patients: '/api/v1/patients',
      treatmentPlans: '/api/v1/treatment-plans',
      auditLogs: '/api/v1/audit-logs',
      drugDatabase: '/api/v1/drug-database',
      realtime: '/api/v1/realtime',
      ml: '/api/v1/ml',
    },
    deprecated: {
      notice: 'Un-versioned paths (/api/patients) still work but include Deprecation headers. Migrate to /api/v1/* paths.',
      sunset: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled server error', {
    error: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    correlationId: req.correlationId,
    path: req.path,
  });
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    correlationId: req.correlationId,
    error: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

// Start server
const gracefulShutdownTimeoutMs = Number.parseInt(process.env.GRACEFUL_SHUTDOWN_TIMEOUT_MS || '10000', 10);

function registerShutdownHandlers(server: Server): void {
  let shuttingDown = false;

  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`${signal} received. Starting graceful shutdown...`);

    const forceTimer = setTimeout(() => {
      logger.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, gracefulShutdownTimeoutMs);

    server.close((error?: Error) => {
      clearTimeout(forceTimer);
      if (error) {
        logger.error('Error during shutdown', { error: error.message });
        process.exit(1);
        return;
      }
      logger.info('HTTP server closed cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

const startServer = async (): Promise<void> => {
  try {
    // Validate configuration on startup
    const configResult = validateConfig();
    if (!configResult.valid && config.nodeEnv === 'production') {
      logger.error('Server startup aborted due to configuration errors');
      process.exit(1);
    }

    if (config.demoMode) {
      logger.info('Running in DEMO MODE - no database connection required');
      logger.warn('Set DB_PASSWORD in .env to enable PostgreSQL');

      // Seed demo data with 1000+ patients
      logger.info('Initializing demo data...');
      await seedDemoData(1000);
    } else {
      // Test database connection
      await testConnection();

      // Sync database (creates tables if they don't exist)
      await syncDatabase();
    }

    // Start listening
    const server = app.listen(config.port, () => {
      logger.info(`Server running on http://localhost:${config.port}`, {
        environment: config.nodeEnv,
        demoMode: config.demoMode,
        port: config.port,
      });

      if (!config.openai.apiKey || config.openai.apiKey === 'your_openai_api_key_here') {
        logger.warn('OpenAI API key not configured - AI analysis will use mock data');
      } else {
        logger.info('OpenAI API key configured - using GPT-4o for analysis');
      }
    });
    registerShutdownHandlers(server);
  } catch (error) {
    logger.error('Failed to start server', { error: (error as Error).message });
    process.exit(1);
  }
};

startServer();

export default app;
