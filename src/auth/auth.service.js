"use strict";
// auth/auth.service.ts
// Authentication business logic - register, login, password hashing
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = require("bcryptjs");
const user_service_1 = require("../users/user.service");
const jwt_util_1 = require("../utils/jwt.util");
class AuthService {
    constructor() {
        this.userService = new user_service_1.UserService();
    }
    /**
     * Register a new user
     */
    async register(email, password) {
        // Check if user already exists
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const user = await this.userService.create(email, passwordHash);
        // Generate JWT token
        const token = this.generateTokenForUser(user);
        return { user, token };
    }
    /**
     * Login user with email and password
     */
    async login(email, password) {
        // Find user
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
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
    async getUserById(userId) {
        return this.userService.findById(userId);
    }
    /**
     * Generate JWT token for user
     */
    generateTokenForUser(user) {
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        return (0, jwt_util_1.generateToken)(payload);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXV0aC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx1QkFBdUI7QUFDdkIsb0VBQW9FOzs7QUFFcEUsdUNBQThCO0FBQzlCLHdEQUFvRDtBQUNwRCxnREFBOEQ7QUFHOUQsTUFBYSxXQUFXO0lBR3RCO1FBQ0UsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLDBCQUFXLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQWEsRUFBRSxRQUFnQjtRQUM1QywrQkFBK0I7UUFDL0IsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMvRCxJQUFJLFlBQVksRUFBRSxDQUFDO1lBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRUQsZ0JBQWdCO1FBQ2hCLE1BQU0sWUFBWSxHQUFHLE1BQU0sa0JBQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRXJELGNBQWM7UUFDZCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztRQUVoRSxxQkFBcUI7UUFDckIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTlDLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFhLEVBQUUsUUFBZ0I7UUFDekMsWUFBWTtRQUNaLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFRCxrQkFBa0I7UUFDbEIsTUFBTSxlQUFlLEdBQUcsTUFBTSxrQkFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFFLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVELHFCQUFxQjtRQUNyQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFOUMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQWM7UUFDOUIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRUQ7O09BRUc7SUFDSyxvQkFBb0IsQ0FBQyxJQUFXO1FBQ3RDLE1BQU0sT0FBTyxHQUFlO1lBQzFCLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTtZQUMzQixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1NBQ2hCLENBQUM7UUFFRixPQUFPLElBQUEsd0JBQWEsRUFBQyxPQUFPLENBQUMsQ0FBQztJQUNoQyxDQUFDO0NBQ0Y7QUF0RUQsa0NBc0VDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gYXV0aC9hdXRoLnNlcnZpY2UudHNcclxuLy8gQXV0aGVudGljYXRpb24gYnVzaW5lc3MgbG9naWMgLSByZWdpc3RlciwgbG9naW4sIHBhc3N3b3JkIGhhc2hpbmdcclxuXHJcbmltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnO1xyXG5pbXBvcnQgeyBVc2VyU2VydmljZSB9IGZyb20gJy4uL3VzZXJzL3VzZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IGdlbmVyYXRlVG9rZW4sIEp3dFBheWxvYWQgfSBmcm9tICcuLi91dGlscy9qd3QudXRpbCc7XHJcbmltcG9ydCB7IElVc2VyIH0gZnJvbSAnLi4vdXNlcnMvdXNlci5tb2RlbCc7XHJcblxyXG5leHBvcnQgY2xhc3MgQXV0aFNlcnZpY2Uge1xyXG4gIHByaXZhdGUgdXNlclNlcnZpY2U6IFVzZXJTZXJ2aWNlO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMudXNlclNlcnZpY2UgPSBuZXcgVXNlclNlcnZpY2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlZ2lzdGVyIGEgbmV3IHVzZXJcclxuICAgKi9cclxuICBhc3luYyByZWdpc3RlcihlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKTogUHJvbWlzZTx7IHVzZXI6IElVc2VyOyB0b2tlbjogc3RyaW5nIH0+IHtcclxuICAgIC8vIENoZWNrIGlmIHVzZXIgYWxyZWFkeSBleGlzdHNcclxuICAgIGNvbnN0IGV4aXN0aW5nVXNlciA9IGF3YWl0IHRoaXMudXNlclNlcnZpY2UuZmluZEJ5RW1haWwoZW1haWwpO1xyXG4gICAgaWYgKGV4aXN0aW5nVXNlcikge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VzZXIgd2l0aCB0aGlzIGVtYWlsIGFscmVhZHkgZXhpc3RzJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGFzaCBwYXNzd29yZFxyXG4gICAgY29uc3QgcGFzc3dvcmRIYXNoID0gYXdhaXQgYmNyeXB0Lmhhc2gocGFzc3dvcmQsIDEwKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdXNlclxyXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IHRoaXMudXNlclNlcnZpY2UuY3JlYXRlKGVtYWlsLCBwYXNzd29yZEhhc2gpO1xyXG5cclxuICAgIC8vIEdlbmVyYXRlIEpXVCB0b2tlblxyXG4gICAgY29uc3QgdG9rZW4gPSB0aGlzLmdlbmVyYXRlVG9rZW5Gb3JVc2VyKHVzZXIpO1xyXG5cclxuICAgIHJldHVybiB7IHVzZXIsIHRva2VuIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBMb2dpbiB1c2VyIHdpdGggZW1haWwgYW5kIHBhc3N3b3JkXHJcbiAgICovXHJcbiAgYXN5bmMgbG9naW4oZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8eyB1c2VyOiBJVXNlcjsgdG9rZW46IHN0cmluZyB9PiB7XHJcbiAgICAvLyBGaW5kIHVzZXJcclxuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCB0aGlzLnVzZXJTZXJ2aWNlLmZpbmRCeUVtYWlsKGVtYWlsKTtcclxuICAgIGlmICghdXNlcikge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZW1haWwgb3IgcGFzc3dvcmQnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBWZXJpZnkgcGFzc3dvcmRcclxuICAgIGNvbnN0IGlzUGFzc3dvcmRWYWxpZCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKHBhc3N3b3JkLCB1c2VyLnBhc3N3b3JkSGFzaCk7XHJcbiAgICBpZiAoIWlzUGFzc3dvcmRWYWxpZCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZW1haWwgb3IgcGFzc3dvcmQnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBHZW5lcmF0ZSBKV1QgdG9rZW5cclxuICAgIGNvbnN0IHRva2VuID0gdGhpcy5nZW5lcmF0ZVRva2VuRm9yVXNlcih1c2VyKTtcclxuXHJcbiAgICByZXR1cm4geyB1c2VyLCB0b2tlbiB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHVzZXIgYnkgSUQgKGZvciBwcm90ZWN0ZWQgcm91dGVzKVxyXG4gICAqL1xyXG4gIGFzeW5jIGdldFVzZXJCeUlkKHVzZXJJZDogc3RyaW5nKTogUHJvbWlzZTxJVXNlciB8IG51bGw+IHtcclxuICAgIHJldHVybiB0aGlzLnVzZXJTZXJ2aWNlLmZpbmRCeUlkKHVzZXJJZCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZW5lcmF0ZSBKV1QgdG9rZW4gZm9yIHVzZXJcclxuICAgKi9cclxuICBwcml2YXRlIGdlbmVyYXRlVG9rZW5Gb3JVc2VyKHVzZXI6IElVc2VyKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHBheWxvYWQ6IEp3dFBheWxvYWQgPSB7XHJcbiAgICAgIHVzZXJJZDogdXNlci5faWQudG9TdHJpbmcoKSxcclxuICAgICAgZW1haWw6IHVzZXIuZW1haWwsXHJcbiAgICAgIHJvbGU6IHVzZXIucm9sZSxcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIGdlbmVyYXRlVG9rZW4ocGF5bG9hZCk7XHJcbiAgfVxyXG59XHJcbiJdfQ==