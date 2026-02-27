import { config } from './index';
import logger from './logger';

interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

interface Collector {
  warnings: string[];
  errors: string[];
}

function checkPort(c: Collector): void {
  if (config.port < 1 || config.port > 65535) {
    c.errors.push(`PORT ${config.port} is outside valid range (1-65535)`);
  }
}

function checkJwtSecret(c: Collector): void {
  if (config.jwt.secret !== 'default-secret-change-me') return;
  if (config.nodeEnv === 'production') {
    c.errors.push('JWT_SECRET must be changed from default in production');
  } else {
    c.warnings.push('JWT_SECRET is using the default value — set a strong secret before deploying');
  }
}

function checkOpenAiKey(c: Collector): void {
  if (!config.openai.apiKey || config.openai.apiKey === 'your_openai_api_key_here') {
    c.warnings.push('OPENAI_API_KEY not configured — AI analysis will use mock responses');
  }
}

function checkDatabase(c: Collector): void {
  if (config.demoMode) return;
  if (!config.database.password) {
    c.errors.push('DB_PASSWORD is required when not in demo mode');
  }
  if (config.database.host === 'localhost' && config.nodeEnv === 'production') {
    c.warnings.push('DB_HOST is localhost in production — is this intentional?');
  }
}

function checkCors(c: Collector): void {
  if (config.nodeEnv === 'production' && config.cors.origin === 'http://localhost:3000') {
    c.warnings.push('CORS_ORIGIN is still localhost — update for production domain');
  }
}

function checkRateLimit(c: Collector): void {
  if (config.rateLimit.max > 1000) {
    c.warnings.push(`Rate limit max is very high (${config.rateLimit.max}) — consider tightening for production`);
  }
}

function logResults(c: Collector): void {
  for (const w of c.warnings) {
    logger.warn(`[Config] ${w}`);
  }
  for (const e of c.errors) {
    logger.error(`[Config] ${e}`);
  }

  if (c.errors.length === 0) {
    logger.info('[Config] Configuration validated successfully');
  } else {
    logger.error(`[Config] ${c.errors.length} configuration error(s) found — server may not function correctly`);
  }
}

/**
 * Validates configuration on startup and logs warnings/errors.
 * Returns false for fatal misconfigurations that should prevent boot.
 */
export function validateConfig(): ValidationResult {
  const collector: Collector = { warnings: [], errors: [] };

  checkPort(collector);
  checkJwtSecret(collector);
  checkOpenAiKey(collector);
  checkDatabase(collector);
  checkCors(collector);
  checkRateLimit(collector);
  logResults(collector);

  return {
    valid: collector.errors.length === 0,
    warnings: collector.warnings,
    errors: collector.errors,
  };
}
