import dotenv from 'dotenv';
import { randomBytes } from 'crypto';
import { db, pool } from '../server/db';
import * as schema from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import { Client } from 'pg';
import { exit } from 'process';
import { hashPassword } from '../server/middleware/auth';

// Use crypto.randomBytes instead of nanoid
function generateId(size: number = 6): string {
  return randomBytes(size).toString('hex').slice(0, size);
}

// Load environment variables from test.env if it exists
dotenv.config({ path: './test.env' });

// Test user credentials
const TEST_PARENT = {
  username: 'testparent',
  email: 'testparent@example.com',
  name: 'Test Parent',
  password: 'testpassword123',
  role: 'PARENT' as const
};

const TEST_LEARNER = {
  username: 'testlearner',
  email: 'testlearner@example.com',
  name: 'Test Learner',
  password: 'testpassword123',
  role: 'LEARNER' as const,
  gradeLevel: 5
};

/**
 * Setup test environment with users and data
 */
async function setupTestEnvironment() {
  console.log('Setting up test environment...');
  
  try {
    // Check if test parent already exists
    const existingParent = await db.query.users.findFirst({
      where: eq(schema.users.email, TEST_PARENT.email)
    });
    
    let parentId: number;
    
    if (existingParent) {
      console.log(`Test parent user already exists with ID ${existingParent.id}`);
      parentId = existingParent.id;
    } else {
      // Create parent user
      const hashedPassword = await hashPassword(TEST_PARENT.password);
      const [parent] = await db.insert(schema.users).values({
        ...TEST_PARENT,
        password: hashedPassword,
        parentId: null,
        createdAt: new Date()
      }).returning();
      
      parentId = parent.id;
      console.log(`Created test parent user with ID ${parentId}`);
    }
    
    // Check if test learner already exists
    const existingLearner = await db.query.users.findFirst({
      where: eq(schema.users.email, TEST_LEARNER.email)
    });
    
    let learnerId: number;
    
    if (existingLearner) {
      console.log(`Test learner already exists with ID ${existingLearner.id}`);
      learnerId = existingLearner.id;
    } else {
      // Create learner associated with parent
      const hashedPassword = await hash(TEST_LEARNER.password, 10);
      const [learner] = await db.insert(schema.users).values({
        ...TEST_LEARNER,
        password: hashedPassword,
        parentId: parentId,
        createdAt: new Date()
      }).returning();
      
      learnerId = learner.id;
      console.log(`Created test learner with ID ${learnerId}`);
      
      // Create learner profile
      await db.insert(schema.learnerProfiles).values({
        userId: learnerId,
        gradeLevel: TEST_LEARNER.gradeLevel,
        graph: {
          nodes: [],
          edges: []
        }
      });
      console.log(`Created learner profile for learner ID ${learnerId}`);
    }
    
    // Create a test lesson for the learner
    const existingLesson = await db.query.lessons.findFirst({
      where: and(
        eq(schema.lessons.userId, learnerId),
        eq(schema.lessons.title, 'Test Lesson')
      )
    });
    
    if (!existingLesson) {
      const [lesson] = await db.insert(schema.lessons).values({
        id: generateId(6),
        userId: learnerId,
        title: 'Test Lesson',
        status: 'DONE',
        content: 'This is a test lesson content',
        createdAt: new Date(),
        gradingResults: null,
        spec: {
          title: 'Test Lesson',
          grade: TEST_LEARNER.gradeLevel,
          topic: 'Testing',
          content: 'This is a test lesson content',
          quiz: [
            {
              question: 'What is this lesson for?',
              options: [
                'Learning math',
                'Reading practice',
                'Testing the application',
                'Science experiment'
              ],
              correctOptionIndex: 2
            }
          ]
        }
      }).returning();
      
      console.log(`Created test lesson for learner ID ${learnerId}`);
    } else {
      console.log(`Test lesson already exists for learner ID ${learnerId}`);
    }
    
    // Create a test achievement
    const existingAchievement = await db.query.achievements.findFirst({
      where: and(
        eq(schema.achievements.userId, learnerId),
        eq(schema.achievements.name, 'Test Achievement')
      )
    });
    
    if (!existingAchievement) {
      await db.insert(schema.achievements).values({
        userId: learnerId,
        name: 'Test Achievement',
        description: 'Achievement for testing database sync',
        imageUrl: null,
        earnedAt: new Date(),
        type: 'LESSON_COMPLETED'
      });
      
      console.log(`Created test achievement for learner ID ${learnerId}`);
    } else {
      console.log(`Test achievement already exists for learner ID ${learnerId}`);
    }
    
    return { parentId, learnerId };
  } catch (error) {
    console.error('Error setting up test environment:', error);
    throw error;
  }
}

/**
 * Test database synchronization
 */
