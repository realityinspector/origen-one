import { pool } from '../server/db';

/**
 * This script creates a function to provide a workaround for the type mismatch issues
 * between string IDs in the application and integer IDs in the database.
 * It allows updating a learner profile directly through SQL without relying on the ORM.
 */
async function main() {
  console.log('Creating patch function for learner profile updates...');
  
  try {
    // Check database connection
    await pool.query('SELECT 1');
    console.log('Database connection successful');
    
    // Create a function to safely update learner profiles
    const createFunctionQuery = `
      CREATE OR REPLACE FUNCTION update_learner_profile(
        p_user_id INTEGER,
        p_grade_level INTEGER DEFAULT NULL,
        p_graph JSONB DEFAULT NULL,
        p_subjects JSONB DEFAULT NULL,
        p_recommended_subjects JSONB DEFAULT NULL,
        p_struggling_areas JSONB DEFAULT NULL
      ) RETURNS TABLE (
        id UUID,
        user_id INTEGER,
        grade_level INTEGER,
        graph JSONB,
        subjects JSONB,
        subject_performance JSONB,
        recommended_subjects JSONB,
        struggling_areas JSONB,
        created_at TIMESTAMP
      ) AS $$
      BEGIN
        -- Check if the profile exists
        IF NOT EXISTS (SELECT 1 FROM learner_profiles AS lp WHERE lp.user_id = p_user_id) THEN
          -- Create a new profile if it doesn't exist
          INSERT INTO learner_profiles (
            id, 
            user_id, 
            grade_level, 
            graph, 
            subjects, 
            subject_performance, 
            recommended_subjects, 
            struggling_areas
          ) VALUES (
            gen_random_uuid(), 
            p_user_id, 
            COALESCE(p_grade_level, 5),
            COALESCE(p_graph, '{"nodes":[],"edges":[]}'::jsonb),
            COALESCE(p_subjects, '["Math", "Reading", "Science"]'::jsonb),
            '{}'::jsonb,
            COALESCE(p_recommended_subjects, '[]'::jsonb),
            COALESCE(p_struggling_areas, '[]'::jsonb)
          );
        ELSE
          -- Update the existing profile
          UPDATE learner_profiles AS lp
          SET 
            grade_level = COALESCE(p_grade_level, lp.grade_level),
            graph = COALESCE(p_graph, lp.graph),
            subjects = COALESCE(p_subjects, lp.subjects),
            recommended_subjects = COALESCE(p_recommended_subjects, lp.recommended_subjects),
            struggling_areas = COALESCE(p_struggling_areas, lp.struggling_areas)
          WHERE lp.user_id = p_user_id;
        END IF;
        
        -- Return the updated profile
        RETURN QUERY SELECT * FROM learner_profiles AS lp WHERE lp.user_id = p_user_id;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    await pool.query(createFunctionQuery);
    console.log('Successfully created update_learner_profile function');
    
    // Test the function
    const testResult = await pool.query('SELECT * FROM update_learner_profile(155, 6, NULL, NULL, NULL, NULL)');
    console.log('Function test result:', JSON.stringify(testResult.rows[0], null, 2));
    
    console.log('Patch successfully applied!');
  } catch (error) {
    console.error('Error applying patch:', error);
    process.exit(1);
  } finally {
    // Close the database connection pool
    await pool.end();
  }
}

main();