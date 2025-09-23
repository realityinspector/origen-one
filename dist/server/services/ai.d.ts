/**
 * Generates a lesson using the modular prompt system
 * Automatically selects appropriate prompting strategy based on grade level
 */
export declare function generateLesson(topic: string, gradeLevel: number, style?: 'standard' | 'enhanced' | 'legacy'): Promise<string>;
/**
 * Generates quiz questions using grade-appropriate complexity
 */
export declare function generateQuiz(topic: string, gradeLevel: number, questionCount?: number): Promise<any[]>;
/**
 * Generates personalized feedback based on quiz performance
 */
export declare function generateFeedback(quizQuestions: any[], userAnswers: number[], score: number, gradeLevel: number): Promise<string>;
/**
 * Generates a knowledge graph for visualizing concept relationships
 */
export declare function generateKnowledgeGraph(topic: string, gradeLevel: number): Promise<any>;
/**
 * Generates educational image descriptions for visual learning
 */
export declare function generateEducationalImage(topic: string, concept: string, gradeLevel: number): Promise<string>;
/**
 * Generates educational diagram specifications
 */
export declare function generateEducationalDiagram(topic: string, diagramType: string, gradeLevel: number): Promise<string>;
/**
 * Batch generation for efficiency when creating multiple related items
 */
export declare function generateLessonPackage(topic: string, gradeLevel: number): Promise<{
    lesson: string;
    quiz: any[];
    knowledgeGraph: any;
    image?: string;
}>;
declare const _default: {
    generateLesson: typeof generateLesson;
    generateQuiz: typeof generateQuiz;
    generateFeedback: typeof generateFeedback;
    generateKnowledgeGraph: typeof generateKnowledgeGraph;
    generateEducationalImage: typeof generateEducationalImage;
    generateEducationalDiagram: typeof generateEducationalDiagram;
    generateLessonPackage: typeof generateLessonPackage;
};
export default _default;
