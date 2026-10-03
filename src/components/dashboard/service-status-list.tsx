'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import {
  type ServiceStatusActionState,
  updateServiceStatus,
} from '@/app/[locale]/(dashboard)/dashboard/service-status/actions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import {
  serviceAvailabilityStatuses,
  type ServiceAvailabilityStatus,
} from '@/lib/service-status';

export type ServiceStatusRowData = {
  slug: string;
  name: string;
  status: ServiceAvailabilityStatus;
  message: string | null;
  expectedReturn: string | null;
  alternative: string | null;
};

const initialServiceStatusState: ServiceStatusActionState = {
  status: 'idle',
};

/** `datetime-local` needs a local-time string, not an ISO/UTC one. */
function toLocalInputValue(iso: string | null): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function ServiceStatusForm({ row }: { row: ServiceStatusRowData }) {
  const t = useTranslations('Dashboard.serviceStatus');
  const [state, formAction, pending] = useActionState(
    updateServiceStatus,
    initialServiceStatusState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{row.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="service" value={row.slug} />

          <Field>
            <FieldLabel htmlFor={`status-${row.slug}`}>
              {t('statusLabel')}
            </FieldLabel>
            <NativeSelect
              id={`status-${row.slug}`}
              name="status"
              defaultValue={row.status}
              className="w-full"
            >
              {serviceAvailabilityStatuses.map((status) => (
                <NativeSelectOption key={status} value={status}>
                  {t(status)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor={`message-${row.slug}`}>
              {t('message')}
            </FieldLabel>
            <Textarea
              id={`message-${row.slug}`}
              name="message"
              rows={2}
              defaultValue={row.message ?? ''}
              placeholder={t('messagePlaceholder')}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor={`return-${row.slug}`}>
              {t('expectedReturn')}
            </FieldLabel>
            <Input
              id={`return-${row.slug}`}
              name="expectedReturn"
              type="datetime-local"
              defaultValue={toLocalInputValue(row.expectedReturn)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor={`alternative-${row.slug}`}>
              {t('alternative')}
            </FieldLabel>
            <Textarea
              id={`alternative-${row.slug}`}
              name="alternative"
              rows={2}
              defaultValue={row.alternative ?? ''}
              placeholder={t('alternativePlaceholder')}
            />
          </Field>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner data-icon="inline-start" /> : null}
              {t('save')}
            </Button>
            {state.status === 'success' ? (
              <Alert role="status" className="w-fit py-1.5">
                <AlertDescription>{t('saved')}</AlertDescription>
              </Alert>
            ) : null}
            {state.status === 'error' ? (
              <Alert variant="destructive" className="w-fit py-1.5">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function ServiceStatusList({ rows }: { rows: ServiceStatusRowData[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map((row) => (
        <ServiceStatusForm key={row.slug} row={row} />
      ))}
    </div>
  );
}
