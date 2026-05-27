import cors from 'cors';
import appConfig from '../config/app.config.js';

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');
    const cleanFrontendUrl = appConfig.frontendUrl ? appConfig.frontendUrl.replace(/\/$/, '') : '';

    const allowedOrigins = [
      cleanFrontendUrl,
      'http://localhost:5173', // Local Vite development default
      'http://localhost:3000', // React CRA default
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
    ];

    const isAllowed = allowedOrigins.includes(cleanOrigin) || appConfig.nodeEnv === 'development';

    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`[CORS Block] Request origin "${origin}" is not allowed. Configured FRONTEND_URL: "${appConfig.frontendUrl}". Cleaned allowed list:`, allowedOrigins);
      callback(new Error(`Not allowed by CORS: Origin "${origin}" does not match configured FRONTEND_URL.`));
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
