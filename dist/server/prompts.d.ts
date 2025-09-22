/**
 * Centralized storage for all LLM prompts used in the application
 *
 * This file contains comprehensive prompts for generating high-quality educational content
 * with special emphasis on instructional SVG graphics that enhance learning.
 * All prompts have been optimized based on educational best practices.
 */
export declare const LESSON_PROMPTS: {
    /**
     * Standard system prompt for generating educational lessons with enhanced SVG guidance
     */
    STANDARD_LESSON: (gradeLevel: number, topic: string) => string;
    /**
     * User prompt for generating a standard lesson with enhanced SVG guidance
     */
    STANDARD_LESSON_USER: (gradeLevel: number, topic: string) => string;
    /**
     * Enhanced lesson generation system prompt with detailed SVG instructions
     */
    ENHANCED_LESSON: (gradeLevel: number, topic: string) => string;
    /**
     * Legacy system prompt updated with SVG enhancement principles
     */
    LEGACY_LESSON: (gradeLevel: number, topic: string) => string;
};
export declare const QUIZ_PROMPTS: {
    /**
     * System prompt for generating enhanced quiz questions with visual components
     */
    STANDARD_QUIZ: (gradeLevel: number, topic: string) => string;
    /**
     * User prompt for generating quiz questions with visual components
     */
    STANDARD_QUIZ_USER: (gradeLevel: number, topic: string, questionCount?: number) => string;
};
export declare const FEEDBACK_PROMPTS: {
    /**
     * System prompt for generating personalized feedback with visual support
     */
    PERSONALIZED_FEEDBACK: (gradeLevel: number) => string;
    /**
     * User prompt for generating feedback based on quiz performance with visual support
     */
    QUIZ_FEEDBACK_USER: (quizQuestions: any[], userAnswers: number[], score: number, gradeLevel: number) => string;
};
export declare const KNOWLEDGE_GRAPH_PROMPTS: {
    /**
     * System prompt for generating enhanced knowledge graphs with visual hierarchies
     */
    KNOWLEDGE_GRAPH: () => string;
    /**
     * User prompt for generating an enhanced knowledge graph with visual design specifications
     */
    KNOWLEDGE_GRAPH_USER: (topic: string, gradeLevel: number) => string;
};
export declare const IMAGE_PROMPTS: {
    /**
     * Prompt template for generating enhanced educational SVG images
     */
    EDUCATIONAL_IMAGE: (topic: string, concept: string, gradeLevel: number) => string;
    /**
     * Prompt for enhanced diagram generation with instructional focus
     */
    EDUCATIONAL_DIAGRAM: (topic: string, diagramType: string, gradeLevel: number) => string;
};
