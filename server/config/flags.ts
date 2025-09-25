/**
 * Feature Flags
 * 
 * This module contains all feature flags for the application.
 * These are controlled through environment variables.
 */

// AI Generation Controls
export const USE_AI = process.env.USE_AI !== '0';

// LLM Provider Controls
export const ENABLE_BITTENSOR_SUBNET_1 = process.env.ENABLE_BITTENSOR_SUBNET_1 === '1';
export const BITTENSOR_FALLBACK_ENABLED = process.env.BITTENSOR_FALLBACK_ENABLED !== '0';

// Analytics Controls
export const ENABLE_STATS = process.env.ENABLE_STATS !== '0';

// Other feature flags can be added here
