'use client';

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
import { Link, useRouter } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { createSignInSchema, type SignInValues } from '@/lib/schemas/auth';

export function SignInForm() {
  const t = useTranslations('Auth.signIn');
  const tv = useTranslations('Validation.auth');
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(createSignInSchema(tv)),
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
      // Better Auth forbids banned accounts with a 403 / `BANNED_USER` code;
      // surface a localized message instead of its raw default.
      const status = (error as { status?: number }).status;
      setError('root.server', {
        message: status === 403 ? t('banned') : (error.message ?? t('error')),
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
            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="sign-in-email">{t('email')}</FieldLabel>
              <Input
                id="sign-in-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t('emailPlaceholder')}
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
                <FieldLabel htmlFor="sign-in-password">
                  {t('password')}
                </FieldLabel>
                <Link
                  href="/forgot-password"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  {t('forgot')}
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
                {t('submit')}
              </Button>
              <FieldDescription className="text-center">
                {t('noAccount')} <Link href="/sign-up">{t('signUp')}</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
