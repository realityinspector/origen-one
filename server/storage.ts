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
    const result = await db.select().from(learnerProfiles).where(eq(learnerProfiles.userId, userId));
    const profiles = Array.isArray(result) ? result : [result];
    return profiles.length > 0 ? profiles[0] as LearnerProfile : undefined;
  }

  async createLearnerProfile(profile: InsertLearnerProfile): Promise<LearnerProfile> {
    // Make sure we have a UUID for the id field to prevent not-null constraint violations
    const profileWithId = {
      ...profile,
      id: crypto.randomUUID()
    };
    
    const result = await db.insert(learnerProfiles).values(profileWithId).returning();
    const learnerProfile = Array.isArray(result) ? result[0] : result;
    return learnerProfile as LearnerProfile;
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
    const result = await db.select().from(lessons).where(eq(lessons.id, id));
    const lessonList = Array.isArray(result) ? result : [result];
    return lessonList.length > 0 ? lessonList[0] as Lesson : undefined;
  }

  async getActiveLesson(learnerId: number): Promise<Lesson | undefined> {
    try {
      // Use a more specific query that only selects known columns to avoid "column does not exist" errors
      const result = await db
        .select({
          id: lessons.id,
          learnerId: lessons.learnerId,
          moduleId: lessons.moduleId,
          status: lessons.status,
          spec: lessons.spec,
          enhancedSpec: lessons.enhancedSpec,
          score: lessons.score,
          createdAt: lessons.createdAt,
          completedAt: lessons.completedAt
        })
        .from(lessons)
        .where(and(eq(lessons.learnerId, learnerId), eq(lessons.status, "ACTIVE")));
      
      const lessonList = Array.isArray(result) ? result : [result];
      return lessonList.length > 0 ? lessonList[0] as Lesson : undefined;
    } catch (error) {
      // Log the error but don't crash
      console.error("Error in getActiveLesson:", error);
      return undefined;
    }
  }

  async getLessonHistory(learnerId: number, limit: number = 10): Promise<Lesson[]> {
    const result = await db
      .select()
      .from(lessons)
      .where(eq(lessons.learnerId, learnerId))
      .orderBy(desc(lessons.createdAt))
      .limit(limit);
    return Array.isArray(result) ? result.map(lesson => lesson as Lesson) : [result as Lesson];
  }

  async updateLessonStatus(id: string, status: "QUEUED" | "ACTIVE" | "DONE", score?: number): Promise<Lesson | undefined> {
    const updateData: Partial<InsertLesson> = { status };
    
    if (status === "DONE" && score !== undefined) {
      updateData.score = score;
      updateData.completedAt = new Date();
    }
    
    const result = await db
      .update(lessons)
      .set(updateData)
      .where(eq(lessons.id, id))
      .returning();
    
    const lessonList = Array.isArray(result) ? result : [result];
    return lessonList.length > 0 ? lessonList[0] as Lesson : undefined;
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
