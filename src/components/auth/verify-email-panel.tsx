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
import { verifyEmailSchema, type VerifyEmailValues } from '@/lib/schemas/auth';

export function VerifyEmailPanel({ email = '' }: { email?: string }) {
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified') === '1';

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email },
    mode: 'onTouched',
  });

  function field(name: keyof VerifyEmailValues): UseFormRegisterReturn {
    const registration = register(name);
    return {
      ...registration,
      onChange: (event) => {
        clearErrors('root');
        return registration.onChange(event);
      },
    };
  }

  async function onSubmit(values: VerifyEmailValues) {
    const { error } = await authClient.sendVerificationEmail({
      email: values.email,
      callbackURL: `${window.location.origin}/verify-email?verified=1`,
    });

    if (error) {
      setError('root.server', {
        message:
          error.message ??
          "Impossible d'envoyer l'email de vérification pour le moment.",
      });
    }
  }

  if (verified) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Adresse email vérifiée</CardTitle>
          <CardDescription>
            Merci ! Ton adresse email est maintenant confirmée.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldDescription className="text-center">
            <Link href="/account">Accéder à mon compte</Link>
          </FieldDescription>
        </CardContent>
      </Card>
    );
  }

  if (isSubmitSuccessful) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Email envoyé</CardTitle>
          <CardDescription>
            Si un compte non vérifié existe pour cette adresse, tu recevras un
            nouveau lien de vérification.
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
        <CardTitle className="text-xl">Vérifier mon adresse email</CardTitle>
        <CardDescription>
          Renvoie un lien de vérification à l&apos;adresse associée à ton
          compte.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="verify-email-address">
                Adresse email
              </FieldLabel>
              <Input
                id="verify-email-address"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="ton@email.com"
                required
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={
                  errors.email ? 'verify-email-address-error' : undefined
                }
                {...field('email')}
              />
              <FieldError
                id="verify-email-address-error"
                errors={[errors.email]}
              />
            </Field>

            <FieldError
              id="verify-email-error"
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
                Renvoyer l&apos;email de vérification
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
