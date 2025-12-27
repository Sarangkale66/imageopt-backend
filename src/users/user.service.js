"use strict";
// users/user.service.ts
// User-related business logic
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("./user.model");
class UserService {
    /**
     * Find user by email
     */
    async findByEmail(email) {
        return user_model_1.User.findOne({ email, isActive: true });
    }
    /**
     * Find user by ID
     */
    async findById(userId) {
        return user_model_1.User.findById(userId);
    }
    /**
     * Create new user
     */
    async create(email, passwordHash, role = 'user') {
        const user = new user_model_1.User({
            email,
            passwordHash,
            role,
        });
        return user.save();
    }
    /**
     * Check if user exists by email
     */
    async existsByEmail(email) {
        const count = await user_model_1.User.countDocuments({ email });
        return count > 0;
    }
}
exports.UserService = UserService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidXNlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx3QkFBd0I7QUFDeEIsOEJBQThCOzs7QUFFOUIsNkNBQTJDO0FBRTNDLE1BQWEsV0FBVztJQUN0Qjs7T0FFRztJQUNILEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBYTtRQUM3QixPQUFPLGlCQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBYztRQUMzQixPQUFPLGlCQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBYSxFQUFFLFlBQW9CLEVBQUUsT0FBeUIsTUFBTTtRQUMvRSxNQUFNLElBQUksR0FBRyxJQUFJLGlCQUFJLENBQUM7WUFDcEIsS0FBSztZQUNMLFlBQVk7WUFDWixJQUFJO1NBQ0wsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFhO1FBQy9CLE1BQU0sS0FBSyxHQUFHLE1BQU0saUJBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ25ELE9BQU8sS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNuQixDQUFDO0NBQ0Y7QUFuQ0Qsa0NBbUNDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gdXNlcnMvdXNlci5zZXJ2aWNlLnRzXHJcbi8vIFVzZXItcmVsYXRlZCBidXNpbmVzcyBsb2dpY1xyXG5cclxuaW1wb3J0IHsgVXNlciwgSVVzZXIgfSBmcm9tICcuL3VzZXIubW9kZWwnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFVzZXJTZXJ2aWNlIHtcclxuICAvKipcclxuICAgKiBGaW5kIHVzZXIgYnkgZW1haWxcclxuICAgKi9cclxuICBhc3luYyBmaW5kQnlFbWFpbChlbWFpbDogc3RyaW5nKTogUHJvbWlzZTxJVXNlciB8IG51bGw+IHtcclxuICAgIHJldHVybiBVc2VyLmZpbmRPbmUoeyBlbWFpbCwgaXNBY3RpdmU6IHRydWUgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGaW5kIHVzZXIgYnkgSURcclxuICAgKi9cclxuICBhc3luYyBmaW5kQnlJZCh1c2VySWQ6IHN0cmluZyk6IFByb21pc2U8SVVzZXIgfCBudWxsPiB7XHJcbiAgICByZXR1cm4gVXNlci5maW5kQnlJZCh1c2VySWQpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIG5ldyB1c2VyXHJcbiAgICovXHJcbiAgYXN5bmMgY3JlYXRlKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkSGFzaDogc3RyaW5nLCByb2xlOiAnYWRtaW4nIHwgJ3VzZXInID0gJ3VzZXInKTogUHJvbWlzZTxJVXNlcj4ge1xyXG4gICAgY29uc3QgdXNlciA9IG5ldyBVc2VyKHtcclxuICAgICAgZW1haWwsXHJcbiAgICAgIHBhc3N3b3JkSGFzaCxcclxuICAgICAgcm9sZSxcclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiB1c2VyLnNhdmUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrIGlmIHVzZXIgZXhpc3RzIGJ5IGVtYWlsXHJcbiAgICovXHJcbiAgYXN5bmMgZXhpc3RzQnlFbWFpbChlbWFpbDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICBjb25zdCBjb3VudCA9IGF3YWl0IFVzZXIuY291bnREb2N1bWVudHMoeyBlbWFpbCB9KTtcclxuICAgIHJldHVybiBjb3VudCA+IDA7XHJcbiAgfVxyXG59XHJcbiJdfQ==