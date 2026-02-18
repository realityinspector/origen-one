import { askOpenRouter } from '../openrouter';
import { generateImage, generateDiagram, MAX_IMAGES_PER_LESSON } from './image-generation-router';
import { EnhancedLessonSpec, LessonSection, LessonImage, LessonDiagram } from '../../shared/schema';
import { saveBase64Image } from './image-storage';

// Create a simple ID generator since nanoid is causing ESM issues
function generateId(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Map a diagram type string to one of the allowed diagram types in our schema
 */
function mapDiagramType(type: string): LessonDiagram['type'] {
  // Convert to lowercase and normalize
  const normalizedType = type.toLowerCase().trim();
  
  // Map to one of the allowed types
  if (normalizedType.includes('flow') || normalizedType.includes('process')) {
    return 'flowchart';
  } else if (normalizedType.includes('comparison') || normalizedType.includes('compare')) {
    return 'comparison';
  } else if (normalizedType.includes('cycle') || normalizedType.includes('circular')) {
    return 'cycle';
  } else if (normalizedType.includes('hierarchy') || normalizedType.includes('tree')) {
    return 'hierarchy';
  }
  
  // Default to process if no match
  return 'process';
}

/**
 * Map the section type from any string to one of the allowed section types in our schema
 */
function mapSectionType(type: string): LessonSection['type'] {
  // Define a mapping from common section types to our schema types
  const typeMap: Record<string, LessonSection['type']> = {
    'introduction': 'introduction',
    'intro': 'introduction',
    'beginning': 'introduction',
    'key': 'key_concepts',
    'key_concepts': 'key_concepts',
    'concepts': 'key_concepts',
    'main': 'key_concepts',
    'core': 'key_concepts',
    'example': 'examples',
    'examples': 'examples',
    'practice': 'practice',
    'exercise': 'practice',
    'exercises': 'practice',
    'activities': 'practice',
    'activity': 'practice',
    'summary': 'summary',
    'conclusion': 'summary',
    'ending': 'summary',
    'recap': 'summary',
    'fun': 'fun_facts',
    'fun_facts': 'fun_facts',
    'interesting': 'fun_facts',
    'did_you_know': 'fun_facts',
    'facts': 'fun_facts'
  };
  
  // Convert input to lowercase and remove spaces
  const normalizedType = type.toLowerCase().replace(/\s+/g, '_');
  
  // Try to match directly or find partial matches
  if (typeMap[normalizedType]) {
    return typeMap[normalizedType];
  }
  
  // Look for partial matches in the keys
  for (const key of Object.keys(typeMap)) {
    if (normalizedType.includes(key)) {
      return typeMap[key];
    }
  }
  
  // Default to key_concepts if no match found
  return 'key_concepts';
}

/**
 * Base lesson prompt for OpenRouter
 */
const baseEnhancedLessonPrompt = `Create an educational lesson for a grade school student. 
The lesson should be rich in educational content, engaging, and appropriate for the grade level specified.

Follow these requirements:
1. The content should be factually accurate and educational
2. The writing should be clear, concise, and engaging for the target age group
3. Structure the content in sections with clear headings
4. Include opportunities for visual elements (you don't need to create the visuals)
5. Suggest 3-4 places where images would enhance understanding
6. Include a brief summary at the beginning
7. List key vocabulary terms or concepts
8. Suggest 2-3 related topics that build on this knowledge
9. The content should take approximately 10-15 minutes to read

Please format your response as a JSON object with the following structure:

{
  "title": "Main title of the lesson",
  "subtitle": "Optional subtitle or tagline",
  "summary": "A brief 2-3 sentence summary of what will be learned",
  "targetGradeLevel": 5,
  "difficultyLevel": "Beginner/Intermediate/Advanced",
  "estimatedDuration": 15,
  "sections": [
    {
      "title": "Section Title",
      "type": "introduction/core/advanced/activity/conclusion",
      "content": "Markdown formatted content for this section",
      "imageDescription": "Description of an image that would work well here"
    }
  ],
  "keywords": ["keyword1", "keyword2"],
  "relatedTopics": ["related topic 1", "related topic 2"]
}`;

/**
 * Generate a full enhanced lesson with content and images
 * @param gradeLevel The grade level for the lesson
 * @param topic The topic for the lesson
 * @param withImages Whether to generate images (requires Stability API key)
 * @param subject Optional subject category
 * @param difficulty Optional difficulty level
 * @returns The enhanced lesson specification
 */
export async function generateEnhancedLesson(
  gradeLevel: number,
  topic: string,
  withImages: boolean = true,
  subject?: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): Promise<EnhancedLessonSpec | null> {
  try {
    // 1. Generate the lesson content structure with OpenRouter
    const structureResponse = await askOpenRouter({
      messages: [
        {
          role: 'system',
          content: baseEnhancedLessonPrompt
        },
        {
          role: 'user',
          content: `Create an educational lesson about "${topic}" for grade ${gradeLevel} students.`
        }
      ],
      model: 'anthropic/claude-3-opus-20240229',
      temperature: 0.7,
      response_format: {
        type: 'json_schema',
        json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            subtitle: { type: 'string' },
            summary: { type: 'string' },
            targetGradeLevel: { type: 'number' },
            difficultyLevel: { type: 'string' },
            estimatedDuration: { type: 'number' },
            sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  type: { type: 'string' },
                  content: { type: 'string' },
                  imageDescription: { type: 'string' }
                }
              }
            },
            keywords: { 
              type: 'array',
              items: { type: 'string' }
            },
            relatedTopics: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      }
    });
    
    console.log('Generated lesson structure from OpenRouter');
    
    // Parse the response
    const content = JSON.parse(structureResponse.choices[0].message.content);
    
    // Initialize our enhanced lesson spec
    const enhancedLesson: EnhancedLessonSpec = {
      title: content.title,
      subtitle: content.subtitle,
      targetGradeLevel: content.targetGradeLevel || gradeLevel,
      summary: content.summary,
      difficultyLevel: content.difficultyLevel || 'Intermediate',
      estimatedDuration: content.estimatedDuration || 15,
      sections: [],
      images: [],
      diagrams: [],
      questions: [],
      keywords: content.keywords || [],
      relatedTopics: content.relatedTopics || []
    };
    
    // 2. Add sections and generate image placeholders
    const allImagePrompts: { id: string, description: string, prompt: string }[] = [];
    
    for (const section of content.sections) {
      const sectionImageIds: string[] = [];
      
      // If the section has an image description, create a placeholder
      if (section.imageDescription) {
        const imageId = generateId(10);
        allImagePrompts.push({
          id: imageId,
          description: section.imageDescription,
          prompt: `${section.imageDescription} related to ${topic} for grade ${gradeLevel} education`
        });
        sectionImageIds.push(imageId);
      }
      
      // Map the section type to one of the allowed types in our schema
      const validSectionType = mapSectionType(section.type || 'content');
      
      // Add the section to our enhanced lesson 
      enhancedLesson.sections.push({
        title: section.title,
        content: section.content,
        type: validSectionType,
        imageIds: sectionImageIds
      });
    }
    
    // 3. Generate a featured image for the lesson
    const featuredImageId = generateId(10);
    allImagePrompts.push({
      id: featuredImageId,
      description: `Main illustration for ${content.title}`,
      prompt: `Educational illustration for "${content.title}" lesson for grade ${gradeLevel} students, ${topic}, main concept visualization`
    });
    enhancedLesson.featuredImage = featuredImageId;
    
    // 4. If images are requested, generate them via the image generation router
    if (withImages) {
      // Cap the number of images per lesson
      const cappedPrompts = allImagePrompts.slice(0, MAX_IMAGES_PER_LESSON);
      console.log(`Generating ${cappedPrompts.length} images for the lesson (max ${MAX_IMAGES_PER_LESSON})...`);

      // Generate all images concurrently via the router
      const imagePromises = cappedPrompts.map(async (imagePrompt) => {
        const result = await generateImage(
          imagePrompt.prompt,
          imagePrompt.description,
          gradeLevel,
          { subject: subject || topic }
        );

        if (result) {
          // If SVG result, no need to save to filesystem
          if (result.svgData) {
            return {
              id: imagePrompt.id,
              description: imagePrompt.description,
              alt: imagePrompt.description,
              svgData: result.svgData,
              promptUsed: result.promptUsed,
            };
          }

          // Base64 result — try to save to filesystem
          if (result.base64Data) {
            try {
              const imagePath = await saveBase64Image(
                result.base64Data,
                `lesson_${topic.replace(/\s+/g, '_')}_${imagePrompt.id}`
              );

              return {
                id: imagePrompt.id,
                description: imagePrompt.description,
                alt: imagePrompt.description,
                base64Data: result.base64Data,
                promptUsed: result.promptUsed,
                path: imagePath,
              };
            } catch (saveError) {
              console.error('Error saving image to filesystem:', saveError);
              return {
                id: imagePrompt.id,
                description: imagePrompt.description,
                alt: imagePrompt.description,
                base64Data: result.base64Data,
                promptUsed: result.promptUsed,
              };
            }
          }
        }

        // If image generation fails, create a placeholder
        return {
          id: imagePrompt.id,
          description: imagePrompt.description,
          alt: imagePrompt.description,
          promptUsed: imagePrompt.prompt,
        };
      });

      const images = await Promise.all(imagePromises);
      enhancedLesson.images = images;

      // 5. Generate a diagram related to the topic via the router
      try {
        console.log('Generating a diagram for the lesson...');
        const diagramTypes = ['concept map', 'flowchart', 'comparison', 'cycle'];
        const randomDiagramType = diagramTypes[Math.floor(Math.random() * diagramTypes.length)];

        const diagramResult = await generateDiagram(
          topic,
          randomDiagramType,
          gradeLevel,
          `${randomDiagramType} diagram about ${topic}`
        );

        if (diagramResult) {
          const mappedDiagramType = mapDiagramType(randomDiagramType);

          enhancedLesson.diagrams.push({
            id: diagramResult.id,
            type: mappedDiagramType,
            title: diagramResult.title,
            svgData: diagramResult.svgData,
            description: diagramResult.description,
          });
        }
      } catch (error) {
        console.error('Error generating diagram:', error);
      }
    } else {
      // Add placeholders for images if we're not generating them
      enhancedLesson.images = allImagePrompts.map(prompt => ({
        id: prompt.id,
        description: prompt.description,
        alt: prompt.description,
        promptUsed: prompt.prompt
      }));
    }
    
    console.log('Enhanced lesson generation complete');
    return enhancedLesson;
  } catch (error) {
    console.error('Error generating enhanced lesson:', error);
    return null;
  }
}

