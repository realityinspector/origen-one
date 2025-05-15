/**
 * AI Service Adapter
 *
 * This module provides a unified interface for AI services including:
 * - OpenRouter for text generation
 * - Stability AI for image generation
 * - Enhanced lesson generation
 */

import { USE_AI } from '../config/flags';
import axios from "axios";
import { generateEnhancedLesson } from './enhanced-lesson-service';
import { LessonSection, LessonDiagram, LessonImage, EnhancedLessonSpec } from '../../shared/schema';

// Re-export the enhanced lesson generator
export { generateEnhancedLesson };

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
    schema: any;
  };
};

// Define the return type of the chat function
export interface ChatResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const HEADERS = (key: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${key}`,
  "HTTP-Referer": "https://origen-ai-tutor.replit.app", // required by OpenRouter
  "X-Title": "ORIGEN - The Open Source AI Tutor"
});

/**
 * Makes a request to the OpenRouter API
 */
export async function chat(
  messages: Message[],
  options: ChatOptions = {}
): Promise<string> {
  if (!USE_AI) {
    throw new Error('AI generation is disabled (USE_AI=0)');
  }

  const { 
    model = "anthropic/claude-3-haiku", 
    temperature = 0.7, 
    max_tokens, 
    response_format 
  } = options;

  try {
    const { data } = await axios.post<ChatResponse>(
      ENDPOINT,
      { model, messages, temperature, max_tokens, stream: false, response_format },
      { headers: HEADERS(process.env.OPENROUTER_API_KEY!) }
    );
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI provider error:', error);
    throw error;
  }
}

/**
 * Generate a lesson for a specific grade level and topic
 * This function can either return a simple markdown string (legacy)
 * or generate a full enhanced lesson if the enhanced parameter is true
 */
export async function generateLessonContent(
  gradeLevel: number, 
  topic: string,
  enhanced: boolean = false
): Promise<string | EnhancedLessonSpec> {
  if (!USE_AI) {
    throw new Error('AI generation is disabled (USE_AI=0)');
  }

  // If enhanced mode requested, use the enhanced lesson generator
  if (enhanced) {
    try {
      console.log(`Generating enhanced lesson about "${topic}" for grade ${gradeLevel}`);
      const enhancedLesson = await generateEnhancedLesson(gradeLevel, topic, true);
      
      if (!enhancedLesson) {
        throw new Error('Enhanced lesson generation failed');
      }
      
      return enhancedLesson;
    } catch (error) {
      console.error("Error generating enhanced lesson:", error);
      throw error;
    }
  } 
  
  // Legacy lesson generation (simple markdown)
  try {
    console.log(`Generating legacy lesson about "${topic}" for grade ${gradeLevel}`);
    const systemPrompt = `You are an educational assistant creating a lesson for grade ${gradeLevel} students on the topic of "${topic}".
      Create a comprehensive, age-appropriate lesson with clear explanations, examples, and engaging content.
      Format the lesson with markdown headings, bullet points, and emphasis where appropriate.`;

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Create an educational lesson about "${topic}" for grade ${gradeLevel} students.` }
    ];

    return await chat(messages, {
      model: "anthropic/claude-3-haiku",
      temperature: 0.7,
      max_tokens: 1500
    });
  } catch (error) {
    console.error("Error generating lesson content:", error);
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
    const systemPrompt = `You are an expert educational content creator specializing in creating age-appropriate quiz questions for children. Create multiple-choice questions that are clear, engaging, and appropriate for grade ${gradeLevel} students.`;

    const userPrompt = `Create ${questionCount} multiple-choice quiz questions about "${topic}". For each question, provide 4 options with one correct answer. The correct answer should be indicated with the index (0-3).`;

    // Define the JSON schema
    const schema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          correctIndex: { type: 'integer' },
          explanation: { type: 'string' }
        },
        required: ['text', 'options', 'correctIndex', 'explanation']
      }
    };

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    const response = await chat(messages, {
      model: "anthropic/claude-3-haiku", 
      temperature: 0.5,
      response_format: {
        type: 'json_schema',
        schema
      }
    });

    // Parse the JSON response
    return JSON.parse(response);
  } catch (error) {
    console.error("Error generating quiz questions:", error);
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
    // Prepare the data for the AI
    const questionsWithAnswers = quizQuestions.map((q, i) => {
      const userAnswerCorrect = userAnswers[i] === q.correctIndex;
      return {
        question: q.text,
        userAnswer: q.options[userAnswers[i]],
        correctAnswer: q.options[q.correctIndex],
        isCorrect: userAnswerCorrect,
        explanation: q.explanation
      };
    });

    const systemPrompt = `You are an encouraging educational assistant providing feedback to a student based on their quiz performance. The student scored ${score}% on their quiz. Review their answers and provide personalized, constructive feedback that emphasizes what they did well and suggests areas for improvement.`;

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Here are the student's answers:\n${JSON.stringify(questionsWithAnswers, null, 2)}\nPlease provide personalized feedback based on these results.` }
    ];

    return await chat(messages, {
      model: "anthropic/claude-3-haiku",
      temperature: 0.7
    });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return "Great effort on your quiz! Keep practicing to improve your understanding of the topic.";
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
    const systemPrompt = `You are an expert educational content creator designing a knowledge graph about "${topic}" for grade ${gradeLevel} students. Create a graph with nodes representing key concepts and edges representing relationships between them.`;

    const schema = {
      type: 'object',
      properties: {
        nodes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              label: { type: 'string' }
            },
            required: ['id', 'label']
          }
        },
        edges: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              source: { type: 'string' },
              target: { type: 'string' }
            },
            required: ['source', 'target']
          }
        }
      },
      required: ['nodes', 'edges']
    };

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Create a knowledge graph about "${topic}" for grade ${gradeLevel} students. The graph should include key concepts as nodes and relationships between concepts as edges.` }
    ];

    const response = await chat(messages, {
      model: "anthropic/claude-3-haiku",
      temperature: 0.5,
      response_format: {
        type: 'json_schema',
        schema
      }
    });

    // Parse the JSON response
    return JSON.parse(response);
  } catch (error) {
    console.error("Error generating knowledge graph:", error);
    
    // Return a simple fallback graph
    return {
      nodes: [
        { id: "main", label: topic },
        { id: "sub1", label: `Basic ${topic}` },
        { id: "sub2", label: `Advanced ${topic}` },
        { id: "related1", label: "Related Concept 1" },
        { id: "related2", label: "Related Concept 2" }
      ],
      edges: [
        { source: "main", target: "sub1" },
        { source: "main", target: "sub2" },
        { source: "main", target: "related1" },
        { source: "main", target: "related2" },
        { source: "sub1", target: "related1" }
      ]
    };
  }
}