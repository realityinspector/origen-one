"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveBase64Image = saveBase64Image;
exports.readImage = readImage;
exports.deleteImage = deleteImage;
exports.getImageAsBase64 = getImageAsBase64;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Directory to store images
const IMAGES_DIR = path_1.default.join(process.cwd(), 'public', 'images');
// Ensure the images directory exists
function ensureImageDirExists() {
    if (!fs_1.default.existsSync(IMAGES_DIR)) {
        fs_1.default.mkdirSync(IMAGES_DIR, { recursive: true });
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
async function saveBase64Image(base64Data, fileName) {
    try {
        // Clean up the filename to be URL and filesystem safe
        const safeFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        // Add a timestamp to prevent name collisions
        const timestamp = Date.now();
        const fullFileName = `${safeFileName}_${timestamp}.png`;
        // Full path to save the image
        const filePath = path_1.default.join(IMAGES_DIR, fullFileName);
        // Convert base64 to buffer and save
        const buffer = Buffer.from(base64Data, 'base64');
        fs_1.default.writeFileSync(filePath, buffer);
        // Return the path relative to the public directory
        return `/images/${fullFileName}`;
    }
    catch (error) {
        console.error('Error saving image to filesystem:', error);
        throw error;
    }
}
/**
 * Reads image data from the file system
 * @param imagePath Path to the image relative to the public directory
 * @returns Buffer containing the image data
 */
function readImage(imagePath) {
    try {
        const fullPath = path_1.default.join(process.cwd(), 'public', imagePath);
        return fs_1.default.readFileSync(fullPath);
    }
    catch (error) {
        console.error(`Error reading image from ${imagePath}:`, error);
        throw error;
    }
}
/**
 * Deletes an image from the file system
 * @param imagePath Path to the image relative to the public directory
 */
function deleteImage(imagePath) {
    try {
        const fullPath = path_1.default.join(process.cwd(), 'public', imagePath);
        if (fs_1.default.existsSync(fullPath)) {
            fs_1.default.unlinkSync(fullPath);
        }
    }
    catch (error) {
        console.error(`Error deleting image ${imagePath}:`, error);
        throw error;
    }
}
/**
 * Gets the base64 representation of an image
 * @param imagePath Path to the image relative to the public directory
 * @returns Base64 encoded string of the image
 */
function getImageAsBase64(imagePath) {
    const buffer = readImage(imagePath);
    return buffer.toString('base64');
}
//# sourceMappingURL=image-storage.js.map