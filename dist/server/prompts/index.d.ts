/**
 * Just-In-Time Curriculum Development System
 * Dynamically loads grade-specific prompting strategies
 */
export declare const LESSON_PROMPTS: {
    STANDARD_LESSON: (gradeLevel: number, topic: string) => string;
    STANDARD_LESSON_USER: (gradeLevel: number, topic: string) => string;
    ENHANCED_LESSON: (gradeLevel: number, topic: string) => string;
};
export declare const QUIZ_PROMPTS: {
    STANDARD_QUIZ: (gradeLevel: number, topic: string) => string;
    STANDARD_QUIZ_USER: (gradeLevel: number, topic: string, questionCount?: number) => string;
};
export declare const FEEDBACK_PROMPTS: {
    PERSONALIZED_FEEDBACK: (gradeLevel: number) => string;
    QUIZ_FEEDBACK_USER: (quizQuestions: any[], userAnswers: number[], score: number, gradeLevel: number) => string;
};
export declare const KNOWLEDGE_GRAPH_PROMPTS: {
    KNOWLEDGE_GRAPH: () => string;
    KNOWLEDGE_GRAPH_USER: (topic: string, gradeLevel: number) => string;
};
export declare const IMAGE_PROMPTS: {
    EDUCATIONAL_IMAGE: (topic: string, concept: string, gradeLevel: number) => string;
    EDUCATIONAL_DIAGRAM: (topic: string, diagramType: string, gradeLevel: number) => string;
};
export declare function getReadingLevelInstructions(gradeLevel: number): string;
export declare function getMathematicalNotationRules(gradeLevel: number): string;
declare const _default: {
    LESSON_PROMPTS: {
        STANDARD_LESSON: (gradeLevel: number, topic: string) => string;
        STANDARD_LESSON_USER: (gradeLevel: number, topic: string) => string;
        ENHANCED_LESSON: (gradeLevel: number, topic: string) => string;
    };
    QUIZ_PROMPTS: {
        STANDARD_QUIZ: (gradeLevel: number, topic: string) => string;
        STANDARD_QUIZ_USER: (gradeLevel: number, topic: string, questionCount?: number) => string;
    };
    FEEDBACK_PROMPTS: {
        PERSONALIZED_FEEDBACK: (gradeLevel: number) => string;
        QUIZ_FEEDBACK_USER: (quizQuestions: any[], userAnswers: number[], score: number, gradeLevel: number) => string;
    };
    KNOWLEDGE_GRAPH_PROMPTS: {
        KNOWLEDGE_GRAPH: () => string;
        KNOWLEDGE_GRAPH_USER: (topic: string, gradeLevel: number) => string;
    };
    IMAGE_PROMPTS: {
        EDUCATIONAL_IMAGE: (topic: string, concept: string, gradeLevel: number) => string;
        EDUCATIONAL_DIAGRAM: (topic: string, diagramType: string, gradeLevel: number) => string;
    };
    getReadingLevelInstructions: typeof getReadingLevelInstructions;
    getMathematicalNotationRules: typeof getMathematicalNotationRules;
};
export default _default;
