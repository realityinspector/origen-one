import { storage } from '../server/storage';
import { comparePasswords } from '../server/middleware/auth';

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: ts-node debug-auth.ts <username> <password>');
    process.exit(1);
  }
  
  const username = args[0];
  const password = args[1];
  
  try {
    // Check if user exists
    console.log(`Looking up user: ${username}`);
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      console.error(`Error: User "${username}" not found`);
      process.exit(1);
    }
    
    console.log('User found:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      passwordLength: user.password.length,
      passwordStart: user.password.substring(0, 20),
      passwordEnd: user.password.substring(user.password.length - 20)
    });
    
    // Check password
    console.log(`Comparing provided password (length: ${password.length}) with stored hash...`);
    const passwordMatch = await comparePasswords(password, user.password);
    
    console.log(`Password match result: ${passwordMatch ? 'SUCCESS' : 'FAILURE'}`);
    process.exit(0);
  } catch (error) {
    console.error('Error during authentication debug:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});