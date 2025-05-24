import { Express, Response, NextFunction } from "express";
/**
 * Sets up authentication routes (JWT auth only for now)
 */
export declare function setupAuth(app: Express): Promise<void>;
export declare const isAuthenticated: (req: any, res: Response, next: NextFunction) => Promise<void>;
