import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';

export const metadata: Metadata = {
  title: 'Saper — Classic Puzzle',
  description: 'Классический сапёр с AI-подсказками, рейтингом и ежедневными испытаниями.',
  openGraph: {
    title: 'Saper',
    description: 'Сапёр нового поколения. AI-вероятности, ELO, daily-челлендж.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--text)' }}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
