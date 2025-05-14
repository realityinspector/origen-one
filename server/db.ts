import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure the connection pool with more robust settings
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if a connection cannot be established
  maxUses: 7500, // Close a connection after it has been used 7500 times
});

// Add event listeners to the pool for better error tracking
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

// Create a connection health check function
export async function checkDatabaseConnection() {
  let client;
  try {
    client = await pool.connect();
    await client.query('SELECT 1');
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  } finally {
    if (client) client.release();
  }
}

// Initialize the Drizzle ORM with the pool
export const db = drizzle(pool, { schema });

// Expose a function to retry database operations with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 300
): Promise<T> {
  let retries = 0;
  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      if (
        retries >= maxRetries ||
        // Don't retry on certain types of errors
        (error.code && ['23505', '23503', '42P01', '42703'].includes(error.code))
      ) {
        throw error;
      }
      const delay = initialDelay * Math.pow(2, retries);
      console.log(`Retrying database operation in ${delay}ms. Attempt ${retries + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }
  }
}
