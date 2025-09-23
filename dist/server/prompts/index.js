"use strict";
/**
 * Just-In-Time Curriculum Development System
 * Dynamically loads grade-specific prompting strategies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMAGE_PROMPTS = exports.KNOWLEDGE_GRAPH_PROMPTS = exports.FEEDBACK_PROMPTS = exports.QUIZ_PROMPTS = exports.LESSON_PROMPTS = void 0;
exports.getReadingLevelInstructions = getReadingLevelInstructions;
exports.getMathematicalNotationRules = getMathematicalNotationRules;
// Grade-specific prompt imports
const gradeK2_1 = require("./grades/gradeK2");
const grade34_1 = require("./grades/grade34");
const grade56_1 = require("./grades/grade56");
const grade78_1 = require("./grades/grade78");
const grade9Plus_1 = require("./grades/grade9Plus");
// ============================================================================
// Grade Level Router
// ============================================================================
function getGradePrompts(gradeLevel) {
    if (gradeLevel <= 2)
        return gradeK2_1.GradeK2Prompts;
    if (gradeLevel <= 4)
        return grade34_1.Grade34Prompts;
    if (gradeLevel <= 6)
        return grade56_1.Grade56Prompts;
    if (gradeLevel <= 8)
        return grade78_1.Grade78Prompts;
    return grade9Plus_1.Grade9PlusPrompts;
}
// ============================================================================
// Main Export Interface
// ============================================================================
exports.LESSON_PROMPTS = {
    STANDARD_LESSON: (gradeLevel, topic) => {
        const gradePrompts = getGradePrompts(gradeLevel);
        return gradePrompts.getSystemPrompt(topic, gradeLevel);
    },
    STANDARD_LESSON_USER: (gradeLevel, topic) => {
        const gradePrompts = getGradePrompts(gradeLevel);
        return gradePrompts.getUserPrompt(topic, gradeLevel);
    },
    ENHANCED_LESSON: (gradeLevel, topic) => {
        const gradePrompts = getGradePrompts(gradeLevel);
        return gradePrompts.getEnhancedPrompt(topic, gradeLevel);
    }
};
exports.QUIZ_PROMPTS = {
    STANDARD_QUIZ: (gradeLevel, topic) => {
        const gradePrompts = getGradePrompts(gradeLevel);
        return gradePrompts.getQuizSystemPrompt(topic, gradeLevel);
    },
    STANDARD_QUIZ_USER: (gradeLevel, topic, questionCount = 5) => {
        const gradePrompts = getGradePrompts(gradeLevel);
        return gradePrompts.getQuizUserPrompt(topic, gradeLevel, questionCount);
    }
};
exports.FEEDBACK_PROMPTS = {
    PERSONALIZED_FEEDBACK: (gradeLevel) => {
        const gradePrompts = getGradePrompts(gradeLevel);
        return gradePrompts.getFeedbackSystemPrompt(gradeLevel);
    },
    QUIZ_FEEDBACK_USER: (quizQuestions, userAnswers, score, gradeLevel) => {
        const gradePrompts = getGradePrompts(gradeLevel);
        return gradePrompts.getQuizFeedbackPrompt(quizQuestions, userAnswers, score, gradeLevel);
    }
};
exports.KNOWLEDGE_GRAPH_PROMPTS = {
    KNOWLEDGE_GRAPH: () => `
### ROLE: Cognitive Cartographer & Learning Pathway Architect

Build knowledge structures as directed acyclic graphs optimized for just-in-time learning.
Each node represents a 30-60 second learning chunk with clear prerequisites and assessments.
`,
    KNOWLEDGE_GRAPH_USER: (topic, gradeLevel) => {
        const gradePrompts = getGradePrompts(gradeLevel);
        return gradePrompts.getKnowledgeGraphPrompt(topic, gradeLevel);
    }
};
exports.IMAGE_PROMPTS = {
    EDUCATIONAL_IMAGE: (topic, concept, gradeLevel) => {
        const gradePrompts = getGradePrompts(gradeLevel);
        return gradePrompts.getImagePrompt(topic, concept, gradeLevel);
    },
    EDUCATIONAL_DIAGRAM: (topic, diagramType, gradeLevel) => {
        const gradePrompts = getGradePrompts(gradeLevel);
        return gradePrompts.getDiagramPrompt(topic, diagramType, gradeLevel);
    }
};
// Legacy support functions
function getReadingLevelInstructions(gradeLevel) {
    const gradePrompts = getGradePrompts(gradeLevel);
    return gradePrompts.getReadingLevelInstructions();
}
function getMathematicalNotationRules(gradeLevel) {
    const gradePrompts = getGradePrompts(gradeLevel);
    return gradePrompts.getMathematicalNotationRules();
}
exports.default = {
    LESSON_PROMPTS: exports.LESSON_PROMPTS,
    QUIZ_PROMPTS: exports.QUIZ_PROMPTS,
    FEEDBACK_PROMPTS: exports.FEEDBACK_PROMPTS,
    KNOWLEDGE_GRAPH_PROMPTS: exports.KNOWLEDGE_GRAPH_PROMPTS,
    IMAGE_PROMPTS: exports.IMAGE_PROMPTS,
    getReadingLevelInstructions,
    getMathematicalNotationRules
};
//# sourceMappingURL=index.js.map