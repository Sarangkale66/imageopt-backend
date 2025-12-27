"use strict";
// aws/s3-delete.service.ts
// S3 file deletion service
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3DeleteService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = require("../config/env");
class S3DeleteService {
    constructor() {
        this.s3Client = new client_s3_1.S3Client({
            region: env_1.env.AWS_REGION,
            credentials: {
                accessKeyId: env_1.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env_1.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    /**
     * Delete file from S3
     */
    async deleteFile(bucket, key) {
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            });
            await this.s3Client.send(command);
            console.log(`✅ Deleted from S3: ${key}`);
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to delete from S3: ${key}`, error.message);
            return false;
        }
    }
    /**
     * Delete multiple files from S3
     */
    async deleteMultipleFiles(files) {
        let success = 0;
        let failed = 0;
        for (const file of files) {
            const deleted = await this.deleteFile(file.bucket, file.key);
            if (deleted) {
                success++;
            }
            else {
                failed++;
            }
        }
        return { success, failed };
    }
}
exports.S3DeleteService = S3DeleteService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczMtZGVsZXRlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzMy1kZWxldGUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsMkJBQTJCO0FBQzNCLDJCQUEyQjs7O0FBRTNCLGtEQUFtRTtBQUNuRSx1Q0FBb0M7QUFFcEMsTUFBYSxlQUFlO0lBRzFCO1FBQ0UsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLG9CQUFRLENBQUM7WUFDM0IsTUFBTSxFQUFFLFNBQUcsQ0FBQyxVQUFVO1lBQ3RCLFdBQVcsRUFBRTtnQkFDWCxXQUFXLEVBQUUsU0FBRyxDQUFDLGlCQUFpQjtnQkFDbEMsZUFBZSxFQUFFLFNBQUcsQ0FBQyxxQkFBcUI7YUFDM0M7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQWMsRUFBRSxHQUFXO1FBQzFDLElBQUksQ0FBQztZQUNILE1BQU0sT0FBTyxHQUFHLElBQUksK0JBQW1CLENBQUM7Z0JBQ3RDLE1BQU0sRUFBRSxNQUFNO2dCQUNkLEdBQUcsRUFBRSxHQUFHO2FBQ1QsQ0FBQyxDQUFDO1lBRUgsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7WUFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQywrQkFBK0IsR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25FLE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxtQkFBbUIsQ0FDdkIsS0FBNkM7UUFFN0MsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztRQUVmLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFLENBQUM7WUFDekIsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzdELElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ1osT0FBTyxFQUFFLENBQUM7WUFDWixDQUFDO2lCQUFNLENBQUM7Z0JBQ04sTUFBTSxFQUFFLENBQUM7WUFDWCxDQUFDO1FBQ0gsQ0FBQztRQUVELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUM7SUFDN0IsQ0FBQztDQUNGO0FBcERELDBDQW9EQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGF3cy9zMy1kZWxldGUuc2VydmljZS50c1xyXG4vLyBTMyBmaWxlIGRlbGV0aW9uIHNlcnZpY2VcclxuXHJcbmltcG9ydCB7IFMzQ2xpZW50LCBEZWxldGVPYmplY3RDb21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LXMzJztcclxuaW1wb3J0IHsgZW52IH0gZnJvbSAnLi4vY29uZmlnL2Vudic7XHJcblxyXG5leHBvcnQgY2xhc3MgUzNEZWxldGVTZXJ2aWNlIHtcclxuICBwcml2YXRlIHMzQ2xpZW50OiBTM0NsaWVudDtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLnMzQ2xpZW50ID0gbmV3IFMzQ2xpZW50KHtcclxuICAgICAgcmVnaW9uOiBlbnYuQVdTX1JFR0lPTixcclxuICAgICAgY3JlZGVudGlhbHM6IHtcclxuICAgICAgICBhY2Nlc3NLZXlJZDogZW52LkFXU19BQ0NFU1NfS0VZX0lELFxyXG4gICAgICAgIHNlY3JldEFjY2Vzc0tleTogZW52LkFXU19TRUNSRVRfQUNDRVNTX0tFWSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGVsZXRlIGZpbGUgZnJvbSBTM1xyXG4gICAqL1xyXG4gIGFzeW5jIGRlbGV0ZUZpbGUoYnVja2V0OiBzdHJpbmcsIGtleTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBjb21tYW5kID0gbmV3IERlbGV0ZU9iamVjdENvbW1hbmQoe1xyXG4gICAgICAgIEJ1Y2tldDogYnVja2V0LFxyXG4gICAgICAgIEtleToga2V5LFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGF3YWl0IHRoaXMuczNDbGllbnQuc2VuZChjb21tYW5kKTtcclxuICAgICAgY29uc29sZS5sb2coYOKchSBEZWxldGVkIGZyb20gUzM6ICR7a2V5fWApO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihg4p2MIEZhaWxlZCB0byBkZWxldGUgZnJvbSBTMzogJHtrZXl9YCwgZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERlbGV0ZSBtdWx0aXBsZSBmaWxlcyBmcm9tIFMzXHJcbiAgICovXHJcbiAgYXN5bmMgZGVsZXRlTXVsdGlwbGVGaWxlcyhcclxuICAgIGZpbGVzOiBBcnJheTx7IGJ1Y2tldDogc3RyaW5nOyBrZXk6IHN0cmluZyB9PlxyXG4gICk6IFByb21pc2U8eyBzdWNjZXNzOiBudW1iZXI7IGZhaWxlZDogbnVtYmVyIH0+IHtcclxuICAgIGxldCBzdWNjZXNzID0gMDtcclxuICAgIGxldCBmYWlsZWQgPSAwO1xyXG5cclxuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xyXG4gICAgICBjb25zdCBkZWxldGVkID0gYXdhaXQgdGhpcy5kZWxldGVGaWxlKGZpbGUuYnVja2V0LCBmaWxlLmtleSk7XHJcbiAgICAgIGlmIChkZWxldGVkKSB7XHJcbiAgICAgICAgc3VjY2VzcysrO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZhaWxlZCsrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHsgc3VjY2VzcywgZmFpbGVkIH07XHJcbiAgfVxyXG59XHJcbiJdfQ==