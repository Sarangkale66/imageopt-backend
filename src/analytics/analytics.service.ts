// analytics/analytics.service.ts
// Analytics service for bandwidth cost calculations

import { Asset } from '../assets/asset.model';
import { AssetLog } from '../assets/asset-log.model';
import { env } from '../config/env';

// Pricing tier interface
interface PricingTier {
  name: string;
  maxGB: number;  // Upper limit in GB (Infinity for last tier)
  pricePerGB: number;  // Price in USD
}

// Cost breakdown interface
interface CostBreakdown {
  tier: string;
  gbUsed: number;
  pricePerGB: number;
  cost: number;
}

// Bandwidth stats result
interface UserBandwidthStats {
  totalBytes: number;
  totalGB: string;
  totalTB: string;
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  errors: number;
  cacheHitRatio: string;
  costUSD: number;
  costBreakdown: CostBreakdown[];
}

// Per-asset bandwidth stats
interface AssetBandwidthStats {
  assetId: string;
  name: string;
  s3Key: string;
  cloudfrontUrl: string;
  totalBytes: number;
  totalGB: string;
  requests: number;
  cacheHits: number;
  cacheHitRatio: string;
  costUSD: number;
}

export class AnalyticsService {
  /**
   * AWS CloudFront pricing tiers (configurable via env)
   * Default: Standard AWS pricing for data transfer out to Internet
   */
  private getPricingTiers(): PricingTier[] {
    return [
      { 
        name: 'First 10 TB', 
        maxGB: env.CF_PRICING_TIER1_MAX_GB, 
        pricePerGB: env.CF_PRICING_TIER1_PRICE 
      },
      { 
        name: 'Next 40 TB', 
        maxGB: env.CF_PRICING_TIER2_MAX_GB, 
        pricePerGB: env.CF_PRICING_TIER2_PRICE 
      },
      { 
        name: 'Next 100 TB', 
        maxGB: env.CF_PRICING_TIER3_MAX_GB, 
        pricePerGB: env.CF_PRICING_TIER3_PRICE 
      },
      { 
        name: 'Next 350 TB', 
        maxGB: env.CF_PRICING_TIER4_MAX_GB, 
        pricePerGB: env.CF_PRICING_TIER4_PRICE 
      },
      { 
        name: 'Over 500 TB', 
        maxGB: Infinity, 
        pricePerGB: env.CF_PRICING_TIER5_PRICE 
      },
    ];
  }

  /**
   * Calculate bandwidth cost using tiered pricing
   */
  calculateBandwidthCost(bytes: number): { costUSD: number; breakdown: CostBreakdown[] } {
    const tiers = this.getPricingTiers();
    const totalGB = bytes / (1024 * 1024 * 1024);
    
    let remainingGB = totalGB;
    let previousMax = 0;
    const breakdown: CostBreakdown[] = [];
    let totalCost = 0;

    for (const tier of tiers) {
      if (remainingGB <= 0) break;

      const tierCapacity = tier.maxGB - previousMax;
      const gbInThisTier = Math.min(remainingGB, tierCapacity);
      const tierCost = gbInThisTier * tier.pricePerGB;

      if (gbInThisTier > 0) {
        breakdown.push({
          tier: tier.name,
          gbUsed: parseFloat(gbInThisTier.toFixed(6)),
          pricePerGB: tier.pricePerGB,
          cost: parseFloat(tierCost.toFixed(6)),
        });
        totalCost += tierCost;
      }

      remainingGB -= gbInThisTier;
      previousMax = tier.maxGB;
    }

    return {
      costUSD: parseFloat(totalCost.toFixed(6)),
      breakdown,
    };
  }

