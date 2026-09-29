'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/lib/auth-client';
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from '@/lib/schemas/auth';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  function field(name: keyof ResetPasswordValues): UseFormRegisterReturn {
    const registration = register(name);
    return {
      ...registration,
      onChange: (event) => {
        clearErrors('root');
        return registration.onChange(event);
      },
    };
  }

  async function onSubmit(values: ResetPasswordValues) {
    if (!token) {
      setError('root.server', {
        message: 'Lien de réinitialisation invalide ou expiré.',
      });
      return;
    }

    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });

    if (error) {
      setError('root.server', {
        message:
          error.message ??
          'Réinitialisation impossible. Le lien est peut-être expiré.',
      });
    }
  }

  if (isSubmitSuccessful) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Mot de passe modifié</CardTitle>
          <CardDescription>
            Tu peux maintenant te connecter avec ton nouveau mot de passe. Par
            sécurité, toutes tes sessions ont été déconnectées.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldDescription className="text-center">
            <Link href="/sign-in">Se connecter</Link>
          </FieldDescription>
        </CardContent>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Lien invalide</CardTitle>
          <CardDescription>
            Ce lien de réinitialisation est incomplet ou a expiré.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldDescription className="text-center">
            <Link href="/forgot-password">Demander un nouveau lien</Link>
          </FieldDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Nouveau mot de passe</CardTitle>
        <CardDescription>
          Choisis un nouveau mot de passe pour ton compte.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.password ? true : undefined}>
              <FieldLabel htmlFor="reset-password-password">
                Nouveau mot de passe
              </FieldLabel>
              <Input
                id="reset-password-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={`reset-password-help${
                  errors.password ? ' reset-password-password-error' : ''
                }`}
                {...field('password')}
              />
              <FieldDescription id="reset-password-help">
                Au moins 8 caractères.
              </FieldDescription>
              <FieldError
                id="reset-password-password-error"
                errors={[errors.password]}
              />
            </Field>

            <Field data-invalid={errors.confirmPassword ? true : undefined}>
              <FieldLabel htmlFor="reset-password-confirm">
                Confirme le mot de passe
              </FieldLabel>
              <Input
                id="reset-password-confirm"
                type="password"
                autoComplete="new-password"
                required
                aria-invalid={errors.confirmPassword ? true : undefined}
                aria-describedby={
                  errors.confirmPassword
                    ? 'reset-password-confirm-error'
                    : undefined
                }
                {...field('confirmPassword')}
              />
              <FieldError
                id="reset-password-confirm-error"
                errors={[errors.confirmPassword]}
              />
            </Field>

            <FieldError
              id="reset-password-error"
              errors={[errors.root?.server]}
            />

            <Field>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                Réinitialiser mon mot de passe
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
