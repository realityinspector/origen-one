import { askOpenRouter as chat, type Message, generateLessonContent, generateQuizQuestions, generateFeedback, generateKnowledgeGraph } from "../openrouter";
export { chat, Message, generateLessonContent, generateQuizQuestions, generateFeedback, generateKnowledgeGraph };
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
