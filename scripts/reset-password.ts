import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, comparePasswords } from '../server/middleware/auth';

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: ts-node reset-password.ts <username> <new_password>');
    process.exit(1);
  }
  
  const username = args[0];
  
  // Use the raw password string exactly as provided, without any interpretation
  const newPassword = args[1];
  
  try {
    // Check if user exists
    const userResults = await db.select().from(users).where(eq(users.username, username));
    
    if (userResults.length === 0) {
      console.error(`Error: User "${username}" not found`);
      process.exit(1);
    }
    
    const user = userResults[0];
    
    // Hash the new password
    console.log(`Resetting password for user "${username}" (ID: ${user.id})`);
    console.log(`New password length: ${newPassword.length} characters`);
    
    const hashedPassword = await hashPassword(newPassword);
    console.log(`Generated hash length: ${hashedPassword.length} characters`);
    
    // Update the user's password in the database
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));
    
    // Double-check by retrieving the updated user
    const updatedUserResults = await db.select().from(users).where(eq(users.id, user.id));
    const updatedUser = updatedUserResults[0];
    
    // Verify the new password works
    const verifyResult = await comparePasswords(newPassword, updatedUser.password);
    
    if (verifyResult) {
      console.log(`Password for user "${username}" has been updated and verified successfully.`);
    } else {
      console.error(`Password was updated but verification failed. This is unexpected.`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating password:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});