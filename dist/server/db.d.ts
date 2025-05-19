import { Pool } from '@neondatabase/serverless';
import * as schema from "../shared/schema";
export declare const pool: Pool;
export declare function checkDatabaseConnection(): Promise<boolean>;
export declare const db: import("drizzle-orm/neon-serverless").NeonDatabase<typeof schema> & {
    $client: Pool;
};
export declare function withRetry<T>(operation: () => Promise<T>, maxRetries?: number, initialDelay?: number): Promise<T>;
