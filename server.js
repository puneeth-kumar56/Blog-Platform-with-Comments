import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import authRoutes from './src/server/routes/authRoutes.js';
import postRoutes from './src/server/routes/postRoutes.js';
import commentRoutes from './src/server/routes/commentRoutes.js';
import userRoutes from './src/server/routes/userRoutes.js';
import { notFound, errorHandler } from './src/server/middleware/errorMiddleware.js';
import { initDatabaseConnection, isMongoDBLive } from './src/server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Initialize Database
  await initDatabaseConnection();

  // Basic Security & Parsing Middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger for API calls
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[API] ${req.method} ${req.url} -> ${res.statusCode} (${duration}ms)`);
      });
    }
    next();
  });

  // Health and System Info Endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: isMongoDBLive() ? 'MongoDB (Connected)' : 'Persistent Storage (Active)',
      uptimeSeconds: process.uptime(),
      version: '1.0.0',
    });
  });

  // Mount API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/users', userRoutes);

  // If in development mode, mount Vite middleware for instant hot development
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve pre-built Vite assets from dist/
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.url.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error handling middleware
  app.use(notFound);
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DevScribe Full-Stack Server running at http://0.0.0.0:${PORT}`);
    console.log(`API Endpoints available under http://0.0.0.0:${PORT}/api/`);
    console.log(`Database Mode: ${isMongoDBLive() ? 'MongoDB' : 'Local Persistent Storage'}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
