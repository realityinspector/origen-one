"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const http_1 = require("http");
const auth_1 = require("./auth");
const storage_1 = require("./storage");
const utils_1 = require("./utils");
const auth_2 = require("./middleware/auth");
const sync_utils_1 = require("./sync-utils");
const flags_1 = require("./config/flags");
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const schema_1 = require("../shared/schema");
const content_generator_1 = require("./content-generator");
// Helper function to ensure consistent string IDs for cross-domain compatibility
function ensureString(value) {
    if (value === null || value === undefined)
        return "";
    return String(value);
}
// Authentication middleware
function isAuthenticated(req, res, next) {
    (0, auth_2.authenticateJwt)(req, res, next);
}
// Import services
Promise.resolve().then(() => __importStar(require('./services/subject-recommendation')));
Promise.resolve().then(() => __importStar(require('./services/enhanced-lesson-service')));
function hasRole(roles) {
    return (req, res, next) => {
        // First authenticate the user
        (0, auth_2.authenticateJwt)(req, res, (err) => {
            if (err)
                return next(err);
            // Then check the role
            (0, auth_2.hasRoleMiddleware)(roles)(req, res, next);
        });
    };
}
function registerRoutes(app) {
    // Set up authentication routes
    (0, auth_1.setupAuth)(app);
    // Health check endpoint
    app.get("/api/healthcheck", (req, res) => {
        res.json({ status: "ok", message: "Server is running" });
    });
    // Root-level registration handler
    app.post("/register", (0, auth_2.asyncHandler)(async (req, res) => {
        console.log("=================== REGISTRATION START ===================");
        console.log("Registration request details:", {
            url: req.url,
            method: req.method,
            headers: req.headers,
            contentType: req.headers['content-type'],
            acceptHeader: req.headers['accept']
        });
        // Log request body without password
        const { password: _, ...safeBody } = req.body;
        console.log("Request body:", safeBody);
        // Ensure proper headers
        res.setHeader('Content-Type', 'application/json');
        console.log("Response headers set:", res.getHeaders());
        const { username, email, name, role, password, parentId } = req.body;
        if (!username || !email || !name || !role || !password) {
            res.status(400).json({ error: "Missing required fields" });
        }
        // Verify role is valid
        if (!["ADMIN", "PARENT", "LEARNER"].includes(role)) {
            res.status(400).json({ error: "Invalid role" });
        }
        try {
            console.log("Starting user registration process for:", username);
            // Check if username already exists
            console.log("Checking if username exists:", username);
            const existingUser = await storage_1.storage.getUserByUsername(username);
            if (existingUser) {
                console.log("Username already exists:", username);
                res.status(400).json({ error: "Username already exists" });
            }
            console.log("Username is available");
            // Check if this is the first user being registered
            const userCountResult = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.users);
            const isFirstUser = userCountResult[0].count === 0;
            // If this is the first user, make them an admin regardless of the requested role
            const effectiveRole = isFirstUser ? "ADMIN" : role;
            // Hash password and create user
            const hashedPassword = await (0, auth_2.hashPassword)(password);
            const user = await storage_1.storage.createUser({
                username,
                email,
                name,
                role: effectiveRole,
                password: hashedPassword,
                parentId: parentId || null
            });
            // Generate JWT token
            const token = (0, auth_2.generateToken)({ id: user.id, role: user.role });
            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;
            // Ensure proper JSON response
            const response = {
                token,
                user: userWithoutPassword
            };
            // Log response before sending
            console.log("Sending registration response:", {
                status: 200,
                contentType: 'application/json',
                responseLength: JSON.stringify(response).length
            });
            console.log("Preparing successful registration response:", {
                status: 200,
                responseData: { ...response, token: 'REDACTED' }
            });
            res.status(200)
                .json(response);
            console.log("=================== REGISTRATION SUCCESS ===================");
        }
        catch (error) {
            console.error('Registration error:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code
            });
            console.log("=================== REGISTRATION FAILED ===================");
            res.status(500).json({ error: "Registration failed", details: error.message });
        }
    }));
    // Special API route to handle the root-level login/register/user for production deployment
    app.post("/login", (0, auth_2.asyncHandler)(async (req, res) => {
        console.log("Proxy: Forwarding login request to /api/login");
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ error: "Username and password are required" });
        }
        // Find user by username
        const user = await storage_1.storage.getUserByUsername(username);
        if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
        }
        // Verify password
        const isPasswordValid = user.password ? await (0, auth_2.comparePasswords)(password, user.password) : false;
        if (!isPasswordValid) {
            res.status(401).json({ error: "Invalid credentials" });
        }
        // Generate JWT token
        console.log(`Generating token for user ID: ${user.id} with role: ${user.role}`);
        const token = (0, auth_2.generateToken)({ id: user.id, role: user.role });
        console.log(`Using JWT_SECRET: ${process.env.JWT_SECRET?.substring(0, 3)}...${process.env.JWT_SECRET?.substring(process.env.JWT_SECRET.length - 3)}`);
        console.log(`Token generated successfully, length: ${token.length}`);
        // Return user details and token
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            token,
            user: userWithoutPassword
        });
    }));
    app.post("/logout", (req, res) => {
        // Forward the request to the real API endpoint
        console.log("Proxy: Forwarding logout request to /api/logout");
        // Simply redirect to the API endpoint
        res.redirect(307, "/api/logout");
    });
    app.get("/user", (req, res) => {
        // Forward the request to the real API endpoint
        console.log("Proxy: Forwarding user request to /api/user");
        // Simply redirect to the API endpoint
        res.redirect(307, "/api/user");
    });
    // Get all parent accounts (Admin only)
    app.get("/api/parents", hasRole(["ADMIN"]), (0, auth_2.asyncHandler)(async (req, res) => {
        const parents = await storage_1.storage.getAllParents();
        res.json(parents);
    }));
    // Get learners for a parent (Parent only)
    app.get("/api/learners", hasRole(["PARENT", "ADMIN"]), (0, auth_2.asyncHandler)(async (req, res) => {
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
                    learners = await storage_1.storage.getUsersByParentId(parentId);
                }
                else {
                    // When no parentId is provided for admin, return all learners
                    console.log('Admin getting all learners');
                    learners = await storage_1.storage.getAllLearners();
                }
            }
            else if (req.user?.role === "PARENT") {
                console.log(`Parent ${req.user.id} getting their learners`);
                learners = await storage_1.storage.getUsersByParentId(req.user.id);
            }
            else {
                console.log('Invalid request, user is not a parent or admin');
                res.status(400).json({ error: "Invalid request" });
            }
            console.log(`Found ${learners.length} learners`);
            res.json(learners);
        }
        catch (error) {
            console.error('Error in GET /api/learners:', error);
            res.status(500).json({ error: "Internal server error", details: error.message });
        }
    }));
    // Create a new learner account
    app.post("/api/learners", hasRole(["PARENT", "ADMIN"]), (0, auth_2.asyncHandler)(async (req, res) => {
        const { name, role = "LEARNER" } = req.body;
        if (!name) {
            res.status(400).json({ error: "Missing required field: name" });
        }
        try {
            // Email is optional for learners
            let email = req.body.email;
            // If email is provided, validate it
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    res.status(400).json({ error: "Invalid email format" });
                }
                // Check if email already exists - first check by username
                const existingUserByUsername = await storage_1.storage.getUserByUsername(email);
                if (existingUserByUsername) {
                    res.status(409).json({ error: "Email already in use as a username" });
                }
                // Also check the email field directly to prevent database constraint violations
                try {
                    const emailCheckResult = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.sql) `LOWER(email) = LOWER(${email})`);
                    if (emailCheckResult.length > 0) {
                        res.status(409).json({ error: "Email already in use" });
                    }
                }
                catch (emailCheckError) {
                    console.error("Error checking email existence:", emailCheckError);
                    // Continue with the operation
                }
            }
            else {
                console.log("No email provided for learner - this is allowed");
            }
            // Set parent ID based on the user's role
            let parentId = null;
            // For PARENT users, the parent is the user themselves
            if (req.user?.role === "PARENT") {
                parentId = ensureString(req.user.id);
            }
            // For ADMIN users, check if parentId was provided in the request
            else if (req.user?.role === "ADMIN") {
                // If parentId was provided in the request body, use that
                if (req.body.parentId) {
                    parentId = req.body.parentId;
                }
                // If creating a LEARNER as an ADMIN but no parentId specified,
                // use the admin as the parent (this is our fallback solution)
                else if (role === "LEARNER") {
                    parentId = ensureString(req.user.id);
                    console.log(`Admin creating learner without parentId specified. Using admin (${req.user.id}) as parent.`);
                }
            }
            // For any other scenario where a LEARNER is being created without a parent
            else if (role === "LEARNER" && !parentId) {
                // Learners must have a parent
                res.status(400).json({ error: "Learner accounts must have a parent" });
            }
            // Generate a unique username based on name and timestamp
            const timestamp = Date.now().toString().slice(-6);
            const username = `${name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
            // Create the user object with only required fields
            const userObj = {
                username,
                name,
                role,
                parentId,
            };
            // Add email if provided, but only for backward compatibility
            if (req.body.email) {
                userObj.email = req.body.email;
            }
            // Only add password for parent accounts, not for learners
            if (role !== "LEARNER" && req.body.password) {
                userObj.password = req.body.password;
            }
            else if (role === "LEARNER") {
                // For learners, password is not needed
                console.log('Creating learner without password - passwords only required for parent accounts');
            }
            // Create the new user
            const newUser = await storage_1.storage.createUser(userObj);
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
                    await storage_1.storage.createLearnerProfile({
                        id: crypto_1.default.randomUUID(),
                        userId: newUser.id.toString(),
                        gradeLevel,
                        graph: { nodes: [], edges: [] },
                    });
                }
                catch (profileError) {
                    console.error('Error creating learner profile:', profileError);
                    // Continue so we can return the user object even if profile creation fails
                }
            }
            // Return the created user without password
            const { password: _, ...userResponse } = newUser;
            res.status(201).json(userResponse);
        }
        catch (error) {
            console.error('Error creating new learner:', error);
            // Provide more specific error messages based on the error type
            if (error.code === '23505' && error.constraint === 'users_email_key') {
                // Duplicate email error - this means our earlier check missed it
                res.status(409).json({
                    error: "This email is already registered. Please use a different email address."
                });
            }
            else if (error.code === '23505' && error.constraint === 'users_username_key') {
                // Duplicate username error
                res.status(409).json({
                    error: "This username is already taken. Please choose a different username."
                });
            }
            else if (error.code === '23502' && error.column === 'email') {
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
                    const newUser = await storage_1.storage.createUser(retryUserObj);
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
                        await storage_1.storage.createLearnerProfile({
                            id: crypto_1.default.randomUUID(),
                            userId: newUser.id.toString(),
                            gradeLevel,
                            graph: { nodes: [], edges: [] },
                        });
                    }
                    // Return the created user without password
                    const { password: _, ...userResponse } = newUser;
                    res.status(201).json(userResponse);
                }
                catch (retryError) {
                    console.error('Retry failed:', retryError);
                    res.status(500).json({
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
    app.delete("/api/learners/:id", hasRole(["PARENT", "ADMIN"]), (0, auth_2.asyncHandler)(async (req, res) => {
        const learnerId = req.params.id;
        // Verify the learner exists
        const learner = await storage_1.storage.getUser(learnerId);
        if (!learner) {
            res.status(404).json({ error: "Learner not found" });
        }
        // Verify this is actually a learner account
        if (learner.role !== "LEARNER") {
            res.status(400).json({ error: "Can only delete learner accounts" });
        }
        // Check authorization (parents can only delete their own learners)
        if (req.user?.role === "PARENT") {
            // Check if the learner belongs to this parent
            if (learner.parentId !== req.user.id && learner.parentId.toString() !== ensureString(req.user.id)) {
                res.status(403).json({ error: "Not authorized to delete this learner" });
            }
        }
        // Delete the learner
        const success = await storage_1.storage.deleteUser(learnerId);
        if (success) {
            res.json({ success: true, message: "Learner deleted successfully" });
        }
        else {
            res.status(500).json({ error: "Failed to delete learner" });
        }
    }));
    // Get learner profile (create if needed)
    app.get("/api/learner-profile/:userId", isAuthenticated, (0, auth_2.asyncHandler)(async (req, res) => {
        const userIdParam = req.params.userId;
        // Convert userIdParam to number since database expects integer
        const userId = parseInt(userIdParam, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID format - must be a number" });
        }
        // Admins can view any profile, parents can view their children, learners can view their own
        if (req.user?.role === "ADMIN" ||
            (req.user?.role === "PARENT" && (await storage_1.storage.getUsersByParentId(req.user.id)).some(u => u.id.toString() === userId.toString())) ||
            (req.user?.id.toString() === userId.toString())) {
            try {
                // Get existing profile or create a new one
                let profile = await storage_1.storage.getLearnerProfile(userId);
                // If no profile exists, create one - but we need to check first if the user exists
                if (!profile) {
                    // Get the user to verify they exist
                    const user = await storage_1.storage.getUser(userId.toString());
                    if (!user) {
                        return res.status(404).json({ error: "User not found" });
                    }
                    console.log(`Creating learner profile for user ${userId} with role ${user.role}`);
                    // Create a default profile with grade level 5 and a generated ID
                    profile = await storage_1.storage.createLearnerProfile({
                        id: crypto_1.default.randomUUID(), // Add a UUID for the ID field
                        userId: userId.toString(), // Convert number to string
                        gradeLevel: 5, // Default to grade 5
                        graph: { nodes: [], edges: [] },
                        subjects: ['Math', 'Reading', 'Science'],
                        subjectPerformance: {},
                        recommendedSubjects: [],
                        strugglingAreas: []
                    });
                    if (!profile) {
                        return res.status(500).json({ error: "Failed to create learner profile" });
                    }
                }
                return res.json(profile);
            }
            catch (error) {
                console.error('Error getting or creating learner profile:', error);
                return res.status(500).json({ error: "Failed to get or create learner profile" });
            }
        }
        return res.status(403).json({ error: "Forbidden" });
    }));
    // Update learner profile (supports updating grade level and subjects)
    app.put("/api/learner-profile/:userId", hasRole(["PARENT", "ADMIN"]), (0, auth_2.asyncHandler)(async (req, res) => {
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
                const parentResult = await db_1.pool.query(parentQuery, [userId, parseInt(ensureString(req.user.id))]);
                if (parentResult.rowCount === 0) {
                    return res.status(403).json({ error: "Not authorized to update this profile" });
                }
            }
            catch (err) {
                console.error('Error checking parent-child relationship:', err);
                return res.status(500).json({ error: "Error verifying permissions" });
            }
        }
        // Update the profile using direct SQL to avoid type issues
        try {
            // First check if profile exists
            const checkQuery = `SELECT * FROM learner_profiles WHERE user_id = $1`;
            const checkResult = await db_1.pool.query(checkQuery, [userId]);
            console.log(`Profile exists check: ${checkResult.rowCount > 0 ? 'Found profile' : 'No profile found'}`);
            // Process grade level if present
            let gradeLevelNum = undefined;
            if (gradeLevel !== undefined) {
                // Convert 'K' to 0 for Kindergarten
                if (gradeLevel === 'K') {
                    gradeLevelNum = 0; // Kindergarten
                }
                else {
                    gradeLevelNum = parseInt(gradeLevel.toString());
                    if (isNaN(gradeLevelNum) || gradeLevelNum < 0 || gradeLevelNum > 12) {
                        return res.status(400).json({ error: "Grade level must be between K and 12" });
                    }
                }
            }
            // If profile doesn't exist, create one with default values
            if (checkResult.rowCount === 0) {
                console.log(`Creating learner profile for user ${userId} during update`);
                const newProfileId = crypto_1.default.randomUUID();
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
                const insertResult = await db_1.pool.query(createQuery, [
                    newProfileId,
                    userId,
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
                        userId: userId,
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
                }
                else {
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
                        }
                        catch (e) {
                            console.error('Error parsing graph JSON:', e);
                            // Use default empty graph on error
                            graphValue = { nodes: [], edges: [] };
                        }
                    }
                    else {
                        // If it's already an object, use it directly
                        graphValue = graph;
                    }
                }
                // Process subjects array with proper error handling
                let subjectsValue = existingProfile.subjects;
                if (subjects !== undefined) {
                    if (Array.isArray(subjects)) {
                        subjectsValue = subjects;
                    }
                    else if (typeof subjects === 'string') {
                        try {
                            subjectsValue = JSON.parse(subjects);
                            if (!Array.isArray(subjectsValue)) {
                                console.error('Subjects is not an array after parsing:', subjectsValue);
                                subjectsValue = ['Math', 'Reading', 'Science']; // Default
                            }
                        }
                        catch (e) {
                            console.error('Error parsing subjects JSON:', e);
                            subjectsValue = ['Math', 'Reading', 'Science']; // Default on error
                        }
                    }
                    else {
                        console.error('Subjects is in an unexpected format:', typeof subjects);
                        subjectsValue = ['Math', 'Reading', 'Science']; // Default
                    }
                }
                // Process recommended subjects array
                let recommendedSubjectsValue = existingProfile.recommended_subjects;
                if (recommendedSubjects !== undefined) {
                    if (Array.isArray(recommendedSubjects)) {
                        recommendedSubjectsValue = recommendedSubjects;
                    }
                    else if (typeof recommendedSubjects === 'string') {
                        try {
                            recommendedSubjectsValue = JSON.parse(recommendedSubjects);
                            if (!Array.isArray(recommendedSubjectsValue)) {
                                console.error('recommendedSubjects is not an array after parsing');
                                recommendedSubjectsValue = []; // Default
                            }
                        }
                        catch (e) {
                            console.error('Error parsing recommendedSubjects JSON:', e);
                            recommendedSubjectsValue = []; // Default on error
                        }
                    }
                    else {
                        console.error('recommendedSubjects is in an unexpected format:', typeof recommendedSubjects);
                        recommendedSubjectsValue = []; // Default
                    }
                }
                // Process struggling areas array
                let strugglingAreasValue = existingProfile.struggling_areas;
                if (strugglingAreas !== undefined) {
                    if (Array.isArray(strugglingAreas)) {
                        strugglingAreasValue = strugglingAreas;
                    }
                    else if (typeof strugglingAreas === 'string') {
                        try {
                            strugglingAreasValue = JSON.parse(strugglingAreas);
                            if (!Array.isArray(strugglingAreasValue)) {
                                console.error('strugglingAreas is not an array after parsing');
                                strugglingAreasValue = []; // Default
                            }
                        }
                        catch (e) {
                            console.error('Error parsing strugglingAreas JSON:', e);
                            strugglingAreasValue = []; // Default on error
                        }
                    }
                    else {
                        console.error('strugglingAreas is in an unexpected format:', typeof strugglingAreas);
                        strugglingAreasValue = []; // Default
                    }
                }
                const updateParams = [
                    userId,
                    gradeLevelNum !== undefined ? gradeLevelNum : existingProfile.grade_level,
                    JSON.stringify(graphValue),
                    JSON.stringify(subjectsValue),
                    JSON.stringify(recommendedSubjectsValue),
                    JSON.stringify(strugglingAreasValue)
                ];
                console.log('Executing update query with parameters:', updateParams);
                // Log the actual subjects value being sent to the database
                console.log('Subjects being saved to database:', JSON.stringify(subjectsValue));
                const updateResult = await db_1.pool.query(updateQuery, updateParams);
                if (updateResult.rowCount > 0) {
                    console.log('Learner profile updated successfully');
                    // Log the subjects value returned from the database after update
                    let returnedSubjects;
                    try {
                        returnedSubjects = typeof updateResult.rows[0].subjects === 'string' ?
                            JSON.parse(updateResult.rows[0].subjects) : updateResult.rows[0].subjects;
                        console.log('Subjects returned from database after update:', JSON.stringify(returnedSubjects));
                    }
                    catch (e) {
                        console.error('Error parsing returned subjects:', e);
                    }
                    // Convert database row to expected profile format
                    const profile = updateResult.rows[0];
                    return res.json({
                        id: profile.id,
                        userId: userId,
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
                }
                else {
                    console.error('Failed to update learner profile - no rows affected');
                    return res.status(500).json({ error: "Failed to update learner profile" });
                }
            }
            catch (updateError) {
                console.error('Error during profile update:', updateError);
                return res.status(500).json({ error: "Error updating profile: " + updateError.message });
            }
        }
        catch (error) {
            console.error('Error updating learner profile:', error);
            return res.status(500).json({ error: "Failed to update learner profile: " + error.message });
        }
    }));
    // Create custom lesson from subject dashboard
    app.post("/api/lessons/create", isAuthenticated, (0, auth_2.asyncHandler)(async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { subject, category, difficulty, gradeLevel } = req.body;
        if (!subject || !category) {
            return res.status(400).json({ error: "Subject and category are required" });
        }
        try {
            // Get the learner profile
            const learnerProfile = await storage_1.storage.getLearnerProfile(req.user.id);
            if (!learnerProfile) {
                return res.status(404).json({ error: "Learner profile not found" });
            }
            // Create SVG image based on subject and category
            const svgImageData = (0, content_generator_1.getSubjectSVG)(subject, category);
            const sampleImage = {
                id: crypto_1.default.randomUUID(),
                description: "Educational illustration of " + category + " in " + subject,
                alt: category + " educational illustration",
                promptUsed: "Create an educational illustration about " + category + " in " + subject
            };
            // Generate content appropriate for the grade level
            const userGradeLevel = gradeLevel || learnerProfile.gradeLevel || 5;
            const lessonContent = (0, content_generator_1.generateLessonContent)(subject, category, userGradeLevel);
            const quizQuestions = (0, content_generator_1.generateQuizQuestions)(subject, category, userGradeLevel);
            // Create lesson specification
            const lessonSpec = {
                title: `${category} in ${subject}`,
                content: lessonContent,
                questions: quizQuestions,
                images: [sampleImage]
            };
            // Create a new lesson
            const newLesson = await storage_1.storage.createLesson({
                id: crypto_1.default.randomUUID(),
                learnerId: Number(req.user.id),
                moduleId: "custom-" + Date.now(),
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
            return res.json(newLesson);
        }
        catch (error) {
            console.error("Error creating custom lesson:", error);
            return res.status(500).json({ error: "Failed to create lesson" });
        }
    }));
    // Get active lesson for learner
    app.get("/api/lessons/active", isAuthenticated, (0, auth_2.asyncHandler)(async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        try {
            // Allow any user to fetch active lesson in learner mode
            let activeLesson = await storage_1.storage.getActiveLesson(req.user.id);
            // Just return the active lesson if found without auto-generating
            if (activeLesson) {
                return res.json(activeLesson);
            }
            // If no active lesson, don't auto-generate (handle on frontend)
            return res.json(null);
        }
        catch (error) {
            console.error('Error fetching active lesson:', error);
            return res.status(500).json({ error: "Failed to fetch active lesson" });
        }
    }));
    // Create a custom lesson for a learner
    app.post("/api/lessons/create", isAuthenticated, (0, auth_2.asyncHandler)(async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { topic = '', gradeLevel, learnerId, enhanced = true, subject = '', category = '', difficulty = 'beginner' } = req.body;
        if (!gradeLevel || !learnerId) {
            return res.status(400).json({ error: "Missing required fields: gradeLevel, learnerId" });
        }
        // Validate user permissions
        const targetLearnerId = learnerId;
        // Self-create for learners
        if (req.user.role === "LEARNER" && req.user.id !== targetLearnerId) {
            return res.status(403).json({ error: "Learners can only create lessons for themselves" });
        }
        // Parents can only create for their children
        if (req.user.role === "PARENT") {
            const children = await storage_1.storage.getUsersByParentId(req.user.id);
            if (!children.some(child => child.id.toString() === targetLearnerId.toString())) {
                return res.status(403).json({ error: "Parent can only create lessons for their children" });
            }
        }
        try {
            // Get learner profile
            const learnerProfile = await storage_1.storage.getLearnerProfile(targetLearnerId);
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
                const { getSubjectCategory } = await Promise.resolve().then(() => __importStar(require('./services/subject-recommendation')));
                finalCategory = getSubjectCategory(finalSubject);
            }
            console.log("Generating varied lesson on " + subject + ": " + category);
            let lessonSpec;
            let imagePaths = [];
            if (flags_1.USE_AI && enhanced) {
                try {
                    // Import on demand to avoid circular dependencies
                    const { generateEnhancedLesson } = await Promise.resolve().then(() => __importStar(require('./services/enhanced-lesson-service')));
                    // Generate enhanced lesson with images
                    const enhancedSpec = await generateEnhancedLesson(gradeLevel, topic, true, // always with images
                    finalSubject, difficulty);
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
                            content: `# ${enhancedSpec.title}\n\n${enhancedSpec.summary}\n\n${enhancedSpec.sections.map(s => `#,# ${s.title}\n\n${s.content}`).join('\n\n')}`,
                            questions: enhancedSpec.questions,
                            graph: enhancedSpec.graph
                        };
                        // Create the lesson with enhanced spec
                        const newLesson = await storage_1.storage.createLesson({
                            id: crypto_1.default.randomUUID(),
                            learnerId: Number(targetLearnerId),
                            moduleId: "custom-" + Date.now(),
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
                }
                catch (enhancedError) {
                    console.error('Error creating enhanced lesson:', enhancedError);
                    // Fall back to basic lesson if enhanced fails
                }
            }
            // Fallback to basic lesson if enhanced fails or is disabled
            console.log("AI enhanced lesson generation unavailable, using basic lesson");
            // Create a simple lesson without enhanced spec
            lessonSpec = {
                title: topic || `${finalSubject || 'Sample'} Lesson`,
                content: `# ${topic || finalSubject || 'Sample'} Lesson\n\nThis is a lesson about ${topic || finalSubject || 'a sample topic'}`,
                questions: [{
                        text: "What is this lesson about?",
                        options: [
                            topic || finalSubject || 'A sample topic',
                            "Something else",
                            "I don't know",
                            "None of the above"
                        ],
                        correctIndex: 0,
                        explanation: "This lesson is designed to teach you about the selected topic."
                    }]
            };
            // Create the lesson with basic spec
            const newLesson = await storage_1.storage.createLesson({
                id: crypto_1.default.randomUUID(),
                learnerId: Number(targetLearnerId),
                moduleId: "custom-" + Date.now(),
                status: "ACTIVE",
                subject: finalSubject,
                category: finalCategory,
                difficulty,
                spec: lessonSpec,
                imagePaths
            });
            return res.json(newLesson);
        }
        catch (error) {
            console.error('Error creating custom lesson:', error);
            return res.status(500).json({ error: "Failed to generate lesson content" });
        }
    }));
    // Get a specific lesson by ID
    app.get("/api/lessons/:lessonId", isAuthenticated, (0, auth_2.asyncHandler)(async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const lessonId = req.params.lessonId;
        const lesson = await storage_1.storage.getLessonById(lessonId);
        if (!lesson) {
            return res.status(404).json({ error: "Lesson not found" });
        }
        // Check user's permission to access this lesson
        if (req.user.role === "ADMIN" ||
            ensureString(req.user.id) === lesson.learnerId.toString() ||
            (req.user.role === "PARENT" && (await storage_1.storage.getUsersByParentId(req.user.id)).some(u => u.id === lesson.learnerId))) {
            return res.json(lesson);
        }
        return res.status(403).json({ error: "Forbidden" });
    }));
    // Get lesson history
    app.get("/api/lessons", isAuthenticated, (0, auth_2.asyncHandler)(async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        let learnerId;
        if (req.user.role === "LEARNER") {
            learnerId = ensureString(req.user.id);
        }
        else if (req.query.learnerId) {
            learnerId = req.query.learnerId;
            // Check if user is authorized to view this learner's lessons
            if (req.user.role === "PARENT") {
                const children = await storage_1.storage.getUsersByParentId(req.user.id);
                if (!children.some(child => child.id.toString() === learnerId.toString())) {
                    return res.status(403).json({ error: "Forbidden" });
                }
            }
        }
        else {
            return res.status(400).json({ error: "learnerId is required" });
        }
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const lessons = await storage_1.storage.getLessonHistory(learnerId, limit);
        res.json(lessons);
    }));
    // Submit answer to a quiz question
    app.post("/api/lessons/:lessonId/answer", isAuthenticated, (0, auth_2.asyncHandler)(async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const lessonId = req.params.lessonId;
        const { answers } = req.body;
        if (!Array.isArray(answers)) {
            return res.status(400).json({ error: "Answers must be an array" });
        }
        const lesson = await storage_1.storage.getLessonById(lessonId);
        if (!lesson) {
            return res.status(404).json({ error: "Lesson not found" });
        }
        if (lesson.learnerId.toString() !== ensureString(req.user.id)) {
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
        const updatedLesson = await storage_1.storage.updateLessonStatus(lessonId, "DONE", score);
        // Check for achievements
        const lessonHistory = await storage_1.storage.getLessonHistory(req.user.id);
        const newAchievements = (0, utils_1.checkForAchievements)(lessonHistory, updatedLesson);
        // Award any new achievements
        for (const achievement of newAchievements) {
            await storage_1.storage.createAchievement({
                learnerId: ensureString(req.user.id),
                type: achievement.type,
                payload: achievement.payload
            });
        }
        // Generate a new lesson
        try {
            const learnerProfile = await storage_1.storage.getLearnerProfile(req.user.id);
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
                const previousLessons = await storage_1.storage.getLearnerLessons(req.user.id);
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
                if (flags_1.USE_AI) {
                    lessonSpec = await (0, utils_1.generateLesson)(learnerProfile.gradeLevel);
                }
                else {
                    // Generate varied lessons when AI is disabled
                    console.log("Generating varied lesson on " + subject + ": " + category);
                    // Create detailed, educational SVG images based on the subject
                    const svgImageData = (0, content_generator_1.getSubjectSVG)(subject, category);
                    const sampleImage = {
                        id: crypto_1.default.randomUUID(),
                        description: "Educational illustration of " + category + " in " + subject,
                        alt: category + " educational illustration",
                        promptUsed: "Create an educational illustration about " + category + " in " + subject
                    };
                    // Create rich, educational content appropriate for the grade level
                    const lessonContent = (0, content_generator_1.generateLessonContent)(subject, category, learnerProfile.gradeLevel);
                    // Generate age-appropriate quiz questions for the specific grade level
                    const quizQuestions = (0, content_generator_1.generateQuizQuestions)(subject, category, learnerProfile.gradeLevel);
                    // Create the full lesson specification with rich content
                    lessonSpec = {
                        title: `${category} in ${subject}`,
                        content: lessonContent,
                        questions: quizQuestions,
                        images: [sampleImage]
                    };
                }
                // Create the new lesson with UUID and varied content
                await storage_1.storage.createLesson({
                    id: crypto_1.default.randomUUID(),
                    learnerId: Number(req.user.id),
                    moduleId: "generated-" + Date.now(),
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
        }
        catch (error) {
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
    app.get("/api/achievements", isAuthenticated, (0, auth_2.asyncHandler)(async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        let learnerId;
        if (req.user.role === "LEARNER") {
            learnerId = ensureString(req.user.id);
        }
        else if (req.query.learnerId) {
            learnerId = req.query.learnerId;
            // Check if user is authorized to view this learner's achievements
            if (req.user.role === "PARENT") {
                const children = await storage_1.storage.getUsersByParentId(req.user.id);
                if (!children.some(child => child.id.toString() === learnerId.toString())) {
                    return res.status(403).json({ error: "Forbidden" });
                }
            }
        }
        else {
            return res.status(400).json({ error: "learnerId is required" });
        }
        const achievements = await storage_1.storage.getAchievements(learnerId);
        res.json(achievements);
    }));
    // Get reports data
    app.get("/api/reports", isAuthenticated, (0, auth_2.asyncHandler)(async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!req.query.learnerId) {
            return res.status(400).json({ error: "learnerId is required" });
        }
        const learnerId = req.query.learnerId;
        const reportType = req.query.type || 'all';
        // Check if user is authorized to view this learner's reports
        if (req.user.role !== 'ADMIN' && ensureString(req.user.id) !== learnerId.toString()) {
            if (req.user.role === "PARENT") {
                const children = await storage_1.storage.getUsersByParentId(req.user.id);
                if (!children.some(child => child.id.toString() === learnerId.toString())) {
                    return res.status(403).json({ error: "Forbidden" });
                }
            }
            else {
                return res.status(403).json({ error: "Forbidden" });
            }
        }
        // Get the learner data based on report type
        try {
            if (reportType === 'progress' || reportType === 'all') {
                const [learner, profile, lessons, achievements] = await Promise.all([
                    storage_1.storage.getUser(learnerId),
                    storage_1.storage.getLearnerProfile(learnerId),
                    storage_1.storage.getLessonHistory(learnerId),
                    storage_1.storage.getAchievements(learnerId)
                ]);
                if (!learner) {
                    return res.status(404).json({ error: "Learner not found" });
                }
                // Remove sensitive information
                const { password: _, ...learnerData } = learner;
                // Calculate statistics
                const completedLessons = lessons.filter(lesson => lesson.status === 'DONE').length;
                const activeLessons = lessons.filter(lesson => lesson.status === 'ACTIVE').length;
                const queuedLessons = lessons.filter(lesson => lesson.status === 'QUEUED').length;
                // Calculate subject performance if available
                let subjectPerformance = profile?.subjectPerformance || {};
                // Calculate additional analytics
                const analytics = {
                    lessonsCompleted: completedLessons,
                    lessonsActive: activeLessons,
                    lessonsQueued: queuedLessons,
                    totalLessons: lessons.length,
                    achievementsCount: achievements.length,
                    conceptsLearned: profile?.graph?.nodes?.length || 0,
                    progressRate: lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0,
                    subjectDistribution: {}
                };
                // Calculate subject distribution
                lessons.forEach(lesson => {
                    if (lesson.subject) {
                        analytics.subjectDistribution[lesson.subject] =
                            (analytics.subjectDistribution[lesson.subject] || 0) + 1;
                    }
                });
                res.json({
                    learner: learnerData,
                    profile,
                    analytics,
                    subjectPerformance,
                    reportGeneratedAt: new Date().toISOString()
                });
            }
            else if (reportType === 'lessons') {
                const lessons = await storage_1.storage.getLessonHistory(learnerId);
                res.json({
                    lessons,
                    reportGeneratedAt: new Date().toISOString()
                });
            }
            else if (reportType === 'achievements') {
                const achievements = await storage_1.storage.getAchievements(learnerId);
                res.json({
                    achievements,
                    reportGeneratedAt: new Date().toISOString()
                });
            }
            else {
                return res.status(400).json({ error: "Invalid report type" });
            }
        }
        catch (error) {
            console.error("Error generating report:", error);
            res.status(500).json({ error: "Failed to generate report" });
        }
    }));
    // Export learner data (for data portability)
    app.get("/api/export", hasRole(["PARENT", "ADMIN"]), (0, auth_2.asyncHandler)(async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!req.query.learnerId) {
            return res.status(400).json({ error: "learnerId is required" });
        }
        const learnerId = req.query.learnerId;
        // Verify parent has access to this learner
        if (req.user.role === "PARENT") {
            const children = await storage_1.storage.getUsersByParentId(req.user.id);
            if (!children.some(child => child.id.toString() === learnerId.toString())) {
                return res.status(403).json({ error: "Forbidden" });
            }
        }
        // Get all the learner data
        const [learner, profile, lessons, achievements] = await Promise.all([
            storage_1.storage.getUser(learnerId),
            storage_1.storage.getLearnerProfile(learnerId),
            storage_1.storage.getLessonHistory(learnerId, 1000), // Get a large number of lessons
            storage_1.storage.getAchievements(learnerId)
        ]);
        if (!learner) {
            res.status(404).json({ error: "Learner not found" });
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
    app.get("/api/sync-configs", hasRole(["PARENT"]), (0, auth_2.asyncHandler)(async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        try {
            const syncConfigs = await storage_1.storage.getSyncConfigsByParentId(ensureString(req.user.id));
            res.json(syncConfigs);
        }
        catch (error) {
            console.error('Error getting sync configurations:', error);
            res.status(500).json({ error: "Failed to retrieve synchronization configurations" });
        }
    }));
    // Get a specific sync configuration
    app.get("/api/sync-configs/:id", hasRole(["PARENT"]), (0, auth_2.asyncHandler)(async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        try {
            const syncConfig = await storage_1.storage.getSyncConfigById(req.params.id);
            if (!syncConfig) {
                return res.status(404).json({ error: "Sync configuration not found" });
            }
            // Check if the sync config belongs to the requesting parent
            if (syncConfig.parentId !== ensureString(req.user.id)) {
                return res.status(403).json({ error: "Forbidden" });
            }
            res.json(syncConfig);
        }
        catch (error) {
            console.error('Error getting sync configuration:', error);
            res.status(500).json({ error: "Failed to retrieve synchronization configuration" });
        }
    }));
    // Create a new sync configuration
    app.post("/api/sync-configs", hasRole(["PARENT"]), (0, auth_2.asyncHandler)(async (req, res) => {
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
            const syncConfig = await storage_1.storage.createSyncConfig({
                parentId: ensureString(req.user.id),
                targetDbUrl,
                continuousSync,
                syncStatus: "IDLE"
            });
            res.status(201).json(syncConfig);
        }
        catch (error) {
            console.error('Error creating sync configuration:', error);
            res.status(500).json({ error: "Failed to create synchronization configuration" });
        }
    }));
    // Update a sync configuration
    app.put("/api/sync-configs/:id", hasRole(["PARENT"]), (0, auth_2.asyncHandler)(async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const { targetDbUrl, continuousSync } = req.body;
        const updateData = {};
        if (targetDbUrl !== undefined) {
            // Validate PostgreSQL connection string format
            const postgresRegex = /^postgresql:\/\/\w+:.*@[\w.-]+:\d+\/\w+(\?.*)?$/;
            if (!postgresRegex.test(targetDbUrl)) {
                res.status(400).json({
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
            const syncConfig = await storage_1.storage.getSyncConfigById(req.params.id);
            if (!syncConfig) {
                return res.status(404).json({ error: "Sync configuration not found" });
            }
            if (syncConfig.parentId !== ensureString(req.user.id)) {
                return res.status(403).json({ error: "Forbidden" });
            }
            // Update the sync config
            const updatedConfig = await storage_1.storage.updateSyncConfig(req.params.id, updateData);
            res.json(updatedConfig);
        }
        catch (error) {
            console.error('Error updating sync configuration:', error);
            res.status(500).json({ error: "Failed to update synchronization configuration" });
        }
    }));
    // Delete a sync configuration
    app.delete("/api/sync-configs/:id", hasRole(["PARENT"]), (0, auth_2.asyncHandler)(async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        try {
            // Check if the sync config exists and belongs to the requesting parent
            const syncConfig = await storage_1.storage.getSyncConfigById(req.params.id);
            if (!syncConfig) {
                return res.status(404).json({ error: "Sync configuration not found" });
            }
            if (syncConfig.parentId !== ensureString(req.user.id)) {
                return res.status(403).json({ error: "Forbidden" });
            }
            // Delete the sync config
            const deleted = await storage_1.storage.deleteSyncConfig(req.params.id);
            if (deleted) {
                res.status(204).end();
            }
            else {
                res.status(500).json({ error: "Failed to delete synchronization configuration" });
            }
        }
        catch (error) {
            console.error('Error deleting sync configuration:', error);
            res.status(500).json({ error: "Failed to delete synchronization configuration" });
        }
    }));
    // Initiate a one-time sync (push)
    app.post("/api/sync-configs/:id/push", hasRole(["PARENT"]), (0, auth_2.asyncHandler)(async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        try {
            // Check if the sync config exists and belongs to the requesting parent
            const syncConfig = await storage_1.storage.getSyncConfigById(req.params.id);
            if (!syncConfig) {
                return res.status(404).json({ error: "Sync configuration not found" });
            }
            if (syncConfig.parentId !== ensureString(req.user.id)) {
                return res.status(403).json({ error: "Forbidden" });
            }
            // Update status to IN_PROGRESS
            await storage_1.storage.updateSyncStatus(req.params.id, "IN_PROGRESS");
            // Start the synchronization process (handled by a separate function)
            // Note: synchronizeToExternalDatabase now handles its own status updates
            (0, sync_utils_1.synchronizeToExternalDatabase)(ensureString(req.user.id), syncConfig)
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
        }
        catch (error) {
            console.error('Error initiating synchronization:', error);
            res.status(500).json({ error: "Failed to initiate synchronization" });
        }
    }));
    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err);
        res.status(500).json({ error: "An internal server error occurred" });
    });
    const httpServer = (0, http_1.createServer)(app);
    return httpServer;
}
// Applying template literal fixes in routes.ts
//# sourceMappingURL=routes.js.map