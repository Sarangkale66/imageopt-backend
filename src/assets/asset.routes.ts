// assets/asset.routes.ts
// Asset management routes

import { Router } from 'express';
import { AssetController } from './asset.controller';
import { authMiddleware} from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();
const assetController = new AssetController();

// All asset routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/assets/upload-url
 * @desc    Generate presigned S3 upload URL
 * @access  Private
 */
router.post('/upload-url', assetController.generateUploadUrl);

/**
 * @route   POST /api/assets/direct-upload
 * @desc    Direct file upload via form-data
 * @access  Private
 */
router.post('/direct-upload', upload.single('file'), assetController.directUpload);

/**
 * @route   POST /api/assets
 * @desc    Create asset metadata after upload
 * @access  Private
 */
router.post('/', assetController.createAsset);

/**
 * @route   GET /api/assets
 * @desc    List user's assets
 * @access  Private
 */
router.get('/', assetController.listAssets);

/**
 * @route   GET /api/assets/folders
 * @desc    Get list of user's folders
 * @access  Private
 */
router.get('/folders', assetController.listFolders);

/**
 * @route   GET /api/assets/folders/:folder
 * @desc    Get assets in a specific folder
 * @access  Private
 */
router.get('/folders/:folder', assetController.getAssetsByFolder);

/**
 * @route   GET /api/assets/:id
 * @desc    Get single asset
 * @access  Private
 */
router.get('/:id', assetController.getAsset);

/**
 * @route   GET /api/assets/:id/stats
 * @desc    Get asset bandwidth statistics
 * @access  Private
 */
router.get('/:id/stats', assetController.getAssetStats);

/**
 * @route   GET /api/assets/:id/signed-url
 * @desc    Generate time-limited signed CloudFront URL
 * @access  Private
 */
router.get('/:id/signed-url', assetController.getSignedAssetUrl);

/**
 * @route   PUT /api/assets/:id/restore
 * @desc    Restore soft-deleted asset
 * @access  Private
 */
router.put('/:id/restore', assetController.restoreAsset);

/**
 * @route   DELETE /api/assets/:id
 * @desc    Delete asset (soft delete)
 * @access  Private
 */
router.delete('/:id', assetController.deleteAsset);

/**
 * @route   PUT /api/assets/:id/make-private
 * @desc    Move asset to private folder (requires signed URL)
 * @access  Private
 */
router.put('/:id/make-private', assetController.makePrivate);

/**
 * @route   PUT /api/assets/:id/make-public
 * @desc    Move asset from private to public folder
 * @access  Private
 */
router.put('/:id/make-public', assetController.makePublic);

/**
 * @route   POST /api/assets/:id/invalidate-cache
 * @desc    Clear CloudFront cache for asset (all transformations)
 * @access  Private
 */
router.post('/:id/invalidate-cache', assetController.invalidateCache);

export default router;
