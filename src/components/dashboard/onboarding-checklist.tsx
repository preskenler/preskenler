'use client';

import { useTranslations } from 'next-intl';
import {
  RiCheckboxCircleLine,
  RiCircleLine,
  RiCloseLine,
} from '@remixicon/react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useStoredFlag } from '@/hooks/use-local-storage';
import { Link } from '@/i18n/navigation';

/** Remembers, on this device, that the new-citizen guide was dismissed (F35). */
const STORAGE_KEY = 'preskenler:onboarding-dismissed';

export type OnboardingProgress = {
  /** The address was verified. */
  emailVerified: boolean;
  /** The citizen already contacted a service at least once. */
  hasMessages: boolean;
};

/**
 * Short, dismissible checklist shown once on a citizen's dashboard so the first
 * actions (profile, service, first démarche) are obvious without a long guide.
 */
export function OnboardingChecklist({
  emailVerified,
  hasMessages,
}: OnboardingProgress) {
  const t = useTranslations('Dashboard.onboarding');
  const [dismissed, setDismissed] = useStoredFlag(STORAGE_KEY);

  if (dismissed) {
    return null;
  }

  const steps = [
    { key: 'profile', href: '/dashboard/account', done: emailVerified },
    { key: 'service', href: '/services', done: false },
    { key: 'ask', href: '/contact', done: hasMessages },
  ] as const;
  const done = steps.filter((step) => step.done).length;

  function dismiss() {
    setDismissed(true);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={dismiss}
            aria-label={t('dismiss')}
          >
            <RiCloseLine aria-hidden="true" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground" role="status">
          {t('progress', { done, total: steps.length })}
        </p>
        <ol className="flex flex-col gap-2">
          {steps.map((step) => {
            const Icon = step.done ? RiCheckboxCircleLine : RiCircleLine;

            return (
              <li key={step.key} className="flex items-start gap-3">
                <Icon
                  className={
                    step.done
                      ? 'mt-0.5 size-5 shrink-0 text-primary'
                      : 'mt-0.5 size-5 shrink-0 text-muted-foreground'
                  }
                  aria-hidden="true"
                />
                <div className="flex flex-col">
                  <Link
                    href={step.href}
                    className="text-sm font-medium hover:underline"
                  >
                    {t(`steps.${step.key}.title`)}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {step.done ? t('done') : t(`steps.${step.key}.description`)}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
        <div>
          <Button type="button" variant="outline" size="sm" onClick={dismiss}>
            {t('dismiss')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
