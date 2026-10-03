import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import fr from '../../messages/fr.json';

function IntlProvider({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="fr" messages={fr}>
      {children}
    </NextIntlClientProvider>
  );
}

/**
 * Render a component with the French messages, mirroring the provider mounted
 * by the locale layout. Use this for any component that calls `useTranslations`.
 */
export function renderWithIntl(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: IntlProvider, ...options });
}

export * from '@testing-library/react';
