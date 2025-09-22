interface PerplexityMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
interface PerplexityApiOptions {
    messages: PerplexityMessage[];
    model?: string;
    temperature?: number;
    max_tokens?: number;
    search_recency_filter?: 'day' | 'week' | 'month' | 'year';
}
interface PerplexityApiResponse {
    id: string;
    model: string;
    object: string;
    created: number;
    citations: string[];
    choices: {
        index: number;
        finish_reason: string;
        message: {
            role: string;
            content: string;
        };
        delta: {
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
 * Makes a request to the Perplexity API
 */
export declare function askPerplexity(options: PerplexityApiOptions): Promise<PerplexityApiResponse>;
/**
 * Generate a lesson for a specific grade level and topic
 */
export declare function generateLessonContent(gradeLevel: number, topic: string): Promise<string>;
/**
 * Generate quiz questions for a specific grade level and topic
 */
export declare function generateQuizQuestions(gradeLevel: number, topic: string, questionCount?: number): Promise<any[]>;
/**
 * Generate personalized feedback for a learner based on their quiz performance
 */
export declare function generateFeedback(quizQuestions: any[], userAnswers: number[], score: number, gradeLevel: number): Promise<string>;
export {};
