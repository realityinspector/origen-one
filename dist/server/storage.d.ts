import type { User, InsertUser, Lesson, InsertLesson, LearnerProfile, InsertLearnerProfile, Achievement, InsertAchievement } from "../shared/schema";
export interface IStorage {
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(insertUser: InsertUser): Promise<User>;
    getUsersByParentId(parentId: number): Promise<User[]>;
    getAllParents(): Promise<User[]>;
    getLearnerProfile(userId: number): Promise<LearnerProfile | undefined>;
    createLearnerProfile(profile: InsertLearnerProfile): Promise<LearnerProfile>;
    updateLearnerProfile(userId: number, data: Partial<InsertLearnerProfile>): Promise<LearnerProfile | undefined>;
    createLesson(lesson: InsertLesson): Promise<Lesson>;
    getLessonById(id: string): Promise<Lesson | undefined>;
    getActiveLesson(learnerId: number): Promise<Lesson | undefined>;
    getLessonHistory(learnerId: number, limit?: number): Promise<Lesson[]>;
    updateLessonStatus(id: string, status: "QUEUED" | "ACTIVE" | "DONE", score?: number): Promise<Lesson | undefined>;
    createAchievement(achievement: InsertAchievement): Promise<Achievement>;
    getAchievements(learnerId: number): Promise<Achievement[]>;
}
export declare class DatabaseStorage implements IStorage {
    constructor();
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(insertUser: InsertUser): Promise<User>;
    getUsersByParentId(parentId: number): Promise<User[]>;
    getAllParents(): Promise<User[]>;
    getLearnerProfile(userId: number): Promise<LearnerProfile | undefined>;
    createLearnerProfile(profile: InsertLearnerProfile): Promise<LearnerProfile>;
    updateLearnerProfile(userId: number, data: Partial<InsertLearnerProfile>): Promise<LearnerProfile | undefined>;
    createLesson(lesson: InsertLesson): Promise<Lesson>;
    getLessonById(id: string): Promise<Lesson | undefined>;
    getActiveLesson(learnerId: number): Promise<Lesson | undefined>;
    getLessonHistory(learnerId: number, limit?: number): Promise<Lesson[]>;
    updateLessonStatus(id: string, status: "QUEUED" | "ACTIVE" | "DONE", score?: number): Promise<Lesson | undefined>;
    createAchievement(achievement: InsertAchievement): Promise<Achievement>;
    getAchievements(learnerId: number): Promise<Achievement[]>;
}
export declare const storage: DatabaseStorage;
