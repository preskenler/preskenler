import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { prisma } from '@/lib/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'mysql',
  }),
  emailAndPassword: {
    enabled: true,
    // Keep the authoritative server-side rules in sync with `signUpSchema`
    // (`src/lib/schemas/auth.ts`). Better Auth applies the same defaults, but
    // stating them here makes the server boundary explicit.
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  logger: {
    // Surface the full auth flow while developing, but keep production quiet
    // by only logging errors.
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  },
  // Must be the last plugin so it can set cookies from Server Actions/Components.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
