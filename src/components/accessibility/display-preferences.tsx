'use client';

import { RiContrastLine } from '@remixicon/react';
import { useTheme } from 'next-themes';

import { textSizeLabels, textSizes, type TextSize } from '@/lib/accessibility';
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

const themes = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'system', label: 'Système' },
] as const;

export function DisplayPreferences() {
  const { theme, setTheme } = useTheme();
  const { textSize, setTextSize } = useTextSize();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="icon" className="relative" />}
      >
        <RiContrastLine aria-hidden="true" />
        <span className="sr-only">Préférences d’affichage</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuRadioGroup
          value={theme ?? 'system'}
          onValueChange={(value) => setTheme(String(value))}
        >
          <DropdownMenuLabel>Thème</DropdownMenuLabel>
          {themes.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup
          value={textSize}
          onValueChange={(value) => setTextSize(value as TextSize)}
        >
          <DropdownMenuLabel>Taille du texte</DropdownMenuLabel>
          {textSizes.map((size) => (
            <DropdownMenuRadioItem key={size} value={size}>
              {textSizeLabels[size]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
