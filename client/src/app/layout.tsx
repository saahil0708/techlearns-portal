import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const gtFlexa = localFont({
  src: '../../public/fonts/GT Flexa Lt.woff2',
  variable: '--font-gt-flexa',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TechLearns',
  description: 'TechLearns Frontend',
};

import StoreProvider from '@/store/StoreProvider';
import MuiThemeProvider from '@/theme/MuiThemeProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${gtFlexa.variable} ${jetbrainsMono.variable} ${gtFlexa.className}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <StoreProvider>
          <MuiThemeProvider>{children}</MuiThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

