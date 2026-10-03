'use client';

import { useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';

import { submitServiceMessage } from '@/app/[locale]/(public)/contact/actions';
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
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { createContactSchema, type ContactValues } from '@/lib/schemas/contact';
import type { ServiceAvailability } from '@/components/public/services-directory';
import type { CityService } from '@/lib/services';

export function ContactForm({
  services,
  defaultName,
  defaultEmail,
  defaultService,
  availability = {},
}: {
  services: CityService[];
  defaultName: string;
  defaultEmail: string;
  defaultService?: string;
  availability?: Record<string, ServiceAvailability>;
}) {
  const t = useTranslations('Validation');
  const tContact = useTranslations('Public.Contact.form');
  const tServices = useTranslations('Public.Services');
  const tAvailability = useTranslations('Public.Services.availability');
  const format = useFormatter();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(createContactSchema(t)),
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
      service: defaultService ?? services[0]?.slug ?? '',
      message: '',
    },
    mode: 'onTouched',
  });

  const selectedAvailability = availability[watch('service')];
  const selectedUnavailable =
    selectedAvailability && selectedAvailability.status !== 'available';

  // Clear the server error as soon as the user edits a field.
  function field(name: keyof ContactValues): UseFormRegisterReturn {
    const registration = register(name);
    return {
      ...registration,
      onChange: (event) => {
        clearErrors('root');
        return registration.onChange(event);
      },
    };
  }

  async function onSubmit(values: ContactValues) {
    const result = await submitServiceMessage(values);

    if (result.error) {
      setError('root.server', { message: result.error });
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <Card role="status" aria-live="polite">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{tContact('sent.title')}</CardTitle>
          <CardDescription>{tContact('sent.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setSent(false)}
          >
            {tContact('sent.again')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{tContact('title')}</CardTitle>
        <CardDescription>{tContact('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.name ? true : undefined}>
              <FieldLabel htmlFor="contact-name">{tContact('name')}</FieldLabel>
              <Input
                id="contact-name"
                type="text"
                autoComplete="name"
                placeholder={tContact('namePlaceholder')}
                required
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={
                  errors.name ? 'contact-name-error' : undefined
                }
                {...field('name')}
              />
              <FieldError id="contact-name-error" errors={[errors.name]} />
            </Field>

            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="contact-email">
                {tContact('email')}
              </FieldLabel>
              <Input
                id="contact-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={tContact('emailPlaceholder')}
                required
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={
                  errors.email ? 'contact-email-error' : undefined
                }
                {...field('email')}
              />
              <FieldError id="contact-email-error" errors={[errors.email]} />
            </Field>

            <Field data-invalid={errors.service ? true : undefined}>
              <FieldLabel htmlFor="contact-service">
                {tContact('service')}
              </FieldLabel>
              <NativeSelect
                id="contact-service"
                className="w-full"
                required
                aria-invalid={errors.service ? true : undefined}
                aria-describedby={
                  errors.service ? 'contact-service-error' : undefined
                }
                {...field('service')}
              >
                {services.map((service) => (
                  <NativeSelectOption key={service.slug} value={service.slug}>
                    {tServices(`items.${service.slug}.name`)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError
                id="contact-service-error"
                errors={[errors.service]}
              />
            </Field>

            {selectedUnavailable && selectedAvailability ? (
              <Alert
                variant={
                  selectedAvailability.status === 'incident'
                    ? 'destructive'
                    : 'default'
                }
              >
                <AlertTitle>
                  {tAvailability(selectedAvailability.status)}
                </AlertTitle>
                <AlertDescription>
                  <p>
                    {selectedAvailability.message ?? tAvailability('notice')}
                  </p>
                  {selectedAvailability.expectedReturn ? (
                    <p>
                      {tAvailability('expectedReturn', {
                        date: format.dateTime(
                          new Date(selectedAvailability.expectedReturn),
                          { dateStyle: 'long', timeStyle: 'short' },
                        ),
                      })}
                    </p>
                  ) : null}
                  {selectedAvailability.alternative ? (
                    <p>
                      {tAvailability('alternative', {
                        alternative: selectedAvailability.alternative,
                      })}
                    </p>
                  ) : null}
                  <p>{tAvailability('contactBlocked')}</p>
                </AlertDescription>
              </Alert>
            ) : null}

            <Field data-invalid={errors.message ? true : undefined}>
              <FieldLabel htmlFor="contact-message">
                {tContact('message')}
              </FieldLabel>
              <Textarea
                id="contact-message"
                rows={6}
                required
                placeholder={tContact('messagePlaceholder')}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={`contact-message-help${
                  errors.message ? ' contact-message-error' : ''
                }`}
                {...field('message')}
              />
              <FieldDescription id="contact-message-help">
                {tContact('messageHelp')}
              </FieldDescription>
              <FieldError
                id="contact-message-error"
                errors={[errors.message]}
              />
            </Field>

            <FieldError
              id="contact-form-error"
              errors={[errors.root?.server]}
            />

            <Field>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                {tContact('submit')}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
