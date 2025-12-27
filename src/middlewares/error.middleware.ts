// middlewares/error.middleware.ts
// Global error handling middleware

import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';

/**
 * Global error handler
 */
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('❌ Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    sendError(res, err.message, 400);
    return;
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    sendError(res, 'Duplicate entry', 409);
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401);
    return;
  }

  // Default error
  sendError(res, err.message || 'Internal server error', 500);
};

/**
 * 404 Not Found handler
 */
export const notFoundMiddleware = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.path} not found`, 404);
};
