import { pool } from '../server/db';

/**
 * This script fixes the JSON columns in the learner_profiles table to ensure
 * they are stored as proper JSONB types, resolving the "Learner profile not found" error.
 */
async function main() {
  console.log('Starting JSON column fix for learner profiles...');
  
  try {
    // Apply a single update to ensure all JSON columns are properly formatted
    const fixQuery = `
      UPDATE learner_profiles
      SET 
        graph = COALESCE(graph, '{"nodes":[],"edges":[]}'::jsonb),
        subjects = COALESCE(subjects, '["Math", "Reading", "Science"]'::jsonb),
        subject_performance = COALESCE(subject_performance, '{}'::jsonb),
        recommended_subjects = COALESCE(recommended_subjects, '[]'::jsonb),
        struggling_areas = COALESCE(struggling_areas, '[]'::jsonb)
    `;
    
    const result = await pool.query(fixQuery);
    console.log(`Updated ${result.rowCount} learner profiles with JSON column fixes`);
    
    // Check which profiles exist
    const checkQuery = `SELECT id, user_id FROM learner_profiles`;
    const checkResult = await pool.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('Existing learner profiles:');
      checkResult.rows.forEach(row => {
        console.log(`- ID: ${row.id}, User ID: ${row.user_id}`);
      });
    } else {
      console.log('No learner profiles found in database');
    }
    
    console.log('JSON column fix completed successfully');
  } catch (error) {
    console.error('Error fixing JSON columns:', error);
  } finally {
    await pool.end();
  }
}

main();