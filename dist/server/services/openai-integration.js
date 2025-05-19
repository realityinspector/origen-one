"use strict";
/**
 * OpenAI Integration Service
 *
 * This module provides integration with OpenAI for generating images and enhanced content
 * for educational lessons.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLessonImage = generateLessonImage;
exports.generateFallbackSvgImage = generateFallbackSvgImage;
exports.generateSvgDiagram = generateSvgDiagram;
const openai_1 = __importDefault(require("openai"));
const flags_1 = require("../config/flags");
const ai_1 = require("./ai");
// Create a simple ID generator
function generateId(size = 10) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < size; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
// Initialize OpenAI client
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
/**
 * Create a prompt for image generation based on educational topic and grade level
 */
function createImageGenerationPrompt(topic, gradeLevel, description) {
    // Base prompt template
    let basePrompt = `Create an educational, age-appropriate illustration about ${topic} for grade ${gradeLevel} students. ${description}`;
    // Add grade-specific guidance
    if (gradeLevel <= 2) {
        // K-2: Simple, colorful, friendly
        basePrompt += " The illustration should be simple, colorful, with friendly characters, large simple shapes, and minimal text. Use bright primary colors and a cheerful style suitable for very young children.";
    }
    else if (gradeLevel <= 5) {
        // 3-5: More detailed but still engaging
        basePrompt += " The illustration should be colorful and engaging with moderate detail, clear labels, and some educational elements. Balance visual appeal with informative content suitable for elementary school students.";
    }
    else if (gradeLevel <= 8) {
        // 6-8: More sophisticated, detailed
        basePrompt += " The illustration should be somewhat detailed with accurate representations, clear labels, and educational value. Use a style that appeals to middle school students while maintaining scientific/educational accuracy.";
    }
    else {
        // 9-12: Most detailed, realistic
        basePrompt += " The illustration should be detailed and realistic with accurate representations, proper labeling, and educational depth. Focus on accuracy and educational value while maintaining visual clarity suitable for high school students.";
    }
    // Add topic-specific guidance
    if (topic.toLowerCase().includes("math")) {
        basePrompt += " Include visual representations of mathematical concepts, clear diagrams, and examples that help visualize the concept.";
    }
    else if (topic.toLowerCase().includes("science")) {
        basePrompt += " Show accurate scientific representations with proper structures, processes, or phenomena clearly illustrated.";
    }
    else if (topic.toLowerCase().includes("history")) {
        basePrompt += " Depict historically accurate scenes, figures, events, or timelines that are age-appropriate and educational.";
    }
    else if (topic.toLowerCase().includes("language")) {
        basePrompt += " Use visual metaphors, story elements, or communication concepts to illustrate language arts concepts.";
    }
    // Safety and quality guidelines
    basePrompt += " The image must be educational, appropriate for school use, culturally sensitive, and diverse. No text in the image.";
    return basePrompt;
}
/**
 * Generate an image for a lesson using OpenAI's DALL-E 3 model
 */
async function generateLessonImage(topic, gradeLevel, description) {
    if (!flags_1.USE_AI) {
        throw new Error('AI generation is disabled (USE_AI=0)');
    }
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is required for image generation');
    }
    const imageId = generateId(10);
    const prompt = createImageGenerationPrompt(topic, gradeLevel, description);
    try {
        // the newest OpenAI model is "dall-e-3" which was released after GPT-4's training data cutoff
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            response_format: "b64_json"
        });
        return {
            id: imageId,
            description,
            alt: `Educational illustration about ${topic} for grade ${gradeLevel}`,
            base64Data: response.data[0].b64_json,
            promptUsed: prompt
        };
    }
    catch (error) {
        console.error('Error generating image with OpenAI:', error);
        // Fallback to SVG generation
        return generateFallbackSvgImage(topic, gradeLevel, description);
    }
}
/**
 * Generate a fallback SVG image when OpenAI image generation fails
 */
async function generateFallbackSvgImage(topic, gradeLevel, description) {
    const imageId = generateId(10);
    const prompt = `Create an SVG illustration about ${topic} for grade ${gradeLevel} students. ${description}`;
    try {
        const systemPrompt = `You are an expert SVG illustrator for educational content.
    Create a simple, clear SVG illustration about "${topic}" for grade ${gradeLevel} students.
    The SVG should be educational, age-appropriate, and visually engaging.
    Return ONLY valid SVG code with no explanation. The SVG must use the viewBox attribute and should be around 300x300 in size.`;
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
        ];
        const svgContent = await (0, ai_1.chat)(messages, {
            max_tokens: 1500,
            temperature: 0.3
        });
        // Extract SVG code from response
        const svgMatch = svgContent.match(/<svg.*<\/svg>/s);
        return {
            id: imageId,
            description,
            alt: `SVG illustration about ${topic} for grade ${gradeLevel}`,
            svgData: svgMatch ? svgMatch[0] : createSimpleSvgPlaceholder(topic),
            promptUsed: prompt
        };
    }
    catch (error) {
        console.error('Error generating SVG fallback:', error);
        // Last resort fallback - create a simple SVG placeholder
        return {
            id: imageId,
            description,
            alt: `Simple illustration placeholder for ${topic}`,
            svgData: createSimpleSvgPlaceholder(topic),
            promptUsed: prompt
        };
    }
}
/**
 * Create a simple SVG placeholder with topic text
 */
