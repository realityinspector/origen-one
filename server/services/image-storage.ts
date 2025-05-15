import fs from 'fs';
import path from 'path';

// Directory to store images
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

// Ensure the images directory exists
function ensureImageDirExists() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`Created images directory at ${IMAGES_DIR}`);
  }
}

// Initialize image directory
ensureImageDirExists();

/**
 * Saves a base64 image to the file system
 * @param base64Data Base64 encoded image data (without the data:image prefix)
 * @param fileName Name for the image file (without extension)
 * @returns Path to the saved image relative to the public directory
 */
export async function saveBase64Image(base64Data: string, fileName: string): Promise<string> {
  try {
    // Clean up the filename to be URL and filesystem safe
    const safeFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Add a timestamp to prevent name collisions
    const timestamp = Date.now();
    const fullFileName = `${safeFileName}_${timestamp}.png`;
    
    // Full path to save the image
    const filePath = path.join(IMAGES_DIR, fullFileName);
    
    // Convert base64 to buffer and save
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);
    
    // Return the path relative to the public directory
    return `/images/${fullFileName}`;
  } catch (error) {
    console.error('Error saving image to filesystem:', error);
    throw error;
  }
}

/**
 * Reads image data from the file system
 * @param imagePath Path to the image relative to the public directory
 * @returns Buffer containing the image data
 */
export function readImage(imagePath: string): Buffer {
  try {
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    return fs.readFileSync(fullPath);
  } catch (error) {
    console.error(`Error reading image from ${imagePath}:`, error);
    throw error;
  }
}

/**
 * Deletes an image from the file system
 * @param imagePath Path to the image relative to the public directory
 */
export function deleteImage(imagePath: string): void {
  try {
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error(`Error deleting image ${imagePath}:`, error);
    throw error;
  }
}

/**
 * Gets the base64 representation of an image
 * @param imagePath Path to the image relative to the public directory
 * @returns Base64 encoded string of the image
 */
export function getImageAsBase64(imagePath: string): string {
  const buffer = readImage(imagePath);
  return buffer.toString('base64');
}