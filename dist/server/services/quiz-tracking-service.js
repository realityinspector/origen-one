"use strict";
/**
 * Quiz Tracking Service
 *
 * Stores individual quiz answers with concept tagging and question hashing
 * for analytics, deduplication, and adaptive learning
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashQuestion = hashQuestion;
exports.extractConceptTags = extractConceptTags;
exports.storeQuizAnswer = storeQuizAnswer;
exports.storeQuizAnswers = storeQuizAnswers;
exports.getRecentAnswers = getRecentAnswers;
exports.getAnswersForConcept = getAnswersForConcept;
exports.getConceptPerformance = getConceptPerformance;
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../db");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * Generate SHA-256 hash of question text for deduplication
 */
function hashQuestion(questionText) {
    return crypto_1.default
        .createHash('sha256')
        .update(questionText.toLowerCase().trim())
        .digest('hex');
}
/**
 * Extract concept tags from question text and options
 * Uses simple keyword matching - can be enhanced with NLP
 */
function extractConceptTags(question, subject) {
    const text = `${question.text} ${question.options.join(' ')}`.toLowerCase();
    const tags = new Set();
    // Add subject as primary tag
    tags.add(subject.toLowerCase());
    // Math concepts
    if (text.match(/\b(add|addition|plus|sum)\b/))
        tags.add('addition');
    if (text.match(/\b(subtract|subtraction|minus|difference)\b/))
        tags.add('subtraction');
    if (text.match(/\b(multiply|multiplication|times|product)\b/))
        tags.add('multiplication');
    if (text.match(/\b(divide|division|split|quotient)\b/))
        tags.add('division');
    if (text.match(/\b(fraction|half|quarter|third)\b/))
        tags.add('fractions');
    if (text.match(/\b(count|counting|number|how many)\b/))
        tags.add('counting');
    // Science concepts
    if (text.match(/\b(plant|plants|grow|seed|leaf)\b/))
        tags.add('plants');
    if (text.match(/\b(animal|animals|bird|fish|mammal)\b/))
        tags.add('animals');
    if (text.match(/\b(water|liquid|solid|gas|ice|steam)\b/))
        tags.add('states-of-matter');
    if (text.match(/\b(hot|cold|heat|temperature|warm)\b/))
        tags.add('temperature');
    if (text.match(/\b(light|dark|shadow|sun)\b/))
        tags.add('light');
    if (text.match(/\b(sound|hear|loud|quiet|noise)\b/))
        tags.add('sound');
    // Reading/Language concepts
    if (text.match(/\b(letter|alphabet|word|spell)\b/))
        tags.add('letters');
    if (text.match(/\b(read|reading|story|book)\b/))
        tags.add('reading');
    if (text.match(/\b(write|writing|sentence)\b/))
        tags.add('writing');
    if (text.match(/\b(rhyme|rhyming|sound)\b/))
        tags.add('phonics');
    // General cognitive skills
    if (text.match(/\b(color|red|blue|green|yellow)\b/))
        tags.add('colors');
    if (text.match(/\b(shape|circle|square|triangle)\b/))
        tags.add('shapes');
    if (text.match(/\b(big|small|large|tiny|size)\b/))
        tags.add('size');
    if (text.match(/\b(compare|same|different|similar)\b/))
        tags.add('comparison');
    return Array.from(tags);
}
/**
 * Store a single quiz answer
 */
async function storeQuizAnswer(answer) {
    try {
        await db_1.db.execute((0, drizzle_orm_1.sql) `
      INSERT INTO quiz_answers (
        learner_id,
        lesson_id,
        question_index,
        question_text,
        question_hash,
        user_answer,
        correct_answer,
        is_correct,
        concept_tags,
        answered_at
      ) VALUES (
        ${answer.learnerId},
        ${answer.lessonId},
        ${answer.questionIndex},
        ${answer.questionText},
        ${answer.questionHash},
        ${answer.userAnswer},
        ${answer.correctAnswer},
        ${answer.isCorrect},
        ${answer.conceptTags},
        ${answer.answeredAt || new Date()}
      )
    `);
    }
    catch (error) {
        console.error('Error storing quiz answer:', error);
        throw error;
    }
}
/**
 * Store all answers from a completed quiz
 */
async function storeQuizAnswers(learnerId, lessonId, questions, userAnswers, subject) {
    const answersToStore = questions.map((question, index) => {
        const questionHash = hashQuestion(question.text);
        const conceptTags = extractConceptTags(question, subject);
        const isCorrect = userAnswers[index] === question.correctIndex;
        return {
            learnerId,
            lessonId,
            questionIndex: index,
            questionText: question.text,
            questionHash,
            userAnswer: userAnswers[index],
            correctAnswer: question.correctIndex,
            isCorrect,
            conceptTags,
            answeredAt: new Date()
        };
    });
    // Store all answers
    for (const answer of answersToStore) {
        await storeQuizAnswer(answer);
    }
    console.log(`✓ Stored ${answersToStore.length} quiz answers for learner ${learnerId}`);
}
/**
 * Get recent quiz answers for a learner
 */
async function getRecentAnswers(learnerId, limit = 50) {
    try {
        const results = await db_1.db.execute((0, drizzle_orm_1.sql) `
      SELECT *
      FROM quiz_answers
      WHERE learner_id = ${learnerId}
      ORDER BY answered_at DESC
      LIMIT ${limit}
    `);
        return results.rows;
    }
    catch (error) {
        console.error('Error fetching recent answers:', error);
        return [];
    }
}
/**
 * Get answers for a specific concept
 */
async function getAnswersForConcept(learnerId, concept) {
    try {
        const results = await db_1.db.execute((0, drizzle_orm_1.sql) `
      SELECT *
      FROM quiz_answers
      WHERE learner_id = ${learnerId}
        AND ${concept} = ANY(concept_tags)
      ORDER BY answered_at DESC
    `);
        return results.rows;
    }
    catch (error) {
        console.error(`Error fetching answers for concept ${concept}:`, error);
        return [];
    }
}
/**
 * Get concept performance summary for a learner
 */
async function getConceptPerformance(learnerId) {
    try {
        const results = await db_1.db.execute((0, drizzle_orm_1.sql) `
      SELECT
        UNNEST(concept_tags) as concept,
        COUNT(*) as total,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct
      FROM quiz_answers
      WHERE learner_id = ${learnerId}
      GROUP BY concept
    `);
        const performance = {};
        for (const row of results.rows) {
            const correct = parseInt(row.correct || '0');
            const total = parseInt(row.total || '0');
            performance[row.concept] = {
                correct,
                total,
                accuracy: total > 0 ? correct / total : 0
            };
        }
        return performance;
    }
    catch (error) {
        console.error('Error calculating concept performance:', error);
        return {};
    }
}
//# sourceMappingURL=quiz-tracking-service.js.map