/**
 * This script fixes all the remaining syntax and type issues in storage.ts
 */

const fs = require('fs');
const path = require('path');

// Fix the storage.ts file directly
try {
  console.log('Applying complete fix to storage.ts...');
  const filePath = path.join(process.cwd(), 'server/storage.ts');
  let content = fs.readFileSync(filePath, 'utf8');

  // Convert string/number type mismatches
  content = content.replace(
    /\.where\(eq\(dbSyncConfigs\.parentId, Number\(Number\(parentId\)\)\)\)/g,
    '.where(eq(dbSyncConfigs.parentId, parentId.toString()))'
  );

  // Save the fixed file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed storage.ts successfully');

} catch (error) {
  console.error('Error fixing files:', error);
}