import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.config.js';
import appConfig from './config/app.config.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const PORT = appConfig.port;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Server running in ${appConfig.nodeEnv} mode
📡 Listening on port http://localhost:${PORT}
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
