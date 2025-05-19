
const fs = require('fs');
const path = require('path');

function fixRoutesFile() {
  const routesPath = path.join(process.cwd(), 'server/routes.ts');
  let content = fs.readFileSync(routesPath, 'utf8');

  // Fix template literal syntax and missing commas
  content = content.replace(/`([^`]*)\$\{([^}]*)\}\$([^`]*)`/g, '`$1${$2}$3`');
  content = content.replace(/\+ '([^']*)'/g, "+ '$1'");

  // Fix specific template literal issues
  content = content.replace(
    /content: `# \$\{topic \|\| finalSubject \|\| 'Sample'\} Lesson\\n\\nThis is a lesson about \$\{topic \|\| finalSubject \|\| 'a sample topic'\}\.`,/g,
    "content: `# ${topic || finalSubject || 'Sample'} Lesson\\n\\nThis is a lesson about ${topic || finalSubject || 'a sample topic'}`,");

  // Fix string concatenation and missing commas
  content = content.replace(/\)\s*\{/g, ') {');
  content = content.replace(/(\w+):\s*`([^`]+)`([^\n,])/g, '$1: `$2`$3,');

  fs.writeFileSync(routesPath, content);
  console.log('Fixed TypeScript syntax in routes.ts');
}

fixRoutesFile();
