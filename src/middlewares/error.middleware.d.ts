import { Request, Response, NextFunction } from 'express';
/**
 * Global error handler
 */
export declare const errorMiddleware: (err: Error, req: Request, res: Response, next: NextFunction) => void;
/**
 * 404 Not Found handler
 */
export declare const notFoundMiddleware: (req: Request, res: Response) => void;
