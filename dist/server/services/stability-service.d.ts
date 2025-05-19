interface StabilityImageOptions {
    prompt: string;
    negativePrompt?: string;
    engine?: string;
    width?: number;
    height?: number;
    steps?: number;
    seed?: number;
    stylePreset?: string;
}
interface StabilityImageResult {
    id: string;
    base64Data: string;
    promptUsed: string;
    description: string;
}
/**
 * Generates an educational image using Stability AI
 */
export declare function generateEducationalImage(prompt: string, description?: string, options?: Partial<StabilityImageOptions>): Promise<StabilityImageResult | null>;
/**
 * Generates an educational diagram using Stability AI
 */
export declare function generateEducationalDiagram(topic: string, diagramType: string, description?: string): Promise<StabilityImageResult | null>;
export {};
