// services/cleanup.service.ts
// Scheduled cleanup service for deleting old assets from S3

import { Asset } from '../assets/asset.model';
import { S3DeleteService } from '../aws/s3-delete.service';
import { env } from '../config/env';

export class CleanupService {
  private s3DeleteService: S3DeleteService;

  constructor() {
    this.s3DeleteService = new S3DeleteService();
  }

  /**
   * Delete assets from S3 that were soft-deleted more than ASSET_RETENTION_HOURS ago
   */
  async cleanupOldDeletedAssets(): Promise<{
    checked: number;
    deletedFromS3: number;
    deletedFromDB: number;
    errors: number;
  }> {
    console.log('🧹 Starting cleanup job...');

    // Calculate retention time from env (default 90 hours)
    const retentionHours = env.ASSET_RETENTION_HOURS;
    const retentionAgo = new Date(Date.now() - retentionHours * 60 * 60 * 1000);

    console.log(`⏰ Retention period: ${retentionHours} hours`);

    // Find soft-deleted assets older than retention period
    const oldDeletedAssets = await Asset.find({
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
        const s3Deleted = await this.s3DeleteService.deleteFile(
          asset.s3Bucket,
          asset.s3Key
        );

        if (s3Deleted) {
          deletedFromS3++;

          // Permanently delete from MongoDB
          await Asset.findByIdAndDelete(asset._id);
          deletedFromDB++;

          console.log(
            `✅ Cleaned up: ${asset.name} (${asset.s3Key})`
          );
        } else {
          errors++;
          console.error(`❌ Failed to delete from S3: ${asset.s3Key}`);
        }
      } catch (error: any) {
        errors++;
        console.error(
          `❌ Error cleaning up asset ${asset._id}:`,
          error.message
        );
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
  async triggerManualCleanup(): Promise<any> {
    return this.cleanupOldDeletedAssets();
  }
}
