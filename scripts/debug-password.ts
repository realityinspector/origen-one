import { storage } from '../server/storage';
import { hashPassword, comparePasswords } from '../server/middleware/auth';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function detailedCompare(supplied: string, stored: string): Promise<boolean> {
  console.log('Detailed comparison:');
  console.log('  Supplied password:', supplied);
  console.log('  Stored hash length:', stored.length);
  
  // Split the hash
  const parts = stored.split('.');
  console.log('  Hash parts count:', parts.length);
  
  if (parts.length !== 2) {
    console.error('  ERROR: Invalid hash format. Expected format: <hash>.<salt>');
    return false;
  }
  
  const [hashed, salt] = parts;
  console.log('  Hash part length:', hashed.length);
  console.log('  Salt part length:', salt.length);
  
  try {
    // Recreate hash from supplied password
    console.log('  Trying to recreate hash with supplied password...');
    const hashedBuf = Buffer.from(hashed, 'hex');
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    console.log('  Original hash buffer length:', hashedBuf.length);
    console.log('  Supplied hash buffer length:', suppliedBuf.length);
    
    // Compare small sections for debugging
    console.log('  First 10 bytes of original hash:', hashedBuf.slice(0, 10).toString('hex'));
    console.log('  First 10 bytes of supplied hash:', suppliedBuf.slice(0, 10).toString('hex'));
    
    // Try regular comparison
    const isEqual = hashedBuf.toString('hex') === suppliedBuf.toString('hex');
    console.log('  Regular comparison result:', isEqual);
    
    // Try timing-safe comparison
    try {
      const isTimingSafeEqual = timingSafeEqual(hashedBuf, suppliedBuf);
      console.log('  Timing-safe comparison result:', isTimingSafeEqual);
      return isTimingSafeEqual;
    } catch (error) {
      console.error('  Error in timing-safe comparison:', error);
      return false;
    }
  } catch (error) {
    console.error('  Error during detailed comparison:', error);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: ts-node debug-password.ts <username> <password>');
    process.exit(1);
  }
  
  const username = args[0];
  const password = args[1];
  
  try {
    // Get the user
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
      role: user.role
    });
    
    // Normal password comparison
    console.log('\nStandard password comparison:');
    const passwordMatch = await comparePasswords(password, user.password);
    console.log(`Password match result: ${passwordMatch ? 'SUCCESS' : 'FAILURE'}`);
    
    // Detailed comparison
    console.log('\nDetailed password comparison:');
    await detailedCompare(password, user.password);
    
    // Create a new hash of the same password
    console.log('\nCreating new hash with the same password:');
    const newHash = await hashPassword(password);
    console.log('New hash:', newHash);
    console.log('New hash length:', newHash.length);
    
    // Compare with newly created hash
    console.log('\nComparing password with newly created hash:');
    const newHashMatch = await comparePasswords(password, newHash);
    console.log(`New hash match result: ${newHashMatch ? 'SUCCESS' : 'FAILURE'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});