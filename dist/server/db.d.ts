import { Pool } from '@neondatabase/serverless';
import * as schema from "../shared/schema";
export declare const pool: Pool;
export declare const db: import("drizzle-orm/neon-serverless").NeonDatabase<typeof schema> & {
    $client: Pool;
};
