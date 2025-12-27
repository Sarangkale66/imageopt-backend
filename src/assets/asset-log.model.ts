// assets/asset-log.model.ts
// AssetLog schema - extends existing bandwidth_logs collection

import mongoose, { Document, Schema } from 'mongoose';

export interface IAssetLog extends Document {
  assetId?: mongoose.Types.ObjectId;  // Optional - for linking to Asset
  path: string;
  bytes: number;
  requestBytes?: number;
  edgeResult: 'Hit' | 'Miss' | 'Error' | 'RefreshHit';
  distribution?: string;
  status?: number;
  clientIp: string;
  country?: string;
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
    },
    requestBytes: {
      type: Number,
    },
    edgeResult: {
      type: String,
      enum: ['Hit', 'Miss', 'Error', 'RefreshHit'],
      required: true,
    },
    distribution: {
      type: String,
    },
    status: {
      type: Number,
    },
    clientIp: {
      type: String,
      required: true,
    },
    country: {
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
  }
);

// Compound indexes for analytics queries
assetLogSchema.index({ assetId: 1, timestamp: -1 });
assetLogSchema.index({ path: 1, timestamp: -1 });
assetLogSchema.index({ timestamp: -1 });

export const AssetLog = mongoose.model<IAssetLog>('AssetLog', assetLogSchema);
