import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "../shared/schema";

// Define a better async handler for express
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return function(req: Request, res: Response, next: NextFunction) {
    return Promise
      .resolve(fn(req, res, next))
      .catch(next);
  };
}

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "ai-tutor-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

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

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  }));

  app.post("/api/login", asyncHandler(async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          return reject(err);
        }
        if (!user) {
          res.status(401).json({ error: info?.message || "Authentication failed" });
          return resolve(undefined);
        }
        req.login(user, (loginErr) => {
          if (loginErr) {
            return reject(loginErr);
          }
          res.status(200).json(user);
          return resolve(undefined);
        });
      })(req, res, next);
    });
  }));

  app.post("/api/logout", asyncHandler(async (req, res, next) => {
    return new Promise((resolve, reject) => {
      req.logout((err) => {
        if (err) return reject(err);
        res.sendStatus(200);
        resolve(undefined);
      });
    });
  }));

  app.get("/api/user", asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  }));
}
