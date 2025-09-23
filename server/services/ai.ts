import {
  askOpenRouter as chat,
  type Message,
  generateLessonContent,
  generateQuizQuestions,
  generateFeedback,
  generateKnowledgeGraph
} from "../openrouter";

export { chat, Message, generateLessonContent, generateQuizQuestions, generateFeedback, generateKnowledgeGraph };

/**
 * generateLesson – legacy alias that now proxies to OpenRouter-based
 * generateLessonContent.
 */
export async function generateLesson(topic: string, gradeLevel: number): Promise<string> {
  return generateLessonContent(gradeLevel, topic);
}

/**
 * generateEnhancedLesson – placeholder until a dedicated enhanced generator is
 * ported to OpenRouter. Produces a minimal EnhancedLessonSpec-compatible
 * object so callers compile.
 */
export async function generateEnhancedLesson(gradeLevel: number, topic: string) {
  const content = await generateLessonContent(gradeLevel, topic);
  return {
    title: topic,
    targetGradeLevel: gradeLevel,
    summary: content.slice(0, 160),
    sections: [{ title: topic, content, type: "introduction" as const }],
    keywords: [],
    relatedTopics: [],
    estimatedDuration: 30, // Default 30 minutes
    difficultyLevel: "intermediate" as const,
    questions: [],
    images: [],
    diagrams: [],
    graph: {
      nodes: [],
      edges: []
    }
  };
}