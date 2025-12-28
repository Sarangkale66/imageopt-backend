// assets/asset.service.ts
// Asset business logic

import mongoose from 'mongoose';
import { Asset, IAsset } from './asset.model';
import { AssetLog } from './asset-log.model';

export class AssetService {
  /**
   * Create new asset
   */
  async create(
    ownerId: string,
    name: string,
    type: 'image' | 'video' | 'file',
    s3Bucket: string,
    s3Key: string,
    cloudfrontUrl: string,
    sizeBytes: number,
    metadata?: { width?: number; height?: number; format?: string }
  ): Promise<IAsset> {
    const asset = new Asset({
      ownerId: new mongoose.Types.ObjectId(ownerId),
      name,
      type,
      s3Bucket,
      s3Key,
      cloudfrontUrl,
      sizeBytes,
      metadata,
    });

    return asset.save();
  }

  /**
   * Get user's assets (excluding deleted)
   */
  async getUserAssets(ownerId: string, page: number = 1, limit: number = 20): Promise<IAsset[]> {
    return Asset.find({ ownerId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  /**
   * Get single asset by ID
   */
  async getById(assetId: string, ownerId?: string): Promise<IAsset | null> {
    const query: any = { _id: assetId, isDeleted: false };
    if (ownerId) {
      query.ownerId = ownerId;
    }
    return Asset.findOne(query);
  }

  /**
   * Get asset by S3 key
   */
  async getByS3Key(s3Key: string): Promise<IAsset | null> {
    return Asset.findOne({ s3Key, isDeleted: false });
  }

  /**
   * Soft delete asset
   */
  async softDelete(assetId: string, ownerId: string): Promise<boolean> {
    const result = await Asset.updateOne(
      { _id: assetId, ownerId },
      { $set: { isDeleted: true } }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Restore soft-deleted asset
   */
  async restore(assetId: string, ownerId: string): Promise<boolean> {
    const result = await Asset.updateOne(
      { _id: assetId, ownerId, isDeleted: true },
      { $set: { isDeleted: false } }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Get bandwidth usage for an asset
   */
  async getAssetBandwidthStats(assetId: string): Promise<{
    totalBytes: number;
    totalRequests: number;
    hitRatio: number;
  }> {
    const objectId = new mongoose.Types.ObjectId(assetId);
    
    const stats = await AssetLog.aggregate([
      { $match: { assetId: objectId } },
      {
        $group: {
          _id: null,
          totalBytes: { $sum: '$bytes' },
          totalRequests: { $sum: 1 },
          hits: {
            $sum: { $cond: [{ $eq: ['$edgeResult', 'Hit'] }, 1, 0] },
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return { totalBytes: 0, totalRequests: 0, hitRatio: 0 };
    }

    const { totalBytes, totalRequests, hits } = stats[0];
    const hitRatio = totalRequests > 0 ? (hits / totalRequests) * 100 : 0;

    return { totalBytes, totalRequests, hitRatio };
  }

  /**
   * Count user's assets
   */
  async countUserAssets(ownerId: string): Promise<number> {
    return Asset.countDocuments({ ownerId, isDeleted: false });
  }

  /**
   * Update privacy status of an asset
   */
  async updatePrivacyStatus(
    assetId: string,
    isPrivate: boolean,
    newS3Key: string,
    newCloudfrontUrl: string,
    originalFolder: string | null
  ): Promise<boolean> {
    const result = await Asset.updateOne(
      { _id: assetId },
      {
        $set: {
          isPrivate,
          s3Key: newS3Key,
          cloudfrontUrl: newCloudfrontUrl,
          originalFolder,
        },
      }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Get list of unique folders for a user
   * Extracts folder names from s3Key (e.g., "userId/products/..." → "products")
   */
  async getUserFolders(ownerId: string): Promise<{ folder: string; count: number }[]> {
    const result = await Asset.aggregate([
      { 
        $match: { 
          ownerId: new mongoose.Types.ObjectId(ownerId), 
          isDeleted: false 
        } 
      },
      {
        $project: {
          // Extract folder from s3Key: "userId/folder/file.jpg" → "folder"
          folder: {
            $let: {
              vars: {
                parts: { $split: ['$s3Key', '/'] }
              },
              in: { $arrayElemAt: ['$$parts', 1] }
            }
          }
        }
      },
      {
        $group: {
          _id: '$folder',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return result.map(r => ({ folder: r._id, count: r.count }));
  }

  /**
   * Get assets in a specific folder
   */
  async getAssetsByFolder(
    ownerId: string, 
    folder: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ assets: IAsset[]; total: number }> {
    // Build regex to match folder in s3Key: "userId/folder/..."
    const folderPattern = new RegExp(`^${ownerId}/${folder}/`);
    
    const query = { 
      ownerId, 
      isDeleted: false,
      s3Key: folderPattern
    };

    const [assets, total] = await Promise.all([
      Asset.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Asset.countDocuments(query)
    ]);

    return { assets, total };
  }
}
