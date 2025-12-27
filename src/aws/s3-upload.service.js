"use strict";
// aws/s3-upload.service.ts
// Direct S3 upload (not presigned URL)
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3UploadService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = require("../config/env");
const crypto_1 = require("crypto");
class S3UploadService {
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
     * Upload file buffer directly to S3
     */
    async uploadFile(fileBuffer, fileName, mimeType, userId, folder, customFileName) {
        // Generate S3 key
        let s3Key;
        if (folder && customFileName) {
            const sanitizedFolder = this.sanitizePath(folder);
            s3Key = `${userId}/${sanitizedFolder}/${customFileName}`;
        }
        else if (folder) {
            const sanitizedFolder = this.sanitizePath(folder);
            const timestamp = Date.now();
            const randomId = crypto_1.default.randomBytes(8).toString('hex');
            const extension = this.getFileExtension(fileName);
            s3Key = `${userId}/${sanitizedFolder}/${timestamp}-${randomId}${extension}`;
        }
        else {
            const timestamp = Date.now();
            const randomId = crypto_1.default.randomBytes(8).toString('hex');
            const extension = this.getFileExtension(fileName);
            s3Key = `users/${userId}/${timestamp}-${randomId}${extension}`;
        }
        // Upload to S3
        const command = new client_s3_1.PutObjectCommand({
            Bucket: env_1.env.S3_ORIGINAL_BUCKET,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: mimeType,
            Metadata: {
                uploadedBy: userId,
                originalName: fileName,
            },
        });
        await this.s3Client.send(command);
        return {
            s3Key,
            s3Bucket: env_1.env.S3_ORIGINAL_BUCKET,
        };
    }
    /**
     * Sanitize folder path
     */
    sanitizePath(path) {
        return path
            .replace(/[^a-zA-Z0-9-_/]/g, '-')
            .replace(/\.\.+/g, '')
            .replace(/^\/+|\/+$/g, '')
            .toLowerCase();
    }
    /**
     * Get file extension
     */
    getFileExtension(fileName) {
        const lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex === -1)
            return '';
        return fileName.substring(lastDotIndex);
    }
}
exports.S3UploadService = S3UploadService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczMtdXBsb2FkLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzMy11cGxvYWQuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsMkJBQTJCO0FBQzNCLHVDQUF1Qzs7O0FBRXZDLGtEQUFnRTtBQUNoRSx1Q0FBb0M7QUFDcEMsbUNBQTRCO0FBRTVCLE1BQWEsZUFBZTtJQUcxQjtRQUNFLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxvQkFBUSxDQUFDO1lBQzNCLE1BQU0sRUFBRSxTQUFHLENBQUMsVUFBVTtZQUN0QixXQUFXLEVBQUU7Z0JBQ1gsV0FBVyxFQUFFLFNBQUcsQ0FBQyxpQkFBaUI7Z0JBQ2xDLGVBQWUsRUFBRSxTQUFHLENBQUMscUJBQXFCO2FBQzNDO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLFVBQVUsQ0FDZCxVQUFrQixFQUNsQixRQUFnQixFQUNoQixRQUFnQixFQUNoQixNQUFjLEVBQ2QsTUFBZSxFQUNmLGNBQXVCO1FBRXZCLGtCQUFrQjtRQUNsQixJQUFJLEtBQWEsQ0FBQztRQUVsQixJQUFJLE1BQU0sSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUM3QixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xELEtBQUssR0FBRyxHQUFHLE1BQU0sSUFBSSxlQUFlLElBQUksY0FBYyxFQUFFLENBQUM7UUFDM0QsQ0FBQzthQUFNLElBQUksTUFBTSxFQUFFLENBQUM7WUFDbEIsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDN0IsTUFBTSxRQUFRLEdBQUcsZ0JBQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsRCxLQUFLLEdBQUcsR0FBRyxNQUFNLElBQUksZUFBZSxJQUFJLFNBQVMsSUFBSSxRQUFRLEdBQUcsU0FBUyxFQUFFLENBQUM7UUFDOUUsQ0FBQzthQUFNLENBQUM7WUFDTixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDN0IsTUFBTSxRQUFRLEdBQUcsZ0JBQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3ZELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsRCxLQUFLLEdBQUcsU0FBUyxNQUFNLElBQUksU0FBUyxJQUFJLFFBQVEsR0FBRyxTQUFTLEVBQUUsQ0FBQztRQUNqRSxDQUFDO1FBRUQsZUFBZTtRQUNmLE1BQU0sT0FBTyxHQUFHLElBQUksNEJBQWdCLENBQUM7WUFDbkMsTUFBTSxFQUFFLFNBQUcsQ0FBQyxrQkFBa0I7WUFDOUIsR0FBRyxFQUFFLEtBQUs7WUFDVixJQUFJLEVBQUUsVUFBVTtZQUNoQixXQUFXLEVBQUUsUUFBUTtZQUNyQixRQUFRLEVBQUU7Z0JBQ1IsVUFBVSxFQUFFLE1BQU07Z0JBQ2xCLFlBQVksRUFBRSxRQUFRO2FBQ3ZCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVsQyxPQUFPO1lBQ0wsS0FBSztZQUNMLFFBQVEsRUFBRSxTQUFHLENBQUMsa0JBQWtCO1NBQ2pDLENBQUM7SUFDSixDQUFDO0lBRUQ7O09BRUc7SUFDSyxZQUFZLENBQUMsSUFBWTtRQUMvQixPQUFPLElBQUk7YUFDUixPQUFPLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxDQUFDO2FBQ2hDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO2FBQ3JCLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDO2FBQ3pCLFdBQVcsRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFRDs7T0FFRztJQUNLLGdCQUFnQixDQUFDLFFBQWdCO1FBQ3ZDLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDL0MsSUFBSSxZQUFZLEtBQUssQ0FBQyxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUM7UUFDbkMsT0FBTyxRQUFRLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzFDLENBQUM7Q0FDRjtBQWxGRCwwQ0FrRkMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBhd3MvczMtdXBsb2FkLnNlcnZpY2UudHNcclxuLy8gRGlyZWN0IFMzIHVwbG9hZCAobm90IHByZXNpZ25lZCBVUkwpXHJcblxyXG5pbXBvcnQgeyBTM0NsaWVudCwgUHV0T2JqZWN0Q29tbWFuZCB9IGZyb20gJ0Bhd3Mtc2RrL2NsaWVudC1zMyc7XHJcbmltcG9ydCB7IGVudiB9IGZyb20gJy4uL2NvbmZpZy9lbnYnO1xyXG5pbXBvcnQgY3J5cHRvIGZyb20gJ2NyeXB0byc7XHJcblxyXG5leHBvcnQgY2xhc3MgUzNVcGxvYWRTZXJ2aWNlIHtcclxuICBwcml2YXRlIHMzQ2xpZW50OiBTM0NsaWVudDtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLnMzQ2xpZW50ID0gbmV3IFMzQ2xpZW50KHtcclxuICAgICAgcmVnaW9uOiBlbnYuQVdTX1JFR0lPTixcclxuICAgICAgY3JlZGVudGlhbHM6IHtcclxuICAgICAgICBhY2Nlc3NLZXlJZDogZW52LkFXU19BQ0NFU1NfS0VZX0lELFxyXG4gICAgICAgIHNlY3JldEFjY2Vzc0tleTogZW52LkFXU19TRUNSRVRfQUNDRVNTX0tFWSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBsb2FkIGZpbGUgYnVmZmVyIGRpcmVjdGx5IHRvIFMzXHJcbiAgICovXHJcbiAgYXN5bmMgdXBsb2FkRmlsZShcclxuICAgIGZpbGVCdWZmZXI6IEJ1ZmZlcixcclxuICAgIGZpbGVOYW1lOiBzdHJpbmcsXHJcbiAgICBtaW1lVHlwZTogc3RyaW5nLFxyXG4gICAgdXNlcklkOiBzdHJpbmcsXHJcbiAgICBmb2xkZXI/OiBzdHJpbmcsXHJcbiAgICBjdXN0b21GaWxlTmFtZT86IHN0cmluZ1xyXG4gICk6IFByb21pc2U8eyBzM0tleTogc3RyaW5nOyBzM0J1Y2tldDogc3RyaW5nIH0+IHtcclxuICAgIC8vIEdlbmVyYXRlIFMzIGtleVxyXG4gICAgbGV0IHMzS2V5OiBzdHJpbmc7XHJcblxyXG4gICAgaWYgKGZvbGRlciAmJiBjdXN0b21GaWxlTmFtZSkge1xyXG4gICAgICBjb25zdCBzYW5pdGl6ZWRGb2xkZXIgPSB0aGlzLnNhbml0aXplUGF0aChmb2xkZXIpO1xyXG4gICAgICBzM0tleSA9IGAke3VzZXJJZH0vJHtzYW5pdGl6ZWRGb2xkZXJ9LyR7Y3VzdG9tRmlsZU5hbWV9YDtcclxuICAgIH0gZWxzZSBpZiAoZm9sZGVyKSB7XHJcbiAgICAgIGNvbnN0IHNhbml0aXplZEZvbGRlciA9IHRoaXMuc2FuaXRpemVQYXRoKGZvbGRlcik7XHJcbiAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IERhdGUubm93KCk7XHJcbiAgICAgIGNvbnN0IHJhbmRvbUlkID0gY3J5cHRvLnJhbmRvbUJ5dGVzKDgpLnRvU3RyaW5nKCdoZXgnKTtcclxuICAgICAgY29uc3QgZXh0ZW5zaW9uID0gdGhpcy5nZXRGaWxlRXh0ZW5zaW9uKGZpbGVOYW1lKTtcclxuICAgICAgczNLZXkgPSBgJHt1c2VySWR9LyR7c2FuaXRpemVkRm9sZGVyfS8ke3RpbWVzdGFtcH0tJHtyYW5kb21JZH0ke2V4dGVuc2lvbn1gO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgdGltZXN0YW1wID0gRGF0ZS5ub3coKTtcclxuICAgICAgY29uc3QgcmFuZG9tSWQgPSBjcnlwdG8ucmFuZG9tQnl0ZXMoOCkudG9TdHJpbmcoJ2hleCcpO1xyXG4gICAgICBjb25zdCBleHRlbnNpb24gPSB0aGlzLmdldEZpbGVFeHRlbnNpb24oZmlsZU5hbWUpO1xyXG4gICAgICBzM0tleSA9IGB1c2Vycy8ke3VzZXJJZH0vJHt0aW1lc3RhbXB9LSR7cmFuZG9tSWR9JHtleHRlbnNpb259YDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGxvYWQgdG8gUzNcclxuICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgUHV0T2JqZWN0Q29tbWFuZCh7XHJcbiAgICAgIEJ1Y2tldDogZW52LlMzX09SSUdJTkFMX0JVQ0tFVCxcclxuICAgICAgS2V5OiBzM0tleSxcclxuICAgICAgQm9keTogZmlsZUJ1ZmZlcixcclxuICAgICAgQ29udGVudFR5cGU6IG1pbWVUeXBlLFxyXG4gICAgICBNZXRhZGF0YToge1xyXG4gICAgICAgIHVwbG9hZGVkQnk6IHVzZXJJZCxcclxuICAgICAgICBvcmlnaW5hbE5hbWU6IGZpbGVOYW1lLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcblxyXG4gICAgYXdhaXQgdGhpcy5zM0NsaWVudC5zZW5kKGNvbW1hbmQpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHMzS2V5LFxyXG4gICAgICBzM0J1Y2tldDogZW52LlMzX09SSUdJTkFMX0JVQ0tFVCxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTYW5pdGl6ZSBmb2xkZXIgcGF0aFxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2FuaXRpemVQYXRoKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gcGF0aFxyXG4gICAgICAucmVwbGFjZSgvW15hLXpBLVowLTktXy9dL2csICctJylcclxuICAgICAgLnJlcGxhY2UoL1xcLlxcLisvZywgJycpXHJcbiAgICAgIC5yZXBsYWNlKC9eXFwvK3xcXC8rJC9nLCAnJylcclxuICAgICAgLnRvTG93ZXJDYXNlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgZmlsZSBleHRlbnNpb25cclxuICAgKi9cclxuICBwcml2YXRlIGdldEZpbGVFeHRlbnNpb24oZmlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBsYXN0RG90SW5kZXggPSBmaWxlTmFtZS5sYXN0SW5kZXhPZignLicpO1xyXG4gICAgaWYgKGxhc3REb3RJbmRleCA9PT0gLTEpIHJldHVybiAnJztcclxuICAgIHJldHVybiBmaWxlTmFtZS5zdWJzdHJpbmcobGFzdERvdEluZGV4KTtcclxuICB9XHJcbn1cclxuIl19