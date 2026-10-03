import type { Metadata } from 'next';

import { ChangePasswordForm } from '@/components/auth/change-password-form';

export const metadata: Metadata = {
  title: 'Changer mon mot de passe — PreskEnLer',
};

export default function ChangePasswordPage() {
  return <ChangePasswordForm />;
}
