"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEnhancedLesson = generateEnhancedLesson;
exports.generateEnhancedQuestions = generateEnhancedQuestions;
const openrouter_1 = require("../openrouter");
const stability_service_1 = require("./stability-service");
const image_storage_1 = require("./image-storage");
// Create a simple ID generator since nanoid is causing ESM issues
function generateId(length = 10) {
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
function mapDiagramType(type) {
    // Convert to lowercase and normalize
    const normalizedType = type.toLowerCase().trim();
    // Map to one of the allowed types
    if (normalizedType.includes('flow') || normalizedType.includes('process')) {
        return 'flowchart';
    }
    else if (normalizedType.includes('comparison') || normalizedType.includes('compare')) {
        return 'comparison';
    }
    else if (normalizedType.includes('cycle') || normalizedType.includes('circular')) {
        return 'cycle';
    }
    else if (normalizedType.includes('hierarchy') || normalizedType.includes('tree')) {
        return 'hierarchy';
    }
    // Default to process if no match
    return 'process';
}
/**
 * Map the section type from any string to one of the allowed section types in our schema
 */
function mapSectionType(type) {
    // Define a mapping from common section types to our schema types
    const typeMap = {
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
async function generateEnhancedLesson(gradeLevel, topic, withImages = true, subject, difficulty = 'beginner') {
    try {
        // 1. Generate the lesson content structure with OpenRouter
        const structureResponse = await (0, openrouter_1.askOpenRouter)({
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
        const enhancedLesson = {
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
        const allImagePrompts = [];
        for (const section of content.sections) {
            const sectionImageIds = [];
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
        // 4. If images are requested, generate them with Stability AI
        if (withImages) {
            console.log(`Generating ${allImagePrompts.length} images for the lesson...`);
            // Generate all images concurrently
            const imagePromises = allImagePrompts.map(async (imagePrompt) => {
                const result = await (0, stability_service_1.generateEducationalImage)(imagePrompt.prompt, imagePrompt.description);
                if (result) {
                    try {
                        // Save the image to the filesystem and get the relative path
                        const imagePath = await (0, image_storage_1.saveBase64Image)(result.base64Data, `lesson_${topic.replace(/\s+/g, '_')}_${imagePrompt.id}`);
                        return {
                            id: imagePrompt.id,
                            description: imagePrompt.description,
                            alt: imagePrompt.description,
                            base64Data: result.base64Data, // Keep the base64 data for immediate use
                            promptUsed: result.promptUsed,
                            path: imagePath // Add the file path for persistent storage
                        };
                    }
                    catch (saveError) {
                        console.error('Error saving image to filesystem:', saveError);
                        // If saving fails, still return the image with base64 data
                        return {
                            id: imagePrompt.id,
                            description: imagePrompt.description,
                            alt: imagePrompt.description,
                            base64Data: result.base64Data,
                            promptUsed: result.promptUsed
                        };
                    }
                }
                // If image generation fails, create a placeholder
                return {
                    id: imagePrompt.id,
                    description: imagePrompt.description,
                    alt: imagePrompt.description,
                    promptUsed: imagePrompt.prompt
                };
            });
            // Add images as they complete
            const images = await Promise.all(imagePromises);
            enhancedLesson.images = images;
            // 5. Generate a diagram related to the topic
            try {
                console.log('Generating a diagram for the lesson...');
                const diagramTypes = ['concept map', 'flowchart', 'comparison', 'cycle'];
                const randomDiagramType = diagramTypes[Math.floor(Math.random() * diagramTypes.length)];
                const diagram = await (0, stability_service_1.generateEducationalDiagram)(topic, randomDiagramType, `${randomDiagramType} diagram about ${topic}`);
                if (diagram) {
                    // Map the diagram type to a valid enum value
                    const mappedDiagramType = mapDiagramType(randomDiagramType);
                    enhancedLesson.diagrams.push({
                        id: generateId(10),
                        type: mappedDiagramType,
                        title: `${randomDiagramType.charAt(0).toUpperCase() + randomDiagramType.slice(1)} of ${topic}`,
                        svgData: '', // We're using base64 images instead of SVG
                        description: `Visual representation of ${topic} as a ${randomDiagramType}`
                    });
                    try {
                        // Save the diagram to the filesystem
                        const diagramPath = await (0, image_storage_1.saveBase64Image)(diagram.base64Data, `diagram_${topic.replace(/\s+/g, '_')}_${randomDiagramType.replace(/\s+/g, '_')}`);
                        // Add the diagram to the images array as well
                        enhancedLesson.images.push({
                            id: generateId(10),
                            description: `${randomDiagramType.charAt(0).toUpperCase() + randomDiagramType.slice(1)} of ${topic}`,
                            alt: `Visual representation of ${topic} as a ${randomDiagramType}`,
                            base64Data: diagram.base64Data,
                            promptUsed: diagram.promptUsed,
                            path: diagramPath // Add the file path for persistent storage
                        });
                    }
                    catch (saveError) {
                        console.error('Error saving diagram to filesystem:', saveError);
                        // If saving fails, still add the diagram with base64 data
                        enhancedLesson.images.push({
                            id: generateId(10),
                            description: `${randomDiagramType.charAt(0).toUpperCase() + randomDiagramType.slice(1)} of ${topic}`,
                            alt: `Visual representation of ${topic} as a ${randomDiagramType}`,
                            base64Data: diagram.base64Data,
                            promptUsed: diagram.promptUsed
                        });
                    }
                }
            }
            catch (error) {
                console.error('Error generating diagram:', error);
            }
        }
        else {
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
    }
    catch (error) {
        console.error('Error generating enhanced lesson:', error);
        return null;
    }
}
/**
 * Generate quiz questions for an enhanced lesson
 */
async function generateEnhancedQuestions(enhancedLesson, questionCount = 5) {
    try {
        // Combine all content for context
        const lessonContent = enhancedLesson.sections.map(s => `${s.title}:\n${s.content}`).join('\n\n');
        // Generate questions with OpenRouter
        const response = await (0, openrouter_1.askOpenRouter)({
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
    }
    catch (error) {
        console.error('Error generating enhanced questions:', error);
        return [];
    }
}
//# sourceMappingURL=enhanced-lesson-service.js.map