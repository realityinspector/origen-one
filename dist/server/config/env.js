"use strict";
/**
 * Centralized environment configuration
 * Handles both .env file (for local development) and Replit Secrets (for production)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERPLEXITY_API_KEY = exports.OPENROUTER_API_KEY = exports.JWT_EXPIRY = exports.JWT_SECRET = exports.SESSION_SECRET = exports.NODE_ENV = exports.PORT = exports.DATABASE_SSL = exports.DATABASE_URL = void 0;
exports.getEnv = getEnv;
// Load environment variables from .env file during development
// In production (Replit), environment variables are already available via Secrets
if (process.env.NODE_ENV === 'development' && !process.env.REPL_ID) {
    try {
        // Dynamic import to avoid bundling dotenv in production
        require('dotenv').config();
    }
    catch (err) {
        console.warn('Optional dependency dotenv not found. Using environment variables directly.');
    }
}
/**
 * Get environment variable with optional fallback
 */
function getEnv(key, fallback) {
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
exports.DATABASE_URL = getEnv('DATABASE_URL');
exports.DATABASE_SSL = getEnv('DATABASE_SSL', 'true') === 'true';
// Server configuration
exports.PORT = parseInt(getEnv('PORT', '5000'));
exports.NODE_ENV = getEnv('NODE_ENV', 'development');
exports.SESSION_SECRET = getEnv('SESSION_SECRET', 'dev-secret-change-me');
// Authentication
exports.JWT_SECRET = getEnv('JWT_SECRET', exports.SESSION_SECRET);
exports.JWT_EXPIRY = getEnv('JWT_EXPIRY', '7d');
// For OpenRouter integration
exports.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
// For Perplexity integration
exports.PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';
//# sourceMappingURL=env.js.map