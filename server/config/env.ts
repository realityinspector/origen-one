/**
 * Environment Configuration Module
 * 
 * This module centralizes access to environment variables,
 * supporting both Replit Secrets and .env file for local development.
 */

// Environment variables with their defaults
export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'origen-secure-jwt-secret-for-development',
  SESSION_SECRET: process.env.SESSION_SECRET || 'session-secret',
  
  // Feature flags
  USE_AI: process.env.USE_AI !== '0',
  ENABLE_STATS: process.env.ENABLE_STATS !== '0',
  
  // API Keys
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // TypeScript configuration
  TS_NODE_TRANSPILE_ONLY: process.env.TS_NODE_TRANSPILE_ONLY === 'true',
  
  // Server configuration
  PORT: Number(process.env.PORT || 5000),
  HTTP_PORT: Number(process.env.HTTP_PORT || 8000),
};

// Validate required environment variables
export function validateEnvironment(): void {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET'
  ];
  
  const missing = requiredVars.filter(varName => !env[varName as keyof typeof env]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}