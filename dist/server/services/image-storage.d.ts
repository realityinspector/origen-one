/**
 * Saves a base64 image to the file system
 * @param base64Data Base64 encoded image data (without the data:image prefix)
 * @param fileName Name for the image file (without extension)
 * @returns Path to the saved image relative to the public directory
 */
export declare function saveBase64Image(base64Data: string, fileName: string): Promise<string>;
/**
 * Reads image data from the file system
 * @param imagePath Path to the image relative to the public directory
 * @returns Buffer containing the image data
 */
export declare function readImage(imagePath: string): Buffer;
/**
 * Deletes an image from the file system
 * @param imagePath Path to the image relative to the public directory
 */
export declare function deleteImage(imagePath: string): void;
/**
 * Gets the base64 representation of an image
 * @param imagePath Path to the image relative to the public directory
 * @returns Base64 encoded string of the image
 */
export declare function getImageAsBase64(imagePath: string): string;
