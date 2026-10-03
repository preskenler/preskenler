'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Controller,
  useForm,
  type UseFormRegisterReturn,
} from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
  createChangePasswordSchema,
  type ChangePasswordValues,
} from '@/lib/schemas/auth';

const defaultValues: ChangePasswordValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  revokeOtherSessions: true,
};

export function ChangePasswordForm() {
  const t = useTranslations('Account.password');
  const tv = useTranslations('Validation.auth');
  const {
    register,
    control,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(createChangePasswordSchema(tv)),
    defaultValues,
    mode: 'onTouched',
  });

  function field(name: keyof ChangePasswordValues): UseFormRegisterReturn {
    const registration = register(name);
    return {
      ...registration,
      onChange: (event) => {
        clearErrors('root');
        return registration.onChange(event);
      },
    };
  }

  async function onSubmit(values: ChangePasswordValues) {
    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: values.revokeOtherSessions,
    });

    if (error) {
      setError('root.server', {
        message: error.message ?? t('error'),
      });
      return;
    }

    reset(defaultValues);
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
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.currentPassword ? true : undefined}>
              <FieldLabel htmlFor="change-password-current">
                {t('current')}
              </FieldLabel>
              <Input
                id="change-password-current"
                type="password"
                autoComplete="current-password"
                required
                aria-invalid={errors.currentPassword ? true : undefined}
                aria-describedby={
                  errors.currentPassword
                    ? 'change-password-current-error'
                    : undefined
                }
                {...field('currentPassword')}
              />
              <FieldError
                id="change-password-current-error"
                errors={[errors.currentPassword]}
              />
            </Field>

            <Field data-invalid={errors.newPassword ? true : undefined}>
              <FieldLabel htmlFor="change-password-new">{t('new')}</FieldLabel>
              <Input
                id="change-password-new"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                aria-invalid={errors.newPassword ? true : undefined}
                aria-describedby={`change-password-help${
                  errors.newPassword ? ' change-password-new-error' : ''
                }`}
                {...field('newPassword')}
              />
              <FieldDescription id="change-password-help">
                {t('minLength')}
              </FieldDescription>
              <FieldError
                id="change-password-new-error"
                errors={[errors.newPassword]}
              />
            </Field>

            <Field data-invalid={errors.confirmPassword ? true : undefined}>
              <FieldLabel htmlFor="change-password-confirm">
                {t('confirm')}
              </FieldLabel>
              <Input
                id="change-password-confirm"
                type="password"
                autoComplete="new-password"
                required
                aria-invalid={errors.confirmPassword ? true : undefined}
                aria-describedby={
                  errors.confirmPassword
                    ? 'change-password-confirm-error'
                    : undefined
                }
                {...field('confirmPassword')}
              />
              <FieldError
                id="change-password-confirm-error"
                errors={[errors.confirmPassword]}
              />
            </Field>

            <Controller
              control={control}
              name="revokeOtherSessions"
              render={({ field: checkboxField }) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id="change-password-revoke"
                    checked={checkboxField.value}
                    onCheckedChange={(checked) =>
                      checkboxField.onChange(checked)
                    }
                  />
                  <FieldLabel htmlFor="change-password-revoke">
                    {t('revoke')}
                  </FieldLabel>
                </Field>
              )}
            />

            <FieldError
              id="change-password-error"
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
