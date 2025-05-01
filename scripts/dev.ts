import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Build the React application
console.log('Building React application...');
try {
  execSync('cd client && npm run build', { stdio: 'inherit' });
  console.log('React build successful!');
} catch (error) {
  console.error('Error building React application:', error);
  process.exit(1);
}

// Start the server
console.log('Starting the server...');
try {
  // We use require to execute the script directly
  require('../server/index');
} catch (error) {
  console.error('Error starting server:', error);
  process.exit(1);
}
