import { Response } from 'express';
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}
/**
 * Send success response
 */
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number) => Response;
/**
 * Send error response
 */
export declare const sendError: (res: Response, error: string, statusCode?: number) => Response;
