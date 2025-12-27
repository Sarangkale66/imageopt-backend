import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to verify JWT token and attach user to request
 */
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Optional auth middleware - allows request to proceed without token
 */
export declare const optionalAuthMiddleware: (req: Request, res: Response, next: NextFunction) => void;
