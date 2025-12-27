import { Request, Response } from 'express';
export declare class AuthController {
    private authService;
    constructor();
    /**
     * POST /api/auth/register
     * Register a new user
     */
    register: (req: Request, res: Response) => Promise<Response>;
    /**
     * POST /api/auth/login
     * Login with email and password
     */
    login: (req: Request, res: Response) => Promise<Response>;
    /**
     * GET /api/auth/me
     * Get current authenticated user
     */
    me: (req: Request, res: Response) => Promise<Response>;
}
