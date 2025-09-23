export declare const Grade78Prompts: {
    getSystemPrompt: (topic: string, gradeLevel: number) => string;
    getUserPrompt: (topic: string, gradeLevel: number) => string;
    getEnhancedPrompt: (topic: string, gradeLevel: number) => string;
    getQuizSystemPrompt: (topic: string, gradeLevel: number) => string;
    getQuizUserPrompt: (topic: string, gradeLevel: number, questionCount: number) => string;
    getFeedbackSystemPrompt: (gradeLevel: number) => string;
    getQuizFeedbackPrompt: (questions: any[], answers: number[], score: number, gradeLevel: number) => string;
    getKnowledgeGraphPrompt: (topic: string, gradeLevel: number) => string;
    getImagePrompt: (topic: string, concept: string, gradeLevel: number) => string;
    getDiagramPrompt: (topic: string, diagramType: string, gradeLevel: number) => string;
    getReadingLevelInstructions: () => string;
    getMathematicalNotationRules: () => string;
};
