// This script must be executed before deployment to fix type issues
const fs = require('fs');
const path = require('path');

// List of files to fix
const filesToFix = [
  'server/storage.ts',
  'server/routes.ts'
];

// Process each file
filesToFix.forEach(filePath => {
  const fullPath = path.resolve(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`Processing ${filePath}...`);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix string-to-number conversion for user IDs
    content = content.replace(
      /eq\((users|learnerProfiles|lessons)\.([^,]+), ([^)]+)\)/g, 
      (match, table, column, value) => {
        // Skip if value is a numeric literal
        if (/^\d+$/.test(value.trim())) {
          return match;
        }
        
        // For user IDs, learner IDs, etc.
        if (column.includes('Id') || column === 'id') {
          return `eq(${table}.${column}, Number(${value}))`;
        }
        
        return match;
      }
    );
    
    // Fix line 737 in routes.ts (learnerId: req.user.id)
    if (filePath === 'server/routes.ts') {
      content = content.replace(
        /learnerId: req\.user\.id/g,
        'learnerId: Number(req.user.id)'
      );
    }
    
    // Fix type issues in getLearnerProfile, updateLearnerProfile, etc.
    if (filePath === 'server/storage.ts') {
      // Fix getLearnerProfile to handle string userId
      content = content.replace(
        /async getLearnerProfile\(userId: string \| null \| undefined\)/g,
        'async getLearnerProfile(userId: string | number | null | undefined)'
      );
      
      // Fix updateLearnerProfile to ensure userId is converted to number
      content = content.replace(
        /const userIdNum = typeof userId === 'string' \? parseInt\(userId\) : userId;/g,
        'const userIdNum = typeof userId === "string" ? parseInt(userId) : userId;'
      );
      
      // Fix getActiveLesson to handle string learnerId
      content = content.replace(
        /async getActiveLesson\(learnerId: string\)/g,
        'async getActiveLesson(learnerId: string | number)'
      );
      
      // Add conversion for learnerId in getActiveLesson
      content = content.replace(
        /\.where\(and\(eq\(lessons\.learnerId, learnerId\)/g,
        '.where(and(eq(lessons.learnerId, typeof learnerId === "string" ? Number(learnerId) : learnerId)'
      );
      
      // Fix getLearnerLessons to handle string learnerId
      content = content.replace(
        /async getLearnerLessons\(learnerId: string\)/g,
        'async getLearnerLessons(learnerId: string | number)'
      );
      
      // Add conversion for learnerId in getLearnerLessons
      content = content.replace(
        /\.where\(eq\(lessons\.learnerId, learnerId\)\)/g,
        '.where(eq(lessons.learnerId, typeof learnerId === "string" ? Number(learnerId) : learnerId))'
      );
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
  } else {
    console.warn(`File not found: ${filePath}`);
  }
});

console.log('TypeScript compilation fix applied successfully');