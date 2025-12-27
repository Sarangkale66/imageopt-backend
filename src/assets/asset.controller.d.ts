import { Request, Response } from 'express';
export declare class AssetController {
    private assetService;
    private s3Service;
    private s3UploadService;
    constructor();
    /**
     * POST /api/assets/upload-url
     * Generate presigned URL for S3 upload
     */
    generateUploadUrl: (req: Request, res: Response) => Promise<Response>;
    /**
     * POST /api/assets/direct-upload
     * Direct file upload via form-data (multipart/form-data)
     */
    directUpload: (req: Request, res: Response) => Promise<Response>;
    /**
     * POST /api/assets
     * Save asset metadata after successful S3 upload
     */
    createAsset: (req: Request, res: Response) => Promise<Response>;
    /**
     * GET /api/assets
     * Get user's assets (paginated)
     */
    listAssets: (req: Request, res: Response) => Promise<Response>;
    /**
     * GET /api/assets/:id
     * Get single asset details
     */
    getAsset: (req: Request, res: Response) => Promise<Response>;
    /**
     * DELETE /api/assets/:id
     * Soft delete asset
     */
    deleteAsset: (req: Request, res: Response) => Promise<Response>;
    /**
     * PUT /api/assets/:id/restore
     * Restore soft-deleted asset (within 90 hours)
     */
    restoreAsset: (req: Request, res: Response) => Promise<Response>;
    /**
     * GET /api/assets/:id/stats
     * Get bandwidth statistics for an asset
     */
    getAssetStats: (req: Request, res: Response) => Promise<Response>;
}
