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
 * Returns grade-specific guidance for AI content generation
 * based on educational standards and cognitive development
 */
function getGradeSpecificGuidance(gradeLevel: number): string {
  // Ensure grade level is within 1-12 range
  const grade = Math.max(1, Math.min(12, gradeLevel));
  
  // Grade bands with appropriate guidance
  if (grade <= 2) {
    return `
      For grades K-2 (ages 5-8):
      - Use very simple language and short sentences
      - Focus on concrete concepts rather than abstract ideas
      - Include visual learning cues ([picture of X])
      - Limit text blocks to 2-3 sentences
      - Use basic vocabulary with definitions for new words
      - Include interactive elements like counting or identifying
      - Celebrate small achievements with encouraging language
    `;
  } 
  else if (grade <= 5) {
    return `
      For grades 3-5 (ages 8-11):
      - Use clear, straightforward language
      - Begin introducing some abstract concepts with concrete examples
      - Keep explanations brief with supporting examples
      - Introduce subject-specific vocabulary with simple definitions
      - Use analogies related to everyday experiences
      - Include opportunities for critical thinking through "why" questions
      - Maintain an encouraging, positive tone
    `;
  }
  else if (grade <= 8) {
    return `
      For grades 6-8 (ages 11-14):
      - Use more complex sentence structures
      - Introduce abstract concepts with real-world applications
      - Connect new knowledge to existing concepts
      - Use discipline-specific vocabulary with context
      - Encourage analytical thinking through comparisons
      - Present multiple perspectives on topics where appropriate
      - Challenge students with deeper "how" and "why" questions
    `;
  }
  else {
    return `
      For grades 9-12 (ages 14-18):
      - Use academic language appropriate for high school level
      - Address complex, abstract concepts
      - Make connections across different subject areas
      - Introduce specialized vocabulary and terminology
      - Encourage critical analysis and evaluation
      - Present multiple theories or interpretations where relevant
      - Promote higher-order thinking through synthesis and evaluation questions
    `;
  }
}

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
    // Ensure grade level is within valid range
    const safeGradeLevel = Math.max(1, Math.min(12, gradeLevel));
    const gradeSpecificGuidance = getGradeSpecificGuidance(safeGradeLevel);
    
    const systemPrompt = `You are an educational assistant creating a lesson for grade ${safeGradeLevel} students on the topic of "${topic}".
      Create a comprehensive, age-appropriate lesson with clear explanations, examples, and engaging content.
      Format the lesson with markdown headings, bullet points, and emphasis where appropriate.
      
      ${gradeSpecificGuidance}
      
      For grade ${safeGradeLevel} students:
      - Keep paragraphs ${safeGradeLevel <= 2 ? 'very short (2-3 sentences)' : 
                         safeGradeLevel <= 5 ? 'brief (3-5 sentences)' : 
                         'appropriately sized for their reading level'}
      - Use ${safeGradeLevel <= 3 ? 'simple vocabulary with definitions for new terms' : 
             safeGradeLevel <= 6 ? 'grade-appropriate vocabulary with context' : 
             'appropriate academic language with clear explanations'}
      - Include ${safeGradeLevel <= 3 ? 'many concrete examples and visual descriptions' : 
                safeGradeLevel <= 6 ? 'relatable examples and real-world applications' : 
                'diverse examples and cross-curricular connections'}
      - Structure with ${safeGradeLevel <= 2 ? 'clear sections and visual elements' : 
                        safeGradeLevel <= 6 ? 'organized sections with headings' : 
                        'logical progression of ideas and supporting details'}`;
    
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
    // Ensure grade level is within valid range
    const safeGradeLevel = Math.max(1, Math.min(12, gradeLevel));
    const gradeSpecificGuidance = getGradeSpecificGuidance(safeGradeLevel);
    
    const systemPrompt = `You are an educational quiz creator making questions for grade ${safeGradeLevel} students on "${topic}".
      Create ${questionCount} multiple-choice questions with 4 options each. Each question should have one correct answer.
      Return the questions as a JSON array where each question has: text, options (array of strings), correctIndex (0-3), and explanation.
      
      ${gradeSpecificGuidance}
      
      For grade ${safeGradeLevel} students:
      - Create questions at the appropriate ${safeGradeLevel <= 2 ? 'early elementary' : 
                                           safeGradeLevel <= 5 ? 'elementary' : 
                                           safeGradeLevel <= 8 ? 'middle school' : 'high school'} difficulty level
      - Use ${safeGradeLevel <= 3 ? 'simple vocabulary and short sentences' : 
              safeGradeLevel <= 6 ? 'grade-appropriate vocabulary' : 
              'appropriate academic terminology'} 
      - ${safeGradeLevel <= 2 ? 'Focus on recall and basic understanding' : 
          safeGradeLevel <= 5 ? 'Include some application questions' : 
          safeGradeLevel <= 8 ? 'Incorporate analysis questions' : 
          'Include evaluation and analysis questions'}`;
    
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
    // Get grade information from the questions
    let gradeLevel = 0;
    // Try to extract grade level from the first question's content or fallback to grade 3
    const questionText = quizQuestions[0]?.text || '';
    const gradeMatch = questionText.match(/grade\s*(\d+)/i);
    if (gradeMatch && gradeMatch[1]) {
      gradeLevel = parseInt(gradeMatch[1], 10);
    } else {
      gradeLevel = 3; // Default grade level
    }
    
    const gradeSpecificGuidance = getGradeSpecificGuidance(gradeLevel);
    
    const systemPrompt = `You are an educational assistant providing feedback on a grade ${gradeLevel} student's quiz performance.
      The student scored ${score}% on a quiz. Analyze their answers and provide constructive, supportive feedback.
      Focus on areas of improvement while celebrating correct answers. Format using markdown with headings and bullet points.
      
      ${gradeSpecificGuidance}
      
      Adapt your feedback to be encouraging, understandable, and appropriate for a grade ${gradeLevel} student.`;
    
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
    // Ensure grade level is within a valid range
    const safeGradeLevel = Math.max(1, Math.min(12, gradeLevel));
    const gradeSpecificGuidance = getGradeSpecificGuidance(safeGradeLevel);
    
    const systemPrompt = `You are an educational knowledge graph creator for grade ${safeGradeLevel} students.
      Create a simple knowledge graph about "${topic}" with key concepts as nodes and their relationships as edges.
      Return a JSON object with two arrays: 'nodes' (each with id and label) and 'edges' (each with source and target node ids).
      
      ${gradeSpecificGuidance}
      
      Ensure the concepts and their relationships are appropriate for the cognitive development and curriculum level of grade ${safeGradeLevel} students.
      
      For grade ${safeGradeLevel}:
      - Include ${safeGradeLevel <= 2 ? '3-5' : safeGradeLevel <= 5 ? '5-8' : '8-12'} main concepts
      - Use ${safeGradeLevel <= 5 ? 'simple, concrete terminology' : 'appropriate academic terminology'}
      - Make relationships ${safeGradeLevel <= 3 ? 'very clear and direct' : 'appropriately complex'}`;
    
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
