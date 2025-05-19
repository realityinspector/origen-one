"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
exports.setupAuth = setupAuth;
const storage_1 = require("./storage");
const schema_1 = require("../shared/schema");
const auth_1 = require("./middleware/auth");
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const passport_1 = __importDefault(require("passport"));
/**
 * Sets up authentication routes (JWT auth only for now)
 */
async function setupAuth(app) {
    app.set("trust proxy", 1);
    app.use(passport_1.default.initialize());
    // Endpoint to check server and database health
    app.get("/api/healthcheck", (0, auth_1.asyncHandler)(async (req, res) => {
        try {
            // Count users for basic DB query test
            const result = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.users);
            const userCount = result[0]?.count || 0;
            return res.json({
                status: "ok",
                db: "connected",
                userCount
            });
        }
        catch (error) {
            console.error("Health check error:", error);
            return res.status(500).json({
                status: "error",
                message: "Database connection failed",
                error: error.message
            });
        }
    }));
    // Regular JWT login endpoint
    app.post("/api/login", (0, auth_1.asyncHandler)(async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ error: "Username and password are required" });
            }
            // Find user by username
            const user = await storage_1.storage.getUserByUsername(username);
            if (!user) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
            // Verify password
            const isPasswordValid = user.password ? await (0, auth_1.comparePasswords)(password, user.password) : false;
            if (!isPasswordValid) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
            // Generate JWT token
            const token = (0, auth_1.generateToken)({ id: user.id, role: user.role });
            // Return user details and token
            const { password: _, ...userWithoutPassword } = user;
            res.json({
                token,
                user: userWithoutPassword
            });
        }
        catch (error) {
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
    app.get("/api/user", auth_1.authenticateJwt, (0, auth_1.asyncHandler)(async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            // We're not retrieving the user from database here since it's already in req.user
            // But we're removing the password field for security
            const { password: _, ...userWithoutPassword } = req.user;
            res.json(userWithoutPassword);
        }
        catch (error) {
            console.error('Error retrieving user info:', error);
            res.status(500).json({ error: 'Failed to retrieve user info' });
        }
    }));
}
// Temporary authentication middleware, simplified
const isAuthenticated = async (req, res, next) => {
    // Just use JWT auth
    return (0, auth_1.authenticateJwt)(req, res, next);
};
exports.isAuthenticated = isAuthenticated;
//# sourceMappingURL=auth.js.map