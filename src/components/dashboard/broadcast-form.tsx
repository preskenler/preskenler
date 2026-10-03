'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { RiAddLine } from '@remixicon/react';

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
  FieldDescription,
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
import {
  broadcastAudiences,
  broadcastLevels,
  broadcastTopics,
  type BroadcastFormState,
} from '@/lib/broadcasts';

const initialState: BroadcastFormState = { status: 'idle' };

export function BroadcastForm({
  action,
}: {
  action: (
    state: BroadcastFormState,
    formData: FormData,
  ) => Promise<BroadcastFormState>;
}) {
  const t = useTranslations('Dashboard.broadcasts');
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('form.title')}</CardTitle>
        <CardDescription>{t('form.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="broadcast-title">
                {t('form.titleLabel')}
              </FieldLabel>
              <Input
                id="broadcast-title"
                name="title"
                required
                maxLength={160}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="broadcast-body">
                {t('form.bodyLabel')}
              </FieldLabel>
              <Textarea id="broadcast-body" name="body" required rows={4} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field>
                <FieldLabel htmlFor="broadcast-level">
                  {t('form.levelLabel')}
                </FieldLabel>
                <NativeSelect
                  id="broadcast-level"
                  name="level"
                  defaultValue="info"
                >
                  {broadcastLevels.map((level) => (
                    <NativeSelectOption key={level} value={level}>
                      {t(`levels.${level}`)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>

              <Field>
                <FieldLabel htmlFor="broadcast-topic">
                  {t('form.topicLabel')}
                </FieldLabel>
                <NativeSelect
                  id="broadcast-topic"
                  name="topic"
                  defaultValue="general"
                >
                  {broadcastTopics.map((topic) => (
                    <NativeSelectOption key={topic} value={topic}>
                      {t(`topics.${topic}`)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>

              <Field>
                <FieldLabel htmlFor="broadcast-audience">
                  {t('form.audienceLabel')}
                </FieldLabel>
                <NativeSelect
                  id="broadcast-audience"
                  name="audience"
                  defaultValue="all"
                >
                  {broadcastAudiences.map((audience) => (
                    <NativeSelectOption key={audience} value={audience}>
                      {t(`audiences.${audience}`)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="broadcast-area">
                  {t('form.areaLabel')}
                </FieldLabel>
                <Input id="broadcast-area" name="area" maxLength={120} />
              </Field>

              <Field>
                <FieldLabel htmlFor="broadcast-expires">
                  {t('form.expiresLabel')}
                </FieldLabel>
                <Input
                  id="broadcast-expires"
                  name="expiresAt"
                  type="datetime-local"
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="broadcast-recommendations">
                {t('form.recommendationsLabel')}
              </FieldLabel>
              <Textarea
                id="broadcast-recommendations"
                name="recommendations"
                rows={3}
              />
              <FieldDescription>
                {t('form.recommendationsHelp')}
              </FieldDescription>
            </Field>

            {state.status === 'error' && state.error ? (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            ) : null}
            {state.status === 'success' ? (
              <Alert role="status">
                <AlertDescription>{t('form.success')}</AlertDescription>
              </Alert>
            ) : null}

            <Field>
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <RiAddLine data-icon="inline-start" aria-hidden="true" />
                )}
                {t('form.submit')}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
