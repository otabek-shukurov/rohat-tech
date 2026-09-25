import type { Metadata } from 'next';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: {
    default: 'Rohat Tech — maishiy texnika',
    template: '%s | Rohat Tech'
  },
  description: 'Uy uchun ishonchli maishiy texnikani qulay tanlang va buyurtma bering.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <SiteHeader />
        <main className="min-h-[60vh] pb-16 md:pb-0">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
