import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as schema from '../shared/schema';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import path from 'path';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  
  // Configure Neon to use ws instead of browser WebSocket
  neonConfig.webSocketConstructor = ws;

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log('Running migrations...');
  
  // Run migrations
  const migrationsFolder = path.resolve('drizzle', 'migrations');
  await migrate(db, { migrationsFolder });
  
  console.log('Migrations applied successfully!');
  await pool.end();
}

main().catch((err) => {
  console.error('Error applying migrations:', err);
  process.exit(1);
});
