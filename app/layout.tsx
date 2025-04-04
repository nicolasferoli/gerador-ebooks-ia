import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { ThemeProvider } from './components/ThemeProvider';
import { ToastProvider } from './components/ui/toast';
import { TanstackQueryProvider } from './providers/query-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gerador de E-books com IA',
  description: 'Crie e-books profissionais com a ajuda de inteligência artificial',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/css/styles.css" />
      </head>
      <body className={inter.className} style={{
        backgroundColor: '#ffffff',
        color: '#111827'
      }}>
        <TanstackQueryProvider>
          <ThemeProvider>
            <ToastProvider>
              <div style={{ 
                backgroundColor: '#ffffff', 
                minHeight: '100vh'
              }}>
                {children}
              </div>
            </ToastProvider>
          </ThemeProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
} 