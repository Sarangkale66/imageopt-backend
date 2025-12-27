// server.ts
// Server entry point

import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { CronService } from './services/cron.service';

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start cron jobs
    const cronService = new CronService();
    cronService.startCronJobs();

    // Start server
    const server = app.listen(env.PORT, () => {
      console.log('');
      console.log('🚀 ========================================');
      console.log(`   ImageOpt Backend API - v1.0.0`);
      console.log('🚀 ========================================');
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Port: ${env.PORT}`);
      console.log(`   Database: Connected`);
      console.log(`   S3 Bucket: ${env.S3_ORIGINAL_BUCKET}`);
      console.log(`   CloudFront: ${env.CLOUDFRONT_DOMAIN}`);
      console.log(`   🧹 Cleanup: Every 6hrs (90hrs retention)`);
      console.log('');
      console.log(`   📝 API Documentation:`);
      console.log(`      POST   /api/auth/register`);
      console.log(`      POST   /api/auth/login`);
      console.log(`      GET    /api/auth/me`);
      console.log(`      POST   /api/assets/upload-url`);
      console.log(`      POST   /api/assets`);
      console.log(`      GET    /api/assets`);
      console.log(`      GET    /api/assets/:id`);
      console.log(`      GET    /api/assets/:id/stats`);
      console.log(`      DELETE /api/assets/:id`);
      console.log(`      GET    /api/analytics/bandwidth`);
      console.log(`      GET    /api/analytics/bandwidth/assets`);
      console.log(`      GET    /api/analytics/bandwidth/daily`);
      console.log('');
      console.log(`   🌐 Server ready at: http://localhost:${env.PORT}`);
      console.log(`   🏥 Health check: http://localhost:${env.PORT}/health`);
      console.log('🚀 ========================================');
      console.log('');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
