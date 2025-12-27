// users/user.service.ts
// User-related business logic

import { User, IUser } from './user.model';

export class UserService {
  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email, isActive: true });
  }

  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }

  /**
   * Create new user
   */
  async create(email: string, passwordHash: string, role: 'admin' | 'user' = 'user'): Promise<IUser> {
    const user = new User({
      email,
      passwordHash,
      role,
    });

    return user.save();
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email });
    return count > 0;
  }
}
