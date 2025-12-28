// assets/asset.model.ts
// Asset MongoDB schema and model

import mongoose, { Document, Schema } from 'mongoose';

export interface IAsset extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  type: 'image' | 'video' | 'file';
  s3Bucket: string;
  s3Key: string;
  cloudfrontUrl: string;
  sizeBytes: number;
  isPrivate: boolean;
  originalFolder?: string; // Stores original folder before moving to private
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
  };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['image', 'video', 'file'],
      required: [true, 'Asset type is required'],
    },
    s3Bucket: {
      type: String,
      required: [true, 'S3 bucket is required'],
    },
    s3Key: {
      type: String,
      required: [true, 'S3 key is required'],
      unique: true,
    },
    cloudfrontUrl: {
      type: String,
      required: [true, 'CloudFront URL is required'],
    },
    sizeBytes: {
      type: Number,
      required: [true, 'File size is required'],
    },
    metadata: {
      width: Number,
      height: Number,
      format: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    originalFolder: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
assetSchema.index({ ownerId: 1, isDeleted: 1 });
assetSchema.index({ s3Key: 1 });
assetSchema.index({ createdAt: -1 });

export const Asset = mongoose.model<IAsset>('Asset', assetSchema);
