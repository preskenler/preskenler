import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin as adminPlugin } from 'better-auth/plugins';
import { sendEmail } from '@/lib/email';
import { resolveEmailLocale } from '@/lib/email-locale';
import {
  renderChangeEmailConfirmation,
  renderResetPasswordEmail,
  renderVerificationEmail,
} from '@/lib/email-templates';
import { ac, appRoles } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { getStaffEmailAllowlist } from '@/lib/roles';

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
    // Reset links are single-use and expire after one hour (Better Auth's
    // default). Resetting a password signs the user out everywhere.
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }, request) => {
      const { subject, text } = renderResetPasswordEmail(
        resolveEmailLocale(request),
        { name: user.name, url },
      );

      await sendEmail({ to: user.email, subject, text });
    },
  },
  emailVerification: {
    // Send a verification email on sign-up, but do not block sign-in until the
    // address is verified (`emailAndPassword.requireEmailVerification` stays off).
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }, request) => {
      const { subject, text } = renderVerificationEmail(
        resolveEmailLocale(request),
        { name: user.name, url },
      );

      await sendEmail({ to: user.email, subject, text });
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      // A verified user gets a confirmation link on their current address
      // before the change takes effect.
      sendChangeEmailConfirmation: async ({ user, newEmail, url }, request) => {
        const { subject, text } = renderChangeEmailConfirmation(
          resolveEmailLocale(request),
          { name: user.name, newEmail, url },
        );

        await sendEmail({ to: user.email, subject, text });
      },
    },
    deleteUser: {
      // Citizens may delete their own account after re-entering their password
      // (demande F33). No verification email is sent: deletion is immediate.
      enabled: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Bootstrap agents from `STAFF_EMAILS`. Runs after the admin plugin has
        // applied `defaultRole`, so the allowlisted role always wins.
        after: async (user) => {
          if (!getStaffEmailAllowlist().includes(user.email.toLowerCase())) {
            return;
          }

          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'agent' },
          });
        },
      },
    },
  },
  logger: {
    // Surface the full auth flow while developing, but keep production quiet
    // by only logging errors.
    level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  },
  // Must be the last plugin so it can set cookies from Server Actions/Components.
  plugins: [
    adminPlugin({
      ac,
      roles: appRoles,
      defaultRole: 'citizen',
      adminRoles: ['admin'],
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
