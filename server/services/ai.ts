/**
 * AI Service Adapter
 *
 * This module provides a unified interface to different AI providers like OpenRouter 
 * and Perplexity. It abstracts the provider-specific details behind a common interface.
 */

import { USE_AI } from '../config/flags';
import * as OpenRouter from '../openrouter';
import * as Perplexity from '../perplexity';

// Re-export the message type
export type Message = { 
  role: "system" | "user" | "assistant"; 
  content: string 
};

// Common options for all AI chat functions
export type ChatOptions = {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: {
    type: 'json_schema';
    json_schema: any;
  };
};

// Choose the AI provider to use (could be based on config, availability, etc.)
const usingPerplexity = process.env.AI_PROVIDER === 'perplexity';

/**
 * Makes a request to the chosen AI API
 */
export async function chat(
  messages: Message[],
  options: ChatOptions = {}
) {
  if (!USE_AI) {
    throw new Error('AI generation is disabled (USE_AI=0)');
  }

  try {
    // Route to appropriate provider
    if (usingPerplexity) {
      return await Perplexity.askPerplexity({
        messages,
        model: options.model,
        temperature: options.temperature,
        max_tokens: options.max_tokens
      });
    } else {
      return await OpenRouter.askOpenRouter({
        messages,
        model: options.model,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        response_format: options.response_format
      });
    }
  } catch (error) {
    console.error('AI provider error:', error);
    throw error;
  }
}

/**
 * Generate a lesson for a specific grade level and topic
 */
export async function generateLessonContent(gradeLevel: number, topic: string): Promise<string> {
  if (!USE_AI) {
    throw new Error('AI generation is disabled (USE_AI=0)');
  }

  try {
    if (usingPerplexity) {
      return await Perplexity.generateLessonContent(gradeLevel, topic);
    } else {
      return await OpenRouter.generateLessonContent(gradeLevel, topic);
    }
  } catch (error) {
    console.error('Failed to generate lesson content:', error);
    throw error;
  }
}

/**
 * Generate quiz questions for a specific grade level and topic
 */
export async function generateQuizQuestions(gradeLevel: number, topic: string, questionCount: number = 5): Promise<any[]> {
  if (!USE_AI) {
    throw new Error('AI generation is disabled (USE_AI=0)');
  }

  try {
    if (usingPerplexity) {
      return await Perplexity.generateQuizQuestions(gradeLevel, topic, questionCount);
    } else {
      return await OpenRouter.generateQuizQuestions(gradeLevel, topic, questionCount);
    }
  } catch (error) {
    console.error('Failed to generate quiz questions:', error);
    throw error;
  }
}

/**
 * Generate personalized feedback for a learner based on their quiz performance
 */
export async function generateFeedback(quizQuestions: any[], userAnswers: number[], score: number): Promise<string> {
  if (!USE_AI) {
    throw new Error('AI generation is disabled (USE_AI=0)');
  }

  try {
    if (usingPerplexity) {
      return await Perplexity.generateFeedback(quizQuestions, userAnswers, score);
    } else {
      return await OpenRouter.generateFeedback(quizQuestions, userAnswers, score);
    }
  } catch (error) {
    console.error('Failed to generate feedback:', error);
    throw error;
  }
}

/**
 * Generate a knowledge graph based on a topic
 */
export async function generateKnowledgeGraph(topic: string, gradeLevel: number): Promise<any> {
  if (!USE_AI) {
    throw new Error('AI generation is disabled (USE_AI=0)');
  }

  try {
    // Only OpenRouter implementation exists currently
    return await OpenRouter.generateKnowledgeGraph(topic, gradeLevel);
  } catch (error) {
    console.error('Failed to generate knowledge graph:', error);
    throw error;
  }
}
