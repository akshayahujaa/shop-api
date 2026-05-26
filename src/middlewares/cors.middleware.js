import cors from 'cors';
import appConfig from '../config/app.config.js';

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      appConfig.frontendUrl,
      'http://localhost:5173', // Local Vite development default
      'http://localhost:3000', // React CRA default
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || appConfig.nodeEnv === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

/**
 * Configured CORS middleware.
 */
export const corsMiddleware = cors(corsOptions);
