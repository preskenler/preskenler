'use client';

import { RiCheckLine, RiMailLine } from '@remixicon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { waitlistSchema, type WaitlistValues } from '@/lib/schemas/waitlist';

// TODO(copy): replace every string in this component with the announced copy.
export function WaitlistForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<WaitlistValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  });

  function onSubmit() {
    // TODO(api): POST the validated email to the waitlist endpoint once the
    // backend exists, and validate again with `waitlistSchema` server-side.
  }

  if (isSubmitSuccessful) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex w-full max-w-md items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
      >
        <RiCheckLine className="size-4 text-primary" aria-hidden />
        Merci ! On te tiendra au courant du lancement.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="w-full max-w-md"
    >
      <Field data-invalid={errors.email ? true : undefined}>
        <FieldLabel htmlFor="waitlist-email" className="sr-only">
          Adresse email
        </FieldLabel>
        <div className="flex w-full items-start gap-2">
          <div className="relative flex-1">
            <RiMailLine
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="waitlist-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="ton@email.com"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={`waitlist-help${
                errors.email ? ' waitlist-error' : ''
              }`}
              className="h-10 pl-9"
              {...register('email')}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-10 shrink-0 px-4"
            disabled={isSubmitting}
          >
            Me prévenir
          </Button>
        </div>
        <FieldError id="waitlist-error" errors={[errors.email]} />
        <FieldDescription id="waitlist-help">
          Pas de spam. Un seul email au lancement.
        </FieldDescription>
      </Field>
    </form>
  );
}
