'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';

import {
  createAppointmentSlot,
  type SlotActionState,
} from '@/app/[locale]/(dashboard)/dashboard/appointments/actions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Spinner } from '@/components/ui/spinner';

export type SlotFormService = { slug: string; name: string };

const initialSlotState: SlotActionState = { status: 'idle' };

export function AppointmentSlotForm({
  services,
}: {
  services: SlotFormService[];
}) {
  const t = useTranslations('Dashboard.appointments.slots');
  const [state, formAction, pending] = useActionState(
    createAppointmentSlot,
    initialSlotState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="slot-service">{t('service')}</FieldLabel>
              <NativeSelect
                id="slot-service"
                name="service"
                className="w-full"
                required
              >
                {services.map((service) => (
                  <NativeSelectOption key={service.slug} value={service.slug}>
                    {service.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>

            <Field>
              <FieldLabel htmlFor="slot-starts-at">{t('startsAt')}</FieldLabel>
              <Input
                id="slot-starts-at"
                name="startsAt"
                type="datetime-local"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="slot-duration">{t('duration')}</FieldLabel>
              <Input
                id="slot-duration"
                name="durationMinutes"
                type="number"
                min={10}
                max={180}
                step={5}
                defaultValue={30}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="slot-agent">{t('agentName')}</FieldLabel>
              <Input id="slot-agent" name="agentName" type="text" />
            </Field>

            <Field>
              <FieldLabel htmlFor="slot-location">{t('location')}</FieldLabel>
              <Input id="slot-location" name="location" type="text" />
            </Field>

            <Field>
              <FieldLabel htmlFor="slot-capacity">{t('capacity')}</FieldLabel>
              <Input
                id="slot-capacity"
                name="capacity"
                type="number"
                min={1}
                max={20}
                defaultValue={1}
                required
              />
            </Field>

            <Field>
              <Button type="submit" disabled={pending}>
                {pending ? <Spinner data-icon="inline-start" /> : null}
                {t('submit')}
              </Button>
            </Field>
          </FieldGroup>
        </form>

        {state.status === 'success' ? (
          <Alert role="status" className="mt-4">
            <AlertDescription>{t('created')}</AlertDescription>
          </Alert>
        ) : null}
        {state.status === 'error' ? (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
