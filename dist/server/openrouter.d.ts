export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
interface OpenRouterOptions {
    messages: Message[];
    model?: string;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    response_format?: {
        type: 'json_schema';
        json_schema: any;
    };
}
interface OpenRouterResponse {
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
export declare function askOpenRouter(options: OpenRouterOptions): Promise<OpenRouterResponse>;
/**
 * Generate a lesson for a specific grade level and topic
 * WITH CONTENT VALIDATION AND RETRY LOGIC
 */
export declare function generateLessonContent(gradeLevel: number, topic: string): Promise<string>;
/**
 * Generate quiz questions for a specific grade level and topic
 * WITH CONTENT VALIDATION AND RETRY LOGIC
 * WITH ADAPTIVE REINFORCEMENT LEARNING
 */
export declare function generateQuizQuestions(gradeLevel: number, topic: string, questionCount?: number, learnerId?: number, weakConcepts?: string[], recentQuestions?: string[]): Promise<any[]>;
/**
 * Generate personalized feedback for a learner based on their quiz performance
 */
export declare function generateFeedback(quizQuestions: any[], userAnswers: number[], score: number, gradeLevel: number): Promise<string>;
/**
 * Generate a knowledge graph based on a topic
 */
export declare function generateKnowledgeGraph(topic: string, gradeLevel: number): Promise<any>;
export {};
