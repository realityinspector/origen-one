/**
 * Enhanced Lesson Generator Service
 * 
 * This module provides functionality to generate enhanced lessons with
 * rich content, formatting, and images using OpenRouter and Stability AI.
 */

import axios from "axios";
// Fix for nanoid ESM module issue - use crypto module instead
import crypto from 'crypto';

// Helper function to generate unique IDs (replacement for nanoid)
function generateId(length: number = 10): string {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}
import { USE_AI } from "../config/flags";
import { 
  EnhancedLessonSpec, 
  LessonImage,
  LessonSection,
  LessonDiagram
} from "../../shared/schema";
import { generateLessonImage, generateDiagram } from "./stability-service";

// Utility to determine which types of diagrams are needed based on topic
function determineDiagramsNeeded(topic: string, gradeLevel: number): { type: string; title: string }[] {
  const diagrams = [];
  
  // Generic diagrams for all topics
  diagrams.push({ type: "flowchart", title: `${topic} Process` });
  
  // Topic-specific diagrams
  if (topic.toLowerCase().includes("math")) {
    diagrams.push({ type: "hierarchy", title: `${topic} Concept Hierarchy` });
  } else if (topic.toLowerCase().includes("science")) {
    diagrams.push({ type: "cycle", title: `${topic} Cycle` });
    diagrams.push({ type: "process", title: `${topic} Process Flow` });
  } else if (topic.toLowerCase().includes("history")) {
    diagrams.push({ type: "timeline", title: `${topic} Timeline` });
  } else if (topic.toLowerCase().includes("language")) {
    diagrams.push({ type: "comparison", title: `${topic} Comparison` });
  }
  
  // Limit the number of diagrams based on grade level
  // Younger students get fewer diagrams to avoid overwhelming them
  const maxDiagrams = gradeLevel <= 3 ? 1 : (gradeLevel <= 6 ? 2 : 3);
  
  return diagrams.slice(0, maxDiagrams);
}

/**
 * Generate the structure for an enhanced lesson
 */
async function generateLessonStructure(gradeLevel: number, topic: string): Promise<any> {
  if (!USE_AI) {
    throw new Error('AI generation is disabled (USE_AI=0)');
  }
  
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required for lesson generation');
  }
  
  try {
    const systemPrompt = `You are an expert educational curriculum designer creating a lesson structure for grade ${gradeLevel} students on the topic of "${topic}".
    Create an outline with sections appropriate for this grade level and topic. Include a title, subtitle, and 3-6 section titles.`;
    
    // Define the JSON schema for structured output
    const jsonSchema = {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Engaging lesson title' },
        subtitle: { type: 'string', description: 'Brief subtitle or tagline for the lesson' },
        summary: { type: 'string', description: 'Brief 1-2 sentence overview of the lesson' },
        sections: { 
          type: 'array', 
          description: 'List of section titles and types',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Section title' },
              type: { 
                type: 'string', 
                enum: ['introduction', 'key_concepts', 'examples', 'practice', 'summary', 'fun_facts'],
                description: 'Section type' 
              }
            },
            required: ['title', 'type']
          }
        },
        estimatedDuration: { type: 'number', description: 'Estimated time to complete the lesson in minutes' },
        difficultyLevel: { 
          type: 'string', 
          enum: ['beginner', 'intermediate', 'advanced'],
          description: 'Difficulty level of the lesson' 
        },
        keywords: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'List of 3-5 keywords related to the lesson'
        },
        relatedTopics: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'List of 2-4 related topics'
        }
      },
      required: ['title', 'summary', 'sections', 'estimatedDuration', 'difficultyLevel', 'keywords']
    };
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-haiku',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a lesson structure about "${topic}" for grade ${gradeLevel} students. Make it age-appropriate and educational.` }
        ],
        temperature: 0.7,
        response_format: {
          type: 'json_schema',
          schema: jsonSchema
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://origen-ai-tutor.replit.app',
          'X-Title': 'ORIGEN - The Open Source AI Tutor'
        }
      }
    );
    
    // Parse and return the structured output
    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error generating lesson structure:', error);
    throw error;
  }
}

/**
 * Generate detailed content for each lesson section
 */
