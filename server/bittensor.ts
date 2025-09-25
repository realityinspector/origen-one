import axios from 'axios';

const BITTENSOR_API_KEY = process.env.BITTENSOR_API_KEY;
const BITTENSOR_SUBNET_1_URL = process.env.BITTENSOR_SUBNET_1_URL || 'https://archive.opentensor.ai/graphql';
const BITTENSOR_WALLET_NAME = process.env.BITTENSOR_WALLET_NAME;
const BITTENSOR_WALLET_HOTKEY = process.env.BITTENSOR_WALLET_HOTKEY;

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface BittensorOptions {
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

export interface BittensorResponse {
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
 * Makes a request to Bittensor Subnet 1
 * Uses the GraphQL API for miner selection and inference
 */
export async function askBittensor(options: BittensorOptions): Promise<BittensorResponse> {
  if (!BITTENSOR_API_KEY) {
    throw new Error('BITTENSOR_API_KEY is not set');
  }

  try {
    // For Bittensor subnet 1, we need to:
    // 1. Query available miners on subnet 1
    // 2. Select a miner (could be random, highest stake, or lowest latency)
    // 3. Make inference request to selected miner

    // First, query available miners
    const minersQuery = `
      query {
        miners(netuid: 1, active: true) {
          id
          stake
          emission
          validator_trust
          last_update
        }
      }
    `;

    const minersResponse = await axios.post(BITTENSOR_SUBNET_1_URL, {
      query: minersQuery
    }, {
      headers: {
        'Authorization': `Bearer ${BITTENSOR_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const miners = minersResponse.data.data?.miners || [];
    if (miners.length === 0) {
      throw new Error('No active miners found on Bittensor subnet 1');
    }

    // Select miner with highest stake for reliability
    const selectedMiner = miners.reduce((prev: any, current: any) =>
      (prev.stake > current.stake) ? prev : current
    );

    console.log(`Selected Bittensor miner: ${selectedMiner.id} (stake: ${selectedMiner.stake})`);

    // Now make inference request to selected miner
    const inferencePayload = {
      messages: options.messages,
      model: options.model || 'subnet1-text-generation',
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1024,
      miner_id: selectedMiner.id,
      // Bittensor specific parameters
      netuid: 1,
      wallet_name: BITTENSOR_WALLET_NAME,
      wallet_hotkey: BITTENSOR_WALLET_HOTKEY
    };

    // The actual inference endpoint would depend on the miner's API
    // This is a placeholder - actual implementation would need miner-specific endpoints
    const inferenceUrl = `https://miner-${selectedMiner.id}.bittensor.io/inference`;

    const response = await axios.post(inferenceUrl, inferencePayload, {
      headers: {
        'Authorization': `Bearer ${BITTENSOR_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Bittensor-Netuid': '1'
      },
      timeout: 30000 // 30 second timeout for inference
    });

    // Transform response to match OpenRouter format for compatibility
    return {
      id: response.data.id || `bt_${Date.now()}`,
      model: response.data.model || 'bittensor-subnet1',
      object: 'chat.completion',
      created: response.data.created || Math.floor(Date.now() / 1000),
      choices: [{
        index: 0,
        finish_reason: response.data.finish_reason || 'stop',
        message: {
          role: 'assistant',
          content: response.data.content || response.data.response
        }
      }],
      usage: {
        prompt_tokens: response.data.usage?.prompt_tokens || options.messages.reduce((sum, msg) => sum + msg.content.length, 0) / 4,
        completion_tokens: response.data.usage?.completion_tokens || (response.data.content?.length || 0) / 4,
        total_tokens: response.data.usage?.total_tokens || 0
      }
    };

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Bittensor Subnet 1 API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

import { LESSON_PROMPTS } from './prompts';

/**
 * Generate a lesson for a specific grade level and topic using Bittensor
 */
export async function generateLessonContent(gradeLevel: number, topic: string): Promise<string> {
  const messages: Message[] = [
    {
      role: 'system',
      content: LESSON_PROMPTS.STANDARD_LESSON(gradeLevel, topic)
    },
    {
      role: 'user',
      content: LESSON_PROMPTS.STANDARD_LESSON_USER(gradeLevel, topic)
    }
  ];

  const response = await askBittensor({
    messages,
    model: 'subnet1-educational-content',
    temperature: 0.3, // Lower temperature for more consistent educational content
    max_tokens: 2048
  });

  return response.choices[0].message.content;
}

import { QUIZ_PROMPTS } from './prompts';

/**
 * Generate quiz questions for a specific grade level and topic using Bittensor
 */
export async function generateQuizQuestions(gradeLevel: number, topic: string, questionCount: number = 5): Promise<any[]> {
  const messages: Message[] = [
    {
      role: 'system',
      content: QUIZ_PROMPTS.STANDARD_QUIZ(gradeLevel, topic)
    },
    {
      role: 'user',
      content: QUIZ_PROMPTS.STANDARD_QUIZ_USER(gradeLevel, topic, questionCount)
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

  const response = await askBittensor({
    messages,
    response_format,
    temperature: 0.4, // Slightly higher than lesson generation for creativity in question writing
    max_tokens: 1536
  });

  try {
    // Parse the JSON content directly
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Failed to parse quiz questions JSON:', error);
    throw new Error('Failed to generate quiz questions');
  }
}

import { FEEDBACK_PROMPTS } from './prompts';

/**
 * Generate personalized feedback for a learner based on their quiz performance using Bittensor
 */
export async function generateFeedback(quizQuestions: any[], userAnswers: number[], score: number, gradeLevel: number): Promise<string> {
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
      content: FEEDBACK_PROMPTS.PERSONALIZED_FEEDBACK(gradeLevel)
    },
    {
      role: 'user',
      content: FEEDBACK_PROMPTS.QUIZ_FEEDBACK_USER(quizQuestions, userAnswers, score, gradeLevel)
    }
  ];

  const response = await askBittensor({
    messages,
    temperature: 0.6, // Higher temperature for more personalized and encouraging feedback
    max_tokens: 1024
  });

  return response.choices[0].message.content;
}

import { KNOWLEDGE_GRAPH_PROMPTS } from './prompts';

/**
 * Generate a knowledge graph based on a topic using Bittensor
 */
export async function generateKnowledgeGraph(topic: string, gradeLevel: number): Promise<any> {
  const messages: Message[] = [
    {
      role: 'system',
      content: KNOWLEDGE_GRAPH_PROMPTS.KNOWLEDGE_GRAPH()
    },
    {
      role: 'user',
      content: KNOWLEDGE_GRAPH_PROMPTS.KNOWLEDGE_GRAPH_USER(topic, gradeLevel)
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

  const response = await askBittensor({
    messages,
    response_format,
    temperature: 0.2, // Low temperature for consistent graph structure
    max_tokens: 1536
  });

  try {
    // Parse the JSON content
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Failed to parse knowledge graph JSON:', error);
    throw new Error('Failed to generate knowledge graph');
  }
}
