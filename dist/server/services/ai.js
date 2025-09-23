"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKnowledgeGraph = exports.generateFeedback = exports.generateQuizQuestions = exports.generateLessonContent = exports.chat = void 0;
exports.generateLesson = generateLesson;
exports.generateEnhancedLesson = generateEnhancedLesson;
const openrouter_1 = require("../openrouter");
Object.defineProperty(exports, "chat", { enumerable: true, get: function () { return openrouter_1.askOpenRouter; } });
Object.defineProperty(exports, "generateLessonContent", { enumerable: true, get: function () { return openrouter_1.generateLessonContent; } });
Object.defineProperty(exports, "generateQuizQuestions", { enumerable: true, get: function () { return openrouter_1.generateQuizQuestions; } });
Object.defineProperty(exports, "generateFeedback", { enumerable: true, get: function () { return openrouter_1.generateFeedback; } });
Object.defineProperty(exports, "generateKnowledgeGraph", { enumerable: true, get: function () { return openrouter_1.generateKnowledgeGraph; } });
/**
 * generateLesson – legacy alias that now proxies to OpenRouter-based
 * generateLessonContent.
 */
async function generateLesson(topic, gradeLevel) {
    return (0, openrouter_1.generateLessonContent)(gradeLevel, topic);
}
/**
 * generateEnhancedLesson – placeholder until a dedicated enhanced generator is
 * ported to OpenRouter. Produces a minimal EnhancedLessonSpec-compatible
 * object so callers compile.
 */
async function generateEnhancedLesson(gradeLevel, topic) {
    const content = await (0, openrouter_1.generateLessonContent)(gradeLevel, topic);
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