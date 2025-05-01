import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { storage } from '../storage';

// Define a better async handler for express
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return function(req: Request, res: Response, next: NextFunction) {
    return Promise
      .resolve(fn(req, res, next))
      .catch(next);
  };
}

// Define types
export interface JwtPayload {
  userId: number;
  role: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    username: string;
    name: string;
    role: string;
    password: string;
    parentId: number | null;
    createdAt: Date;
  };
}

const scryptAsync = promisify(scrypt);
const JWT_SECRET = process.env.JWT_SECRET || 'ai-tutor-jwt-secret';
const JWT_EXPIRES_IN = '7d'; // 7 days

// Password hashing and verification
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// JWT functions
export function generateToken(user: { id: number, role: string }): string {
  const payload: JwtPayload = {
    userId: user.id,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// Middleware
export function authenticateJwt(req: AuthRequest, res: Response, next: NextFunction) {
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
    storage.getUser(payload.userId)
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
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function hasRoleMiddleware(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
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
