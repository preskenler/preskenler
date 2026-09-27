'use client';

import { useState, type FormEvent } from 'react';
import { CheckIcon, MailIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

// TODO(copy): replace every string in this component with the announced copy.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = email.trim();

    if (!value) {
      setError('Entre ton adresse email.');
      return;
    }

    if (!EMAIL_PATTERN.test(value)) {
      setError('Cette adresse email ne semble pas valide.');
      return;
    }

    setError(null);
    setSubmitted(true);

    // TODO(api): POST `value` to the waitlist endpoint once the backend exists.
  }

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex w-full max-w-md items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
      >
        <CheckIcon className="size-4 text-primary" aria-hidden />
        Merci ! On te tiendra au courant du lancement.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-md">
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor="waitlist-email" className="sr-only">
          Adresse email
        </FieldLabel>
        <div className="flex w-full items-start gap-2">
          <div className="relative flex-1">
            <MailIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="waitlist-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="ton@email.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby="waitlist-help"
              className="h-10 pl-9"
            />
          </div>
          <Button type="submit" size="lg" className="h-10 shrink-0 px-4">
            Me prévenir
          </Button>
        </div>
        <FieldError id="waitlist-error">{error}</FieldError>
        <FieldDescription id="waitlist-help">
          Pas de spam. Un seul email au lancement.
        </FieldDescription>
      </Field>
    </form>
  );
}
