'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';

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
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { authClient } from '@/lib/auth-client';
import {
  createChangeEmailSchema,
  type ChangeEmailValues,
} from '@/lib/schemas/auth';

export function ChangeEmailForm({ currentEmail }: { currentEmail?: string }) {
  const t = useTranslations('Account.emailChange');
  const tv = useTranslations('Validation.auth');
  const locale = useLocale();
  const localePrefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ChangeEmailValues>({
    resolver: zodResolver(createChangeEmailSchema(tv)),
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
      callbackURL: `${window.location.origin}${localePrefix}/dashboard/account`,
    });

    if (error) {
      setError('root.server', {
        message: error.message ?? t('error'),
      });
      return;
    }

    reset({ newEmail: '' });
  }

  if (isSubmitSuccessful) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('successTitle')}</CardTitle>
          <CardDescription>{t('successDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldDescription>
            <Link href="/dashboard/account">{t('back')}</Link>
          </FieldDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {currentEmail
            ? t('current', { email: currentEmail })
            : t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.newEmail ? true : undefined}>
              <FieldLabel htmlFor="change-email-new">{t('new')}</FieldLabel>
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
                {t('submit')}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
