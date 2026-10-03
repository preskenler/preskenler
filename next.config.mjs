import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  output: 'standalone',
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

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