/**
 * Generate quiz questions for an enhanced lesson
 */
export async function generateEnhancedQuestions(
  enhancedLesson: EnhancedLessonSpec,
  questionCount: number = 5
): Promise<any[]> {
  try {
    // Combine all content for context
    const lessonContent = enhancedLesson.sections.map(s => `${s.title}:\n${s.content}`).join('\n\n');
    
    // Generate questions with OpenRouter
    const response = await askOpenRouter({
      messages: [
        {
          role: 'system',
          content: `You are an educational assessment expert. Create ${questionCount} multiple-choice questions based on the lesson content provided. Each question should have 4 options with only one correct answer. Format as a JSON array.`
        },
        {
          role: 'user',
          content: `Create ${questionCount} multiple-choice questions for a grade ${enhancedLesson.targetGradeLevel} lesson titled "${enhancedLesson.title}". Here's the lesson content:\n\n${lessonContent}\n\nFormat each question as a JSON object with "question", "options" (array of 4 choices), "correctAnswer" (index of correct option, 0-3), and "explanation" fields.`
        }
      ],
      model: 'anthropic/claude-3-opus-20240229',
      temperature: 0.7,
      response_format: {
        type: 'json_schema',
        json_schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              options: { 
                type: 'array',
                items: { type: 'string' }
              },
              correctAnswer: { type: 'number' },
              explanation: { type: 'string' }
            }
          }
        }
      }
    });
    
    const questions = JSON.parse(response.choices[0].message.content);
    return questions;
  } catch (error) {
    console.error('Error generating enhanced questions:', error);
    return [];
  }
}