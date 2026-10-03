'use client';

import { useTransition, type ChangeEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

/**
 * Switches locale while keeping the current pathname. The proxy stores the
 * choice in the `NEXT_LOCALE` cookie so later visits remember it.
 */
export function LocaleSwitcher() {
  const t = useTranslations('Public.LocaleSwitcher');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <NativeSelect
      size="sm"
      aria-label={t('label')}
      value={locale}
      disabled={isPending}
      onChange={onChange}
    >
      {routing.locales.map((option) => (
        <NativeSelectOption key={option} value={option}>
          {t(option)}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}
