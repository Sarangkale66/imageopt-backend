"use strict";
// services/cleanup.service.ts
// Scheduled cleanup service for deleting old assets from S3
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupService = void 0;
const asset_model_1 = require("../assets/asset.model");
const s3_delete_service_1 = require("../aws/s3-delete.service");
const env_1 = require("../config/env");
class CleanupService {
    constructor() {
        this.s3DeleteService = new s3_delete_service_1.S3DeleteService();
    }
    /**
     * Delete assets from S3 that were soft-deleted more than ASSET_RETENTION_HOURS ago
     */
    async cleanupOldDeletedAssets() {
        console.log('🧹 Starting cleanup job...');
        // Calculate retention time from env (default 90 hours)
        const retentionHours = env_1.env.ASSET_RETENTION_HOURS;
        const retentionAgo = new Date(Date.now() - retentionHours * 60 * 60 * 1000);
        console.log(`⏰ Retention period: ${retentionHours} hours`);
        // Find soft-deleted assets older than retention period
        const oldDeletedAssets = await asset_model_1.Asset.find({
            isDeleted: true,
            updatedAt: { $lt: retentionAgo },
        });
        console.log(`📊 Found ${oldDeletedAssets.length} assets to cleanup`);
        if (oldDeletedAssets.length === 0) {
            return { checked: 0, deletedFromS3: 0, deletedFromDB: 0, errors: 0 };
        }
        let deletedFromS3 = 0;
        let deletedFromDB = 0;
        let errors = 0;
        for (const asset of oldDeletedAssets) {
            try {
                // Delete from S3
                const s3Deleted = await this.s3DeleteService.deleteFile(asset.s3Bucket, asset.s3Key);
                if (s3Deleted) {
                    deletedFromS3++;
                    // Permanently delete from MongoDB
                    await asset_model_1.Asset.findByIdAndDelete(asset._id);
                    deletedFromDB++;
                    console.log(`✅ Cleaned up: ${asset.name} (${asset.s3Key})`);
                }
                else {
                    errors++;
                    console.error(`❌ Failed to delete from S3: ${asset.s3Key}`);
                }
            }
            catch (error) {
                errors++;
                console.error(`❌ Error cleaning up asset ${asset._id}:`, error.message);
            }
        }
        console.log(`
🧹 Cleanup Summary:
   - Checked: ${oldDeletedAssets.length} assets
   - Deleted from S3: ${deletedFromS3}
   - Deleted from MongoDB: ${deletedFromDB}
   - Errors: ${errors}
    `);
        return {
            checked: oldDeletedAssets.length,
            deletedFromS3,
            deletedFromDB,
            errors,
        };
    }
    /**
     * Manual trigger for cleanup (for testing)
     */
    async triggerManualCleanup() {
        return this.cleanupOldDeletedAssets();
    }
}
exports.CleanupService = CleanupService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xlYW51cC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xlYW51cC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSw4QkFBOEI7QUFDOUIsNERBQTREOzs7QUFFNUQsdURBQThDO0FBQzlDLGdFQUEyRDtBQUMzRCx1Q0FBb0M7QUFFcEMsTUFBYSxjQUFjO0lBR3pCO1FBQ0UsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLG1DQUFlLEVBQUUsQ0FBQztJQUMvQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsdUJBQXVCO1FBTTNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUUxQyx1REFBdUQ7UUFDdkQsTUFBTSxjQUFjLEdBQUcsU0FBRyxDQUFDLHFCQUFxQixDQUFDO1FBQ2pELE1BQU0sWUFBWSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxjQUFjLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUU1RSxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixjQUFjLFFBQVEsQ0FBQyxDQUFDO1FBRTNELHVEQUF1RDtRQUN2RCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sbUJBQUssQ0FBQyxJQUFJLENBQUM7WUFDeEMsU0FBUyxFQUFFLElBQUk7WUFDZixTQUFTLEVBQUUsRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFO1NBQ2pDLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxnQkFBZ0IsQ0FBQyxNQUFNLG9CQUFvQixDQUFDLENBQUM7UUFFckUsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDbEMsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUN2RSxDQUFDO1FBRUQsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQztRQUN0QixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFFZixLQUFLLE1BQU0sS0FBSyxJQUFJLGdCQUFnQixFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDO2dCQUNILGlCQUFpQjtnQkFDakIsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FDckQsS0FBSyxDQUFDLFFBQVEsRUFDZCxLQUFLLENBQUMsS0FBSyxDQUNaLENBQUM7Z0JBRUYsSUFBSSxTQUFTLEVBQUUsQ0FBQztvQkFDZCxhQUFhLEVBQUUsQ0FBQztvQkFFaEIsa0NBQWtDO29CQUNsQyxNQUFNLG1CQUFLLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN6QyxhQUFhLEVBQUUsQ0FBQztvQkFFaEIsT0FBTyxDQUFDLEdBQUcsQ0FDVCxpQkFBaUIsS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQy9DLENBQUM7Z0JBQ0osQ0FBQztxQkFBTSxDQUFDO29CQUNOLE1BQU0sRUFBRSxDQUFDO29CQUNULE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUM5RCxDQUFDO1lBQ0gsQ0FBQztZQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7Z0JBQ3BCLE1BQU0sRUFBRSxDQUFDO2dCQUNULE9BQU8sQ0FBQyxLQUFLLENBQ1gsNkJBQTZCLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFDekMsS0FBSyxDQUFDLE9BQU8sQ0FDZCxDQUFDO1lBQ0osQ0FBQztRQUNILENBQUM7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDOztnQkFFQSxnQkFBZ0IsQ0FBQyxNQUFNO3dCQUNmLGFBQWE7NkJBQ1IsYUFBYTtlQUMzQixNQUFNO0tBQ2hCLENBQUMsQ0FBQztRQUVILE9BQU87WUFDTCxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsTUFBTTtZQUNoQyxhQUFhO1lBQ2IsYUFBYTtZQUNiLE1BQU07U0FDUCxDQUFDO0lBQ0osQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLG9CQUFvQjtRQUN4QixPQUFPLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0lBQ3hDLENBQUM7Q0FDRjtBQTdGRCx3Q0E2RkMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBzZXJ2aWNlcy9jbGVhbnVwLnNlcnZpY2UudHNcclxuLy8gU2NoZWR1bGVkIGNsZWFudXAgc2VydmljZSBmb3IgZGVsZXRpbmcgb2xkIGFzc2V0cyBmcm9tIFMzXHJcblxyXG5pbXBvcnQgeyBBc3NldCB9IGZyb20gJy4uL2Fzc2V0cy9hc3NldC5tb2RlbCc7XHJcbmltcG9ydCB7IFMzRGVsZXRlU2VydmljZSB9IGZyb20gJy4uL2F3cy9zMy1kZWxldGUuc2VydmljZSc7XHJcbmltcG9ydCB7IGVudiB9IGZyb20gJy4uL2NvbmZpZy9lbnYnO1xyXG5cclxuZXhwb3J0IGNsYXNzIENsZWFudXBTZXJ2aWNlIHtcclxuICBwcml2YXRlIHMzRGVsZXRlU2VydmljZTogUzNEZWxldGVTZXJ2aWNlO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuczNEZWxldGVTZXJ2aWNlID0gbmV3IFMzRGVsZXRlU2VydmljZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGVsZXRlIGFzc2V0cyBmcm9tIFMzIHRoYXQgd2VyZSBzb2Z0LWRlbGV0ZWQgbW9yZSB0aGFuIEFTU0VUX1JFVEVOVElPTl9IT1VSUyBhZ29cclxuICAgKi9cclxuICBhc3luYyBjbGVhbnVwT2xkRGVsZXRlZEFzc2V0cygpOiBQcm9taXNlPHtcclxuICAgIGNoZWNrZWQ6IG51bWJlcjtcclxuICAgIGRlbGV0ZWRGcm9tUzM6IG51bWJlcjtcclxuICAgIGRlbGV0ZWRGcm9tREI6IG51bWJlcjtcclxuICAgIGVycm9yczogbnVtYmVyO1xyXG4gIH0+IHtcclxuICAgIGNvbnNvbGUubG9nKCfwn6e5IFN0YXJ0aW5nIGNsZWFudXAgam9iLi4uJyk7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHJldGVudGlvbiB0aW1lIGZyb20gZW52IChkZWZhdWx0IDkwIGhvdXJzKVxyXG4gICAgY29uc3QgcmV0ZW50aW9uSG91cnMgPSBlbnYuQVNTRVRfUkVURU5USU9OX0hPVVJTO1xyXG4gICAgY29uc3QgcmV0ZW50aW9uQWdvID0gbmV3IERhdGUoRGF0ZS5ub3coKSAtIHJldGVudGlvbkhvdXJzICogNjAgKiA2MCAqIDEwMDApO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKGDij7AgUmV0ZW50aW9uIHBlcmlvZDogJHtyZXRlbnRpb25Ib3Vyc30gaG91cnNgKTtcclxuXHJcbiAgICAvLyBGaW5kIHNvZnQtZGVsZXRlZCBhc3NldHMgb2xkZXIgdGhhbiByZXRlbnRpb24gcGVyaW9kXHJcbiAgICBjb25zdCBvbGREZWxldGVkQXNzZXRzID0gYXdhaXQgQXNzZXQuZmluZCh7XHJcbiAgICAgIGlzRGVsZXRlZDogdHJ1ZSxcclxuICAgICAgdXBkYXRlZEF0OiB7ICRsdDogcmV0ZW50aW9uQWdvIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyhg8J+TiiBGb3VuZCAke29sZERlbGV0ZWRBc3NldHMubGVuZ3RofSBhc3NldHMgdG8gY2xlYW51cGApO1xyXG5cclxuICAgIGlmIChvbGREZWxldGVkQXNzZXRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICByZXR1cm4geyBjaGVja2VkOiAwLCBkZWxldGVkRnJvbVMzOiAwLCBkZWxldGVkRnJvbURCOiAwLCBlcnJvcnM6IDAgfTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGVsZXRlZEZyb21TMyA9IDA7XHJcbiAgICBsZXQgZGVsZXRlZEZyb21EQiA9IDA7XHJcbiAgICBsZXQgZXJyb3JzID0gMDtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGFzc2V0IG9mIG9sZERlbGV0ZWRBc3NldHMpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICAvLyBEZWxldGUgZnJvbSBTM1xyXG4gICAgICAgIGNvbnN0IHMzRGVsZXRlZCA9IGF3YWl0IHRoaXMuczNEZWxldGVTZXJ2aWNlLmRlbGV0ZUZpbGUoXHJcbiAgICAgICAgICBhc3NldC5zM0J1Y2tldCxcclxuICAgICAgICAgIGFzc2V0LnMzS2V5XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKHMzRGVsZXRlZCkge1xyXG4gICAgICAgICAgZGVsZXRlZEZyb21TMysrO1xyXG5cclxuICAgICAgICAgIC8vIFBlcm1hbmVudGx5IGRlbGV0ZSBmcm9tIE1vbmdvREJcclxuICAgICAgICAgIGF3YWl0IEFzc2V0LmZpbmRCeUlkQW5kRGVsZXRlKGFzc2V0Ll9pZCk7XHJcbiAgICAgICAgICBkZWxldGVkRnJvbURCKys7XHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2coXHJcbiAgICAgICAgICAgIGDinIUgQ2xlYW5lZCB1cDogJHthc3NldC5uYW1lfSAoJHthc3NldC5zM0tleX0pYFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZXJyb3JzKys7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGDinYwgRmFpbGVkIHRvIGRlbGV0ZSBmcm9tIFMzOiAke2Fzc2V0LnMzS2V5fWApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIGVycm9ycysrO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICBg4p2MIEVycm9yIGNsZWFuaW5nIHVwIGFzc2V0ICR7YXNzZXQuX2lkfTpgLFxyXG4gICAgICAgICAgZXJyb3IubWVzc2FnZVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zb2xlLmxvZyhgXHJcbvCfp7kgQ2xlYW51cCBTdW1tYXJ5OlxyXG4gICAtIENoZWNrZWQ6ICR7b2xkRGVsZXRlZEFzc2V0cy5sZW5ndGh9IGFzc2V0c1xyXG4gICAtIERlbGV0ZWQgZnJvbSBTMzogJHtkZWxldGVkRnJvbVMzfVxyXG4gICAtIERlbGV0ZWQgZnJvbSBNb25nb0RCOiAke2RlbGV0ZWRGcm9tREJ9XHJcbiAgIC0gRXJyb3JzOiAke2Vycm9yc31cclxuICAgIGApO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNoZWNrZWQ6IG9sZERlbGV0ZWRBc3NldHMubGVuZ3RoLFxyXG4gICAgICBkZWxldGVkRnJvbVMzLFxyXG4gICAgICBkZWxldGVkRnJvbURCLFxyXG4gICAgICBlcnJvcnMsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFudWFsIHRyaWdnZXIgZm9yIGNsZWFudXAgKGZvciB0ZXN0aW5nKVxyXG4gICAqL1xyXG4gIGFzeW5jIHRyaWdnZXJNYW51YWxDbGVhbnVwKCk6IFByb21pc2U8YW55PiB7XHJcbiAgICByZXR1cm4gdGhpcy5jbGVhbnVwT2xkRGVsZXRlZEFzc2V0cygpO1xyXG4gIH1cclxufVxyXG4iXX0=