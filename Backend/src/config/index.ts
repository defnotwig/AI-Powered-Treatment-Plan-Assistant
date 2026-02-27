import dotenv from 'dotenv';
import path from 'node:path';

// Load environment variables from the root of the project
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Check if running in demo mode (no database required)
const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.DB_PASSWORD || process.env.DB_PASSWORD === 'your_password_here';

export const config = {
  // Server
  port: Number.parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  demoMode: isDemoMode,
  
  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'treatment_plan_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  
  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o',
    maxTokens: 4000,
    temperature: 0.2, // Low for medical accuracy
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};
