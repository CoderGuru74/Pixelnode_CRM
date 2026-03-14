import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { Providers } from '@/components/providers';
import { ProvidersWrapper } from '@/components/providers-wrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PixelNode - CRM',
  description: 'Professional CRM for PixelNode',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ProvidersWrapper>
            {children}
          </ProvidersWrapper>
        </Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}