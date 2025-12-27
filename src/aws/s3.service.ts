// aws/s3.service.ts
// S3 service for presigned URL generation

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';
import crypto from 'crypto';

export class S3Service {
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
   * Generate presigned URL for S3 upload
   * @param fileName Original file name
   * @param fileType MIME type
   * @param fileSizeBytes File size in bytes
   * @param userId User ID for organizing files
   * @param customFolder Optional custom folder name (e.g., 'profile-images', 'products')
   * @param customFileName Optional custom filename (if not provided, uses original fileName)
   */
  async generatePresignedUploadUrl(
    fileName: string,
    fileType: string,
    fileSizeBytes: number,
    userId: string,
    customFolder?: string,
    customFileName?: string
  ): Promise<{ uploadUrl: string; s3Key: string; s3Bucket: string }> {
    // Validate file size
    const maxSizeBytes = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;
    if (fileSizeBytes > maxSizeBytes) {
      throw new Error(`File size exceeds maximum of ${env.MAX_UPLOAD_SIZE_MB}MB`);
    }

    // Generate S3 key with custom folder support
    let s3Key: string;
    
    if (customFolder && customFileName) {
      // User-specified folder and filename: {userId}/{customFolder}/{customFileName}
      const sanitizedFolder = this.sanitizePath(customFolder);
      const sanitizedFileName = customFileName || fileName;
      s3Key = `${userId}/${sanitizedFolder}/${sanitizedFileName}`;
    } else if (customFolder) {
      // Custom folder with auto-generated filename
      const sanitizedFolder = this.sanitizePath(customFolder);
      const timestamp = Date.now();
      const randomId = crypto.randomBytes(8).toString('hex');
      const extension = this.getFileExtension(fileName);
      s3Key = `${userId}/${sanitizedFolder}/${timestamp}-${randomId}${extension}`;
    } else {
      // Default: users/{userId}/{timestamp}-{random}{ext}
      const timestamp = Date.now();
      const randomId = crypto.randomBytes(8).toString('hex');
      const extension = this.getFileExtension(fileName);
      s3Key = `users/${userId}/${timestamp}-${randomId}${extension}`;
    }

    // Create presigned URL for PUT operation
    const command = new PutObjectCommand({
      Bucket: env.S3_ORIGINAL_BUCKET,
      Key: s3Key,
      ContentType: fileType,
      // Optional: Add metadata
      Metadata: {
        uploadedBy: userId,
        originalName: fileName,
      },
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: env.PRESIGNED_URL_EXPIRY_SECONDS, // 15 minutes default
    });

    return {
      uploadUrl,
      s3Key,
      s3Bucket: env.S3_ORIGINAL_BUCKET,
    };
  }

  /**
   * Generate CloudFront URL for an S3 key
   */
  generateCloudfrontUrl(s3Key: string): string {
    return `https://${env.CLOUDFRONT_DOMAIN}/${s3Key}`;
  }

  /**
   * Sanitize folder path (remove dangerous characters)
   */
  private sanitizePath(path: string): string {
    return path
      .replace(/[^a-zA-Z0-9-_/]/g, '-') // Replace special chars with dash
      .replace(/\.\.+/g, '') // Remove parent directory references
      .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
      .toLowerCase();
  }

  /**
   * Extract file extension from filename
   */
  private getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) return '';
    return fileName.substring(lastDotIndex);
  }

  /**
   * Determine asset type from MIME type
   */
  getAssetType(mimeType: string): 'image' | 'video' | 'file' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'file';
  }
}
