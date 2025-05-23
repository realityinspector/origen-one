import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { users } from "../shared/schema";
import { asyncHandler, hashPassword, comparePasswords, generateToken, authenticateJwt, hasRoleMiddleware, AuthRequest } from "./middleware/auth";
import { db } from "./db";
import { count } from "drizzle-orm";
import passport from "passport";

/**
 * Sets up authentication routes (JWT auth only for now)
 */
export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(passport.initialize());

  // Endpoint to check server and database health
  app.get("/api/healthcheck", asyncHandler(async (req, res) => {
    try {
      // Count users for basic DB query test
      const result = await db.select({ count: count() }).from(users);
      const userCount = result[0]?.count || 0;
      
      return res.json({ 
        status: "ok", 
        db: "connected",
        userCount 
      });
    } catch (error) {
      console.error("Health check error:", error);
      return res.status(500).json({ 
        status: "error",
        message: "Database connection failed",
        error: (error as Error).message 
      });
    }
  }));

  // Enhanced JWT login endpoint with cross-domain support
  app.post("/api/login", asyncHandler(async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      // Log detailed information about the login request for debugging
      const origin = req.headers.origin || req.headers.referer || 'unknown';
      const isSunschool = origin.includes('sunschool.xyz');
      console.log(`Login attempt for username: ${username} from origin: ${origin}`);
      
      // For sunschool.xyz domain, add special CORS headers for authentication
      if (isSunschool) {
        console.log('Adding special CORS headers for sunschool.xyz domain');
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Sunschool-Auth,X-Sunschool-Auth-Token');
      }
      
      if (!username || !password) {
        console.log('Missing login credentials');
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        console.log(`User not found: ${username}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Verify password
      const isPasswordValid = user.password ? await comparePasswords(password, user.password) : false;
      
      if (!isPasswordValid) {
        console.log(`Password mismatch for user: ${username}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = generateToken({ id: user.id, role: user.role });
      console.log(`Generated token for user ${username}, token length: ${token.length}`);
      
      // Return user details and token
      const { password: _, ...userWithoutPassword } = user;
      
      // Include domain information in the response for client-side handling
      console.log(`Successful login for user: ${username} (${user.id})`);
      res.json({
        token,
        user: userWithoutPassword,
        domain: isSunschool ? 'sunschool.xyz' : origin.split('://')[1]?.split(':')[0] || 'unknown'
      });
    } catch (error) {
      console.error('Authentication endpoint error:', error);
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      console.error(`Authentication endpoint error: ${errorMessage}`);
      
      res.status(500).json({ 
        error: 'An error occurred during authentication. Please try again.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  }));

  // Enhanced user info endpoint with cross-domain support
  app.get("/api/user", authenticateJwt, (req: AuthRequest, res: Response, next: NextFunction) => {
    // Log the request info for debugging
    const origin = req.headers.origin || req.headers.referer || 'unknown';
    const isSunschool = origin.includes('sunschool.xyz');
    
    if (isSunschool) {
      // Add special CORS headers for sunschool.xyz domain
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Sunschool-Auth,X-Sunschool-Auth-Token');
    }
    
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    
    try {
      // We're not retrieving the user from database here since it's already in req.user
      // But we're removing the password field for security
      const { password: _, ...userWithoutPassword } = req.user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error retrieving user info:', error);
      res.status(500).json({ error: 'Failed to retrieve user info' });
    }
  });
}

// Temporary authentication middleware, simplified
export const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  // Just use JWT auth
  return authenticateJwt(req, res, next);
};