"use strict";
// assets/asset.controller.ts
// HTTP request handlers for asset endpoints
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetController = void 0;
const asset_service_1 = require("./asset.service");
const s3_service_1 = require("../aws/s3.service");
const s3_upload_service_1 = require("../aws/s3-upload.service");
const response_util_1 = require("../utils/response.util");
const create_asset_dto_1 = require("./dto/create-asset.dto");
class AssetController {
    constructor() {
        /**
         * POST /api/assets/upload-url
         * Generate presigned URL for S3 upload
         */
        this.generateUploadUrl = async (req, res) => {
            try {
                if (!req.user) {
                    return (0, response_util_1.sendError)(res, 'Not authenticated', 401);
                }
                const dto = req.body;
                // Validate input
                const validationError = (0, create_asset_dto_1.validateUploadUrlRequest)(dto);
                if (validationError) {
                    return (0, response_util_1.sendError)(res, validationError, 400);
                }
                // Generate presigned URL with optional custom folder/filename
                const { uploadUrl, s3Key, s3Bucket } = await this.s3Service.generatePresignedUploadUrl(dto.fileName, dto.fileType, dto.fileSize, req.user.userId, dto.folder, dto.customFileName);
                return (0, response_util_1.sendSuccess)(res, {
                    uploadUrl,
                    s3Key,
                    s3Bucket,
                    expiresIn: 900, // 15 minutes
                }, 'Upload URL generated successfully');
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.message || 'Failed to generate upload URL', 500);
            }
        };
        /**
         * POST /api/assets/direct-upload
         * Direct file upload via form-data (multipart/form-data)
         */
        this.directUpload = async (req, res) => {
            try {
                if (!req.user) {
                    return (0, response_util_1.sendError)(res, 'Not authenticated', 401);
                }
                // Check if file exists
                if (!req.file) {
                    return (0, response_util_1.sendError)(res, 'No file uploaded', 400);
                }
                const file = req.file;
                // Get optional folder and custom filename from form data
                const folder = req.body.folder;
                const customFileName = req.body.customFileName;
                // Upload to S3
                const { s3Key, s3Bucket } = await this.s3UploadService.uploadFile(file.buffer, file.originalname, file.mimetype, req.user.userId, folder, customFileName);
                // Determine asset type
                const assetType = this.s3Service.getAssetType(file.mimetype);
                // Generate CloudFront URL
                const cloudfrontUrl = this.s3Service.generateCloudfrontUrl(s3Key);
                // Create asset in database
                const asset = await this.assetService.create(req.user.userId, customFileName || file.originalname, assetType, s3Bucket, s3Key, cloudfrontUrl, file.size);
                return (0, response_util_1.sendSuccess)(res, {
                    asset,
                    s3Key,
                    cloudfrontUrl,
                }, 'File uploaded successfully to S3', 201);
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.message || 'Failed to upload file', 500);
            }
        };
        /**
         * POST /api/assets
         * Save asset metadata after successful S3 upload
         */
        this.createAsset = async (req, res) => {
            try {
                if (!req.user) {
                    return (0, response_util_1.sendError)(res, 'Not authenticated', 401);
                }
                const dto = req.body;
                // Validate input
                const validationError = (0, create_asset_dto_1.validateCreateAsset)(dto);
                if (validationError) {
                    return (0, response_util_1.sendError)(res, validationError, 400);
                }
                if (!dto.s3Key || !dto.s3Bucket) {
                    return (0, response_util_1.sendError)(res, 'S3 key and bucket are required', 400);
                }
                // Check if asset already exists
                const existing = await this.assetService.getByS3Key(dto.s3Key);
                if (existing) {
                    return (0, response_util_1.sendError)(res, 'Asset already exists', 409);
                }
                // Determine asset type
                const assetType = this.s3Service.getAssetType(dto.fileType);
                // Generate CloudFront URL
                const cloudfrontUrl = this.s3Service.generateCloudfrontUrl(dto.s3Key);
                // Create asset
                const asset = await this.assetService.create(req.user.userId, dto.fileName, assetType, dto.s3Bucket, dto.s3Key, cloudfrontUrl, dto.fileSize, dto.metadata);
                return (0, response_util_1.sendSuccess)(res, { asset }, 'Asset created successfully', 201);
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.message || 'Failed to create asset', 500);
            }
        };
        /**
         * GET /api/assets
         * Get user's assets (paginated)
         */
        this.listAssets = async (req, res) => {
            try {
                if (!req.user) {
                    return (0, response_util_1.sendError)(res, 'Not authenticated', 401);
                }
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 20;
                const assets = await this.assetService.getUserAssets(req.user.userId, page, limit);
                const total = await this.assetService.countUserAssets(req.user.userId);
                return (0, response_util_1.sendSuccess)(res, {
                    assets,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                });
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.message || 'Failed to list assets', 500);
            }
        };
        /**
         * GET /api/assets/:id
         * Get single asset details
         */
        this.getAsset = async (req, res) => {
            try {
                if (!req.user) {
                    return (0, response_util_1.sendError)(res, 'Not authenticated', 401);
                }
                const { id } = req.params;
                const asset = await this.assetService.getById(id, req.user.userId);
                if (!asset) {
                    return (0, response_util_1.sendError)(res, 'Asset not found', 404);
                }
                return (0, response_util_1.sendSuccess)(res, { asset });
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.message || 'Failed to get asset', 500);
            }
        };
        /**
         * DELETE /api/assets/:id
         * Soft delete asset
         */
        this.deleteAsset = async (req, res) => {
            try {
                if (!req.user) {
                    return (0, response_util_1.sendError)(res, 'Not authenticated', 401);
                }
                const { id } = req.params;
                const deleted = await this.assetService.softDelete(id, req.user.userId);
                if (!deleted) {
                    return (0, response_util_1.sendError)(res, 'Asset not found or already deleted', 404);
                }
                return (0, response_util_1.sendSuccess)(res, null, 'Asset deleted successfully');
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.message || 'Failed to delete asset', 500);
            }
        };
        /**
         * PUT /api/assets/:id/restore
         * Restore soft-deleted asset (within 90 hours)
         */
        this.restoreAsset = async (req, res) => {
            try {
                if (!req.user) {
                    return (0, response_util_1.sendError)(res, 'Not authenticated', 401);
                }
                const { id } = req.params;
                const restored = await this.assetService.restore(id, req.user.userId);
                if (!restored) {
                    return (0, response_util_1.sendError)(res, 'Asset not found or already active', 404);
                }
                return (0, response_util_1.sendSuccess)(res, null, 'Asset restored successfully');
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.message || 'Failed to restore asset', 500);
            }
        };
        /**
         * GET /api/assets/:id/stats
         * Get bandwidth statistics for an asset
         */
        this.getAssetStats = async (req, res) => {
            try {
                if (!req.user) {
                    return (0, response_util_1.sendError)(res, 'Not authenticated', 401);
                }
                const { id } = req.params;
                // Check ownership
                const asset = await this.assetService.getById(id, req.user.userId);
                if (!asset) {
                    return (0, response_util_1.sendError)(res, 'Asset not found', 404);
                }
                const stats = await this.assetService.getAssetBandwidthStats(id);
                return (0, response_util_1.sendSuccess)(res, {
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
            }
            catch (error) {
                return (0, response_util_1.sendError)(res, error.message || 'Failed to get asset stats', 500);
            }
        };
        this.assetService = new asset_service_1.AssetService();
        this.s3Service = new s3_service_1.S3Service();
        this.s3UploadService = new s3_upload_service_1.S3UploadService();
    }
}
exports.AssetController = AssetController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXQuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFzc2V0LmNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDZCQUE2QjtBQUM3Qiw0Q0FBNEM7OztBQUc1QyxtREFBK0M7QUFDL0Msa0RBQThDO0FBQzlDLGdFQUEyRDtBQUMzRCwwREFBZ0U7QUFDaEUsNkRBS2dDO0FBRWhDLE1BQWEsZUFBZTtJQUsxQjtRQU1BOzs7V0FHRztRQUNILHNCQUFpQixHQUFHLEtBQUssRUFBRSxHQUFZLEVBQUUsR0FBYSxFQUFxQixFQUFFO1lBQzNFLElBQUksQ0FBQztnQkFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNkLE9BQU8sSUFBQSx5QkFBUyxFQUFDLEdBQUcsRUFBRSxtQkFBbUIsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDbEQsQ0FBQztnQkFFRCxNQUFNLEdBQUcsR0FBd0IsR0FBRyxDQUFDLElBQUksQ0FBQztnQkFFMUMsaUJBQWlCO2dCQUNqQixNQUFNLGVBQWUsR0FBRyxJQUFBLDJDQUF3QixFQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLGVBQWUsRUFBRSxDQUFDO29CQUNwQixPQUFPLElBQUEseUJBQVMsRUFBQyxHQUFHLEVBQUUsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO2dCQUVELDhEQUE4RDtnQkFDOUQsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLDBCQUEwQixDQUNwRixHQUFHLENBQUMsUUFBUSxFQUNaLEdBQUcsQ0FBQyxRQUFRLEVBQ1osR0FBRyxDQUFDLFFBQVEsRUFDWixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFDZixHQUFHLENBQUMsTUFBTSxFQUNWLEdBQUcsQ0FBQyxjQUFjLENBQ25CLENBQUM7Z0JBRUYsT0FBTyxJQUFBLDJCQUFX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QyxDQUFDO2dCQUNoRCxDQUFDO2dCQUVELE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFakUsT0FBTyxJQUFBLDJCQUFXLEVBQUMsR0FBRyxFQUFFO29CQUN0QixLQUFLLEVBQUU7d0JBQ0wsRUFBRSxFQUFFLEtBQUssQ0FBQyxHQUFHO3dCQUNiLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTt3QkFDaEIsYUFBYSxFQUFFLEtBQUssQ0FBQyxhQUFhO3FCQUNuQztvQkFDRCxLQUFLLEVBQUU7d0JBQ0wsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLFVBQVU7d0JBQ3JDLGdCQUFnQixFQUFFLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzt3QkFDN0QsYUFBYSxFQUFFLEtBQUssQ0FBQyxhQUFhO3dCQUNsQyxhQUFhLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRztxQkFDL0M7aUJBQ0YsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7Z0JBQ3BCLE9BQU8sSUFBQSx5QkFBUyxFQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsT0FBTyxJQUFJLDJCQUEyQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzNFLENBQUM7UUFDSCxDQUFDLENBQUM7UUFwU0EsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLDRCQUFZLEVBQUUsQ0FBQztRQUN2QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksc0JBQVMsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxtQ0FBZSxFQUFFLENBQUM7SUFDL0MsQ0FBQztDQWtTRjtBQTNTRCwwQ0EyU0MiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBhc3NldHMvYXNzZXQuY29udHJvbGxlci50c1xyXG4vLyBIVFRQIHJlcXVlc3QgaGFuZGxlcnMgZm9yIGFzc2V0IGVuZHBvaW50c1xyXG5cclxuaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcclxuaW1wb3J0IHsgQXNzZXRTZXJ2aWNlIH0gZnJvbSAnLi9hc3NldC5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUzNTZXJ2aWNlIH0gZnJvbSAnLi4vYXdzL3MzLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTM1VwbG9hZFNlcnZpY2UgfSBmcm9tICcuLi9hd3MvczMtdXBsb2FkLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBzZW5kU3VjY2Vzcywgc2VuZEVycm9yIH0gZnJvbSAnLi4vdXRpbHMvcmVzcG9uc2UudXRpbCc7XHJcbmltcG9ydCB7XHJcbiAgdmFsaWRhdGVVcGxvYWRVcmxSZXF1ZXN0LFxyXG4gIHZhbGlkYXRlQ3JlYXRlQXNzZXQsXHJcbiAgVXBsb2FkVXJsUmVxdWVzdER0byxcclxuICBDcmVhdGVBc3NldER0byxcclxufSBmcm9tICcuL2R0by9jcmVhdGUtYXNzZXQuZHRvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBBc3NldENvbnRyb2xsZXIge1xyXG4gIHByaXZhdGUgYXNzZXRTZXJ2aWNlOiBBc3NldFNlcnZpY2U7XHJcbiAgcHJpdmF0ZSBzM1NlcnZpY2U6IFMzU2VydmljZTtcclxuICBwcml2YXRlIHMzVXBsb2FkU2VydmljZTogUzNVcGxvYWRTZXJ2aWNlO1xyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMuYXNzZXRTZXJ2aWNlID0gbmV3IEFzc2V0U2VydmljZSgpO1xyXG4gICAgdGhpcy5zM1NlcnZpY2UgPSBuZXcgUzNTZXJ2aWNlKCk7XHJcbiAgICB0aGlzLnMzVXBsb2FkU2VydmljZSA9IG5ldyBTM1VwbG9hZFNlcnZpY2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBPU1QgL2FwaS9hc3NldHMvdXBsb2FkLXVybFxyXG4gICAqIEdlbmVyYXRlIHByZXNpZ25lZCBVUkwgZm9yIFMzIHVwbG9hZFxyXG4gICAqL1xyXG4gIGdlbmVyYXRlVXBsb2FkVXJsID0gYXN5bmMgKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSk6IFByb21pc2U8UmVzcG9uc2U+ID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGlmICghcmVxLnVzZXIpIHtcclxuICAgICAgICByZXR1cm4gc2VuZEVycm9yKHJlcywgJ05vdCBhdXRoZW50aWNhdGVkJywgNDAxKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZHRvOiBVcGxvYWRVcmxSZXF1ZXN0RHRvID0gcmVxLmJvZHk7XHJcblxyXG4gICAgICAvLyBWYWxpZGF0ZSBpbnB1dFxyXG4gICAgICBjb25zdCB2YWxpZGF0aW9uRXJyb3IgPSB2YWxpZGF0ZVVwbG9hZFVybFJlcXVlc3QoZHRvKTtcclxuICAgICAgaWYgKHZhbGlkYXRpb25FcnJvcikge1xyXG4gICAgICAgIHJldHVybiBzZW5kRXJyb3IocmVzLCB2YWxpZGF0aW9uRXJyb3IsIDQwMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEdlbmVyYXRlIHByZXNpZ25lZCBVUkwgd2l0aCBvcHRpb25hbCBjdXN0b20gZm9sZGVyL2ZpbGVuYW1lXHJcbiAgICAgIGNvbnN0IHsgdXBsb2FkVXJsLCBzM0tleSwgczNCdWNrZXQgfSA9IGF3YWl0IHRoaXMuczNTZXJ2aWNlLmdlbmVyYXRlUHJlc2lnbmVkVXBsb2FkVXJsKFxyXG4gICAgICAgIGR0by5maWxlTmFtZSxcclxuICAgICAgICBkdG8uZmlsZVR5cGUsXHJcbiAgICAgICAgZHRvLmZpbGVTaXplLFxyXG4gICAgICAgIHJlcS51c2VyLnVzZXJJZCxcclxuICAgICAgICBkdG8uZm9sZGVyLFxyXG4gICAgICAgIGR0by5jdXN0b21GaWxlTmFtZVxyXG4gICAgICApO1xyXG5cclxuICAgICAgcmV0dXJuIHNlbmRTdWNjZXNzKHJlcywge1xyXG4gICAgICAgIHVwbG9hZFVybCxcclxuICAgICAgICBzM0tleSxcclxuICAgICAgICBzM0J1Y2tldCxcclxuICAgICAgICBleHBpcmVzSW46IDkwMCwgLy8gMTUgbWludXRlc1xyXG4gICAgICB9LCAnVXBsb2FkIFVSTCBnZW5lcmF0ZWQgc3VjY2Vzc2Z1bGx5Jyk7XHJcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgIHJldHVybiBzZW5kRXJyb3IocmVzLCBlcnJvci5tZXNzYWdlIHx8J0ZhaWxlZCB0byBnZW5lcmF0ZSB1cGxvYWQgVVJMJywgNTAwKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBQT1NUIC9hcGkvYXNzZXRzL2RpcmVjdC11cGxvYWRcclxuICAgKiBEaXJlY3QgZmlsZSB1cGxvYWQgdmlhIGZvcm0tZGF0YSAobXVsdGlwYXJ0L2Zvcm0tZGF0YSlcclxuICAgKi9cclxuICBkaXJlY3RVcGxvYWQgPSBhc3luYyAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKTogUHJvbWlzZTxSZXNwb25zZT4gPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgaWYgKCFyZXEudXNlcikge1xyXG4gICAgICAgIHJldHVybiBzZW5kRXJyb3IocmVzLCAnTm90IGF1dGhlbnRpY2F0ZWQnLCA0MDEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDaGVjayBpZiBmaWxlIGV4aXN0c1xyXG4gICAgICBpZiAoIXJlcS5maWxlKSB7XHJcbiAgICAgICAgcmV0dXJuIHNlbmRFcnJvcihyZXMsICdObyBmaWxlIHVwbG9hZGVkJywgNDAwKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZmlsZSA9IHJlcS5maWxlO1xyXG4gICAgICBcclxuICAgICAgLy8gR2V0IG9wdGlvbmFsIGZvbGRlciBhbmQgY3VzdG9tIGZpbGVuYW1lIGZyb20gZm9ybSBkYXRhXHJcbiAgICAgIGNvbnN0IGZvbGRlciA9IHJlcS5ib2R5LmZvbGRlciBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICAgIGNvbnN0IGN1c3RvbUZpbGVOYW1lID0gcmVxLmJvZHkuY3VzdG9tRmlsZU5hbWUgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgICAgLy8gVXBsb2FkIHRvIFMzXHJcbiAgICAgIGNvbnN0IHsgczNLZXksIHMzQnVja2V0IH0gPSBhd2FpdCB0aGlzLnMzVXBsb2FkU2VydmljZS51cGxvYWRGaWxlKFxyXG4gICAgICAgIGZpbGUuYnVmZmVyLFxyXG4gICAgICAgIGZpbGUub3JpZ2luYWxuYW1lLFxyXG4gICAgICAgIGZpbGUubWltZXR5cGUsXHJcbiAgICAgICAgcmVxLnVzZXIudXNlcklkLFxyXG4gICAgICAgIGZvbGRlcixcclxuICAgICAgICBjdXN0b21GaWxlTmFtZVxyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gRGV0ZXJtaW5lIGFzc2V0IHR5cGVcclxuICAgICAgY29uc3QgYXNzZXRUeXBlID0gdGhpcy5zM1NlcnZpY2UuZ2V0QXNzZXRUeXBlKGZpbGUubWltZXR5cGUpO1xyXG5cclxuICAgICAgLy8gR2VuZXJhdGUgQ2xvdWRGcm9udCBVUkxcclxuICAgICAgY29uc3QgY2xvdWRmcm9udFVybCA9IHRoaXMuczNTZXJ2aWNlLmdlbmVyYXRlQ2xvdWRmcm9udFVybChzM0tleSk7XHJcblxyXG4gICAgICAvLyBDcmVhdGUgYXNzZXQgaW4gZGF0YWJhc2VcclxuICAgICAgY29uc3QgYXNzZXQgPSBhd2FpdCB0aGlzLmFzc2V0U2VydmljZS5jcmVhdGUoXHJcbiAgICAgICAgcmVxLnVzZXIudXNlcklkLFxyXG4gICAgICAgIGN1c3RvbUZpbGVOYW1lIHx8IGZpbGUub3JpZ2luYWxuYW1lLFxyXG4gICAgICAgIGFzc2V0VHlwZSxcclxuICAgICAgICBzM0J1Y2tldCxcclxuICAgICAgICBzM0tleSxcclxuICAgICAgICBjbG91ZGZyb250VXJsLFxyXG4gICAgICAgIGZpbGUuc2l6ZVxyXG4gICAgICApO1xyXG5cclxuICAgICAgcmV0dXJuIHNlbmRTdWNjZXNzKHJlcywge1xyXG4gICAgICAgIGFzc2V0LFxyXG4gICAgICAgIHMzS2V5LFxyXG4gICAgICAgIGNsb3VkZnJvbnRVcmwsXHJcbiAgICAgIH0sICdGaWxlIHVwbG9hZGVkIHN1Y2Nlc3NmdWxseSB0byBTMycsIDIwMSk7XHJcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgIHJldHVybiBzZW5kRXJyb3IocmVzLCBlcnJvci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gdXBsb2FkIGZpbGUnLCA1MDApO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFBPU1QgL2FwaS9hc3NldHNcclxuICAgKiBTYXZlIGFzc2V0IG1ldGFkYXRhIGFmdGVyIHN1Y2Nlc3NmdWwgUzMgdXBsb2FkXHJcbiAgICovXHJcbiAgY3JlYXRlQXNzZXQgPSBhc3luYyAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKTogUHJvbWlzZTxSZXNwb25zZT4gPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgaWYgKCFyZXEudXNlcikge1xyXG4gICAgICAgIHJldHVybiBzZW5kRXJyb3IocmVzLCAnTm90IGF1dGhlbnRpY2F0ZWQnLCA0MDEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBkdG86IENyZWF0ZUFzc2V0RHRvICYgeyBzM0tleTogc3RyaW5nOyBzM0J1Y2tldDogc3RyaW5nIH0gPSByZXEuYm9keTtcclxuXHJcbiAgICAgIC8vIFZhbGlkYXRlIGlucHV0XHJcbiAgICAgIGNvbnN0IHZhbGlkYXRpb25FcnJvciA9IHZhbGlkYXRlQ3JlYXRlQXNzZXQoZHRvKTtcclxuICAgICAgaWYgKHZhbGlkYXRpb25FcnJvcikge1xyXG4gICAgICAgIHJldHVybiBzZW5kRXJyb3IocmVzLCB2YWxpZGF0aW9uRXJyb3IsIDQwMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghZHRvLnMzS2V5IHx8ICFkdG8uczNCdWNrZXQpIHtcclxuICAgICAgICByZXR1cm4gc2VuZEVycm9yKHJlcywgJ1MzIGtleSBhbmQgYnVja2V0IGFyZSByZXF1aXJlZCcsIDQwMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIGFzc2V0IGFscmVhZHkgZXhpc3RzXHJcbiAgICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgdGhpcy5hc3NldFNlcnZpY2UuZ2V0QnlTM0tleShkdG8uczNLZXkpO1xyXG4gICAgICBpZiAoZXhpc3RpbmcpIHtcclxuICAgICAgICByZXR1cm4gc2VuZEVycm9yKHJlcywgJ0Fzc2V0IGFscmVhZHkgZXhpc3RzJywgNDA5KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRGV0ZXJtaW5lIGFzc2V0IHR5cGVcclxuICAgICAgY29uc3QgYXNzZXRUeXBlID0gdGhpcy5zM1NlcnZpY2UuZ2V0QXNzZXRUeXBlKGR0by5maWxlVHlwZSk7XHJcblxyXG4gICAgICAvLyBHZW5lcmF0ZSBDbG91ZEZyb250IFVSTFxyXG4gICAgICBjb25zdCBjbG91ZGZyb250VXJsID0gdGhpcy5zM1NlcnZpY2UuZ2VuZXJhdGVDbG91ZGZyb250VXJsKGR0by5zM0tleSk7XHJcblxyXG4gICAgICAvLyBDcmVhdGUgYXNzZXRcclxuICAgICAgY29uc3QgYXNzZXQgPSBhd2FpdCB0aGlzLmFzc2V0U2VydmljZS5jcmVhdGUoXHJcbiAgICAgICAgcmVxLnVzZXIudXNlcklkLFxyXG4gICAgICAgIGR0by5maWxlTmFtZSxcclxuICAgICAgICBhc3NldFR5cGUsXHJcbiAgICAgICAgZHRvLnMzQnVja2V0LFxyXG4gICAgICAgIGR0by5zM0tleSxcclxuICAgICAgICBjbG91ZGZyb250VXJsLFxyXG4gICAgICAgIGR0by5maWxlU2l6ZSxcclxuICAgICAgICBkdG8ubWV0YWRhdGFcclxuICAgICAgKTtcclxuXHJcbiAgICAgIHJldHVybiBzZW5kU3VjY2VzcyhyZXMsIHsgYXNzZXQgfSwgJ0Fzc2V0IGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5JywgMjAxKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIHNlbmRFcnJvcihyZXMsIGVycm9yLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBjcmVhdGUgYXNzZXQnLCA1MDApO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEdFVCAvYXBpL2Fzc2V0c1xyXG4gICAqIEdldCB1c2VyJ3MgYXNzZXRzIChwYWdpbmF0ZWQpXHJcbiAgICovXHJcbiAgbGlzdEFzc2V0cyA9IGFzeW5jIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpOiBQcm9taXNlPFJlc3BvbnNlPiA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBpZiAoIXJlcS51c2VyKSB7XHJcbiAgICAgICAgcmV0dXJuIHNlbmRFcnJvcihyZXMsICdOb3QgYXV0aGVudGljYXRlZCcsIDQwMSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHBhZ2UgPSBwYXJzZUludChyZXEucXVlcnkucGFnZSBhcyBzdHJpbmcpIHx8IDE7XHJcbiAgICAgIGNvbnN0IGxpbWl0ID0gcGFyc2VJbnQocmVxLnF1ZXJ5LmxpbWl0IGFzIHN0cmluZykgfHwgMjA7XHJcblxyXG4gICAgICBjb25zdCBhc3NldHMgPSBhd2FpdCB0aGlzLmFzc2V0U2VydmljZS5nZXRVc2VyQXNzZXRzKHJlcS51c2VyLnVzZXJJZCwgcGFnZSwgbGltaXQpO1xyXG4gICAgICBjb25zdCB0b3RhbCA9IGF3YWl0IHRoaXMuYXNzZXRTZXJ2aWNlLmNvdW50VXNlckFzc2V0cyhyZXEudXNlci51c2VySWQpO1xyXG5cclxuICAgICAgcmV0dXJuIHNlbmRTdWNjZXNzKHJlcywge1xyXG4gICAgICAgIGFzc2V0cyxcclxuICAgICAgICBwYWdpbmF0aW9uOiB7XHJcbiAgICAgICAgICBwYWdlLFxyXG4gICAgICAgICAgbGltaXQsXHJcbiAgICAgICAgICB0b3RhbCxcclxuICAgICAgICAgIHRvdGFsUGFnZXM6IE1hdGguY2VpbCh0b3RhbCAvIGxpbWl0KSxcclxuICAgICAgICB9LFxyXG4gICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIHNlbmRFcnJvcihyZXMsIGVycm9yLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBsaXN0IGFzc2V0cycsIDUwMCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogR0VUIC9hcGkvYXNzZXRzLzppZFxyXG4gICAqIEdldCBzaW5nbGUgYXNzZXQgZGV0YWlsc1xyXG4gICAqL1xyXG4gIGdldEFzc2V0ID0gYXN5bmMgKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSk6IFByb21pc2U8UmVzcG9uc2U+ID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGlmICghcmVxLnVzZXIpIHtcclxuICAgICAgICByZXR1cm4gc2VuZEVycm9yKHJlcywgJ05vdCBhdXRoZW50aWNhdGVkJywgNDAxKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgeyBpZCB9ID0gcmVxLnBhcmFtcztcclxuXHJcbiAgICAgIGNvbnN0IGFzc2V0ID0gYXdhaXQgdGhpcy5hc3NldFNlcnZpY2UuZ2V0QnlJZChpZCwgcmVxLnVzZXIudXNlcklkKTtcclxuXHJcbiAgICAgIGlmICghYXNzZXQpIHtcclxuICAgICAgICByZXR1cm4gc2VuZEVycm9yKHJlcywgJ0Fzc2V0IG5vdCBmb3VuZCcsIDQwNCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzZW5kU3VjY2VzcyhyZXMsIHsgYXNzZXQgfSk7XHJcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgIHJldHVybiBzZW5kRXJyb3IocmVzLCBlcnJvci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gZ2V0IGFzc2V0JywgNTAwKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBERUxFVEUgL2FwaS9hc3NldHMvOmlkXHJcbiAgICogU29mdCBkZWxldGUgYXNzZXRcclxuICAgKi9cclxuICBkZWxldGVBc3NldCA9IGFzeW5jIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpOiBQcm9taXNlPFJlc3BvbnNlPiA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBpZiAoIXJlcS51c2VyKSB7XHJcbiAgICAgICAgcmV0dXJuIHNlbmRFcnJvcihyZXMsICdOb3QgYXV0aGVudGljYXRlZCcsIDQwMSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XHJcblxyXG4gICAgICBjb25zdCBkZWxldGVkID0gYXdhaXQgdGhpcy5hc3NldFNlcnZpY2Uuc29mdERlbGV0ZShpZCwgcmVxLnVzZXIudXNlcklkKTtcclxuXHJcbiAgICAgIGlmICghZGVsZXRlZCkge1xyXG4gICAgICAgIHJldHVybiBzZW5kRXJyb3IocmVzLCAnQXNzZXQgbm90IGZvdW5kIG9yIGFscmVhZHkgZGVsZXRlZCcsIDQwNCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzZW5kU3VjY2VzcyhyZXMsIG51bGwsICdBc3NldCBkZWxldGVkIHN1Y2Nlc3NmdWxseScpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICByZXR1cm4gc2VuZEVycm9yKHJlcywgZXJyb3IubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGRlbGV0ZSBhc3NldCcsIDUwMCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUFVUIC9hcGkvYXNzZXRzLzppZC9yZXN0b3JlXHJcbiAgICogUmVzdG9yZSBzb2Z0LWRlbGV0ZWQgYXNzZXQgKHdpdGhpbiA5MCBob3VycylcclxuICAgKi9cclxuICByZXN0b3JlQXNzZXQgPSBhc3luYyAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKTogUHJvbWlzZTxSZXNwb25zZT4gPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgaWYgKCFyZXEudXNlcikge1xyXG4gICAgICAgIHJldHVybiBzZW5kRXJyb3IocmVzLCAnTm90IGF1dGhlbnRpY2F0ZWQnLCA0MDEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xyXG5cclxuICAgICAgY29uc3QgcmVzdG9yZWQgPSBhd2FpdCB0aGlzLmFzc2V0U2VydmljZS5yZXN0b3JlKGlkLCByZXEudXNlci51c2VySWQpO1xyXG5cclxuICAgICAgaWYgKCFyZXN0b3JlZCkge1xyXG4gICAgICAgIHJldHVybiBzZW5kRXJyb3IocmVzLCAnQXNzZXQgbm90IGZvdW5kIG9yIGFscmVhZHkgYWN0aXZlJywgNDA0KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHNlbmRTdWNjZXNzKHJlcywgbnVsbCwgJ0Fzc2V0IHJlc3RvcmVkIHN1Y2Nlc3NmdWxseScpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICByZXR1cm4gc2VuZEVycm9yKHJlcywgZXJyb3IubWVzc2FnZSB8fCAnRmFpbGVkIHRvIHJlc3RvcmUgYXNzZXQnLCA1MDApO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEdFVCAvYXBpL2Fzc2V0cy86aWQvc3RhdHNcclxuICAgKiBHZXQgYmFuZHdpZHRoIHN0YXRpc3RpY3MgZm9yIGFuIGFzc2V0XHJcbiAgICovXHJcbiAgZ2V0QXNzZXRTdGF0cyA9IGFzeW5jIChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpOiBQcm9taXNlPFJlc3BvbnNlPiA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBpZiAoIXJlcS51c2VyKSB7XHJcbiAgICAgICAgcmV0dXJuIHNlbmRFcnJvcihyZXMsICdOb3QgYXV0aGVudGljYXRlZCcsIDQwMSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XHJcblxyXG4gICAgICAvLyBDaGVjayBvd25lcnNoaXBcclxuICAgICAgY29uc3QgYXNzZXQgPSBhd2FpdCB0aGlzLmFzc2V0U2VydmljZS5nZXRCeUlkKGlkLCByZXEudXNlci51c2VySWQpO1xyXG4gICAgICBpZiAoIWFzc2V0KSB7XHJcbiAgICAgICAgcmV0dXJuIHNlbmRFcnJvcihyZXMsICdBc3NldCBub3QgZm91bmQnLCA0MDQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBzdGF0cyA9IGF3YWl0IHRoaXMuYXNzZXRTZXJ2aWNlLmdldEFzc2V0QmFuZHdpZHRoU3RhdHMoaWQpO1xyXG5cclxuICAgICAgcmV0dXJuIHNlbmRTdWNjZXNzKHJlcywge1xyXG4gICAgICAgIGFzc2V0OiB7XHJcbiAgICAgICAgICBpZDogYXNzZXQuX2lkLFxyXG4gICAgICAgICAgbmFtZTogYXNzZXQubmFtZSxcclxuICAgICAgICAgIGNsb3VkZnJvbnRVcmw6IGFzc2V0LmNsb3VkZnJvbnRVcmwsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdGF0czoge1xyXG4gICAgICAgICAgdG90YWxCYW5kd2lkdGhCeXRlczogc3RhdHMudG90YWxCeXRlcyxcclxuICAgICAgICAgIHRvdGFsQmFuZHdpZHRoTUI6IChzdGF0cy50b3RhbEJ5dGVzIC8gMTAyNCAvIDEwMjQpLnRvRml4ZWQoMiksXHJcbiAgICAgICAgICB0b3RhbFJlcXVlc3RzOiBzdGF0cy50b3RhbFJlcXVlc3RzLFxyXG4gICAgICAgICAgY2FjaGVIaXRSYXRpbzogc3RhdHMuaGl0UmF0aW8udG9GaXhlZCgyKSArICclJyxcclxuICAgICAgICB9LFxyXG4gICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgcmV0dXJuIHNlbmRFcnJvcihyZXMsIGVycm9yLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBnZXQgYXNzZXQgc3RhdHMnLCA1MDApO1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuIl19