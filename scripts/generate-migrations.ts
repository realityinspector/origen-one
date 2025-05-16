import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

async function main() {
  try {
    console.log('Generating migrations...');
    
    // Create drizzle.config.ts temporarily
    const configPath = path.resolve(process.cwd(), 'drizzle.config.ts');
    const configContent = `import type { Config } from 'drizzle-kit';

export default {
  schema: './shared/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || '',
  },
  verbose: true,
  strict: true,
} satisfies Config;
`;
    
    fs.writeFileSync(configPath, configContent);
    console.log('Created temporary drizzle.config.ts');
    
    // Generate migrations
    const { stdout, stderr } = await execAsync('npx drizzle-kit generate:pg');
    console.log(stdout);
    if (stderr) console.error(stderr);
    
    // Remove temporary config file
    fs.unlinkSync(configPath);
    console.log('Removed temporary drizzle.config.ts');
    
    console.log('Migration files generated successfully!');
  } catch (error) {
    console.error('Error generating migrations:', error);
    process.exit(1);
  }
}

main();
