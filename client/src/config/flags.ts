/**
 * Client-side feature flags
 * 
 * These flags should mirror the server-side flags in server/config/flags.ts
 * They're used to control features in the client application.
 */

// Analytics Controls
export const ENABLE_STATS = import.meta.env.VITE_ENABLE_STATS !== 'false';
