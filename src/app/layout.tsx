import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { DataProvider } from '@/context/data-context';

export const metadata: Metadata = {
  title: 'Credit Clarity',
  description: 'Sua clareza financeira começa aqui.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <DataProvider>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col w-full">
                <AppHeader />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </DataProvider>
      </body>
    </html>
  );
}
