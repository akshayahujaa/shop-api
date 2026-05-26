import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './middlewares/cors.middleware.js';
import { httpLogger } from './middlewares/logger.middleware.js';
import { authRateLimiter, apiRateLimiter } from './middlewares/rateLimiter.middleware.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware.js';
import routes from './routes/index.js';
import appConfig from './config/app.config.js';

const app = express();

// 1. Security & CORS
app.use(corsMiddleware);
app.use(helmet());

// 2. Logging
app.use(httpLogger);

// 3. Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Cookie Parsing
app.use(cookieParser());

// Serve uploads as static resources
app.use('/uploads', express.static('./public/uploads'));

// 5. Rate Limiting (Applied globally and auth-specifically)
app.use('/api/v1/auth', authRateLimiter);
app.use('/api/v1', apiRateLimiter);

// 6. Routes
app.use(appConfig.apiPrefix, routes);

// 7. 404 Handler
app.use(notFoundHandler);

// 8. Global Error Handler (MUST be last)
app.use(errorHandler);

export default app;
