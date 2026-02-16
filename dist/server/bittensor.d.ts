export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
interface BittensorOptions {
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
export interface BittensorResponse {
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
 * Makes a request to Bittensor Subnet 1
 * Uses the GraphQL API for miner selection and inference
 */
export declare function askBittensor(options: BittensorOptions): Promise<BittensorResponse>;
/**
 * Generate a lesson for a specific grade level and topic using Bittensor
 */
export declare function generateLessonContent(gradeLevel: number, topic: string): Promise<string>;
/**
 * Generate quiz questions for a specific grade level and topic using Bittensor
 */
export declare function generateQuizQuestions(gradeLevel: number, topic: string, questionCount?: number): Promise<any[]>;
/**
 * Generate personalized feedback for a learner based on their quiz performance using Bittensor
 */
export declare function generateFeedback(quizQuestions: any[], userAnswers: number[], score: number, gradeLevel: number): Promise<string>;
/**
 * Generate a knowledge graph based on a topic using Bittensor
 */
export declare function generateKnowledgeGraph(topic: string, gradeLevel: number): Promise<any>;
export {};
