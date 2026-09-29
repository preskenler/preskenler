'use client';

import Link from 'next/link';
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
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from '@/lib/schemas/auth';

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  });

  function field(name: keyof ForgotPasswordValues): UseFormRegisterReturn {
    const registration = register(name);
    return {
      ...registration,
      onChange: (event) => {
        clearErrors('root');
        return registration.onChange(event);
      },
    };
  }

  async function onSubmit(values: ForgotPasswordValues) {
    const { error } = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError('root.server', {
        message:
          error.message ??
          "Impossible d'envoyer l'email pour le moment. Réessaie plus tard.",
      });
    }
  }

  if (isSubmitSuccessful) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Vérifie tes emails</CardTitle>
          <CardDescription>
            Si un compte existe pour cette adresse, tu recevras un lien pour
            choisir un nouveau mot de passe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldDescription className="text-center">
            <Link href="/sign-in">Retour à la connexion</Link>
          </FieldDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Mot de passe oublié</CardTitle>
        <CardDescription>
          Entre ton adresse email pour recevoir un lien de réinitialisation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="forgot-password-email">
                Adresse email
              </FieldLabel>
              <Input
                id="forgot-password-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="ton@email.com"
                required
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={
                  errors.email ? 'forgot-password-email-error' : undefined
                }
                {...field('email')}
              />
              <FieldError
                id="forgot-password-email-error"
                errors={[errors.email]}
              />
            </Field>

            <FieldError
              id="forgot-password-error"
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
                Envoyer le lien
              </Button>
              <FieldDescription className="text-center">
                <Link href="/sign-in">Retour à la connexion</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
