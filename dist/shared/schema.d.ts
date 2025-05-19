export declare const userRoleEnum: import("drizzle-orm/pg-core").PgEnum<["ADMIN", "PARENT", "LEARNER"]>;
export declare const lessonStatusEnum: import("drizzle-orm/pg-core").PgEnum<["QUEUED", "ACTIVE", "DONE"]>;
export declare const syncStatusEnum: import("drizzle-orm/pg-core").PgEnum<["IDLE", "IN_PROGRESS", "FAILED", "COMPLETED"]>;
export declare const sessions: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "sessions";
    schema: undefined;
    columns: {
        sid: import("drizzle-orm/pg-core").PgColumn<{
            name: "sid";
            tableName: "sessions";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number;
        }>;
        sess: import("drizzle-orm/pg-core").PgColumn<{
            name: "sess";
            tableName: "sessions";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        expire: import("drizzle-orm/pg-core").PgColumn<{
            name: "expire";
            tableName: "sessions";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const users: any;
export declare const usersRelations: import("drizzle-orm").Relations<string, {
    parent: import("drizzle-orm").One<any, false>;
    children: import("drizzle-orm").Many<any>;
    learnerProfile: import("drizzle-orm").One<"learner_profiles", false>;
    achievements: import("drizzle-orm").Many<"achievements">;
    lessons: import("drizzle-orm").Many<"lessons">;
}>;
export declare const learnerProfiles: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "learner_profiles";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "learner_profiles";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "learner_profiles";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        gradeLevel: import("drizzle-orm/pg-core").PgColumn<{
            name: "grade_level";
            tableName: "learner_profiles";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        graph: import("drizzle-orm/pg-core").PgColumn<{
            name: "graph";
            tableName: "learner_profiles";
            dataType: "json";
            columnType: "PgJson";
            data: {
                nodes: any[];
                edges: any[];
            };
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: {
                nodes: any[];
                edges: any[];
            };
        }>;
        subjects: import("drizzle-orm/pg-core").PgColumn<{
            name: "subjects";
            tableName: "learner_profiles";
            dataType: "json";
            columnType: "PgJson";
            data: string[];
            driverParam: unknown;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: string[];
        }>;
        subjectPerformance: import("drizzle-orm/pg-core").PgColumn<{
            name: "subject_performance";
            tableName: "learner_profiles";
            dataType: "json";
            columnType: "PgJson";
            data: Record<string, {
                score: number;
                lessonCount: number;
                lastAttempted: string;
                masteryLevel: "beginner" | "intermediate" | "advanced";
            }>;
            driverParam: unknown;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: Record<string, {
                score: number;
                lessonCount: number;
                lastAttempted: string;
                masteryLevel: "beginner" | "intermediate" | "advanced";
            }>;
        }>;
        recommendedSubjects: import("drizzle-orm/pg-core").PgColumn<{
            name: "recommended_subjects";
            tableName: "learner_profiles";
            dataType: "json";
            columnType: "PgJson";
            data: string[];
            driverParam: unknown;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: string[];
        }>;
        strugglingAreas: import("drizzle-orm/pg-core").PgColumn<{
            name: "struggling_areas";
            tableName: "learner_profiles";
            dataType: "json";
            columnType: "PgJson";
            data: string[];
            driverParam: unknown;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: string[];
        }>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "learner_profiles";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const learnerProfilesRelations: import("drizzle-orm").Relations<"learner_profiles", {
    user: import("drizzle-orm").One<any, true>;
    lessons: import("drizzle-orm").Many<"lessons">;
    achievements: import("drizzle-orm").Many<"achievements">;
}>;
export type LessonImage = {
    id: string;
    description: string;
    alt: string;
    base64Data?: string;
    svgData?: string;
    promptUsed: string;
    path?: string;
};
export type LessonDiagram = {
    id: string;
    type: "flowchart" | "comparison" | "process" | "cycle" | "hierarchy";
    title: string;
    svgData: string;
    description: string;
};
export type LessonSection = {
    title: string;
    content: string;
    type: "introduction" | "key_concepts" | "examples" | "practice" | "summary" | "fun_facts";
    imageIds?: string[];
};
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
export declare const lessons: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "lessons";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "lessons";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        learnerId: import("drizzle-orm/pg-core").PgColumn<{
            name: "learner_id";
            tableName: "lessons";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        moduleId: import("drizzle-orm/pg-core").PgColumn<{
            name: "module_id";
            tableName: "lessons";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "lessons";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "QUEUED" | "ACTIVE" | "DONE";
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["QUEUED", "ACTIVE", "DONE"];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        subject: import("drizzle-orm/pg-core").PgColumn<{
            name: "subject";
            tableName: "lessons";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        category: import("drizzle-orm/pg-core").PgColumn<{
            name: "category";
            tableName: "lessons";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        difficulty: import("drizzle-orm/pg-core").PgColumn<{
            name: "difficulty";
            tableName: "lessons";
            dataType: "string";
            columnType: "PgText";
            data: "beginner" | "intermediate" | "advanced";
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["beginner", "intermediate", "advanced"];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        imagePaths: import("drizzle-orm/pg-core").PgColumn<{
            name: "image_paths";
            tableName: "lessons";
            dataType: "json";
            columnType: "PgJson";
            data: {
                path: string;
                alt: string;
                description: string;
            }[];
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: {
                path: string;
                alt: string;
                description: string;
            }[];
        }>;
        spec: import("drizzle-orm/pg-core").PgColumn<{
            name: "spec";
            tableName: "lessons";
            dataType: "json";
            columnType: "PgJson";
            data: {
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
            };
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: {
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
            };
        }>;
        enhancedSpec: import("drizzle-orm/pg-core").PgColumn<{
            name: "enhanced_spec";
            tableName: "lessons";
            dataType: "json";
            columnType: "PgJson";
            data: EnhancedLessonSpec;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: EnhancedLessonSpec;
        }>;
        score: import("drizzle-orm/pg-core").PgColumn<{
            name: "score";
            tableName: "lessons";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "lessons";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        completedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "completed_at";
            tableName: "lessons";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const lessonsRelations: import("drizzle-orm").Relations<"lessons", {
    learner: import("drizzle-orm").One<any, true>;
}>;
export declare const achievements: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "achievements";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "achievements";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        learnerId: import("drizzle-orm/pg-core").PgColumn<{
            name: "learner_id";
            tableName: "achievements";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number;
        }>;
        type: import("drizzle-orm/pg-core").PgColumn<{
            name: "type";
            tableName: "achievements";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        payload: import("drizzle-orm/pg-core").PgColumn<{
            name: "payload";
            tableName: "achievements";
            dataType: "json";
            columnType: "PgJson";
            data: {
                title: string;
                description: string;
                icon: string;
            };
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: {
                title: string;
                description: string;
                icon: string;
            };
        }>;
        awardedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "awarded_at";
            tableName: "achievements";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const achievementsRelations: import("drizzle-orm").Relations<"achievements", {
    learner: import("drizzle-orm").One<any, true>;
}>;
export declare const dbSyncConfigs: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "db_sync_configs";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "db_sync_configs";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        parentId: import("drizzle-orm/pg-core").PgColumn<{
            name: "parent_id";
            tableName: "db_sync_configs";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number;
        }>;
        targetDbUrl: import("drizzle-orm/pg-core").PgColumn<{
            name: "target_db_url";
            tableName: "db_sync_configs";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        lastSyncAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "last_sync_at";
            tableName: "db_sync_configs";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        syncStatus: import("drizzle-orm/pg-core").PgColumn<{
            name: "sync_status";
            tableName: "db_sync_configs";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "IDLE" | "IN_PROGRESS" | "FAILED" | "COMPLETED";
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["IDLE", "IN_PROGRESS", "FAILED", "COMPLETED"];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        continuousSync: import("drizzle-orm/pg-core").PgColumn<{
            name: "continuous_sync";
            tableName: "db_sync_configs";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        errorMessage: import("drizzle-orm/pg-core").PgColumn<{
            name: "error_message";
            tableName: "db_sync_configs";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "db_sync_configs";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "db_sync_configs";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const dbSyncConfigsRelations: import("drizzle-orm").Relations<"db_sync_configs", {
    parent: import("drizzle-orm").One<any, true>;
}>;
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
