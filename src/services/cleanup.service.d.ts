export declare class CleanupService {
    private s3DeleteService;
    constructor();
    /**
     * Delete assets from S3 that were soft-deleted more than ASSET_RETENTION_HOURS ago
     */
    cleanupOldDeletedAssets(): Promise<{
        checked: number;
        deletedFromS3: number;
        deletedFromDB: number;
        errors: number;
    }>;
    /**
     * Manual trigger for cleanup (for testing)
     */
    triggerManualCleanup(): Promise<any>;
}
