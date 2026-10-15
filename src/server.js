import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';

const server = app.listen(env.PORT, () => logger.info({ port: env.PORT }, 'ServiceHub API listening'));
function shutdown(signal) {
  logger.info({ signal }, 'Shutting down');
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
