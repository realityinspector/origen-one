import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { Pool } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log('Pushing schema to database...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Schema pushed successfully!');
  
  await pool.end();
}

main().catch((err) => {
  console.error('Error pushing schema:', err);
  process.exit(1);
});
