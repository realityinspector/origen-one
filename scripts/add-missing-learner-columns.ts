import { pool } from "../server/db";

/**
 * This script adds missing columns to the learner_profiles table
 */
async function main() {
  console.log('Adding missing columns to learner_profiles table...');
  
  try {
    // First check which columns exist
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'learner_profiles'
    `);
    
    const existingColumns = columnsResult.rows.map(row => row.column_name);
    console.log('Existing columns:', existingColumns);
    
    // Add missing columns if they don't exist
    if (!existingColumns.includes('subjects')) {
      console.log('Adding subjects column...');
      await pool.query(`ALTER TABLE learner_profiles ADD COLUMN subjects JSONB DEFAULT '["Math", "Reading", "Science"]'`);
    }
    
    if (!existingColumns.includes('subject_performance')) {
      console.log('Adding subject_performance column...');
      await pool.query(`ALTER TABLE learner_profiles ADD COLUMN subject_performance JSONB DEFAULT '{}'`);
    }
    
    if (!existingColumns.includes('recommended_subjects')) {
      console.log('Adding recommended_subjects column...');
      await pool.query(`ALTER TABLE learner_profiles ADD COLUMN recommended_subjects JSONB DEFAULT '[]'`);
    }
    
    if (!existingColumns.includes('struggling_areas')) {
      console.log('Adding struggling_areas column...');
      await pool.query(`ALTER TABLE learner_profiles ADD COLUMN struggling_areas JSONB DEFAULT '[]'`);
    }
    
    // Check columns after alterations
    const updatedColumnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'learner_profiles'
    `);
    
    const updatedColumns = updatedColumnsResult.rows.map(row => row.column_name);
    console.log('Updated columns:', updatedColumns);
    
    console.log('Missing columns added successfully!');
  } catch (error) {
    console.error('Error adding missing columns:', error);
  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});