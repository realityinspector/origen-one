"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAuth = setupAuth;
const storage_1 = require("./storage");
const auth_1 = require("./middleware/auth");
const db_1 = require("./db");
const schema_1 = require("../shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * Sets up JWT authentication routes
 */
function setupAuth(app) {
    app.set("trust proxy", 1);
    // Register a new user
    app.post("/api/register", (0, auth_1.asyncHandler)(async (req, res, next) => {
        const { username, email, name, role, password, parentId } = req.body;
        if (!username || !email || !name || !role || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // Verify role is valid
        if (!["ADMIN", "PARENT", "LEARNER"].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }
        // Check if username already exists
        const existingUser = await storage_1.storage.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }
        // Check if this is the first user being registered
        const userCountResult = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.users);
        const isFirstUser = userCountResult[0].count === 0;
        // If this is the first user, make them an admin regardless of the requested role
        const effectiveRole = isFirstUser ? "ADMIN" : role;
        if (isFirstUser) {
            console.log(`First user registration detected. Setting ${username} as ADMIN.`);
        }
        // Create the user
        const user = await storage_1.storage.createUser({
            username,
            email,
            name,
            role: effectiveRole, // Use admin role if first user
            password: await (0, auth_1.hashPassword)(password),
            parentId: parentId || null,
        });
        // If role is LEARNER, create a learner profile
        if (effectiveRole === "LEARNER" && req.body.gradeLevel) {
            await storage_1.storage.createLearnerProfile({
                userId: user.id,
                gradeLevel: req.body.gradeLevel,
                graph: { nodes: [], edges: [] },
            });
        }
        // Generate JWT token
        const token = (0, auth_1.generateToken)(user);
        // Return the token and user data (excluding password)
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({
            token,
            user: userWithoutPassword,
            wasPromotedToAdmin: isFirstUser && role !== "ADMIN" // Flag to notify frontend if role was changed
        });
    }));
    // Login and return a JWT token
    app.post("/api/login", (0, auth_1.asyncHandler)(async (req, res) => {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }
        // Find the user
        const user = await storage_1.storage.getUserByUsername(username);
        if (!user || !(await (0, auth_1.comparePasswords)(password, user.password))) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        // Generate JWT token
        const token = (0, auth_1.generateToken)(user);
        // Return the token and user data (excluding password)
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({
            token,
            user: userWithoutPassword
        });
    }));
    // Get current user info
    app.get("/api/user", auth_1.authenticateJwt, (0, auth_1.asyncHandler)(async (req, res) => {
        const { password: _, ...userWithoutPassword } = req.user;
        res.json(userWithoutPassword);
    }));
}
//# sourceMappingURL=auth.js.map