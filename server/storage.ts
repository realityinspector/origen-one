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

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getUsersByParentId(parentId: number): Promise<User[]>;
  getAllParents(): Promise<User[]>;
  
  // Learner profile operations
  getLearnerProfile(userId: number): Promise<LearnerProfile | undefined>;
  createLearnerProfile(profile: InsertLearnerProfile): Promise<LearnerProfile>;
  updateLearnerProfile(userId: number, data: Partial<InsertLearnerProfile>): Promise<LearnerProfile | undefined>;
  
  // Lesson operations
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  getLessonById(id: string): Promise<Lesson | undefined>;
  getActiveLesson(learnerId: number): Promise<Lesson | undefined>;
  getLessonHistory(learnerId: number, limit?: number): Promise<Lesson[]>;
  updateLessonStatus(id: string, status: "QUEUED" | "ACTIVE" | "DONE", score?: number): Promise<Lesson | undefined>;
  
  // Achievement operations
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getAchievements(learnerId: number): Promise<Achievement[]>;
  
  // Database sync operations
  getSyncConfigsByParentId(parentId: number): Promise<DbSyncConfig[]>;
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
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    const users_found = Array.isArray(result) ? result : [result];
    return users_found.length > 0 ? users_found[0] as User : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      return await withRetry(async () => {
        const result = await db.select().from(users).where(eq(users.username, username));
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

  async getUsersByParentId(parentId: number): Promise<User[]> {
    const result = await db.select().from(users).where(eq(users.parentId, parentId));
    return Array.isArray(result) ? result.map(user => user as User) : [result as User];
  }

  async getAllParents(): Promise<User[]> {
    const result = await db.select().from(users).where(eq(users.role, "PARENT"));
    return Array.isArray(result) ? result.map(user => user as User) : [result as User];
  }

  // Learner profile operations
  async getLearnerProfile(userId: number): Promise<LearnerProfile | undefined> {
    try {
      // Use more specific query to avoid 'column does not exist' errors
      const result = await db.select({
        id: learnerProfiles.id,
        userId: learnerProfiles.userId,
        gradeLevel: learnerProfiles.gradeLevel,
        graph: learnerProfiles.graph,
        subjects: learnerProfiles.subjects,
        subjectPerformance: learnerProfiles.subjectPerformance,
        recommendedSubjects: learnerProfiles.recommendedSubjects,
        strugglingAreas: learnerProfiles.strugglingAreas,
        createdAt: learnerProfiles.createdAt
      }).from(learnerProfiles).where(eq(learnerProfiles.userId, userId));
      
      const profiles = Array.isArray(result) ? result : [result];
      
      if (profiles.length > 0) {
        // Add default values for potentially missing columns
        const profile = profiles[0];
        return {
          ...profile,
          subjects: profile.subjects || ['Math', 'Reading', 'Science'],
          subjectPerformance: profile.subjectPerformance || {},
          recommendedSubjects: profile.recommendedSubjects || [],
          strugglingAreas: profile.strugglingAreas || []
        } as LearnerProfile;
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

  async updateLearnerProfile(userId: number, data: Partial<InsertLearnerProfile>): Promise<LearnerProfile | undefined> {
    const result = await db
      .update(learnerProfiles)
      .set(data)
      .where(eq(learnerProfiles.userId, userId))
      .returning();
    const profiles = Array.isArray(result) ? result : [result];
    return profiles.length > 0 ? profiles[0] as LearnerProfile : undefined;
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

  async getActiveLesson(learnerId: number): Promise<Lesson | undefined> {
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

  async getLessonHistory(learnerId: number, limit: number = 10): Promise<Lesson[]> {
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

  async getAchievements(learnerId: number): Promise<Achievement[]> {
    const result = await db
      .select()
      .from(achievements)
      .where(eq(achievements.learnerId, learnerId))
      .orderBy(desc(achievements.awardedAt));
    return Array.isArray(result) ? result.map(achievement => achievement as Achievement) : [result as Achievement];
  }

  // Database sync operations
  async getSyncConfigsByParentId(parentId: number): Promise<DbSyncConfig[]> {
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
  async deleteUser(id: number): Promise<boolean> {
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
