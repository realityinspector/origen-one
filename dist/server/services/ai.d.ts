/**
 * AI Service Adapter
 *
 * This module provides a unified interface for AI services including:
 * - OpenRouter for text generation
 * - Stability AI for image generation
 * - Enhanced lesson generation
 */
import { generateEnhancedLesson } from './enhanced-lesson-service';
import { EnhancedLessonSpec } from '../../shared/schema';
export { generateEnhancedLesson };
export type Message = {
    role: "system" | "user" | "assistant";
    content: string;
};
export type ChatOptions = {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    response_format?: {
        type: 'json_schema';
        schema: any;
    };
};
export interface ChatResponse {
    id: string;
    model: string;
    object: string;
    created: number;
    choices: {
        index: number;
        finish_reason: string;
        message: {
            role: string;
            content: string;
        };
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
/**
 * Makes a request to the OpenRouter API
 */
export declare function chat(messages: Message[], options?: ChatOptions): Promise<string>;
/**
 * Generate a lesson for a specific grade level and topic
 * This function can either return a simple markdown string (legacy)
 * or generate a full enhanced lesson if the enhanced parameter is true
 */
export declare function generateLessonContent(gradeLevel: number, topic: string, enhanced?: boolean): Promise<string | EnhancedLessonSpec>;
/**
 * Generate quiz questions for a specific grade level and topic
 */
export declare function generateQuizQuestions(gradeLevel: number, topic: string, questionCount?: number): Promise<any[]>;
/**
 * Generate personalized feedback for a learner based on their quiz performance
 */
export declare function generateFeedback(quizQuestions: any[], userAnswers: number[], score: number): Promise<string>;
/**
 * Generate a knowledge graph based on a topic
 */
export declare function generateKnowledgeGraph(topic: string, gradeLevel: number): Promise<any>;
