import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/components/providers/QueryProvider';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CivicConnect',
  description: 'Report and track local infrastructure issues.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground flex flex-col min-h-screen`}>
        <QueryProvider>
          <div className="flex flex-col flex-grow max-w-2xl w-full mx-auto bg-card shadow-lg">
            <Header />
            <main className="flex-grow overflow-y-auto p-4 pb-20"> {/* Add padding-bottom for BottomNav */}
              {children}
            </main>
            <BottomNav />
          </div>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
