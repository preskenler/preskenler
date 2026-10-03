import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  output: 'standalone',
  // next-intl needs `next-intl/config` to resolve to our request config. We
  // wire that alias up manually instead of using `createNextIntlPlugin()`,
  // because the plugin eagerly imports `@swc/core` (for message extraction),
  // whose native addon the deploy host cannot load.
  turbopack: {
    resolveAlias: {
      'next-intl/config': './src/i18n/request.ts',
    },
  },
  webpack(config) {
    config.resolve ??= {};
    config.resolve.alias ??= {};
    config.resolve.alias['next-intl/config'] = path.resolve(
      'src/i18n/request.ts',
    );
    return config;
  },
  // Development-only terminal logging. None of these options affect the
  // production `standalone` build. See:
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/logging
  logging: {
    fetches: {
      // Log the full URL of every `fetch`, not just the path.
      fullUrl: true,
      // Also log fetches restored from the Server Components HMR cache.
      hmrRefreshes: true,
    },
    // Log Server Function calls (name, args, duration).
    serverFunctions: true,
    // Log incoming requests.
    incomingRequests: true,
    // Forward all browser console output to the terminal, with source locations.
    browserToTerminal: true,
  },
};

export default nextConfig;
