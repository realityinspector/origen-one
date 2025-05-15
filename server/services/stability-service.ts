/**
 * Stability AI Integration Service
 * 
 * This module provides integration with Stability AI for generating images
 * for educational lessons.
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
import { LessonImage } from "../../shared/schema";

const API_HOST = 'https://api.stability.ai';
const API_KEY = process.env.STABILITY_API_KEY;

/**
 * Create a prompt for image generation based on educational topic and grade level
 */
function createImageGenerationPrompt(topic: string, gradeLevel: number, description: string): string {
  // Base prompt template
  let basePrompt = `Create an educational, age-appropriate illustration about ${topic} for grade ${gradeLevel} students. ${description}`;
  
  // Add grade-specific guidance
  if (gradeLevel <= 2) {
    // K-2: Simple, colorful, friendly
    basePrompt += " The illustration should be simple, colorful, with friendly characters, large simple shapes, and minimal text. Use bright primary colors and a cheerful style suitable for very young children.";
  } else if (gradeLevel <= 5) {
    // 3-5: More detailed but still engaging
    basePrompt += " The illustration should be colorful and engaging with moderate detail, clear labels, and some educational elements. Balance visual appeal with informative content suitable for elementary school students.";
  } else if (gradeLevel <= 8) {
    // 6-8: More sophisticated, detailed
    basePrompt += " The illustration should be somewhat detailed with accurate representations, clear labels, and educational value. Use a style that appeals to middle school students while maintaining scientific/educational accuracy.";
  } else {
    // 9-12: Most detailed, realistic
    basePrompt += " The illustration should be detailed and realistic with accurate representations, proper labeling, and educational depth. Focus on accuracy and educational value while maintaining visual clarity suitable for high school students.";
  }
  
  // Add topic-specific guidance
  if (topic.toLowerCase().includes("math")) {
    basePrompt += " Include visual representations of mathematical concepts, clear diagrams, and examples that help visualize the concept.";
  } else if (topic.toLowerCase().includes("science")) {
    basePrompt += " Show accurate scientific representations with proper structures, processes, or phenomena clearly illustrated.";
  } else if (topic.toLowerCase().includes("history")) {
    basePrompt += " Depict historically accurate scenes, figures, events, or timelines that are age-appropriate and educational.";
  } else if (topic.toLowerCase().includes("language")) {
    basePrompt += " Use visual metaphors, story elements, or communication concepts to illustrate language arts concepts.";
  }
  
  // Safety and quality guidelines
  basePrompt += " The image must be educational, appropriate for school use, culturally sensitive, and diverse. No text in the image.";
  
  return basePrompt;
}

/**
 * Generate an image for a lesson using Stability AI's API
 */
export async function generateLessonImage(
  topic: string, 
  gradeLevel: number, 
  description: string
): Promise<LessonImage> {
  if (!USE_AI) {
    throw new Error('AI generation is disabled (USE_AI=0)');
  }
  
  if (!API_KEY) {
    throw new Error('STABILITY_API_KEY is required for image generation');
  }
  
  const imageId = generateId(10);
  const prompt = createImageGenerationPrompt(topic, gradeLevel, description);
  
  try {
    // Create form data for the request
    const formData = new FormData();
    
    // Add text prompts
    formData.append('text_prompts[0][text]', prompt);
    formData.append('text_prompts[0][weight]', '1');
    
    // Add configuration parameters
    formData.append('cfg_scale', '7');
    formData.append('samples', '1');
    formData.append('steps', '30');
    formData.append('width', '1024');
    formData.append('height', '1024');
    formData.append('sampler', 'K_DPMPP_2M');
    
    // Make request to Stability AI
    const response = await axios.post(
      `${API_HOST}/v2beta/stable-image/generate/sd3`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        },
        responseType: 'json'
      }
    );
    
    // Extract base64 data from response
    if (response.data.artifacts && response.data.artifacts.length > 0) {
      const base64Data = response.data.artifacts[0].base64;
      
      return {
        id: imageId,
        description,
        alt: `Educational illustration about ${topic} for grade ${gradeLevel}`,
        base64Data,
        promptUsed: prompt
      };
    } else {
      throw new Error('No image artifacts returned from Stability AI');
    }
  } catch (error) {
    console.error('Error generating image with Stability AI:', error);
    
    // Fallback to SVG generation
    return generateFallbackSvgImage(topic, gradeLevel, description);
  }
}

/**
 * Generate a fallback SVG image when Stability AI image generation fails
 */
