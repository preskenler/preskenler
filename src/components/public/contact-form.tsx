'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';

import { submitServiceMessage } from '@/app/(public)/contact/actions';
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
import { contactSchema, type ContactValues } from '@/lib/schemas/contact';
import type { CityService } from '@/lib/services';

export function ContactForm({
  services,
  defaultName,
  defaultEmail,
  defaultService,
}: {
  services: CityService[];
  defaultName: string;
  defaultEmail: string;
  defaultService?: string;
}) {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
      service: defaultService ?? services[0]?.slug ?? '',
      message: '',
    },
    mode: 'onTouched',
  });

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
          <CardTitle className="text-xl">Message envoyé</CardTitle>
          <CardDescription>
            Le service concerné te répondra à l’adresse indiquée.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setSent(false)}
          >
            Envoyer un autre message
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Écrire aux services municipaux
        </CardTitle>
        <CardDescription>
          Décris ta question ou ta difficulté, nous transmettons le message au
          bon service.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.name ? true : undefined}>
              <FieldLabel htmlFor="contact-name">Nom</FieldLabel>
              <Input
                id="contact-name"
                type="text"
                autoComplete="name"
                placeholder="Ton nom"
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
              <FieldLabel htmlFor="contact-email">Adresse email</FieldLabel>
              <Input
                id="contact-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="ton@email.com"
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
                Service concerné
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
                    {service.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldError
                id="contact-service-error"
                errors={[errors.service]}
              />
            </Field>

            <Field data-invalid={errors.message ? true : undefined}>
              <FieldLabel htmlFor="contact-message">Message</FieldLabel>
              <Textarea
                id="contact-message"
                rows={6}
                required
                placeholder="Explique ta demande…"
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={`contact-message-help${
                  errors.message ? ' contact-message-error' : ''
                }`}
                {...field('message')}
              />
              <FieldDescription id="contact-message-help">
                Pas de données sensibles dans ce message.
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
                Envoyer le message
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
