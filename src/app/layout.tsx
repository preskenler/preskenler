import type { Metadata } from 'next';
import '@/app/globals.css';
import { Outfit, Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { TextSizeProvider } from '@/components/accessibility/text-size-provider';
import { textSizeScript } from '@/lib/accessibility';
import { TooltipProvider } from '@/components/ui/tooltip';

const geistHeading = Geist({ subsets: ['latin'], variable: '--font-heading' });

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'PreskEnLer — Portail de la Ville de Terra Nova',
  description:
    'Accède aux services de la Ville de Terra Nova, consulte les annonces municipales et contacte l’administration.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="fr"
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
          Aller au contenu
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TextSizeProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </TextSizeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
