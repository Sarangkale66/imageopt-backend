// services/cron.service.ts
// Cron jobs scheduler

import cron from 'node-cron';
import { CleanupService } from './cleanup.service';

export class CronService {
  private cleanupService: CleanupService;

  constructor() {
    this.cleanupService = new CleanupService();
  }

  /**
   * Start all cron jobs
   */
  startCronJobs(): void {
    console.log('⏰ Starting cron jobs...');

    // Run cleanup every 6 hours
    // Cron: "0 */6 * * *" = Every 6 hours at minute 0
    cron.schedule('0 */6 * * *', async () => {
      console.log('⏰ [CRON] Running scheduled cleanup...');
      try {
        await this.cleanupService.cleanupOldDeletedAssets();
      } catch (error: any) {
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
  async runCleanupNow(): Promise<any> {
    console.log('🧹 Running manual cleanup...');
    return this.cleanupService.cleanupOldDeletedAssets();
  }
}
