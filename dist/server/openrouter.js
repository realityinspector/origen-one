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
                'HTTP-Referer': 'https://origen-ai-tutor.replit.app',
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
/**
 * Generate a lesson for a specific grade level and topic
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
    const response = await askOpenRouter({ messages });
    return response.choices[0].message.content;
}
const prompts_2 = require("./prompts");
/**
 * Generate quiz questions for a specific grade level and topic
 */
async function generateQuizQuestions(gradeLevel, topic, questionCount = 5) {
    const messages = [
        {
            role: 'system',
            content: prompts_2.QUIZ_PROMPTS.STANDARD_QUIZ(gradeLevel, topic)
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
    const response = await askOpenRouter({
        messages,
        response_format,
        temperature: 0.5
    });
    try {
        // Parse the JSON content directly
        return JSON.parse(response.choices[0].message.content);
    }
    catch (error) {
        console.error('Failed to parse quiz questions JSON:', error);
        throw new Error('Failed to generate quiz questions');
    }
}
const prompts_3 = require("./prompts");
/**
 * Generate personalized feedback for a learner based on their quiz performance
 */
async function generateFeedback(quizQuestions, userAnswers, score) {
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
            content: prompts_3.FEEDBACK_PROMPTS.PERSONALIZED_FEEDBACK()
        },
        {
            role: 'user',
            content: prompts_3.FEEDBACK_PROMPTS.QUIZ_FEEDBACK_USER(quizQuestions, userAnswers, score)
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