// TEMPORARY diagnostics — remove once the production database connection is
// fixed.
//
// Why this exists: on cPanel/hodifly the app gets a `pool timeout ... active=0
// idle=0` error from `@prisma/adapter-mariadb`, which hides the real reason
// (wrong host, auth failure, blocked IP, TLS, URL parse error, IPv6). The
// adapter only surfaces the generic timeout, so here we (1) print the runtime
// environment with secrets redacted and (2) connect with the raw `mariadb`
// driver to report the actual connection error.

import * as mariadb from 'mariadb';

// Any env key matching this is printed as `<redacted:length>` instead of its
// value, so the deploy logs never leak credentials.
const SECRET_KEY =
  /(SECRET|PASSWORD|PASSWD|TOKEN|PRIVATE|CREDENTIAL|API[_-]?KEY)/i;

// Connection URLs carry their password inline, so instead of hiding the whole
// value (which is useful to see) we keep the URL and redact only the password.
const CONNECTION_URL_KEY = /(DATABASE_URL|CONNECTION_STRING|_DSN$)/i;

function redactEnvValue(key: string, value: string): string {
  if (CONNECTION_URL_KEY.test(key)) {
    return redactUrl(value);
  }
  if (SECRET_KEY.test(key)) {
    return `<redacted:${value.length}>`;
  }
  return value;
}

function redactUrl(raw: string): string {
  try {
    const url = new URL(raw);
    if (url.password) {
      // A plain placeholder avoids URL-encoding angle brackets in the output.
      url.password = '***';
    }
    return url.toString();
  } catch {
    return '<unparseable>';
  }
}

function formatError(error: unknown): string {
  return error instanceof Error
    ? `${error.name}: ${error.message}`
    : String(error);
}

/** Print every environment variable the running server actually sees. */
export function logEnvironment(): void {
  console.log(
    '[env-diag] ================= runtime environment =================',
  );
  console.log(`[env-diag] NODE_ENV=${process.env.NODE_ENV ?? '(unset)'}`);
  console.log(
    `[env-diag] NEXT_RUNTIME=${process.env.NEXT_RUNTIME ?? '(unset)'}`,
  );
  console.log(`[env-diag] cwd=${process.cwd()}`);
  console.log(`[env-diag] node=${process.version}`);

  for (const key of Object.keys(process.env).sort()) {
    const value = process.env[key] ?? '';
    console.log(`[env-diag] env ${key}=${redactEnvValue(key, value)}`);
  }

  console.log(
    '[env-diag] ------------------- DATABASE_URL -------------------',
  );
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    console.log('[env-diag] DATABASE_URL is NOT set');
  } else {
    console.log(`[env-diag] DATABASE_URL (redacted)=${redactUrl(raw)}`);
    try {
      const url = new URL(raw);
      console.log(`[env-diag] DATABASE_URL protocol=${url.protocol}`);
      console.log(`[env-diag] DATABASE_URL hostname=${url.hostname}`);
      console.log(`[env-diag] DATABASE_URL port=${url.port || '(default)'}`);
      console.log(
        `[env-diag] DATABASE_URL username=${url.username || '(none)'}`,
      );
      console.log(
        `[env-diag] DATABASE_URL password set=${url.password.length > 0} length=${url.password.length}`,
      );
      console.log(
        `[env-diag] DATABASE_URL database=${decodeURIComponent(url.pathname.replace(/^\//, ''))}`,
      );
      console.log(`[env-diag] DATABASE_URL query=${url.search || '(none)'}`);
    } catch (error) {
      console.log(
        `[env-diag] DATABASE_URL is not parseable as a URL: ${formatError(error)}`,
      );
    }
  }

  console.log(
    '[env-diag] ======================================================',
  );
}

/**
 * Connect with the raw `mariadb` driver using the same target as the Prisma
 * adapter, and report the real error instead of the adapter's pool timeout.
 * A short timeout keeps it from delaying server startup for too long.
 */
export async function probeDatabase(): Promise<void> {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    console.error(
      '[env-diag] skipping database probe: DATABASE_URL is not set',
    );
    return;
  }

  let config: mariadb.PoolConfig;
  try {
    const url = new URL(raw);
    config = {
      host: url.hostname.startsWith('[')
        ? url.hostname.slice(1, -1)
        : url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: url.username ? decodeURIComponent(url.username) : undefined,
      password: url.password ? decodeURIComponent(url.password) : undefined,
      database: decodeURIComponent(url.pathname.replace(/^\//, '')),
      connectionLimit: 1,
      connectTimeout: 5000,
      acquireTimeout: 5000,
    };

    const query = new URLSearchParams(url.search);
    if (query.get('ssl') === 'true' || query.get('ssl') === '1') {
      config.ssl = { rejectUnauthorized: false };
    }
  } catch (error) {
    console.error(
      `[env-diag] cannot parse DATABASE_URL for the probe: ${formatError(error)}`,
    );
    return;
  }

  let pool: mariadb.Pool | undefined;
  const startedAt = Date.now();
  try {
    pool = mariadb.createPool(config);
    // The `mariadb` types omit the pool 'error' event, but the connector emits
    // it (with the real cause) when it fails to create a connection, so attach
    // the listener through a cast.
    const emitter = pool as unknown as {
      on(event: string, listener: (error: unknown) => void): void;
    };
    emitter.on('error', (error) => {
      console.error(`[env-diag] pool 'error' event: ${formatError(error)}`);
    });

    const connection = await pool.getConnection();
    try {
      const rows = await connection.query(
        'SELECT VERSION() AS version, DATABASE() AS db, CURRENT_USER() AS currentUser, @@hostname AS serverHost',
      );
      console.log(
        `[env-diag] database probe SUCCEEDED in ${Date.now() - startedAt}ms`,
        rows,
      );
    } finally {
      await connection.release();
    }
  } catch (error) {
    console.error(
      `[env-diag] database probe FAILED after ${Date.now() - startedAt}ms: ${formatError(error)}`,
    );
    if (error && typeof error === 'object') {
      const details = error as Record<string, unknown>;
      for (const key of [
        'name',
        'message',
        'code',
        'errno',
        'sqlState',
        'sqlMessage',
        'cause',
        'stack',
      ]) {
        if (details[key] !== undefined) {
          console.error(`[env-diag]   ${key}=`, details[key]);
        }
      }
    }
  } finally {
    await pool?.end().catch(() => undefined);
  }
}
