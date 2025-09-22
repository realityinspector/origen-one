"use strict";
/**
 * AI Service Adapter
 *
 * This module provides a unified interface for AI services including:
 * - OpenRouter for text generation
 * - Stability AI for image generation
 * - Enhanced lesson generation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEnhancedLesson = void 0;
exports.chat = chat;
exports.generateLessonContent = generateLessonContent;
exports.generateQuizQuestions = generateQuizQuestions;
exports.generateFeedback = generateFeedback;
exports.generateKnowledgeGraph = generateKnowledgeGraph;
const flags_1 = require("../config/flags");
const axios_1 = __importDefault(require("axios"));
const enhanced_lesson_service_1 = require("./enhanced-lesson-service");
Object.defineProperty(exports, "generateEnhancedLesson", { enumerable: true, get: function () { return enhanced_lesson_service_1.generateEnhancedLesson; } });
const prompts_1 = require("../prompts");
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const HEADERS = (key) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
    "HTTP-Referer": "https://origen-ai-tutor.replit.app", // required by OpenRouter
    "X-Title": "SUNSCHOOL - The Open Source AI Tutor"
});
/**
 * Makes a request to the OpenRouter API
 */
async function chat(messages, options = {}) {
    if (!flags_1.USE_AI) {
        throw new Error('AI generation is disabled (USE_AI=0)');
    }
    const { model = "anthropic/claude-3-haiku", temperature = 0.7, max_tokens, response_format } = options;
    try {
        const { data } = await axios_1.default.post(ENDPOINT, { model, messages, temperature, max_tokens, stream: false, response_format }, { headers: HEADERS(process.env.OPENROUTER_API_KEY) });
        return data.choices[0].message.content;
    }
    catch (error) {
        console.error('AI provider error:', error);
        throw error;
    }
}
/**
 * Generate a lesson for a specific grade level and topic
 * This function can either return a simple markdown string (legacy)
 * or generate a full enhanced lesson if the enhanced parameter is true
 */
async function generateLessonContent(gradeLevel, topic, enhanced = false) {
    if (!flags_1.USE_AI) {
        throw new Error('AI generation is disabled (USE_AI=0)');
    }
    // If enhanced mode requested, use the enhanced lesson generator
    if (enhanced) {
        try {
            console.log(`Generating enhanced lesson about "${topic}" for grade ${gradeLevel}`);
            const enhancedLesson = await (0, enhanced_lesson_service_1.generateEnhancedLesson)(gradeLevel, topic, true);
            if (!enhancedLesson) {
                throw new Error('Enhanced lesson generation failed');
            }
            return enhancedLesson;
        }
        catch (error) {
            console.error("Error generating enhanced lesson:", error);
            throw error;
        }
    }
    // Legacy lesson generation (simple markdown)
    try {
        console.log(`Generating legacy lesson about "${topic}" for grade ${gradeLevel}`);
        const messages = [
            { role: "system", content: prompts_1.LESSON_PROMPTS.LEGACY_LESSON(gradeLevel, topic) },
            { role: "user", content: prompts_1.LESSON_PROMPTS.STANDARD_LESSON_USER(gradeLevel, topic) }
        ];
        return await chat(messages, {
            model: "anthropic/claude-3-haiku",
            temperature: 0.7,
            max_tokens: 1500
        });
    }
    catch (error) {
        console.error("Error generating lesson content:", error);
        throw error;
    }
}
/**
 * Generate quiz questions for a specific grade level and topic
 */
async function generateQuizQuestions(gradeLevel, topic, questionCount = 5) {
    if (!flags_1.USE_AI) {
        throw new Error('AI generation is disabled (USE_AI=0)');
    }
    try {
        // Define the JSON schema
        const schema = {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    text: { type: 'string' },
                    options: { type: 'array', items: { type: 'string' } },
                    correctIndex: { type: 'integer' },
                    explanation: { type: 'string' }
                },
                required: ['text', 'options', 'correctIndex', 'explanation']
            }
        };
        const messages = [
            { role: "system", content: prompts_1.QUIZ_PROMPTS.STANDARD_QUIZ(gradeLevel, topic) },
            { role: "user", content: prompts_1.QUIZ_PROMPTS.STANDARD_QUIZ_USER(gradeLevel, topic, questionCount) }
        ];
        const response = await chat(messages, {
            model: "anthropic/claude-3-haiku",
            temperature: 0.5,
            response_format: {
                type: 'json_schema',
                schema
            }
        });
        // Parse the JSON response
        return JSON.parse(response);
    }
    catch (error) {
        console.error("Error generating quiz questions:", error);
        throw error;
    }
}
/**
 * Generate personalized feedback for a learner based on their quiz performance
 */
async function generateFeedback(quizQuestions, userAnswers, score, gradeLevel) {
    if (!flags_1.USE_AI) {
        throw new Error('AI generation is disabled (USE_AI=0)');
    }
    try {
        const messages = [
            { role: "system", content: prompts_1.FEEDBACK_PROMPTS.PERSONALIZED_FEEDBACK(gradeLevel) },
            { role: "user", content: prompts_1.FEEDBACK_PROMPTS.QUIZ_FEEDBACK_USER(quizQuestions, userAnswers, score, gradeLevel) }
        ];
        return await chat(messages, {
            model: "anthropic/claude-3-haiku",
            temperature: 0.7
        });
    }
    catch (error) {
        console.error("Error generating feedback:", error);
        return "Great effort on your quiz! Keep practicing to improve your understanding of the topic.";
    }
}
/**
 * Generate a knowledge graph based on a topic
 */
async function generateKnowledgeGraph(topic, gradeLevel) {
    if (!flags_1.USE_AI) {
        throw new Error('AI generation is disabled (USE_AI=0)');
    }
    try {
        const schema = {
            type: 'object',
            properties: {
                nodes: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            label: { type: 'string' }
                        },
                        required: ['id', 'label']
                    }
                },
                edges: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            source: { type: 'string' },
                            target: { type: 'string' }
                        },
                        required: ['source', 'target']
                    }
                }
            },
            required: ['nodes', 'edges']
        };
        const messages = [
            { role: "system", content: prompts_1.KNOWLEDGE_GRAPH_PROMPTS.KNOWLEDGE_GRAPH() },
            { role: "user", content: prompts_1.KNOWLEDGE_GRAPH_PROMPTS.KNOWLEDGE_GRAPH_USER(topic, gradeLevel) }
        ];
        const response = await chat(messages, {
            model: "anthropic/claude-3-haiku",
            temperature: 0.5,
            response_format: {
                type: 'json_schema',
                schema
            }
        });
        // Parse the JSON response
        return JSON.parse(response);
    }
    catch (error) {
        console.error("Error generating knowledge graph:", error);
        // Return a simple fallback graph
        return {
            nodes: [
                { id: "main", label: topic },
                { id: "sub1", label: `Basic ${topic}` },
                { id: "sub2", label: `Advanced ${topic}` },
                { id: "related1", label: "Related Concept 1" },
                { id: "related2", label: "Related Concept 2" }
            ],
            edges: [
                { source: "main", target: "sub1" },
                { source: "main", target: "sub2" },
                { source: "main", target: "related1" },
                { source: "main", target: "related2" },
                { source: "sub1", target: "related1" }
            ]
        };
    }
}
//# sourceMappingURL=ai.js.map