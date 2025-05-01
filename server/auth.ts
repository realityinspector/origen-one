import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { User } from "../shared/schema";
import { asyncHandler, hashPassword, comparePasswords, generateToken, authenticateJwt, hasRoleMiddleware, AuthRequest } from "./middleware/auth";

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
    
    // Create the user
    const user = await storage.createUser({
      username,
      email,
      name,
      role,
      password: await hashPassword(password),
      parentId: parentId || null,
    });

    // If role is LEARNER, create a learner profile
    if (role === "LEARNER" && req.body.gradeLevel) {
      await storage.createLearnerProfile({
        userId: user.id,
        gradeLevel: req.body.gradeLevel,
        graph: { nodes: [], edges: [] },
      });
    }

    // Generate JWT token
    const token = generateToken(user);
    
    // Return the token and user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  }));

  // Login and return a JWT token
  app.post("/api/login", asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    
    // Find the user
    const user = await storage.getUserByUsername(username);
    if (!user || !(await comparePasswords(password, user.password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return the token and user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      token,
      user: userWithoutPassword
    });
  }));

  // Get current user info
  app.get("/api/user", authenticateJwt, asyncHandler(async (req: AuthRequest, res) => {
    const { password: _, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  }));
}
