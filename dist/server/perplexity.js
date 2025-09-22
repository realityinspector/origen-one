"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askPerplexity = askPerplexity;
exports.generateLessonContent = generateLessonContent;
exports.generateQuizQuestions = generateQuizQuestions;
exports.generateFeedback = generateFeedback;
const axios_1 = __importDefault(require("axios"));
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const API_URL = 'https://api.perplexity.ai/chat/completions';
/**
 * Makes a request to the Perplexity API
 */
async function askPerplexity(options) {
    if (!PERPLEXITY_API_KEY) {
        throw new Error('PERPLEXITY_API_KEY is not set');
    }
    try {
        const response = await axios_1.default.post(API_URL, {
            model: options.model || 'llama-3.1-sonar-small-128k-online',
            messages: options.messages,
            temperature: options.temperature || 0.2,
            max_tokens: options.max_tokens,
            search_recency_filter: options.search_recency_filter || 'month',
            return_images: false,
            return_related_questions: false,
            stream: false,
            presence_penalty: 0,
            frequency_penalty: 1
        }, {
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.response) {
            throw new Error(`Perplexity API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
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
    const response = await askPerplexity({ messages });
    return response.choices[0].message.content;
}
/**
 * Generate quiz questions for a specific grade level and topic
 */
async function generateQuizQuestions(gradeLevel, topic, questionCount = 5) {
    const messages = [
        {
            role: 'system',
            content: 'You are an expert educational content creator specializing in creating age-appropriate quiz questions for children. Create multiple-choice questions that are clear, engaging, and appropriate for the specific grade level.'
        },
        {
            role: 'user',
            content: `Create ${questionCount} multiple-choice quiz questions about "${topic}" for grade ${gradeLevel} students. For each question, provide 4 options with one correct answer. Format your response as a JSON array of objects, where each object has the format: { "text": "What is X?", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "Explanation of why A is correct" }`
        }
    ];
    const response = await askPerplexity({ messages });
    try {
        const content = response.choices[0].message.content;
        // Extract JSON from the response - sometimes the API might return markdown formatted JSON
        const jsonMatch = content.match(/```json([\s\S]*?)```/) || content.match(/```([\s\S]*?)```/);
        const jsonString = jsonMatch ? jsonMatch[1].trim() : content.trim();
        return JSON.parse(jsonString);
    }
    catch (error) {
        console.error('Failed to parse quiz questions JSON:', error);
        throw new Error('Failed to generate quiz questions');
    }
}
const prompts_2 = require("./prompts");
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
            content: prompts_2.FEEDBACK_PROMPTS.PERSONALIZED_FEEDBACK(gradeLevel)
        },
        {
            role: 'user',
            content: prompts_2.FEEDBACK_PROMPTS.QUIZ_FEEDBACK_USER(quizQuestions, userAnswers, score, gradeLevel)
        }
    ];
    const response = await askPerplexity({ messages });
    return response.choices[0].message.content;
}
//# sourceMappingURL=perplexity.js.map