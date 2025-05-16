import { relations } from "drizzle-orm";
import { 
  integer, pgEnum, pgTable, serial, text, timestamp, uuid, json, boolean, 
  varchar, jsonb, index 
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", ["ADMIN", "PARENT", "LEARNER"]);
export const lessonStatusEnum = pgEnum("lesson_status", ["QUEUED", "ACTIVE", "DONE"]);
export const syncStatusEnum = pgEnum("sync_status", ["IDLE", "IN_PROGRESS", "FAILED", "COMPLETED"]);

// Session storage table.
// This table is mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Store Replit user ID as string
  email: varchar("email").unique(),
  username: text("username").unique(),
  name: text("name"),
  role: userRoleEnum("role").default("LEARNER"),
  password: text("password"), // For non-Replit auth users
  parentId: varchar("parent_id").references(() => users.id, { onDelete: "cascade" }),
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
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  gradeLevel: integer("grade_level").notNull(),
  graph: json("graph").$type<{ nodes: any[], edges: any[] }>(),
  subjects: json("subjects").$type<string[]>().default(['Math', 'Science']),
  subjectPerformance: json("subject_performance").$type<Record<string, {
    score: number,
    lessonCount: number,
    lastAttempted: string,
    masteryLevel: 'beginner' | 'intermediate' | 'advanced'
  }>>().default({}),
  recommendedSubjects: json("recommended_subjects").$type<string[]>().default([]),
  strugglingAreas: json("struggling_areas").$type<string[]>().default([]),
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

// Define image type
export type LessonImage = {
  id: string;
  description: string;
  alt: string;
  base64Data?: string;
  svgData?: string;
  promptUsed: string;
  path?: string; // Local filesystem path for persistent storage
};

// Define diagram type
export type LessonDiagram = {
  id: string;
  type: "flowchart" | "comparison" | "process" | "cycle" | "hierarchy";
  title: string;
  svgData: string;
  description: string;
};

// Define section type
export type LessonSection = {
  title: string;
  content: string;
  type: "introduction" | "key_concepts" | "examples" | "practice" | "summary" | "fun_facts";
  imageIds?: string[];
};

// Define enhanced lesson spec type
export type EnhancedLessonSpec = {
  title: string;
  targetGradeLevel: number;
  subtitle?: string;
  summary: string;
  sections: LessonSection[];
  featuredImage?: string;
  images: LessonImage[];
  diagrams: LessonDiagram[];
  questions: {
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty?: "easy" | "medium" | "hard";
    type?: "multiple_choice" | "true_false" | "image_based" | "sequence";
    imageId?: string;
  }[];
  graph?: {
    nodes: {
      id: string;
      label: string;
      category?: string;
      importance?: number;
    }[];
    edges: {
      source: string;
      target: string;
      label?: string;
      strength?: number;
    }[];
  };
  keywords: string[];
  relatedTopics: string[];
  estimatedDuration: number;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
};

// Lessons table
export const lessons = pgTable("lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  learnerId: varchar("learner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  moduleId: text("module_id").notNull(),
  status: lessonStatusEnum("status").notNull().default("QUEUED"),
  subject: text("subject"),
  category: text("category"),
  difficulty: text("difficulty", { enum: ["beginner", "intermediate", "advanced"] }).default("beginner"),
  imagePaths: json("image_paths").$type<{
    path: string;
    alt: string;
    description: string;
  }[]>(),
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
  enhancedSpec: json("enhanced_spec").$type<EnhancedLessonSpec>(),
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
  learnerId: varchar("learner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  parentId: varchar("parent_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
