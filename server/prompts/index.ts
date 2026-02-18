/**
 * Just-In-Time Curriculum Development System
 * Dynamically loads grade-specific prompting strategies
 */

// Grade-specific prompt imports
import { GradeK2Prompts } from './grades/gradeK2';
import { Grade34Prompts } from './grades/grade34';
import { Grade56Prompts } from './grades/grade56';
import { Grade78Prompts } from './grades/grade78';
import { Grade9PlusPrompts } from './grades/grade9Plus';

// ============================================================================
// Grade Level Router
// ============================================================================

function getGradePrompts(gradeLevel: number) {
  if (gradeLevel <= 2) return GradeK2Prompts;
  if (gradeLevel <= 4) return Grade34Prompts;
  if (gradeLevel <= 6) return Grade56Prompts;
  if (gradeLevel <= 8) return Grade78Prompts;
  return Grade9PlusPrompts;
}

// ============================================================================
// Main Export Interface
// ============================================================================

export const LESSON_PROMPTS = {
  STANDARD_LESSON: (gradeLevel: number, topic: string) => {
    const gradePrompts = getGradePrompts(gradeLevel);
    return gradePrompts.getSystemPrompt(topic, gradeLevel);
  },

  STANDARD_LESSON_USER: (gradeLevel: number, topic: string) => {
    const gradePrompts = getGradePrompts(gradeLevel);
    return gradePrompts.getUserPrompt(topic, gradeLevel);
  },

  ENHANCED_LESSON: (gradeLevel: number, topic: string) => {
    const gradePrompts = getGradePrompts(gradeLevel);
    return gradePrompts.getEnhancedPrompt(topic, gradeLevel);
  }
};

export const QUIZ_PROMPTS = {
  STANDARD_QUIZ: (gradeLevel: number, topic: string) => {
    const gradePrompts = getGradePrompts(gradeLevel);
    return gradePrompts.getQuizSystemPrompt(topic, gradeLevel);
  },

  STANDARD_QUIZ_USER: (gradeLevel: number, topic: string, questionCount: number = 5) => {
    const gradePrompts = getGradePrompts(gradeLevel);
    return gradePrompts.getQuizUserPrompt(topic, gradeLevel, questionCount);
  }
};

export const FEEDBACK_PROMPTS = {
  PERSONALIZED_FEEDBACK: (gradeLevel: number) => {
    const gradePrompts = getGradePrompts(gradeLevel);
    return gradePrompts.getFeedbackSystemPrompt(gradeLevel);
  },

  QUIZ_FEEDBACK_USER: (quizQuestions: any[], userAnswers: number[], score: number, gradeLevel: number) => {
    const gradePrompts = getGradePrompts(gradeLevel);
    return gradePrompts.getQuizFeedbackPrompt(quizQuestions, userAnswers, score, gradeLevel);
  }
};

export const KNOWLEDGE_GRAPH_PROMPTS = {
  KNOWLEDGE_GRAPH: () => `
### ROLE: Cognitive Cartographer & Learning Pathway Architect

Build knowledge structures as directed acyclic graphs optimized for just-in-time learning.
Each node represents a 30-60 second learning chunk with clear prerequisites and assessments.
`,

  KNOWLEDGE_GRAPH_USER: (topic: string, gradeLevel: number) => {
    const gradePrompts = getGradePrompts(gradeLevel);
    return gradePrompts.getKnowledgeGraphPrompt(topic, gradeLevel);
  }
};

export const IMAGE_PROMPTS = {
  EDUCATIONAL_IMAGE: (topic: string, concept: string, gradeLevel: number) => {
    const gradePrompts = getGradePrompts(gradeLevel);
    return gradePrompts.getImagePrompt(topic, concept, gradeLevel);
  },

  EDUCATIONAL_DIAGRAM: (topic: string, diagramType: string, gradeLevel: number) => {
    const gradePrompts = getGradePrompts(gradeLevel);
    return gradePrompts.getDiagramPrompt(topic, diagramType, gradeLevel);
  }
};

export const SVG_PROMPTS = {
  EDUCATIONAL_SVG: (topic: string, concept: string, gradeLevel: number) => {
    const gradePrompts = getGradePrompts(gradeLevel);
    return gradePrompts.getSVGPrompt(topic, concept, gradeLevel);
  }
};

// Legacy support functions
export function getReadingLevelInstructions(gradeLevel: number): string {
  const gradePrompts = getGradePrompts(gradeLevel);
  return gradePrompts.getReadingLevelInstructions();
}

export function getMathematicalNotationRules(gradeLevel: number): string {
  const gradePrompts = getGradePrompts(gradeLevel);
  return gradePrompts.getMathematicalNotationRules();
}

export default {
  LESSON_PROMPTS,
  QUIZ_PROMPTS,
  FEEDBACK_PROMPTS,
  KNOWLEDGE_GRAPH_PROMPTS,
  IMAGE_PROMPTS,
  SVG_PROMPTS,
  getReadingLevelInstructions,
  getMathematicalNotationRules
};