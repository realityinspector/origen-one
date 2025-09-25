/**
 * Centralized environment configuration
 * Handles both .env file (for local development) and Replit Secrets (for production)
 */

// Load environment variables from .env file during development
// In production (Replit), environment variables are already available via Secrets
if (process.env.NODE_ENV === 'development' && !process.env.REPL_ID) {
  try {
    // Dynamic import to avoid bundling dotenv in production
    require('dotenv').config();
  } catch (err) {
    console.warn('Optional dependency dotenv not found. Using environment variables directly.');
  }
}

/**
 * Get environment variable with optional fallback
 */
export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

// Database configuration
export const DATABASE_URL = getEnv('DATABASE_URL');
export const DATABASE_SSL = getEnv('DATABASE_SSL', 'true') === 'true';

// Server configuration
export const PORT = parseInt(getEnv('PORT', '5000'));
export const NODE_ENV = getEnv('NODE_ENV', 'development');
export const SESSION_SECRET = getEnv('SESSION_SECRET', 'dev-secret-change-me');

// Authentication
export const JWT_SECRET = getEnv('JWT_SECRET', SESSION_SECRET);
export const JWT_EXPIRY = getEnv('JWT_EXPIRY', '7d');

// LLM Provider Configuration
export const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openrouter'; // 'openrouter', 'bittensor', 'perplexity'

// For OpenRouter integration
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

// For Bittensor integration
export const BITTENSOR_API_KEY = process.env.BITTENSOR_API_KEY || '';
export const BITTENSOR_SUBNET_1_URL = process.env.BITTENSOR_SUBNET_1_URL || 'https://archive.opentensor.ai/graphql';
export const BITTENSOR_WALLET_NAME = process.env.BITTENSOR_WALLET_NAME;
export const BITTENSOR_WALLET_HOTKEY = process.env.BITTENSOR_WALLET_HOTKEY;

// For Perplexity integration
export const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';