async function testDatabaseSync(parentId: number) {
  console.log('\nTesting database synchronization...');
  
  // Validate external database URL is provided
  const externalDbUrl = process.env.EXTERNAL_DB_URL;
  if (!externalDbUrl) {
    console.error('Missing EXTERNAL_DB_URL in environment variables');
    return false;
  }
  
  try {
    // Check if a sync config already exists for this parent
    const existingConfig = await db.query.dbSyncConfigs.findFirst({
      where: and(
        eq(schema.dbSyncConfigs.parentId, parentId),
        eq(schema.dbSyncConfigs.targetDbUrl, externalDbUrl)
      )
    });
    
    let syncConfigId: string;
    
    if (existingConfig) {
      console.log(`Sync configuration already exists with ID ${existingConfig.id}`);
      syncConfigId = existingConfig.id;
    } else {
      // Create sync configuration
      const [syncConfig] = await db.insert(schema.dbSyncConfigs).values({
        id: generateId(8),
        parentId: parentId,
        targetDbUrl: externalDbUrl,
        lastSyncAt: null,
        syncStatus: 'IDLE',
        continuousSync: false,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      syncConfigId = syncConfig.id;
      console.log(`Created sync configuration with ID ${syncConfigId}`);
    }
    
    // Test connection to external database
    console.log('Testing connection to external database...');
    const client = new Client({ connectionString: externalDbUrl });
    await client.connect();
    const result = await client.query('SELECT NOW()');
    console.log(`External database connection successful. Server time: ${result.rows[0].now}`);
    await client.end();
    
    // Update sync config to indicate sync is in progress
    await db.update(schema.dbSyncConfigs)
      .set({
        syncStatus: 'IN_PROGRESS',
        updatedAt: new Date()
      })
      .where(eq(schema.dbSyncConfigs.id, syncConfigId));
    
    console.log('Starting synchronization...');
    
    // Import the synchronize function directly
    const { synchronizeToExternalDatabase } = await import('../server/sync-utils');
    
    // Get the sync config
    const syncConfig = await db.query.dbSyncConfigs.findFirst({
      where: eq(schema.dbSyncConfigs.id, syncConfigId)
    });
    
    if (!syncConfig) {
      throw new Error(`Sync configuration with ID ${syncConfigId} not found`);
    }
    
    // Execute the synchronization
    await synchronizeToExternalDatabase(parentId, syncConfig);
    
    console.log('Synchronization completed successfully');
    
    // Verify synchronization was marked as completed
    const updatedConfig = await db.query.dbSyncConfigs.findFirst({
      where: eq(schema.dbSyncConfigs.id, syncConfigId)
    });
    
    if (updatedConfig?.syncStatus === 'COMPLETED') {
      console.log('Sync status was updated to COMPLETED');
      return true;
    } else {
      console.log(`Sync status is ${updatedConfig?.syncStatus} (expected COMPLETED)`);
      return false;
    }
  } catch (error) {
    console.error('Error testing database synchronization:', error);
    
    // Update sync config to indicate error
    try {
      const syncConfig = await db.query.dbSyncConfigs.findFirst({
        where: eq(schema.dbSyncConfigs.parentId, parentId)
      });
      
      if (syncConfig) {
        await db.update(schema.dbSyncConfigs)
          .set({
            syncStatus: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            updatedAt: new Date()
          })
          .where(eq(schema.dbSyncConfigs.id, syncConfig.id));
      }
    } catch (updateError) {
      console.error('Error updating sync config status:', updateError);
    }
    
    return false;
  }
}

/**
 * Verify data in external database
 */
async function verifyExternalData(learnerId: number) {
  console.log('\nVerifying data in external database...');
  
  const externalDbUrl = process.env.EXTERNAL_DB_URL;
  if (!externalDbUrl) {
    console.error('Missing EXTERNAL_DB_URL in environment variables');
    return false;
  }
  
  try {
    const client = new Client({ connectionString: externalDbUrl });
    await client.connect();
    
    // Check if users were synchronized
    const userResult = await client.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE email = $1 OR email = $2
    `, [TEST_PARENT.email, TEST_LEARNER.email]);
    
    const userCount = parseInt(userResult.rows[0].count);
    console.log(`Found ${userCount} users in external database (expected 2)`);
    
    // Check if learner profile was synchronized
    const profileResult = await client.query(`
      SELECT COUNT(*) as count FROM learner_profiles 
      WHERE user_id IN (SELECT id FROM users WHERE email = $1)
    `, [TEST_LEARNER.email]);
    
    const profileCount = parseInt(profileResult.rows[0].count);
    console.log(`Found ${profileCount} learner profile in external database (expected 1)`);
    
    // Check if lesson was synchronized
    const lessonResult = await client.query(`
      SELECT COUNT(*) as count FROM lessons 
      WHERE user_id IN (SELECT id FROM users WHERE email = $1)
    `, [TEST_LEARNER.email]);
    
    const lessonCount = parseInt(lessonResult.rows[0].count);
    console.log(`Found ${lessonCount} lesson in external database (expected at least 1)`);
    
    // Check if achievement was synchronized
    const achievementResult = await client.query(`
      SELECT COUNT(*) as count FROM achievements 
      WHERE user_id IN (SELECT id FROM users WHERE email = $1)
    `, [TEST_LEARNER.email]);
    
    const achievementCount = parseInt(achievementResult.rows[0].count);
    console.log(`Found ${achievementCount} achievement in external database (expected at least 1)`);
    
    await client.end();
    
    return userCount === 2 && profileCount === 1 && lessonCount >= 1 && achievementCount >= 1;
  } catch (error) {
    console.error('Error verifying external data:', error);
    return false;
  }
}

/**
 * Run the full test
 */
async function runTest() {
  try {
    console.log('=============================================');
    console.log('DATABASE SYNCHRONIZATION TEST');
    console.log('=============================================\n');
    
    // Set up test environment
    const { parentId, learnerId } = await setupTestEnvironment();
    
    // Test database synchronization
    const syncSuccess = await testDatabaseSync(parentId);
    console.log(`\nSynchronization test ${syncSuccess ? 'PASSED' : 'FAILED'}`);
    
    // Verify data in external database
    if (syncSuccess) {
      const verifySuccess = await verifyExternalData(learnerId);
      console.log(`\nExternal data verification ${verifySuccess ? 'PASSED' : 'FAILED'}`);
    }
    
    console.log('\n=============================================');
    console.log('TEST COMPLETED');
    console.log('=============================================');
    
    // Close database connection
    await pool.end();
    
    return syncSuccess;
  } catch (error) {
    console.error('Test failed with error:', error);
    await pool.end();
    return false;
  }
}

// Run the test
runTest()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });