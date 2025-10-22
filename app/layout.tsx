import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';  // ← ONLY ONE
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Product Dashboard',
  description: 'Real-time product management',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            {children}
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}