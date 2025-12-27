import { IUser } from './user.model';
export declare class UserService {
    /**
     * Find user by email
     */
    findByEmail(email: string): Promise<IUser | null>;
    /**
     * Find user by ID
     */
    findById(userId: string): Promise<IUser | null>;
    /**
     * Create new user
     */
    create(email: string, passwordHash: string, role?: 'admin' | 'user'): Promise<IUser>;
    /**
     * Check if user exists by email
     */
    existsByEmail(email: string): Promise<boolean>;
}
