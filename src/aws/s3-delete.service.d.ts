export declare class S3DeleteService {
    private s3Client;
    constructor();
    /**
     * Delete file from S3
     */
    deleteFile(bucket: string, key: string): Promise<boolean>;
    /**
     * Delete multiple files from S3
     */
    deleteMultipleFiles(files: Array<{
        bucket: string;
        key: string;
    }>): Promise<{
        success: number;
        failed: number;
    }>;
}
