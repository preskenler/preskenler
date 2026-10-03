'use client';

import { useMemo, useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';

import { submitAppointment } from '@/app/[locale]/(public)/appointments/actions';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import type { AppointmentSlotView } from '@/lib/appointments';
import {
  createAppointmentSchema,
  type AppointmentValues,
} from '@/lib/schemas/appointment';
import { cn } from '@/lib/utils';

export type BookableService = { slug: string; name: string };

function groupSlotsByDay(slots: AppointmentSlotView[]) {
  const groups = new Map<string, AppointmentSlotView[]>();
  for (const slot of slots) {
    const key = new Date(slot.startsAt).toDateString();
    const list = groups.get(key);
    if (list) {
      list.push(slot);
    } else {
      groups.set(key, [slot]);
    }
  }
  return [...groups.values()]
    .map((list) => {
      const first = list[0];
      return first ? { date: new Date(first.startsAt), slots: list } : null;
    })
    .filter(
      (group): group is { date: Date; slots: AppointmentSlotView[] } =>
        group !== null,
    );
}

export function AppointmentBooking({
  services,
  slots,
  defaultName,
  defaultEmail,
}: {
  services: BookableService[];
  slots: AppointmentSlotView[];
  defaultName: string;
  defaultEmail: string;
}) {
  const t = useTranslations('Public.Appointments');
  const tServices = useTranslations('Public.Services');
  const tv = useTranslations('Validation.appointment');
  const format = useFormatter();
  const [reference, setReference] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentValues>({
    resolver: zodResolver(createAppointmentSchema(tv)),
    defaultValues: {
      slotId: '',
      name: defaultName,
      email: defaultEmail,
      phone: '',
      reason: '',
    },
    mode: 'onTouched',
  });

  const servicesWithSlots = useMemo(
    () =>
      services.filter((service) =>
        slots.some((slot) => slot.service === service.slug),
      ),
    [services, slots],
  );
  const [service, setService] = useState(servicesWithSlots[0]?.slug ?? '');

  const serviceSlots = useMemo(
    () => slots.filter((slot) => slot.service === service),
    [slots, service],
  );
  const grouped = useMemo(() => groupSlotsByDay(serviceSlots), [serviceSlots]);

  const selectedSlotId = watch('slotId');
  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === selectedSlotId) ?? null,
    [slots, selectedSlotId],
  );
  const selectedService = services.find((item) => item.slug === service);

  function field(name: keyof AppointmentValues): UseFormRegisterReturn {
    const registration = register(name);
    return {
      ...registration,
      onChange: (event) => {
        clearErrors('root');
        return registration.onChange(event);
      },
    };
  }

  async function onSubmit(values: AppointmentValues) {
    const result = await submitAppointment(values);

    if (result.error || !result.reference) {
      setError('root.server', { message: result.error ?? t('form.error') });
      if (result.slotUnavailable) {
        setValue('slotId', '');
      }
      return;
    }

    setReference(result.reference);
  }

  function slotSummary(slot: AppointmentSlotView) {
    return format.dateTime(new Date(slot.startsAt), {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  }

  if (reference && selectedSlot) {
    return (
      <Card role="status" aria-live="polite">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('confirmed.title')}</CardTitle>
          <CardDescription>{t('confirmed.description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <dl className="grid gap-2 rounded-2xl border bg-muted p-4 text-sm">
            <div>
              <dt className="text-muted-foreground">{t('summary.service')}</dt>
              <dd className="font-medium">{selectedService?.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('summary.when')}</dt>
              <dd className="font-medium">{slotSummary(selectedSlot)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t('summary.duration')}</dt>
              <dd className="font-medium">
                {t('summary.durationMinutes', {
                  minutes: selectedSlot.durationMinutes,
                })}
              </dd>
            </div>
            {selectedSlot.location ? (
              <div>
                <dt className="text-muted-foreground">
                  {t('summary.location')}
                </dt>
                <dd className="font-medium">{selectedSlot.location}</dd>
              </div>
            ) : null}
            {selectedSlot.agentName ? (
              <div>
                <dt className="text-muted-foreground">{t('summary.agent')}</dt>
                <dd className="font-medium">{selectedSlot.agentName}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted-foreground">
                {t('summary.reference')}
              </dt>
              <dd className="font-heading text-lg font-semibold">
                {reference}
              </dd>
            </div>
          </dl>

          <div className="rounded-2xl border p-4">
            <p className="mb-2 font-medium">{t('preparation.title')}</p>
            <ul className="list-disc ps-5 text-sm text-muted-foreground">
              <li>{t('preparation.id')}</li>
              <li>{t('preparation.documents')}</li>
              <li>{t('preparation.arriveEarly')}</li>
              <li>{t('preparation.cancel')}</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/appointments" />}
            >
              {t('confirmed.viewAll')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (servicesWithSlots.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground">{t('form.noSlots')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <li>{t('steps.service')}</li>
        <li aria-hidden="true">·</li>
        <li>{t('steps.slot')}</li>
        <li aria-hidden="true">·</li>
        <li>{t('steps.details')}</li>
      </ol>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="appointment-service">
                  {t('form.service')}
                </FieldLabel>
                <NativeSelect
                  id="appointment-service"
                  className="w-full"
                  value={service}
                  onChange={(event) => {
                    setService(event.target.value);
                    setValue('slotId', '');
                    clearErrors('root');
                  }}
                >
                  {servicesWithSlots.map((item) => (
                    <NativeSelectOption key={item.slug} value={item.slug}>
                      {tServices(`items.${item.slug}.name`)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>

              <Field data-invalid={errors.slotId ? true : undefined}>
                <FieldLabel>{t('form.slot')}</FieldLabel>
                <div className="flex flex-col gap-4">
                  {grouped.map((group) => (
                    <fieldset key={group.date.toDateString()}>
                      <legend className="mb-2 text-sm font-medium">
                        {format.dateTime(group.date, { dateStyle: 'full' })}
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {group.slots.map((slot) => (
                          <label
                            key={slot.id}
                            className={cn(
                              'flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors',
                              'hover:border-primary/60 hover:bg-muted',
                              'has-[:checked]:border-primary has-[:checked]:bg-muted',
                              'has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
                            )}
                          >
                            <input
                              type="radio"
                              value={slot.id}
                              className="sr-only"
                              {...register('slotId')}
                            />
                            <span className="font-medium">
                              {format.dateTime(new Date(slot.startsAt), {
                                timeStyle: 'short',
                              })}
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ))}
                </div>
                <FieldError
                  id="appointment-slot-error"
                  errors={[errors.slotId]}
                />
              </Field>

              {selectedSlot ? (
                <Alert>
                  <AlertDescription>
                    {t('summary.when')}:{' '}
                    <strong>{slotSummary(selectedSlot)}</strong>
                    {selectedSlot.location
                      ? ` · ${t('summary.location')}: ${selectedSlot.location}`
                      : ''}
                    {selectedSlot.agentName
                      ? ` · ${t('summary.agent')}: ${selectedSlot.agentName}`
                      : ''}
                  </AlertDescription>
                </Alert>
              ) : null}

              <Field data-invalid={errors.name ? true : undefined}>
                <FieldLabel htmlFor="appointment-name">
                  {t('form.name')}
                </FieldLabel>
                <Input
                  id="appointment-name"
                  type="text"
                  autoComplete="name"
                  required
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={
                    errors.name ? 'appointment-name-error' : undefined
                  }
                  {...field('name')}
                />
                <FieldError
                  id="appointment-name-error"
                  errors={[errors.name]}
                />
              </Field>

              <Field data-invalid={errors.email ? true : undefined}>
                <FieldLabel htmlFor="appointment-email">
                  {t('form.email')}
                </FieldLabel>
                <Input
                  id="appointment-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={
                    errors.email ? 'appointment-email-error' : undefined
                  }
                  {...field('email')}
                />
                <FieldError
                  id="appointment-email-error"
                  errors={[errors.email]}
                />
              </Field>

              <Field data-invalid={errors.phone ? true : undefined}>
                <FieldLabel htmlFor="appointment-phone">
                  {t('form.phone')}
                </FieldLabel>
                <Input
                  id="appointment-phone"
                  type="tel"
                  autoComplete="tel"
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={
                    errors.phone ? 'appointment-phone-error' : undefined
                  }
                  {...field('phone')}
                />
                <FieldError
                  id="appointment-phone-error"
                  errors={[errors.phone]}
                />
              </Field>

              <Field data-invalid={errors.reason ? true : undefined}>
                <FieldLabel htmlFor="appointment-reason">
                  {t('form.reason')}
                </FieldLabel>
                <Textarea
                  id="appointment-reason"
                  rows={4}
                  required
                  placeholder={t('form.reasonPlaceholder')}
                  aria-invalid={errors.reason ? true : undefined}
                  aria-describedby={
                    errors.reason ? 'appointment-reason-error' : undefined
                  }
                  {...field('reason')}
                />
                <FieldError
                  id="appointment-reason-error"
                  errors={[errors.reason]}
                />
              </Field>

              <FieldError
                id="appointment-form-error"
                errors={[errors.root?.server]}
              />

              <Field>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || !selectedSlotId}
                >
                  {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                  {t('form.submit')}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
