'use client';

import { useTranslations } from 'next-intl';
import { RiAlertLine, RiCloseLine } from '@remixicon/react';

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStoredIds } from '@/hooks/use-local-storage';
import { Link } from '@/i18n/navigation';
import type { BroadcastLevel, BroadcastView } from '@/lib/broadcasts';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'preskenler:broadcasts-dismissed';

function badgeVariant(level: BroadcastLevel) {
  if (level === 'alert') return 'destructive' as const;
  if (level === 'warning') return 'secondary' as const;
  return 'outline' as const;
}

/**
 * Active messages and alerts shown as a news ticker at the bottom of the page
 * (demandes D18, F29, F30, F31). Residents can dismiss it on their device.
 */
export function BroadcastBanner({ items }: { items: BroadcastView[] }) {
  const t = useTranslations('Public.Alerts');
  const [dismissed, setDismissed] = useStoredIds(STORAGE_KEY);
  const visible = items.filter((item) => !dismissed.includes(item.id));

  if (visible.length === 0) {
    return null;
  }

  const hasUrgentItem = visible.some((item) => item.level !== 'info');

  function dismissBanner() {
    setDismissed([
      ...new Set([...dismissed, ...visible.map((item) => item.id)]),
    ]);
  }

  return (
    <section
      aria-label={t('bannerLabel')}
      className="w-full px-3 pb-6 sm:px-6 lg:px-8"
    >
      <Alert variant={hasUrgentItem ? 'destructive' : 'default'}>
        <RiAlertLine aria-hidden="true" />
        <AlertTitle className="sr-only">{t('bannerLabel')}</AlertTitle>
        <AlertDescription className="min-w-0 overflow-hidden">
          <div className="group/ticker overflow-hidden">
            <div className="animate-broadcast-ticker flex w-max items-center group-hover/ticker:[animation-play-state:paused] group-focus-within/ticker:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:animate-none">
              {[false, true].map((duplicate) => (
                <span
                  key={duplicate ? 'duplicate' : 'original'}
                  aria-hidden={duplicate || undefined}
                  className={cn(
                    'flex shrink-0 items-center gap-8 pe-8',
                    duplicate
                      ? 'motion-reduce:hidden'
                      : 'motion-reduce:flex-col motion-reduce:items-start motion-reduce:gap-3 motion-reduce:pe-0',
                  )}
                >
                  {visible.map((item) => (
                    <Link
                      key={item.id}
                      href="/alerts"
                      tabIndex={duplicate ? -1 : undefined}
                      className="flex shrink-0 items-center gap-2 whitespace-nowrap underline-offset-4 hover:underline focus-visible:underline motion-reduce:flex-wrap motion-reduce:whitespace-normal"
                    >
                      <Badge variant={badgeVariant(item.level)}>
                        {t(`levels.${item.level}`)}
                      </Badge>
                      <strong className="text-foreground">{item.title}</strong>
                      <span>— {item.body}</span>
                      {item.area ? (
                        <span>· {t('area', { area: item.area })}</span>
                      ) : null}
                    </Link>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </AlertDescription>
        <AlertAction>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={dismissBanner}
            aria-label={t('dismissBanner')}
          >
            <RiCloseLine aria-hidden="true" />
          </Button>
        </AlertAction>
      </Alert>
    </section>
  );
}
