/**
 * Centralized environment configuration
 * Handles both .env file (for local development) and Replit Secrets (for production)
 */
/**
 * Get environment variable with optional fallback
 */
export declare function getEnv(key: string, fallback?: string): string;
export declare const DATABASE_URL: string;
export declare const DATABASE_SSL: boolean;
export declare const PORT: number;
export declare const NODE_ENV: string;
export declare const SESSION_SECRET: string;
export declare const JWT_SECRET: string;
export declare const JWT_EXPIRY: string;
export declare const LLM_PROVIDER: string;
export declare const OPENROUTER_API_KEY: string;
export declare const BITTENSOR_API_KEY: string;
export declare const BITTENSOR_SUBNET_1_URL: string;
export declare const BITTENSOR_WALLET_NAME: string;
export declare const BITTENSOR_WALLET_HOTKEY: string;
export declare const PERPLEXITY_API_KEY: string;
