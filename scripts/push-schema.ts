import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';
import ws from 'ws';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }
  
  // Configure Neon to use ws instead of browser WebSocket
  neonConfig.webSocketConstructor = ws;

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log('Pushing schema to database...');
  
  // Create enums
  console.log('Creating enums...');
  await pool.query(`
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('ADMIN', 'PARENT', 'LEARNER');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    
    DO $$ BEGIN
      CREATE TYPE lesson_status AS ENUM ('QUEUED', 'ACTIVE', 'DONE');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);
  
  console.log('Creating tables...');
  // Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      role user_role NOT NULL,
      password TEXT NOT NULL,
      parent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS learner_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      grade_level INTEGER NOT NULL,
      graph JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS lessons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      learner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      module_id TEXT NOT NULL,
      status lesson_status NOT NULL DEFAULT 'QUEUED',
      spec JSONB,
      score INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      completed_at TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS achievements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      learner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      payload JSONB,
      awarded_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS session (
      sid TEXT PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMP(6) NOT NULL
    );
    CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);
  `);
  
  console.log('Schema pushed successfully!');
  await pool.end();
}

main().catch((err) => {
  console.error('Error pushing schema:', err);
  process.exit(1);
});
