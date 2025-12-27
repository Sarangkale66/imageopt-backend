export declare class S3Service {
    private s3Client;
    constructor();
    /**
     * Generate presigned URL for S3 upload
     * @param fileName Original file name
     * @param fileType MIME type
     * @param fileSizeBytes File size in bytes
     * @param userId User ID for organizing files
     * @param customFolder Optional custom folder name (e.g., 'profile-images', 'products')
     * @param customFileName Optional custom filename (if not provided, uses original fileName)
     */
    generatePresignedUploadUrl(fileName: string, fileType: string, fileSizeBytes: number, userId: string, customFolder?: string, customFileName?: string): Promise<{
        uploadUrl: string;
        s3Key: string;
        s3Bucket: string;
    }>;
    /**
     * Generate CloudFront URL for an S3 key
     */
    generateCloudfrontUrl(s3Key: string): string;
    /**
     * Sanitize folder path (remove dangerous characters)
     */
    private sanitizePath;
    /**
     * Extract file extension from filename
     */
    private getFileExtension;
    /**
     * Determine asset type from MIME type
     */
    getAssetType(mimeType: string): 'image' | 'video' | 'file';
}
