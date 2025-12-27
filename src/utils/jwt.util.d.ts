export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}
/**
 * Generate JWT token for user
 */
export declare const generateToken: (payload: JwtPayload) => string;
/**
 * Verify and decode JWT token
 */
export declare const verifyToken: (token: string) => JwtPayload;
