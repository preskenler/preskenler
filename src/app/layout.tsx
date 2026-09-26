import type { Metadata } from 'next';
import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'PreskEnLer',
  description: 'PreskEnLer',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={cn('h-full antialiased', 'font-sans', inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
