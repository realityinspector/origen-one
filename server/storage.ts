import { users, lessons, learnerProfiles, achievements } from "../shared/schema";
import type { User, InsertUser, Lesson, InsertLesson, LearnerProfile, InsertLearnerProfile, Achievement, InsertAchievement } from "../shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

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
  
  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      tableName: 'session',
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    const users_found = Array.isArray(result) ? result : [result];
    return users_found.length > 0 ? users_found[0] as User : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    const users_found = Array.isArray(result) ? result : [result];
    return users_found.length > 0 ? users_found[0] as User : undefined;
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
    const result = await db.insert(learnerProfiles).values(profile).returning();
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
    const result = await db.insert(lessons).values(lesson).returning();
    const newLesson = Array.isArray(result) ? result[0] : result;
    return newLesson as Lesson;
  }

  async getLessonById(id: string): Promise<Lesson | undefined> {
    const result = await db.select().from(lessons).where(eq(lessons.id, id));
    const lessonList = Array.isArray(result) ? result : [result];
    return lessonList.length > 0 ? lessonList[0] as Lesson : undefined;
  }

  async getActiveLesson(learnerId: number): Promise<Lesson | undefined> {
    const result = await db
      .select()
      .from(lessons)
      .where(and(eq(lessons.learnerId, learnerId), eq(lessons.status, "ACTIVE")));
    const lessonList = Array.isArray(result) ? result : [result];
    return lessonList.length > 0 ? lessonList[0] as Lesson : undefined;
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
    const result = await db.insert(achievements).values(achievement).returning();
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
}

export const storage = new DatabaseStorage();
