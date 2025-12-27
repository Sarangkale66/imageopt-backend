"use strict";
// users/user.model.ts
// User MongoDB schema and model
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required'],
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});
// Index for faster email lookups
userSchema.index({ email: 1 });
// Don't return password hash in JSON responses
userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
    },
});
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInVzZXIubW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHNCQUFzQjtBQUN0QixnQ0FBZ0M7OztBQUVoQyx1Q0FBc0Q7QUFXdEQsTUFBTSxVQUFVLEdBQUcsSUFBSSxpQkFBTSxDQUMzQjtJQUNFLEtBQUssRUFBRTtRQUNMLElBQUksRUFBRSxNQUFNO1FBQ1osUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLG1CQUFtQixDQUFDO1FBQ3JDLE1BQU0sRUFBRSxJQUFJO1FBQ1osU0FBUyxFQUFFLElBQUk7UUFDZixJQUFJLEVBQUUsSUFBSTtRQUNWLEtBQUssRUFBRSxDQUFDLGdCQUFnQixFQUFFLDhCQUE4QixDQUFDO0tBQzFEO0lBQ0QsWUFBWSxFQUFFO1FBQ1osSUFBSSxFQUFFLE1BQU07UUFDWixRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLENBQUM7S0FDekM7SUFDRCxJQUFJLEVBQUU7UUFDSixJQUFJLEVBQUUsTUFBTTtRQUNaLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUM7UUFDdkIsT0FBTyxFQUFFLE1BQU07S0FDaEI7SUFDRCxRQUFRLEVBQUU7UUFDUixJQUFJLEVBQUUsT0FBTztRQUNiLE9BQU8sRUFBRSxJQUFJO0tBQ2Q7Q0FDRixFQUNEO0lBQ0UsVUFBVSxFQUFFLElBQUksRUFBRSw2Q0FBNkM7Q0FDaEUsQ0FDRixDQUFDO0FBRUYsaUNBQWlDO0FBQ2pDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUUvQiwrQ0FBK0M7QUFDL0MsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUU7SUFDdkIsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQ3RCLE9BQU8sR0FBRyxDQUFDLFlBQVksQ0FBQztRQUN4QixPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDZixPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUM7Q0FDRixDQUFDLENBQUM7QUFFVSxRQUFBLElBQUksR0FBRyxrQkFBUSxDQUFDLEtBQUssQ0FBUSxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB1c2Vycy91c2VyLm1vZGVsLnRzXHJcbi8vIFVzZXIgTW9uZ29EQiBzY2hlbWEgYW5kIG1vZGVsXHJcblxyXG5pbXBvcnQgbW9uZ29vc2UsIHsgRG9jdW1lbnQsIFNjaGVtYSB9IGZyb20gJ21vbmdvb3NlJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVVzZXIgZXh0ZW5kcyBEb2N1bWVudCB7XHJcbiAgZW1haWw6IHN0cmluZztcclxuICBwYXNzd29yZEhhc2g6IHN0cmluZztcclxuICByb2xlOiAnYWRtaW4nIHwgJ3VzZXInO1xyXG4gIGlzQWN0aXZlOiBib29sZWFuO1xyXG4gIGNyZWF0ZWRBdDogRGF0ZTtcclxuICB1cGRhdGVkQXQ6IERhdGU7XHJcbn1cclxuXHJcbmNvbnN0IHVzZXJTY2hlbWEgPSBuZXcgU2NoZW1hPElVc2VyPihcclxuICB7XHJcbiAgICBlbWFpbDoge1xyXG4gICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgIHJlcXVpcmVkOiBbdHJ1ZSwgJ0VtYWlsIGlzIHJlcXVpcmVkJ10sXHJcbiAgICAgIHVuaXF1ZTogdHJ1ZSxcclxuICAgICAgbG93ZXJjYXNlOiB0cnVlLFxyXG4gICAgICB0cmltOiB0cnVlLFxyXG4gICAgICBtYXRjaDogWy9eXFxTK0BcXFMrXFwuXFxTKyQvLCAnUGxlYXNlIHByb3ZpZGUgYSB2YWxpZCBlbWFpbCddLFxyXG4gICAgfSxcclxuICAgIHBhc3N3b3JkSGFzaDoge1xyXG4gICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgIHJlcXVpcmVkOiBbdHJ1ZSwgJ1Bhc3N3b3JkIGlzIHJlcXVpcmVkJ10sXHJcbiAgICB9LFxyXG4gICAgcm9sZToge1xyXG4gICAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICAgIGVudW06IFsnYWRtaW4nLCAndXNlciddLFxyXG4gICAgICBkZWZhdWx0OiAndXNlcicsXHJcbiAgICB9LFxyXG4gICAgaXNBY3RpdmU6IHtcclxuICAgICAgdHlwZTogQm9vbGVhbixcclxuICAgICAgZGVmYXVsdDogdHJ1ZSxcclxuICAgIH0sXHJcbiAgfSxcclxuICB7XHJcbiAgICB0aW1lc3RhbXBzOiB0cnVlLCAvLyBBdXRvbWF0aWNhbGx5IGFkZHMgY3JlYXRlZEF0IGFuZCB1cGRhdGVkQXRcclxuICB9XHJcbik7XHJcblxyXG4vLyBJbmRleCBmb3IgZmFzdGVyIGVtYWlsIGxvb2t1cHNcclxudXNlclNjaGVtYS5pbmRleCh7IGVtYWlsOiAxIH0pO1xyXG5cclxuLy8gRG9uJ3QgcmV0dXJuIHBhc3N3b3JkIGhhc2ggaW4gSlNPTiByZXNwb25zZXNcclxudXNlclNjaGVtYS5zZXQoJ3RvSlNPTicsIHtcclxuICB0cmFuc2Zvcm06IChkb2MsIHJldCkgPT4ge1xyXG4gICAgZGVsZXRlIHJldC5wYXNzd29yZEhhc2g7XHJcbiAgICBkZWxldGUgcmV0Ll9fdjtcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgVXNlciA9IG1vbmdvb3NlLm1vZGVsPElVc2VyPignVXNlcicsIHVzZXJTY2hlbWEpO1xyXG4iXX0=