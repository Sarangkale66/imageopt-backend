// assets/asset.controller.ts
// HTTP request handlers for asset endpoints

import { Request, Response } from 'express';
import { AssetService } from './asset.service';
import { S3Service } from '../aws/s3.service';
import { S3UploadService } from '../aws/s3-upload.service';
import { CloudFrontSignerService } from '../aws/cloudfront-signer.service';
import { CloudFrontService } from '../aws/cloudfront.service';
import { sendSuccess, sendError } from '../utils/response.util';
import {
  validateUploadUrlRequest,
  validateCreateAsset,
  UploadUrlRequestDto,
  CreateAssetDto,
} from './dto/create-asset.dto';

export class AssetController {
  private assetService: AssetService;
  private s3Service: S3Service;
  private s3UploadService: S3UploadService;
  private cloudFrontSignerService: CloudFrontSignerService;
  private cloudFrontService: CloudFrontService;

  constructor() {
    this.assetService = new AssetService();
    this.s3Service = new S3Service();
    this.s3UploadService = new S3UploadService();
    this.cloudFrontSignerService = new CloudFrontSignerService();
    this.cloudFrontService = new CloudFrontService();
  }

  /**
   * POST /api/assets/upload-url
   * Generate presigned URL for S3 upload
   */
  generateUploadUrl = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const dto: UploadUrlRequestDto = req.body;

      // Validate input
      const validationError = validateUploadUrlRequest(dto);
      if (validationError) {
        return sendError(res, validationError, 400);
      }

      // Generate presigned URL with optional custom folder/filename
      const { uploadUrl, s3Key, s3Bucket } = await this.s3Service.generatePresignedUploadUrl(
        dto.fileName,
        dto.fileType,
        dto.fileSize,
        req.user.userId,
        dto.folder,
        dto.customFileName
      );

