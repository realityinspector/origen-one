const fs = require('fs');

// Fix the storage.ts file directly
let content = fs.readFileSync('./server/storage.ts', 'utf8');

// Fix line 751
content = content.replace(
  /\.where\(eq\(achievements\.learnerId, learnerId\.toString\(\)\)\)\)/g,
  '.where(eq(achievements.learnerId, learnerId.toString()))'
);

// Fix line 850
content = content.replace(
  /await db\.delete\(achievements\)\.where\(eq\(achievements\.learnerId, id\.toString\(\)\)\)\)\)/g,
  'await db.delete(achievements).where(eq(achievements.learnerId, id.toString()))'
);

// Write the changes back to the file
fs.writeFileSync('./server/storage.ts', content, 'utf8');

console.log('Fixed storage.ts syntax errors');