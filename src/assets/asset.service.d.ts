import { IAsset } from './asset.model';
export declare class AssetService {
    /**
     * Create new asset
     */
    create(ownerId: string, name: string, type: 'image' | 'video' | 'file', s3Bucket: string, s3Key: string, cloudfrontUrl: string, sizeBytes: number, metadata?: {
        width?: number;
        height?: number;
        format?: string;
    }): Promise<IAsset>;
    /**
     * Get user's assets (excluding deleted)
     */
    getUserAssets(ownerId: string, page?: number, limit?: number): Promise<IAsset[]>;
    /**
     * Get single asset by ID
     */
    getById(assetId: string, ownerId?: string): Promise<IAsset | null>;
    /**
     * Get asset by S3 key
     */
    getByS3Key(s3Key: string): Promise<IAsset | null>;
    /**
     * Soft delete asset
     */
    softDelete(assetId: string, ownerId: string): Promise<boolean>;
    /**
     * Restore soft-deleted asset
     */
    restore(assetId: string, ownerId: string): Promise<boolean>;
    /**
     * Get bandwidth usage for an asset
     */
    getAssetBandwidthStats(assetId: string): Promise<{
        totalBytes: number;
        totalRequests: number;
        hitRatio: number;
    }>;
    /**
     * Count user's assets
     */
    countUserAssets(ownerId: string): Promise<number>;
}
