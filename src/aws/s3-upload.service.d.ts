/// <reference types="node" />
export declare class S3UploadService {
    private s3Client;
    constructor();
    /**
     * Upload file buffer directly to S3
     */
    uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string, userId: string, folder?: string, customFileName?: string): Promise<{
        s3Key: string;
        s3Bucket: string;
    }>;
    /**
     * Sanitize folder path
     */
    private sanitizePath;
    /**
     * Get file extension
     */
    private getFileExtension;
}
