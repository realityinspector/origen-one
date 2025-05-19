import { EnhancedLessonSpec } from '../../shared/schema';
/**
 * Generate a full enhanced lesson with content and images
 * @param gradeLevel The grade level for the lesson
 * @param topic The topic for the lesson
 * @param withImages Whether to generate images (requires Stability API key)
 * @param subject Optional subject category
 * @param difficulty Optional difficulty level
 * @returns The enhanced lesson specification
 */
export declare function generateEnhancedLesson(gradeLevel: number, topic: string, withImages?: boolean, subject?: string, difficulty?: 'beginner' | 'intermediate' | 'advanced'): Promise<EnhancedLessonSpec | null>;
/**
 * Generate quiz questions for an enhanced lesson
 */
export declare function generateEnhancedQuestions(enhancedLesson: EnhancedLessonSpec, questionCount?: number): Promise<any[]>;
