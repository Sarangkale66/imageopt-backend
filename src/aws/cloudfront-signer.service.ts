// aws/cloudfront-signer.service.ts
// Service for generating CloudFront signed URLs for secure asset delivery

import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { env } from '../config/env';

export class CloudFrontSignerService {
  private keyPairId: string;
  private privateKey: string;
  private defaultExpirySeconds: number;

  constructor() {
    this.keyPairId = env.CLOUDFRONT_KEY_PAIR_ID;
    this.privateKey = env.CLOUDFRONT_PRIVATE_KEY;
    this.defaultExpirySeconds = env.SIGNED_URL_EXPIRY_SECONDS;
  }

  /**
   * Check if signed URLs are configured
   * Returns true if both key pair ID and private key are set
   */
  isConfigured(): boolean {
    return !!(this.keyPairId && this.privateKey);
  }

  /**
   * Generate a signed CloudFront URL
   * @param cloudfrontUrl The CloudFront URL to sign (e.g., https://d123.cloudfront.net/image.jpg)
   * @param expiresInSeconds Optional custom expiry time (default: 3600 seconds / 1 hour)
   * @returns Object containing signed URL and expiry information
   */
  generateSignedUrl(
    cloudfrontUrl: string,
    expiresInSeconds?: number
  ): {
    signedUrl: string;
    expiresAt: Date;
    expiresInSeconds: number;
  } {
    if (!this.isConfigured()) {
      throw new Error(
        'CloudFront signed URLs not configured. Set CLOUDFRONT_KEY_PAIR_ID and CLOUDFRONT_PRIVATE_KEY environment variables.'
      );
    }

    // Calculate expiry time
    const expiry = expiresInSeconds ?? this.defaultExpirySeconds;
    
    // Enforce maximum expiry of 7 days (604800 seconds)
    const maxExpiry = 604800;
    const actualExpiry = Math.min(expiry, maxExpiry);
    
    const expiresAt = new Date(Date.now() + actualExpiry * 1000);

    // Generate signed URL using AWS SDK
    const signedUrl = getSignedUrl({
      url: cloudfrontUrl,
      keyPairId: this.keyPairId,
      privateKey: this.privateKey,
      dateLessThan: expiresAt.toISOString(),
    });

    return {
      signedUrl,
      expiresAt,
      expiresInSeconds: actualExpiry,
    };
  }

  /**
   * Generate a signed URL for an S3 key
   * Convenience method that constructs the CloudFront URL from the S3 key
   * @param s3Key The S3 key (e.g., users/123/image.jpg)
   * @param expiresInSeconds Optional custom expiry time
   */
  generateSignedUrlForS3Key(
    s3Key: string,
    expiresInSeconds?: number
  ): {
    signedUrl: string;
    expiresAt: Date;
    expiresInSeconds: number;
  } {
    const cloudfrontUrl = `https://${env.CLOUDFRONT_DOMAIN}/${s3Key}`;
    return this.generateSignedUrl(cloudfrontUrl, expiresInSeconds);
  }
}
