"use strict";
/**
 * Feature Flags
 *
 * This module contains all feature flags for the application.
 * These are controlled through environment variables.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENABLE_STATS = exports.BITTENSOR_FALLBACK_ENABLED = exports.ENABLE_BITTENSOR_SUBNET_1 = exports.USE_AI = void 0;
// AI Generation Controls
exports.USE_AI = process.env.USE_AI !== '0';
// LLM Provider Controls
exports.ENABLE_BITTENSOR_SUBNET_1 = process.env.ENABLE_BITTENSOR_SUBNET_1 === '1';
exports.BITTENSOR_FALLBACK_ENABLED = process.env.BITTENSOR_FALLBACK_ENABLED !== '0';
// Analytics Controls
exports.ENABLE_STATS = process.env.ENABLE_STATS !== '0';
// Other feature flags can be added here
//# sourceMappingURL=flags.js.map