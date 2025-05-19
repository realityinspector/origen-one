import { LearnerProfile, Lesson } from '@shared/schema';
export declare const gradeSubjects: Record<number, string[]>;
export declare const subjectCategories: Record<string, string[]>;
/**
 * Get the category for a subject
 * @param subject The subject name
 * @returns The category name or 'Other' if not found
 */
export declare function getSubjectCategory(subject: string): string;
/**
 * Get appropriate subjects for a grade level
 * @param gradeLevel The grade level
 * @returns Array of appropriate subjects
 */
export declare function getSubjectsForGradeLevel(gradeLevel: number): string[];
/**
 * Get all available subject categories
 * @returns Array of category names
 */
export declare function getAllCategories(): string[];
/**
 * Get subjects for a specific category
 * @param category The category name
 * @returns Array of subjects in the category
 */
export declare function getSubjectsForCategory(category: string): string[];
/**
 * Analyze lesson performance to identify struggling areas
 * @param lessonHistory Past lessons for the learner
 * @returns Subject areas where the learner is struggling
 */
export declare function identifyStrugglingAreas(lessonHistory: Lesson[]): string[];
/**
 * Recommend new subjects based on learner profile and performance
 * @param profile Learner profile
 * @param lessonHistory Past lesson history
 * @returns Array of recommended subjects
 */
export declare function recommendSubjects(profile: LearnerProfile, lessonHistory: Lesson[]): string[];
/**
 * Update the learner's subject performance based on a completed lesson
 * @param profile Learner profile
 * @param lesson The completed lesson
 * @returns Updated subject performance record
 */
export declare function updateSubjectPerformance(profile: LearnerProfile, lesson: Lesson): Record<string, any>;
