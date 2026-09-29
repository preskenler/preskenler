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
import { changeEmailSchema, type ChangeEmailValues } from '@/lib/schemas/auth';

export function ChangeEmailForm({ currentEmail }: { currentEmail?: string }) {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: '' },
    mode: 'onTouched',
  });

  function field(name: keyof ChangeEmailValues): UseFormRegisterReturn {
    const registration = register(name);
    return {
      ...registration,
      onChange: (event) => {
        clearErrors('root');
        return registration.onChange(event);
      },
    };
  }

  async function onSubmit(values: ChangeEmailValues) {
    const { error } = await authClient.changeEmail({
      newEmail: values.newEmail,
      callbackURL: `${window.location.origin}/account`,
    });

    if (error) {
      setError('root.server', {
        message:
          error.message ??
          "Impossible de changer l'adresse email pour le moment.",
      });
      return;
    }

    reset({ newEmail: '' });
  }

  if (isSubmitSuccessful) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vérifie tes emails</CardTitle>
          <CardDescription>
            Pour des raisons de sécurité, le changement d&apos;adresse email
            doit être confirmé depuis ta boîte mail. Ouvre le lien que nous
            venons d&apos;envoyer pour finaliser la modification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldDescription>
            <Link href="/account">Retour au compte</Link>
          </FieldDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Changer mon adresse email</CardTitle>
        <CardDescription>
          {currentEmail
            ? `Adresse actuelle : ${currentEmail}`
            : 'Entre ta nouvelle adresse email.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.newEmail ? true : undefined}>
              <FieldLabel htmlFor="change-email-new">
                Nouvelle adresse email
              </FieldLabel>
              <Input
                id="change-email-new"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nouvelle@email.com"
                required
                aria-invalid={errors.newEmail ? true : undefined}
                aria-describedby={
                  errors.newEmail ? 'change-email-new-error' : undefined
                }
                {...field('newEmail')}
              />
              <FieldError
                id="change-email-new-error"
                errors={[errors.newEmail]}
              />
            </Field>

            <FieldError
              id="change-email-error"
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
                Changer mon adresse email
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
