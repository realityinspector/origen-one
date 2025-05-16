import { pool } from '../server/db';

async function main() {
  console.log('Starting learner profile fix...');
  
  try {
    // Check database connection
    await pool.query('SELECT 1');
    console.log('Database connection successful');
    
    // 1. Fix any existing learner profiles where graph is null
    const fixGraphQuery = `
      UPDATE learner_profiles 
      SET graph = '{"nodes":[],"edges":[]}' 
      WHERE graph IS NULL OR graph::text = 'null'
    `;
    const graphResult = await pool.query(fixGraphQuery);
    console.log(`Fixed ${graphResult.rowCount} learner profiles with null graph data`);
    
    // 2. Fix any JSON columns with improper format
    const fixJsonQuery = `
      UPDATE learner_profiles 
      SET 
        subjects = COALESCE(subjects, '["Math", "Reading", "Science"]'::jsonb),
        subject_performance = COALESCE(subject_performance, '{}'::jsonb),
        recommended_subjects = COALESCE(recommended_subjects, '[]'::jsonb),
        struggling_areas = COALESCE(struggling_areas, '[]'::jsonb)
      WHERE 
        subjects IS NULL OR 
        subject_performance IS NULL OR 
        recommended_subjects IS NULL OR 
        struggling_areas IS NULL
    `;
    const jsonResult = await pool.query(fixJsonQuery);
    console.log(`Fixed ${jsonResult.rowCount} learner profiles with missing JSON data`);
    
    // 3. List all learner profiles to verify the fix
    const allProfilesQuery = `SELECT * FROM learner_profiles`;
    const allProfiles = await pool.query(allProfilesQuery);
    console.log(`Total learner profiles in database: ${allProfiles.rowCount}`);
    
    if (allProfiles.rowCount > 0) {
      // Display the first profile as a sample
      console.log('Sample learner profile:');
      console.log(JSON.stringify(allProfiles.rows[0], null, 2));
    }
    
    console.log('Learner profile fix completed successfully!');
  } catch (error) {
    console.error('Error fixing learner profiles:', error);
    process.exit(1);
  } finally {
    // Close the database connection pool
    await pool.end();
  }
}

main();