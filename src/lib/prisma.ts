import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as mariadb from 'mariadb';
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
 * MySQL 8 (this server is `8.0.46-cll-lve`) defaults accounts to the
 * `caching_sha2_password` authentication plugin. Over a non-TLS connection
 * (TLS is not required here — `require_secure_transport` is OFF), full
 * authentication needs the server's RSA public key, which the `mariadb`
 * connector will only request when `allowPublicKeyRetrieval` is enabled. With
 * it disabled it fails with a bare "Access denied", which the pool then masks
 * as a timeout. Prisma's Rust engine handles this itself, which is why
 * migrations succeed while the app does not.
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
    allowPublicKeyRetrieval: true,
    // Match the value the adapter sets when it receives a connection string.
    prepareCacheLength: 0,
  };
}

/** Render an error and its (driver-wrapped) cause for the logs. */
function describeError(error: unknown): string {
  const describe = (value: unknown): string => {
    if (!value || typeof value !== 'object') {
      return String(value);
    }
    const details = value as Record<string, unknown>;
    return [details.name, details.code, details.sqlMessage ?? details.message]
      .filter(Boolean)
      .join(' ');
  };

  const cause =
    error && typeof error === 'object'
      ? (error as { cause?: unknown }).cause
      : undefined;

  return cause === undefined
    ? describe(error)
    : `${describe(error)} | cause: ${describe(cause)}`;
}

/**
 * Verify the connection once at startup and log the real error. The Prisma
 * adapter reports connection failures as a generic pool timeout, so without
 * this the underlying reason (auth, TLS, host, …) never reaches the logs.
 */
async function checkDatabaseConnection(
  config: ReturnType<typeof buildAdapterConfig>,
): Promise<void> {
  let pool: mariadb.Pool | undefined;
  try {
    pool = mariadb.createPool({
      ...config,
      connectionLimit: 1,
      connectTimeout: 5000,
      acquireTimeout: 6000,
    });

    // The pool emits the real failure here (auth, refused, …); the error that
    // rejects `getConnection()` only carries the generic timeout.
    const emitter = pool as unknown as {
      on(event: string, listener: (error: unknown) => void): void;
    };
    emitter.on('error', (error) => {
      logger.error('database pool error:', describeError(error));
    });

    const connection = await pool.getConnection();
    try {
      await connection.query('SELECT 1');
      logger.info('database connection OK');
    } finally {
      await connection.release();
    }
  } catch (error) {
    logger.error('database connection failed:', describeError(error));
  } finally {
    await pool?.end().catch(() => undefined);
  }
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

// Fire-and-forget: surface the real connection error (the adapter hides it
// behind a generic pool timeout) without blocking server startup.
void checkDatabaseConnection(buildAdapterConfig(connectionString));
