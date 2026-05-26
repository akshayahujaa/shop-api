import morgan from 'morgan';
import appConfig from '../config/app.config.js';

// Format logs differently in development vs production
const format = appConfig.nodeEnv === 'development' ? 'dev' : 'combined';

/**
 * Morgan logger middleware for tracking HTTP requests.
 */
export const httpLogger = morgan(format);
