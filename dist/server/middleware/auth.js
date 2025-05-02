"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = asyncHandler;
exports.hashPassword = hashPassword;
exports.comparePasswords = comparePasswords;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.authenticateJwt = authenticateJwt;
exports.hasRoleMiddleware = hasRoleMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const util_1 = require("util");
const storage_1 = require("../storage");
// Define a better async handler for express
function asyncHandler(fn) {
    return function (req, res, next) {
        return Promise
            .resolve(fn(req, res, next))
            .catch(next);
    };
}
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
const JWT_SECRET = process.env.JWT_SECRET || 'origen-ai-tutor-jwt-secret';
const JWT_EXPIRES_IN = '7d'; // 7 days
// Password hashing and verification
async function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64));
    return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64));
    return (0, crypto_1.timingSafeEqual)(hashedBuf, suppliedBuf);
}
// JWT functions
function generateToken(user) {
    const payload = {
        userId: user.id,
        role: user.role
    };
    // Log for debugging token generation
    console.log('Generating token for user ID:', user.id, 'with role:', user.role);
    console.log('Using JWT_SECRET:', JWT_SECRET.substring(0, 3) + '...' + JWT_SECRET.substring(JWT_SECRET.length - 3));
    try {
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        console.log('Token generated successfully, length:', token.length);
        return token;
    }
    catch (error) {
        console.error('Failed to generate token:', error);
        throw error;
    }
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
// Middleware
function authenticateJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ error: 'No authorization token provided' });
        return;
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        res.status(401).json({ error: 'Token format invalid' });
        return;
    }
    const token = parts[1];
    try {
        const payload = verifyToken(token);
        // Load user from database
        storage_1.storage.getUser(payload.userId)
            .then(user => {
            if (!user) {
                res.status(401).json({ error: 'User not found' });
                return;
            }
            req.user = user;
            next();
        })
            .catch(error => {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
    }
    catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
function hasRoleMiddleware(roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map