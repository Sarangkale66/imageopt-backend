import { IUser } from '../users/user.model';
export declare class AuthService {
    private userService;
    constructor();
    /**
     * Register a new user
     */
    register(email: string, password: string): Promise<{
        user: IUser;
        token: string;
    }>;
    /**
     * Login user with email and password
     */
    login(email: string, password: string): Promise<{
        user: IUser;
        token: string;
    }>;
    /**
     * Get user by ID (for protected routes)
     */
    getUserById(userId: string): Promise<IUser | null>;
    /**
     * Generate JWT token for user
     */
    private generateTokenForUser;
}
