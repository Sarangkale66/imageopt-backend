// aws/cloudfront.service.ts
// CloudFront cache invalidation service

import { 
  CloudFrontClient, 
  CreateInvalidationCommand,
  GetInvalidationCommand 
} from '@aws-sdk/client-cloudfront';
import { env } from '../config/env';

export class CloudFrontService {
  private cloudFrontClient: CloudFrontClient;
  private distributionId: string;

  constructor() {
    this.cloudFrontClient = new CloudFrontClient({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.distributionId = env.CLOUDFRONT_DISTRIBUTION_ID;
  }

  /**
   * Check if CloudFront invalidation is configured
   */
  isConfigured(): boolean {
    return !!this.distributionId;
  }

  /**
   * Invalidate cache for specific paths
   * @param paths Array of paths to invalidate (e.g., ['/userId/products/image.jpg/*'])
   * @returns Invalidation ID
   */
  async invalidatePaths(paths: string[]): Promise<{ invalidationId: string; status: string }> {
    if (!this.isConfigured()) {
      throw new Error('CloudFront invalidation not configured. Set CLOUDFRONT_DISTRIBUTION_ID.');
    }

    // Ensure paths start with /
    const normalizedPaths = paths.map(p => p.startsWith('/') ? p : `/${p}`);

    const command = new CreateInvalidationCommand({
      DistributionId: this.distributionId,
      InvalidationBatch: {
        CallerReference: `inv-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        Paths: {
          Quantity: normalizedPaths.length,
          Items: normalizedPaths,
        },
      },
    });

    const response = await this.cloudFrontClient.send(command);

    return {
      invalidationId: response.Invalidation?.Id || '',
      status: response.Invalidation?.Status || 'Unknown',
    };
  }

  /**
   * Invalidate cache for a specific asset (all transformations)
   * Handles URL rewrite format: /{country}/{device}/{s3Key}/{operations}
   * @param s3Key The S3 key of the asset
   * @returns Invalidation result
   */
  async invalidateAsset(s3Key: string): Promise<{ invalidationId: string; status: string; paths: string[] }> {
    // Country and device combinations from URL rewrite function
    const countries = ['in', 'us', 'eu'];
    const devices = ['d', 'm']; // d=desktop, m=mobile
    
    const paths: string[] = [];
    
    // Generate paths for all country/device combinations
    // URL rewrite format: /{country}/{device}/{originalPath}/{operations}
    for (const country of countries) {
      for (const device of devices) {
        // Base path with all transformations
        paths.push(`/${country}/${device}/${s3Key}/*`);
      }
    }
    
    // Also invalidate without country/device prefix (in case direct access)
    paths.push(`/${s3Key}`);
    paths.push(`/${s3Key}/*`);

    const result = await this.invalidatePaths(paths);
    return { ...result, paths };
  }

  /**
   * Get invalidation status
   */
  async getInvalidationStatus(invalidationId: string): Promise<{ status: string; createTime: Date | undefined }> {
    if (!this.isConfigured()) {
      throw new Error('CloudFront invalidation not configured.');
    }

    const command = new GetInvalidationCommand({
      DistributionId: this.distributionId,
      Id: invalidationId,
    });

    const response = await this.cloudFrontClient.send(command);

    return {
      status: response.Invalidation?.Status || 'Unknown',
      createTime: response.Invalidation?.CreateTime,
    };
  }

  /**
   * Invalidate all assets in a folder
   * @param userId User ID
   * @param folder Folder name
   */
  async invalidateFolder(userId: string, folder: string): Promise<{ invalidationId: string; status: string; path: string }> {
    const path = `/${userId}/${folder}/*`;
    const result = await this.invalidatePaths([path]);
    return { ...result, path };
  }

  /**
   * Invalidate all user's assets
   * @param userId User ID
   */
  async invalidateUserAssets(userId: string): Promise<{ invalidationId: string; status: string; path: string }> {
    const path = `/${userId}/*`;
    const result = await this.invalidatePaths([path]);
    return { ...result, path };
  }
}
