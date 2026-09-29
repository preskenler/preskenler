'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { signInSchema, type SignInValues } from '@/lib/schemas/auth';

export function SignInForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  // The previous form cleared the server error as soon as the user edited a
  // field; keep that behaviour by clearing the root error on every change.
  function field(name: keyof SignInValues): UseFormRegisterReturn {
    const registration = register(name);
    return {
      ...registration,
      onChange: (event) => {
        clearErrors('root');
        return registration.onChange(event);
      },
    };
  }

  async function onSubmit(values: SignInValues) {
    const { error } = await authClient.signIn.email(values);

    if (error) {
      setError('root.server', {
        message:
          error.message ?? 'Connexion impossible. Vérifie tes identifiants.',
      });
      return;
    }

    router.push('/account');
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Connexion</CardTitle>
        <CardDescription>
          Entre tes identifiants pour accéder à ton compte.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="sign-in-email">Adresse email</FieldLabel>
              <Input
                id="sign-in-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="ton@email.com"
                required
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={
                  errors.email ? 'sign-in-email-error' : undefined
                }
                {...field('email')}
              />
              <FieldError id="sign-in-email-error" errors={[errors.email]} />
            </Field>

            <Field data-invalid={errors.password ? true : undefined}>
              <div className="flex items-center">
                <FieldLabel htmlFor="sign-in-password">Mot de passe</FieldLabel>
                <Link
                  href="/forgot-password"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input
                id="sign-in-password"
                type="password"
                autoComplete="current-password"
                required
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={
                  errors.password ? 'sign-in-password-error' : undefined
                }
                {...field('password')}
              />
              <FieldError
                id="sign-in-password-error"
                errors={[errors.password]}
              />
            </Field>

            <FieldError id="sign-in-error" errors={[errors.root?.server]} />

            <Field>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                Se connecter
              </Button>
              <FieldDescription className="text-center">
                Pas encore de compte ?{' '}
                <Link href="/sign-up">Créer un compte</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
