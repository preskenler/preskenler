'use client';

import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { useTranslations } from 'next-intl';

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
import { authClient } from '@/lib/auth-client';
import {
  createResetPasswordSchema,
  type ResetPasswordValues,
} from '@/lib/schemas/auth';

export function ResetPasswordForm() {
  const t = useTranslations('Auth.reset');
  const tv = useTranslations('Validation.auth');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(createResetPasswordSchema(tv)),
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
      setError('root.server', { message: t('invalidToken') });
      return;
    }

    const { error } = await authClient.resetPassword({
      newPassword: values.password,
      token,
    });

    if (error) {
      setError('root.server', {
        message: error.message ?? t('error'),
      });
    }
  }

  if (isSubmitSuccessful) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('successTitle')}</CardTitle>
          <CardDescription>{t('successDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldDescription className="text-center">
            <Link href="/sign-in">{t('signIn')}</Link>
          </FieldDescription>
        </CardContent>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('invalidTitle')}</CardTitle>
          <CardDescription>{t('invalidDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldDescription className="text-center">
            <Link href="/forgot-password">{t('requestNew')}</Link>
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
            <Field data-invalid={errors.password ? true : undefined}>
              <FieldLabel htmlFor="reset-password-password">
                {t('password')}
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
                {t('passwordHint')}
              </FieldDescription>
              <FieldError
                id="reset-password-password-error"
                errors={[errors.password]}
              />
            </Field>

            <Field data-invalid={errors.confirmPassword ? true : undefined}>
              <FieldLabel htmlFor="reset-password-confirm">
                {t('confirm')}
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
                {t('submit')}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
