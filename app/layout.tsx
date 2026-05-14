import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { TwemojiLoader } from '@/components/TwemojiLoader';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'Saper — Classic Puzzle',
  description: 'Классический сапёр с ELO-рейтингом, ежедневными испытаниями и таблицей лидеров.',
  openGraph: {
    title: 'Saper',
    description: 'Классический сапёр — ELO, daily-челлендж, глобальный рейтинг.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--text)' }}>
        <LanguageProvider>
          {children}
          <TwemojiLoader />
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
