"use strict";
// services/cron.service.ts
// Cron jobs scheduler
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronService = void 0;
const node_cron_1 = require("node-cron");
const cleanup_service_1 = require("./cleanup.service");
class CronService {
    constructor() {
        this.cleanupService = new cleanup_service_1.CleanupService();
    }
    /**
     * Start all cron jobs
     */
    startCronJobs() {
        console.log('⏰ Starting cron jobs...');
        // Run cleanup every 6 hours
        // Cron: "0 */6 * * *" = Every 6 hours at minute 0
        node_cron_1.default.schedule('0 */6 * * *', async () => {
            console.log('⏰ [CRON] Running scheduled cleanup...');
            try {
                await this.cleanupService.cleanupOldDeletedAssets();
            }
            catch (error) {
                console.error('❌ [CRON] Cleanup failed:', error.message);
            }
        });
        console.log('✅ Cron jobs started:');
        console.log('   - Cleanup job: Every 6 hours');
        console.log('   - Assets older than 90 hours will be deleted from S3');
    }
    /**
     * For testing: Run cleanup immediately
     */
    async runCleanupNow() {
        console.log('🧹 Running manual cleanup...');
        return this.cleanupService.cleanupOldDeletedAssets();
    }
}
exports.CronService = CronService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Jvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3Jvbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwyQkFBMkI7QUFDM0Isc0JBQXNCOzs7QUFFdEIseUNBQTZCO0FBQzdCLHVEQUFtRDtBQUVuRCxNQUFhLFdBQVc7SUFHdEI7UUFDRSxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksZ0NBQWMsRUFBRSxDQUFDO0lBQzdDLENBQUM7SUFFRDs7T0FFRztJQUNILGFBQWE7UUFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFFdkMsNEJBQTRCO1FBQzVCLGtEQUFrRDtRQUNsRCxtQkFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQztnQkFDSCxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUN0RCxDQUFDO1lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztnQkFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0QsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLGFBQWE7UUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1FBQzVDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0lBQ3ZELENBQUM7Q0FDRjtBQXBDRCxrQ0FvQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBzZXJ2aWNlcy9jcm9uLnNlcnZpY2UudHNcclxuLy8gQ3JvbiBqb2JzIHNjaGVkdWxlclxyXG5cclxuaW1wb3J0IGNyb24gZnJvbSAnbm9kZS1jcm9uJztcclxuaW1wb3J0IHsgQ2xlYW51cFNlcnZpY2UgfSBmcm9tICcuL2NsZWFudXAuc2VydmljZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQ3JvblNlcnZpY2Uge1xyXG4gIHByaXZhdGUgY2xlYW51cFNlcnZpY2U6IENsZWFudXBTZXJ2aWNlO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuY2xlYW51cFNlcnZpY2UgPSBuZXcgQ2xlYW51cFNlcnZpY2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0YXJ0IGFsbCBjcm9uIGpvYnNcclxuICAgKi9cclxuICBzdGFydENyb25Kb2JzKCk6IHZvaWQge1xyXG4gICAgY29uc29sZS5sb2coJ+KPsCBTdGFydGluZyBjcm9uIGpvYnMuLi4nKTtcclxuXHJcbiAgICAvLyBSdW4gY2xlYW51cCBldmVyeSA2IGhvdXJzXHJcbiAgICAvLyBDcm9uOiBcIjAgKi82ICogKiAqXCIgPSBFdmVyeSA2IGhvdXJzIGF0IG1pbnV0ZSAwXHJcbiAgICBjcm9uLnNjaGVkdWxlKCcwICovNiAqICogKicsIGFzeW5jICgpID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ+KPsCBbQ1JPTl0gUnVubmluZyBzY2hlZHVsZWQgY2xlYW51cC4uLicpO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IHRoaXMuY2xlYW51cFNlcnZpY2UuY2xlYW51cE9sZERlbGV0ZWRBc3NldHMoKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBbQ1JPTl0gQ2xlYW51cCBmYWlsZWQ6JywgZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnNvbGUubG9nKCfinIUgQ3JvbiBqb2JzIHN0YXJ0ZWQ6Jyk7XHJcbiAgICBjb25zb2xlLmxvZygnICAgLSBDbGVhbnVwIGpvYjogRXZlcnkgNiBob3VycycpO1xyXG4gICAgY29uc29sZS5sb2coJyAgIC0gQXNzZXRzIG9sZGVyIHRoYW4gOTAgaG91cnMgd2lsbCBiZSBkZWxldGVkIGZyb20gUzMnKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZvciB0ZXN0aW5nOiBSdW4gY2xlYW51cCBpbW1lZGlhdGVseVxyXG4gICAqL1xyXG4gIGFzeW5jIHJ1bkNsZWFudXBOb3coKTogUHJvbWlzZTxhbnk+IHtcclxuICAgIGNvbnNvbGUubG9nKCfwn6e5IFJ1bm5pbmcgbWFudWFsIGNsZWFudXAuLi4nKTtcclxuICAgIHJldHVybiB0aGlzLmNsZWFudXBTZXJ2aWNlLmNsZWFudXBPbGREZWxldGVkQXNzZXRzKCk7XHJcbiAgfVxyXG59XHJcbiJdfQ==