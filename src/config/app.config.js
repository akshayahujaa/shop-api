import dotenv from 'dotenv';

dotenv.config();

const appConfig = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  apiPrefix: '/api/v1',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  rateLimit: {
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 100,
    authMax: 10, // stricter for auth routes
  },
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
  },
};

if (!appConfig.jwt.accessSecret || !appConfig.jwt.refreshSecret) {
  throw new Error(
    'JWT secrets are required: define JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in your .env or environment.'
  );
}

export default appConfig;
