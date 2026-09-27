import type { Metadata } from 'next';
import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

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
      className={cn('h-full antialiased', 'font-sans', inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
