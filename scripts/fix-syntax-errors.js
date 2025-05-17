/**
 * This script fixes syntax errors in the storage.ts file 
 * that are preventing deployment and running the application.
 */

const fs = require('fs');
const path = require('path');

// Path to storage.ts file
const storageFilePath = path.join(__dirname, '..', 'server', 'storage.ts');

function fixStorageFile() {
  console.log('Fixing syntax errors in storage.ts...');
  
  // Read the file content
  let content = fs.readFileSync(storageFilePath, 'utf8');
  
  // Fix the syntax error in getAchievements method (extra parenthesis)
  content = content.replace(
    /\.where\(eq\(achievements\.learnerId, learnerId\.toString\(\)\)\)\)/g,
    '.where(eq(achievements.learnerId, learnerId.toString()))'
  );
  
  // Fix the syntax error in deleteUser method (extra parenthesis)
  content = content.replace(
    /\.where\(eq\(achievements\.learnerId, id\.toString\(\)\)\)\)/g, 
    '.where(eq(achievements.learnerId, id.toString()))'
  );
  
  // Fix any other possible duplicate orderBy lines
  content = content.replace(
    /\.orderBy\(desc\(achievements\.awardedAt\)\);\s+\.orderBy\(desc\(achievements\.awardedAt\)\);/g,
    '.orderBy(desc(achievements.awardedAt));'
  );
  
  // Write the fixed content back to the file
  fs.writeFileSync(storageFilePath, content, 'utf8');
  
  console.log('Fixed syntax errors in storage.ts successfully');
}

// Execute the fix
fixStorageFile();