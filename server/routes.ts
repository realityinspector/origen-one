import express, { Express, Request, Response, NextFunction, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateLesson, checkForAchievements } from "./utils";
import { asyncHandler, authenticateJwt, hasRoleMiddleware, AuthRequest } from "./middleware/auth";
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
    
    const { topic = '', gradeLevel, learnerId } = req.body;
    
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
      
      const lessonSpec = await generateLesson(gradeLevel, topic);
      
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
  app.post("/api/lessons/:lessonId/answer", hasRole(["LEARNER"]), asyncHandler(async (req: AuthRequest, res) => {
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
  
  // Error handling middleware
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "An internal server error occurred" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
