import { pool } from "../server/db";

/**
 * This script adds missing columns to the lessons table
 */
async function main() {
  console.log('Adding missing columns to lessons table...');
  
  try {
    // First check which columns exist
    const columnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'lessons'
    `);
    
    const existingColumns = columnsResult.rows.map(row => row.column_name);
    console.log('Existing columns:', existingColumns);
    
    // Add missing columns if they don't exist
    if (!existingColumns.includes('subject')) {
      console.log('Adding subject column...');
      await pool.query(`ALTER TABLE lessons ADD COLUMN subject TEXT`);
    }
    
    if (!existingColumns.includes('category')) {
      console.log('Adding category column...');
      await pool.query(`ALTER TABLE lessons ADD COLUMN category TEXT`);
    }
    
    if (!existingColumns.includes('difficulty')) {
      console.log('Adding difficulty column...');
      await pool.query(`ALTER TABLE lessons ADD COLUMN difficulty TEXT DEFAULT 'beginner'`);
    }
    
    if (!existingColumns.includes('image_paths')) {
      console.log('Adding image_paths column...');
      await pool.query(`ALTER TABLE lessons ADD COLUMN image_paths JSONB`);
    }
    
    // Check columns after alterations
    const updatedColumnsResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'lessons'
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