import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as schema from '../shared/schema';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import path from 'path';
import ws from 'ws';

async function main() {
  // For scripts that are run directly, ensure DATABASE_URL is available from Replit Secrets
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  
  // Configure Neon to use ws instead of browser WebSocket
  neonConfig.webSocketConstructor = ws;

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log('Pushing schema to database using migrations...');
  
  // Run migrations
  const migrationsFolder = path.resolve('drizzle', 'migrations');
  await migrate(db, { migrationsFolder });
  
  console.log('Schema pushed successfully!');
  await pool.end();
}

main().catch((err) => {
  console.error('Error pushing schema:', err);
  process.exit(1);
});
