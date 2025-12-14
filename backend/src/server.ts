import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config/env';
import { connectDB } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    status: 429,
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (config.server.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    success: true,
    message: 'ERMS Server is running',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
  });
});

// API routes
import routes from './routes';
app.use('/api', routes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    const PORT = config.server.port;
    app.listen(PORT, () => {
      console.log(`🚀 ERMS Server running on port ${PORT}`);
      console.log(`📊 Environment: ${config.server.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📝 API Base URL: http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

export default app;

