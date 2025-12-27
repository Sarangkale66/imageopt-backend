"use strict";
// middlewares/error.middleware.ts
// Global error handling middleware
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundMiddleware = exports.errorMiddleware = void 0;
const response_util_1 = require("../utils/response.util");
/**
 * Global error handler
 */
const errorMiddleware = (err, req, res, next) => {
    console.error('❌ Error:', err);
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        (0, response_util_1.sendError)(res, err.message, 400);
        return;
    }
    // Mongoose duplicate key error
    if (err.name === 'MongoServerError' && err.code === 11000) {
        (0, response_util_1.sendError)(res, 'Duplicate entry', 409);
        return;
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        (0, response_util_1.sendError)(res, 'Invalid token', 401);
        return;
    }
    if (err.name === 'TokenExpiredError') {
        (0, response_util_1.sendError)(res, 'Token expired', 401);
        return;
    }
    // Default error
    (0, response_util_1.sendError)(res, err.message || 'Internal server error', 500);
};
exports.errorMiddleware = errorMiddleware;
/**
 * 404 Not Found handler
 */
const notFoundMiddleware = (req, res) => {
    (0, response_util_1.sendError)(res, `Route ${req.method} ${req.path} not found`, 404);
};
exports.notFoundMiddleware = notFoundMiddleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IubWlkZGxld2FyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVycm9yLm1pZGRsZXdhcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGtDQUFrQztBQUNsQyxtQ0FBbUM7OztBQUduQywwREFBbUQ7QUFFbkQ7O0dBRUc7QUFDSSxNQUFNLGVBQWUsR0FBRyxDQUM3QixHQUFVLEVBQ1YsR0FBWSxFQUNaLEdBQWEsRUFDYixJQUFrQixFQUNaLEVBQUU7SUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUUvQiw0QkFBNEI7SUFDNUIsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLGlCQUFpQixFQUFFLENBQUM7UUFDbkMsSUFBQSx5QkFBUyxFQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLE9BQU87SUFDVCxDQUFDO0lBRUQsK0JBQStCO0lBQy9CLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxrQkFBa0IsSUFBSyxHQUFXLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRSxDQUFDO1FBQ25FLElBQUEseUJBQVMsRUFBQyxHQUFHLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdkMsT0FBTztJQUNULENBQUM7SUFFRCxhQUFhO0lBQ2IsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLG1CQUFtQixFQUFFLENBQUM7UUFDckMsSUFBQSx5QkFBUyxFQUFDLEdBQUcsRUFBRSxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDckMsT0FBTztJQUNULENBQUM7SUFFRCxJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssbUJBQW1CLEVBQUUsQ0FBQztRQUNyQyxJQUFBLHlCQUFTLEVBQUMsR0FBRyxFQUFFLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNyQyxPQUFPO0lBQ1QsQ0FBQztJQUVELGdCQUFnQjtJQUNoQixJQUFBLHlCQUFTLEVBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFPLElBQUksdUJBQXVCLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDOUQsQ0FBQyxDQUFDO0FBakNXLFFBQUEsZUFBZSxtQkFpQzFCO0FBRUY7O0dBRUc7QUFDSSxNQUFNLGtCQUFrQixHQUFHLENBQUMsR0FBWSxFQUFFLEdBQWEsRUFBUSxFQUFFO0lBQ3RFLElBQUEseUJBQVMsRUFBQyxHQUFHLEVBQUUsU0FBUyxHQUFHLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNuRSxDQUFDLENBQUM7QUFGVyxRQUFBLGtCQUFrQixzQkFFN0IiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBtaWRkbGV3YXJlcy9lcnJvci5taWRkbGV3YXJlLnRzXHJcbi8vIEdsb2JhbCBlcnJvciBoYW5kbGluZyBtaWRkbGV3YXJlXHJcblxyXG5pbXBvcnQgeyBSZXF1ZXN0LCBSZXNwb25zZSwgTmV4dEZ1bmN0aW9uIH0gZnJvbSAnZXhwcmVzcyc7XHJcbmltcG9ydCB7IHNlbmRFcnJvciB9IGZyb20gJy4uL3V0aWxzL3Jlc3BvbnNlLnV0aWwnO1xyXG5cclxuLyoqXHJcbiAqIEdsb2JhbCBlcnJvciBoYW5kbGVyXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZXJyb3JNaWRkbGV3YXJlID0gKFxyXG4gIGVycjogRXJyb3IsXHJcbiAgcmVxOiBSZXF1ZXN0LFxyXG4gIHJlczogUmVzcG9uc2UsXHJcbiAgbmV4dDogTmV4dEZ1bmN0aW9uXHJcbik6IHZvaWQgPT4ge1xyXG4gIGNvbnNvbGUuZXJyb3IoJ+KdjCBFcnJvcjonLCBlcnIpO1xyXG5cclxuICAvLyBNb25nb29zZSB2YWxpZGF0aW9uIGVycm9yXHJcbiAgaWYgKGVyci5uYW1lID09PSAnVmFsaWRhdGlvbkVycm9yJykge1xyXG4gICAgc2VuZEVycm9yKHJlcywgZXJyLm1lc3NhZ2UsIDQwMCk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICAvLyBNb25nb29zZSBkdXBsaWNhdGUga2V5IGVycm9yXHJcbiAgaWYgKGVyci5uYW1lID09PSAnTW9uZ29TZXJ2ZXJFcnJvcicgJiYgKGVyciBhcyBhbnkpLmNvZGUgPT09IDExMDAwKSB7XHJcbiAgICBzZW5kRXJyb3IocmVzLCAnRHVwbGljYXRlIGVudHJ5JywgNDA5KTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIEpXVCBlcnJvcnNcclxuICBpZiAoZXJyLm5hbWUgPT09ICdKc29uV2ViVG9rZW5FcnJvcicpIHtcclxuICAgIHNlbmRFcnJvcihyZXMsICdJbnZhbGlkIHRva2VuJywgNDAxKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGlmIChlcnIubmFtZSA9PT0gJ1Rva2VuRXhwaXJlZEVycm9yJykge1xyXG4gICAgc2VuZEVycm9yKHJlcywgJ1Rva2VuIGV4cGlyZWQnLCA0MDEpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgLy8gRGVmYXVsdCBlcnJvclxyXG4gIHNlbmRFcnJvcihyZXMsIGVyci5tZXNzYWdlIHx8ICdJbnRlcm5hbCBzZXJ2ZXIgZXJyb3InLCA1MDApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIDQwNCBOb3QgRm91bmQgaGFuZGxlclxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IG5vdEZvdW5kTWlkZGxld2FyZSA9IChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpOiB2b2lkID0+IHtcclxuICBzZW5kRXJyb3IocmVzLCBgUm91dGUgJHtyZXEubWV0aG9kfSAke3JlcS5wYXRofSBub3QgZm91bmRgLCA0MDQpO1xyXG59O1xyXG4iXX0=