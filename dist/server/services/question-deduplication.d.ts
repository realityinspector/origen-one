/**
 * Question Deduplication Service
 *
 * Prevents exact duplicate questions from appearing multiple times
 * Enables spaced repetition by allowing variations after time/concept gaps
 */
export interface QuestionHistory {
    id?: number;
    learnerId: string;
    topic: string;
    questionHash: string;
    createdAt?: Date;
}
/**
 * Store question hash in history table to prevent future duplicates
 */
export declare function storeQuestionHash(learnerId: number, topic: string, questionHash: string): Promise<void>;
/**
 * Store multiple question hashes from a quiz
 */
export declare function storeQuestionHashes(learnerId: number, topic: string, questions: Array<{
    text: string;
}>): Promise<void>;
/**
 * Get recent question texts that learner has seen (to avoid in prompts)
 */
export declare function getRecentQuestions(learnerId: number, topic?: string, limit?: number): Promise<string[]>;
/**
 * Check if a question hash has been seen before
 */
export declare function hasSeenQuestion(learnerId: number, questionHash: string): Promise<boolean>;
/**
 * Get question avoidance prompt instructions for LLM
 * This creates a prompt addition that tells the LLM which questions to avoid
 */
export declare function getAvoidanceInstructions(learnerId: number, topic?: string): Promise<string>;
/**
 * Clean up old question history (optional maintenance task)
 * Removes questions older than 90 days to allow spaced repetition
 */
export declare function cleanupOldHistory(daysToKeep?: number): Promise<number>;
/**
 * Get statistics about question history for a learner
 */
export declare function getDeduplicationStats(learnerId: number): Promise<{
    totalQuestionsSeen: number;
    uniqueQuestions: number;
    recentQuestions: number;
    oldestQuestion: Date | null;
}>;
