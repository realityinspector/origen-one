import { storage } from '../server/storage';
import { comparePasswords } from '../server/middleware/auth';

/**
 * Debug script to test login functionality
 * Usage: ts-node scripts/debug-login.ts <username> <password>
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: ts-node scripts/debug-login.ts <username> <password>');
    process.exit(1);
  }
  
  const username = args[0];
  const password = args[1];
  
  console.log('========================================');
  console.log('LOGIN DEBUGGING');
  console.log('========================================');
  console.log(`Testing login for: ${username}`);
  console.log(`Password (length: ${password.length}):`, password);
  console.log('----------------------------------------');
  
  try {
    // Step 1: Find the user
    console.log('STEP 1: Finding user');
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      console.error(`Error: User "${username}" not found in database`);
      process.exit(1);
    }
    
    console.log('User found:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
    
    // Step 2: Examine password hash format
    console.log('----------------------------------------');
    console.log('STEP 2: Examining stored password hash');
    const storedPassword = user.password;
    console.log(`Stored hash length: ${storedPassword.length}`);
    
    // Check if the hash has the expected format (hash.salt)
    const parts = storedPassword.split('.');
    if (parts.length !== 2) {
      console.error(`ERROR: Invalid hash format. Expected format: <hash>.<salt>`);
      console.error(`Actual format: ${parts.length} parts`);
      process.exit(1);
    }
    
    console.log('Hash format is valid (hash.salt)');
    console.log(`Hash part length: ${parts[0].length}`);
    console.log(`Salt part length: ${parts[1].length}`);
    
    // Step 3: Password comparison
    console.log('----------------------------------------');
    console.log('STEP 3: Testing password comparison');
    console.log(`Raw input password: "${password}"`);
    console.log(`ASCII codes of password: ${Array.from(password).map((c: string) => c.charCodeAt(0)).join(', ')}`);
    
    // JSON round-trip test (simulate API request)
    const apiPayload = { username, password };
    const jsonString = JSON.stringify(apiPayload);
    const parsedPayload = JSON.parse(jsonString) as { username: string, password: string };
    
    console.log('Simulating API request/response JSON conversion:');
    console.log(`Original password: "${password}"`);
    console.log(`JSON.stringify result: ${jsonString}`);
    console.log(`Password after JSON.parse: "${parsedPayload.password}"`);
    console.log(`ASCII after JSON round-trip: ${Array.from(parsedPayload.password).map((c: string) => c.charCodeAt(0)).join(', ')}`);
    
    if (password !== parsedPayload.password) {
      console.error('WARNING: JSON serialization altered the password');
    } else {
      console.log('JSON serialization preserved the password correctly');
    }
    
    // Test password comparison directly
    console.log('----------------------------------------');
    console.log('Testing direct password comparison:');
    const passwordMatch = await comparePasswords(password, storedPassword);
    console.log(`Direct comparison result: ${passwordMatch ? 'SUCCESS' : 'FAILURE'}`);
    
    // Test with JSON-parsed version (simulating API)
    console.log('Testing API-simulated password comparison:');
    const apiPasswordMatch = await comparePasswords(parsedPayload.password, storedPassword);
    console.log(`API-simulated comparison result: ${apiPasswordMatch ? 'SUCCESS' : 'FAILURE'}`);
    
    console.log('========================================');
    if (passwordMatch) {
      console.log('✓ PASSWORD IS VALID - Direct comparison succeeded');
    } else {
      console.log('✗ PASSWORD IS INVALID - Direct comparison failed');
    }
    
    if (apiPasswordMatch) {
      console.log('✓ API LOGIN SHOULD WORK - API-simulated comparison succeeded');
    } else {
      console.log('✗ API LOGIN WILL FAIL - API-simulated comparison failed');
    }
    console.log('========================================');
    
  } catch (error) {
    console.error('Error during login debugging:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});