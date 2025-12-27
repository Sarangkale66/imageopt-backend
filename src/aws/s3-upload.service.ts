// aws/s3-upload.service.ts
// Direct S3 upload (not presigned URL)

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';
import crypto from 'crypto';

export class S3UploadService {
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
   * Upload file buffer directly to S3
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    userId: string,
    folder?: string,
    customFileName?: string
  ): Promise<{ s3Key: string; s3Bucket: string }> {
    // Generate S3 key
    let s3Key: string;

    if (folder && customFileName) {
      const sanitizedFolder = this.sanitizePath(folder);
      s3Key = `${userId}/${sanitizedFolder}/${customFileName}`;
    } else if (folder) {
      const sanitizedFolder = this.sanitizePath(folder);
      const timestamp = Date.now();
      const randomId = crypto.randomBytes(8).toString('hex');
      const extension = this.getFileExtension(fileName);
      s3Key = `${userId}/${sanitizedFolder}/${timestamp}-${randomId}${extension}`;
    } else {
      const timestamp = Date.now();
      const randomId = crypto.randomBytes(8).toString('hex');
      const extension = this.getFileExtension(fileName);
      s3Key = `users/${userId}/${timestamp}-${randomId}${extension}`;
    }

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: env.S3_ORIGINAL_BUCKET,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: mimeType,
      Metadata: {
        uploadedBy: userId,
        originalName: fileName,
      },
    });

    await this.s3Client.send(command);

    return {
      s3Key,
      s3Bucket: env.S3_ORIGINAL_BUCKET,
    };
  }

  /**
   * Sanitize folder path
   */
  private sanitizePath(path: string): string {
    return path
      .replace(/[^a-zA-Z0-9-_/]/g, '-')
      .replace(/\.\.+/g, '')
      .replace(/^\/+|\/+$/g, '')
      .toLowerCase();
  }

  /**
   * Get file extension
   */
  private getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) return '';
    return fileName.substring(lastDotIndex);
  }
}
