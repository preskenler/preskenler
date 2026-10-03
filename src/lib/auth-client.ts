import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { ac, appRoles } from '@/lib/permissions';

export const authClient = createAuthClient({
  plugins: [adminClient({ ac, roles: appRoles })],
});

export const {
  admin,
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
  changePassword,
  changeEmail,
  sendVerificationEmail,
  listSessions,
  revokeSession,
  revokeOtherSessions,
} = authClient;
