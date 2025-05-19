"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
const schema_1 = require("../shared/schema");
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
class DatabaseStorage {
    constructor() {
        // Initialize database connection if needed
    }
    // User operations
    async getUser(id) {
        try {
            // Use specific fields that exist in the database
            const result = await db_1.db
                .select({
                id: schema_1.users.id,
                email: schema_1.users.email,
                username: schema_1.users.username,
                name: schema_1.users.name,
                role: schema_1.users.role,
                password: schema_1.users.password,
                parentId: schema_1.users.parentId,
                createdAt: schema_1.users.createdAt,
                // Don't select updatedAt or profileImageUrl as they don't exist in the database
            })
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
            const users_found = Array.isArray(result) ? result : [result];
            return users_found.length > 0 ? users_found[0] : undefined;
        }
        catch (error) {
            console.error(`Error in getUser for id "${id}":`, error);
            return undefined;
        }
    }
    async getUserByUsername(username) {
        try {
            return await (0, db_1.withRetry)(async () => {
                // Log the SQL query being executed for debugging
                console.log(`Looking for user with username: ${username}`);
                // Use specific fields that exist in the database
                const result = await db_1.db
                    .select({
                    id: schema_1.users.id,
                    email: schema_1.users.email,
                    username: schema_1.users.username,
                    name: schema_1.users.name,
                    role: schema_1.users.role,
                    password: schema_1.users.password,
                    parentId: schema_1.users.parentId,
                    createdAt: schema_1.users.createdAt,
                    // Don't select updatedAt or profileImageUrl as they don't exist in the database
                })
                    .from(schema_1.users)
                    .where((0, drizzle_orm_1.eq)(schema_1.users.username, username));
                const users_found = Array.isArray(result) ? result : [result];
                return users_found.length > 0 ? users_found[0] : undefined;
            });
        }
        catch (error) {
            console.error(`Error in getUserByUsername for username "${username}":`, error);
            // Check database connection when an error occurs
            await (0, db_1.checkDatabaseConnection)();
            // Return undefined on error after logging it
            return undefined;
        }
    }
    async createUser(insertUser) {
        const result = await db_1.db.insert(schema_1.users).values(insertUser).returning();
        const user = Array.isArray(result) ? result[0] : result;
        return user;
    }
    async upsertUser(userData) {
        try {
            // Set default role if not provided
            if (!userData.role) {
                userData.role = "LEARNER";
            }
            // Make sure name is set
            if (!userData.name) {
                userData.name = userData.username || userData.email?.split('@')[0] || 'New User';
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
            // Use only the fields that exist in the database schema
            const dbSafeUserData = {
                id: userData.id,
                email: userData.email,
                username: userData.username,
                name: userData.name,
                role: userData.role
            };
            // Check if user already exists
            const existingUser = await this.getUser(userData.id);
            if (existingUser) {
                // Update existing user
                const [user] = await db_1.db
                    .update(schema_1.users)
                    .set({
                    ...dbSafeUserData
                    // Removed updatedAt as it doesn't exist in the database
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.users.id, userData.id))
                    .returning();
                return user;
            }
            else {
                // Create new user
                const result = await db_1.db
                    .insert(schema_1.users)
                    .values({
                    ...dbSafeUserData,
                    createdAt: new Date()
                    // Removed updatedAt as it doesn't exist in the database
                })
                    .returning();
                const user = Array.isArray(result) ? result[0] : result;
                return user;
            }
        }
        catch (error) {
            console.error('Error in upsertUser:', error);
            throw error;
        }
    }
    async getUsersByParentId(parentId) {
        try {
            // Safely convert parentId to number
            let parentIdNum;
            if (typeof parentId === 'number') {
                parentIdNum = parentId;
            }
            else if (typeof parentId === 'string') {
                parentIdNum = parseInt(parentId, 10);
                if (isNaN(parentIdNum)) {
                    console.error(`Invalid parentId format: "${parentId}" is not a valid number`);
                    return [];
                }
            }
            else {
                console.error(`Invalid parentId type: ${typeof parentId}`);
                return [];
            }
            console.log(`Querying for learners with parentId: ${parentIdNum} (original value: ${parentId})`);
            const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.parentId, parentIdNum));
            return Array.isArray(result) ? result.map(user => user) : [result];
        }
        catch (error) {
            console.error(`Error in getUsersByParentId for parent ID "${parentId}":`, error);
            return [];
        }
    }
    async getAllParents() {
        try {
            const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.role, "PARENT"));
            return Array.isArray(result) ? result.map(user => user) : [result];
        }
        catch (error) {
            console.error('Error in getAllParents:', error);
            return [];
        }
    }
    async getAllLearners() {
        try {
            const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.role, "LEARNER"));
            return Array.isArray(result) ? result.map(user => user) : [result];
        }
        catch (error) {
            console.error('Error in getAllLearners:', error);
            return [];
        }
    }
    // Learner profile operations
    async getLearnerProfile(userId) {
        try {
            if (!userId) {
                console.error(`Invalid user ID: ${userId}`);
                return undefined;
            }
            console.log(`Searching for learner profile with userId: ${userId} (type: ${typeof userId})`);
            // Use raw SQL via the pool to avoid type issues with ORM
            const result = await db_1.pool.query('SELECT * FROM learner_profiles WHERE user_id = $1', [userId]);
            if (result.rows.length > 0) {
                // Get the row from database
                const row = result.rows[0];
                // Parse JSON fields safely
                let graph = { nodes: [], edges: [] };
                let subjects = ['Math', 'Reading', 'Science'];
                let subjectPerformance = {};
                let recommendedSubjects = [];
                let strugglingAreas = [];
                try {
                    if (row.graph) {
                        graph = typeof row.graph === 'string' ? JSON.parse(row.graph) : row.graph;
                    }
                    if (row.subjects) {
                        subjects = typeof row.subjects === 'string' ? JSON.parse(row.subjects) : row.subjects;
                    }
                    if (row.subject_performance) {
                        subjectPerformance = typeof row.subject_performance === 'string'
                            ? JSON.parse(row.subject_performance)
                            : row.subject_performance;
                    }
                    if (row.recommended_subjects) {
                        recommendedSubjects = typeof row.recommended_subjects === 'string'
                            ? JSON.parse(row.recommended_subjects)
                            : row.recommended_subjects;
                    }
                    if (row.struggling_areas) {
                        strugglingAreas = typeof row.struggling_areas === 'string'
                            ? JSON.parse(row.struggling_areas)
                            : row.struggling_areas;
                    }
                }
                catch (err) {
                    console.error('Error parsing learner profile JSON fields:', err);
                }
                // Construct a complete profile with data from the row
                const completeProfile = {
                    id: row.id,
                    userId: row.user_id,
                    gradeLevel: row.grade_level,
                    graph,
                    subjects,
                    subjectPerformance,
                    recommendedSubjects,
                    strugglingAreas,
                    createdAt: row.created_at
                };
                console.log('Successfully retrieved learner profile:', completeProfile);
                return completeProfile;
            }
            console.log(`No learner profile found for user ID: ${userId}`);
            return undefined;
        }
        catch (error) {
            console.error('Error in getLearnerProfile:', error);
            return undefined;
        }
    }
    async createLearnerProfile(profile) {
        try {
            // Make sure we have a UUID for the id field to prevent not-null constraint violations
            const profileWithId = {
                ...profile,
                id: profile.id || crypto_1.default.randomUUID(),
                userId: typeof profile.userId === "string" ? Number(profile.userId) : profile.userId
            };
            const result = await db_1.db.insert(schema_1.learnerProfiles).values(profileWithId).returning();
            const learnerProfile = Array.isArray(result) ? result[0] : result;
            return learnerProfile;
        }
        catch (error) {
            console.error('Error in createLearnerProfile:', error);
            // Try again with just minimal fields if we encounter a column-related error
            if (error.message && error.message.includes('column') && error.message.includes('does not exist')) {
                console.log('Falling back to minimal profile creation');
                // Create with only the essential fields
                const minimalProfile = {
                    id: profile.id || crypto_1.default.randomUUID(),
                    userId: typeof profile.userId === 'string' ? Number(profile.userId) : profile.userId,
                    gradeLevel: profile.gradeLevel,
                    graph: profile.graph || { nodes: [], edges: [] }
                };
                const minResult = await db_1.db.insert(schema_1.learnerProfiles).values(minimalProfile).returning();
                const minProfile = Array.isArray(minResult) ? minResult[0] : minResult;
                return minProfile;
            }
            throw error;
        }
    }
    async updateLearnerProfile(userId, data) {
        try {
            // Convert userId to integer for database comparison (as the column is INTEGER type)
            const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
            if (isNaN(userIdNum)) {
                console.error(`Invalid user ID for update: ${userId}`);
                return undefined;
            }
            console.log(`Updating learner profile for user ID: ${userIdNum}, data:`, data);
            // Use direct SQL for profile update to bypass type issues
            // First check if profile exists
            const checkQuery = `SELECT * FROM learner_profiles WHERE user_id = $1`;
            const checkResult = await db_1.pool.query(checkQuery, [userIdNum]);
            if (checkResult.rowCount === 0) {
                console.error(`Cannot update profile for user ${userId}: profile does not exist`);
                return undefined;
            }
            const existingProfileRow = checkResult.rows[0];
            // Build SET statements for the update query
            const setStatements = [];
            const queryParams = [userIdNum]; // userId is always $1
            let paramCounter = 2;
            // Process each field that can be updated
            if (data.gradeLevel !== undefined) {
                setStatements.push(`grade_level = $${paramCounter}`);
                queryParams.push(data.gradeLevel);
                paramCounter++;
            }
            if (data.graph !== undefined) {
                setStatements.push(`graph = $${paramCounter}`);
                queryParams.push(JSON.stringify(data.graph));
                paramCounter++;
            }
            if (data.subjects !== undefined) {
                setStatements.push(`subjects = $${paramCounter}`);
                queryParams.push(JSON.stringify(data.subjects));
                paramCounter++;
            }
            if (data.subjectPerformance !== undefined) {
                setStatements.push(`subject_performance = $${paramCounter}`);
                queryParams.push(JSON.stringify(data.subjectPerformance));
                paramCounter++;
            }
            if (data.recommendedSubjects !== undefined) {
                setStatements.push(`recommended_subjects = $${paramCounter}`);
                queryParams.push(JSON.stringify(data.recommendedSubjects));
                paramCounter++;
            }
            if (data.strugglingAreas !== undefined) {
                setStatements.push(`struggling_areas = $${paramCounter}`);
                queryParams.push(JSON.stringify(data.strugglingAreas));
                paramCounter++;
            }
            // If we have nothing to update, just return the existing profile
            if (setStatements.length === 0) {
                console.log("No fields to update, returning existing profile");
                return this.getLearnerProfile(userIdNum);
            }
            // Create and execute the update query
            const updateQuery = `
        UPDATE learner_profiles
        SET ${setStatements.join(', ')}
        WHERE user_id = $1
        RETURNING *
      `;
            console.log('Executing update query:', updateQuery);
            const updateResult = await db_1.pool.query(updateQuery, queryParams);
            if (updateResult.rowCount > 0) {
                // Convert database row to expected profile format
                const updatedRow = updateResult.rows[0];
                // Parse JSON fields safely
                let graph = { nodes: [], edges: [] };
                let subjects = ['Math', 'Reading', 'Science'];
                let subjectPerformance = {};
                let recommendedSubjects = [];
                let strugglingAreas = [];
                try {
                    if (updatedRow.graph) {
                        graph = typeof updatedRow.graph === 'string' ? JSON.parse(updatedRow.graph) : updatedRow.graph;
                    }
                    if (updatedRow.subjects) {
                        subjects = typeof updatedRow.subjects === 'string' ? JSON.parse(updatedRow.subjects) : updatedRow.subjects;
                    }
                    if (updatedRow.subject_performance) {
                        subjectPerformance = typeof updatedRow.subject_performance === 'string'
                            ? JSON.parse(updatedRow.subject_performance)
                            : updatedRow.subject_performance;
                    }
                    if (updatedRow.recommended_subjects) {
                        recommendedSubjects = typeof updatedRow.recommended_subjects === 'string'
                            ? JSON.parse(updatedRow.recommended_subjects)
                            : updatedRow.recommended_subjects;
                    }
                    if (updatedRow.struggling_areas) {
                        strugglingAreas = typeof updatedRow.struggling_areas === 'string'
                            ? JSON.parse(updatedRow.struggling_areas)
                            : updatedRow.struggling_areas;
                    }
                }
                catch (err) {
                    console.error('Error parsing JSON fields:', err);
                }
                const completeProfile = {
                    id: updatedRow.id,
                    userId: updatedRow.user_id,
                    gradeLevel: updatedRow.grade_level,
                    graph,
                    subjects,
                    subjectPerformance,
                    recommendedSubjects,
                    strugglingAreas,
                    createdAt: updatedRow.created_at
                };
                console.log('Profile updated successfully:', completeProfile);
                return completeProfile;
            }
            return undefined;
        }
        catch (error) {
            console.error('Error in updateLearnerProfile:', error);
            return undefined;
        }
    }
    // Lesson operations
    async createLesson(lesson) {
        // Make sure we have a UUID for the id field to prevent not-null constraint violations
        const lessonWithId = {
            ...lesson,
            id: crypto_1.default.randomUUID()
        };
        const result = await db_1.db.insert(schema_1.lessons).values(lessonWithId).returning();
        const newLesson = Array.isArray(result) ? result[0] : result;
        return newLesson;
    }
    async getLessonById(id) {
        try {
            // Try to get the full lesson first
            try {
                const result = await db_1.db.select().from(schema_1.lessons).where((0, drizzle_orm_1.eq)(schema_1.lessons.id, id));
                const lessonList = Array.isArray(result) ? result : [result];
                if (lessonList.length > 0) {
                    return lessonList[0];
                }
            }
            catch (e) {
                console.log('Full lesson query failed, falling back to basic query:', e);
            }
            // Fallback to a more specific query to avoid "column does not exist" errors
            const result = await db_1.db
                .select({
                id: schema_1.lessons.id,
                learnerId: schema_1.lessons.learnerId,
                moduleId: schema_1.lessons.moduleId,
                status: schema_1.lessons.status,
                spec: schema_1.lessons.spec,
                score: schema_1.lessons.score,
                createdAt: schema_1.lessons.createdAt,
                completedAt: schema_1.lessons.completedAt,
            })
                .from(schema_1.lessons)
                .where((0, drizzle_orm_1.eq)(schema_1.lessons.id, id));
            const lessonList = Array.isArray(result) ? result : [result];
            if (lessonList.length > 0) {
                // Return a lesson with default values for potentially missing columns
                const baseLesson = lessonList[0];
                const fullLesson = {
                    ...baseLesson,
                    enhancedSpec: null,
                    subject: null,
                    category: null,
                    difficulty: 'beginner',
                    imagePaths: null
                };
                return fullLesson;
            }
            return undefined;
        }
        catch (error) {
            console.error('Error in getLessonById:', error);
            return undefined;
        }
    }
    async getActiveLesson(learnerId) {
        try {
            // Try to get the full lesson first
            try {
                const result = await db_1.db.select()
                    .from(schema_1.lessons)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.lessons.learnerId, Number(Number(learnerId))), (0, drizzle_orm_1.eq)(schema_1.lessons.status, "ACTIVE")));
                const lessonList = Array.isArray(result) ? result : [result];
                if (lessonList.length > 0) {
                    return lessonList[0];
                }
            }
            catch (e) {
                console.log('Full active lesson query failed, falling back to basic query:', e);
            }
            // Fallback to a more specific query to avoid "column does not exist" errors
            const result = await db_1.db
                .select({
                id: schema_1.lessons.id,
                learnerId: schema_1.lessons.learnerId,
                moduleId: schema_1.lessons.moduleId,
                status: schema_1.lessons.status,
                spec: schema_1.lessons.spec,
                score: schema_1.lessons.score,
                createdAt: schema_1.lessons.createdAt,
                completedAt: schema_1.lessons.completedAt,
            })
                .from(schema_1.lessons)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.lessons.learnerId, Number(Number(learnerId))), (0, drizzle_orm_1.eq)(schema_1.lessons.status, "ACTIVE")));
            const lessonList = Array.isArray(result) ? result : [result];
            if (lessonList.length > 0) {
                // Return a lesson with default values for potentially missing columns
                const baseLesson = lessonList[0];
                const fullLesson = {
                    ...baseLesson,
                    enhancedSpec: null,
                    subject: null,
                    category: null,
                    difficulty: 'beginner',
                    imagePaths: null
                };
                return fullLesson;
            }
            return undefined;
        }
        catch (error) {
            // Log the error but don't crash
            console.error("Error in getActiveLesson:", error);
            return undefined;
        }
    }
    async getLearnerLessons(learnerId) {
        try {
            const learnerIdNum = typeof learnerId === 'string' ? parseInt(learnerId) : learnerId;
            if (isNaN(learnerIdNum)) {
                console.error(`Invalid learner ID: ${learnerId}`);
                return [];
            }
            // Get all lessons for a learner (used for determining previous lesson subjects)
            const result = await db_1.db
                .select()
                .from(schema_1.lessons)
                .where((0, drizzle_orm_1.eq)(schema_1.lessons.learnerId, Number(Number(learnerIdNum))))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.lessons.createdAt));
            return Array.isArray(result) ? result.map(lesson => lesson) : [result];
        }
        catch (error) {
            console.error('Error in getLearnerLessons:', error);
            return [];
        }
    }
    async getLessonHistory(learnerId, limit = 10) {
        try {
            // Try to get the full lesson history first
            try {
                const result = await db_1.db
                    .select()
                    .from(schema_1.lessons)
                    .where((0, drizzle_orm_1.eq)(schema_1.lessons.learnerId, Number(Number(learnerId))))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.lessons.createdAt))
                    .limit(limit);
                return Array.isArray(result) ? result.map(lesson => lesson) : [result];
            }
            catch (e) {
                console.log('Full history query failed, falling back to basic query:', e);
            }
            // Fallback to a more specific query to avoid "column does not exist" errors
            const result = await db_1.db
                .select({
                id: schema_1.lessons.id,
                learnerId: schema_1.lessons.learnerId,
                moduleId: schema_1.lessons.moduleId,
                status: schema_1.lessons.status,
                subject: schema_1.lessons.subject,
                category: schema_1.lessons.category,
                difficulty: schema_1.lessons.difficulty,
                spec: schema_1.lessons.spec,
                enhancedSpec: schema_1.lessons.enhancedSpec,
                imagePaths: schema_1.lessons.imagePaths,
                score: schema_1.lessons.score,
                createdAt: schema_1.lessons.createdAt,
                completedAt: schema_1.lessons.completedAt,
            })
                .from(schema_1.lessons)
                .where((0, drizzle_orm_1.eq)(schema_1.lessons.learnerId, Number(Number(learnerId))))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.lessons.createdAt))
                .limit(limit);
            // Add default values for potentially missing columns
            return result.map(baseLesson => ({
                ...baseLesson,
                enhancedSpec: baseLesson.enhancedSpec || null,
                subject: baseLesson.subject || null,
                category: baseLesson.category || null,
                difficulty: baseLesson.difficulty || 'beginner',
                imagePaths: baseLesson.imagePaths || null
            }));
        }
        catch (error) {
            console.error('Error in getLessonHistory:', error);
            return [];
        }
    }
    async updateLessonStatus(id, status, score) {
        try {
            const updateData = { status };
            if (status === "DONE" && score !== undefined) {
                updateData.score = score;
                updateData.completedAt = new Date();
            }
            // Try to update only the specific fields we know exist in the database
            try {
                const result = await db_1.db
                    .update(schema_1.lessons)
                    .set(updateData)
                    .where((0, drizzle_orm_1.eq)(schema_1.lessons.id, id))
                    .returning({
                    id: schema_1.lessons.id,
                    learnerId: schema_1.lessons.learnerId,
                    moduleId: schema_1.lessons.moduleId,
                    status: schema_1.lessons.status,
                    spec: schema_1.lessons.spec,
                    score: schema_1.lessons.score,
                    createdAt: schema_1.lessons.createdAt,
                    completedAt: schema_1.lessons.completedAt,
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
                        difficulty: 'beginner',
                        imagePaths: null
                    };
                    return fullLesson;
                }
            }
            catch (e) {
                console.error('Error updating lesson status with full returning:', e);
                // Fallback: Update without returning all fields
                await db_1.db
                    .update(schema_1.lessons)
                    .set(updateData)
                    .where((0, drizzle_orm_1.eq)(schema_1.lessons.id, id));
                // Fetch the updated lesson separately
                return this.getLessonById(id);
            }
            return undefined;
        }
        catch (error) {
            console.error('Error in updateLessonStatus:', error);
            return undefined;
        }
    }
    // Achievement operations
    async createAchievement(achievement) {
        // Make sure we have a UUID for the id field to prevent not-null constraint violations
        const achievementWithId = {
            ...achievement,
            id: crypto_1.default.randomUUID()
        };
        const result = await db_1.db.insert(schema_1.achievements).values(achievementWithId).returning();
        const newAchievement = Array.isArray(result) ? result[0] : result;
        return newAchievement;
    }
    async getAchievements(learnerId) {
        const result = await db_1.db
            .select()
            .from(schema_1.achievements)
            .where((0, drizzle_orm_1.eq)(schema_1.achievements.learnerId, learnerId.toString()))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.achievements.awardedAt));
        return Array.isArray(result) ? result.map(achievement => achievement) : [result];
    }
    // Database sync operations
    async getSyncConfigsByParentId(parentId) {
        const result = await db_1.db
            .select()
            .from(schema_1.dbSyncConfigs)
            .where((0, drizzle_orm_1.eq)(schema_1.dbSyncConfigs.parentId, parentId.toString()));
        return Array.isArray(result) ? result.map(config => config) : [result];
    }
    async getSyncConfigById(id) {
        const result = await db_1.db
            .select()
            .from(schema_1.dbSyncConfigs)
            .where((0, drizzle_orm_1.eq)(schema_1.dbSyncConfigs.id, id));
        const configs = Array.isArray(result) ? result : [result];
        return configs.length > 0 ? configs[0] : undefined;
    }
    async createSyncConfig(config) {
        const result = await db_1.db
            .insert(schema_1.dbSyncConfigs)
            .values(config)
            .returning();
        const configs = Array.isArray(result) ? result : [result];
        return configs[0];
    }
    async updateSyncConfig(id, data) {
        const result = await db_1.db
            .update(schema_1.dbSyncConfigs)
            .set({
            ...data,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.dbSyncConfigs.id, id))
            .returning();
        const configs = Array.isArray(result) ? result : [result];
        return configs.length > 0 ? configs[0] : undefined;
    }
    async deleteSyncConfig(id) {
        const result = await db_1.db
            .delete(schema_1.dbSyncConfigs)
            .where((0, drizzle_orm_1.eq)(schema_1.dbSyncConfigs.id, id))
            .returning();
        const configs = Array.isArray(result) ? result : [result];
        return configs.length > 0;
    }
    async updateSyncStatus(id, status, errorMessage) {
        let updateData = {
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
        const result = await db_1.db
            .update(schema_1.dbSyncConfigs)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema_1.dbSyncConfigs.id, id))
            .returning();
        const configs = Array.isArray(result) ? result : [result];
        return configs.length > 0 ? configs[0] : undefined;
    }
    // Delete a user and all associated data
    async deleteUser(id) {
        try {
            // First, check if this is a learner and delete their profile if it exists
            const user = await this.getUser(id);
            if (!user)
                return false;
            if (user.role === "LEARNER") {
                // Delete the learner profile if it exists
                const profile = await this.getLearnerProfile(id);
                if (profile) {
                    await db_1.db.delete(schema_1.learnerProfiles).where((0, drizzle_orm_1.eq)(schema_1.learnerProfiles.userId, Number(Number(id))));
                }
                // Delete any lessons associated with this learner
                await db_1.db.delete(schema_1.lessons).where((0, drizzle_orm_1.eq)(schema_1.lessons.learnerId, Number(Number(id))));
                // Delete any achievements associated with this learner
                await db_1.db.delete(schema_1.achievements).where((0, drizzle_orm_1.eq)(schema_1.achievements.learnerId, id.toString()));
            }
            // Now delete the user
            try {
                const result = await db_1.db.delete(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
                return true; // If we get here without error, the deletion was successful
            }
            catch {
                return false;
            }
        }
        catch (error) {
            console.error('Error deleting user:', error);
            return false;
        }
    }
}
exports.DatabaseStorage = DatabaseStorage;
exports.storage = new DatabaseStorage();
// Helper function to convert userId to number, returns -1 if invalid
function toNumber(userId) {
    if (userId === null || userId === undefined) {
        return -1;
    }
    const userIdNum = typeof userId === 'string' ? parseInt(userId) : userId;
    if (isNaN(userIdNum)) {
        return -1;
    }
    return userIdNum;
}
//# sourceMappingURL=storage.js.map