// auth/auth.service.ts
// Authentication business logic - register, login, password hashing

import bcrypt from 'bcryptjs';
import { UserService } from '../users/user.service';
import { generateToken, JwtPayload } from '../utils/jwt.util';
import { IUser } from '../users/user.model';

export class AuthService {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string): Promise<{ user: IUser; token: string }> {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.userService.create(email, passwordHash);

    // Generate JWT token
    const token = this.generateTokenForUser(user);

    return { user, token };
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    // Find user
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateTokenForUser(user);

    return { user, token };
  }

  /**
   * Get user by ID (for protected routes)
   */
  async getUserById(userId: string): Promise<IUser | null> {
    return this.userService.findById(userId);
  }

  /**
   * Generate JWT token for user
   */
  private generateTokenForUser(user: IUser): string {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return generateToken(payload);
  }
}
