/**
 * AI Service Adapter
 *
 * This module provides a unified interface for the OpenRouter AI provider
 * with Llama models.
 */

import { USE_AI } from '../config/flags';
import axios from "axios";

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
    model = "openai/gpt-4o", 
    temperature = 0.8, 
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
 */
export async function generateLessonContent(gradeLevel: number, topic: string): Promise<string> {
  if (!USE_AI) {
    throw new Error('AI generation is disabled (USE_AI=0)');
  }

  try {
    const systemPrompt = `You are an educational assistant creating a lesson for grade ${gradeLevel} students on the topic of "${topic}".
      Create a comprehensive, age-appropriate lesson with clear explanations, examples, and engaging content.
      Format the lesson with markdown headings, bullet points, and emphasis where appropriate.`;
    
    const userPrompt = `Please create a lesson about ${topic} suitable for grade ${gradeLevel} students.`;
    
    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    
    return await chat(messages, { temperature: 0.7 });
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
    const systemPrompt = `You are an educational quiz creator making questions for grade ${gradeLevel} students on "${topic}".
      Create ${questionCount} multiple-choice questions with 4 options each. Each question should have one correct answer.
      Return the questions as a JSON array where each question has: text, options (array of strings), correctIndex (0-3), and explanation.`;
    
    const userPrompt = `Create ${questionCount} quiz questions about ${topic} suitable for grade ${gradeLevel} students.`;
    
    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    
    const jsonSchema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          correctIndex: { type: 'integer', minimum: 0, maximum: 3 },
          explanation: { type: 'string' }
        },
        required: ['text', 'options', 'correctIndex']
      }
    };
    
    const response = await chat(messages, { 
      temperature: 0.7,
      response_format: { type: 'json_schema', json_schema: jsonSchema }
    });
    
    return JSON.parse(response);
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
    const systemPrompt = `You are an educational assistant providing feedback on a student's quiz performance.
      The student scored ${score}% on a quiz. Analyze their answers and provide constructive, supportive feedback.
      Focus on areas of improvement while celebrating correct answers. Format using markdown with headings and bullet points.`;
    
    // Construct a detailed prompt with the questions and answers
    let userPrompt = `Please provide personalized feedback on this quiz result:\n\n`;
    quizQuestions.forEach((question, index) => {
      const isCorrect = userAnswers[index] === question.correctIndex;
      userPrompt += `Question ${index + 1}: ${question.text}\n`;
      userPrompt += `Student's answer: ${question.options[userAnswers[index]]}\n`;
      userPrompt += `Correct answer: ${question.options[question.correctIndex]}\n`;
      userPrompt += `Result: ${isCorrect ? 'Correct' : 'Incorrect'}\n\n`;
    });
    
    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    
    return await chat(messages, { temperature: 0.7 });
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
    const systemPrompt = `You are an educational knowledge graph creator for grade ${gradeLevel} students.
      Create a simple knowledge graph about "${topic}" with key concepts as nodes and their relationships as edges.
      Return a JSON object with two arrays: 'nodes' (each with id and label) and 'edges' (each with source and target node ids).`;
    
    const userPrompt = `Create a knowledge graph about ${topic} suitable for grade ${gradeLevel} students.`;
    
    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];
    
    const jsonSchema = {
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
    
    const response = await chat(messages, { 
      temperature: 0.7,
      response_format: { type: 'json_schema', json_schema: jsonSchema }
    });
    
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to generate knowledge graph:', error);
    throw error;
  }
}
