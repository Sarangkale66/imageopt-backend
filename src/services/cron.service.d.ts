export declare class CronService {
    private cleanupService;
    constructor();
    /**
     * Start all cron jobs
     */
    startCronJobs(): void;
    /**
     * For testing: Run cleanup immediately
     */
    runCleanupNow(): Promise<any>;
}
