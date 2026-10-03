'use client';

import { useSearchParams } from 'next/navigation';
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
  createVerifyEmailSchema,
  type VerifyEmailValues,
} from '@/lib/schemas/auth';

export function VerifyEmailPanel({ email = '' }: { email?: string }) {
  const t = useTranslations('Auth.verify');
  const tv = useTranslations('Validation.auth');
  const locale = useLocale();
  const localePrefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified') === '1';

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<VerifyEmailValues>({
    resolver: zodResolver(createVerifyEmailSchema(tv)),
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
      callbackURL: `${window.location.origin}${localePrefix}/verify-email?verified=1`,
    });

    if (error) {
      setError('root.server', {
        message: error.message ?? t('error'),
      });
    }
  }

  if (verified) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('verifiedTitle')}</CardTitle>
          <CardDescription>{t('verifiedDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldDescription className="text-center">
            <Link href="/dashboard?account=info">{t('goToAccount')}</Link>
          </FieldDescription>
        </CardContent>
      </Card>
    );
  }

  if (isSubmitSuccessful) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('sentTitle')}</CardTitle>
          <CardDescription>{t('sentDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldDescription className="text-center">
            <Link href="/sign-in">{t('backToSignIn')}</Link>
          </FieldDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="verify-email-address">
                {t('email')}
              </FieldLabel>
              <Input
                id="verify-email-address"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t('emailPlaceholder')}
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
                {t('submit')}
              </Button>
              <FieldDescription className="text-center">
                <Link href="/sign-in">{t('backToSignIn')}</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
