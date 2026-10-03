'use client';

import { useTranslations } from 'next-intl';
import { RiAlertLine, RiCloseLine, RiRobot2Line } from '@remixicon/react';

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useStoredIds } from '@/hooks/use-local-storage';
import { Link } from '@/i18n/navigation';
import type { BroadcastView } from '@/lib/broadcasts';

const STORAGE_KEY = 'preskenler:broadcasts-dismissed';

/**
 * Active general messages and alerts shown above the page (demandes D18, F29,
 * F30, F31). Residents can dismiss each message on their device.
 */
export function BroadcastBanner({ items }: { items: BroadcastView[] }) {
  const t = useTranslations('Public.Alerts');
  const [dismissed, setDismissed] = useStoredIds(STORAGE_KEY);

  function dismiss(id: string) {
    setDismissed([...new Set([...dismissed, id])]);
  }

  const visible = items.filter((item) => !dismissed.includes(item.id));

  if (visible.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={t('bannerLabel')}
      className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 pt-6"
    >
      {visible.map((item) => (
        <Alert
          key={item.id}
          variant={item.level === 'info' ? 'default' : 'destructive'}
        >
          <RiAlertLine aria-hidden="true" />
          <AlertTitle>
            {t(`levels.${item.level}`)} · {item.title}
          </AlertTitle>
          <AlertDescription>
            {item.area ? (
              <p className="text-xs font-medium">
                {t('area', { area: item.area })}
              </p>
            ) : null}
            <p>{item.body}</p>
            {item.recommendations.length > 0 ? (
              <>
                <p className="mt-2 font-medium">{t('recommendations')}</p>
                <ul className="list-disc ps-5">
                  {item.recommendations.map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              </>
            ) : null}
            {item.isAi ? (
              <p className="mt-2 flex items-center gap-1 text-xs">
                <RiRobot2Line aria-hidden="true" className="size-3.5" />
                {t('ai')}
              </p>
            ) : null}
            <p className="mt-2">
              <Link href="/alerts" className="underline">
                {t('viewAll')}
              </Link>
            </p>
          </AlertDescription>
          <AlertAction>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => dismiss(item.id)}
              aria-label={t('dismiss')}
            >
              <RiCloseLine aria-hidden="true" />
            </Button>
          </AlertAction>
        </Alert>
      ))}
    </section>
  );
}
