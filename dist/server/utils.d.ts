import { Lesson, InsertLesson } from "../shared/schema";
export declare function generateLesson(gradeLevel: number, topic?: string): Promise<InsertLesson['spec']>;
export declare function checkForAchievements(lessonHistory: Lesson[], completedLesson?: Lesson): {
    type: string;
    payload: {
        title: string;
        description: string;
        icon: string;
    };
}[];
