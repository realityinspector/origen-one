import axios from 'axios';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const API_URL = 'https://api.perplexity.ai/chat/completions';

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityApiOptions {
  messages: PerplexityMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  search_recency_filter?: 'day' | 'week' | 'month' | 'year';
}

interface PerplexityApiResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations: string[];
  choices: {
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta: {
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

/**
 * Makes a request to the Perplexity API
 */
export async function askPerplexity(options: PerplexityApiOptions): Promise<PerplexityApiResponse> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY is not set');
  }

  try {
    const response = await axios.post<PerplexityApiResponse>(API_URL, {
      model: options.model || 'llama-3.1-sonar-small-128k-online',
      messages: options.messages,
      temperature: options.temperature || 0.2,
      max_tokens: options.max_tokens,
      search_recency_filter: options.search_recency_filter || 'month',
      return_images: false,
      return_related_questions: false,
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1
    }, {
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Perplexity API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

import { LESSON_PROMPTS } from './prompts';

/**
 * Generate a lesson for a specific grade level and topic
 */
export async function generateLessonContent(gradeLevel: number, topic: string): Promise<string> {
  const messages: PerplexityMessage[] = [
    {
      role: 'system',
      content: LESSON_PROMPTS.STANDARD_LESSON(gradeLevel, topic)
    },
    {
      role: 'user',
      content: LESSON_PROMPTS.STANDARD_LESSON_USER(gradeLevel, topic)
    }
  ];

  const response = await askPerplexity({ messages });
  return response.choices[0].message.content;
}

/**
 * Generate quiz questions for a specific grade level and topic
 */
export async function generateQuizQuestions(gradeLevel: number, topic: string, questionCount: number = 5): Promise<any[]> {
  const messages: PerplexityMessage[] = [
    {
      role: 'system',
      content: 'You are an expert educational content creator specializing in creating age-appropriate quiz questions for children. Create multiple-choice questions that are clear, engaging, and appropriate for the specific grade level.'
    },
    {
      role: 'user',
      content: `Create ${questionCount} multiple-choice quiz questions about "${topic}" for grade ${gradeLevel} students. For each question, provide 4 options with one correct answer. Format your response as a JSON array of objects, where each object has the format: { "text": "What is X?", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "Explanation of why A is correct" }`
    }
  ];

  const response = await askPerplexity({ messages });
  try {
    const content = response.choices[0].message.content;
    // Extract JSON from the response - sometimes the API might return markdown formatted JSON
    const jsonMatch = content.match(/```json([\s\S]*?)```/) || content.match(/```([\s\S]*?)```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : content.trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse quiz questions JSON:', error);
    throw new Error('Failed to generate quiz questions');
  }
}

/**
 * Generate personalized feedback for a learner based on their quiz performance
 */
export async function generateFeedback(quizQuestions: any[], userAnswers: number[], score: number): Promise<string> {
  const questionAnalysis = quizQuestions.map((q, i) => {
    const isCorrect = userAnswers[i] === q.correctIndex;
    return {
      question: q.text,
      userAnswer: q.options[userAnswers[i]],
      correctAnswer: q.options[q.correctIndex],
      isCorrect,
      explanation: q.explanation
    };
  });

  const messages: PerplexityMessage[] = [
    {
      role: 'system',
      content: 'You are an encouraging and supportive educational coach providing feedback to young learners. Focus on positive reinforcement while providing helpful guidance.'
    },
    {
      role: 'user',
      content: `Provide personalized feedback for a student who scored ${score}% on a quiz. Here are the details of their performance:\n\n${JSON.stringify(questionAnalysis)}\n\nProvide encouragement, highlight strengths, and give specific recommendations for improvement. Format your response in a friendly tone appropriate for a young learner.`
    }
  ];

  const response = await askPerplexity({ messages });
  return response.choices[0].message.content;
}
