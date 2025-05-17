import express, { Express, Request, Response, NextFunction, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { generateLesson, checkForAchievements } from "./utils";
import { asyncHandler, authenticateJwt, hasRoleMiddleware, AuthRequest, comparePasswords, generateToken } from "./middleware/auth";
import { synchronizeToExternalDatabase } from "./sync-utils";
import { InsertDbSyncConfig } from "../shared/schema";
import { USE_AI } from "./config/flags";
import { db, pool } from "./db";
import { sql } from "drizzle-orm";
import crypto from "crypto";
import { users } from "../shared/schema";
import { getSubjectSVG, generateLessonContent, generateQuizQuestions } from "./content-generator";

// Helper function to convert ID to number (database expects integer)
function toNumber(id: string | number | null | undefined): number {
  if (id === null || id === undefined) return -1;
  if (typeof id === 'number') return id;
  const num = parseInt(id);
  return isNaN(num) ? -1 : num;
}

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
  app.post("/login", asyncHandler(async (req: Request, res: Response) => {
    console.log("Proxy: Forwarding login request to /api/login");

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
    console.log(`Generating token for user ID: ${user.id} with role: ${user.role}`);
    const token = generateToken({ id: user.id, role: user.role });
    console.log(`Using JWT_SECRET: ${process.env.JWT_SECRET?.substring(0, 3)}...${process.env.JWT_SECRET?.substring(process.env.JWT_SECRET.length - 3)}`);
    console.log(`Token generated successfully, length: ${token.length}`);

    // Return user details and token
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword
    });
  }));

  app.post("/register", (req: Request, res: Response) => {
    // Forward the request to the real API endpoint
    console.log("Proxy: Forwarding register request to /api/register");
    // Simply redirect to the API endpoint
    res.redirect(307, "/api/register");
  });

  app.post("/logout", (req: Request, res: Response) => {
    // Forward the request to the real API endpoint
    console.log("Proxy: Forwarding logout request to /api/logout");
    // Simply redirect to the API endpoint
    res.redirect(307, "/api/logout");
  });

  app.get("/user", (req: Request, res: Response) => {
    // Forward the request to the real API endpoint
    console.log("Proxy: Forwarding user request to /api/user");
    // Simply redirect to the API endpoint
    res.redirect(307, "/api/user");
  });

  // Get all parent accounts (Admin only)
  app.get("/api/parents", hasRole(["ADMIN"]), asyncHandler(async (req: AuthRequest, res) => {
    const parents = await storage.getAllParents();
    res.json(parents);
  }));

  // Get learners for a parent (Parent only)
  app.get("/api/learners", hasRole(["PARENT", "ADMIN"]), asyncHandler(async (req: AuthRequest, res) => {
    try {
      console.log('GET /api/learners request received');
      console.log('User:', req.user);
      console.log('Query params:', req.query);

      let learners;
      if (req.user?.role === "ADMIN") {
        // For admin users, if parentId is provided, get learners for that parent
        // If no parentId is provided, get all learners with role=LEARNER
        if (req.query.parentId) {
          console.log(`Admin getting learners for parent ID: ${req.query.parentId}`);
          const parentId = typeof req.query.parentId === 'string' ? req.query.parentId : String(req.query.parentId);
          learners = await storage.getUsersByParentId(parentId);
        } else {
          // When no parentId is provided for admin, return all learners
          console.log('Admin getting all learners');
          learners = await storage.getAllLearners();
        }
      } else if (req.user?.role === "PARENT") {
        console.log(`Parent ${req.user.id} getting their learners`);
        learners = await storage.getUsersByParentId(req.user.id);
      } else {
        console.log('Invalid request, user is not a parent or admin');
        return res.status(400).json({ error: "Invalid request" });
      }

      console.log(`Found ${learners.length} learners`);
      res.json(learners);
    } catch (error) {
      console.error('Error in GET /api/learners:', error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  }));

  // Create a new learner account
  app.post("/api/learners", hasRole(["PARENT", "ADMIN"]), asyncHandler(async (req: AuthRequest, res) => {
    const { name, role = "LEARNER" } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Missing required field: name" });
    }

    try {
      // Handle the required email field
      let email = req.body.email;
      
      // Generate a temporary email if one wasn't provided
      if (!email) {
        const timestamp = Date.now();
        email = `${name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}@temporary.edu`;
        console.log(`Generated temporary email for learner: ${email}`);
      } else {
        // If email was provided, validate it
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: "Invalid email format" });
        }
      }

      // Check if email already exists - first check by username
      const existingUserByUsername = await storage.getUserByUsername(email);
      if (existingUserByUsername) {
        return res.status(409).json({ error: "Email already in use as a username" });
      }

      // Also check the email field directly to prevent database constraint violations
      try {
        const emailCheckResult = await db.select().from(users).where(sql`LOWER(email) = LOWER(${email})`);
        if (emailCheckResult.length > 0) {
          return res.status(409).json({ error: "Email already in use" });
        }
      } catch (emailCheckError) {
        console.error("Error checking email existence:", emailCheckError);
        // Continue with the operation
      }

      // Set parent ID based on the user's role
      let parentId: string | null = null;

      // For PARENT users, the parent is the user themselves
      if (req.user?.role === "PARENT") {
        parentId = req.user.id;
      } 
      // For ADMIN users, check if parentId was provided in the request
      else if (req.user?.role === "ADMIN") {
        // If parentId was provided in the request body, use that
        if (req.body.parentId) {
          parentId = req.body.parentId as string;
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

      // Generate a unique username based on name and timestamp
      const timestamp = Date.now().toString().slice(-6);
      const username = `${name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;

      // Create the user object with only required fields
      const userObj: any = {
        username,
        name,
        role,
        parentId,
      };

      // Add email and password if provided (for backward compatibility)
      if (req.body.email) {
        userObj.email = req.body.email;
      }

      if (req.body.password) {
        userObj.password = req.body.password;
      }

      // Create the new user
      const newUser = await storage.createUser(userObj);

      // Create the learner profile first to avoid constraint issues
      if (newUser.role === "LEARNER") {
        try {
          // Parse grade level, default to 5 if not provided or invalid
          let gradeLevel = 5;
          if (req.body.gradeLevel !== undefined) {
            gradeLevel = typeof req.body.gradeLevel === 'string' ? 
              parseInt(req.body.gradeLevel) : req.body.gradeLevel;

            if (isNaN(gradeLevel)) {
              gradeLevel = 5;
            }
          }

          await storage.createLearnerProfile({
            id: crypto.randomUUID(),
            userId: newUser.id,
            gradeLevel,
            graph: { nodes: [], edges: [] },
          });
        } catch (profileError) {
          console.error('Error creating learner profile:', profileError);
          // Continue so we can return the user object even if profile creation fails
        }
      }

      // Return the created user without password
      const { password: _, ...userResponse } = newUser;
      res.status(201).json(userResponse);

    } catch (error) {
      console.error('Error creating new learner:', error);

      // Provide more specific error messages based on the error type
      if (error.code === '23505' && error.constraint === 'users_email_key') {
        // Duplicate email error - this means our earlier check missed it
        return res.status(409).json({ 
          error: "This email is already registered. Please use a different email address."
        });
      } else if (error.code === '23505' && error.constraint === 'users_username_key') {
        // Duplicate username error
        return res.status(409).json({ 
          error: "This username is already taken. Please choose a different username."
        });
      } else if (error.code === '23502' && error.column === 'email') {
        // Not-null constraint for email - we need to generate a temporary email
        console.log('Email not-null constraint error - creating user with generated email');

        // Create a random email for the user (temporary solution until migration is complete)
        const timestamp = Date.now();
        const randomEmail = `learner-${timestamp}@example.org`;

        try {
          // Create a new user object with the generated email
          const retryUserObj = {
            username: req.body.name.toLowerCase().replace(/\s+/g, '-') + '-' + timestamp.toString().slice(-6),
            name: req.body.name,
            role: req.body.role || "LEARNER",
            parentId: req.user?.id,
            email: randomEmail,
            password: req.body.password || "temppass" + timestamp.toString().slice(-6)
          };

          const newUser = await storage.createUser(retryUserObj);

          // Create the learner profile
          if (newUser.role === "LEARNER") {
            let gradeLevel = 5;
            if (req.body.gradeLevel !== undefined) {
              gradeLevel = typeof req.body.gradeLevel === 'string' ? 
                parseInt(req.body.gradeLevel) : req.body.gradeLevel;

              if (isNaN(gradeLevel)) {
                gradeLevel = 5;
              }
            }

            await storage.createLearnerProfile({
              id: crypto.randomUUID(),
              userId: newUser.id,
              gradeLevel,
              graph: { nodes: [], edges: [] },
            });
          }

          // Return the created user without password
          const { password: _, ...userResponse } = newUser;
          return res.status(201).json(userResponse);
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          return res.status(500).json({
            error: "Failed to create learner account. Please try again."
          });
        }
      }

      // Default error response
      res.status(500).json({ 
        error: "Failed to create learner account. Please try again."
      });
    }
  }));

  // Delete a learner account
  app.delete("/api/learners/:id", hasRole(["PARENT", "ADMIN"]), asyncHandler(async (req: AuthRequest, res) => {
    const learnerId = req.params.id;

    // Verify the learner exists
    const learner = await storage.getUser(learnerId);
    if (!learner) {
      return res.status(404).json({ error: "Learner not found" });
    }

    // Verify this is actually a learner account
    if (learner.role !== "LEARNER") {
      return res.status(400).json({ error: "Can only delete learner accounts" });
    }

    // Check authorization (parents can only delete their own learners)
    if (req.user?.role === "PARENT") {
      // Check if the learner belongs to this parent
      if (learner.parentId !== req.user.id && learner.parentId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ error: "Not authorized to delete this learner" });
      }
    }

    // Delete the learner
    const success = await storage.deleteUser(learnerId);

    if (success) {
      return res.json({ success: true, message: "Learner deleted successfully" });
    } else {
      return res.status(500).json({ error: "Failed to delete learner" });
    }
  }));

  // Get learner profile (create if needed)
  app.get("/api/learner-profile/:userId", isAuthenticated, asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.params.userId;

    // Admins can view any profile, parents can view their children, learners can view their own
    if (
      req.user?.role === "ADMIN" ||
      (req.user?.role === "PARENT" && (await storage.getUsersByParentId(req.user.id)).some(u => u.id.toString() === userId.toString())) ||
      (req.user?.id.toString() === userId.toString())
    ) {
      try {
        // Get existing profile or create a new one
        let profile = await storage.getLearnerProfile(userId);

        // If no profile exists and it's the current user, create one
        if (!profile && req.user?.id === userId) {
          console.log(`Creating learner profile for user ${userId}`);
          // Create a default profile with grade level 5 and a generated ID
          profile = await storage.createLearnerProfile({
            id: crypto.randomUUID(), // Add a UUID for the ID field
            userId: Number(userId),
            gradeLevel: 5,  // Default to grade 5
            graph: { nodes: [], edges: [] },
            subjects: ['Math', 'Reading', 'Science'],
            subjectPerformance: {},
            recommendedSubjects: [],
            strugglingAreas: []
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

  // Update learner profile (supports updating grade level and subjects)
  app.put("/api/learner-profile/:userId", hasRole(["PARENT", "ADMIN"]), asyncHandler(async (req: AuthRequest, res) => {
    const userIdParam = req.params.userId;
    // Get the user ID as a string since our schema uses string IDs
    const userId = userIdParam;

    if (!userId) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const { gradeLevel, subjects, recommendedSubjects, strugglingAreas, graph } = req.body;

    // If no valid update data was provided
    if (!gradeLevel && !subjects && !recommendedSubjects && !strugglingAreas && !graph) {
      return res.status(400).json({ error: "No valid update data provided" });
    }

    console.log(`Updating learner profile for userId: ${userId}`, {
      gradeLevel, 
      subjects: Array.isArray(subjects) ? `Array with ${subjects.length} items: ${JSON.stringify(subjects)}` : subjects,
      recommendedSubjects: Array.isArray(recommendedSubjects) ? recommendedSubjects.length : 'undefined',
      strugglingAreas: Array.isArray(strugglingAreas) ? strugglingAreas.length : 'undefined',
      graph: graph ? 'provided' : 'undefined'
    });

    // Check authorization for parents
    if (req.user?.role === "PARENT") {
      try {
        // Check if the learner belongs to this parent (using direct SQL for type safety)
        const parentQuery = `
          SELECT 1 FROM users 
          WHERE id = $1 AND parent_id = $2
        `;
        const parentResult = await pool.query(parentQuery, [userId, toNumber(req.user.id)]);

        if (parentResult.rowCount === 0) {
          return res.status(403).json({ error: "Not authorized to update this profile" });
        }
      } catch (err) {
        console.error('Error checking parent-child relationship:', err);
        return res.status(500).json({ error: "Error verifying permissions" });
      }
    }

    // Update the profile using direct SQL to avoid type issues
    try {
      // First check if profile exists
      const checkQuery = `SELECT * FROM learner_profiles WHERE user_id = $1`;
      const checkResult = await pool.query(checkQuery, [userId]);

      console.log(`Profile exists check: ${checkResult.rowCount > 0 ? 'Found profile' : 'No profile found'}`);

      // Process grade level if present
      let gradeLevelNum = undefined;
      if (gradeLevel !== undefined) {
        // Convert 'K' to 0 for Kindergarten
        if (gradeLevel === 'K') {
          gradeLevelNum = 0; // Kindergarten
        } else {
          gradeLevelNum = parseInt(gradeLevel.toString());
          if (isNaN(gradeLevelNum) || gradeLevelNum < 0 || gradeLevelNum > 12) {
            return res.status(400).json({ error: "Grade level must be between K and 12" });
          }
        }
      }

      // If profile doesn't exist, create one with default values
      if (checkResult.rowCount === 0) {
        console.log(`Creating learner profile for user ${userId} during update`);

        const newProfileId = crypto.randomUUID();
        const createQuery = `
          INSERT INTO learner_profiles (
            id, user_id, grade_level, graph, subjects, subject_performance, recommended_subjects, struggling_areas
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          ) RETURNING *
        `;

        const graphValue = graph || { nodes: [], edges: [] };
        const subjectsValue = subjects || ['Math', 'Reading', 'Science'];
        const subjectPerformanceValue = {};
        const recommendedSubjectsValue = recommendedSubjects || [];
        const strugglingAreasValue = strugglingAreas || [];

        const insertResult = await pool.query(createQuery, [
          newProfileId,
          Number(userId),
          gradeLevelNum || 5, // Default to grade 5
          JSON.stringify(graphValue),
          JSON.stringify(subjectsValue),
          JSON.stringify(subjectPerformanceValue),
          JSON.stringify(recommendedSubjectsValue),
          JSON.stringify(strugglingAreasValue)
        ]);

        if (insertResult.rowCount > 0) {
          console.log(`Successfully created new learner profile with ID: ${newProfileId}`);
          // Convert database row to expected profile format
          return res.json({
            id: insertResult.rows[0].id,
            userId: Number(userId),
            gradeLevel: insertResult.rows[0].grade_level,
            graph: typeof insertResult.rows[0].graph === 'string' ? 
              JSON.parse(insertResult.rows[0].graph) : insertResult.rows[0].graph || { nodes: [], edges: [] },
            subjects: typeof insertResult.rows[0].subjects === 'string' ? 
              JSON.parse(insertResult.rows[0].subjects) : insertResult.rows[0].subjects || ['Math', 'Reading', 'Science'],
            subjectPerformance: typeof insertResult.rows[0].subject_performance === 'string' ? 
              JSON.parse(insertResult.rows[0].subject_performance) : insertResult.rows[0].subject_performance || {},
            recommendedSubjects: typeof insertResult.rows[0].recommended_subjects === 'string' ? 
              JSON.parse(insertResult.rows[0].recommended_subjects) : insertResult.rows[0].recommended_subjects || [],
            strugglingAreas: typeof insertResult.rows[0].struggling_areas === 'string' ? 
              JSON.parse(insertResult.rows[0].struggling_areas) : insertResult.rows[0].struggling_areas || [],
            createdAt: insertResult.rows[0].created_at
          });
        } else {
          console.error('Failed to create learner profile - no rows returned');
          return res.status(500).json({ error: "Failed to create learner profile" });
        }
      }

      // If we get here, the profile exists - update it
      const existingProfile = checkResult.rows[0];
      console.log(`Found existing profile: ${existingProfile.id}`);

      try {
        // Directly perform the update with all fields at once for simplicity and safety
        const updateQuery = `
          UPDATE learner_profiles
          SET 
            grade_level = $2,
            graph = $3,
            subjects = $4,
            recommended_subjects = $5,
            struggling_areas = $6
          WHERE user_id = $1
          RETURNING *
        `;

        // Use existing values for any undefined fields
        // Process params carefully to ensure proper JSON handling
        let graphValue = existingProfile.graph;
        if (graph !== undefined) {
          // Make sure graph is properly formatted as an object first
          if (typeof graph === 'string') {
            try {
              // If it's a string, try to parse it
              graphValue = JSON.parse(graph);
            } catch (e) {
              console.error('Error parsing graph JSON:', e);
              // Use default empty graph on error
              graphValue = { nodes: [], edges: [] };
            }
          } else {
            // If it's already an object, use it directly
            graphValue = graph;
          }
        }

        // Process subjects array with proper error handling
        let subjectsValue = existingProfile.subjects;
        if (subjects !== undefined) {
          if (Array.isArray(subjects)) {
            subjectsValue = subjects;
          } else if (typeof subjects === 'string') {
            try {
              subjectsValue = JSON.parse(subjects);
              if (!Array.isArray(subjectsValue)) {
                console.error('Subjects is not an array after parsing:', subjectsValue);
                subjectsValue = ['Math', 'Reading', 'Science']; // Default
              }
            } catch (e) {
              console.error('Error parsing subjects JSON:', e);
              subjectsValue = ['Math', 'Reading', 'Science']; // Default on error
            }
          } else {
            console.error('Subjects is in an unexpected format:', typeof subjects);
            subjectsValue = ['Math', 'Reading', 'Science']; // Default
          }
        }

        // Process recommended subjects array
        let recommendedSubjectsValue = existingProfile.recommended_subjects;
        if (recommendedSubjects !== undefined) {
          if (Array.isArray(recommendedSubjects)) {
            recommendedSubjectsValue = recommendedSubjects;
          } else if (typeof recommendedSubjects === 'string') {
            try {
              recommendedSubjectsValue = JSON.parse(recommendedSubjects);
              if (!Array.isArray(recommendedSubjectsValue)) {
                console.error('recommendedSubjects is not an array after parsing');
                recommendedSubjectsValue = []; // Default
              }
            } catch (e) {
              console.error('Error parsing recommendedSubjects JSON:', e);
              recommendedSubjectsValue = []; // Default on error
            }
          } else {
            console.error('recommendedSubjects is in an unexpected format:', typeof recommendedSubjects);
            recommendedSubjectsValue = []; // Default
          }
        }

        // Process struggling areas array
        let strugglingAreasValue = existingProfile.struggling_areas;
        if (strugglingAreas !== undefined) {
          if (Array.isArray(strugglingAreas)) {
            strugglingAreasValue = strugglingAreas;
          } else if (typeof strugglingAreas === 'string') {
            try {
              strugglingAreasValue = JSON.parse(strugglingAreas);
              if (!Array.isArray(strugglingAreasValue)) {
                console.error('strugglingAreas is not an array after parsing');
                strugglingAreasValue = []; // Default
              }
            } catch (e) {
              console.error('Error parsing strugglingAreas JSON:', e);
              strugglingAreasValue = []; // Default on error
            }
          } else {
            console.error('strugglingAreas is in an unexpected format:', typeof strugglingAreas);
            strugglingAreasValue = []; // Default
          }
        }

        const updateParams = [
          Number(userId),
          gradeLevelNum !== undefined ? gradeLevelNum : existingProfile.grade_level,
          JSON.stringify(graphValue),
          JSON.stringify(subjectsValue),
          JSON.stringify(recommendedSubjectsValue),
          JSON.stringify(strugglingAreasValue)
        ];

        console.log('Executing update query with parameters:', updateParams);
        // Log the actual subjects value being sent to the database
        console.log('Subjects being saved to database:', JSON.stringify(subjectsValue));

        const updateResult = await pool.query(updateQuery, updateParams);

        if (updateResult.rowCount > 0) {
          console.log('Learner profile updated successfully');

          // Log the subjects value returned from the database after update
          let returnedSubjects;
          try {
            returnedSubjects = typeof updateResult.rows[0].subjects === 'string' ? 
              JSON.parse(updateResult.rows[0].subjects) : updateResult.rows[0].subjects;
            console.log('Subjects returned from database after update:', JSON.stringify(returnedSubjects));
          } catch (e) {
            console.error('Error parsing returned subjects:', e);
          }

          // Convert database row to expected profile format
          const profile = updateResult.rows[0];
          return res.json({
            id: profile.id,
            userId: Number(userId),
            gradeLevel: profile.grade_level,
            graph: typeof profile.graph === 'string' ? 
              JSON.parse(profile.graph) : profile.graph || { nodes: [], edges: [] },
            subjects: typeof profile.subjects === 'string' ? 
              JSON.parse(profile.subjects) : profile.subjects || ['Math', 'Reading', 'Science'],
            subjectPerformance: typeof profile.subject_performance === 'string' ? 
              JSON.parse(profile.subject_performance) : profile.subject_performance || {},
            recommendedSubjects: typeof profile.recommended_subjects === 'string' ? 
              JSON.parse(profile.recommended_subjects) : profile.recommended_subjects || [],
            strugglingAreas: typeof profile.struggling_areas === 'string' ? 
              JSON.parse(profile.struggling_areas) : profile.struggling_areas || [],
            createdAt: profile.created_at
          });
        } else {
          console.error('Failed to update learner profile - no rows affected');
          return res.status(500).json({ error: "Failed to update learner profile" });
        }
      } catch (updateError) {
        console.error('Error during profile update:', updateError);
        return res.status(500).json({ error: "Error updating profile: " + updateError.message });
      }
    } catch (error) {
      console.error('Error updating learner profile:', error);
      return res.status(500).json({ error: "Failed to update learner profile: " + error.message });
    }
  }));

  // Create custom lesson from subject dashboard
  app.post("/api/lessons/create", isAuthenticated, asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { subject, category, difficulty, gradeLevel } = req.body;

    if (!subject || !category) {
      return res.status(400).json({ error: "Subject and category are required" });
    }

    try {
      // Get the learner profile
      const learnerProfile = await storage.getLearnerProfile(req.user.id);
      if (!learnerProfile) {
        return res.status(404).json({ error: "Learner profile not found" });
      }

      // Create SVG image based on subject and category
      const svgImageData = getSubjectSVG(subject, category);
      const sampleImage = {
        id: crypto.randomUUID(),
        description: `Educational illustration of ${category} in ${subject}`,
        alt: `${category} educational illustration`,
        svgData: svgImageData,
        promptUsed: `Create an educational illustration about ${category} in ${subject}`
      };

      // Generate content appropriate for the grade level
      const userGradeLevel = gradeLevel || learnerProfile.gradeLevel || 5;
      const lessonContent = generateLessonContent(subject, category, userGradeLevel);
      const quizQuestions = generateQuizQuestions(subject, category, userGradeLevel);

      // Create lesson specification
      const lessonSpec = {
        title: `${category} in ${subject}`,
        content: lessonContent,
        questions: quizQuestions,
        images: [sampleImage]
      };

      // Create a new lesson
      const newLesson = await storage.createLesson({
        id: crypto.randomUUID(),
        learnerId: Number(req.user.id),
        moduleId: `custom-${Date.now()}`,
        status: "ACTIVE",
        subject,
        category,
        difficulty: difficulty || "beginner",
        spec: lessonSpec,
        imagePaths: [{
          path: `/images/subjects/${subject.toLowerCase()}.svg`,
          alt: `${category} educational image`,
          description: `An illustration related to ${category}`
        }]
      });

      // Return the created lesson
      res.json(newLesson);

    } catch (error) {
      console.error("Error creating custom lesson:", error);
      res.status(500).json({ error: "Failed to create lesson" });
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

    const { 
      topic = '', 
      gradeLevel, 
      learnerId, 
      enhanced = true,
      subject = '',
      category = '',
      difficulty = 'beginner'
    } = req.body;

    if (!gradeLevel || !learnerId) {
      return res.status(400).json({ error: "Missing required fields: gradeLevel, learnerId" });
    }

    // Validate user permissions
    const targetLearnerId = learnerId as string;

    // Self-create for learners
    if (req.user.role === "LEARNER" && req.user.id !== targetLearnerId) {
      return res.status(403).json({ error: "Learners can only create lessons for themselves" });
    }

    // Parents can only create for their children
    if (req.user.role === "PARENT") {
      const children = await storage.getUsersByParentId(req.user.id);
      if (!children.some(child => child.id.toString() === targetLearnerId.toString())) {
        return res.status(403).json({ error: "Parent can only create lessons for their children" });
      }
    }

    try {
      // Get learner profile
      const learnerProfile = await storage.getLearnerProfile(targetLearnerId);
      if (!learnerProfile) {
        return res.status(404).json({ error: "Learner profile not found" });
      }

      // Determine the subject if not provided
      let finalSubject = subject;
      if (!finalSubject && learnerProfile.subjects && learnerProfile.subjects.length > 0) {
        // Use a subject from the learner's profile
        finalSubject = learnerProfile.subjects[Math.floor(Math.random() * learnerProfile.subjects.length)];
      }

      // Get subject category if not provided
      let finalCategory = category;
      if (!finalCategory && finalSubject) {
        // Import on demand to avoid circular dependencies
        const { getSubjectCategory } = await import('./services/subject-recommendation');
        finalCategory = getSubjectCategory(finalSubject);
      }

      console.log(`Generating lesson for "${topic}" (Grade ${gradeLevel}), Subject: ${finalSubject}, Category: ${finalCategory}`);

      let lessonSpec;
      let imagePaths = [];

      if (USE_AI && enhanced) {
        try {
          // Import on demand to avoid circular dependencies
          const { generateEnhancedLesson } = await import('./services/enhanced-lesson-service');

          // Generate enhanced lesson with images
          const enhancedSpec = await generateEnhancedLesson(
            gradeLevel, 
            topic, 
            true, // always with images
            finalSubject,
            difficulty as 'beginner' | 'intermediate' | 'advanced'
          );

          if (enhancedSpec) {
            // Extract image paths from the enhanced spec for storage
            if (enhancedSpec.images) {
              imagePaths = enhancedSpec.images
                .filter(img => img.path)
                .map(img => ({
                  path: img.path,
                  alt: img.alt || img.description,
                  description: img.description
                }));
            }

            // Create a regular spec from the enhanced one for backward compatibility
            lessonSpec = {
              title: enhancedSpec.title,
              content: `# ${enhancedSpec.title}\n\n${enhancedSpec.summary}\n\n${enhancedSpec.sections.map(s => 
                `## ${s.title}\n\n${s.content}`).join('\n\n')}`,
              questions: enhancedSpec.questions,
              graph: enhancedSpec.graph
            };

            // Create the lesson with enhanced spec
            const newLesson = await storage.createLesson({
              id: crypto.randomUUID(),
              learnerId: Number(targetLearnerId),
              moduleId: `custom-${Date.now()}`,
              status: "ACTIVE",
              subject: finalSubject,
              category: finalCategory,
              difficulty,
              spec: lessonSpec,
              enhancedSpec,
              imagePaths
            });

            return res.json(newLesson);
          }
        } catch (enhancedError) {
          console.error('Error creating enhanced lesson:', enhancedError);
          // Fall back to basic lesson if enhanced fails
        }
      }

      // Fallback to basic lesson if enhanced fails or is disabled
      console.log("AI enhanced lesson generation unavailable, using basic lesson");

      // Create a simple lesson without enhanced spec
      lessonSpec = {
        title: topic || `${finalSubject || 'Sample'} Lesson`,
        content: `# ${topic || finalSubject || 'Sample'} Lesson\n\nThis is a lesson about ${topic || finalSubject || 'a sample topic'}.`,
        questions: [{
          text: `What is this lesson about?`,
          options: [
            `${topic || finalSubject || 'A sample topic'}`,
            "Something else",
            "I don't know",
            "None of the above"
          ],
          correctIndex: 0,
          explanation: "This lesson is designed to teach you about the selected topic."
        }]
      };

      // Create the lesson with basic spec
      const newLesson = await storage.createLesson({
        id: crypto.randomUUID(),
        learnerId: Number(targetLearnerId),
        moduleId: `custom-${Date.now()}`,
        status: "ACTIVE",
        subject: finalSubject,
        category: finalCategory,
        difficulty,
        spec: lessonSpec,
        imagePaths
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
      req.user.id.toString() === lesson.learnerId.toString() ||
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

    let learnerId: string;

    if (req.user.role === "LEARNER") {
      learnerId = req.user.id;
    } else if (req.query.learnerId) {
      learnerId = req.query.learnerId as string;

      // Check if user is authorized to view this learner's lessons
      if (req.user.role === "PARENT") {
        const children = await storage.getUsersByParentId(req.user.id);
        if (!children.some(child => child.id.toString() === learnerId.toString())) {
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

    if (lesson.learnerId.toString() !== req.user.id.toString()) {
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
        learnerId: req.user.id.toString(),
        type: achievement.type,
        payload: achievement.payload
      });
    }

    // Generate a new lesson
    try {
      const learnerProfile = await storage.getLearnerProfile(req.user.id);
      if (learnerProfile) {
        // Create a varied lesson even when AI is disabled
        let lessonSpec;
        let subject, category, difficulty;

        // Get subjects from learner profile or use default subjects
        const subjects = learnerProfile.subjects || ['Math', 'Science', 'History', 'Literature', 'Geography'];
        const categories = {
          'Math': ['Algebra', 'Geometry', 'Statistics', 'Fractions', 'Decimals'],
          'Science': ['Biology', 'Chemistry', 'Physics', 'Astronomy', 'Ecology'],
          'History': ['Ancient Civilizations', 'World War II', 'American History', 'Renaissance', 'Industrial Revolution'],
          'Literature': ['Poetry', 'Fiction', 'Shakespeare', 'Mythology', 'Drama'],
          'Geography': ['Continents', 'Countries', 'Climate', 'Landforms', 'Oceans']
        };

        // Select a random subject from the learner's preferred subjects
        subject = subjects[Math.floor(Math.random() * subjects.length)];

        // Select a random category from the chosen subject
        const subjectCategories = categories[subject] || categories['Math'];
        category = subjectCategories[Math.floor(Math.random() * subjectCategories.length)];

        // Randomly choose difficulty
        const difficulties = ['beginner', 'intermediate', 'advanced'];
        difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

        // Check for previously completed lessons to avoid repetition
        const previousLessons = await storage.getLearnerLessons(req.user.id);
        const recentSubjects = previousLessons
          .slice(0, 3)
          .map(lesson => lesson.subject)
          .filter(Boolean);

        // Choose a different subject if possible
        if (recentSubjects.includes(subject) && subjects.length > 1) {
          const newSubjects = subjects.filter(s => !recentSubjects.includes(s));
          if (newSubjects.length > 0) {
            subject = newSubjects[Math.floor(Math.random() * newSubjects.length)];
            const newCategories = categories[subject] || categories['Math'];
            category = newCategories[Math.floor(Math.random() * newCategories.length)];
          }
        }

        if (USE_AI) {
          lessonSpec = await generateLesson(learnerProfile.gradeLevel);
        } else {
          // Generate varied lessons when AI is disabled
          console.log(`Generating varied lesson on ${subject}: ${category}`);

          // Create detailed, educational SVG images based on the subject
          const svgImageData = getSubjectSVG(subject, category);
          const sampleImage = {
            id: crypto.randomUUID(),
            description: `Educational illustration of ${category} in ${subject}`,
            alt: `${category} educational illustration`,
            svgData: svgImageData,
            promptUsed: `Create an educational illustration about ${category} in ${subject}`
          };

          // Create rich, educational content appropriate for the grade level
          const lessonContent = generateLessonContent(subject, category, learnerProfile.gradeLevel);

          // Generate age-appropriate quiz questions for the specific grade level
          const quizQuestions = generateQuizQuestions(subject, category, learnerProfile.gradeLevel);

          // Create the full lesson specification with rich content
          lessonSpec = {
            title: `${category} in ${subject}`,
            content: lessonContent,
            questions: quizQuestions,
            images: [sampleImage]
          };
        }

        // Create the new lesson with UUID and varied content
        await storage.createLesson({
          id: crypto.randomUUID(),
          learnerId: Number(req.user.id),
          moduleId: `generated-${Date.now()}`,
          status: "ACTIVE",
          subject,
          category,
          difficulty,
          spec: lessonSpec,
          imagePaths: [{
            path: `/images/subjects/${subject.toLowerCase()}.svg`,
            alt: `${category} educational image`,
            description: `An illustration related to ${category}`
          }]
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

    let learnerId: string;

    if (req.user.role === "LEARNER") {
      learnerId = req.user.id;
    } else if (req.query.learnerId) {
      learnerId = req.query.learnerId as string;

      // Check if user is authorized to view this learner's achievements
      if (req.user.role === "PARENT") {
        const children = await storage.getUsersByParentId(req.user.id);
        if (!children.some(child => child.id.toString() === learnerId.toString())) {
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

    const learnerId = req.query.learnerId as string;

    // Verify parent has access to this learner
    if (req.user.role === "PARENT") {
      const children = await storage.getUsersByParentId(req.user.id);
      if (!children.some(child => child.id.toString() === learnerId.toString())) {
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