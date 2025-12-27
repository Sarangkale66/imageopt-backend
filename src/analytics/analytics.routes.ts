// analytics/analytics.routes.ts
// Analytics routes for bandwidth and cost tracking

import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

// All analytics routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/analytics/bandwidth
 * @desc    Get user's total bandwidth usage and cost
 * @access  Private
 * @query   startDate - Optional ISO date string
 * @query   endDate - Optional ISO date string
 */
router.get('/bandwidth', analyticsController.getUserBandwidthStats);

/**
 * @route   GET /api/analytics/bandwidth/assets
 * @desc    Get per-asset bandwidth breakdown
 * @access  Private
 * @query   startDate - Optional ISO date string
 * @query   endDate - Optional ISO date string
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 20, max: 100)
 */
router.get('/bandwidth/assets', analyticsController.getPerAssetBandwidth);

/**
 * @route   GET /api/analytics/bandwidth/daily
 * @desc    Get daily bandwidth stats for charts
 * @access  Private
 * @query   startDate - Start date (default: 30 days ago)
 * @query   endDate - End date (default: now)
 */
router.get('/bandwidth/daily', analyticsController.getDailyBandwidth);

export default router;
