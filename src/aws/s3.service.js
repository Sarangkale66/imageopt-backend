"use strict";
// aws/s3.service.ts
// S3 service for presigned URL generation
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const env_1 = require("../config/env");
const crypto_1 = require("crypto");
class S3Service {
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
     * Generate presigned URL for S3 upload
     * @param fileName Original file name
     * @param fileType MIME type
     * @param fileSizeBytes File size in bytes
     * @param userId User ID for organizing files
     * @param customFolder Optional custom folder name (e.g., 'profile-images', 'products')
     * @param customFileName Optional custom filename (if not provided, uses original fileName)
     */
    async generatePresignedUploadUrl(fileName, fileType, fileSizeBytes, userId, customFolder, customFileName) {
        // Validate file size
        const maxSizeBytes = env_1.env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;
        if (fileSizeBytes > maxSizeBytes) {
            throw new Error(`File size exceeds maximum of ${env_1.env.MAX_UPLOAD_SIZE_MB}MB`);
        }
        // Generate S3 key with custom folder support
        let s3Key;
        if (customFolder && customFileName) {
            // User-specified folder and filename: {userId}/{customFolder}/{customFileName}
            const sanitizedFolder = this.sanitizePath(customFolder);
            const sanitizedFileName = customFileName || fileName;
            s3Key = `${userId}/${sanitizedFolder}/${sanitizedFileName}`;
        }
        else if (customFolder) {
            // Custom folder with auto-generated filename
            const sanitizedFolder = this.sanitizePath(customFolder);
            const timestamp = Date.now();
            const randomId = crypto_1.default.randomBytes(8).toString('hex');
            const extension = this.getFileExtension(fileName);
            s3Key = `${userId}/${sanitizedFolder}/${timestamp}-${randomId}${extension}`;
        }
        else {
            // Default: users/{userId}/{timestamp}-{random}{ext}
            const timestamp = Date.now();
            const randomId = crypto_1.default.randomBytes(8).toString('hex');
            const extension = this.getFileExtension(fileName);
            s3Key = `users/${userId}/${timestamp}-${randomId}${extension}`;
        }
        // Create presigned URL for PUT operation
        const command = new client_s3_1.PutObjectCommand({
            Bucket: env_1.env.S3_ORIGINAL_BUCKET,
            Key: s3Key,
            ContentType: fileType,
            // Optional: Add metadata
            Metadata: {
                uploadedBy: userId,
                originalName: fileName,
            },
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, {
            expiresIn: env_1.env.PRESIGNED_URL_EXPIRY_SECONDS, // 15 minutes default
        });
        return {
            uploadUrl,
            s3Key,
            s3Bucket: env_1.env.S3_ORIGINAL_BUCKET,
        };
    }
    /**
     * Generate CloudFront URL for an S3 key
     */
    generateCloudfrontUrl(s3Key) {
        return `https://${env_1.env.CLOUDFRONT_DOMAIN}/${s3Key}`;
    }
    /**
     * Sanitize folder path (remove dangerous characters)
     */
    sanitizePath(path) {
        return path
            .replace(/[^a-zA-Z0-9-_/]/g, '-') // Replace special chars with dash
            .replace(/\.\.+/g, '') // Remove parent directory references
            .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
            .toLowerCase();
    }
    /**
     * Extract file extension from filename
     */
    getFileExtension(fileName) {
        const lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex === -1)
            return '';
        return fileName.substring(lastDotIndex);
    }
    /**
     * Determine asset type from MIME type
     */
    getAssetType(mimeType) {
        if (mimeType.startsWith('image/'))
            return 'image';
        if (mimeType.startsWith('video/'))
            return 'video';
        return 'file';
    }
}
exports.S3Service = S3Service;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczMuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInMzLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLG9CQUFvQjtBQUNwQiwwQ0FBMEM7OztBQUUxQyxrREFBZ0U7QUFDaEUsd0VBQTZEO0FBQzdELHVDQUFvQztBQUNwQyxtQ0FBNEI7QUFFNUIsTUFBYSxTQUFTO0lBR3BCO1FBQ0UsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLG9CQUFRLENBQUM7WUFDM0IsTUFBTSxFQUFFLFNBQUcsQ0FBQyxVQUFVO1lBQ3RCLFdBQVcsRUFBRTtnQkFDWCxXQUFXLEVBQUUsU0FBRyxDQUFDLGlCQUFpQjtnQkFDbEMsZUFBZSxFQUFFLFNBQUcsQ0FBQyxxQkFBcUI7YUFDM0M7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSCxLQUFLLENBQUMsMEJBQTBCLENBQzlCLFFBQWdCLEVBQ2hCLFFBQWdCLEVBQ2hCLGFBQXFCLEVBQ3JCLE1BQWMsRUFDZCxZQUFxQixFQUNyQixjQUF1QjtRQUV2QixxQkFBcUI7UUFDckIsTUFBTSxZQUFZLEdBQUcsU0FBRyxDQUFDLGtCQUFrQixHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7UUFDMUQsSUFBSSxhQUFhLEdBQUcsWUFBWSxFQUFFLENBQUM7WUFDakMsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsU0FBRyxDQUFDLGtCQUFrQixJQUFJLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBRUQsNkNBQTZDO1FBQzdDLElBQUksS0FBYSxDQUFDO1FBRWxCLElBQUksWUFBWSxJQUFJLGNBQWMsRUFBRSxDQUFDO1lBQ25DLCtFQUErRTtZQUMvRSxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3hELE1BQU0saUJBQWlCLEdBQUcsY0FBYyxJQUFJLFFBQVEsQ0FBQztZQUNyRCxLQUFLLEdBQUcsR0FBRyxNQUFNLElBQUks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LE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7Q0FDRjtBQXJIRCw4QkFxSEMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBhd3MvczMuc2VydmljZS50c1xyXG4vLyBTMyBzZXJ2aWNlIGZvciBwcmVzaWduZWQgVVJMIGdlbmVyYXRpb25cclxuXHJcbmltcG9ydCB7IFMzQ2xpZW50LCBQdXRPYmplY3RDb21tYW5kIH0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LXMzJztcclxuaW1wb3J0IHsgZ2V0U2lnbmVkVXJsIH0gZnJvbSAnQGF3cy1zZGsvczMtcmVxdWVzdC1wcmVzaWduZXInO1xyXG5pbXBvcnQgeyBlbnYgfSBmcm9tICcuLi9jb25maWcvZW52JztcclxuaW1wb3J0IGNyeXB0byBmcm9tICdjcnlwdG8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIFMzU2VydmljZSB7XHJcbiAgcHJpdmF0ZSBzM0NsaWVudDogUzNDbGllbnQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgdGhpcy5zM0NsaWVudCA9IG5ldyBTM0NsaWVudCh7XHJcbiAgICAgIHJlZ2lvbjogZW52LkFXU19SRUdJT04sXHJcbiAgICAgIGNyZWRlbnRpYWxzOiB7XHJcbiAgICAgICAgYWNjZXNzS2V5SWQ6IGVudi5BV1NfQUNDRVNTX0tFWV9JRCxcclxuICAgICAgICBzZWNyZXRBY2Nlc3NLZXk6IGVudi5BV1NfU0VDUkVUX0FDQ0VTU19LRVksXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdlbmVyYXRlIHByZXNpZ25lZCBVUkwgZm9yIFMzIHVwbG9hZFxyXG4gICAqIEBwYXJhbSBmaWxlTmFtZSBPcmlnaW5hbCBmaWxlIG5hbWVcclxuICAgKiBAcGFyYW0gZmlsZVR5cGUgTUlNRSB0eXBlXHJcbiAgICogQHBhcmFtIGZpbGVTaXplQnl0ZXMgRmlsZSBzaXplIGluIGJ5dGVzXHJcbiAgICogQHBhcmFtIHVzZXJJZCBVc2VyIElEIGZvciBvcmdhbml6aW5nIGZpbGVzXHJcbiAgICogQHBhcmFtIGN1c3RvbUZvbGRlciBPcHRpb25hbCBjdXN0b20gZm9sZGVyIG5hbWUgKGUuZy4sICdwcm9maWxlLWltYWdlcycsICdwcm9kdWN0cycpXHJcbiAgICogQHBhcmFtIGN1c3RvbUZpbGVOYW1lIE9wdGlvbmFsIGN1c3RvbSBmaWxlbmFtZSAoaWYgbm90IHByb3ZpZGVkLCB1c2VzIG9yaWdpbmFsIGZpbGVOYW1lKVxyXG4gICAqL1xyXG4gIGFzeW5jIGdlbmVyYXRlUHJlc2lnbmVkVXBsb2FkVXJsKFxyXG4gICAgZmlsZU5hbWU6IHN0cmluZyxcclxuICAgIGZpbGVUeXBlOiBzdHJpbmcsXHJcbiAgICBmaWxlU2l6ZUJ5dGVzOiBudW1iZXIsXHJcbiAgICB1c2VySWQ6IHN0cmluZyxcclxuICAgIGN1c3RvbUZvbGRlcj86IHN0cmluZyxcclxuICAgIGN1c3RvbUZpbGVOYW1lPzogc3RyaW5nXHJcbiAgKTogUHJvbWlzZTx7IHVwbG9hZFVybDogc3RyaW5nOyBzM0tleTogc3RyaW5nOyBzM0J1Y2tldDogc3RyaW5nIH0+IHtcclxuICAgIC8vIFZhbGlkYXRlIGZpbGUgc2l6ZVxyXG4gICAgY29uc3QgbWF4U2l6ZUJ5dGVzID0gZW52Lk1BWF9VUExPQURfU0laRV9NQiAqIDEwMjQgKiAxMDI0O1xyXG4gICAgaWYgKGZpbGVTaXplQnl0ZXMgPiBtYXhTaXplQnl0ZXMpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGaWxlIHNpemUgZXhjZWVkcyBtYXhpbXVtIG9mICR7ZW52Lk1BWF9VUExPQURfU0laRV9NQn1NQmApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdlbmVyYXRlIFMzIGtleSB3aXRoIGN1c3RvbSBmb2xkZXIgc3VwcG9ydFxyXG4gICAgbGV0IHMzS2V5OiBzdHJpbmc7XHJcbiAgICBcclxuICAgIGlmIChjdXN0b21Gb2xkZXIgJiYgY3VzdG9tRmlsZU5hbWUpIHtcclxuICAgICAgLy8gVXNlci1zcGVjaWZpZWQgZm9sZGVyIGFuZCBmaWxlbmFtZToge3VzZXJJZH0ve2N1c3RvbUZvbGRlcn0ve2N1c3RvbUZpbGVOYW1lfVxyXG4gICAgICBjb25zdCBzYW5pdGl6ZWRGb2xkZXIgPSB0aGlzLnNhbml0aXplUGF0aChjdXN0b21Gb2xkZXIpO1xyXG4gICAgICBjb25zdCBzYW5pdGl6ZWRGaWxlTmFtZSA9IGN1c3RvbUZpbGVOYW1lIHx8IGZpbGVOYW1lO1xyXG4gICAgICBzM0tleSA9IGAke3VzZXJJZH0vJHtzYW5pdGl6ZWRGb2xkZXJ9LyR7c2FuaXRpemVkRmlsZU5hbWV9YDtcclxuICAgIH0gZWxzZSBpZiAoY3VzdG9tRm9sZGVyKSB7XHJcbiAgICAgIC8vIEN1c3RvbSBmb2xkZXIgd2l0aCBhdXRvLWdlbmVyYXRlZCBmaWxlbmFtZVxyXG4gICAgICBjb25zdCBzYW5pdGl6ZWRGb2xkZXIgPSB0aGlzLnNhbml0aXplUGF0aChjdXN0b21Gb2xkZXIpO1xyXG4gICAgICBjb25zdCB0aW1lc3RhbXAgPSBEYXRlLm5vdygpO1xyXG4gICAgICBjb25zdCByYW5kb21JZCA9IGNyeXB0by5yYW5kb21CeXRlcyg4KS50b1N0cmluZygnaGV4Jyk7XHJcbiAgICAgIGNvbnN0IGV4dGVuc2lvbiA9IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbihmaWxlTmFtZSk7XHJcbiAgICAgIHMzS2V5ID0gYCR7dXNlcklkfS8ke3Nhbml0aXplZEZvbGRlcn0vJHt0aW1lc3RhbXB9LSR7cmFuZG9tSWR9JHtleHRlbnNpb259YDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIERlZmF1bHQ6IHVzZXJzL3t1c2VySWR9L3t0aW1lc3RhbXB9LXtyYW5kb219e2V4dH1cclxuICAgICAgY29uc3QgdGltZXN0YW1wID0gRGF0ZS5ub3coKTtcclxuICAgICAgY29uc3QgcmFuZG9tSWQgPSBjcnlwdG8ucmFuZG9tQnl0ZXMoOCkudG9TdHJpbmcoJ2hleCcpO1xyXG4gICAgICBjb25zdCBleHRlbnNpb24gPSB0aGlzLmdldEZpbGVFeHRlbnNpb24oZmlsZU5hbWUpO1xyXG4gICAgICBzM0tleSA9IGB1c2Vycy8ke3VzZXJJZH0vJHt0aW1lc3RhbXB9LSR7cmFuZG9tSWR9JHtleHRlbnNpb259YDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgcHJlc2lnbmVkIFVSTCBmb3IgUFVUIG9wZXJhdGlvblxyXG4gICAgY29uc3QgY29tbWFuZCA9IG5ldyBQdXRPYmplY3RDb21tYW5kKHtcclxuICAgICAgQnVja2V0OiBlbnYuUzNfT1JJR0lOQUxfQlVDS0VULFxyXG4gICAgICBLZXk6IHMzS2V5LFxyXG4gICAgICBDb250ZW50VHlwZTogZmlsZVR5cGUsXHJcbiAgICAgIC8vIE9wdGlvbmFsOiBBZGQgbWV0YWRhdGFcclxuICAgICAgTWV0YWRhdGE6IHtcclxuICAgICAgICB1cGxvYWRlZEJ5OiB1c2VySWQsXHJcbiAgICAgICAgb3JpZ2luYWxOYW1lOiBmaWxlTmFtZSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IHVwbG9hZFVybCA9IGF3YWl0IGdldFNpZ25lZFVybCh0aGlzLnMzQ2xpZW50LCBjb21tYW5kLCB7XHJcbiAgICAgIGV4cGlyZXNJbjogZW52LlBSRVNJR05FRF9VUkxfRVhQSVJZX1NFQ09ORFMsIC8vIDE1IG1pbnV0ZXMgZGVmYXVsdFxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdXBsb2FkVXJsLFxyXG4gICAgICBzM0tleSxcclxuICAgICAgczNCdWNrZXQ6IGVudi5TM19PUklHSU5BTF9CVUNLRVQsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2VuZXJhdGUgQ2xvdWRGcm9udCBVUkwgZm9yIGFuIFMzIGtleVxyXG4gICAqL1xyXG4gIGdlbmVyYXRlQ2xvdWRmcm9udFVybChzM0tleTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgaHR0cHM6Ly8ke2Vudi5DTE9VREZST05UX0RPTUFJTn0vJHtzM0tleX1gO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2FuaXRpemUgZm9sZGVyIHBhdGggKHJlbW92ZSBkYW5nZXJvdXMgY2hhcmFjdGVycylcclxuICAgKi9cclxuICBwcml2YXRlIHNhbml0aXplUGF0aChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHBhdGhcclxuICAgICAgLnJlcGxhY2UoL1teYS16QS1aMC05LV8vXS9nLCAnLScpIC8vIFJlcGxhY2Ugc3BlY2lhbCBjaGFycyB3aXRoIGRhc2hcclxuICAgICAgLnJlcGxhY2UoL1xcLlxcLisvZywgJycpIC8vIFJlbW92ZSBwYXJlbnQgZGlyZWN0b3J5IHJlZmVyZW5jZXNcclxuICAgICAgLnJlcGxhY2UoL15cXC8rfFxcLyskL2csICcnKSAvLyBSZW1vdmUgbGVhZGluZy90cmFpbGluZyBzbGFzaGVzXHJcbiAgICAgIC50b0xvd2VyQ2FzZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXh0cmFjdCBmaWxlIGV4dGVuc2lvbiBmcm9tIGZpbGVuYW1lXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRGaWxlRXh0ZW5zaW9uKGZpbGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgbGFzdERvdEluZGV4ID0gZmlsZU5hbWUubGFzdEluZGV4T2YoJy4nKTtcclxuICAgIGlmIChsYXN0RG90SW5kZXggPT09IC0xKSByZXR1cm4gJyc7XHJcbiAgICByZXR1cm4gZmlsZU5hbWUuc3Vic3RyaW5nKGxhc3REb3RJbmRleCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmUgYXNzZXQgdHlwZSBmcm9tIE1JTUUgdHlwZVxyXG4gICAqL1xyXG4gIGdldEFzc2V0VHlwZShtaW1lVHlwZTogc3RyaW5nKTogJ2ltYWdlJyB8ICd2aWRlbycgfCAnZmlsZScge1xyXG4gICAgaWYgKG1pbWVUeXBlLnN0YXJ0c1dpdGgoJ2ltYWdlLycpKSByZXR1cm4gJ2ltYWdlJztcclxuICAgIGlmIChtaW1lVHlwZS5zdGFydHNXaXRoKCd2aWRlby8nKSkgcmV0dXJuICd2aWRlbyc7XHJcbiAgICByZXR1cm4gJ2ZpbGUnO1xyXG4gIH1cclxufVxyXG4iXX0=