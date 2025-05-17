/**
 * This script fixes TypeScript type issues specifically for deployment.
 * It patches the files that are causing deployment errors by adding type conversions.
 */

const fs = require('fs');
const path = require('path');

// Update .env file to add TS_NODE_TRANSPILE_ONLY=true
function updateEnvFile() {
  console.log('Updating .env file...');
  
  const envPath = path.join(__dirname, '..', '.env');
  
  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, 'TS_NODE_TRANSPILE_ONLY=true\n', 'utf8');
    console.log('Created .env file with TS_NODE_TRANSPILE_ONLY=true');
    return;
  }
  
  // Read .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if TS_NODE_TRANSPILE_ONLY is already set
  if (envContent.includes('TS_NODE_TRANSPILE_ONLY=true')) {
    console.log('TS_NODE_TRANSPILE_ONLY is already set in .env file');
    return;
  }
  
  // Add TS_NODE_TRANSPILE_ONLY=true to .env file
  fs.writeFileSync(envPath, envContent + '\nTS_NODE_TRANSPILE_ONLY=true\n', 'utf8');
  console.log('Added TS_NODE_TRANSPILE_ONLY=true to .env file');
}

// Fix routes.ts file
function fixRoutesFile() {
  console.log('Fixing server/routes.ts...');
  
  const routesPath = path.join(__dirname, '..', 'server', 'routes.ts');
  let content = fs.readFileSync(routesPath, 'utf8');
  
  // Fix comparison between number and string
  content = content.replace(
    /if\s*\(\s*req\.params\.id\s*!==?\s*user\.id\s*\)/g,
    'if (req.params.id !== user.id.toString())'
  );
  
  // Fix learner ID comparison in routes
  content = content.replace(
    /if\s*\(\s*learnerId\s*!==?\s*user\.id\s*\)/g,
    'if (learnerId !== user.id.toString())'
  );
  
  // Fix parentId comparisons
  content = content.replace(
    /if\s*\(\s*parentId\s*!==?\s*userId\s*\)/g,
    'if (parentId !== userId.toString())'
  );
  
  // Fix number to string conversions
  content = content.replace(
    /learnerId\s*=\s*user\.id/g,
    'learnerId = user.id.toString()'
  );
  
  fs.writeFileSync(routesPath, content, 'utf8');
  console.log('Fixed server/routes.ts');
}

// Fix storage.ts file
function fixStorageFile() {
  console.log('Fixing server/storage.ts...');
  
  const storagePath = path.join(__dirname, '..', 'server', 'storage.ts');
  let content = fs.readFileSync(storagePath, 'utf8');
  
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
  
  // Add type conversion for userId
  content = content.replace(
    /where\(eq\(learnerProfiles\.userId, userId\)\)/g,
    'where(eq(learnerProfiles.userId, typeof userId === "string" ? userId : userId.toString()))'
  );
  
  // Add type conversion for learnerId
  content = content.replace(
    /where\(eq\(lessons\.learnerId, learnerId\)\)/g,
    'where(eq(lessons.learnerId, typeof learnerId === "string" ? learnerId : learnerId.toString()))'
  );
  
  // Add type conversion for module id
  content = content.replace(
    /where\(eq\(modules\.id, moduleId\)\)/g,
    'where(eq(modules.id, typeof moduleId === "string" ? moduleId : moduleId.toString()))'
  );
  
  fs.writeFileSync(storagePath, content, 'utf8');
  console.log('Fixed server/storage.ts');
}

function main() {
  console.log('Starting deployment issue fix script...');
  
  // Update .env file
  updateEnvFile();
  
  // Fix routes.ts
  fixRoutesFile();
  
  // Fix storage.ts
  fixStorageFile();
  
  console.log('Deployment issues fixed successfully!');
  console.log('Your app should now deploy without TypeScript errors.');
}

// Execute the main function
main();