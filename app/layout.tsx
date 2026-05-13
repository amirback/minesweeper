import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MineTrainer — Minesweeper with AI Probability Coach',
  description:
    'Play Minesweeper with an AI coach that shows real-time mine probabilities. Train your probabilistic thinking. Daily challenges, global leaderboard.',
  openGraph: {
    title: 'MineTrainer',
    description: 'Minesweeper with AI probability hints. Play smarter, not harder.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0a0b14',
          color: '#e2e8f0',
        }}
      >
        {children}
      </body>
    </html>
  );
}
