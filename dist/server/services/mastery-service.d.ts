/**
 * Mastery Tracking Service
 *
 * Calculates and tracks learner mastery levels for individual concepts
 * Identifies concepts needing reinforcement for adaptive learning
 */
export interface ConceptMastery {
    id?: string;
    learnerId: number;
    conceptName: string;
    subject: string;
    correctCount: number;
    totalCount: number;
    masteryLevel: number;
    lastTested: Date;
    needsReinforcement: boolean;
    createdAt?: Date;
}
/**
 * Update or create mastery record for a concept
 */
export declare function updateConceptMastery(learnerId: number, conceptName: string, subject: string, isCorrect: boolean): Promise<void>;
/**
 * Update mastery for all concepts tested in a quiz
 */
export declare function updateMasteryFromQuiz(learnerId: number, subject: string, conceptTags: string[], isCorrect: boolean): Promise<void>;
/**
 * Get all mastery records for a learner
 */
export declare function getLearnerMastery(learnerId: number, subject?: string): Promise<ConceptMastery[]>;
/**
 * Get concepts that need reinforcement (mastery < 70%)
 */
export declare function getConceptsNeedingReinforcement(learnerId: number, subject?: string, limit?: number): Promise<ConceptMastery[]>;
/**
 * Get mastery summary for a learner
 */
export declare function getMasterySummary(learnerId: number): Promise<{
    totalConcepts: number;
    masteredConcepts: number;
    needsReinforcementCount: number;
    averageMastery: number;
    bySubject: Record<string, {
        mastered: number;
        total: number;
        avgMastery: number;
    }>;
}>;
/**
 * Bulk update mastery from quiz completion
 * This is the main function called after quiz submission
 */
export declare function bulkUpdateMasteryFromAnswers(learnerId: number, subject: string, conceptsAndCorrectness: Array<{
    concepts: string[];
    isCorrect: boolean;
}>): Promise<void>;