  /**
   * Get user's total bandwidth stats and cost
   */
  async getUserBandwidthStats(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<UserBandwidthStats> {
    // Get all user's assets (including deleted for historical data)
    const userAssets = await Asset.find({ ownerId: userId });
    
    if (userAssets.length === 0) {
      return {
        totalBytes: 0,
        totalGB: '0.00',
        totalTB: '0.000',
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        cacheHitRatio: '0.00%',
        costUSD: 0,
        costBreakdown: [],
      };
    }

    // Build path patterns from user's assets
    // Asset s3Key: "users/123/image.jpg" matches path: "/users/123/image.jpg" or "/users/123/image.jpg/format=webp,width=100"
    const s3Keys = userAssets.map(asset => asset.s3Key);
    
    // Create regex patterns to match paths that start with the s3Key
    const pathPatterns = s3Keys.map(key => new RegExp(`^/${key}(/|$)`));

    // Build match query
    const matchQuery: any = {
      $or: pathPatterns.map(pattern => ({ path: pattern })),
    };

    // Add date filters if provided
    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = startDate;
      if (endDate) matchQuery.timestamp.$lte = endDate;
    }

    // Aggregate bandwidth stats
    // Note: edgeResult can be 'Hit', 'Miss', 'Error', 'RefreshHit', or numeric codes
    const stats = await AssetLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalBytes: { $sum: '$bytes' },
          totalRequests: { $sum: 1 },
          cacheHits: {
            $sum: {
              $cond: [
                { 
                  $or: [
                    { $eq: ['$edgeResult', 'Hit'] },
                    { $eq: ['$edgeResult', 'RefreshHit'] }
                  ]
                },
                1,
                0,
              ],
            },
          },
          cacheMisses: {
            $sum: {
              $cond: [{ $eq: ['$edgeResult', 'Miss'] }, 1, 0],
            },
          },
          errors: {
            $sum: {
              $cond: [
                { 
                  $or: [
                    { $eq: ['$edgeResult', 'Error'] },
                    { $not: { $in: ['$edgeResult', ['Hit', 'Miss', 'RefreshHit']] } }
                  ]
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        totalBytes: 0,
        totalGB: '0.00',
        totalTB: '0.000',
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errors: 0,
        cacheHitRatio: '0.00%',
        costUSD: 0,
        costBreakdown: [],
      };
    }

    const { totalBytes, totalRequests, cacheHits, cacheMisses, errors } = stats[0];
    const totalGB = totalBytes / (1024 * 1024 * 1024);
    const totalTB = totalGB / 1024;
    const hitRatio = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

    // Calculate cost
    const { costUSD, breakdown } = this.calculateBandwidthCost(totalBytes);

    return {
      totalBytes,
      totalGB: totalGB.toFixed(2),
      totalTB: totalTB.toFixed(3),
      totalRequests,
      cacheHits,
      cacheMisses,
      errors: errors || 0,
      cacheHitRatio: hitRatio.toFixed(2) + '%',
      costUSD,
      costBreakdown: breakdown,
    };
  }

  /**
   * Get per-asset bandwidth breakdown for a user
   */
  async getPerAssetBandwidth(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    limit: number = 20
  ): Promise<{ assets: AssetBandwidthStats[]; total: number }> {
    // Get user's assets
    const userAssets = await Asset.find({ ownerId: userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalAssets = await Asset.countDocuments({ ownerId: userId, isDeleted: false });

    if (userAssets.length === 0) {
      return { assets: [], total: 0 };
    }

    // Get bandwidth stats for each asset
    const assetStats: AssetBandwidthStats[] = [];

    for (const asset of userAssets) {
      // Build match query for this asset's paths
      const pathPattern = new RegExp(`^/${asset.s3Key}(/|$)`);
      
      const matchQuery: any = { path: pathPattern };
      
      if (startDate || endDate) {
        matchQuery.timestamp = {};
        if (startDate) matchQuery.timestamp.$gte = startDate;
        if (endDate) matchQuery.timestamp.$lte = endDate;
      }

      const stats = await AssetLog.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalBytes: { $sum: '$bytes' },
            requests: { $sum: 1 },
            cacheHits: {
              $sum: {
                $cond: [
                  { $in: ['$edgeResult', ['Hit', 'RefreshHit']] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

      const totalBytes = stats.length > 0 ? stats[0].totalBytes : 0;
      const requests = stats.length > 0 ? stats[0].requests : 0;
      const cacheHits = stats.length > 0 ? stats[0].cacheHits : 0;
      const hitRatio = requests > 0 ? (cacheHits / requests) * 100 : 0;
      const totalGB = totalBytes / (1024 * 1024 * 1024);

      // Calculate cost for this asset
      const { costUSD } = this.calculateBandwidthCost(totalBytes);

      assetStats.push({
        assetId: asset._id.toString(),
        name: asset.name,
        s3Key: asset.s3Key,
        cloudfrontUrl: asset.cloudfrontUrl,
        totalBytes,
        totalGB: totalGB.toFixed(4),
        requests,
        cacheHits,
        cacheHitRatio: hitRatio.toFixed(2) + '%',
        costUSD,
      });
    }

    // Sort by bandwidth usage (highest first)
    assetStats.sort((a, b) => b.totalBytes - a.totalBytes);

    return { assets: assetStats, total: totalAssets };
  }

  /**
   * Get bandwidth stats grouped by date (for charts)
   */
  async getDailyBandwidthStats(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ date: string; bytes: number; requests: number; costUSD: number }[]> {
    // Get user's assets
    const userAssets = await Asset.find({ ownerId: userId });
    
    if (userAssets.length === 0) {
      return [];
    }

    const s3Keys = userAssets.map(asset => asset.s3Key);
    const pathPatterns = s3Keys.map(key => new RegExp(`^/${key}(/|$)`));

    const dailyStats = await AssetLog.aggregate([
      {
        $match: {
          $or: pathPatterns.map(pattern => ({ path: pattern })),
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          bytes: { $sum: '$bytes' },
          requests: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return dailyStats.map(stat => ({
      date: stat._id,
      bytes: stat.bytes,
      requests: stat.requests,
      costUSD: this.calculateBandwidthCost(stat.bytes).costUSD,
    }));
  }

  /**
   * Get chart data for frontend graphs (grouped by day/month/year)
   * @param groupBy 'day' | 'month' | 'year'
   */
  async getChartData(
    userId: string,
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'month' | 'year' = 'day'
  ): Promise<{
    labels: string[];
    requests: number[];
    bytes: number[];
    costUSD: number[];
    cacheHits: number[];
    cacheMisses: number[];
    errors: number[];
  }> {
    // Get user's assets
    const userAssets = await Asset.find({ ownerId: userId });
    
    if (userAssets.length === 0) {
      return {
        labels: [],
        requests: [],
        bytes: [],
        costUSD: [],
        cacheHits: [],
        cacheMisses: [],
        errors: [],
      };
    }

    const s3Keys = userAssets.map(asset => asset.s3Key);
    const pathPatterns = s3Keys.map(key => new RegExp(`^/${key}(/|$)`));

    // Date format based on groupBy
    let dateFormat: string;
    switch (groupBy) {
      case 'year':
        dateFormat = '%Y';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'day':
      default:
        dateFormat = '%Y-%m-%d';
        break;
    }

    const stats = await AssetLog.aggregate([
      {
        $match: {
          $or: pathPatterns.map(pattern => ({ path: pattern })),
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$timestamp' },
          },
          bytes: { $sum: '$bytes' },
          requests: { $sum: 1 },
          cacheHits: {
            $sum: {
              $cond: [
                { 
                  $or: [
                    { $eq: ['$edgeResult', 'Hit'] },
                    { $eq: ['$edgeResult', 'RefreshHit'] }
                  ]
                },
                1,
                0,
              ],
            },
          },
          cacheMisses: {
            $sum: {
              $cond: [{ $eq: ['$edgeResult', 'Miss'] }, 1, 0],
            },
          },
          errors: {
            $sum: {
              $cond: [
                { 
                  $or: [
                    { $eq: ['$edgeResult', 'Error'] },
                    { $not: { $in: ['$edgeResult', ['Hit', 'Miss', 'RefreshHit']] } }
                  ]
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Transform to chart-friendly format
    const labels: string[] = [];
    const requests: number[] = [];
    const bytes: number[] = [];
    const costUSD: number[] = [];
    const cacheHits: number[] = [];
    const cacheMisses: number[] = [];
    const errors: number[] = [];

    for (const stat of stats) {
      labels.push(stat._id);
      requests.push(stat.requests);
      bytes.push(stat.bytes);
      costUSD.push(this.calculateBandwidthCost(stat.bytes).costUSD);
      cacheHits.push(stat.cacheHits);
      cacheMisses.push(stat.cacheMisses);
      errors.push(stat.errors);
    }

    return {
      labels,
      requests,
      bytes,
      costUSD,
      cacheHits,
      cacheMisses,
      errors,
    };
  }
}
