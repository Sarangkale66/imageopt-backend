"use strict";
// app.ts
// Express application configuration
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = require("express");
const cors_1 = require("cors");
const helmet_1 = require("helmet");
const auth_routes_1 = require("./auth/auth.routes");
const asset_routes_1 = require("./assets/asset.routes");
const error_middleware_1 = require("./middlewares/error.middleware");
const createApp = () => {
    const app = (0, express_1.default)();
    // ===================================
    // MIDDLEWARE
    // ===================================
    // Security headers
    app.use((0, helmet_1.default)());
    // CORS - allow all origins for prototype (restrict in production)
    app.use((0, cors_1.default)({
        origin: '*',
        credentials: true,
    }));
    // Body parsers
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Request logging (simple console log for prototype)
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
    // ===================================
    // ROUTES
    // ===================================
    // Health check
    app.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            service: 'imageopt-backend-api',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
        });
    });
    // API routes
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/assets', asset_routes_1.default);
    // ===================================
    // ERROR HANDLING
    // ===================================
    // 404 handler
    app.use(error_middleware_1.notFoundMiddleware);
    // Global error handler
    app.use(error_middleware_1.errorMiddleware);
    return app;
};
exports.createApp = createApp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxTQUFTO0FBQ1Qsb0NBQW9DOzs7QUFFcEMscUNBQStDO0FBQy9DLCtCQUF3QjtBQUN4QixtQ0FBNEI7QUFDNUIsb0RBQTRDO0FBQzVDLHdEQUFnRDtBQUNoRCxxRUFBcUY7QUFFOUUsTUFBTSxTQUFTLEdBQUcsR0FBZ0IsRUFBRTtJQUN6QyxNQUFNLEdBQUcsR0FBRyxJQUFBLGlCQUFPLEdBQUUsQ0FBQztJQUV0QixzQ0FBc0M7SUFDdEMsYUFBYTtJQUNiLHNDQUFzQztJQUV0QyxtQkFBbUI7SUFDbkIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFBLGdCQUFNLEdBQUUsQ0FBQyxDQUFDO0lBRWxCLGtFQUFrRTtJQUNsRSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUEsY0FBSSxFQUFDO1FBQ1gsTUFBTSxFQUFFLEdBQUc7UUFDWCxXQUFXLEVBQUUsSUFBSTtLQUNsQixDQUFDLENBQUMsQ0FBQztJQUVKLGVBQWU7SUFDZixHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6QyxHQUFHLENBQUMsR0FBRyxDQUFDLGlCQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRS9ELHFEQUFxRDtJQUNyRCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRTtRQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN6QyxJQUFJLEVBQUUsQ0FBQztJQUNULENBQUMsQ0FBQyxDQUFDO0lBRUgsc0NBQXNDO0lBQ3RDLFNBQVM7SUFDVCxzQ0FBc0M7SUFFdEMsZUFBZTtJQUNmLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQzlCLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDUCxNQUFNLEVBQUUsU0FBUztZQUNqQixPQUFPLEVBQUUsc0JBQXNCO1lBQy9CLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtTQUNwQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILGFBQWE7SUFDYixHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxxQkFBVSxDQUFDLENBQUM7SUFDakMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsc0JBQVcsQ0FBQyxDQUFDO0lBRXBDLHNDQUFzQztJQUN0QyxpQkFBaUI7SUFDakIsc0NBQXNDO0lBRXRDLGNBQWM7SUFDZCxHQUFHLENBQUMsR0FBRyxDQUFDLHFDQUFrQixDQUFDLENBQUM7SUFFNUIsdUJBQXVCO0lBQ3ZCLEdBQUcsQ0FBQyxHQUFHLENBQUMsa0NBQWUsQ0FBQyxDQUFDO0lBRXpCLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyxDQUFDO0FBdkRXLFFBQUEsU0FBUyxhQXVEcEIiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBhcHAudHNcclxuLy8gRXhwcmVzcyBhcHBsaWNhdGlvbiBjb25maWd1cmF0aW9uXHJcblxyXG5pbXBvcnQgZXhwcmVzcywgeyBBcHBsaWNhdGlvbiB9IGZyb20gJ2V4cHJlc3MnO1xyXG5pbXBvcnQgY29ycyBmcm9tICdjb3JzJztcclxuaW1wb3J0IGhlbG1ldCBmcm9tICdoZWxtZXQnO1xyXG5pbXBvcnQgYXV0aFJvdXRlcyBmcm9tICcuL2F1dGgvYXV0aC5yb3V0ZXMnO1xyXG5pbXBvcnQgYXNzZXRSb3V0ZXMgZnJvbSAnLi9hc3NldHMvYXNzZXQucm91dGVzJztcclxuaW1wb3J0IHsgZXJyb3JNaWRkbGV3YXJlLCBub3RGb3VuZE1pZGRsZXdhcmUgfSBmcm9tICcuL21pZGRsZXdhcmVzL2Vycm9yLm1pZGRsZXdhcmUnO1xyXG5cclxuZXhwb3J0IGNvbnN0IGNyZWF0ZUFwcCA9ICgpOiBBcHBsaWNhdGlvbiA9PiB7XHJcbiAgY29uc3QgYXBwID0gZXhwcmVzcygpO1xyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIE1JRERMRVdBUkVcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvLyBTZWN1cml0eSBoZWFkZXJzXHJcbiAgYXBwLnVzZShoZWxtZXQoKSk7XHJcblxyXG4gIC8vIENPUlMgLSBhbGxvdyBhbGwgb3JpZ2lucyBmb3IgcHJvdG90eXBlIChyZXN0cmljdCBpbiBwcm9kdWN0aW9uKVxyXG4gIGFwcC51c2UoY29ycyh7XHJcbiAgICBvcmlnaW46ICcqJyxcclxuICAgIGNyZWRlbnRpYWxzOiB0cnVlLFxyXG4gIH0pKTtcclxuXHJcbiAgLy8gQm9keSBwYXJzZXJzXHJcbiAgYXBwLnVzZShleHByZXNzLmpzb24oeyBsaW1pdDogJzEwbWInIH0pKTtcclxuICBhcHAudXNlKGV4cHJlc3MudXJsZW5jb2RlZCh7IGV4dGVuZGVkOiB0cnVlLCBsaW1pdDogJzEwbWInIH0pKTtcclxuXHJcbiAgLy8gUmVxdWVzdCBsb2dnaW5nIChzaW1wbGUgY29uc29sZSBsb2cgZm9yIHByb3RvdHlwZSlcclxuICBhcHAudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coYCR7cmVxLm1ldGhvZH0gJHtyZXEucGF0aH1gKTtcclxuICAgIG5leHQoKTtcclxuICB9KTtcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBST1VURVNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvLyBIZWFsdGggY2hlY2tcclxuICBhcHAuZ2V0KCcvaGVhbHRoJywgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICByZXMuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2hlYWx0aHknLFxyXG4gICAgICBzZXJ2aWNlOiAnaW1hZ2VvcHQtYmFja2VuZC1hcGknLFxyXG4gICAgICB2ZXJzaW9uOiAnMS4wLjAnLFxyXG4gICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICAvLyBBUEkgcm91dGVzXHJcbiAgYXBwLnVzZSgnL2FwaS9hdXRoJywgYXV0aFJvdXRlcyk7XHJcbiAgYXBwLnVzZSgnL2FwaS9hc3NldHMnLCBhc3NldFJvdXRlcyk7XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gRVJST1IgSEFORExJTkdcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAvLyA0MDQgaGFuZGxlclxyXG4gIGFwcC51c2Uobm90Rm91bmRNaWRkbGV3YXJlKTtcclxuXHJcbiAgLy8gR2xvYmFsIGVycm9yIGhhbmRsZXJcclxuICBhcHAudXNlKGVycm9yTWlkZGxld2FyZSk7XHJcblxyXG4gIHJldHVybiBhcHA7XHJcbn07XHJcbiJdfQ==