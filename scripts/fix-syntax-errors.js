/**
 * This script fixes syntax errors in the storage.ts file
 * that are preventing deployment and running the application.
 */

const fs = require('fs');
const path = require('path');

try {
  console.log('Fixing syntax errors in storage.ts file...');
  const filePath = path.join(process.cwd(), 'server/storage.ts');
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix getAchievements method (line 751) - Remove extra parentheses
  content = content.replace(
    /\.where\(eq\(achievements\.learnerId, learnerId\.toString\(\)\)\)\)\)/g,
    '.where(eq(achievements.learnerId, learnerId.toString()))'
  );
  
  // Fix deleteUser method (line 850) - Remove extra parentheses
  content = content.replace(
    /\.where\(eq\(achievements\.learnerId, id\.toString\(\)\)\)\)\)\)\)\)\);/g,
    '.where(eq(achievements.learnerId, id.toString()));'
  );
  
  // Also try a more general pattern replacement
  content = content.replace(
    /\.where\(eq\(achievements\.learnerId, (.*?)\.toString\(\)\)\)+\)/g,
    '.where(eq(achievements.learnerId, $1.toString()))'
  );

  // Write fixed content back to file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed syntax errors in storage.ts successfully');
} catch (error) {
  console.error('Error fixing syntax errors:', error);
}