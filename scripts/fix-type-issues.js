#!/usr/bin/env node

/**
 * This script fixes TypeScript type mismatch errors in routes.ts and storage.ts
 * that are preventing successful deployment.
 */

const fs = require('fs');
const path = require('path');

function fixRoutesFile() {
  try {
    console.log('Fixing type issues in server/routes.ts...');
    const filePath = path.join(process.cwd(), 'server/routes.ts');
    
    if (!fs.existsSync(filePath)) {
      console.warn('server/routes.ts not found');
      return;
    }
    
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix line 884 - Convert string ID to number
    content = content.replace(
      /learnerId: targetLearnerId,/g,
      'learnerId: Number(targetLearnerId),'
    );
    
    // Write the fixed content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed server/routes.ts successfully');
  } catch (error) {
    console.error('Error fixing server/routes.ts:', error);
  }
}

function fixStorageFile() {
  try {
    console.log('Fixing type issues in server/storage.ts...');
    const filePath = path.join(process.cwd(), 'server/storage.ts');
    
    if (!fs.existsSync(filePath)) {
      console.warn('server/storage.ts not found');
      return;
    }
    
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix lines 383 and 389 - These appear to be JSON stringify issues but not type conversion issues
    // No changes needed here
    
    // Fix line 761 - Convert parentId to string
    content = content.replace(
      /\.where\(eq\(dbSyncConfigs\.parentId, Number\(Number\(parentId\)\)\)\)/g,
      '.where(eq(dbSyncConfigs.parentId, parentId.toString()))'
    );
    
    // Write the fixed content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed server/storage.ts successfully');
  } catch (error) {
    console.error('Error fixing server/storage.ts:', error);
  }
}

// Run the fixes
fixRoutesFile();
fixStorageFile();