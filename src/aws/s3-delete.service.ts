// aws/s3-delete.service.ts
// S3 file deletion service

import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';

export class S3DeleteService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * Delete file from S3
   */
  async deleteFile(bucket: string, key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      console.log(`✅ Deleted from S3: ${key}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Failed to delete from S3: ${key}`, error.message);
      return false;
    }
  }

  /**
   * Delete multiple files from S3
   */
  async deleteMultipleFiles(
    files: Array<{ bucket: string; key: string }>
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const file of files) {
      const deleted = await this.deleteFile(file.bucket, file.key);
      if (deleted) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }
}
