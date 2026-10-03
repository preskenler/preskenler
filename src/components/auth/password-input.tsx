'use client';

import { useState, type ComponentProps } from 'react';
import { useTranslations } from 'next-intl';
import { RiEyeLine, RiEyeOffLine } from '@remixicon/react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';

/**
 * Password field with a show/hide toggle.
 *
 * Every input prop (including react-hook-form's `ref`) is forwarded to
 * `InputGroupInput`, and the label stays linked through `id`.
 */
export function PasswordInput({
  ...props
}: ComponentProps<typeof InputGroupInput>) {
  const t = useTranslations('Accessibility');
  const [visible, setVisible] = useState(false);

  return (
    <InputGroup>
      <InputGroupInput type={visible ? 'text' : 'password'} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          aria-label={visible ? t('hidePassword') : t('showPassword')}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? (
            <RiEyeOffLine aria-hidden="true" />
          ) : (
            <RiEyeLine aria-hidden="true" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
