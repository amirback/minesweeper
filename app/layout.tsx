import type { Metadata } from 'next';
import './globals.css';

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
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
        {children}
      </body>
    </html>
  );
}
