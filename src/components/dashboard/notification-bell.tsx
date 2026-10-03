'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { RiBellLine } from '@remixicon/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useStoredIds } from '@/hooks/use-local-storage';
import { Link } from '@/i18n/navigation';
import type { BroadcastLevel } from '@/lib/broadcasts';

export type BroadcastNotification = {
  id: string;
  level: BroadcastLevel;
  title: string;
};

const STORAGE_KEY = 'preskenler:broadcasts-read';

/**
 * In-app notification bell (demande F30): counts active alerts and important
 * messages that the resident has not opened yet, tracked per device.
 */
export function NotificationBell({
  items,
}: {
  items: BroadcastNotification[];
}) {
  const t = useTranslations('Dashboard.notifications');
  const [read, setRead] = useStoredIds(STORAGE_KEY);
  const [open, setOpen] = useState(false);

  const unread = items.filter((item) => !read.includes(item.id));

  function markAllRead() {
    setRead([...new Set([...read, ...items.map((item) => item.id)])]);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={t('label', { count: unread.length })}
            className="relative"
          />
        }
      >
        <RiBellLine aria-hidden="true" />
        {unread.length > 0 ? (
          <Badge
            variant="destructive"
            className="absolute -end-1 -top-1 h-4 min-w-4 justify-center px-1 text-[10px]"
          >
            {unread.length}
          </Badge>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <PopoverHeader>
          <PopoverTitle>{t('title')}</PopoverTitle>
          <PopoverDescription>
            {items.length === 0
              ? t('empty')
              : t('unread', { count: unread.length })}
          </PopoverDescription>
        </PopoverHeader>

        {items.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href="/alerts"
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-2 rounded-md p-2 hover:bg-muted"
                >
                  <span
                    aria-hidden="true"
                    className={
                      item.level === 'info'
                        ? 'mt-1.5 size-2 shrink-0 rounded-full bg-muted-foreground'
                        : 'mt-1.5 size-2 shrink-0 rounded-full bg-destructive'
                    }
                  />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {t(`levels.${item.level}`)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {items.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={markAllRead}
            disabled={unread.length === 0}
          >
            {t('markAll')}
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
