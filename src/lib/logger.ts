// Tiny isomorphic logger shared by server and client code.
//
// - Development: everything from `debug` up is printed.
// - Production: only `warn` and `error` are printed, to keep container logs
//   useful and avoid leaking data.
// - Server-side `LOG_LEVEL` overrides the default threshold (one of
//   `debug | info | warn | error`). It is ignored in the browser, which always
//   falls back to the `NODE_ENV` default.

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const isProduction = process.env.NODE_ENV === 'production';

function resolveMinLevel(): LogLevel {
  const configured = process.env.LOG_LEVEL?.toLowerCase();
  if (configured && configured in LEVEL_WEIGHT) {
    return configured as LogLevel;
  }
  return isProduction ? 'warn' : 'debug';
}

const minLevel = resolveMinLevel();

function emit(level: LogLevel, scope: string, args: unknown[]): void {
  if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[minLevel]) {
    return;
  }

  const prefix = `[${scope}]`;

  switch (level) {
    case 'debug':
      console.debug(prefix, ...args);
      break;
    case 'info':
      console.info(prefix, ...args);
      break;
    case 'warn':
      console.warn(prefix, ...args);
      break;
    case 'error':
      console.error(prefix, ...args);
      break;
  }
}

export function createLogger(scope: string) {
  return {
    debug: (...args: unknown[]) => emit('debug', scope, args),
    info: (...args: unknown[]) => emit('info', scope, args),
    warn: (...args: unknown[]) => emit('warn', scope, args),
    error: (...args: unknown[]) => emit('error', scope, args),
  };
}

export type Logger = ReturnType<typeof createLogger>;

export const logger = createLogger('app');
