export declare const userRoleEnum: import("drizzle-orm/pg-core").PgEnum<["ADMIN", "PARENT", "LEARNER"]>;
export declare const lessonStatusEnum: import("drizzle-orm/pg-core").PgEnum<["QUEUED", "ACTIVE", "DONE"]>;
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
export declare const lessons: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "lessons";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "lessons";
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
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type LearnerProfile = typeof learnerProfiles.$inferSelect;
export type InsertLearnerProfile = typeof learnerProfiles.$inferInsert;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
