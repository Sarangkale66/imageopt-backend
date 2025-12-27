"use strict";
// middlewares/auth.middleware.ts
// JWT authentication middleware
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.authMiddleware = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const response_util_1 = require("../utils/response.util");
/**
 * Middleware to verify JWT token and attach user to request
 */
const authMiddleware = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            (0, response_util_1.sendError)(res, 'No token provided', 401);
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        // Verify token
        const payload = (0, jwt_util_1.verifyToken)(token);
        // Attach user to request
        req.user = payload;
        next();
    }
    catch (error) {
        (0, response_util_1.sendError)(res, 'Invalid or expired token', 401);
    }
};
exports.authMiddleware = authMiddleware;
/**
 * Optional auth middleware - allows request to proceed without token
 */
const optionalAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = (0, jwt_util_1.verifyToken)(token);
            req.user = payload;
        }
        next();
    }
    catch (error) {
        // Ignore errors for optional auth
        next();
    }
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5taWRkbGV3YXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXV0aC5taWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxpQ0FBaUM7QUFDakMsZ0NBQWdDOzs7QUFHaEMsZ0RBQWdEO0FBQ2hELDBEQUFtRDtBQUVuRDs7R0FFRztBQUNJLE1BQU0sY0FBYyxHQUFHLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBRSxJQUFrQixFQUFRLEVBQUU7SUFDdEYsSUFBSSxDQUFDO1FBQ0gsc0NBQXNDO1FBQ3RDLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1FBRTdDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDckQsSUFBQSx5QkFBUyxFQUFDLEdBQUcsRUFBRSxtQkFBbUIsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN6QyxPQUFPO1FBQ1QsQ0FBQztRQUVELE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQywwQkFBMEI7UUFFakUsZUFBZTtRQUNmLE1BQU0sT0FBTyxHQUFHLElBQUEsc0JBQVcsRUFBQyxLQUFLLENBQUMsQ0FBQztRQUVuQyx5QkFBeUI7UUFDekIsR0FBRyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7UUFFbkIsSUFBSSxFQUFFLENBQUM7SUFDVCxDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixJQUFBLHlCQUFTLEVBQUMsR0FBRyxFQUFFLDBCQUEwQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2xELENBQUM7QUFDSCxDQUFDLENBQUM7QUF0QlcsUUFBQSxjQUFjLGtCQXNCekI7QUFFRjs7R0FFRztBQUNJLE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxHQUFZLEVBQUUsR0FBYSxFQUFFLElBQWtCLEVBQVEsRUFBRTtJQUM5RixJQUFJLENBQUM7UUFDSCxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztRQUU3QyxJQUFJLFVBQVUsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDbkQsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxNQUFNLE9BQU8sR0FBRyxJQUFBLHNCQUFXLEVBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkMsR0FBRyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7UUFDckIsQ0FBQztRQUVELElBQUksRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixrQ0FBa0M7UUFDbEMsSUFBSSxFQUFFLENBQUM7SUFDVCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBZlcsUUFBQSxzQkFBc0IsMEJBZWpDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gbWlkZGxld2FyZXMvYXV0aC5taWRkbGV3YXJlLnRzXHJcbi8vIEpXVCBhdXRoZW50aWNhdGlvbiBtaWRkbGV3YXJlXHJcblxyXG5pbXBvcnQgeyBSZXF1ZXN0LCBSZXNwb25zZSwgTmV4dEZ1bmN0aW9uIH0gZnJvbSAnZXhwcmVzcyc7XHJcbmltcG9ydCB7IHZlcmlmeVRva2VuIH0gZnJvbSAnLi4vdXRpbHMvand0LnV0aWwnO1xyXG5pbXBvcnQgeyBzZW5kRXJyb3IgfSBmcm9tICcuLi91dGlscy9yZXNwb25zZS51dGlsJztcclxuXHJcbi8qKlxyXG4gKiBNaWRkbGV3YXJlIHRvIHZlcmlmeSBKV1QgdG9rZW4gYW5kIGF0dGFjaCB1c2VyIHRvIHJlcXVlc3RcclxuICovXHJcbmV4cG9ydCBjb25zdCBhdXRoTWlkZGxld2FyZSA9IChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIG5leHQ6IE5leHRGdW5jdGlvbik6IHZvaWQgPT4ge1xyXG4gIHRyeSB7XHJcbiAgICAvLyBHZXQgdG9rZW4gZnJvbSBBdXRob3JpemF0aW9uIGhlYWRlclxyXG4gICAgY29uc3QgYXV0aEhlYWRlciA9IHJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb247XHJcbiAgICBcclxuICAgIGlmICghYXV0aEhlYWRlciB8fCAhYXV0aEhlYWRlci5zdGFydHNXaXRoKCdCZWFyZXIgJykpIHtcclxuICAgICAgc2VuZEVycm9yKHJlcywgJ05vIHRva2VuIHByb3ZpZGVkJywgNDAxKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRva2VuID0gYXV0aEhlYWRlci5zdWJzdHJpbmcoNyk7IC8vIFJlbW92ZSAnQmVhcmVyICcgcHJlZml4XHJcblxyXG4gICAgLy8gVmVyaWZ5IHRva2VuXHJcbiAgICBjb25zdCBwYXlsb2FkID0gdmVyaWZ5VG9rZW4odG9rZW4pO1xyXG5cclxuICAgIC8vIEF0dGFjaCB1c2VyIHRvIHJlcXVlc3RcclxuICAgIHJlcS51c2VyID0gcGF5bG9hZDtcclxuXHJcbiAgICBuZXh0KCk7XHJcbiAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgc2VuZEVycm9yKHJlcywgJ0ludmFsaWQgb3IgZXhwaXJlZCB0b2tlbicsIDQwMSk7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIE9wdGlvbmFsIGF1dGggbWlkZGxld2FyZSAtIGFsbG93cyByZXF1ZXN0IHRvIHByb2NlZWQgd2l0aG91dCB0b2tlblxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IG9wdGlvbmFsQXV0aE1pZGRsZXdhcmUgPSAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlLCBuZXh0OiBOZXh0RnVuY3Rpb24pOiB2b2lkID0+IHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgYXV0aEhlYWRlciA9IHJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb247XHJcbiAgICBcclxuICAgIGlmIChhdXRoSGVhZGVyICYmIGF1dGhIZWFkZXIuc3RhcnRzV2l0aCgnQmVhcmVyICcpKSB7XHJcbiAgICAgIGNvbnN0IHRva2VuID0gYXV0aEhlYWRlci5zdWJzdHJpbmcoNyk7XHJcbiAgICAgIGNvbnN0IHBheWxvYWQgPSB2ZXJpZnlUb2tlbih0b2tlbik7XHJcbiAgICAgIHJlcS51c2VyID0gcGF5bG9hZDtcclxuICAgIH1cclxuXHJcbiAgICBuZXh0KCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIC8vIElnbm9yZSBlcnJvcnMgZm9yIG9wdGlvbmFsIGF1dGhcclxuICAgIG5leHQoKTtcclxuICB9XHJcbn07XHJcbiJdfQ==