"use strict";
/**
 * Question Deduplication Service
 *
 * Prevents exact duplicate questions from appearing multiple times
 * Enables spaced repetition by allowing variations after time/concept gaps
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeQuestionHash = storeQuestionHash;
exports.storeQuestionHashes = storeQuestionHashes;
exports.getRecentQuestions = getRecentQuestions;
exports.hasSeenQuestion = hasSeenQuestion;
exports.getAvoidanceInstructions = getAvoidanceInstructions;
exports.cleanupOldHistory = cleanupOldHistory;
exports.getDeduplicationStats = getDeduplicationStats;
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
const quiz_tracking_service_1 = require("./quiz-tracking-service");
/**
 * Store question hash in history table to prevent future duplicates
 */
async function storeQuestionHash(learnerId, topic, questionHash) {
    try {
        await db_1.db.execute((0, drizzle_orm_1.sql) `
      INSERT INTO questions_history (learner_id, topic, question_hash, created_at)
      VALUES (${learnerId.toString()}, ${topic}, ${questionHash}, NOW())
      ON CONFLICT (learner_id, topic, question_hash) DO NOTHING
    `);
    }
    catch (error) {
        console.error('Error storing question hash:', error);
        // Don't throw - deduplication is non-critical
    }
}
/**
 * Store multiple question hashes from a quiz
 */
async function storeQuestionHashes(learnerId, topic, questions) {
    for (const question of questions) {
        const questionHash = (0, quiz_tracking_service_1.hashQuestion)(question.text);
        await storeQuestionHash(learnerId, topic, questionHash);
    }
    console.log(`✓ Stored ${questions.length} question hashes for learner ${learnerId}, topic: ${topic}`);
}
/**
 * Get recent question texts that learner has seen (to avoid in prompts)
 */
async function getRecentQuestions(learnerId, topic, limit = 50) {
    try {
        // Get recent question hashes
        let query;
        if (topic) {
            query = (0, drizzle_orm_1.sql) `
        SELECT DISTINCT qa.question_text
        FROM quiz_answers qa
        WHERE qa.learner_id = ${learnerId}
          AND qa.answered_at > NOW() - INTERVAL '30 days'
        ORDER BY qa.answered_at DESC
        LIMIT ${limit}
      `;
        }
        else {
            query = (0, drizzle_orm_1.sql) `
        SELECT DISTINCT qa.question_text
        FROM quiz_answers qa
        WHERE qa.learner_id = ${learnerId}
          AND qa.answered_at > NOW() - INTERVAL '30 days'
        ORDER BY qa.answered_at DESC
        LIMIT ${limit}
      `;
        }
        const results = await db_1.db.execute(query);
        return results.rows.map((row) => row.question_text);
    }
    catch (error) {
        console.error('Error fetching recent questions:', error);
        return [];
    }
}
/**
 * Check if a question hash has been seen before
 */
async function hasSeenQuestion(learnerId, questionHash) {
    try {
        const results = await db_1.db.execute((0, drizzle_orm_1.sql) `
      SELECT COUNT(*) as count
      FROM questions_history
      WHERE learner_id = ${learnerId.toString()}
        AND question_hash = ${questionHash}
    `);
        const count = parseInt(results.rows[0]?.count || '0');
        return count > 0;
    }
    catch (error) {
        console.error('Error checking question history:', error);
        return false;
    }
}
/**
 * Get question avoidance prompt instructions for LLM
 * This creates a prompt addition that tells the LLM which questions to avoid
 */
async function getAvoidanceInstructions(learnerId, topic) {
    const recentQuestions = await getRecentQuestions(learnerId, topic, 20);
    if (recentQuestions.length === 0) {
        return '';
    }
    const instructions = `
IMPORTANT: AVOID EXACT DUPLICATES

The learner has recently seen these questions. DO NOT ask these exact questions again:

${recentQuestions.map((q, i) => `${i + 1}. "${q}"`).join('\n')}

Instead:
- Create NEW questions that test the SAME concepts
- Use DIFFERENT scenarios, numbers, or examples
- Change the wording while keeping the same difficulty level
- You can test the same concept with fresh variations

Example:
- Seen before: "Is water wet?"
- Good variation: "Can you feel water?"
- Good variation: "Does water make things wet?"
- Bad: "Is water wet?" (exact duplicate)
`;
    return instructions;
}
/**
 * Clean up old question history (optional maintenance task)
 * Removes questions older than 90 days to allow spaced repetition
 */
async function cleanupOldHistory(daysToKeep = 90) {
    try {
        const result = await db_1.db.execute((0, drizzle_orm_1.sql) `
      DELETE FROM questions_history
      WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'
    `);
        const deletedCount = result.rowCount || 0;
        console.log(`✓ Cleaned up ${deletedCount} old question history records`);
        return deletedCount;
    }
    catch (error) {
        console.error('Error cleaning up question history:', error);
        return 0;
    }
}
/**
 * Get statistics about question history for a learner
 */
async function getDeduplicationStats(learnerId) {
    try {
        const totalResults = await db_1.db.execute((0, drizzle_orm_1.sql) `
      SELECT COUNT(*) as count
      FROM quiz_answers
      WHERE learner_id = ${learnerId}
    `);
        const uniqueResults = await db_1.db.execute((0, drizzle_orm_1.sql) `
      SELECT COUNT(DISTINCT question_hash) as count
      FROM quiz_answers
      WHERE learner_id = ${learnerId}
    `);
        const recentResults = await db_1.db.execute((0, drizzle_orm_1.sql) `
      SELECT COUNT(*) as count
      FROM quiz_answers
      WHERE learner_id = ${learnerId}
        AND answered_at > NOW() - INTERVAL '30 days'
    `);
        const oldestResults = await db_1.db.execute((0, drizzle_orm_1.sql) `
      SELECT MIN(answered_at) as oldest
      FROM quiz_answers
      WHERE learner_id = ${learnerId}
    `);
        return {
            totalQuestionsSeen: parseInt(totalResults.rows[0]?.count || '0'),
            uniqueQuestions: parseInt(uniqueResults.rows[0]?.count || '0'),
            recentQuestions: parseInt(recentResults.rows[0]?.count || '0'),
            oldestQuestion: oldestResults.rows[0]?.oldest
                ? new Date(oldestResults.rows[0].oldest)
                : null
        };
    }
    catch (error) {
        console.error('Error fetching deduplication stats:', error);
        return {
            totalQuestionsSeen: 0,
            uniqueQuestions: 0,
            recentQuestions: 0,
            oldestQuestion: null
        };
    }
}
//# sourceMappingURL=question-deduplication.js.map