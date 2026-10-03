'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { useLocale, useTranslations } from 'next-intl';

import { PasswordInput } from '@/components/auth/password-input';
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
import { Link, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { authClient } from '@/lib/auth-client';
import { createSignUpSchema, type SignUpValues } from '@/lib/schemas/auth';

export function SignUpForm() {
  const t = useTranslations('Auth.signUp');
  const tv = useTranslations('Validation.auth');
  const locale = useLocale();
  const localePrefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(createSignUpSchema(tv)),
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onTouched',
  });

  // The previous form cleared the server error as soon as the user edited a
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
    const { error } = await authClient.signUp.email({
      ...values,
      // Land on the verification page after the user opens the emailed link.
      callbackURL: `${window.location.origin}${localePrefix}/verify-email?verified=1`,
    });

    if (error) {
      setError('root.server', {
        message: error.message ?? t('error'),
      });
      return;
    }

    router.push('/dashboard');
    router.refresh();
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
            <Field data-invalid={errors.name ? true : undefined}>
              <FieldLabel htmlFor="sign-up-name">{t('name')}</FieldLabel>
              <Input
                id="sign-up-name"
                type="text"
                autoComplete="name"
                placeholder={t('namePlaceholder')}
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
              <FieldLabel htmlFor="sign-up-email">{t('email')}</FieldLabel>
              <Input
                id="sign-up-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t('emailPlaceholder')}
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
              <FieldLabel htmlFor="sign-up-password">
                {t('password')}
              </FieldLabel>
              <PasswordInput
                id="sign-up-password"
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
                {t('passwordHint')}
              </FieldDescription>
              <FieldError
                id="sign-up-password-error"
                errors={[errors.password]}
              />
            </Field>

            <FieldError id="sign-up-error" errors={[errors.root?.server]} />

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
                {t('haveAccount')} <Link href="/sign-in">{t('signIn')}</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
