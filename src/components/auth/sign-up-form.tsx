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
  CardFooter,
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
import { signUpSchema, type SignUpValues } from '@/lib/schemas/auth';

export function SignUpForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onTouched',
  });

  // The existing form cleared the server error as soon as the user edited a
  // field; keep that behaviour by clearing the root error on every change.
  function field(name: keyof SignUpValues): UseFormRegisterReturn {
    const registration = register(name);
    return {
      ...registration,
      onChange: (event) => {
        clearErrors('root');
        return registration.onChange(event);
      },
    };
  }

  async function onSubmit(values: SignUpValues) {
    const { error } = await authClient.signUp.email(values);

    if (error) {
      setError('root.server', {
        message: error.message ?? 'Création du compte impossible.',
      });
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>
          Quelques secondes suffisent pour rejoindre PreskEnLer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.name ? true : undefined}>
              <FieldLabel htmlFor="sign-up-name">Nom</FieldLabel>
              <Input
                id="sign-up-name"
                type="text"
                autoComplete="name"
                required
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={
                  errors.name ? 'sign-up-name-error' : undefined
                }
                {...field('name')}
              />
              <FieldError id="sign-up-name-error" errors={[errors.name]} />
            </Field>

            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="sign-up-email">Adresse email</FieldLabel>
              <Input
                id="sign-up-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={
                  errors.email ? 'sign-up-email-error' : undefined
                }
                {...field('email')}
              />
              <FieldError id="sign-up-email-error" errors={[errors.email]} />
            </Field>

            <Field data-invalid={errors.password ? true : undefined}>
              <FieldLabel htmlFor="sign-up-password">Mot de passe</FieldLabel>
              <Input
                id="sign-up-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={`sign-up-password-help${
                  errors.password ? ' sign-up-password-error' : ''
                }`}
                {...field('password')}
              />
              <FieldDescription id="sign-up-password-help">
                Au moins 8 caractères.
              </FieldDescription>
              <FieldError
                id="sign-up-password-error"
                errors={[errors.password]}
              />
            </Field>

            <FieldError id="sign-up-error" errors={[errors.root?.server]} />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner /> : null}
              Créer mon compte
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        Déjà un compte ?&nbsp;
        <Link
          href="/sign-in"
          className="text-primary underline-offset-4 hover:underline"
        >
          Se connecter
        </Link>
      </CardFooter>
    </Card>
  );
}
