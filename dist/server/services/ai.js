"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKnowledgeGraph = exports.generateFeedback = exports.generateQuizQuestions = exports.generateLessonContent = exports.chat = exports.getLLMProvider = void 0;
exports.generateLesson = generateLesson;
exports.generateEnhancedLesson = generateEnhancedLesson;
const openrouter_1 = require("../openrouter");
const bittensor_1 = require("../bittensor");
const flags_1 = require("../config/flags");
// Provider selection logic
const getLLMProvider = () => {
    const configured = process.env.LLM_PROVIDER?.toLowerCase() || 'openrouter';
    // Only allow Bittensor if explicitly enabled
    if (configured === 'bittensor' && !flags_1.ENABLE_BITTENSOR_SUBNET_1) {
        console.warn('Bittensor requested but not enabled via ENABLE_BITTENSOR_SUBNET_1 flag. Falling back to OpenRouter.');
        return 'openrouter';
    }
    return configured;
};
exports.getLLMProvider = getLLMProvider;
const chat = async (options) => {
    const provider = (0, exports.getLLMProvider)();
    if (provider === 'bittensor') {
        try {
            return await (0, bittensor_1.askBittensor)(options);
        }
        catch (error) {
            console.error('Bittensor chat failed:', error);
            if (flags_1.BITTENSOR_FALLBACK_ENABLED) {
                console.log('Falling back to OpenRouter for chat');
                return await (0, openrouter_1.askOpenRouter)(options);
            }
            throw error;
        }
    }
    return await (0, openrouter_1.askOpenRouter)(options);
};
exports.chat = chat;
const generateLessonContent = async (gradeLevel, topic) => {
    const provider = (0, exports.getLLMProvider)();
    if (provider === 'bittensor') {
        try {
            return await (0, bittensor_1.generateLessonContent)(gradeLevel, topic);
        }
        catch (error) {
            console.error('Bittensor lesson generation failed:', error);
            if (flags_1.BITTENSOR_FALLBACK_ENABLED) {
                console.log('Falling back to OpenRouter for lesson generation');
                return await (0, openrouter_1.generateLessonContent)(gradeLevel, topic);
            }
            throw error;
        }
    }
    return await (0, openrouter_1.generateLessonContent)(gradeLevel, topic);
};
exports.generateLessonContent = generateLessonContent;
const generateQuizQuestions = async (gradeLevel, topic, questionCount) => {
    const provider = (0, exports.getLLMProvider)();
    if (provider === 'bittensor') {
        try {
            return await (0, bittensor_1.generateQuizQuestions)(gradeLevel, topic, questionCount);
        }
        catch (error) {
            console.error('Bittensor quiz generation failed:', error);
            if (flags_1.BITTENSOR_FALLBACK_ENABLED) {
                console.log('Falling back to OpenRouter for quiz generation');
                return await (0, openrouter_1.generateQuizQuestions)(gradeLevel, topic, questionCount);
            }
            throw error;
        }
    }
    return await (0, openrouter_1.generateQuizQuestions)(gradeLevel, topic, questionCount);
};
exports.generateQuizQuestions = generateQuizQuestions;
const generateFeedback = async (quizQuestions, userAnswers, score, gradeLevel) => {
    const provider = (0, exports.getLLMProvider)();
    if (provider === 'bittensor') {
        try {
            return await (0, bittensor_1.generateFeedback)(quizQuestions, userAnswers, score, gradeLevel);
        }
        catch (error) {
            console.error('Bittensor feedback generation failed:', error);
            if (flags_1.BITTENSOR_FALLBACK_ENABLED) {
                console.log('Falling back to OpenRouter for feedback generation');
                return await (0, openrouter_1.generateFeedback)(quizQuestions, userAnswers, score, gradeLevel);
            }
            throw error;
        }
    }
    return await (0, openrouter_1.generateFeedback)(quizQuestions, userAnswers, score, gradeLevel);
};
exports.generateFeedback = generateFeedback;
const generateKnowledgeGraph = async (topic, gradeLevel) => {
    const provider = (0, exports.getLLMProvider)();
    if (provider === 'bittensor') {
        try {
            return await (0, bittensor_1.generateKnowledgeGraph)(topic, gradeLevel);
        }
        catch (error) {
            console.error('Bittensor knowledge graph generation failed:', error);
            if (flags_1.BITTENSOR_FALLBACK_ENABLED) {
                console.log('Falling back to OpenRouter for knowledge graph generation');
                return await (0, openrouter_1.generateKnowledgeGraph)(topic, gradeLevel);
            }
            throw error;
        }
    }
    return await (0, openrouter_1.generateKnowledgeGraph)(topic, gradeLevel);
};
exports.generateKnowledgeGraph = generateKnowledgeGraph;
/**
 * generateLesson – legacy alias that now proxies to OpenRouter-based
 * generateLessonContent.
 */
async function generateLesson(topic, gradeLevel) {
    return (0, exports.generateLessonContent)(gradeLevel, topic);
}
/**
 * generateEnhancedLesson – placeholder until a dedicated enhanced generator is
 * ported to OpenRouter. Produces a minimal EnhancedLessonSpec-compatible
 * object so callers compile.
 */
async function generateEnhancedLesson(gradeLevel, topic) {
    const content = await (0, exports.generateLessonContent)(gradeLevel, topic);
    return {
        title: topic,
        targetGradeLevel: gradeLevel,
        summary: content.slice(0, 160),
        sections: [{ title: topic, content, type: "introduction" }],
        keywords: [],
        relatedTopics: [],
        estimatedDuration: 30, // Default 30 minutes
        difficultyLevel: "intermediate",
        questions: [],
        images: [],
        diagrams: [],
        graph: {
            nodes: [],
            edges: []
        }
    };
}
//# sourceMappingURL=ai.js.map