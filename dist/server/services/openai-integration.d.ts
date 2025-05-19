/**
 * OpenAI Integration Service
 *
 * This module provides integration with OpenAI for generating images and enhanced content
 * for educational lessons.
 */
export interface LessonImage {
    id: string;
    description: string;
    alt: string;
    base64Data?: string;
    svgData?: string;
    promptUsed: string;
}
export interface LessonDiagram {
    id: string;
    type: "flowchart" | "comparison" | "process" | "cycle" | "hierarchy";
    title: string;
    svgData: string;
    description: string;
}
/**
 * Generate an image for a lesson using OpenAI's DALL-E 3 model
 */
export declare function generateLessonImage(topic: string, gradeLevel: number, description: string): Promise<LessonImage>;
/**
 * Generate a fallback SVG image when OpenAI image generation fails
 */
export declare function generateFallbackSvgImage(topic: string, gradeLevel: number, description: string): Promise<LessonImage>;
/**
 * Generate an SVG diagram using AI-guided instructions
 */
export declare function generateSvgDiagram(topic: string, gradeLevel: number, diagramType: string): Promise<LessonDiagram>;
