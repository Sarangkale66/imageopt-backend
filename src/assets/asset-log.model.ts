// assets/asset-log.model.ts
// AssetLog schema - extends existing bandwidth_logs collection

import mongoose, { Document, Schema } from 'mongoose';

export interface IAssetLog extends Document {
  assetId?: mongoose.Types.ObjectId;  // Optional - for linking to Asset
  path: string;
  bytes: number;
  requestBytes?: number;
  edgeResult: string; // Hit, Miss, Error, RefreshHit, or numeric codes
  distribution?: string;
  status?: number;
  clientIp: string;
  countryCode?: string; // Country code from CloudFront logs
  deviceType?: string;  // Device type from CloudFront logs
  timestamp: Date;
}

const assetLogSchema = new Schema<IAssetLog>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      index: true,
      required: false, // Optional - old logs won't have this
    },
    path: {
      type: String,
      required: true,
      index: true,
    },
    bytes: {
      type: Number,
      required: true,
      default: 0,
    },
    requestBytes: {
      type: Number,
      default: 0,
    },
    edgeResult: {
      type: String,
      required: true,
      index: true,
      // No enum - can be 'Hit', 'Miss', 'Error', 'RefreshHit', or numeric codes
    },
    distribution: {
      type: String,
    },
    status: {
      type: Number,
      default: 0,
    },
    clientIp: {
      type: String,
      required: true,
    },
    countryCode: {
      type: String,
    },
    deviceType: {
      type: String,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: false, // We have our own timestamp field
    collection: 'bandwidth_logs', // Use existing collection from Phase 4
    strict: false, // Allow fields not in schema (for backward compatibility)
  }
);

// Compound indexes for analytics queries
assetLogSchema.index({ assetId: 1, timestamp: -1 });
assetLogSchema.index({ path: 1, timestamp: -1 });
assetLogSchema.index({ timestamp: -1 });
assetLogSchema.index({ edgeResult: 1 });

export const AssetLog = mongoose.model<IAssetLog>('AssetLog', assetLogSchema);

