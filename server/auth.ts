import { Express, Request, Response, NextFunction, RequestHandler } from "express";
import { storage } from "./storage";
import { User } from "../shared/schema";
import { asyncHandler, hashPassword, comparePasswords, generateToken, authenticateJwt, hasRoleMiddleware, AuthRequest } from "./middleware/auth";
import { db, checkDatabaseConnection, withRetry, pool } from "./db";
import { users } from "../shared/schema";
import { count } from "drizzle-orm";

// Replit Auth imports
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";

// Environment configs
const SESSION_SECRET = process.env.SESSION_SECRET || "origen-secure-session-dev-5a5b2f8e6c7d";
const ISSUER_URL = process.env.ISSUER_URL ?? "https://replit.com/oidc";

// Memoized function to get OpenID config
const getOidcConfig = memoize(
  async () => {
    if (!process.env.REPLIT_DOMAINS) {
      throw new Error("Environment variable REPLIT_DOMAINS not provided");
    }
    
    return await client.discovery(
      new URL(ISSUER_URL),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 } // Cache for 1 hour
);

// Session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

// Update user session with claims and tokens
function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

// Upsert user from Replit claims
async function upsertUser(claims: any) {
  return await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

/**
 * Sets up authentication routes (JWT and Replit Auth)
 */
export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  
  // Use session for Replit Auth
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Endpoint to check server and database health
  app.get("/api/healthcheck", asyncHandler(async (req, res) => {
    try {
      // Check database connection
      const isConnected = await checkDatabaseConnection();
      
      if (isConnected) {
        return res.status(200).json({ 
          status: "ok", 
          message: "Server is healthy and database is connected" 
        });
      } else {
        return res.status(503).json({ 
          status: "database_error", 
          message: "Server is running but database connection failed" 
        });
      }
    } catch (error) {
      console.error("Health check error:", error);
      return res.status(500).json({ 
        status: "error", 
        message: "Error checking server health" 
      });
    }
  }));

  // Configure Replit Auth
  try {
    const config = await getOidcConfig();

    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      try {
        const user = {};
        updateUserSession(user, tokens);
        await upsertUser(tokens.claims());
        verified(null, user);
      } catch (error) {
        console.error("Error in verify function:", error);
        verified(error as Error);
      }
    };

    if (process.env.REPLIT_DOMAINS) {
      // Set up strategies for each domain
      for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
        const strategy = new Strategy(
          {
            name: `replitauth:${domain}`,
            config,
            scope: "openid email profile offline_access",
            callbackURL: `https://${domain}/api/callback`,
          },
          verify,
        );
        passport.use(strategy);
      }
    }

    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    // Replit Auth Routes
    app.get("/api/login", (req, res, next) => {
      const hostname = req.hostname;
      // If REPLIT_DOMAINS is set, use Replit Auth
      if (process.env.REPLIT_DOMAINS) {
        passport.authenticate(`replitauth:${hostname}`, {
          prompt: "login consent",
          scope: ["openid", "email", "profile", "offline_access"],
        })(req, res, next);
      } else {
        // Fallback to the traditional login form
        res.redirect('/auth');
      }
    });

    app.get("/api/callback", (req, res, next) => {
      const hostname = req.hostname;
      if (process.env.REPLIT_DOMAINS) {
        passport.authenticate(`replitauth:${hostname}`, {
          successReturnToOrRedirect: "/",
          failureRedirect: "/api/login",
        })(req, res, next);
      } else {
        res.redirect('/auth');
      }
    });

    app.get("/api/logout", (req, res) => {
      if (process.env.REPLIT_DOMAINS && req.isAuthenticated()) {
        req.logout(() => {
          res.redirect(
            client.buildEndSessionUrl(config, {
              client_id: process.env.REPL_ID!,
              post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
            }).href
          );
        });
      } else {
        // Clear any session data
        if (req.session) {
          req.session.destroy((err) => {
            if (err) {
              console.error("Error destroying session:", err);
            }
            res.redirect('/auth');
          });
        } else {
          res.redirect('/auth');
        }
      }
    });

    // Get current user info - both JWT and Replit Auth
    app.get("/api/auth/user", asyncHandler(async (req: any, res) => {
      try {
        // For Replit Auth users
        if (req.isAuthenticated() && req.user?.claims?.sub) {
          // Refresh token if needed
          const now = Math.floor(Date.now() / 1000);
          if (req.user.expires_at && now > req.user.expires_at) {
            const refreshToken = req.user.refresh_token;
            if (!refreshToken) {
              return res.status(401).json({ error: "Session expired" });
            }

            try {
              const config = await getOidcConfig();
              const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
              updateUserSession(req.user, tokenResponse);
            } catch (error) {
              console.error("Token refresh error:", error);
              return res.status(401).json({ error: "Authentication expired" });
            }
          }

          // Get the user from the database
          const userId = req.user.claims.sub;
          const user = await storage.getUser(userId);
          
          if (user) {
            return res.json(user);
          } else {
            // Try to create user if not found but we have claims
            try {
              const newUser = await upsertUser(req.user.claims);
              return res.json(newUser);
            } catch (err) {
              console.error("Error creating user from claims:", err);
              return res.status(401).json({ error: "User not found" });
            }
          }
        } 
        // For JWT auth users (legacy)
        else {
          // Get auth header
          const authHeader = req.headers.authorization;
          if (!authHeader) {
            return res.status(401).json({ error: "No authentication found" });
          }

          const parts = authHeader.split(' ');
          if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ error: "Invalid authentication format" });
          }

          const token = parts[1];
          
          try {
            // Use the JWT middleware to verify
            req.headers.authorization = `Bearer ${token}`;
            return authenticateJwt(req as AuthRequest, res, () => {
              if (!req.user) {
                return res.status(401).json({ error: "Invalid token" });
              }
              
              const { password: _, ...userWithoutPassword } = req.user;
              return res.json(userWithoutPassword);
            });
          } catch (error) {
            console.error("JWT verification error:", error);
            return res.status(401).json({ error: "Invalid token" });
          }
        }
      } catch (error) {
        console.error('Error retrieving user info:', error);
        res.status(500).json({ error: 'Failed to retrieve user info' });
      }
    }));

  } catch (error) {
    console.error("Error setting up authentication:", error);
  }

  // Legacy authentication endpoints
  // Register a new user
  app.post("/api/register", asyncHandler(async (req, res) => {
    try {
      // Check database connection first
      const isConnected = await checkDatabaseConnection();
      if (!isConnected) {
        return res.status(503).json({
          error: "Database connection error. Please try again in a moment.",
          isTransient: true
        });
      }

      const { username, email, name, role, password, parentId } = req.body;
      
      if (!username || !email || !name || !role || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Check if username already exists
      const existingUser = await withRetry(() => storage.getUserByUsername(username));
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Check if this is the first user being registered
      const userCountResult = await withRetry(() => db.select({ count: count() }).from(users));
      const isFirstUser = userCountResult[0].count === 0;
      
      // Verify role is valid and prevent ADMIN registration (unless it's the first user)
      if (role === "ADMIN" && !isFirstUser) {
        return res.status(403).json({ 
          error: "Admin registration is not allowed. Contact an existing admin for access." 
        });
      }
      
      if (!["ADMIN", "PARENT", "LEARNER"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      
      // If this is the first user, make them an admin regardless of the requested role
      const effectiveRole = isFirstUser ? "ADMIN" : role;
      
      if (isFirstUser) {
        console.log(`First user registration detected. Setting ${username} as ADMIN.`);
      }
      
      // Create the user
      const hashedPassword = await hashPassword(password);
      const user = await withRetry(() => storage.createUser({
        id: `legacy-${Date.now()}`, // Generate a unique ID for legacy users
        username,
        email,
        name,
        role: effectiveRole, // Use admin role if first user
        password: hashedPassword,
        parentId: parentId || null,
      }));

      // If role is LEARNER, create a learner profile
      if (effectiveRole === "LEARNER" && req.body.gradeLevel) {
        await withRetry(() => storage.createLearnerProfile({
          userId: user.id,
          gradeLevel: req.body.gradeLevel,
          graph: { nodes: [], edges: [] },
        }));
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
      
      // Use Express's built-in json method which handles Content-Type automatically
      res.status(201).json(responseObj);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  }));

  // Login and return a JWT token (legacy)
  app.post("/api/login", asyncHandler(async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      // Check database connection first
      const isConnected = await checkDatabaseConnection();
      if (!isConnected) {
        console.error('Database connection error during login attempt');
        return res.status(503).json({ 
          error: "Database connection error. Please try again in a moment.",
          isTransient: true
        });
      }
      
      // Find the user
      const user = await withRetry(() => storage.getUserByUsername(username));
      
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
      
      // Use Express's built-in json method which handles Content-Type automatically
      res.status(200).json(responseObj);
    } catch (error) {
      console.error('Authentication endpoint error:', error);
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      console.error(`Authentication endpoint error: ${errorMessage}`);
      
      res.status(500).json({ 
        error: 'An error occurred during authentication. Please try again.',
        isTransient: true
      });
    }
  }));

  // Get current user info (legacy JWT)
  app.get("/api/user", authenticateJwt, asyncHandler(async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // We're not retrieving the user from database here since it's already in req.user
      // But we're removing the password field for security
      const { password: _, ...userWithoutPassword } = req.user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error retrieving user info:', error);
      res.status(500).json({ error: 'Failed to retrieve user info' });
    }
  }));
}

// Middleware to check authentication - works with both JWT and Replit Auth
export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  // First check Replit Auth
  if (req.isAuthenticated() && req.user?.claims?.sub) {
    // Check if the session is expired
    const now = Math.floor(Date.now() / 1000);
    if (req.user.expires_at && now <= req.user.expires_at) {
      return next(); // Session is still valid
    }

    // Try to refresh the token
    const refreshToken = req.user.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized - Session expired" });
    }

    try {
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      updateUserSession(req.user, tokenResponse);
      return next();
    } catch (error) {
      console.error("Token refresh failed:", error);
      return res.status(401).json({ message: "Unauthorized - Token refresh failed" });
    }
  } 
  // Then try JWT
  else {
    // Use the existing JWT middleware
    return authenticateJwt(req, res, next);
  }
};
