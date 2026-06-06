import { env } from './config/env';
import { createApp } from './config/app';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`✅ Server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

function shutdown(signal: string) {
  console.log(`\n${signal} received — shutting down gracefully`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
