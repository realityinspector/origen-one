import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, comparePasswords } from '../server/middleware/auth';

/**
 * Simple script to reset a user password to a basic string without special characters
 */
async function main() {
  const username = 'realityinspector';
  const newPassword = 'TestPassword123';
  
  try {
    // Find the user
    console.log(`Looking up user: ${username}`);
    const userResults = await db.select().from(users).where(eq(users.username, username));
    
    if (userResults.length === 0) {
      console.error(`Error: User "${username}" not found`);
      process.exit(1);
    }
    
    const user = userResults[0];
    console.log('User found:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
    
    // Hash the new password
    console.log(`Setting simple password for user "${username}"`);
    const hashedPassword = await hashPassword(newPassword);
    
    // Update the user's password in the database
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));
    
    // Verify the password update
    const updatedUserResults = await db.select().from(users).where(eq(users.id, user.id));
    const updatedUser = updatedUserResults[0];
    
    const verifyResult = await comparePasswords(newPassword, updatedUser.password);
    
    if (verifyResult) {
      console.log(`Password for user "${username}" has been updated to "${newPassword}"`);
      console.log('Password verification succeeded');
    } else {
      console.error('Password was updated but verification failed!');
      process.exit(1);
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