import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { admin as adminPlugin } from 'better-auth/plugins';
import { sendEmail } from '@/lib/email';
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
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Réinitialise ton mot de passe PreskEnLer',
        text: [
          `Bonjour ${user.name},`,
          '',
          'Tu as demandé à réinitialiser ton mot de passe.',
          'Ouvre ce lien pour en choisir un nouveau :',
          url,
          '',
          "Si tu n'es pas à l'origine de cette demande, ignore cet email.",
        ].join('\n'),
      });
    },
  },
  emailVerification: {
    // Send a verification email on sign-up, but do not block sign-in until the
    // address is verified (`emailAndPassword.requireEmailVerification` stays off).
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Vérifie ton adresse email PreskEnLer',
        text: [
          `Bonjour ${user.name},`,
          '',
          'Confirme ton adresse email pour terminer ton inscription :',
          url,
          '',
          "Si tu n'es pas à l'origine de cette inscription, ignore cet email.",
        ].join('\n'),
      });
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      // A verified user gets a confirmation link on their current address
      // before the change takes effect.
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        await sendEmail({
          to: user.email,
          subject: 'Confirme le changement d’adresse email PreskEnLer',
          text: [
            `Bonjour ${user.name},`,
            '',
            `Tu as demandé à utiliser ${newEmail} pour ton compte.`,
            'Ouvre ce lien pour confirmer ce changement :',
            url,
            '',
            "Si tu n'es pas à l'origine de cette demande, ignore cet email.",
          ].join('\n'),
        });
      },
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
      bannedUserMessage:
        'Ton compte a été suspendu. Contacte l’administration si tu penses qu’il s’agit d’une erreur.',
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
