'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { RiAlertLine } from '@remixicon/react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { PasswordInput } from '@/components/auth/password-input';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import {
  createDeleteAccountSchema,
  type DeleteAccountValues,
} from '@/lib/schemas/auth';

export function DeleteAccountForm() {
  const t = useTranslations('Account.delete');
  const tv = useTranslations('Validation.auth');
  const router = useRouter();
  const confirmationWord = t('confirmWord');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DeleteAccountValues>({
    resolver: zodResolver(createDeleteAccountSchema(tv, confirmationWord)),
    defaultValues: { password: '', confirmation: '' },
    mode: 'onTouched',
  });

  async function onSubmit(values: DeleteAccountValues) {
    const { error } = await authClient.deleteUser({
      password: values.password,
    });

    if (error) {
      setError('root.server', {
        message: error.message ?? t('error'),
      });
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Alert variant="destructive">
              <RiAlertLine aria-hidden="true" />
              <AlertTitle>{t('warningTitle')}</AlertTitle>
              <AlertDescription>{t('warningDescription')}</AlertDescription>
            </Alert>

            <Field data-invalid={errors.password ? true : undefined}>
              <FieldLabel htmlFor="delete-account-password">
                {t('password')}
              </FieldLabel>
              <PasswordInput
                id="delete-account-password"
                autoComplete="current-password"
                required
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={
                  errors.password ? 'delete-account-password-error' : undefined
                }
                {...register('password')}
              />
              <FieldError
                id="delete-account-password-error"
                errors={[errors.password]}
              />
            </Field>

            <Field data-invalid={errors.confirmation ? true : undefined}>
              <FieldLabel htmlFor="delete-account-confirmation">
                {t('confirmLabel', { word: confirmationWord })}
              </FieldLabel>
              <Input
                id="delete-account-confirmation"
                autoComplete="off"
                required
                aria-invalid={errors.confirmation ? true : undefined}
                aria-describedby={
                  errors.confirmation
                    ? 'delete-account-confirmation-error'
                    : 'delete-account-confirmation-help'
                }
                {...register('confirmation')}
              />
              <FieldDescription id="delete-account-confirmation-help">
                {t('confirmHelp', { word: confirmationWord })}
              </FieldDescription>
              <FieldError
                id="delete-account-confirmation-error"
                errors={[errors.confirmation]}
              />
            </Field>

            <FieldError
              id="delete-account-error"
              errors={[errors.root?.server]}
            />

            <Field>
              <Button
                type="submit"
                variant="destructive"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                {t('submit')}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