async function generateSectionContent(
  topic: string,
  gradeLevel: number,
  sectionTitle: string,
  sectionType: string
): Promise<string> {
  if (!USE_AI) {
    throw new Error('AI generation is disabled (USE_AI=0)');
  }
  
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required for content generation');
  }
  
  try {
    // Tailor prompt based on section type
    let sectionGuidance = '';
    switch (sectionType) {
      case 'introduction':
        sectionGuidance = 'Create an engaging introduction that hooks the student\'s interest and provides context for the topic.';
        break;
      case 'key_concepts':
        sectionGuidance = 'Explain the core concepts clearly with definitions, explanations, and connections to prior knowledge.';
        break;
      case 'examples':
        sectionGuidance = 'Provide concrete, relatable examples that illustrate the concepts. Include step-by-step explanations where appropriate.';
        break;
      case 'practice':
        sectionGuidance = 'Create interactive exercises or problems for students to apply what they\'ve learned.';
        break;
      case 'summary':
        sectionGuidance = 'Recap the key points covered in the lesson and emphasize the most important takeaways.';
        break;
      case 'fun_facts':
        sectionGuidance = 'Share interesting and surprising facts related to the topic that will engage students.';
        break;
      default:
        sectionGuidance = 'Create educational content that is clear, engaging, and appropriate for the grade level.';
    }
    
    const systemPrompt = `You are an expert educational content creator writing a ${sectionType} section titled "${sectionTitle}" for a lesson about "${topic}" for grade ${gradeLevel} students.
    
    ${sectionGuidance}
    
    Format the content in Markdown with appropriate headings, bullet points, and emphasis. Use age-appropriate language and examples.
    If relevant, include simple mathematical notations, diagrams descriptions, or step-by-step instructions.
    
    Do not use placeholder content. Create detailed, educational content that directly teaches the topic.`;
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-opus',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Write the "${sectionTitle}" section for a grade ${gradeLevel} lesson about ${topic}.` }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://origen-ai-tutor.replit.app',
          'X-Title': 'ORIGEN - The Open Source AI Tutor'
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(`Error generating content for section "${sectionTitle}":`, error);
    return `# ${sectionTitle}\n\nContent for this section could not be generated.`;
  }
}

/**
 * Generate quiz questions for the lesson
 */
async function generateEnhancedQuizQuestions(
  topic: string,
  gradeLevel: number,
  questionCount: number = 5
): Promise<any[]> {
  if (!USE_AI) {
    throw new Error('AI generation is disabled (USE_AI=0)');
  }
  
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required for question generation');
  }
  
  try {
    const systemPrompt = `You are an expert educational assessment designer creating quiz questions about "${topic}" for grade ${gradeLevel} students.
    Create ${questionCount} multiple-choice questions that test understanding of key concepts.
    Vary the difficulty and complexity appropriately for the grade level.
    Each question should have 4 options with one correct answer, a clear explanation for the answer, and difficulty level.`;
    
    // Define the JSON schema for structured output
    const jsonSchema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Question text' },
          options: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Array of 4 answer choices'
          },
          correctIndex: { 
            type: 'integer',
            description: 'Index of correct answer (0-3)' 
          },
          explanation: { 
            type: 'string',
            description: 'Explanation of the correct answer' 
          },
          difficulty: { 
            type: 'string',
            enum: ['easy', 'medium', 'hard'],
            description: 'Difficulty level of the question' 
          },
          type: { 
            type: 'string',
            enum: ['multiple_choice', 'true_false', 'image_based', 'sequence'],
            description: 'Type of question' 
          }
        },
        required: ['text', 'options', 'correctIndex', 'explanation', 'difficulty', 'type']
      }
    };
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-haiku',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create ${questionCount} quiz questions about "${topic}" for grade ${gradeLevel} students.` }
        ],
        temperature: 0.7,
        response_format: {
          type: 'json_schema',
          schema: jsonSchema
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://origen-ai-tutor.replit.app',
          'X-Title': 'ORIGEN - The Open Source AI Tutor'
        }
      }
    );
    
    // Parse and return the structured output
    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw error;
  }
}

/**
 * Generate a knowledge graph for the lesson topic
 */
