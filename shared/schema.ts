import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, serial, text, timestamp, uuid, json, boolean } from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", ["ADMIN", "PARENT", "LEARNER"]);
export const lessonStatusEnum = pgEnum("lesson_status", ["QUEUED", "ACTIVE", "DONE"]);
export const syncStatusEnum = pgEnum("sync_status", ["IDLE", "IN_PROGRESS", "FAILED", "COMPLETED"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull(),
  password: text("password").notNull(),
  parentId: integer("parent_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  parent: one(users, {
    fields: [users.parentId],
    references: [users.id],
  }),
  children: many(users),
  learnerProfile: one(learnerProfiles, {
    fields: [users.id],
    references: [learnerProfiles.userId],
  }),
  achievements: many(achievements),
  lessons: many(lessons),
}));

// Learner Profiles table
export const learnerProfiles = pgTable("learner_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  gradeLevel: integer("grade_level").notNull(),
  graph: json("graph").$type<{ nodes: any[], edges: any[] }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const learnerProfilesRelations = relations(learnerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [learnerProfiles.userId],
    references: [users.id],
  }),
  lessons: many(lessons),
  achievements: many(achievements),
}));

// Lessons table
export const lessons = pgTable("lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  learnerId: integer("learner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  moduleId: text("module_id").notNull(),
  status: lessonStatusEnum("status").notNull().default("QUEUED"),
  spec: json("spec").$type<{
    title: string;
    content: string;
    questions: {
      text: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }[];
    graph?: {
      nodes: {
        id: string;
        label: string;
      }[];
      edges: {
        source: string;
        target: string;
      }[];
    };
  }>(),
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const lessonsRelations = relations(lessons, ({ one }) => ({
  learner: one(users, {
    fields: [lessons.learnerId],
    references: [users.id],
  }),
}));

// Achievements table
export const achievements = pgTable("achievements", {
  id: uuid("id").defaultRandom().primaryKey(),
  learnerId: integer("learner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  payload: json("payload").$type<{
    title: string;
    description: string;
    icon: string;
  }>(),
  awardedAt: timestamp("awarded_at").defaultNow(),
});

export const achievementsRelations = relations(achievements, ({ one }) => ({
  learner: one(users, {
    fields: [achievements.learnerId],
    references: [users.id],
  }),
}));

// Database Sync Configurations table
export const dbSyncConfigs = pgTable("db_sync_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: integer("parent_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetDbUrl: text("target_db_url").notNull(),
  lastSyncAt: timestamp("last_sync_at"),
  syncStatus: syncStatusEnum("sync_status").notNull().default("IDLE"),
  continuousSync: boolean("continuous_sync").notNull().default(false),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dbSyncConfigsRelations = relations(dbSyncConfigs, ({ one }) => ({
  parent: one(users, {
    fields: [dbSyncConfigs.parentId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type LearnerProfile = typeof learnerProfiles.$inferSelect;
export type InsertLearnerProfile = typeof learnerProfiles.$inferInsert;

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

export type DbSyncConfig = typeof dbSyncConfigs.$inferSelect;
export type InsertDbSyncConfig = typeof dbSyncConfigs.$inferInsert;
