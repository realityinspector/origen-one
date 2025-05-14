import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { User } from "../shared/schema";
import { asyncHandler, hashPassword, comparePasswords, generateToken, authenticateJwt, hasRoleMiddleware, AuthRequest } from "./middleware/auth";
import { db } from "./db";
import { users } from "../shared/schema";
import { count } from "drizzle-orm";

/**
 * Sets up JWT authentication routes
 */
export function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  // Register a new user
  app.post("/api/register", asyncHandler(async (req, res, next) => {
    const { username, email, name, role, password, parentId } = req.body;
    
    if (!username || !email || !name || !role || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Verify role is valid
    if (!["ADMIN", "PARENT", "LEARNER"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }
    
    // Check if this is the first user being registered
    const userCountResult = await db.select({ count: count() }).from(users);
    const isFirstUser = userCountResult[0].count === 0;
    
    // If this is the first user, make them an admin regardless of the requested role
    const effectiveRole = isFirstUser ? "ADMIN" : role;
    
    if (isFirstUser) {
      console.log(`First user registration detected. Setting ${username} as ADMIN.`);
    }
    
    // Create the user
    const user = await storage.createUser({
      username,
      email,
      name,
      role: effectiveRole, // Use admin role if first user
      password: await hashPassword(password),
      parentId: parentId || null,
    });

    // If role is LEARNER, create a learner profile
    if (effectiveRole === "LEARNER" && req.body.gradeLevel) {
      await storage.createLearnerProfile({
        userId: user.id,
        gradeLevel: req.body.gradeLevel,
        graph: { nodes: [], edges: [] },
      });
    }

    // Generate JWT token with additional safeguards
    let token;
    try {
      token = generateToken(user);
      if (!token) {
        throw new Error('Token generation failed');
      }
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.status(500).json({ error: 'Authentication token generation failed' });
    }
    
    // Additional logging for production debugging
    console.log('Registration completed for:', username);
    console.log('Token generation successful, token length:', token.length);
    
    // Return the token and user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    // Prepare response object with explicit field checking
    if (!userWithoutPassword || !userWithoutPassword.id) {
      console.error('User data is incomplete:', userWithoutPassword);
      return res.status(500).json({ error: 'User data is incomplete' });
    }
    
    // Create a standardized response object
    const responseObj = {
      token,
      user: userWithoutPassword,
      userData: userWithoutPassword, // Add userData as an alternative
      wasPromotedToAdmin: isFirstUser && role !== "ADMIN" // Flag to notify frontend if role was changed
    };
    
    // Log the final response structure
    console.log('Registration response structure:', {
      hasToken: !!responseObj.token,
      tokenLength: responseObj.token ? responseObj.token.length : 0,
      hasUser: !!responseObj.user,
      userFields: responseObj.user ? Object.keys(responseObj.user) : null,
      userId: responseObj.user ? responseObj.user.id : null,
      responseType: typeof responseObj
    });
    
    // Log the final response object to help with debugging
    console.log('Sending registration response with token length:', token.length);
    
    // Use Express's built-in json method which handles Content-Type automatically
    res.status(201).json(responseObj);
  }));

  // Login and return a JWT token
  app.post("/api/login", asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    
    try {
      // Check database connection first
      const { checkDatabaseConnection } = require('./db');
      const isConnected = await checkDatabaseConnection();
      
      if (!isConnected) {
        console.error('Database connection error during login attempt');
        return res.status(503).json({ 
          error: "Database connection error. Please try again in a moment.",
          isTransient: true
        });
      }
      
      // Find the user
      const user = await storage.getUserByUsername(username);
      
      // Don't reveal whether the username exists or not for security reasons
      if (!user) {
        console.log(`Login failed: User ${username} not found`);
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Check password
      const passwordMatches = await comparePasswords(password, user.password);
      if (!passwordMatches) {
        console.log(`Login failed: Incorrect password for ${username}`);
        return res.status(401).json({ error: "Invalid username or password" });
      }
    
      // Generate JWT token with additional safeguards
      let token;
      try {
      token = generateToken(user);
      if (!token) {
        throw new Error('Token generation failed');
      }
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.status(500).json({ error: 'Authentication token generation failed' });
    }
    
      // Additional logging for production debugging
      console.log('Login successful for:', username);
      console.log('Token generation successful, token length:', token.length);
      
      // Return the token and user data (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      
      // Prepare response object with explicit field checking
      if (!userWithoutPassword || !userWithoutPassword.id) {
        console.error('User data is incomplete:', userWithoutPassword);
        return res.status(500).json({ error: 'User data is incomplete' });
      }
      
      // Create a standardized response object
      const responseObj = {
        token,
        user: userWithoutPassword,
        userData: userWithoutPassword // Add userData as an alternative
      };
      
      // Log the final response structure
      console.log('Login response structure:', {
        hasToken: !!responseObj.token,
        tokenLength: responseObj.token ? responseObj.token.length : 0,
        hasUser: !!responseObj.user,
        userFields: responseObj.user ? Object.keys(responseObj.user) : null,
        userId: responseObj.user ? responseObj.user.id : null,
        responseType: typeof responseObj
      });
      
      // Log the final response object to help with debugging
      console.log('Sending login response with token length:', token.length);
      
      // Use Express's built-in json method which handles Content-Type automatically
      res.status(200).json(responseObj);
    } catch (error) {
      console.error('Authentication endpoint error:', error);
      res.status(500).json({ 
        error: 'An error occurred during authentication. Please try again.',
        isTransient: true
      });
    }
  }));

  // Get current user info
  app.get("/api/user", authenticateJwt, asyncHandler(async (req: AuthRequest, res) => {
    const { password: _, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  }));
}
