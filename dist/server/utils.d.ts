import { Lesson, InsertLesson } from "../shared/schema";
export declare function generateLesson(gradeLevel: number, topic?: string, useEnhanced?: boolean): Promise<InsertLesson['spec']>;
/**
 * Generate a cryptographically-strong random hash of the given length.  This is
 * used for public share-links etc.
 */
export declare function generateRandomHash(length?: number): string;
export declare function checkForAchievements(lessonHistory: Lesson[], completedLesson?: Lesson): {
    type: string;
    payload: {
        title: string;
        description: string;
        icon: string;
    };
}[];
