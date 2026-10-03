import type { Metadata } from 'next';
import '@/app/globals.css';
import { Outfit, Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

const geistHeading = Geist({ subsets: ['latin'], variable: '--font-heading' });

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' });

// TODO(copy): replace with the real product name and description at launch.
export const metadata: Metadata = {
  title: 'PreskEnLer — bientôt disponible',
  description:
    'PreskEnLer arrive bientôt. Laisse ton email pour être prévenu·e du lancement.',
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
