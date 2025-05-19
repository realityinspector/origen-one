#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixRoutesFile() {
  const routesPath = path.join(process.cwd(), 'server/routes.ts');
  let content = fs.readFileSync(routesPath, 'utf8');

  // Fix template literal syntax
  content = content.replace(/`([^`]*)\${([^}]*)}\$([^`]*)`/g, '`$1${$2}$3`');

  // Fix string concatenation
  content = content.replace(/\+ '([^']*)'/g, "+ '$1'");

  // Write fixed content back
  fs.writeFileSync(routesPath, content, 'utf8');
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

function main() {
  console.log('Fixing TypeScript compilation issues...');
  fixRoutesFile();
  fixStorageFile();
  console.log('Fixed TypeScript compilation issues');
}

main();