'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';

import { submitProblemReport } from '@/app/[locale]/(public)/reports/actions';
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
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { Link } from '@/i18n/navigation';
import { problemCategories } from '@/lib/reports';
import { createReportSchema, type ReportValues } from '@/lib/schemas/report';

export function ReportForm({
  defaultName,
  defaultEmail,
}: {
  defaultName: string;
  defaultEmail: string;
}) {
  const t = useTranslations('Validation.report');
  const tPage = useTranslations('Public.Reports');
  const tReport = useTranslations('Public.Reports.form');
  const tCategories = useTranslations('Public.Reports.categories');
  const [reference, setReference] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ReportValues>({
    resolver: zodResolver(createReportSchema(t)),
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
      category: problemCategories[0],
      location: '',
      description: '',
    },
    mode: 'onTouched',
  });

  // Clear the server error as soon as the user edits a field.
  function field(name: keyof ReportValues): UseFormRegisterReturn {
    const registration = register(name);
    return {
      ...registration,
      onChange: (event) => {
        clearErrors('root');
        return registration.onChange(event);
      },
    };
  }

  async function onSubmit(values: ReportValues) {
    const result = await submitProblemReport(values);

    if (result.error || !result.reference) {
      setError('root.server', { message: result.error ?? tReport('error') });
      return;
    }

    setReference(result.reference);
  }

  if (reference) {
    return (
      <Card role="status" aria-live="polite">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{tReport('sent.title')}</CardTitle>
          <CardDescription>{tReport('sent.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="rounded-2xl border bg-muted px-6 py-4 text-center">
            <p className="text-sm text-muted-foreground">
              {tReport('sent.reference')}
            </p>
            <p className="font-heading text-2xl font-semibold tracking-tight">
              {reference}
            </p>
            <p className="text-xs text-muted-foreground">
              {tReport('sent.referenceHint')}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/reports" />}
            >
              {tReport('sent.track')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setReference(null);
              }}
            >
              {tReport('sent.again')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{tPage('title')}</CardTitle>
        <CardDescription>{tPage('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.name ? true : undefined}>
              <FieldLabel htmlFor="report-name">{tReport('name')}</FieldLabel>
              <Input
                id="report-name"
                type="text"
                autoComplete="name"
                placeholder={tReport('namePlaceholder')}
                required
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? 'report-name-error' : undefined}
                {...field('name')}
              />
              <FieldError id="report-name-error" errors={[errors.name]} />
            </Field>

            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="report-email">{tReport('email')}</FieldLabel>
              <Input
                id="report-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={tReport('emailPlaceholder')}
                required
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={
                  errors.email ? 'report-email-error' : undefined
                }
                {...field('email')}
              />
              <FieldError id="report-email-error" errors={[errors.email]} />
            </Field>

            <Field data-invalid={errors.category ? true : undefined}>
              <FieldLabel htmlFor="report-category">
                {tReport('category')}
              </FieldLabel>
              <NativeSelect
                id="report-category"
                className="w-full"
                required
                aria-invalid={errors.category ? true : undefined}
                aria-describedby={
                  errors.category ? 'report-category-error' : undefined
                }
                {...field('category')}
              >
                {problemCategories.map((category) => (
                  <NativeSelectOption key={category} value={category}>
                    {tCategories(category)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError
                id="report-category-error"
                errors={[errors.category]}
              />
            </Field>

            <Field data-invalid={errors.location ? true : undefined}>
              <FieldLabel htmlFor="report-location">
                {tReport('location')}
              </FieldLabel>
              <Input
                id="report-location"
                type="text"
                placeholder={tReport('locationPlaceholder')}
                required
                aria-invalid={errors.location ? true : undefined}
                aria-describedby={
                  errors.location ? 'report-location-error' : undefined
                }
                {...field('location')}
              />
              <FieldError
                id="report-location-error"
                errors={[errors.location]}
              />
            </Field>

            <Field data-invalid={errors.description ? true : undefined}>
              <FieldLabel htmlFor="report-description">
                {tReport('description')}
              </FieldLabel>
              <Textarea
                id="report-description"
                rows={5}
                required
                placeholder={tReport('descriptionPlaceholder')}
                aria-invalid={errors.description ? true : undefined}
                aria-describedby={`report-description-help${
                  errors.description ? ' report-description-error' : ''
                }`}
                {...field('description')}
              />
              <FieldDescription id="report-description-help">
                {tReport('descriptionHelp')}
              </FieldDescription>
              <FieldError
                id="report-description-error"
                errors={[errors.description]}
              />
            </Field>

            <FieldError id="report-form-error" errors={[errors.root?.server]} />

            <Field>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                {tReport('submit')}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
