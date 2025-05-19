"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbSyncConfigsRelations = exports.dbSyncConfigs = exports.achievementsRelations = exports.achievements = exports.lessonsRelations = exports.lessons = exports.learnerProfilesRelations = exports.learnerProfiles = exports.usersRelations = exports.users = exports.sessions = exports.syncStatusEnum = exports.lessonStatusEnum = exports.userRoleEnum = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
// Enums
exports.userRoleEnum = (0, pg_core_1.pgEnum)("user_role", ["ADMIN", "PARENT", "LEARNER"]);
exports.lessonStatusEnum = (0, pg_core_1.pgEnum)("lesson_status", ["QUEUED", "ACTIVE", "DONE"]);
exports.syncStatusEnum = (0, pg_core_1.pgEnum)("sync_status", ["IDLE", "IN_PROGRESS", "FAILED", "COMPLETED"]);
// Session storage table.
// This table is mandatory for Replit Auth
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.varchar)("sid").primaryKey(),
    sess: (0, pg_core_1.jsonb)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
}, (table) => [(0, pg_core_1.index)("IDX_session_expire").on(table.expire)]);
// Users table
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(), // Store ID as integer with auto-increment
    email: (0, pg_core_1.varchar)("email").unique(),
    username: (0, pg_core_1.text)("username").unique(),
    name: (0, pg_core_1.text)("name"),
    role: (0, exports.userRoleEnum)("role").default("LEARNER"),
    password: (0, pg_core_1.text)("password"), // For non-Replit auth users
    parentId: (0, pg_core_1.integer)("parent_id").references(() => exports.users.id, { onDelete: "cascade" }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ one, many }) => ({
    parent: one(exports.users, {
        fields: [exports.users.parentId],
        references: [exports.users.id],
    }),
    children: many(exports.users),
    learnerProfile: one(exports.learnerProfiles, {
        fields: [exports.users.id],
        references: [exports.learnerProfiles.userId],
    }),
    achievements: many(exports.achievements),
    lessons: many(exports.lessons),
}));
// Learner Profiles table
exports.learnerProfiles = (0, pg_core_1.pgTable)("learner_profiles", {
    id: (0, pg_core_1.text)("id").primaryKey().notNull(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    gradeLevel: (0, pg_core_1.integer)("grade_level").notNull(),
    graph: (0, pg_core_1.json)("graph").$type(),
    subjects: (0, pg_core_1.json)("subjects").$type().default(['Math', 'Science']),
    subjectPerformance: (0, pg_core_1.json)("subject_performance").$type().default({}),
    recommendedSubjects: (0, pg_core_1.json)("recommended_subjects").$type().default([]),
    strugglingAreas: (0, pg_core_1.json)("struggling_areas").$type().default([]),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.learnerProfilesRelations = (0, drizzle_orm_1.relations)(exports.learnerProfiles, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.learnerProfiles.userId],
        references: [exports.users.id],
    }),
    lessons: many(exports.lessons),
    achievements: many(exports.achievements),
}));
// Lessons table
exports.lessons = (0, pg_core_1.pgTable)("lessons", {
    id: (0, pg_core_1.text)("id").primaryKey().notNull(),
    learnerId: (0, pg_core_1.integer)("learner_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    moduleId: (0, pg_core_1.text)("module_id").notNull(),
    status: (0, exports.lessonStatusEnum)("status").notNull().default("QUEUED"),
    subject: (0, pg_core_1.text)("subject"),
    category: (0, pg_core_1.text)("category"),
    difficulty: (0, pg_core_1.text)("difficulty", { enum: ["beginner", "intermediate", "advanced"] }).default("beginner"),
    imagePaths: (0, pg_core_1.json)("image_paths").$type(),
    spec: (0, pg_core_1.json)("spec").$type(),
    enhancedSpec: (0, pg_core_1.json)("enhanced_spec").$type(),
    score: (0, pg_core_1.integer)("score"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
});
exports.lessonsRelations = (0, drizzle_orm_1.relations)(exports.lessons, ({ one }) => ({
    learner: one(exports.users, {
        fields: [exports.lessons.learnerId],
        references: [exports.users.id],
    }),
}));
// Achievements table
exports.achievements = (0, pg_core_1.pgTable)("achievements", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    learnerId: (0, pg_core_1.varchar)("learner_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    type: (0, pg_core_1.text)("type").notNull(),
    payload: (0, pg_core_1.json)("payload").$type(),
    awardedAt: (0, pg_core_1.timestamp)("awarded_at").defaultNow(),
});
exports.achievementsRelations = (0, drizzle_orm_1.relations)(exports.achievements, ({ one }) => ({
    learner: one(exports.users, {
        fields: [exports.achievements.learnerId],
        references: [exports.users.id],
    }),
}));
// Database Sync Configurations table
exports.dbSyncConfigs = (0, pg_core_1.pgTable)("db_sync_configs", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    parentId: (0, pg_core_1.varchar)("parent_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    targetDbUrl: (0, pg_core_1.text)("target_db_url").notNull(),
    lastSyncAt: (0, pg_core_1.timestamp)("last_sync_at"),
    syncStatus: (0, exports.syncStatusEnum)("sync_status").notNull().default("IDLE"),
    continuousSync: (0, pg_core_1.boolean)("continuous_sync").notNull().default(false),
    errorMessage: (0, pg_core_1.text)("error_message"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.dbSyncConfigsRelations = (0, drizzle_orm_1.relations)(exports.dbSyncConfigs, ({ one }) => ({
    parent: one(exports.users, {
        fields: [exports.dbSyncConfigs.parentId],
        references: [exports.users.id],
    }),
}));
//# sourceMappingURL=schema.js.map