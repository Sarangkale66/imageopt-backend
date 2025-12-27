"use strict";
// auth/auth.controller.ts
// HTTP request handlers for authentication endpoints
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const response_util_1 = require("../utils/response.util");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
class AuthController {
    constructor() {
        /**
         * POST /api/auth/register
         * Register a new user
         */
        this.register = async (req, res) => {
            try {
                const dto = req.body;
                // Validate input
                const validationError = (0, register_dto_1.validateRegisterDto)(dto);
                if (validationError) {
                    return (0, response_util_1.sendError)(res, validationError, 400);
                }
                // Register user
                const { user, token } = await this.authService.register(dto.email, dto.password);
                return (0, response_util_1.sendSuccess)(res, {
                    user,
                    token,
                }, 'User registered successfully', 201);
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.message || 'Registration failed', 400);
            }
        };
        /**
         * POST /api/auth/login
         * Login with email and password
         */
        this.login = async (req, res) => {
            try {
                const dto = req.body;
                // Validate input
                const validationError = (0, login_dto_1.validateLoginDto)(dto);
                if (validationError) {
                    return (0, response_util_1.sendError)(res, validationError, 400);
                }
                // Login user
                const { user, token } = await this.authService.login(dto.email, dto.password);
                return (0, response_util_1.sendSuccess)(res, {
                    user,
                    token,
                }, 'Login successful');
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.message || 'Login failed', 401);
            }
        };
        /**
         * GET /api/auth/me
         * Get current authenticated user
         */
        this.me = async (req, res) => {
            try {
                // User is already attached to req by auth middleware
                if (!req.user) {
                    return (0, response_util_1.sendError)(res, 'Not authenticated', 401);
                }
                const user = await this.authService.getUserById(req.user.userId);
                if (!user) {
                    return (0, response_util_1.sendError)(res, 'User not found', 404);
                }
                return (0, response_util_1.sendSuccess)(res, { user });
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.message || 'Failed to get user', 500);
            }
        };
        this.authService = new auth_service_1.AuthService();
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXV0aC5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwwQkFBMEI7QUFDMUIscURBQXFEOzs7QUFHckQsaURBQTZDO0FBQzdDLDBEQUFnRTtBQUNoRSxxREFBc0U7QUFDdEUsK0NBQTZEO0FBRTdELE1BQWEsY0FBYztJQUd6QjtRQUlBOzs7V0FHRztRQUNILGFBQVEsR0FBRyxLQUFLLEVBQUUsR0FBWSxFQUFFLEdBQWEsRUFBcUIsRUFBRTtZQUNsRSxJQUFJLENBQUM7Z0JBQ0gsTUFBTSxHQUFHLEdBQWdCLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBRWxDLGlCQUFpQjtnQkFDakIsTUFBTSxlQUFlLEdBQUcsSUFBQSxrQ0FBbUIsRUFBQyxHQUFHLENBQUMsQ0FBQztnQkFDakQsSUFBSSxlQUFlLEVBQUUsQ0FBQztvQkFDcEIsT0FBTyxJQUFBLHlCQUFTLEVBQUMsR0FBRyxFQUFFLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDOUMsQ0FBQztnQkFFRCxnQkFBZ0I7Z0JBQ2hCLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFakYsT0FBTyxJQUFBLDJCQUFXLEVBQ2hCLEdBQUcsRUFDSDtvQkFDRSxJQUFJO29CQUNKLEtBQUs7aUJBQ04sRUFDRCw4QkFBOEIsRUFDOUIsR0FBRyxDQUNKLENBQUM7WUFDSixDQUFDO1lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztnQkFDcEIsT0FBTyxJQUFBLHlCQUFTLEVBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxPQUFPLElBQUkscUJBQXFCLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDckUsQ0FBQztRQUNILENBQUMsQ0FBQztRQUVGOzs7V0FHRztRQUNILFVBQUssR0FBRyxLQUFLLEVBQUUsR0FBWSxFQUFFLEdBQWEsRUFBcUIsRUFBRTtZQUMvRCxJQUFJLENBQUM7Z0JBQ0gsTUFBTSxHQUFHLEdBQWEsR0FBRyxDQUFDLElBQUksQ0FBQztnQkFFL0IsaUJBQWlCO2dCQUNqQixNQUFNLGVBQWUsR0FBRyxJQUFBLDRCQUFnQixFQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLGVBQWUsRUFBRSxDQUFDO29CQUNwQixPQUFPLElBQUEseUJBQVMsRUFBQyxHQUFHLEVBQUUsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO2dCQUVELGFBQWE7Z0JBQ2IsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUU5RSxPQUFPLElBQUEsMkJBQVcsRUFBQyxHQUFHLEVBQUU7b0JBQ3RCLElBQUk7b0JBQ0osS0FBSztpQkFDTixFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFDekIsQ0FBQztZQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7Z0JBQ3BCLE9BQU8sSUFBQSx5QkFBUyxFQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsT0FBTyxJQUFJLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUM5RCxDQUFDO1FBQ0gsQ0FBQyxDQUFDO1FBRUY7OztXQUdHO1FBQ0gsT0FBRSxHQUFHLEtBQUssRUFBRSxHQUFZLEVBQUUsR0FBYSxFQUFxQixFQUFFO1lBQzVELElBQUksQ0FBQztnQkFDSCxxREFBcUQ7Z0JBQ3JELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2QsT0FBTyxJQUFBLHlCQUFTLEVBQUMsR0FBRyxFQUFFLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNsRCxDQUFDO2dCQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFakUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNWLE9BQU8sSUFBQSx5QkFBUyxFQUFDLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDL0MsQ0FBQztnQkFFRCxPQUFPLElBQUEsMkJBQVcsRUFBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ3BDLENBQUM7WUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO2dCQUNwQixPQUFPLElBQUEseUJBQVMsRUFBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLE9BQU8sSUFBSSxvQkFBb0IsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNwRSxDQUFDO1FBQ0gsQ0FBQyxDQUFDO1FBakZBLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSwwQkFBVyxFQUFFLENBQUM7SUFDdkMsQ0FBQztDQWlGRjtBQXRGRCx3Q0FzRkMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBhdXRoL2F1dGguY29udHJvbGxlci50c1xyXG4vLyBIVFRQIHJlcXVlc3QgaGFuZGxlcnMgZm9yIGF1dGhlbnRpY2F0aW9uIGVuZHBvaW50c1xyXG5cclxuaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcclxuaW1wb3J0IHsgQXV0aFNlcnZpY2UgfSBmcm9tICcuL2F1dGguc2VydmljZSc7XHJcbmltcG9ydCB7IHNlbmRTdWNjZXNzLCBzZW5kRXJyb3IgfSBmcm9tICcuLi91dGlscy9yZXNwb25zZS51dGlsJztcclxuaW1wb3J0IHsgdmFsaWRhdGVSZWdpc3RlckR0bywgUmVnaXN0ZXJEdG8gfSBmcm9tICcuL2R0by9yZWdpc3Rlci5kdG8nO1xyXG5pbXBvcnQgeyB2YWxpZGF0ZUxvZ2luRHRvLCBMb2dpbkR0byB9IGZyb20gJy4vZHRvL2xvZ2luLmR0byc7XHJcblxyXG5leHBvcnQgY2xhc3MgQXV0aENvbnRyb2xsZXIge1xyXG4gIHByaXZhdGUgYXV0aFNlcnZpY2U6IEF1dGhTZXJ2aWNlO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuYXV0aFNlcnZpY2UgPSBuZXcgQXV0aFNlcnZpY2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBPU1QgL2FwaS9hdXRoL3JlZ2lzdGVyXHJcbiAgICogUmVnaXN0ZXIgYSBuZXcgdXNlclxyXG4gICAqL1xyXG4gIHJlZ2lzdGVyID0gYXN5bmMgKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSk6IFByb21pc2U8UmVzcG9uc2U+ID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGR0bzogUmVnaXN0ZXJEdG8gPSByZXEuYm9keTtcclxuXHJcbiAgICAgIC8vIFZhbGlkYXRlIGlucHV0XHJcbiAgICAgIGNvbnN0IHZhbGlkYXRpb25FcnJvciA9IHZhbGlkYXRlUmVnaXN0ZXJEdG8oZHRvKTtcclxuICAgICAgaWYgKHZhbGlkYXRpb25FcnJvcikge1xyXG4gICAgICAgIHJldHVybiBzZW5kRXJyb3IocmVzLCB2YWxpZGF0aW9uRXJyb3IsIDQwMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlZ2lzdGVyIHVzZXJcclxuICAgICAgY29uc3QgeyB1c2VyLCB0b2tlbiB9ID0gYXdhaXQgdGhpcy5hdXRoU2VydmljZS5yZWdpc3RlcihkdG8uZW1haWwsIGR0by5wYXNzd29yZCk7XHJcblxyXG4gICAgICByZXR1cm4gc2VuZFN1Y2Nlc3MoXHJcbiAgICAgICAgcmVzLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHVzZXIsXHJcbiAgICAgICAgICB0b2tlbixcclxuICAgICAgICB9LFxyXG4gICAgICAgICdVc2VyIHJlZ2lzdGVyZWQgc3VjY2Vzc2Z1bGx5JyxcclxuICAgICAgICAyMDFcclxuICAgICAgKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIHNlbmRFcnJvcihyZXMsIGVycm9yLm1lc3NhZ2UgfHwgJ1JlZ2lzdHJhdGlvbiBmYWlsZWQnLCA0MDApO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFBPU1QgL2FwaS9hdXRoL2xvZ2luXHJcbiAgICogTG9naW4gd2l0aCBlbWFpbCBhbmQgcGFzc3dvcmRcclxuICAgKi9cclxuICBsb2dpbiA9IGFzeW5jIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpOiBQcm9taXNlPFJlc3BvbnNlPiA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBkdG86IExvZ2luRHRvID0gcmVxLmJvZHk7XHJcblxyXG4gICAgICAvLyBWYWxpZGF0ZSBpbnB1dFxyXG4gICAgICBjb25zdCB2YWxpZGF0aW9uRXJyb3IgPSB2YWxpZGF0ZUxvZ2luRHRvKGR0byk7XHJcbiAgICAgIGlmICh2YWxpZGF0aW9uRXJyb3IpIHtcclxuICAgICAgICByZXR1cm4gc2VuZEVycm9yKHJlcywgdmFsaWRhdGlvbkVycm9yLCA0MDApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBMb2dpbiB1c2VyXHJcbiAgICAgIGNvbnN0IHsgdXNlciwgdG9rZW4gfSA9IGF3YWl0IHRoaXMuYXV0aFNlcnZpY2UubG9naW4oZHRvLmVtYWlsLCBkdG8ucGFzc3dvcmQpO1xyXG5cclxuICAgICAgcmV0dXJuIHNlbmRTdWNjZXNzKHJlcywge1xyXG4gICAgICAgIHVzZXIsXHJcbiAgICAgICAgdG9rZW4sXHJcbiAgICAgIH0sICdMb2dpbiBzdWNjZXNzZnVsJyk7XHJcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgIHJldHVybiBzZW5kRXJyb3IocmVzLCBlcnJvci5tZXNzYWdlIHx8ICdMb2dpbiBmYWlsZWQnLCA0MDEpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEdFVCAvYXBpL2F1dGgvbWVcclxuICAgKiBHZXQgY3VycmVudCBhdXRoZW50aWNhdGVkIHVzZXJcclxuICAgKi9cclxuICBtZSA9IGFzeW5jIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpOiBQcm9taXNlPFJlc3BvbnNlPiA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBVc2VyIGlzIGFscmVhZHkgYXR0YWNoZWQgdG8gcmVxIGJ5IGF1dGggbWlkZGxld2FyZVxyXG4gICAgICBpZiAoIXJlcS51c2VyKSB7XHJcbiAgICAgICAgcmV0dXJuIHNlbmRFcnJvcihyZXMsICdOb3QgYXV0aGVudGljYXRlZCcsIDQwMSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCB0aGlzLmF1dGhTZXJ2aWNlLmdldFVzZXJCeUlkKHJlcS51c2VyLnVzZXJJZCk7XHJcbiAgICAgIFxyXG4gICAgICBpZiAoIXVzZXIpIHtcclxuICAgICAgICByZXR1cm4gc2VuZEVycm9yKHJlcywgJ1VzZXIgbm90IGZvdW5kJywgNDA0KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHNlbmRTdWNjZXNzKHJlcywgeyB1c2VyIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICByZXR1cm4gc2VuZEVycm9yKHJlcywgZXJyb3IubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGdldCB1c2VyJywgNTAwKTtcclxuICAgIH1cclxuICB9O1xyXG59XHJcbiJdfQ==