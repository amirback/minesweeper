'use client';

import React, { useEffect, useState } from 'react';
import type { Difficulty } from '@/types/game';
import { DIFFICULTY_CONFIG } from '@/types/game';
import { loadStats, type LocalStats } from '@/hooks/useGame';
import { formatTime } from '@/lib/minesweeper';
import { RankBadge } from './RankBadge';

const ELO_KEY = 'minetrainer_elo';

function getLocalElo(): number {
  if (typeof window === 'undefined') return 1000;
  return parseInt(localStorage.getItem(ELO_KEY) ?? '1000', 10);
}

export function updateLocalElo(delta: number) {
  if (typeof window === 'undefined') return;
  const current = getLocalElo();
  localStorage.setItem(ELO_KEY, String(Math.max(0, current + delta)));
}

export function StatsPanel({ cloudElo }: { cloudElo?: number }) {
  const [stats, setStats] = useState<LocalStats | null>(null);
  const [elo, setElo] = useState(1000);

  useEffect(() => {
    setStats(loadStats());
    setElo(cloudElo ?? getLocalElo());
  }, [cloudElo]);

  if (!stats) return null;

  const accuracy = stats.totalClicks > 0
    ? Math.round(((stats.totalClicks - stats.mineHits) / stats.totalClicks) * 100)
    : 100;
  const avgTime  = stats.wins > 0 ? Math.round(stats.totalTime / stats.wins) : 0;
  const winRate  = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

  const metrics = [
    { label: 'Победы',    value: `${winRate}%`,                     color: '#7fc435' },
    { label: 'Точность',  value: `${accuracy}%`,                    color: '#60d0ff' },
    { label: 'Ср. время', value: avgTime ? formatTime(avgTime) : '—', color: '#d4b040' },
    { label: 'Игр',       value: String(stats.totalGames),          color: '#c084fc' },
  ];

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: 0.5 }}>Моя статистика</h3>
        <RankBadge elo={elo} size="sm" />
      </div>

      <RankBadge elo={elo} showProgress size="md" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: m.color, fontFamily: 'monospace' }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{ color: 'var(--text-dim)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Лучшее время</p>
        {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => {
          const ds = stats.byDifficulty[d];
          const wr = ds.games > 0 ? Math.round((ds.wins / ds.games) * 100) : 0;
          return (
            <div key={d} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: 'var(--bg-card-2)', borderRadius: 5 }}>
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{DIFFICULTY_CONFIG[d].label}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{wr}%</span>
              <span style={{ color: '#60d0ff', fontWeight: 800, fontFamily: 'monospace', fontSize: 14 }}>
                {ds.bestTime ? formatTime(ds.bestTime) : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
