import { Request, Response, NextFunction } from 'express';
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export interface JwtPayload {
    userId: string;
    role: string;
}
export interface AuthRequest extends Request {
    user?: {
        id: string | number;
        email: string;
        username: string;
        name: string;
        role: string;
        password: string;
        parentId: string | number | null;
        firstName?: string;
        lastName?: string;
        profileImageUrl?: string;
        createdAt: Date;
        updatedAt?: Date;
    };
}
export declare function hashPassword(password: string): Promise<string>;
export declare function comparePasswords(supplied: string, stored: string): Promise<boolean>;
export declare function generateToken(user: {
    id: string;
    role: string;
}): string;
export declare function verifyToken(token: string): JwtPayload;
export declare function authenticateJwt(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function hasRoleMiddleware(roles: string[]): (req: AuthRequest, res: Response, next: NextFunction) => void;
