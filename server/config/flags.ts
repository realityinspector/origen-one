/**
 * Feature Flags
 * 
 * This module contains all feature flags for the application.
 * These are controlled through environment variables.
 */

// AI Generation Controls
export const USE_AI = process.env.USE_AI !== '0';

// Analytics Controls
export const ENABLE_STATS = process.env.ENABLE_STATS !== '0';

// Other feature flags can be added here
