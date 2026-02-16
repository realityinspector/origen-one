"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askOpenRouter = askOpenRouter;
exports.generateLessonContent = generateLessonContent;
exports.generateQuizQuestions = generateQuizQuestions;
exports.generateFeedback = generateFeedback;
exports.generateKnowledgeGraph = generateKnowledgeGraph;
const axios_1 = __importDefault(require("axios"));
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
/**
 * Makes a request to the OpenRouter API
 */
async function askOpenRouter(options) {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not set');
    }
    try {
        const response = await axios_1.default.post(API_URL, {
            model: options.model || 'openai/gpt-4o', // Default to gpt-4o
            messages: options.messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.max_tokens,
            stream: options.stream || false,
            response_format: options.response_format,
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://sunschool.xyz',
                'X-Title': 'SUNSCHOOL - The Open Source AI Tutor'
            }
        });
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.response) {
            throw new Error(`OpenRouter API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        }
        throw error;
    }
}
const prompts_1 = require("./prompts");
const content_validator_1 = require("./services/content-validator");
/**
 * Generate a lesson for a specific grade level and topic
 * WITH CONTENT VALIDATION AND RETRY LOGIC
 */
async function generateLessonContent(gradeLevel, topic) {
    const messages = [
        {
            role: 'system',
            content: prompts_1.LESSON_PROMPTS.STANDARD_LESSON(gradeLevel, topic)
        },
        {
            role: 'user',
            content: prompts_1.LESSON_PROMPTS.STANDARD_LESSON_USER(gradeLevel, topic)
        }
    ];
    // Retry up to 2 times if validation fails (fewer attempts for lessons since they're longer)
    const maxAttempts = 2;
    let lastContent = '';
    let lastValidationResult = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`\n=== Lesson Generation Attempt ${attempt}/${maxAttempts} ===`);
        console.log(`Grade: ${gradeLevel}, Topic: ${topic}`);
        const response = await askOpenRouter({
            messages,
            temperature: 0.4 + (attempt * 0.1) // Lower temperature for stricter following
        });
        const content = response.choices[0].message.content;
        lastContent = content;
        // Validate lesson content for age-appropriateness
        const validationResult = (0, content_validator_1.validateLessonContent)(content, gradeLevel);
        lastValidationResult = validationResult;
        // Log validation report
        const report = (0, content_validator_1.generateValidationReport)(validationResult, 'lesson');
        console.log(report);
        if (validationResult.isValid) {
            console.log(`✓ Lesson content validated successfully on attempt ${attempt}`);
            return content;
        }
        else {
            console.warn(`✗ Lesson validation failed on attempt ${attempt}. Retrying...`);
            // Add validation feedback to messages for next attempt
            messages.push({
                role: 'assistant',
                content: content
            });
            messages.push({
                role: 'user',
                content: `This lesson has issues:\n${validationResult.issues.join('\n')}\n\nRecommendations:\n${validationResult.recommendations.join('\n')}\n\nPlease rewrite the lesson following ALL grade ${gradeLevel} requirements more carefully.`
            });
        }
    }
    // If all attempts failed validation, return best attempt with warning
    console.warn(`⚠️  All ${maxAttempts} attempts failed lesson validation. Returning last attempt with issues.`);
    if (lastValidationResult) {
        console.warn(`Issues: ${lastValidationResult.issues.join(', ')}`);
    }
    return lastContent;
}
const prompts_2 = require("./prompts");
const content_validator_2 = require("./services/content-validator");
/**
 * Generate quiz questions for a specific grade level and topic
 * WITH CONTENT VALIDATION AND RETRY LOGIC
 * WITH ADAPTIVE REINFORCEMENT LEARNING
 */
async function generateQuizQuestions(gradeLevel, topic, questionCount = 5, learnerId, weakConcepts, recentQuestions) {
    // Build adaptive prompt additions
    let adaptiveInstructions = '';
    if (weakConcepts && weakConcepts.length > 0) {
        adaptiveInstructions += `\n\nFOCUS ON THESE CONCEPTS (learner needs practice):\n${weakConcepts.map(c => `- ${c}`).join('\n')}\n`;
        adaptiveInstructions += `Create variations that test these concepts with NEW scenarios and examples.`;
    }
    if (recentQuestions && recentQuestions.length > 0) {
        adaptiveInstructions += `\n\nAVOID EXACT DUPLICATES - Learner recently saw:\n${recentQuestions.slice(0, 10).map((q, i) => `${i + 1}. "${q}"`).join('\n')}\n`;
        adaptiveInstructions += `Generate DIFFERENT questions that test similar concepts with fresh wording and examples.`;
    }
    const messages = [
        {
            role: 'system',
            content: prompts_2.QUIZ_PROMPTS.STANDARD_QUIZ(gradeLevel, topic) + adaptiveInstructions
        },
        {
            role: 'user',
            content: prompts_2.QUIZ_PROMPTS.STANDARD_QUIZ_USER(gradeLevel, topic, questionCount)
        }
    ];
    const response_format = {
        type: 'json_schema',
        json_schema: {
            name: 'quiz_questions',
            strict: true,
            schema: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        text: {
                            type: 'string',
                            description: 'The question text'
                        },
                        options: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Array of 4 answer choices'
                        },
                        correctIndex: {
                            type: 'integer',
                            description: 'Index of the correct answer (0-3)'
                        },
                        explanation: {
                            type: 'string',
                            description: 'Explanation of why the answer is correct'
                        }
                    },
                    required: ['text', 'options', 'correctIndex', 'explanation'],
                    additionalProperties: false
                }
            }
        }
    };
    // Retry up to 3 times if validation fails
    const maxAttempts = 3;
    let lastQuestions = [];
    let lastValidationResult = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`\n=== Quiz Generation Attempt ${attempt}/${maxAttempts} ===`);
        console.log(`Grade: ${gradeLevel}, Topic: ${topic}, Questions: ${questionCount}`);
        const response = await askOpenRouter({
            messages,
            response_format,
            temperature: 0.3 + (attempt * 0.1) // Lower temperature for stricter following
        });
        try {
            // Parse the JSON content
            const questions = JSON.parse(response.choices[0].message.content);
            lastQuestions = questions;
            // Validate quiz questions for age-appropriateness
            const validationResult = (0, content_validator_2.validateQuizQuestions)(questions, gradeLevel);
            lastValidationResult = validationResult;
            // Log validation report
            const report = (0, content_validator_2.generateValidationReport)(validationResult, 'quiz');
            console.log(report);
            if (validationResult.isValid) {
                console.log(`✓ Quiz questions validated successfully on attempt ${attempt}`);
                return questions;
            }
            else {
                console.warn(`✗ Validation failed on attempt ${attempt}. Retrying...`);
                // Add validation feedback to messages for next attempt
                messages.push({
                    role: 'assistant',
                    content: JSON.stringify(questions)
                });
                messages.push({
                    role: 'user',
                    content: `These questions have issues:\n${validationResult.issues.join('\n')}\n\nRecommendations:\n${validationResult.recommendations.join('\n')}\n\nPlease regenerate ${questionCount} questions following ALL requirements more carefully.`
                });
            }
        }
        catch (error) {
            console.error(`Failed to parse quiz questions JSON on attempt ${attempt}:`, error);
            if (attempt === maxAttempts) {
                throw new Error('Failed to generate quiz questions after 3 attempts');
            }
        }
    }
    // If all attempts failed validation, return best attempt with warning
    console.warn(`⚠️  All ${maxAttempts} attempts failed validation. Returning last attempt with issues.`);
    if (lastValidationResult) {
        console.warn(`Issues: ${lastValidationResult.issues.join(', ')}`);
    }
    return lastQuestions;
}
const prompts_3 = require("./prompts");
/**
 * Generate personalized feedback for a learner based on their quiz performance
 */
async function generateFeedback(quizQuestions, userAnswers, score, gradeLevel) {
    const questionAnalysis = quizQuestions.map((q, i) => {
        const isCorrect = userAnswers[i] === q.correctIndex;
        return {
            question: q.text,
            userAnswer: q.options[userAnswers[i]],
            correctAnswer: q.options[q.correctIndex],
            isCorrect,
            explanation: q.explanation
        };
    });
    const messages = [
        {
            role: 'system',
            content: prompts_3.FEEDBACK_PROMPTS.PERSONALIZED_FEEDBACK(gradeLevel)
        },
        {
            role: 'user',
            content: prompts_3.FEEDBACK_PROMPTS.QUIZ_FEEDBACK_USER(quizQuestions, userAnswers, score, gradeLevel)
        }
    ];
    const response = await askOpenRouter({ messages, temperature: 0.7 });
    return response.choices[0].message.content;
}
const prompts_4 = require("./prompts");
/**
 * Generate a knowledge graph based on a topic
 */
async function generateKnowledgeGraph(topic, gradeLevel) {
    const messages = [
        {
            role: 'system',
            content: prompts_4.KNOWLEDGE_GRAPH_PROMPTS.KNOWLEDGE_GRAPH()
        },
        {
            role: 'user',
            content: prompts_4.KNOWLEDGE_GRAPH_PROMPTS.KNOWLEDGE_GRAPH_USER(topic, gradeLevel)
        }
    ];
    const response_format = {
        type: 'json_schema',
        json_schema: {
            name: 'knowledge_graph',
            strict: true,
            schema: {
                type: 'object',
                properties: {
                    nodes: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', description: 'Unique identifier for the node' },
                                label: { type: 'string', description: 'Display name for the concept' }
                            },
                            required: ['id', 'label'],
                            additionalProperties: false
                        },
                        description: 'List of concept nodes in the knowledge graph'
                    },
                    edges: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                source: { type: 'string', description: 'ID of the source node' },
                                target: { type: 'string', description: 'ID of the target node' }
                            },
                            required: ['source', 'target'],
                            additionalProperties: false
                        },
                        description: 'List of relationships between concept nodes'
                    }
                },
                required: ['nodes', 'edges'],
                additionalProperties: false
            }
        }
    };
    const response = await askOpenRouter({
        messages,
        response_format,
        temperature: 0.3
    });
    try {
        // Parse the JSON content
        return JSON.parse(response.choices[0].message.content);
    }
    catch (error) {
        console.error('Failed to parse knowledge graph JSON:', error);
        throw new Error('Failed to generate knowledge graph');
    }
}
//# sourceMappingURL=openrouter.js.map