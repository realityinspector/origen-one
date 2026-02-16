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
// Define a better async handler for express with correct return type
function asyncHandler(fn) {
    return function (req, res, next) {
        return Promise
            .resolve(fn(req, res, next))
            .catch((error) => {
            console.error('Unhandled API error:', error);
            // If headers have already been sent, just forward the error
            if (res.headersSent) {
                return next(error);
            }
            // For auth endpoints, provide more specific error handling
            if (req.path.includes('/api/login') || req.path.includes('/api/register')) {
                console.error('Authentication endpoint error:', req.path, error.message);
                res.status(500).json({
                    error: 'Authentication service error',
                    message: error.message || 'An unexpected error occurred'
                });
                return;
            }
            // Forward to default error handler
            next(error);
        });
    };
}
const scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
const JWT_SECRET = process.env.JWT_SECRET || 'sunschool-secure-jwt-secret-for-development-5a5b2f8e6c7d';
const JWT_EXPIRES_IN = '7d'; // 7 days
// Password hashing and verification
async function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64));
    return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
    if (!stored || !stored.includes('.')) {
        console.error('Invalid stored password format');
        return false;
    }
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
        console.error('Invalid hash or salt');
        return false;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64));
    return (0, crypto_1.timingSafeEqual)(hashedBuf, suppliedBuf);
}
// JWT functions
function generateToken(user) {
    const payload = {
        userId: String(user.id),
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
async function authenticateJwt(req, res, next) {
    // Enhanced token extraction with logging for debugging
    // We'll check all possible locations where a token might be present
    let token;
    let tokenSource = 'none';
    // First try to get token from Authorization header (most common)
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
            tokenSource = 'auth_header';
        }
    }
    // Check for custom header (for sunschool.xyz domain)
    if (!token && req.headers['x-sunschool-auth-token']) {
        token = req.headers['x-sunschool-auth-token'];
        tokenSource = 'sunschool_header';
    }
    // If no token in headers, check for token in query string (for API calls)
    if (!token && req.query.token) {
        token = req.query.token;
        tokenSource = 'query_string';
    }
    // If still no token, check if it's in cookies
    if (!token && req.cookies && req.cookies.token) {
        token = req.cookies.token;
        tokenSource = 'cookie';
    }
    // Special handling for sunschool.xyz domain, check for token in a special cookie
    if (!token && req.cookies && req.cookies.sunschool_token) {
        token = req.cookies.sunschool_token;
        tokenSource = 'sunschool_cookie';
    }
    // Log more detailed information about the request
    const origin = req.headers.origin || req.headers.referer || 'unknown';
    const isSunschool = origin.includes('sunschool.xyz');
    // No token found in any location
    if (!token) {
        console.log(`No auth token found in request to: ${req.method} ${req.path}`);
        console.log('Headers:', JSON.stringify(req.headers));
        console.log('Request origin:', origin, isSunschool ? '(sunschool domain)' : '');
        res.status(401).json({ error: 'No authorization token provided' });
        return;
    }
    // Log token information for debugging (without exposing the token)
    console.log(`Auth token found in ${tokenSource} for request to: ${req.method} ${req.path}`);
    console.log(`Token length: ${token.length}, origin: ${origin}`);
    // For sunschool.xyz domain, add CORS headers to ensure the response works
    if (isSunschool) {
        console.log('Adding special CORS headers for sunschool.xyz domain');
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Sunschool-Auth,X-Sunschool-Auth-Token');
    }
    // Validate and process the token
    try {
        const payload = verifyToken(token);
        // Log for debugging
        console.log(`Token verified successfully for user ID: ${payload.userId}`);
        // Load user from database
        const user = await storage_1.storage.getUser(payload.userId);
        if (!user) {
            console.log(`User ${payload.userId} from token not found in database`);
            res.status(401).json({ error: 'User not found' });
            return;
        }
        // Add user to request for downstream middleware/handlers
        req.user = user;
        next();
    }
    catch (error) {
        // Check if it's a token verification error
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError ||
            error instanceof jsonwebtoken_1.default.TokenExpiredError ||
            error instanceof jsonwebtoken_1.default.NotBeforeError) {
            console.log(`Invalid token: ${error.message}`);
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }
        // For other errors
        console.error('Unexpected error during token verification:', error);
        res.status(500).json({ error: 'Authentication error', details: error.message });
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