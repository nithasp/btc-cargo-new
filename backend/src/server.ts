import app from './app';
import { config } from './config';
import pool from './database';
import { logger } from './logger';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const server = app.listen(config.port, () =>
  logger.info({ port: config.port, storage: config.storage.r2 ? 'r2' : 'local' }, 'server listening'),
);

let stopping = false;

async function shutdown(signal: string): Promise<void> {
  if (stopping) return;
  stopping = true;
  logger.info({ signal }, 'shutting down');

  const force = setTimeout(() => {
    logger.error('shutdown took too long, exiting');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  force.unref();

  await new Promise<void>((resolve) => server.close(() => resolve()));
  await pool.end();

  clearTimeout(force);
  logger.info('shutdown complete');
}

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    shutdown(signal).catch((err: unknown) => {
      logger.error({ err }, 'shutdown failed');
      process.exit(1);
    });
  });
}

function crash(err: unknown, reason: string): void {
  logger.fatal({ err }, reason);
  shutdown(reason)
    .catch((shutdownErr: unknown) => logger.error({ err: shutdownErr }, 'shutdown after crash failed'))
    .finally(() => process.exit(1));
}

process.on('uncaughtException', (err) => crash(err, 'uncaught exception'));
process.on('unhandledRejection', (err) => crash(err, 'unhandled rejection'));