      return sendSuccess(res, {
        uploadUrl,
        s3Key,
        s3Bucket,
        expiresIn: 1200, // 20 minutes
      }, 'Upload URL generated successfully');
    } catch (error: any) {
      return sendError(res, error.message ||'Failed to generate upload URL', 500);
    }
  };

  /**
   * POST /api/assets/direct-upload
   * Direct file upload via form-data (multipart/form-data)
   */
  directUpload = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      // Check if file exists
      if (!req.file) {
        return sendError(res, 'No file uploaded', 400);
      }

      const file = req.file;
      
      // Get optional folder and custom filename from form data
      const folder = req.body.folder as string | undefined;
      const customFileName = req.body.customFileName as string | undefined;

      // Upload to S3
      const { s3Key, s3Bucket } = await this.s3UploadService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        req.user.userId,
        folder,
        customFileName
      );

      // Determine asset type
      const assetType = this.s3Service.getAssetType(file.mimetype);

      // Generate CloudFront URL
      const cloudfrontUrl = this.s3Service.generateCloudfrontUrl(s3Key);

      // Create asset in database
      const asset = await this.assetService.create(
        req.user.userId,
        customFileName || file.originalname,
        assetType,
        s3Bucket,
        s3Key,
        cloudfrontUrl,
        file.size
      );

      return sendSuccess(res, {
        asset,
        s3Key,
        cloudfrontUrl,
      }, 'File uploaded successfully to S3', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to upload file', 500);
    }
  };

  /**
   * POST /api/assets
   * Save asset metadata after successful S3 upload
   */
  createAsset = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const dto: CreateAssetDto & { s3Key: string; s3Bucket: string } = req.body;

      // Validate input
      const validationError = validateCreateAsset(dto);
      if (validationError) {
        return sendError(res, validationError, 400);
      }

      if (!dto.s3Key || !dto.s3Bucket) {
        return sendError(res, 'S3 key and bucket are required', 400);
      }

      // Check if asset already exists
      const existing = await this.assetService.getByS3Key(dto.s3Key);
      if (existing) {
        return sendError(res, 'Asset already exists', 409);
      }

      // Determine asset type
      const assetType = this.s3Service.getAssetType(dto.fileType);

      // Generate CloudFront URL
      const cloudfrontUrl = this.s3Service.generateCloudfrontUrl(dto.s3Key);

      // Create asset
      const asset = await this.assetService.create(
        req.user.userId,
        dto.fileName,
        assetType,
        dto.s3Bucket,
        dto.s3Key,
        cloudfrontUrl,
        dto.fileSize,
        dto.metadata
      );

      return sendSuccess(res, { asset }, 'Asset created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create asset', 500);
    }
  };

  /**
   * GET /api/assets
   * Get user's assets (paginated)
   */
  listAssets = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const assets = await this.assetService.getUserAssets(req.user.userId, page, limit);
      const total = await this.assetService.countUserAssets(req.user.userId);

      return sendSuccess(res, {
        assets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to list assets', 500);
    }
  };

  /**
   * GET /api/assets/:id
   * Get single asset details
   */
  getAsset = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const { id } = req.params;

      const asset = await this.assetService.getById(id, req.user.userId);

      if (!asset) {
        return sendError(res, 'Asset not found', 404);
      }

      return sendSuccess(res, { asset });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to get asset', 500);
    }
  };

  /**
   * DELETE /api/assets/:id
   * Soft delete asset
   */
  deleteAsset = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const { id } = req.params;

      const deleted = await this.assetService.softDelete(id, req.user.userId);

      if (!deleted) {
        return sendError(res, 'Asset not found or already deleted', 404);
      }

      return sendSuccess(res, null, 'Asset deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete asset', 500);
    }
  };

  /**
   * PUT /api/assets/:id/restore
   * Restore soft-deleted asset (within 90 hours)
   */
  restoreAsset = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const { id } = req.params;

      const restored = await this.assetService.restore(id, req.user.userId);

      if (!restored) {
        return sendError(res, 'Asset not found or already active', 404);
      }

      return sendSuccess(res, null, 'Asset restored successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to restore asset', 500);
    }
  };

  /**
   * GET /api/assets/:id/stats
   * Get bandwidth statistics for an asset
   */
  getAssetStats = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const { id } = req.params;

      // Check ownership
      const asset = await this.assetService.getById(id, req.user.userId);
      if (!asset) {
        return sendError(res, 'Asset not found', 404);
      }

      const stats = await this.assetService.getAssetBandwidthStats(id);

      return sendSuccess(res, {
        asset: {
          id: asset._id,
          name: asset.name,
          cloudfrontUrl: asset.cloudfrontUrl,
        },
        stats: {
          totalBandwidthBytes: stats.totalBytes,
          totalBandwidthMB: (stats.totalBytes / 1024 / 1024).toFixed(2),
          totalRequests: stats.totalRequests,
          cacheHitRatio: stats.hitRatio.toFixed(2) + '%',
        },
      });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to get asset stats', 500);
    }
  };

  /**
   * GET /api/assets/folders
   * Get list of unique folders for the user
   */
  listFolders = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const folders = await this.assetService.getUserFolders(req.user.userId);

      return sendSuccess(res, {
        folders,
        total: folders.length,
      });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to get folders', 500);
    }
  };

  /**
   * GET /api/assets/folders/:folder
   * Get assets in a specific folder
   */
  getAssetsByFolder = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const { folder } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { assets, total } = await this.assetService.getAssetsByFolder(
        req.user.userId,
        folder,
        page,
        limit
      );

      return sendSuccess(res, {
        folder,
        assets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to get folder assets', 500);
    }
  };

  /**
   * GET /api/assets/:id/signed-url
   * Generate a time-limited signed CloudFront URL for secure asset access
   * Supports transformation params: format, width, height, quality
   * URL format: /userId/private/image.jpg/format=webp?Expires=...&Signature=...
   */
  getSignedAssetUrl = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const { id } = req.params;

      // Check if signed URLs are configured
      if (!this.cloudFrontSignerService.isConfigured()) {
        return sendError(
          res,
          'Signed URLs not configured. Contact administrator.',
          503
        );
      }

      // Check ownership
      const asset = await this.assetService.getById(id, req.user.userId);
      if (!asset) {
        return sendError(res, 'Asset not found', 404);
      }

      // Get custom expiry from query params (optional)
      const expiresInParam = req.query.expiresIn as string | undefined;
      let expiresInSeconds: number | undefined;

      if (expiresInParam) {
        expiresInSeconds = parseInt(expiresInParam, 10);
        if (isNaN(expiresInSeconds) || expiresInSeconds < 60) {
          return sendError(res, 'expiresIn must be a number >= 60 seconds', 400);
        }
        // Max 7 days
        if (expiresInSeconds > 604800) {
          return sendError(res, 'expiresIn cannot exceed 604800 seconds (7 days)', 400);
        }
      }

      // Get transformation params from query
      const format = req.query.format as string | undefined;
      const width = req.query.width as string | undefined;
      const height = req.query.height as string | undefined;
      const quality = req.query.quality as string | undefined;

      // Check if asset is private (either by flag or by path)
      const isPrivate = asset.isPrivate || asset.s3Key.includes('/private/');
      
      if (!isPrivate) {
        return sendError(
          res, 
          'This asset is public. Use the regular CloudFront URL or move it to private first.', 
          400
        );
      }

      // Extract filename and extension for format
      const fileName = asset.s3Key.split('/').pop() || '';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'jpeg';
      
      // Map common extensions to valid format values
      const formatMap: Record<string, string> = {
        'jpg': 'jpeg',
        'jpeg': 'jpeg',
        'png': 'png',
        'webp': 'webp',
        'avif': 'avif',
        'gif': 'gif',
      };
      const defaultFormat = formatMap[fileExtension] || 'jpeg';
      
      // Use provided format or default to file extension format
      const finalFormat = format || defaultFormat;
      
      // Build transformation string - format is always required!
      const transformations: string[] = [`format=${finalFormat}`];
      if (width) transformations.push(`width=${width}`);
      if (height) transformations.push(`height=${height}`);
      if (quality) transformations.push(`quality=${quality}`);
      
      const transformationPath = '/' + transformations.join(',');

      // Use actual S3 path (asset is already in /private/ folder)
      const signedUrlBase = `https://${this.s3Service.getCloudfrontDomain()}/${asset.s3Key}${transformationPath}`;

      // Generate signed URL
      const { signedUrl, expiresAt, expiresInSeconds: actualExpiry } =
        this.cloudFrontSignerService.generateSignedUrl(
          signedUrlBase,
          expiresInSeconds
        );

      return sendSuccess(res, {
        signedUrl,
        expiresAt: expiresAt.toISOString(),
        expiresInSeconds: actualExpiry,
        asset: {
          id: asset._id,
          name: asset.name,
        },
        transformations: transformations.length > 0 ? transformations : undefined,
      });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to generate signed URL', 500);
    }
  };

  /**
   * PUT /api/assets/:id/make-private
   * Move asset to private folder (requires signed URL for access)
   */
  makePrivate = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const { id } = req.params;

      // Check ownership
      const asset = await this.assetService.getById(id, req.user.userId);
      if (!asset) {
        return sendError(res, 'Asset not found', 404);
      }

      // Check if already private
      if (asset.isPrivate) {
        return sendError(res, 'Asset is already private', 400);
      }

      // Move to private folder in S3
      const { newS3Key, originalFolder } = await this.s3Service.moveToPrivate(asset.s3Key);

      // Update database
      const newCloudfrontUrl = this.s3Service.generateCloudfrontUrl(newS3Key);
      await this.assetService.updatePrivacyStatus(id, true, newS3Key, newCloudfrontUrl, originalFolder);

      return sendSuccess(res, {
        message: 'Asset moved to private folder',
        asset: {
          id: asset._id,
          name: asset.name,
          isPrivate: true,
          newS3Key,
          cloudfrontUrl: newCloudfrontUrl,
        },
      });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to make asset private', 500);
    }
  };

  /**
   * PUT /api/assets/:id/make-public
   * Move asset from private to public folder
   */
  makePublic = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const { id } = req.params;
      const targetFolder = (req.query.folder as string) || req.body.folder;

      // Check ownership
      const asset = await this.assetService.getById(id, req.user.userId);
      if (!asset) {
        return sendError(res, 'Asset not found', 404);
      }

      // Check if already public
      if (!asset.isPrivate) {
        return sendError(res, 'Asset is already public', 400);
      }

      // Determine target folder (use original or provided folder)
      const folder = targetFolder || asset.originalFolder || 'public';

      // Move to public folder in S3
      const newS3Key = await this.s3Service.moveToPublic(asset.s3Key, folder);

      // Update database
      const newCloudfrontUrl = this.s3Service.generateCloudfrontUrl(newS3Key);
      await this.assetService.updatePrivacyStatus(id, false, newS3Key, newCloudfrontUrl, null);

      return sendSuccess(res, {
        message: 'Asset moved to public folder',
        asset: {
          id: asset._id,
          name: asset.name,
          isPrivate: false,
          newS3Key,
          cloudfrontUrl: newCloudfrontUrl,
          folder,
        },
      });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to make asset public', 500);
    }
  };

  /**
   * POST /api/assets/:id/invalidate-cache
   * Invalidate CloudFront cache for a specific asset (all transformations)
   */
  invalidateCache = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      const { id } = req.params;

      // Check if CloudFront invalidation is configured
      if (!this.cloudFrontService.isConfigured()) {
        return sendError(
          res,
          'Cache invalidation not configured. Set CLOUDFRONT_DISTRIBUTION_ID.',
          503
        );
      }

      // Check ownership
      const asset = await this.assetService.getById(id, req.user.userId);
      if (!asset) {
        return sendError(res, 'Asset not found', 404);
      }

      // Invalidate cache for this asset and all its transformations
      const result = await this.cloudFrontService.invalidateAsset(asset.s3Key);

      return sendSuccess(res, {
        message: 'Cache invalidation initiated',
        asset: {
          id: asset._id,
          name: asset.name,
          s3Key: asset.s3Key,
        },
        invalidation: {
          id: result.invalidationId,
          status: result.status,
          paths: result.paths,
        },
      });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to invalidate cache', 500);
    }
  };
}
