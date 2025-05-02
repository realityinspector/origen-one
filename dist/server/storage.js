"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
const schema_1 = require("../shared/schema");
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
class DatabaseStorage {
    constructor() {
        // Initialize database connection if needed
    }
    // User operations
    async getUser(id) {
        const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
        const users_found = Array.isArray(result) ? result : [result];
        return users_found.length > 0 ? users_found[0] : undefined;
    }
    async getUserByUsername(username) {
        const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.username, username));
        const users_found = Array.isArray(result) ? result : [result];
        return users_found.length > 0 ? users_found[0] : undefined;
    }
    async createUser(insertUser) {
        const result = await db_1.db.insert(schema_1.users).values(insertUser).returning();
        const user = Array.isArray(result) ? result[0] : result;
        return user;
    }
    async getUsersByParentId(parentId) {
        const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.parentId, parentId));
        return Array.isArray(result) ? result.map(user => user) : [result];
    }
    async getAllParents() {
        const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.role, "PARENT"));
        return Array.isArray(result) ? result.map(user => user) : [result];
    }
    // Learner profile operations
    async getLearnerProfile(userId) {
        const result = await db_1.db.select().from(schema_1.learnerProfiles).where((0, drizzle_orm_1.eq)(schema_1.learnerProfiles.userId, userId));
        const profiles = Array.isArray(result) ? result : [result];
        return profiles.length > 0 ? profiles[0] : undefined;
    }
    async createLearnerProfile(profile) {
        const result = await db_1.db.insert(schema_1.learnerProfiles).values(profile).returning();
        const learnerProfile = Array.isArray(result) ? result[0] : result;
        return learnerProfile;
    }
    async updateLearnerProfile(userId, data) {
        const result = await db_1.db
            .update(schema_1.learnerProfiles)
            .set(data)
            .where((0, drizzle_orm_1.eq)(schema_1.learnerProfiles.userId, userId))
            .returning();
        const profiles = Array.isArray(result) ? result : [result];
        return profiles.length > 0 ? profiles[0] : undefined;
    }
    // Lesson operations
    async createLesson(lesson) {
        const result = await db_1.db.insert(schema_1.lessons).values(lesson).returning();
        const newLesson = Array.isArray(result) ? result[0] : result;
        return newLesson;
    }
    async getLessonById(id) {
        const result = await db_1.db.select().from(schema_1.lessons).where((0, drizzle_orm_1.eq)(schema_1.lessons.id, id));
        const lessonList = Array.isArray(result) ? result : [result];
        return lessonList.length > 0 ? lessonList[0] : undefined;
    }
    async getActiveLesson(learnerId) {
        const result = await db_1.db
            .select()
            .from(schema_1.lessons)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.lessons.learnerId, learnerId), (0, drizzle_orm_1.eq)(schema_1.lessons.status, "ACTIVE")));
        const lessonList = Array.isArray(result) ? result : [result];
        return lessonList.length > 0 ? lessonList[0] : undefined;
    }
    async getLessonHistory(learnerId, limit = 10) {
        const result = await db_1.db
            .select()
            .from(schema_1.lessons)
            .where((0, drizzle_orm_1.eq)(schema_1.lessons.learnerId, learnerId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.lessons.createdAt))
            .limit(limit);
        return Array.isArray(result) ? result.map(lesson => lesson) : [result];
    }
    async updateLessonStatus(id, status, score) {
        const updateData = { status };
        if (status === "DONE" && score !== undefined) {
            updateData.score = score;
            updateData.completedAt = new Date();
        }
        const result = await db_1.db
            .update(schema_1.lessons)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.lessons.id, id))
            .returning();
        const lessonList = Array.isArray(result) ? result : [result];
        return lessonList.length > 0 ? lessonList[0] : undefined;
    }
    // Achievement operations
    async createAchievement(achievement) {
        const result = await db_1.db.insert(schema_1.achievements).values(achievement).returning();
        const newAchievement = Array.isArray(result) ? result[0] : result;
        return newAchievement;
    }
    async getAchievements(learnerId) {
        const result = await db_1.db
            .select()
            .from(schema_1.achievements)
            .where((0, drizzle_orm_1.eq)(schema_1.achievements.learnerId, learnerId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.achievements.awardedAt));
        return Array.isArray(result) ? result.map(achievement => achievement) : [result];
    }
}
exports.DatabaseStorage = DatabaseStorage;
exports.storage = new DatabaseStorage();
//# sourceMappingURL=storage.js.map