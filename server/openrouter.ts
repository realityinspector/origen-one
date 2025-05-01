import axios from 'axios';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterOptions {
  messages: Message[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  response_format?: {
    type: 'json_schema';
    json_schema: any;
  };
}

interface OpenRouterResponse {
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

/**
 * Makes a request to the OpenRouter API
 */
export async function askOpenRouter(options: OpenRouterOptions): Promise<OpenRouterResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  try {
    const response = await axios.post<OpenRouterResponse>(API_URL, {
      model: options.model || 'openai/gpt-4o', // Default to gpt-4o
      messages: options.messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens,
      stream: options.stream || false,
      response_format: options.response_format,
    }, {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ai-tutor-app.replit.app',
        'X-Title': 'AI Tutor Educational Platform'
      }
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`OpenRouter API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

/**
 * Generate a lesson for a specific grade level and topic
 */
export async function generateLessonContent(gradeLevel: number, topic: string): Promise<string> {
  const messages: Message[] = [
    {
      role: 'system',
      content: 'You are an expert educational content creator specializing in creating engaging, age-appropriate learning materials for children. Create content that is clear, engaging, and designed for the specific grade level.'
    },
    {
      role: 'user',
      content: `Create an educational lesson about "${topic}" for grade ${gradeLevel} students. The lesson should be engaging, informative, and appropriate for the age group. Include a brief introduction, key concepts, examples, and a summary. Format the content in Markdown.`
    }
  ];

  const response = await askOpenRouter({ messages });
  return response.choices[0].message.content;
}

/**
 * Generate quiz questions for a specific grade level and topic
 */
export async function generateQuizQuestions(gradeLevel: number, topic: string, questionCount: number = 5): Promise<any[]> {
  const messages: Message[] = [
    {
      role: 'system',
      content: 'You are an expert educational content creator specializing in creating age-appropriate quiz questions for children. Create multiple-choice questions that are clear, engaging, and appropriate for the specific grade level.'
    },
    {
      role: 'user',
      content: `Create ${questionCount} multiple-choice quiz questions about "${topic}" for grade ${gradeLevel} students. For each question, provide 4 options with one correct answer.`
    }
  ];

  const response_format = {
    type: 'json_schema' as const,
    json_schema: {
      name: 'quiz_questions',
      strict: true,
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'The question text'
            },
            options: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of 4 answer choices'
            },
            correctIndex: {
              type: 'integer',
              description: 'Index of the correct answer (0-3)'
            },
            explanation: {
              type: 'string',
              description: 'Explanation of why the answer is correct'
            }
          },
          required: ['text', 'options', 'correctIndex', 'explanation'],
          additionalProperties: false
        }
      }
    }
  };

  const response = await askOpenRouter({ 
    messages, 
    response_format,
    temperature: 0.5
  });
  
  try {
    // Parse the JSON content directly
    return JSON.parse(response.choices[0].message.content);
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

  const messages: Message[] = [
    {
      role: 'system',
      content: 'You are an encouraging and supportive educational coach providing feedback to young learners. Focus on positive reinforcement while providing helpful guidance.'
    },
    {
      role: 'user',
      content: `Provide personalized feedback for a student who scored ${score}% on a quiz. Here are the details of their performance:\n\n${JSON.stringify(questionAnalysis)}\n\nProvide encouragement, highlight strengths, and give specific recommendations for improvement. Format your response in a friendly tone appropriate for a young learner.`
    }
  ];

  const response = await askOpenRouter({ messages, temperature: 0.7 });
  return response.choices[0].message.content;
}

/**
 * Generate a knowledge graph based on a topic
 */
export async function generateKnowledgeGraph(topic: string, gradeLevel: number): Promise<any> {
  const messages: Message[] = [
    {
      role: 'system',
      content: 'You are an educational expert specializing in creating knowledge graphs for educational content. Create a simple knowledge graph of concepts related to the given topic, appropriate for the specified grade level.'
    },
    {
      role: 'user',
      content: `Create a knowledge graph for "${topic}" appropriate for grade ${gradeLevel} students. Include key concepts and how they relate to each other.`
    }
  ];

  const response_format = {
    type: 'json_schema' as const,
    json_schema: {
      name: 'knowledge_graph',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          nodes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Unique identifier for the node' },
                label: { type: 'string', description: 'Display name for the concept' }
              },
              required: ['id', 'label'],
              additionalProperties: false
            },
            description: 'List of concept nodes in the knowledge graph'
          },
          edges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                source: { type: 'string', description: 'ID of the source node' },
                target: { type: 'string', description: 'ID of the target node' }
              },
              required: ['source', 'target'],
              additionalProperties: false
            },
            description: 'List of relationships between concept nodes'
          }
        },
        required: ['nodes', 'edges'],
        additionalProperties: false
      }
    }
  };

  const response = await askOpenRouter({ 
    messages, 
    response_format,
    temperature: 0.3
  });
  
  try {
    // Parse the JSON content
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Failed to parse knowledge graph JSON:', error);
    throw new Error('Failed to generate knowledge graph');
  }
}
