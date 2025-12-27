// assets/asset.controller.ts
// HTTP request handlers for asset endpoints

import { Request, Response } from 'express';
import { AssetService } from './asset.service';
import { S3Service } from '../aws/s3.service';
import { S3UploadService } from '../aws/s3-upload.service';
import { CloudFrontSignerService } from '../aws/cloudfront-signer.service';
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

  constructor() {
    this.assetService = new AssetService();
    this.s3Service = new S3Service();
    this.s3UploadService = new S3UploadService();
    this.cloudFrontSignerService = new CloudFrontSignerService();
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
        expiresIn: 900, // 15 minutes
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
   * GET /api/assets/:id/signed-url
   * Generate a time-limited signed CloudFront URL for secure asset access
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

      // Generate signed URL
      const { signedUrl, expiresAt, expiresInSeconds: actualExpiry } =
        this.cloudFrontSignerService.generateSignedUrl(
          asset.cloudfrontUrl,
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
      });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to generate signed URL', 500);
    }
  };
}
