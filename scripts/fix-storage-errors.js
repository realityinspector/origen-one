#!/usr/bin/env node

/**
 * This script fixes specific syntax errors in server/storage.ts file
 * that are preventing successful deployment.
 */

const fs = require('fs');
const path = require('path');

function fixStorageFile() {
  try {
    console.log('Fixing server/storage.ts...');
    const filePath = path.join(process.cwd(), 'server/storage.ts');
    
    if (!fs.existsSync(filePath)) {
      console.warn('server/storage.ts not found');
      return;
    }
    
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix line 751 - Extra parentheses in getAchievements method
    content = content.replace(
      /\.where\(eq\(achievements\.learnerId, learnerId\.toString\(\)\)\)\)/g,
      '.where(eq(achievements.learnerId, learnerId.toString()))'
    );
    
    // Fix line 850 - Extra parentheses in deleteUser method
    content = content.replace(
      /await db\.delete\(achievements\)\.where\(eq\(achievements\.learnerId, id\.toString\(\)\)\)\)\)\)\)/g,
      'await db.delete(achievements).where(eq(achievements.learnerId, id.toString()))'
    );
    
    // Fix with a more general approach if specific replacements didn't work
    content = content.replace(
      /await db\.delete\(achievements\)\.where\(eq\(achievements\.learnerId, id\.toString\(\)\)\)/g,
      'await db.delete(achievements).where(eq(achievements.learnerId, id.toString()))'
    );
    
    // Fix any trailing parentheses after toString() calls
    content = content.replace(/toString\(\)\)+\)/g, 'toString()))');
    
    // Write the fixed content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed server/storage.ts successfully');
  } catch (error) {
    console.error('Error fixing server/storage.ts:', error);
  }
}

// Run the fix
fixStorageFile();