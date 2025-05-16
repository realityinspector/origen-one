import { pool } from '../server/db';

/**
 * This script directly applies fixes to the database to solve the "Learner profile not found" issue
 * by ensuring proper data type handling between application and database.
 */
async function main() {
  console.log('Starting learner profile database fix...');
  
  try {
    // 1. Check for existing learner profiles without parents
    const orphanedLearnersQuery = `
      SELECT lp.user_id, lp.id, u.parent_id, u.username
      FROM learner_profiles lp
      JOIN users u ON lp.user_id = u.id
      WHERE u.parent_id IS NULL AND u.role = 'LEARNER'
    `;
    
    const orphanedResult = await pool.query(orphanedLearnersQuery);
    console.log(`Found ${orphanedResult.rowCount} learner profiles without parents`);
    
    // 2. Validate profile data formats
    const checkProfilesQuery = `
      SELECT * FROM learner_profiles
      ORDER BY user_id
    `;
    
    const profilesResult = await pool.query(checkProfilesQuery);
    console.log(`Total learner profiles: ${profilesResult.rowCount}`);
    
    if (profilesResult.rowCount > 0) {
      for (const profile of profilesResult.rows) {
        console.log(`\nValidating profile for user_id: ${profile.user_id}`);
        
        // Check graph data format
        try {
          if (typeof profile.graph === 'string') {
            const parsedGraph = JSON.parse(profile.graph);
            console.log(`Graph data is stored as string, needs parsing`);
            
            // Update to ensure graph is stored as JSONB not string
            await pool.query(
              `UPDATE learner_profiles SET graph = $1::jsonb WHERE id = $2`,
              [profile.graph, profile.id]
            );
            console.log(`- Updated graph to proper JSONB format`);
          } else {
            console.log(`- Graph data format OK`);
          }
        } catch (err) {
          console.error(`- Invalid graph format:`, err);
          await pool.query(
            `UPDATE learner_profiles SET graph = $1::jsonb WHERE id = $2`,
            ['{"nodes":[],"edges":[]}', profile.id]
          );
          console.log(`- Reset graph to empty default`);
        }
        
        // Check subjects data format
        try {
          if (typeof profile.subjects === 'string') {
            await pool.query(
              `UPDATE learner_profiles SET subjects = $1::jsonb WHERE id = $2`,
              [profile.subjects, profile.id]
            );
            console.log(`- Updated subjects to proper JSONB format`);
          } else if (!profile.subjects) {
            await pool.query(
              `UPDATE learner_profiles SET subjects = $1::jsonb WHERE id = $2`,
              ['["Math", "Reading", "Science"]', profile.id]
            );
            console.log(`- Reset subjects to defaults`);
          } else {
            console.log(`- Subjects data format OK`);
          }
        } catch (err) {
          console.error(`- Invalid subjects format:`, err);
          await pool.query(
            `UPDATE learner_profiles SET subjects = $1::jsonb WHERE id = $2`,
            ['["Math", "Reading", "Science"]', profile.id]
          );
          console.log(`- Reset subjects to defaults`);
        }
        
        // Check recommended_subjects data format
        try {
          if (typeof profile.recommended_subjects === 'string') {
            await pool.query(
              `UPDATE learner_profiles SET recommended_subjects = $1::jsonb WHERE id = $2`,
              [profile.recommended_subjects, profile.id]
            );
            console.log(`- Updated recommended_subjects to proper JSONB format`);
          } else if (!profile.recommended_subjects) {
            await pool.query(
              `UPDATE learner_profiles SET recommended_subjects = $1::jsonb WHERE id = $2`,
              ['[]', profile.id]
            );
            console.log(`- Reset recommended_subjects to defaults`);
          } else {
            console.log(`- Recommended subjects data format OK`);
          }
        } catch (err) {
          console.error(`- Invalid recommended_subjects format:`, err);
          await pool.query(
            `UPDATE learner_profiles SET recommended_subjects = $1::jsonb WHERE id = $2`,
            ['[]', profile.id]
          );
          console.log(`- Reset recommended_subjects to defaults`);
        }
        
        // Check struggling_areas data format
        try {
          if (typeof profile.struggling_areas === 'string') {
            await pool.query(
              `UPDATE learner_profiles SET struggling_areas = $1::jsonb WHERE id = $2`,
              [profile.struggling_areas, profile.id]
            );
            console.log(`- Updated struggling_areas to proper JSONB format`);
          } else if (!profile.struggling_areas) {
            await pool.query(
              `UPDATE learner_profiles SET struggling_areas = $1::jsonb WHERE id = $2`,
              ['[]', profile.id]
            );
            console.log(`- Reset struggling_areas to defaults`);
          } else {
            console.log(`- Struggling areas data format OK`);
          }
        } catch (err) {
          console.error(`- Invalid struggling_areas format:`, err);
          await pool.query(
            `UPDATE learner_profiles SET struggling_areas = $1::jsonb WHERE id = $2`,
            ['[]', profile.id]
          );
          console.log(`- Reset struggling_areas to defaults`);
        }
      }
    }
    
    console.log('\nSuccess! Learner profile database fix complete.');
  } catch (error) {
    console.error('Error in database fix:', error);
  } finally {
    // Close pool
    await pool.end();
  }
}

main();