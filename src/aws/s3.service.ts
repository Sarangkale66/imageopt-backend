// aws/s3.service.ts
// S3 service for presigned URL generation and object operations

import { 
  S3Client, 
  PutObjectCommand, 
  CopyObjectCommand, 
  DeleteObjectCommand 
} from '@aws-sdk/client-s3';
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

    // Block 'private' folder - assets should be moved to private via make-private API
    if (customFolder) {
      const lowerFolder = customFolder.toLowerCase();
      if (lowerFolder === 'private' || lowerFolder.startsWith('private/') || lowerFolder.includes('/private/')) {
        throw new Error("Cannot upload directly to 'private' folder. Upload to a regular folder first, then use /make-private API.");
      }
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
      // Default: {userId}/uploads/{timestamp}-{random}{ext}
      const timestamp = Date.now();
      const randomId = crypto.randomBytes(8).toString('hex');
      const extension = this.getFileExtension(fileName);
      s3Key = `${userId}/uploads/${timestamp}-${randomId}${extension}`;
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
   * Generate CloudFront URL for an S3 key (includes format based on extension)
   */
  generateCloudfrontUrl(s3Key: string): string {
    // Extract file extension and map to format
    const fileName = s3Key.split('/').pop() || '';
    const ext = fileName.split('.').pop()?.toLowerCase() || 'jpeg';
    
    const formatMap: Record<string, string> = {
      'jpg': 'jpeg',
      'jpeg': 'jpeg',
      'png': 'png',
      'webp': 'webp',
      'avif': 'avif',
      'gif': 'gif',
    };
    const format = formatMap[ext] || 'jpeg';
    
    return `https://${env.CLOUDFRONT_DOMAIN}/${s3Key}/format=${format}`;
  }

  /**
   * Get CloudFront domain for URL construction
   */
  getCloudfrontDomain(): string {
    return env.CLOUDFRONT_DOMAIN;
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

  /**
   * Move object from one S3 key to another (copy + delete)
   */
  async moveObject(sourceKey: string, destinationKey: string): Promise<void> {
    const bucket = env.S3_ORIGINAL_BUCKET;
    
    // Step 1: Copy to new location
    await this.s3Client.send(new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${sourceKey}`,
      Key: destinationKey,
    }));
    
    // Step 2: Delete original
    await this.s3Client.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: sourceKey,
    }));
  }

  /**
   * Move asset to private folder
   * /userId/folder/image.jpg → /userId/private/image.jpg
   * Returns new S3 key
   */
  async moveToPrivate(currentS3Key: string): Promise<{ newS3Key: string; originalFolder: string }> {
    const parts = currentS3Key.split('/');
    const fileName = parts.pop() || '';
    const userId = parts[0];
    const originalFolder = parts.slice(1).join('/'); // e.g., "products" or "products/sub"
    
    // New path: userId/private/fileName
    const newS3Key = `${userId}/private/${fileName}`;
    
    // Check if already in private
    if (originalFolder === 'private' || parts.includes('private')) {
      throw new Error('Asset is already in private folder');
    }
    
    await this.moveObject(currentS3Key, newS3Key);
    
    return { newS3Key, originalFolder };
  }

  /**
   * Move asset from private to public folder
   * /userId/private/image.jpg → /userId/targetFolder/image.jpg
   * Returns new S3 key
   */
  async moveToPublic(currentS3Key: string, targetFolder: string = 'public'): Promise<string> {
    const parts = currentS3Key.split('/');
    const fileName = parts.pop() || '';
    const userId = parts[0];
    
    // Validate it's in private folder
    if (!parts.includes('private')) {
      throw new Error('Asset is not in private folder');
    }
    
    // Sanitize target folder
    const sanitizedFolder = this.sanitizePath(targetFolder);
    
    // New path: userId/targetFolder/fileName
    const newS3Key = `${userId}/${sanitizedFolder}/${fileName}`;
    
    await this.moveObject(currentS3Key, newS3Key);
    
    return newS3Key;
  }
}
