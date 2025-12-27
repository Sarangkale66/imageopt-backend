// app.ts
// Express application configuration

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './auth/auth.routes';
import assetRoutes from './assets/asset.routes';
import analyticsRoutes from './analytics/analytics.routes';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';

export const createApp = (): Application => {
  const app = express();

  // ===================================
  // MIDDLEWARE
  // ===================================

  // Security headers
  app.use(helmet());

  // CORS - allow all origins for prototype (restrict in production)
  app.use(cors({
    origin: '*',
    credentials: true,
  }));

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging (simple console log for prototype)
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // ===================================
  // ROUTES
  // ===================================

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'imageopt-backend-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/assets', assetRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // ===================================
  // ERROR HANDLING
  // ===================================

  // 404 handler
  app.use(notFoundMiddleware);

  // Global error handler
  app.use(errorMiddleware);

  return app;
};
