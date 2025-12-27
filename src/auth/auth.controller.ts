// auth/auth.controller.ts
// HTTP request handlers for authentication endpoints

import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { validateRegisterDto, RegisterDto } from './dto/register.dto';
import { validateLoginDto, LoginDto } from './dto/login.dto';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * POST /api/auth/register
   * Register a new user
   */
  register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const dto: RegisterDto = req.body;

      // Validate input
      const validationError = validateRegisterDto(dto);
      if (validationError) {
        return sendError(res, validationError, 400);
      }

      // Register user
      const { user, token } = await this.authService.register(dto.email, dto.password);

      return sendSuccess(
        res,
        {
          user,
          token,
        },
        'User registered successfully',
        201
      );
    } catch (error: any) {
      return sendError(res, error.message || 'Registration failed', 400);
    }
  };

  /**
   * POST /api/auth/login
   * Login with email and password
   */
  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const dto: LoginDto = req.body;

      // Validate input
      const validationError = validateLoginDto(dto);
      if (validationError) {
        return sendError(res, validationError, 400);
      }

      // Login user
      const { user, token } = await this.authService.login(dto.email, dto.password);

      return sendSuccess(res, {
        user,
        token,
      }, 'Login successful');
    } catch (error: any) {
      return sendError(res, error.message || 'Login failed', 401);
    }
  };

  /**
   * GET /api/auth/me
   * Get current authenticated user
   */
  me = async (req: Request, res: Response): Promise<Response> => {
    try {
      // User is already attached to req by auth middleware
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const user = await this.authService.getUserById(req.user.userId);
      
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      return sendSuccess(res, { user });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to get user', 500);
    }
  };
}
