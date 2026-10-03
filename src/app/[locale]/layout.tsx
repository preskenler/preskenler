import type { Metadata } from 'next';
import '@/app/globals.css';
import { Outfit, Geist } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { TextSizeProvider } from '@/components/accessibility/text-size-provider';
import { textSizeScript } from '@/lib/accessibility';
import { TooltipProvider } from '@/components/ui/tooltip';
import { routing } from '@/i18n/routing';

const geistHeading = Geist({ subsets: ['latin'], variable: '--font-heading' });

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations('Accessibility');

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        'h-full antialiased',
        'font-sans',
        outfit.variable,
        geistHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        {/* Applies the stored text size before first paint (demande F24). */}
        <script dangerouslySetInnerHTML={{ __html: textSizeScript }} />
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
        >
          {t('skipToContent')}
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TextSizeProvider>
            <NextIntlClientProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </NextIntlClientProvider>
          </TextSizeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
