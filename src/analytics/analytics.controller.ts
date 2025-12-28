// analytics/analytics.controller.ts
// HTTP request handlers for analytics endpoints

import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { sendSuccess, sendError } from '../utils/response.util';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  /**
   * GET /api/analytics/bandwidth
   * Get user's total bandwidth usage and cost
   * Query params: startDate, endDate (ISO strings)
   */
  getUserBandwidthStats = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      // Parse optional date filters
      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string) 
        : undefined;
      const endDate = req.query.endDate 
        ? new Date(req.query.endDate as string) 
        : undefined;

      // Validate dates
      if (startDate && isNaN(startDate.getTime())) {
        return sendError(res, 'Invalid startDate format. Use ISO string.', 400);
      }
      if (endDate && isNaN(endDate.getTime())) {
        return sendError(res, 'Invalid endDate format. Use ISO string.', 400);
      }

      const stats = await this.analyticsService.getUserBandwidthStats(
        req.user.userId,
        startDate,
        endDate
      );

      return sendSuccess(res, {
        user: {
          id: req.user.userId,
        },
        period: {
          startDate: startDate?.toISOString() || 'account creation',
          endDate: endDate?.toISOString() || new Date().toISOString(),
        },
        bandwidth: {
          totalBytes: stats.totalBytes,
          totalGB: stats.totalGB,
          totalTB: stats.totalTB,
        },
        cost: {
          totalUSD: stats.costUSD,
          breakdown: stats.costBreakdown,
        },
        requests: {
          total: stats.totalRequests,
          cacheHits: stats.cacheHits,
          cacheMisses: stats.cacheMisses,
          cacheHitRatio: stats.cacheHitRatio,
        },
      });
    } catch (error: any) {
      console.error('Error getting user bandwidth stats:', error);
      return sendError(res, error.message || 'Failed to get bandwidth stats', 500);
    }
  };

  /**
   * GET /api/analytics/bandwidth/assets
   * Get per-asset bandwidth breakdown
   * Query params: startDate, endDate, page, limit
   */
  getPerAssetBandwidth = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      // Parse pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      // Parse optional date filters
      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string) 
        : undefined;
      const endDate = req.query.endDate 
        ? new Date(req.query.endDate as string) 
        : undefined;

      // Validate dates
      if (startDate && isNaN(startDate.getTime())) {
        return sendError(res, 'Invalid startDate format. Use ISO string.', 400);
      }
      if (endDate && isNaN(endDate.getTime())) {
        return sendError(res, 'Invalid endDate format. Use ISO string.', 400);
      }

      const { assets, total } = await this.analyticsService.getPerAssetBandwidth(
        req.user.userId,
        startDate,
        endDate,
        page,
        limit
      );

      return sendSuccess(res, {
        assets,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        period: {
          startDate: startDate?.toISOString() || 'account creation',
          endDate: endDate?.toISOString() || new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error('Error getting per-asset bandwidth:', error);
      return sendError(res, error.message || 'Failed to get per-asset bandwidth', 500);
    }
  };

  /**
   * GET /api/analytics/bandwidth/daily
   * Get daily bandwidth stats for charts
   * Query params: startDate (required), endDate (required)
   */
  getDailyBandwidth = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      // Parse required date filters
      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string) 
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
      const endDate = req.query.endDate 
        ? new Date(req.query.endDate as string) 
        : new Date();

      // Validate dates
      if (isNaN(startDate.getTime())) {
        return sendError(res, 'Invalid startDate format. Use ISO string.', 400);
      }
      if (isNaN(endDate.getTime())) {
        return sendError(res, 'Invalid endDate format. Use ISO string.', 400);
      }

      const dailyStats = await this.analyticsService.getDailyBandwidthStats(
        req.user.userId,
        startDate,
        endDate
      );

      // Calculate totals for the period
      const totals = dailyStats.reduce(
        (acc, day) => ({
          bytes: acc.bytes + day.bytes,
          requests: acc.requests + day.requests,
          costUSD: acc.costUSD + day.costUSD,
        }),
        { bytes: 0, requests: 0, costUSD: 0 }
      );

      return sendSuccess(res, {
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        daily: dailyStats,
        totals: {
          bytes: totals.bytes,
          totalGB: (totals.bytes / (1024 * 1024 * 1024)).toFixed(2),
          requests: totals.requests,
          costUSD: parseFloat(totals.costUSD.toFixed(4)),
        },
      });
    } catch (error: any) {
      console.error('Error getting daily bandwidth:', error);
      return sendError(res, error.message || 'Failed to get daily bandwidth', 500);
    }
  };

  /**
   * GET /api/analytics/charts
   * Get chart-friendly data grouped by day/month/year
   * Query params: startDate (required), endDate (required), groupBy (day|month|year)
   */
  getChartData = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (!req.user) {
        return sendError(res, 'Not authenticated', 401);
      }

      // Parse required date filters
      const startDate = req.query.startDate 
        ? new Date(req.query.startDate as string) 
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
      const endDate = req.query.endDate 
        ? new Date(req.query.endDate as string) 
        : new Date();

      // Parse groupBy (day, month, year)
      const groupBy = (req.query.groupBy as string)?.toLowerCase() || 'day';
      if (!['day', 'month', 'year'].includes(groupBy)) {
        return sendError(res, 'Invalid groupBy. Use: day, month, or year', 400);
      }

      // Validate dates
      if (isNaN(startDate.getTime())) {
        return sendError(res, 'Invalid startDate format. Use ISO string.', 400);
      }
      if (isNaN(endDate.getTime())) {
        return sendError(res, 'Invalid endDate format. Use ISO string.', 400);
      }

      const chartData = await this.analyticsService.getChartData(
        req.user.userId,
        startDate,
        endDate,
        groupBy as 'day' | 'month' | 'year'
      );

      // Calculate totals
      const totalRequests = chartData.requests.reduce((a, b) => a + b, 0);
      const totalBytes = chartData.bytes.reduce((a, b) => a + b, 0);
      const totalCost = chartData.costUSD.reduce((a, b) => a + b, 0);
      const totalCacheHits = chartData.cacheHits.reduce((a, b) => a + b, 0);
      const totalCacheMisses = chartData.cacheMisses.reduce((a, b) => a + b, 0);
      const totalErrors = chartData.errors.reduce((a, b) => a + b, 0);

      return sendSuccess(res, {
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy,
        },
        chart: {
          labels: chartData.labels,
          datasets: {
            requests: chartData.requests,
            bytes: chartData.bytes,
            bytesGB: chartData.bytes.map(b => parseFloat((b / (1024 * 1024 * 1024)).toFixed(6))),
            costUSD: chartData.costUSD,
            cacheHits: chartData.cacheHits,
            cacheMisses: chartData.cacheMisses,
            errors: chartData.errors,
          },
        },
        totals: {
          requests: totalRequests,
          bytes: totalBytes,
          bytesGB: parseFloat((totalBytes / (1024 * 1024 * 1024)).toFixed(4)),
          costUSD: parseFloat(totalCost.toFixed(6)),
          cacheHits: totalCacheHits,
          cacheMisses: totalCacheMisses,
          errors: totalErrors,
          cacheHitRatio: totalRequests > 0 
            ? parseFloat(((totalCacheHits / totalRequests) * 100).toFixed(2)) 
            : 0,
        },
      });
    } catch (error: any) {
      console.error('Error getting chart data:', error);
      return sendError(res, error.message || 'Failed to get chart data', 500);
    }
  };
}