function createSimpleSvgPlaceholder(topic) {
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
 * Generate an SVG diagram using AI-guided instructions
 */
async function generateSvgDiagram(topic, gradeLevel, diagramType) {
    if (!flags_1.USE_AI) {
        throw new Error('AI generation is disabled (USE_AI=0)');
    }
    const diagramId = generateId(10);
    try {
        const systemPrompt = `You are an expert educational diagram creator. 
    Create a clear, age-appropriate ${diagramType} diagram about "${topic}" for grade ${gradeLevel} students.
    Return ONLY valid SVG code with no explanation. The SVG must use the viewBox attribute.`;
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Create a ${diagramType} diagram about ${topic}` }
        ];
        const response = await (0, ai_1.chat)(messages, {
            max_tokens: 1500,
            temperature: 0.2
        });
        // Extract SVG code from response
        const svgMatch = response.match(/<svg.*<\/svg>/s);
        const svgContent = svgMatch ? svgMatch[0] : createFallbackDiagram(topic, diagramType);
        return {
            id: diagramId,
            type: diagramType,
            title: `${topic} ${diagramType} diagram`,
            svgData: svgContent,
            description: `A ${diagramType} diagram illustrating ${topic} concepts`
        };
    }
    catch (error) {
        console.error('Error generating SVG diagram:', error);
        // Fallback to a simple diagram
        return {
            id: diagramId,
            type: diagramType,
            title: `${topic} ${diagramType} diagram`,
            svgData: createFallbackDiagram(topic, diagramType),
            description: `A simple ${diagramType} diagram for ${topic}`
        };
    }
}
/**
 * Create a fallback diagram when AI generation fails
 */
function createFallbackDiagram(topic, diagramType) {
    // Simple diagram based on type
    if (diagramType === 'cycle') {
        return createCycleDiagram(topic);
    }
    else if (diagramType === 'flowchart') {
        return createFlowchartDiagram(topic);
    }
    else if (diagramType === 'comparison') {
        return createComparisonDiagram(topic);
    }
    else {
        // Default diagram
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
}
/**
 * Create a simple cycle diagram
 */
function createCycleDiagram(topic) {
    return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
    <circle cx="150" cy="150" r="100" fill="#f0f8ff" stroke="#4682b4" stroke-width="2" />
    <circle cx="150" cy="150" r="80" fill="none" stroke="#4682b4" stroke-width="1" stroke-dasharray="5,5" />
    <text x="150" y="150" font-family="Arial, sans-serif" font-size="14" text-anchor="middle">${topic}</text>
    
    <!-- Cycle steps -->
    <circle cx="150" cy="50" r="20" fill="#b0e0e6" stroke="#4682b4" stroke-width="1" />
    <text x="150" y="55" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">Step 1</text>
    
    <circle cx="242" cy="119" r="20" fill="#b0e0e6" stroke="#4682b4" stroke-width="1" />
    <text x="242" y="124" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">Step 2</text>
    
    <circle cx="200" cy="220" r="20" fill="#b0e0e6" stroke="#4682b4" stroke-width="1" />
    <text x="200" y="225" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">Step 3</text>
    
    <circle cx="100" cy="220" r="20" fill="#b0e0e6" stroke="#4682b4" stroke-width="1" />
    <text x="100" y="225" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">Step 4</text>
    
    <circle cx="58" cy="119" r="20" fill="#b0e0e6" stroke="#4682b4" stroke-width="1" />
    <text x="58" y="124" font-family="Arial, sans-serif" font-size="10" text-anchor="middle">Step 5</text>
    
    <!-- Arrows -->
    <path d="M 164 56 L 228 105" fill="none" stroke="#4682b4" stroke-width="2" marker-end="url(#arrowhead)" />
    <path d="M 238 138 L 206 201" fill="none" stroke="#4682b4" stroke-width="2" marker-end="url(#arrowhead)" />
    <path d="M 183 229 L 117 229" fill="none" stroke="#4682b4" stroke-width="2" marker-end="url(#arrowhead)" />
    <path d="M 85 201 L 62 138" fill="none" stroke="#4682b4" stroke-width="2" marker-end="url(#arrowhead)" />
    <path d="M 72 105 L 136 56" fill="none" stroke="#4682b4" stroke-width="2" marker-end="url(#arrowhead)" />
    
    <!-- Arrow marker definition -->
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#4682b4" />
      </marker>
    </defs>
  </svg>`;
}
/**
 * Create a simple flowchart diagram
 */
function createFlowchartDiagram(topic) {
    return `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f9f9f9" />
    
    <!-- Start -->
    <ellipse cx="150" cy="30" rx="70" ry="25" fill="#e6f7ff" stroke="#69c0ff" stroke-width="2" />
    <text x="150" y="35" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">Start</text>
    
    <!-- Step 1 -->
    <rect x="80" y="80" width="140" height="50" rx="5" ry="5" fill="#e6f7ff" stroke="#69c0ff" stroke-width="2" />
    <text x="150" y="110" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">First step of ${topic}</text>
    
    <!-- Decision -->
    <polygon points="150,160 210,200 150,240 90,200" fill="#fff7e6" stroke="#ffc069" stroke-width="2" />
    <text x="150" y="205" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">Decision?</text>
    
    <!-- Yes path -->
    <rect x="50" y="270" width="100" height="50" rx="5" ry="5" fill="#e6f7ff" stroke="#69c0ff" stroke-width="2" />
    <text x="100" y="300" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">Yes option</text>
    
    <!-- No path -->
    <rect x="200" y="270" width="100" height="50" rx="5" ry="5" fill="#e6f7ff" stroke="#69c0ff" stroke-width="2" />
    <text x="250" y="300" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">No option</text>
    
    <!-- End -->
    <ellipse cx="150" cy="360" rx="70" ry="25" fill="#e6f7ff" stroke="#69c0ff" stroke-width="2" />
    <text x="150" y="365" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">End</text>
    
    <!-- Connectors -->
    <line x1="150" y1="55" x2="150" y2="80" stroke="#69c0ff" stroke-width="2" marker-end="url(#arrowhead)" />
    <line x1="150" y1="130" x2="150" y2="160" stroke="#69c0ff" stroke-width="2" marker-end="url(#arrowhead)" />
    <line x1="90" y1="200" x2="50" y2="200" stroke="#69c0ff" stroke-width="2" />
    <line x1="50" y1="200" x2="50" y2="270" stroke="#69c0ff" stroke-width="2" marker-end="url(#arrowhead)" />
    <line x1="210" y1="200" x2="250" y2="200" stroke="#69c0ff" stroke-width="2" />
    <line x1="250" y1="200" x2="250" y2="270" stroke="#69c0ff" stroke-width="2" marker-end="url(#arrowhead)" />
    <line x1="100" y1="320" x2="100" y2="360" stroke="#69c0ff" stroke-width="2" />
    <line x1="100" y1="360" x2="80" y2="360" stroke="#69c0ff" stroke-width="2" marker-end="url(#arrowhead)" />
    <line x1="250" y1="320" x2="250" y2="360" stroke="#69c0ff" stroke-width="2" />
    <line x1="250" y1="360" x2="220" y2="360" stroke="#69c0ff" stroke-width="2" marker-end="url(#arrowhead)" />
    
    <!-- Arrow marker definition -->
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#69c0ff" />
      </marker>
    </defs>
  </svg>`;
}
/**
 * Create a simple comparison diagram
 */
function createComparisonDiagram(topic) {
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f9f9f9" />
    
    <!-- Title -->
    <text x="200" y="30" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">${topic} Comparison</text>
    
    <!-- Option A -->
    <rect x="20" y="60" width="160" height="220" rx="5" ry="5" fill="#e6f7ff" stroke="#69c0ff" stroke-width="2" />
    <text x="100" y="85" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Option A</text>
    
    <rect x="30" y="100" width="140" height="30" rx="5" ry="5" fill="#ffffff" stroke="#d9d9d9" stroke-width="1" />
    <text x="100" y="120" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">Feature 1</text>
    
    <rect x="30" y="140" width="140" height="30" rx="5" ry="5" fill="#ffffff" stroke="#d9d9d9" stroke-width="1" />
    <text x="100" y="160" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">Feature 2</text>
    
    <rect x="30" y="180" width="140" height="30" rx="5" ry="5" fill="#ffffff" stroke="#d9d9d9" stroke-width="1" />
    <text x="100" y="200" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">Feature 3</text>
    
    <!-- Option B -->
    <rect x="220" y="60" width="160" height="220" rx="5" ry="5" fill="#fff7e6" stroke="#ffc069" stroke-width="2" />
    <text x="300" y="85" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Option B</text>
    
    <rect x="230" y="100" width="140" height="30" rx="5" ry="5" fill="#ffffff" stroke="#d9d9d9" stroke-width="1" />
    <text x="300" y="120" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">Feature 1</text>
    
    <rect x="230" y="140" width="140" height="30" rx="5" ry="5" fill="#ffffff" stroke="#d9d9d9" stroke-width="1" />
    <text x="300" y="160" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">Feature 2</text>
    
    <rect x="230" y="180" width="140" height="30" rx="5" ry="5" fill="#ffffff" stroke="#d9d9d9" stroke-width="1" />
    <text x="300" y="200" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">Feature 3</text>
    
    <!-- VS in the middle -->
    <circle cx="200" cy="170" r="25" fill="#f0f0f0" stroke="#d9d9d9" stroke-width="2" />
    <text x="200" y="175" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">VS</text>
  </svg>`;
}
//# sourceMappingURL=openai-integration.js.map