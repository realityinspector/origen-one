import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../server/middleware/auth';

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: ts-node reset-password.ts <username> <new_password>');
    process.exit(1);
  }
  
  const username = args[0];
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
    const hashedPassword = await hashPassword(newPassword);
    
    // Update the user's password in the database
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));
    
    console.log(`Password for user "${username}" has been updated successfully.`);
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