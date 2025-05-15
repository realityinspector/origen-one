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

  // Regular JWT login endpoint
  app.post("/api/login", asyncHandler(async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Verify password
      const isPasswordValid = user.password ? await comparePasswords(password, user.password) : false;
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = generateToken({ id: user.id, role: user.role });
      
      // Return user details and token
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        token,
        user: userWithoutPassword
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

  // User info endpoint
  app.get("/api/user", authenticateJwt, asyncHandler(async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // We're not retrieving the user from database here since it's already in req.user
      // But we're removing the password field for security
      const { password: _, ...userWithoutPassword } = req.user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error retrieving user info:', error);
      res.status(500).json({ error: 'Failed to retrieve user info' });
    }
  }));
}

// Temporary authentication middleware, simplified
export const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  // Just use JWT auth
  return authenticateJwt(req, res, next);
};