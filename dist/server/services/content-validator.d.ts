/**
 * Content Validator Service
 *
 * Validates generated lesson content and quiz questions for age-appropriateness
 * Checks vocabulary level, sentence complexity, and question structure
 */
interface ValidationResult {
    isValid: boolean;
    issues: string[];
    readabilityScore?: number;
    recommendations: string[];
}
interface QuizQuestion {
    text: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}
/**
 * Validate question text for grade-appropriateness
 */
export declare function validateQuestionForGrade(question: QuizQuestion, gradeLevel: number): ValidationResult;
/**
 * Validate entire lesson content
 */
export declare function validateLessonContent(content: string, gradeLevel: number): ValidationResult;
/**
 * Validate quiz questions array
 */
export declare function validateQuizQuestions(questions: QuizQuestion[], gradeLevel: number): ValidationResult;
/**
 * Generate validation report for logging
 */
export declare function generateValidationReport(result: ValidationResult, contentType: 'lesson' | 'quiz'): string;
export {};
