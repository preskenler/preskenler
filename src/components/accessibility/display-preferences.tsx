'use client';

import { RiContrastLine } from '@remixicon/react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';

import { textSizes, type TextSize } from '@/lib/accessibility';
import { useTextSize } from '@/components/accessibility/text-size-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const themeOptions = ['light', 'dark', 'system'] as const;

export function DisplayPreferences() {
  const t = useTranslations('Accessibility');
  const { theme, setTheme } = useTheme();
  const { textSize, setTextSize } = useTextSize();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="icon" className="relative" />}
      >
        <RiContrastLine aria-hidden="true" />
        <span className="sr-only">{t('displayPreferences')}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuRadioGroup
          value={theme ?? 'system'}
          onValueChange={(value) => setTheme(String(value))}
        >
          <DropdownMenuLabel>{t('theme.label')}</DropdownMenuLabel>
          {themeOptions.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {t(`theme.${option}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup
          value={textSize}
          onValueChange={(value) => setTextSize(value as TextSize)}
        >
          <DropdownMenuLabel>{t('textSize.label')}</DropdownMenuLabel>
          {textSizes.map((size) => (
            <DropdownMenuRadioItem key={size} value={size}>
              {t(`textSize.${size}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
