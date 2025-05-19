import type { User, InsertUser, Lesson, InsertLesson, LearnerProfile, InsertLearnerProfile, Achievement, InsertAchievement, DbSyncConfig, InsertDbSyncConfig } from "../shared/schema";
export interface UpsertUser {
    id: string;
    email?: string;
    username?: string;
    name?: string;
    role?: "ADMIN" | "PARENT" | "LEARNER";
}
export interface IStorage {
    getUser(id: string): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(insertUser: InsertUser): Promise<User>;
    getUsersByParentId(parentId: string | number): Promise<User[]>;
    getAllParents(): Promise<User[]>;
    getAllLearners(): Promise<User[]>;
    upsertUser(userData: UpsertUser): Promise<User>;
    getLearnerProfile(userId: string | null | undefined): Promise<LearnerProfile | undefined>;
    createLearnerProfile(profile: InsertLearnerProfile): Promise<LearnerProfile>;
    updateLearnerProfile(userId: string, data: Partial<InsertLearnerProfile>): Promise<LearnerProfile | undefined>;
    createLesson(lesson: InsertLesson): Promise<Lesson>;
    getLessonById(id: string): Promise<Lesson | undefined>;
    getActiveLesson(learnerId: string): Promise<Lesson | undefined>;
    getLearnerLessons(learnerId: string): Promise<Lesson[]>;
    getLessonHistory(learnerId: string, limit?: number): Promise<Lesson[]>;
    updateLessonStatus(id: string, status: "QUEUED" | "ACTIVE" | "DONE", score?: number): Promise<Lesson | undefined>;
    createAchievement(achievement: InsertAchievement): Promise<Achievement>;
    getAchievements(learnerId: string): Promise<Achievement[]>;
    getSyncConfigsByParentId(parentId: string): Promise<DbSyncConfig[]>;
    getSyncConfigById(id: string): Promise<DbSyncConfig | undefined>;
    createSyncConfig(config: InsertDbSyncConfig): Promise<DbSyncConfig>;
    updateSyncConfig(id: string, data: Partial<InsertDbSyncConfig>): Promise<DbSyncConfig | undefined>;
    deleteSyncConfig(id: string): Promise<boolean>;
    updateSyncStatus(id: string, status: "IDLE" | "IN_PROGRESS" | "FAILED" | "COMPLETED", errorMessage?: string): Promise<DbSyncConfig | undefined>;
}
export declare class DatabaseStorage implements IStorage {
    constructor();
    getUser(id: string): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(insertUser: InsertUser): Promise<User>;
    upsertUser(userData: UpsertUser): Promise<User>;
    getUsersByParentId(parentId: string | number): Promise<User[]>;
    getAllParents(): Promise<User[]>;
    getAllLearners(): Promise<User[]>;
    getLearnerProfile(userId: string | number | null | undefined): Promise<LearnerProfile | undefined>;
    createLearnerProfile(profile: Omit<InsertLearnerProfile, "userId"> & {
        userId: string | number;
    }): Promise<LearnerProfile>;
    updateLearnerProfile(userId: string | number, data: Partial<InsertLearnerProfile>): Promise<LearnerProfile | undefined>;
    createLesson(lesson: InsertLesson): Promise<Lesson>;
    getLessonById(id: string): Promise<Lesson | undefined>;
    getActiveLesson(learnerId: string | number): Promise<Lesson | undefined>;
    getLearnerLessons(learnerId: string | number): Promise<Lesson[]>;
    getLessonHistory(learnerId: string | number | number | number | number | number | number | number | number | number | number | number | number | number | number, limit?: number): Promise<Lesson[]>;
    updateLessonStatus(id: string, status: "QUEUED" | "ACTIVE" | "DONE", score?: number): Promise<Lesson | undefined>;
    createAchievement(achievement: InsertAchievement): Promise<Achievement>;
    getAchievements(learnerId: string | number): Promise<Achievement[]>;
    getSyncConfigsByParentId(parentId: string): Promise<DbSyncConfig[]>;
    getSyncConfigById(id: string): Promise<DbSyncConfig | undefined>;
    createSyncConfig(config: InsertDbSyncConfig): Promise<DbSyncConfig>;
    updateSyncConfig(id: string, data: Partial<InsertDbSyncConfig>): Promise<DbSyncConfig | undefined>;
    deleteSyncConfig(id: string): Promise<boolean>;
    updateSyncStatus(id: string, status: "IDLE" | "IN_PROGRESS" | "FAILED" | "COMPLETED", errorMessage?: string): Promise<DbSyncConfig | undefined>;
    deleteUser(id: string): Promise<boolean>;
}
export declare const storage: DatabaseStorage;
