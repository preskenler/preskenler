import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@/generated/prisma/client';

import { createLogger } from '@/lib/logger';

const logger = createLogger('prisma');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

// Annotated so the non-null narrowing survives into `createPrismaClient`.
const connectionString: string = databaseUrl;

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Build the driver-adapter config from `DATABASE_URL`.
 *
 * The `mariadb` connector does not use TLS unless asked, whereas the server
 * requires it — the account is configured to `REQUIRE SSL`, which otherwise
 * fails with a bare "Access denied" (the same generic error the pool reports
 * as a timeout). Passing the raw connection string would leave TLS off, so we
 * parse the URL and enable TLS explicitly. `rejectUnauthorized: false` is
 * needed because the server presents a self-signed certificate.
 */
function buildAdapterConfig(url: string) {
  const parsed = new URL(url);

  return {
    host: parsed.hostname.startsWith('[')
      ? parsed.hostname.slice(1, -1)
      : parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: parsed.username ? decodeURIComponent(parsed.username) : undefined,
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
    database: decodeURIComponent(parsed.pathname.replace(/^\//, '')),
    ssl: { rejectUnauthorized: false },
    // Match the value the adapter sets when it receives a connection string.
    prepareCacheLength: 0,
  };
}

function createPrismaClient() {
  const adapter = new PrismaMariaDb(buildAdapterConfig(connectionString));

  const client = new PrismaClient({
    adapter,
    log: [
      { level: 'query', emit: 'event' },
      { level: 'warn', emit: 'event' },
      { level: 'error', emit: 'event' },
    ],
  });

  // Attach listeners only when a fresh client is created, so that HMR — which
  // reuses the cached client — does not accumulate duplicate handlers.
  if (!isProduction) {
    // Query logs include the SQL and its params, so keep them out of
    // production; the logger threshold also filters `debug` there.
    client.$on('query', (event) => {
      logger.debug(event.query, `${event.duration}ms`);
    });
  }

  client.$on('warn', (event) => {
    logger.warn(event.message);
  });

  client.$on('error', (event) => {
    logger.error(event.message);
  });

  return client;
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}
