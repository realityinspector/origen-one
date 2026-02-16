/**
 * Quiz Tracking Service
 *
 * Stores individual quiz answers with concept tagging and question hashing
 * for analytics, deduplication, and adaptive learning
 */
export interface QuizAnswer {
    id?: string;
    learnerId: number;
    lessonId: string;
    questionIndex: number;
    questionText: string;
    questionHash: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    conceptTags: string[];
    answeredAt?: Date;
}
export interface QuizQuestion {
    text: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}
/**
 * Generate SHA-256 hash of question text for deduplication
 */
export declare function hashQuestion(questionText: string): string;
/**
 * Extract concept tags from question text and options
 * Uses simple keyword matching - can be enhanced with NLP
 */
export declare function extractConceptTags(question: QuizQuestion, subject: string): string[];
/**
 * Store a single quiz answer
 */
export declare function storeQuizAnswer(answer: QuizAnswer): Promise<void>;
/**
 * Store all answers from a completed quiz
 */
export declare function storeQuizAnswers(learnerId: number, lessonId: string, questions: QuizQuestion[], userAnswers: number[], subject: string): Promise<void>;
/**
 * Get recent quiz answers for a learner
 */
export declare function getRecentAnswers(learnerId: number, limit?: number): Promise<QuizAnswer[]>;
/**
 * Get answers for a specific concept
 */
export declare function getAnswersForConcept(learnerId: number, concept: string): Promise<QuizAnswer[]>;
/**
 * Get concept performance summary for a learner
 */
export declare function getConceptPerformance(learnerId: number): Promise<Record<string, {
    correct: number;
    total: number;
    accuracy: number;
}>>;
