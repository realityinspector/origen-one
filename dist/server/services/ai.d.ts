import { type Message } from "../openrouter";
import { type BittensorResponse } from "../bittensor";
export declare const getLLMProvider: () => string;
export declare const chat: (options: any) => Promise<BittensorResponse>;
export declare const generateLessonContent: (gradeLevel: number, topic: string) => Promise<string>;
export declare const generateQuizQuestions: (gradeLevel: number, topic: string, questionCount?: number) => Promise<any[]>;
export declare const generateFeedback: (quizQuestions: any[], userAnswers: number[], score: number, gradeLevel: number) => Promise<string>;
export declare const generateKnowledgeGraph: (topic: string, gradeLevel: number) => Promise<any>;
export { Message };
/**
 * generateLesson – legacy alias that now proxies to OpenRouter-based
 * generateLessonContent.
 */
export declare function generateLesson(topic: string, gradeLevel: number): Promise<string>;
/**
 * generateEnhancedLesson – placeholder until a dedicated enhanced generator is
 * ported to OpenRouter. Produces a minimal EnhancedLessonSpec-compatible
 * object so callers compile.
 */
export declare function generateEnhancedLesson(gradeLevel: number, topic: string): Promise<{
    title: string;
    targetGradeLevel: number;
    summary: string;
    sections: {
        title: string;
        content: string;
        type: "introduction";
    }[];
    keywords: any[];
    relatedTopics: any[];
    estimatedDuration: number;
    difficultyLevel: "intermediate";
    questions: any[];
    images: any[];
    diagrams: any[];
    graph: {
        nodes: any[];
        edges: any[];
    };
}>;
