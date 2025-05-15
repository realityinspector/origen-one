import { users, lessons, learnerProfiles, achievements, dbSyncConfigs } from "../shared/schema";
import crypto from "crypto";
import type { 
  User, InsertUser, 
  Lesson, InsertLesson, 
  LearnerProfile, InsertLearnerProfile, 
  Achievement, InsertAchievement,
  DbSyncConfig, InsertDbSyncConfig
} from "../shared/schema";
import { db, withRetry, checkDatabaseConnection } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { pool } from "./db";

// Type for upserting users from Replit auth
export interface UpsertUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  username?: string;
  name?: string;
  role?: "ADMIN" | "PARENT" | "LEARNER";
}

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getUsersByParentId(parentId: string): Promise<User[]>;
  getAllParents(): Promise<User[]>;
  upsertUser(userData: UpsertUser): Promise<User>;
  
  // Learner profile operations
  getLearnerProfile(userId: string): Promise<LearnerProfile | undefined>;
  createLearnerProfile(profile: InsertLearnerProfile): Promise<LearnerProfile>;
  updateLearnerProfile(userId: string, data: Partial<InsertLearnerProfile>): Promise<LearnerProfile | undefined>;
  
  // Lesson operations
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  getLessonById(id: string): Promise<Lesson | undefined>;
  getActiveLesson(learnerId: string): Promise<Lesson | undefined>;
  getLessonHistory(learnerId: string, limit?: number): Promise<Lesson[]>;
  updateLessonStatus(id: string, status: "QUEUED" | "ACTIVE" | "DONE", score?: number): Promise<Lesson | undefined>;
  
  // Achievement operations
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getAchievements(learnerId: string): Promise<Achievement[]>;
  
  // Database sync operations
  getSyncConfigsByParentId(parentId: string): Promise<DbSyncConfig[]>;
  getSyncConfigById(id: string): Promise<DbSyncConfig | undefined>;
  createSyncConfig(config: InsertDbSyncConfig): Promise<DbSyncConfig>;
  updateSyncConfig(id: string, data: Partial<InsertDbSyncConfig>): Promise<DbSyncConfig | undefined>;
  deleteSyncConfig(id: string): Promise<boolean>;
  updateSyncStatus(id: string, status: "IDLE" | "IN_PROGRESS" | "FAILED" | "COMPLETED", errorMessage?: string): Promise<DbSyncConfig | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize database connection if needed
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      // Use specific fields that exist in the database
      const result = await db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          name: users.name,
          role: users.role,
          password: users.password,
          parentId: users.parentId,
          createdAt: users.createdAt,
          // Don't select updatedAt or profileImageUrl as they don't exist in the database
        })
        .from(users)
        .where(eq(users.id, id));
      
      const users_found = Array.isArray(result) ? result : [result];
      return users_found.length > 0 ? users_found[0] as User : undefined;
    } catch (error) {
      console.error(`Error in getUser for id "${id}":`, error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      return await withRetry(async () => {
        // Log the SQL query being executed for debugging
        console.log(`Looking for user with username: ${username}`);
        // Use specific fields that exist in the database
        const result = await db
          .select({
            id: users.id,
            email: users.email,
            username: users.username,
            name: users.name,
            role: users.role,
            password: users.password,
            parentId: users.parentId,
            createdAt: users.createdAt,
            // Don't select updatedAt or profileImageUrl as they don't exist in the database
          })
          .from(users)
          .where(eq(users.username, username));
        
        const users_found = Array.isArray(result) ? result : [result];
        return users_found.length > 0 ? users_found[0] as User : undefined;
      });
    } catch (error) {
      console.error(`Error in getUserByUsername for username "${username}":`, error);
      
      // Check database connection when an error occurs
      await checkDatabaseConnection();
      
      // Return undefined on error after logging it
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    const user = Array.isArray(result) ? result[0] : result;
    return user as User;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      // Set default role if not provided
      if (!userData.role) {
        userData.role = "LEARNER";
      }
      
      // Set a name if not provided but firstName is available
      if (!userData.name && userData.firstName) {
        userData.name = `${userData.firstName}${userData.lastName ? ' ' + userData.lastName : ''}`;
      }
      
      // Set username if not provided
      if (!userData.username && userData.email) {
        // Use the email part before @ as username
        userData.username = userData.email.split('@')[0];
      }
      
      // If we still don't have a username, create one from id
      if (!userData.username) {
        userData.username = `user-${userData.id.substring(0, 6)}`;
      }
      
      // Filter out fields that don't exist in the database schema
      const { firstName, lastName, ...dbSafeUserData } = userData;
      
      // Check if user already exists
      const existingUser = await this.getUser(userData.id);
      
      if (existingUser) {
        // Update existing user
        const [user] = await db
          .update(users)
          .set({
            ...dbSafeUserData
            // Removed updatedAt as it doesn't exist in the database
          })
          .where(eq(users.id, userData.id))
          .returning();
        return user as User;
      } else {
        // Create new user
        const result = await db
          .insert(users)
          .values({
            ...dbSafeUserData,
            createdAt: new Date()
            // Removed updatedAt as it doesn't exist in the database
          })
          .returning();
        const user = Array.isArray(result) ? result[0] : result;
        return user as User;
      }
    } catch (error) {
      console.error('Error in upsertUser:', error);
      throw error;
    }
  }

  async getUsersByParentId(parentId: string): Promise<User[]> {
    try {
      const result = await db.select().from(users).where(eq(users.parentId, parentId));
      return Array.isArray(result) ? result.map(user => user as User) : [result as User];
    } catch (error) {
      console.error(`Error in getUsersByParentId for parent ID "${parentId}":`, error);
      return [];
    }
  }

  async getAllParents(): Promise<User[]> {
    try {
      const result = await db.select().from(users).where(eq(users.role, "PARENT"));
      return Array.isArray(result) ? result.map(user => user as User) : [result as User];
    } catch (error) {
      console.error('Error in getAllParents:', error);
      return [];
    }
  }

  // Learner profile operations
  async getLearnerProfile(userId: string): Promise<LearnerProfile | undefined> {
    try {
      // First try to get only the essential fields
      const result = await db.select({
        id: learnerProfiles.id,
        userId: learnerProfiles.userId,
        gradeLevel: learnerProfiles.gradeLevel,
        graph: learnerProfiles.graph,
        createdAt: learnerProfiles.createdAt
      }).from(learnerProfiles).where(eq(learnerProfiles.userId, userId));
      
      const profiles = Array.isArray(result) ? result : [result];
      
      if (profiles.length > 0) {
        // Base profile with required fields
        const profile = profiles[0];
        
        // Since we've had issues with missing columns,
        // construct a complete profile with default values for any missing fields
        const completeProfile: LearnerProfile = {
          id: profile.id,
          userId: profile.userId,
          gradeLevel: profile.gradeLevel,
          graph: profile.graph || { nodes: [], edges: [] },
          subjects: ['Math', 'Reading', 'Science'], // Default subjects
          subjectPerformance: {}, // Default empty performance data
          recommendedSubjects: [], // Default empty recommended subjects
          strugglingAreas: [], // Default empty struggling areas
          createdAt: profile.createdAt
        };
        
        // Return the profile with default values for missing fields
        return completeProfile;
      }
      
      return undefined;
    } catch (error) {
      console.error('Error in getLearnerProfile:', error);
      return undefined;
    }
  }

  async createLearnerProfile(profile: InsertLearnerProfile): Promise<LearnerProfile> {
    try {
      // Make sure we have a UUID for the id field to prevent not-null constraint violations
      const profileWithId = {
        ...profile,
        id: profile.id || crypto.randomUUID()
      };
      
      const result = await db.insert(learnerProfiles).values(profileWithId).returning();
      const learnerProfile = Array.isArray(result) ? result[0] : result;
      return learnerProfile as LearnerProfile;
    } catch (error) {
      console.error('Error in createLearnerProfile:', error);
      
      // Try again with just minimal fields if we encounter a column-related error
      if (error.message && error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('Falling back to minimal profile creation');
        
        // Create with only the essential fields
        const minimalProfile = {
          id: profile.id || crypto.randomUUID(),
          userId: profile.userId,
          gradeLevel: profile.gradeLevel,
          graph: profile.graph || { nodes: [], edges: [] }
        };
        
        const minResult = await db.insert(learnerProfiles).values(minimalProfile).returning();
        const minProfile = Array.isArray(minResult) ? minResult[0] : minResult;
        return minProfile as LearnerProfile;
      }
      
      throw error;
    }
  }

  async updateLearnerProfile(userId: string, data: Partial<InsertLearnerProfile>): Promise<LearnerProfile | undefined> {
    try {
      // First check if profile exists
      const existingProfile = await this.getLearnerProfile(userId);
      if (!existingProfile) {
        console.error(`Cannot update profile for user ${userId}: profile does not exist`);
        return undefined;
      }

      // Update with supplied data
      const result = await db
        .update(learnerProfiles)
        .set(data)
        .where(eq(learnerProfiles.userId, userId))
        .returning({
          id: learnerProfiles.id,
          userId: learnerProfiles.userId,
          gradeLevel: learnerProfiles.gradeLevel,
          graph: learnerProfiles.graph,
          subjects: learnerProfiles.subjects,
          subjectPerformance: learnerProfiles.subjectPerformance,
          recommendedSubjects: learnerProfiles.recommendedSubjects,
          strugglingAreas: learnerProfiles.strugglingAreas,
          createdAt: learnerProfiles.createdAt
        });
      
      const profiles = Array.isArray(result) ? result : [result];
      
      if (profiles.length > 0) {
        // Make sure we add default values for any missing fields
        const updatedProfile = profiles[0];
        return {
          ...updatedProfile,
          subjects: updatedProfile.subjects || existingProfile.subjects || ['Math', 'Reading', 'Science'],
          subjectPerformance: updatedProfile.subjectPerformance || existingProfile.subjectPerformance || {},
          recommendedSubjects: updatedProfile.recommendedSubjects || existingProfile.recommendedSubjects || [],
          strugglingAreas: updatedProfile.strugglingAreas || existingProfile.strugglingAreas || []
        } as LearnerProfile;
      }
      
      return undefined;
    } catch (error) {
      console.error('Error in updateLearnerProfile:', error);
      
      // Try a more basic update if we encounter database structure issues
      if (error.message && error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('Falling back to basic profile update');
        
        try {
          // Update only the core fields
          const updateData: any = {};
          
          // Only include fields that are actually being updated
          if (data.gradeLevel !== undefined) updateData.gradeLevel = data.gradeLevel;
          if (data.graph !== undefined) updateData.graph = data.graph;
          
          // Make sure we have something to update
          if (Object.keys(updateData).length === 0) {
            console.warn('No valid fields to update for userId:', userId);
            // Return the current profile instead of trying to update
            return this.getLearnerProfile(userId);
          }
          
          const updateResult = await db
            .update(learnerProfiles)
            .set(updateData)
            .where(eq(learnerProfiles.userId, userId))
            .returning();
            
          // Get the updated profile
          return this.getLearnerProfile(userId);
        } catch (fallbackError) {
          console.error('Fallback update also failed:', fallbackError);
          return undefined;
        }
      }
      
      return undefined;
    }
  }

  // Lesson operations
  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    // Make sure we have a UUID for the id field to prevent not-null constraint violations
    const lessonWithId = {
      ...lesson,
      id: crypto.randomUUID()
    };
    
    const result = await db.insert(lessons).values(lessonWithId).returning();
    const newLesson = Array.isArray(result) ? result[0] : result;
    return newLesson as Lesson;
  }

  async getLessonById(id: string): Promise<Lesson | undefined> {
    try {
      // Try to get the full lesson first
      try {
        const result = await db.select().from(lessons).where(eq(lessons.id, id));
        const lessonList = Array.isArray(result) ? result : [result];
        if (lessonList.length > 0) {
          return lessonList[0] as Lesson;
        }
      } catch (e) {
        console.log('Full lesson query failed, falling back to basic query:', e);
      }
      
      // Fallback to a more specific query to avoid "column does not exist" errors
      const result = await db
        .select({
          id: lessons.id,
          learnerId: lessons.learnerId,
          moduleId: lessons.moduleId,
          status: lessons.status,
          spec: lessons.spec,
          score: lessons.score,
          createdAt: lessons.createdAt,
          completedAt: lessons.completedAt,
        })
        .from(lessons)
        .where(eq(lessons.id, id));
      
      const lessonList = Array.isArray(result) ? result : [result];
      
      if (lessonList.length > 0) {
        // Return a lesson with default values for potentially missing columns
        const baseLesson = lessonList[0];
        const fullLesson = {
          ...baseLesson,
          enhancedSpec: null,
          subject: null, 
          category: null,
          difficulty: 'beginner' as const,
          imagePaths: null
        };
        return fullLesson as Lesson;
      }
      
      return undefined;
    } catch (error) {
      console.error('Error in getLessonById:', error);
      return undefined;
    }
  }

  async getActiveLesson(learnerId: string): Promise<Lesson | undefined> {
    try {
      // Try to get the full lesson first
      try {
        const result = await db.select()
          .from(lessons)
          .where(and(eq(lessons.learnerId, learnerId), eq(lessons.status, "ACTIVE")));
        const lessonList = Array.isArray(result) ? result : [result];
        if (lessonList.length > 0) {
          return lessonList[0] as Lesson;
        }
      } catch (e) {
        console.log('Full active lesson query failed, falling back to basic query:', e);
      }
      
      // Fallback to a more specific query to avoid "column does not exist" errors
      const result = await db
        .select({
          id: lessons.id,
          learnerId: lessons.learnerId,
          moduleId: lessons.moduleId,
          status: lessons.status,
          spec: lessons.spec,
          score: lessons.score,
          createdAt: lessons.createdAt,
          completedAt: lessons.completedAt,
        })
        .from(lessons)
        .where(and(eq(lessons.learnerId, learnerId), eq(lessons.status, "ACTIVE")));
      
      const lessonList = Array.isArray(result) ? result : [result];
      
      if (lessonList.length > 0) {
        // Return a lesson with default values for potentially missing columns
        const baseLesson = lessonList[0];
        const fullLesson = {
          ...baseLesson,
          enhancedSpec: null,
          subject: null,
          category: null,
          difficulty: 'beginner' as const,
          imagePaths: null
        };
        return fullLesson as Lesson;
      }
      
      return undefined;
    } catch (error) {
      // Log the error but don't crash
      console.error("Error in getActiveLesson:", error);
      return undefined;
    }
  }

  async getLessonHistory(learnerId: string, limit: number = 10): Promise<Lesson[]> {
    try {
      // Try to get the full lesson history first
      try {
        const result = await db
          .select()
          .from(lessons)
          .where(eq(lessons.learnerId, learnerId))
          .orderBy(desc(lessons.createdAt))
          .limit(limit);
        return Array.isArray(result) ? result.map(lesson => lesson as Lesson) : [result as Lesson];
      } catch (e) {
        console.log('Full history query failed, falling back to basic query:', e);
      }
      
      // Fallback to a more specific query to avoid "column does not exist" errors
      const result = await db
        .select({
          id: lessons.id,
          learnerId: lessons.learnerId,
          moduleId: lessons.moduleId,
          status: lessons.status,
          spec: lessons.spec,
          score: lessons.score,
          createdAt: lessons.createdAt,
          completedAt: lessons.completedAt,
        })
        .from(lessons)
        .where(eq(lessons.learnerId, learnerId))
        .orderBy(desc(lessons.createdAt))
        .limit(limit);
      
      // Add default values for potentially missing columns
      return result.map(baseLesson => ({
        ...baseLesson,
        enhancedSpec: null,
        subject: null,
        category: null,
        difficulty: 'beginner' as const,
        imagePaths: null
      })) as Lesson[];
    } catch (error) {
      console.error('Error in getLessonHistory:', error);
      return [];
    }
  }

  async updateLessonStatus(id: string, status: "QUEUED" | "ACTIVE" | "DONE", score?: number): Promise<Lesson | undefined> {
    try {
      const updateData: Partial<InsertLesson> = { status };
      
      if (status === "DONE" && score !== undefined) {
        updateData.score = score;
        updateData.completedAt = new Date();
      }
      
      // Try to update only the specific fields we know exist in the database
      try {
        const result = await db
          .update(lessons)
          .set(updateData)
          .where(eq(lessons.id, id))
          .returning({
            id: lessons.id,
            learnerId: lessons.learnerId,
            moduleId: lessons.moduleId,
            status: lessons.status,
            spec: lessons.spec,
            score: lessons.score,
            createdAt: lessons.createdAt,
            completedAt: lessons.completedAt,
          });
        
        const lessonList = Array.isArray(result) ? result : [result];
        
        if (lessonList.length > 0) {
          // Return a lesson with default values for potentially missing columns
          const baseLesson = lessonList[0];
          const fullLesson = {
            ...baseLesson,
            enhancedSpec: null,
            subject: null,
            category: null,
            difficulty: 'beginner' as const,
            imagePaths: null
          };
          return fullLesson as Lesson;
        }
      } catch (e) {
        console.error('Error updating lesson status with full returning:', e);
        
        // Fallback: Update without returning all fields
        await db
          .update(lessons)
          .set(updateData)
          .where(eq(lessons.id, id));
          
        // Fetch the updated lesson separately
        return this.getLessonById(id);
      }
      
      return undefined;
    } catch (error) {
      console.error('Error in updateLessonStatus:', error);
      return undefined;
    }
  }

  // Achievement operations
  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    // Make sure we have a UUID for the id field to prevent not-null constraint violations
    const achievementWithId = {
      ...achievement,
      id: crypto.randomUUID()
    };
    
    const result = await db.insert(achievements).values(achievementWithId).returning();
    const newAchievement = Array.isArray(result) ? result[0] : result;
    return newAchievement as Achievement;
  }

  async getAchievements(learnerId: string): Promise<Achievement[]> {
    const result = await db
      .select()
      .from(achievements)
      .where(eq(achievements.learnerId, learnerId))
      .orderBy(desc(achievements.awardedAt));
    return Array.isArray(result) ? result.map(achievement => achievement as Achievement) : [result as Achievement];
  }

  // Database sync operations
  async getSyncConfigsByParentId(parentId: string): Promise<DbSyncConfig[]> {
    const result = await db
      .select()
      .from(dbSyncConfigs)
      .where(eq(dbSyncConfigs.parentId, parentId));
    return Array.isArray(result) ? result.map(config => config as DbSyncConfig) : [result as DbSyncConfig];
  }

  async getSyncConfigById(id: string): Promise<DbSyncConfig | undefined> {
    const result = await db
      .select()
      .from(dbSyncConfigs)
      .where(eq(dbSyncConfigs.id, id));
    const configs = Array.isArray(result) ? result : [result];
    return configs.length > 0 ? configs[0] as DbSyncConfig : undefined;
  }

  async createSyncConfig(config: InsertDbSyncConfig): Promise<DbSyncConfig> {
    const result = await db
      .insert(dbSyncConfigs)
      .values(config)
      .returning();
    const configs = Array.isArray(result) ? result : [result];
    return configs[0] as DbSyncConfig;
  }

  async updateSyncConfig(id: string, data: Partial<InsertDbSyncConfig>): Promise<DbSyncConfig | undefined> {
    const result = await db
      .update(dbSyncConfigs)
      .set({ 
        ...data, 
        updatedAt: new Date() 
      })
      .where(eq(dbSyncConfigs.id, id))
      .returning();

    const configs = Array.isArray(result) ? result : [result];
    return configs.length > 0 ? configs[0] as DbSyncConfig : undefined;
  }

  async deleteSyncConfig(id: string): Promise<boolean> {
    const result = await db
      .delete(dbSyncConfigs)
      .where(eq(dbSyncConfigs.id, id))
      .returning();
    const configs = Array.isArray(result) ? result : [result];
    return configs.length > 0;
  }

  async updateSyncStatus(id: string, status: "IDLE" | "IN_PROGRESS" | "FAILED" | "COMPLETED", errorMessage?: string): Promise<DbSyncConfig | undefined> {
    let updateData: Partial<InsertDbSyncConfig> = { 
      syncStatus: status,
      updatedAt: new Date()
    };

    // Set lastSyncAt when job completes
    if (status === 'COMPLETED') {
      updateData.lastSyncAt = new Date();
    }

    // Set errorMessage when job fails
    if (status === 'FAILED' && errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    const result = await db
      .update(dbSyncConfigs)
      .set(updateData)
      .where(eq(dbSyncConfigs.id, id))
      .returning();

    const configs = Array.isArray(result) ? result : [result];
    return configs.length > 0 ? configs[0] as DbSyncConfig : undefined;
  }
  
  // Delete a user and all associated data
  async deleteUser(id: string): Promise<boolean> {
    try {
      // First, check if this is a learner and delete their profile if it exists
      const user = await this.getUser(id);
      if (!user) return false;
      
      if (user.role === "LEARNER") {
        // Delete the learner profile if it exists
        const profile = await this.getLearnerProfile(id);
        if (profile) {
          await db.delete(learnerProfiles).where(eq(learnerProfiles.userId, id));
        }
        
        // Delete any lessons associated with this learner
        await db.delete(lessons).where(eq(lessons.learnerId, id));
        
        // Delete any achievements associated with this learner
        await db.delete(achievements).where(eq(achievements.learnerId, id));
      }
      
      // Now delete the user
      try {
        const result = await db.delete(users).where(eq(users.id, id));
        return true; // If we get here without error, the deletion was successful
      } catch {
        return false;
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
