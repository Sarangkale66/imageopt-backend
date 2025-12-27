interface EnvConfig {
    PORT: number;
    NODE_ENV: string;
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRE: string;
    AWS_REGION: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_ACCOUNT_ID: string;
    S3_ORIGINAL_BUCKET: string;
    S3_TRANSFORMED_BUCKET: string;
    CLOUDFRONT_DOMAIN: string;
    MAX_UPLOAD_SIZE_MB: number;
    PRESIGNED_URL_EXPIRY_SECONDS: number;
    ASSET_RETENTION_HOURS: number;
}
export declare const env: EnvConfig;
export {};
