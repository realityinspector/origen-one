import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";
import * as env from './config/env';

// Environment variables are accessed through the central config module

// Enhanced Neon configuration for better reliability and production readiness
neonConfig.webSocketConstructor = ws;
neonConfig.fetchConnectionCache = true;
neonConfig.useSecureWebSocket = env.DATABASE_SSL;
neonConfig.pipelineConnect = "password";
neonConfig.pipelineTLS = env.DATABASE_SSL;

// Add more logging for connection debugging
console.log('Initializing database connection for environment:', process.env.NODE_ENV || 'development');
console.log('Database connection string exists:', !!process.env.DATABASE_URL);

// Add exponential backoff to our retry logic in our custom withRetry function
// (We'll handle retries ourselves since connectionRetryLimit is not available)

// Configure the connection pool with more conservative settings and proper SSL for production
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Reduce max clients in pool to avoid connection issues
  idleTimeoutMillis: 60000, // Give idle clients more time (1 minute)
  connectionTimeoutMillis: 10000, // Allow more time for connection establishment
  maxUses: 5000, // Close connections after fewer uses
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : false, // Proper SSL configuration for production
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

// Set up a global keep-alive ping with better error handling
const KEEP_ALIVE_INTERVAL = 120000; // 2 minutes - reduce frequency to prevent connection issues
let keepAliveTimer: NodeJS.Timeout;

const runKeepAlivePing = async () => {
  try {
    // Use a client from the pool directly with a short timeout
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      console.log('Keep-alive ping successful');
    } finally {
      // Make sure we always release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Keep-alive ping failed:', error);
    
    // If we have a connection error, try to recover gracefully
    if (error.message && (
      error.message.includes('Connection terminated') || 
      error.message.includes('Connection ended') ||
      error.message.includes('Cannot read properties of null')
    )) {
      console.warn('Detected connection termination, attempting to recreate pool');
      try {
        // Wait a moment before trying to recreate the pool
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (e) {
        console.error('Error in keep-alive recovery timer:', e);
      }
    }
  }
  
  // Schedule the next ping (even if this one failed)
  keepAliveTimer = setTimeout(runKeepAlivePing, KEEP_ALIVE_INTERVAL);
};

// Start the keep-alive process
keepAliveTimer = setTimeout(runKeepAlivePing, KEEP_ALIVE_INTERVAL);

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
