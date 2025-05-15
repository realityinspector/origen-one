import express, { Express, Request, Response, NextFunction, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateLesson, checkForAchievements } from "./utils";
import { asyncHandler, authenticateJwt, hasRoleMiddleware, AuthRequest } from "./middleware/auth";
import { synchronizeToExternalDatabase } from "./sync-utils";
import { InsertDbSyncConfig } from "../shared/schema";
import { USE_AI } from "./config/flags";

// Use our imported middleware functions for authentication
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  return authenticateJwt(req as AuthRequest, res, next);
}

function hasRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // First authenticate the user
    authenticateJwt(req as AuthRequest, res, (err?: any) => {
      if (err) return next(err);
      
      // Then check the role
      return hasRoleMiddleware(roles)(req as AuthRequest, res, next);
    });
  };
}

export function registerRoutes(app: Express): Server {
  // Set up authentication routes
  setupAuth(app);

  // Health check endpoint
  app.get("/api/healthcheck", (req: Request, res: Response) => {
    res.json({ status: "ok", message: "Server is running" });
  });
  
  // Special API route to handle the root-level login/register/user for production deployment
  app.post("/login", (req: Request, res: Response) => {
    // Forward the request to the real API endpoint
    console.log("Proxy: Forwarding login request to /api/login");
    req.url = "/api/login";
    app._router.handle(req, res);
  });
  
  app.post("/register", (req: Request, res: Response) => {
    // Forward the request to the real API endpoint
    console.log("Proxy: Forwarding register request to /api/register");
    req.url = "/api/register";
    app._router.handle(req, res);
  });
  
  app.post("/logout", (req: Request, res: Response) => {
    // Forward the request to the real API endpoint
    console.log("Proxy: Forwarding logout request to /api/logout");
    req.url = "/api/logout";
    app._router.handle(req, res);
  });
  
  app.get("/user", (req: Request, res: Response) => {
    // Forward the request to the real API endpoint
    console.log("Proxy: Forwarding user request to /api/user");
    req.url = "/api/user";
    app._router.handle(req, res);
  });
  
  // Get all parent accounts (Admin only)
  app.get("/api/parents", hasRole(["ADMIN"]), asyncHandler(async (req: AuthRequest, res) => {
    const parents = await storage.getAllParents();
    res.json(parents);
  }));
  
  // Get learners for a parent (Parent only)
  app.get("/api/learners", hasRole(["PARENT", "ADMIN"]), asyncHandler(async (req: AuthRequest, res) => {
    let learners;
    if (req.user?.role === "ADMIN" && req.query.parentId) {
      learners = await storage.getUsersByParentId(Number(req.query.parentId));
    } else if (req.user?.role === "PARENT") {
      learners = await storage.getUsersByParentId(req.user.id);
    } else {
      return res.status(400).json({ error: "Invalid request" });
    }
    res.json(learners);
  }));
  
  // Create a new learner account
  app.post("/api/learners", hasRole(["PARENT", "ADMIN"]), asyncHandler(async (req: AuthRequest, res) => {
    const { name, email, password, role = "LEARNER" } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields: name, email, password" });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    
    try {
      // Check if email already exists
      const existingUser = await storage.getUserByUsername(email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already in use" });
      }
      
      // Set parent ID based on the user's role
      let parentId: number | null = null;
      
      // For PARENT users, the parent is the user themselves
      if (req.user?.role === "PARENT") {
        parentId = req.user.id;
      } 
      // For ADMIN users, check if parentId was provided in the request
      else if (req.user?.role === "ADMIN") {
        // If parentId was provided in the request body, use that
        if (req.body.parentId) {
          parentId = Number(req.body.parentId);
        } 
        // If creating a LEARNER as an ADMIN but no parentId specified,
        // use the admin as the parent (this is our fallback solution)
        else if (role === "LEARNER") {
          parentId = req.user.id;
          console.log(`Admin creating learner without parentId specified. Using admin (${req.user.id}) as parent.`);
        }
      } 
      // For any other scenario where a LEARNER is being created without a parent
      else if (role === "LEARNER" && !parentId) {
        // Learners must have a parent
        return res.status(400).json({ error: "Learner accounts must have a parent" });
      }
      
      // Create the new user
      const newUser = await storage.createUser({
        email,
        username: email, // Use email as username
        password, // This will be hashed in the storage layer
        name,
        role,
        parentId,
      });
      
      // If it's a learner, create their profile automatically
      if (newUser.role === "LEARNER") {
        await storage.createLearnerProfile({
          userId: newUser.id,
          gradeLevel: req.body.gradeLevel || 5, // Default to grade 5 if not specified
          graph: { nodes: [], edges: [] },
        });
      }
      
      // Return the created user without password
      const { password: _, ...userResponse } = newUser;
      res.status(201).json(userResponse);
      
    } catch (error) {
      console.error('Error creating new learner:', error);
      res.status(500).json({ error: "Failed to create learner account" });
    }
  }));
  
  // Get learner profile (create if needed)
  app.get("/api/learner-profile/:userId", isAuthenticated, asyncHandler(async (req: AuthRequest, res) => {
    const userId = parseInt(req.params.userId);
    
    // Admins can view any profile, parents can view their children, learners can view their own
    if (
      req.user?.role === "ADMIN" ||
      (req.user?.role === "PARENT" && (await storage.getUsersByParentId(req.user.id)).some(u => u.id === userId)) ||
      (req.user?.id === userId)
    ) {
      try {
        // Get existing profile or create a new one
        let profile = await storage.getLearnerProfile(userId);
        
        // If no profile exists and it's the current user, create one
        if (!profile && req.user?.id === userId) {
          console.log(`Creating learner profile for user ${userId}`);
          // Create a default profile with grade level 5
          profile = await storage.createLearnerProfile({
            userId,
            gradeLevel: 5,  // Default to grade 5
            graph: { nodes: [], edges: [] },
          });
        } else if (!profile) {
          return res.status(404).json({ error: "Learner profile not found" });
        }
        
        return res.json(profile);
      } catch (error) {
        console.error('Error getting or creating learner profile:', error);
        return res.status(500).json({ error: "Failed to get or create learner profile" });
      }
    }
    
    return res.status(403).json({ error: "Forbidden" });
  }));
  
  // Update learner profile (supports updating grade level)
  app.put("/api/learner-profile/:userId", hasRole(["PARENT", "ADMIN"]), asyncHandler(async (req: AuthRequest, res) => {
    const userId = parseInt(req.params.userId);
    const { gradeLevel } = req.body;
    
    // Validate grade level
    if (gradeLevel === undefined) {
      return res.status(400).json({ error: "Grade level is required" });
    }
    
    // Convert 'K' to 0 for Kindergarten
    let gradeLevelNum: number;
    if (gradeLevel === 'K') {
      gradeLevelNum = 0; // Kindergarten
    } else {
      gradeLevelNum = parseInt(gradeLevel);
      if (isNaN(gradeLevelNum) || gradeLevelNum < 0 || gradeLevelNum > 12) {
        return res.status(400).json({ error: "Grade level must be between K and 12" });
      }
    }
    
    // Check authorization for parents
    if (req.user?.role === "PARENT") {
      // Check if the learner belongs to this parent
      const learners = await storage.getUsersByParentId(req.user.id);
      const isParentOfLearner = learners.some(learner => learner.id === userId);
      
      if (!isParentOfLearner) {
        return res.status(403).json({ error: "Not authorized to update this profile" });
      }
    }
    
    // Update the profile
    try {
      const updatedProfile = await storage.updateLearnerProfile(userId, { 
        gradeLevel: gradeLevelNum 
      });
      
      if (!updatedProfile) {
        return res.status(404).json({ error: "Learner profile not found" });
      }
      
      return res.json(updatedProfile);
    } catch (error) {
      console.error('Error updating learner profile:', error);
      return res.status(500).json({ error: "Failed to update learner profile" });
    }
  }));
  
  // Get active lesson for learner
  app.get("/api/lessons/active", isAuthenticated, asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      // Allow any user to fetch active lesson in learner mode
      let activeLesson = await storage.getActiveLesson(req.user.id);
      
      // Just return the active lesson if found without auto-generating
      if (activeLesson) {
        return res.json(activeLesson);
      }
      
      // If no active lesson, don't auto-generate (handle on frontend)
      return res.json(null);
    } catch (error) {
      console.error('Error fetching active lesson:', error);
      return res.status(500).json({ error: "Failed to fetch active lesson" });
    }
  }));
  
  // Create a custom lesson for a learner
  app.post("/api/lessons/create", isAuthenticated, asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const { topic = '', gradeLevel, learnerId, enhanced = true } = req.body;
    
    if (!gradeLevel || !learnerId) {
      return res.status(400).json({ error: "Missing required fields: gradeLevel, learnerId" });
    }
    
    // Validate user permissions
    const targetLearnerId = Number(learnerId);
    
    // Self-create for learners
    if (req.user.role === "LEARNER" && req.user.id !== targetLearnerId) {
      return res.status(403).json({ error: "Learners can only create lessons for themselves" });
    }
    
    // Parents can only create for their children
    if (req.user.role === "PARENT") {
      const children = await storage.getUsersByParentId(req.user.id);
      if (!children.some(child => child.id === targetLearnerId)) {
        return res.status(403).json({ error: "Parent can only create lessons for their children" });
      }
    }
    
    // Generate the customized lesson
    try {
      if (!USE_AI) {
        return res.status(400).json({ error: "AI lesson generation is currently disabled" });
      }
      
      // Check if enhanced format is explicitly requested
      const useEnhanced = req.body.enhanced !== false; // Default to true if not specified
      console.log(`Generating ${useEnhanced ? 'enhanced' : 'standard'} lesson for "${topic}" (Grade ${gradeLevel})`);
      
      // Generate the lesson with the specified format
      const lessonSpec = await generateLesson(gradeLevel, topic, useEnhanced);
      
      // Create the lesson
      const newLesson = await storage.createLesson({
        learnerId: targetLearnerId,
        moduleId: `custom-${Date.now()}`,
        status: "ACTIVE",
        spec: lessonSpec,
      });
      
      res.json(newLesson);
    } catch (error) {
      console.error('Error creating custom lesson:', error);
      res.status(500).json({ error: "Failed to generate lesson content" });
    }
  }));
  
  // Get a specific lesson by ID
  app.get("/api/lessons/:lessonId", isAuthenticated, asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const lessonId = req.params.lessonId;
    const lesson = await storage.getLessonById(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    
    // Check user's permission to access this lesson
    if (
      req.user.role === "ADMIN" ||
      req.user.id === lesson.learnerId ||
      (req.user.role === "PARENT" && (await storage.getUsersByParentId(req.user.id)).some(u => u.id === lesson.learnerId))
    ) {
      return res.json(lesson);
    }
    
    return res.status(403).json({ error: "Forbidden" });
  }));
  
  // Get lesson history
  app.get("/api/lessons", isAuthenticated, asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    let learnerId: number;
    
    if (req.user.role === "LEARNER") {
      learnerId = req.user.id;
    } else if (req.query.learnerId) {
      learnerId = Number(req.query.learnerId);
      
      // Check if user is authorized to view this learner's lessons
      if (req.user.role === "PARENT") {
        const children = await storage.getUsersByParentId(req.user.id);
        if (!children.some(child => child.id === learnerId)) {
          return res.status(403).json({ error: "Forbidden" });
        }
      }
    } else {
      return res.status(400).json({ error: "learnerId is required" });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const lessons = await storage.getLessonHistory(learnerId, limit);
    res.json(lessons);
  }));
  
  // Submit answer to a quiz question
  app.post("/api/lessons/:lessonId/answer", isAuthenticated, asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const lessonId = req.params.lessonId;
    const { answers } = req.body;
    
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: "Answers must be an array" });
    }
    
    const lesson = await storage.getLessonById(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    
    if (lesson.learnerId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    if (lesson.status !== "ACTIVE") {
      return res.status(400).json({ error: "Lesson is not active" });
    }
    
    // Calculate score
    if (!lesson.spec) {
      return res.status(400).json({ error: "Invalid lesson specification" });
    }
    
    const questions = lesson.spec.questions;
    let correctCount = 0;
    
    for (let i = 0; i < Math.min(answers.length, questions.length); i++) {
      if (answers[i] === questions[i].correctIndex) {
        correctCount++;
      }
    }
    
    const score = Math.round((correctCount / questions.length) * 100);
    
    // Update lesson status
    const updatedLesson = await storage.updateLessonStatus(lessonId, "DONE", score);
    
    // Check for achievements
    const lessonHistory = await storage.getLessonHistory(req.user.id);
    const newAchievements = checkForAchievements(lessonHistory, updatedLesson);
    
    // Award any new achievements
    for (const achievement of newAchievements) {
      await storage.createAchievement({
        learnerId: req.user.id,
        type: achievement.type,
        payload: achievement.payload
      });
    }
    
    // Generate a new lesson
    try {
      const learnerProfile = await storage.getLearnerProfile(req.user.id);
      if (learnerProfile) {
        const lessonSpec = await generateLesson(learnerProfile.gradeLevel);
        await storage.createLesson({
          learnerId: req.user.id,
          moduleId: `generated-${Date.now()}`,
          status: "ACTIVE",
          spec: lessonSpec,
        });
      }
    } catch (error) {
      console.error("Failed to generate a new lesson after quiz completion:", error);
      // Don't fail the request if new lesson generation fails
    }
    
    res.json({
      lesson: updatedLesson,
      score,
      correctCount,
      totalQuestions: questions.length,
      newAchievements: newAchievements.map(a => a.payload)
    });
  }));
  
  // Get achievements for a learner
  app.get("/api/achievements", isAuthenticated, asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    let learnerId: number;
    
    if (req.user.role === "LEARNER") {
      learnerId = req.user.id;
    } else if (req.query.learnerId) {
      learnerId = Number(req.query.learnerId);
      
      // Check if user is authorized to view this learner's achievements
      if (req.user.role === "PARENT") {
        const children = await storage.getUsersByParentId(req.user.id);
        if (!children.some(child => child.id === learnerId)) {
          return res.status(403).json({ error: "Forbidden" });
        }
      }
    } else {
      return res.status(400).json({ error: "learnerId is required" });
    }
    
    const achievements = await storage.getAchievements(learnerId);
    res.json(achievements);
  }));
  
  // Export learner data (for data portability)
  app.get("/api/export", hasRole(["PARENT", "ADMIN"]), asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    if (!req.query.learnerId) {
      return res.status(400).json({ error: "learnerId is required" });
    }
    
    const learnerId = Number(req.query.learnerId);
    
    // Verify parent has access to this learner
    if (req.user.role === "PARENT") {
      const children = await storage.getUsersByParentId(req.user.id);
      if (!children.some(child => child.id === learnerId)) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    
    // Get all the learner data
    const [learner, profile, lessons, achievements] = await Promise.all([
      storage.getUser(learnerId),
      storage.getLearnerProfile(learnerId),
      storage.getLessonHistory(learnerId, 1000), // Get a large number of lessons
      storage.getAchievements(learnerId)
    ]);
    
    if (!learner) {
      return res.status(404).json({ error: "Learner not found" });
    }
    
    // Remove sensitive information
    const { password: _, ...learnerData } = learner;
    
    // Set filename for download
    const filename = `learner-data-${learnerId}-${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    
    // Return combined data
    res.json({
      learner: learnerData,
      profile,
      lessons,
      achievements,
      exportDate: new Date().toISOString(),
      exportedBy: req.user.id
    });
  }));
  
  // Database Synchronization Endpoints
  
  // Get all sync configurations for a parent
  app.get("/api/sync-configs", hasRole(["PARENT"]), asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const syncConfigs = await storage.getSyncConfigsByParentId(req.user.id);
      res.json(syncConfigs);
    } catch (error) {
      console.error('Error getting sync configurations:', error);
      res.status(500).json({ error: "Failed to retrieve synchronization configurations" });
    }
  }));
  
  // Get a specific sync configuration
  app.get("/api/sync-configs/:id", hasRole(["PARENT"]), asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      const syncConfig = await storage.getSyncConfigById(req.params.id);
      
      if (!syncConfig) {
        return res.status(404).json({ error: "Sync configuration not found" });
      }
      
      // Check if the sync config belongs to the requesting parent
      if (syncConfig.parentId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      res.json(syncConfig);
    } catch (error) {
      console.error('Error getting sync configuration:', error);
      res.status(500).json({ error: "Failed to retrieve synchronization configuration" });
    }
  }));
  
  // Create a new sync configuration
  app.post("/api/sync-configs", hasRole(["PARENT"]), asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const { targetDbUrl, continuousSync = false } = req.body;
    
    if (!targetDbUrl) {
      return res.status(400).json({ error: "Missing required field: targetDbUrl" });
    }
    
    // Validate PostgreSQL connection string format
    const postgresRegex = /^postgresql:\/\/\w+:.*@[\w.-]+:\d+\/\w+(\?.*)?$/;
    if (!postgresRegex.test(targetDbUrl)) {
      return res.status(400).json({ 
        error: "Invalid PostgreSQL connection string format",
        message: "Connection string should be in format: postgresql://username:password@hostname:port/database"
      });
    }
    
    try {
      const syncConfig = await storage.createSyncConfig({
        parentId: req.user.id,
        targetDbUrl,
        continuousSync,
        syncStatus: "IDLE"
      });
      
      res.status(201).json(syncConfig);
    } catch (error) {
      console.error('Error creating sync configuration:', error);
      res.status(500).json({ error: "Failed to create synchronization configuration" });
    }
  }));
  
  // Update a sync configuration
  app.put("/api/sync-configs/:id", hasRole(["PARENT"]), asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const { targetDbUrl, continuousSync } = req.body;
    const updateData: Partial<InsertDbSyncConfig> = {};
    
    if (targetDbUrl !== undefined) {
      // Validate PostgreSQL connection string format
      const postgresRegex = /^postgresql:\/\/\w+:.*@[\w.-]+:\d+\/\w+(\?.*)?$/;
      if (!postgresRegex.test(targetDbUrl)) {
        return res.status(400).json({ 
          error: "Invalid PostgreSQL connection string format",
          message: "Connection string should be in format: postgresql://username:password@hostname:port/database"
        });
      }
      updateData.targetDbUrl = targetDbUrl;
    }
    
    if (continuousSync !== undefined) {
      updateData.continuousSync = continuousSync;
    }
    
    try {
      // Check if the sync config exists and belongs to the requesting parent
      const syncConfig = await storage.getSyncConfigById(req.params.id);
      
      if (!syncConfig) {
        return res.status(404).json({ error: "Sync configuration not found" });
      }
      
      if (syncConfig.parentId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Update the sync config
      const updatedConfig = await storage.updateSyncConfig(req.params.id, updateData);
      res.json(updatedConfig);
    } catch (error) {
      console.error('Error updating sync configuration:', error);
      res.status(500).json({ error: "Failed to update synchronization configuration" });
    }
  }));
  
  // Delete a sync configuration
  app.delete("/api/sync-configs/:id", hasRole(["PARENT"]), asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      // Check if the sync config exists and belongs to the requesting parent
      const syncConfig = await storage.getSyncConfigById(req.params.id);
      
      if (!syncConfig) {
        return res.status(404).json({ error: "Sync configuration not found" });
      }
      
      if (syncConfig.parentId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Delete the sync config
      const deleted = await storage.deleteSyncConfig(req.params.id);
      
      if (deleted) {
        res.status(204).end();
      } else {
        res.status(500).json({ error: "Failed to delete synchronization configuration" });
      }
    } catch (error) {
      console.error('Error deleting sync configuration:', error);
      res.status(500).json({ error: "Failed to delete synchronization configuration" });
    }
  }));
  
  // Initiate a one-time sync (push)
  app.post("/api/sync-configs/:id/push", hasRole(["PARENT"]), asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      // Check if the sync config exists and belongs to the requesting parent
      const syncConfig = await storage.getSyncConfigById(req.params.id);
      
      if (!syncConfig) {
        return res.status(404).json({ error: "Sync configuration not found" });
      }
      
      if (syncConfig.parentId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      // Update status to IN_PROGRESS
      await storage.updateSyncStatus(req.params.id, "IN_PROGRESS");
      
      // Start the synchronization process (handled by a separate function)
      // Note: synchronizeToExternalDatabase now handles its own status updates
      synchronizeToExternalDatabase(req.user.id, syncConfig)
        .then(() => {
          console.log(`Synchronization process completed for config ID: ${req.params.id}`);
          // The synchronizeToExternalDatabase function now updates the status internally
        })
        .catch((error) => {
          // Just log the error - the function handles status updates itself
          console.error('Error during synchronization (caught in route handler):', error);
        });
      
      // Return immediately to the client with a status indicating the sync has started
      res.json({ 
        message: "Synchronization started", 
        syncId: req.params.id,
        status: "IN_PROGRESS" 
      });
    } catch (error) {
      console.error('Error initiating synchronization:', error);
      res.status(500).json({ error: "Failed to initiate synchronization" });
    }
  }));
  
  // Error handling middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "An internal server error occurred" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
