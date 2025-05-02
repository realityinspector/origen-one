"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.achievementsRelations = exports.achievements = exports.lessonsRelations = exports.lessons = exports.learnerProfilesRelations = exports.learnerProfiles = exports.usersRelations = exports.users = exports.lessonStatusEnum = exports.userRoleEnum = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
// Enums
exports.userRoleEnum = (0, pg_core_1.pgEnum)("user_role", ["ADMIN", "PARENT", "LEARNER"]);
exports.lessonStatusEnum = (0, pg_core_1.pgEnum)("lesson_status", ["QUEUED", "ACTIVE", "DONE"]);
// Users table
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    name: (0, pg_core_1.text)("name").notNull(),
    role: (0, exports.userRoleEnum)("role").notNull(),
    password: (0, pg_core_1.text)("password").notNull(),
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
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    gradeLevel: (0, pg_core_1.integer)("grade_level").notNull(),
    graph: (0, pg_core_1.json)("graph").$type(),
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
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    learnerId: (0, pg_core_1.integer)("learner_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    moduleId: (0, pg_core_1.text)("module_id").notNull(),
    status: (0, exports.lessonStatusEnum)("status").notNull().default("QUEUED"),
    spec: (0, pg_core_1.json)("spec").$type(),
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
    learnerId: (0, pg_core_1.integer)("learner_id").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
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
//# sourceMappingURL=schema.js.map