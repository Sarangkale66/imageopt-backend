// config/env.ts
// Environment variables configuration with type safety

import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  // Server
  PORT: number;
  NODE_ENV: string;
  
  // MongoDB
  MONGODB_URI: string;
  
  // JWT
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  
  // AWS
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_ACCOUNT_ID: string;
  
  // S3
  S3_ORIGINAL_BUCKET: string;
  S3_TRANSFORMED_BUCKET: string;
  
  // CloudFront
  CLOUDFRONT_DOMAIN: string;
  
  // CloudFront Signed URLs (optional - for secure asset delivery)
  CLOUDFRONT_KEY_PAIR_ID: string;
  CLOUDFRONT_PRIVATE_KEY: string;
  CLOUDFRONT_DISTRIBUTION_ID: string; // For cache invalidation
  SIGNED_URL_EXPIRY_SECONDS: number;
  
  // Upload limits
  MAX_UPLOAD_SIZE_MB: number;
  PRESIGNED_URL_EXPIRY_SECONDS: number;
  
  // Asset Retention
  ASSET_RETENTION_HOURS: number;
  
  // CloudFront Pricing (USD per GB)
  CF_PRICING_TIER1_MAX_GB: number;  // First X GB at tier 1 price
  CF_PRICING_TIER1_PRICE: number;
  CF_PRICING_TIER2_MAX_GB: number;  // Up to X GB at tier 2 price  
  CF_PRICING_TIER2_PRICE: number;
  CF_PRICING_TIER3_MAX_GB: number;
  CF_PRICING_TIER3_PRICE: number;
  CF_PRICING_TIER4_MAX_GB: number;
  CF_PRICING_TIER4_PRICE: number;
  CF_PRICING_TIER5_PRICE: number;   // Over tier 4 max
}

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const env: EnvConfig = {
  PORT: parseInt(getEnv('PORT', '5000')),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  
  MONGODB_URI: getEnv('MONGODB_URI'),
  
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_EXPIRE: getEnv('JWT_EXPIRE', '7d'),
  
  AWS_REGION: getEnv('AWS_REGION', 'us-east-1'),
  AWS_ACCESS_KEY_ID: getEnv('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: getEnv('AWS_SECRET_ACCESS_KEY'),
  AWS_ACCOUNT_ID: getEnv('AWS_ACCOUNT_ID'),
  
  S3_ORIGINAL_BUCKET: getEnv('S3_ORIGINAL_BUCKET'),
  S3_TRANSFORMED_BUCKET: getEnv('S3_TRANSFORMED_BUCKET'),
  
  CLOUDFRONT_DOMAIN: getEnv('CLOUDFRONT_DOMAIN'),
  
  // CloudFront Signed URLs (optional - leave empty if not using signed URLs)
  CLOUDFRONT_KEY_PAIR_ID: process.env.CLOUDFRONT_KEY_PAIR_ID || '',
  CLOUDFRONT_PRIVATE_KEY: (process.env.CLOUDFRONT_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  CLOUDFRONT_DISTRIBUTION_ID: process.env.CLOUDFRONT_DISTRIBUTION_ID || '', // For cache invalidation
  SIGNED_URL_EXPIRY_SECONDS: parseInt(process.env.SIGNED_URL_EXPIRY_SECONDS || '3600'),
  
  MAX_UPLOAD_SIZE_MB: parseInt(getEnv('MAX_UPLOAD_SIZE_MB', '50')),
  PRESIGNED_URL_EXPIRY_SECONDS: parseInt(getEnv('PRESIGNED_URL_EXPIRY_SECONDS', '1200')),
  
  ASSET_RETENTION_HOURS: parseInt(getEnv('ASSET_RETENTION_HOURS', '90')),
  
  // CloudFront Pricing - Standard AWS rates (USD per GB)
  // Tier 1: First 10 TB ($0.085/GB)
  CF_PRICING_TIER1_MAX_GB: parseInt(getEnv('CF_PRICING_TIER1_MAX_GB', '10240')),  // 10 TB
  CF_PRICING_TIER1_PRICE: parseFloat(getEnv('CF_PRICING_TIER1_PRICE', '0.085')),
  // Tier 2: Next 40 TB ($0.080/GB)
  CF_PRICING_TIER2_MAX_GB: parseInt(getEnv('CF_PRICING_TIER2_MAX_GB', '51200')),  // 50 TB cumulative
  CF_PRICING_TIER2_PRICE: parseFloat(getEnv('CF_PRICING_TIER2_PRICE', '0.080')),
  // Tier 3: Next 100 TB ($0.060/GB)
  CF_PRICING_TIER3_MAX_GB: parseInt(getEnv('CF_PRICING_TIER3_MAX_GB', '153600')), // 150 TB cumulative
  CF_PRICING_TIER3_PRICE: parseFloat(getEnv('CF_PRICING_TIER3_PRICE', '0.060')),
  // Tier 4: Next 350 TB ($0.040/GB)
  CF_PRICING_TIER4_MAX_GB: parseInt(getEnv('CF_PRICING_TIER4_MAX_GB', '512000')), // 500 TB cumulative  
  CF_PRICING_TIER4_PRICE: parseFloat(getEnv('CF_PRICING_TIER4_PRICE', '0.040')),
  // Tier 5: Over 500 TB ($0.030/GB)
  CF_PRICING_TIER5_PRICE: parseFloat(getEnv('CF_PRICING_TIER5_PRICE', '0.030')),
};