export async function generateFallbackSvgImage(
  topic: string, 
  gradeLevel: number, 
  description: string
): Promise<LessonImage> {
  const imageId = generateId(10);
  
  try {
    // Generate SVG using OpenRouter
    const svgContent = await generateSvgWithOpenRouter(topic, gradeLevel, description);
    
    return {
      id: imageId,
      description,
      alt: `SVG illustration about ${topic} for grade ${gradeLevel}`,
      svgData: svgContent,
      promptUsed: `SVG for ${topic}, grade ${gradeLevel}: ${description}`
    };
  } catch (error) {
    console.error('Error generating SVG fallback:', error);
    
    // Last resort fallback - create a simple SVG placeholder
    return {
      id: imageId,
      description,
      alt: `Simple illustration placeholder for ${topic}`,
      svgData: createSimpleSvgPlaceholder(topic),
      promptUsed: `Simple SVG for ${topic}`
    };
  }
}

/**
 * Generate SVG content using OpenRouter
 */
async function generateSvgWithOpenRouter(
  topic: string,
  gradeLevel: number,
  description: string
): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required for SVG generation');
  }
  
  try {
    const systemPrompt = `You are an expert SVG illustrator for educational content.
    Create a simple, clear SVG illustration about "${topic}" for grade ${gradeLevel} students.
    The SVG should be educational, age-appropriate, and visually engaging.
    Return ONLY valid SVG code with no explanation. The SVG must use the viewBox attribute and should be around 300x300 in size.`;
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-opus',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create an SVG illustration about ${topic} for grade ${gradeLevel} students. ${description}` }
        ],
        max_tokens: 1500,
        temperature: 0.2
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
    
    const svgContent = response.data.choices[0].message.content;
    
    // Extract SVG code from response
    const svgMatch = svgContent.match(/<svg.*<\/svg>/s);
    return svgMatch ? svgMatch[0] : createSimpleSvgPlaceholder(topic);
  } catch (error) {
    console.error('Error generating SVG with OpenRouter:', error);
    throw error;
  }
}

/**
 * Create a simple SVG placeholder with topic text
 */
function createSimpleSvgPlaceholder(topic: string): string {
  return `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f8f9fa" />
    <rect x="10" y="10" width="280" height="180" rx="10" ry="10" 
      fill="#ffffff" stroke="#cccccc" stroke-width="2" />
    <text x="150" y="100" font-family="Arial, sans-serif" font-size="16"
      text-anchor="middle" fill="#444444">
      ${topic}
    </text>
  </svg>`;
}

/**
 * Generate a diagram with specific type
 */
export async function generateDiagram(
  topic: string,
  gradeLevel: number,
  diagramType: string
): Promise<string> {
  if (!USE_AI) {
    throw new Error('AI generation is disabled (USE_AI=0)');
  }
  
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required for diagram generation');
  }
  
  try {
    const systemPrompt = `You are an expert educational diagram creator. 
    Create a clear, age-appropriate ${diagramType} diagram about "${topic}" for grade ${gradeLevel} students.
    Return ONLY valid SVG code with no explanation. The SVG must use the viewBox attribute.`;
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-opus',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a ${diagramType} diagram about ${topic} for grade ${gradeLevel} students.` }
        ],
        max_tokens: 1500,
        temperature: 0.2
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
    
    const svgContent = response.data.choices[0].message.content;
    
    // Extract SVG code from response
    const svgMatch = svgContent.match(/<svg.*<\/svg>/s);
    return svgMatch ? svgMatch[0] : createSimpleDiagramPlaceholder(topic, diagramType);
  } catch (error) {
    console.error('Error generating diagram with OpenRouter:', error);
    return createSimpleDiagramPlaceholder(topic, diagramType);
  }
}

/**
 * Create a simple diagram placeholder
 */
function createSimpleDiagramPlaceholder(topic: string, diagramType: string): string {
  return `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f8f9fa" />
    <rect x="10" y="10" width="280" height="180" rx="5" ry="5" 
      fill="#ffffff" stroke="#cccccc" stroke-width="1" />
    <text x="150" y="50" font-family="Arial, sans-serif" font-size="16"
      text-anchor="middle" fill="#333333">
      ${topic}
    </text>
    <text x="150" y="100" font-family="Arial, sans-serif" font-size="14"
      text-anchor="middle" fill="#555555">
      ${diagramType} diagram
    </text>
  </svg>`;
}