async function generateEnhancedKnowledgeGraph(
  topic: string,
  gradeLevel: number
): Promise<any> {
  if (!USE_AI) {
    throw new Error('AI generation is disabled (USE_AI=0)');
  }
  
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required for knowledge graph generation');
  }
  
  try {
    const systemPrompt = `You are an expert educational content creator designing a knowledge graph about "${topic}" for grade ${gradeLevel} students.
    Create a graph with nodes representing key concepts and edges representing relationships between them.
    Make it appropriate for the grade level in complexity and depth.`;
    
    // Define the JSON schema for structured output
    const jsonSchema = {
      type: 'object',
      properties: {
        nodes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Unique identifier for the node' },
              label: { type: 'string', description: 'Display label for the node' },
              category: { type: 'string', description: 'Category or type of the node' },
              importance: { type: 'number', description: 'Importance score (1-10)' }
            },
            required: ['id', 'label']
          }
        },
        edges: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              source: { type: 'string', description: 'Source node ID' },
              target: { type: 'string', description: 'Target node ID' },
              label: { type: 'string', description: 'Relationship label' },
              strength: { type: 'number', description: 'Relationship strength (1-10)' }
            },
            required: ['source', 'target']
          }
        }
      },
      required: ['nodes', 'edges']
    };
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-haiku',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a knowledge graph about "${topic}" for grade ${gradeLevel} students with 8-12 nodes and appropriate connections.` }
        ],
        temperature: 0.7,
        response_format: {
          type: 'json_schema',
          schema: jsonSchema
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://origen-ai-tutor.replit.app',
          'X-Title': 'ORIGEN - The Open Source AI Tutor'
        }
      }
    );
    
    // Parse and return the structured output
    return JSON.parse(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    
    // Return a simple fallback graph
    return {
      nodes: [
        { id: 'main', label: topic, importance: 10 },
        { id: 'sub1', label: `${topic} Basics`, importance: 8 },
        { id: 'sub2', label: `Advanced ${topic}`, importance: 6 },
        { id: 'related1', label: 'Related Concept 1', importance: 5 },
        { id: 'related2', label: 'Related Concept 2', importance: 5 }
      ],
      edges: [
        { source: 'main', target: 'sub1', label: 'includes' },
        { source: 'main', target: 'sub2', label: 'includes' },
        { source: 'main', target: 'related1', label: 'relates to' },
        { source: 'main', target: 'related2', label: 'relates to' },
        { source: 'sub1', target: 'related1', label: 'connects to' }
      ]
    };
  }
}

/**
 * Generate the complete enhanced lesson with all components
 */
export async function generateEnhancedLesson(
  gradeLevel: number,
  topic: string
): Promise<EnhancedLessonSpec> {
  if (!USE_AI) {
    throw new Error('AI generation is disabled (USE_AI=0)');
  }
  
  try {
    console.log(`Generating enhanced lesson for grade ${gradeLevel} about "${topic}"`);
    
    // 1. Generate the lesson structure
    const structure = await generateLessonStructure(gradeLevel, topic);
    console.log('Lesson structure generated');
    
    // 2. Generate the main featured image
    const mainImagePromise = generateLessonImage(
      topic,
      gradeLevel,
      `Main educational illustration about ${topic}`
    );
    
    // 3. Generate quiz questions
    const questionsPromise = generateEnhancedQuizQuestions(topic, gradeLevel, 5);
    
    // 4. Generate the knowledge graph
    const graphPromise = generateEnhancedKnowledgeGraph(topic, gradeLevel);
    
    // 5. Determine which diagrams to generate
    const diagramSpecs = determineDiagramsNeeded(topic, gradeLevel);
    const diagramPromises = diagramSpecs.map(spec => 
      generateDiagram(topic, gradeLevel, spec.type)
        .then(svgData => ({
          id: generateId(10),
          type: spec.type as any,
          title: spec.title,
          svgData,
          description: `A ${spec.type} diagram about ${topic}`
        }))
    );
    
    // 6. Generate content for each section in parallel
    const sectionsPromises = structure.sections.map(async (section: any) => {
      const content = await generateSectionContent(
        topic,
        gradeLevel,
        section.title,
        section.type
      );
      
      return {
        ...section,
        content
      };
    });
    
    // 7. Wait for all promises to resolve
    const [
      mainImage,
      questions,
      graph,
      diagrams,
      sections
    ] = await Promise.all([
      mainImagePromise,
      questionsPromise,
      graphPromise,
      Promise.all(diagramPromises),
      Promise.all(sectionsPromises)
    ]);
    
    console.log('All lesson components generated successfully');
    
    // 8. Generate section images (for the first 3 sections)
    const sectionImagePromises = sections.slice(0, 3).map((section: LessonSection, index: number) => {
      return generateLessonImage(
        topic,
        gradeLevel,
        `Illustration for "${section.title}" section`
      );
    });
    
    const sectionImages = await Promise.all(sectionImagePromises);
    
    // Assign image IDs to sections
    sectionImages.forEach((image: LessonImage, index: number) => {
      if (sections[index].imageIds === undefined) {
        sections[index].imageIds = [];
      }
      sections[index].imageIds.push(image.id);
    });
    
    // 9. Combine all images
    const allImages = [mainImage, ...sectionImages];
    
    // 10. Assemble and return the complete enhanced lesson
    return {
      title: structure.title,
      targetGradeLevel: gradeLevel,
      subtitle: structure.subtitle,
      summary: structure.summary,
      sections,
      featuredImage: mainImage.id,
      images: allImages,
      diagrams,
      questions,
      graph,
      keywords: structure.keywords,
      relatedTopics: structure.relatedTopics || [],
      estimatedDuration: structure.estimatedDuration,
      difficultyLevel: structure.difficultyLevel
    };
  } catch (error) {
    console.error('Error generating enhanced lesson:', error);
    throw error;
  }
}