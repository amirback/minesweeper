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

type StatsPanelProps = {
  cloudElo?: number;
};

export function StatsPanel({ cloudElo }: StatsPanelProps) {
  const [stats, setStats] = useState<LocalStats | null>(null);
  const [elo, setElo] = useState(1000);

  useEffect(() => {
    setStats(loadStats());
    setElo(cloudElo ?? getLocalElo());
  }, [cloudElo]);

  if (!stats) return null;

  const accuracy =
    stats.totalClicks > 0
      ? Math.round(((stats.totalClicks - stats.mineHits) / stats.totalClicks) * 100)
      : 100;

  const avgTime =
    stats.wins > 0 ? Math.round(stats.totalTime / stats.wins) : 0;

  const winRate =
    stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

  return (
    <div
      style={{
        background: '#151728',
        border: '1px solid #1e2235',
        borderRadius: 12,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15 }}>Your Stats</h3>
        <RankBadge elo={elo} size="sm" />
      </div>

      <RankBadge elo={elo} showProgress size="md" />

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'Win Rate',  value: `${winRate}%`,          icon: '🏆', color: '#4ade80' },
          { label: 'Accuracy',  value: `${accuracy}%`,         icon: '🎯', color: '#60a5fa' },
          { label: 'Avg Time',  value: avgTime ? formatTime(avgTime) : '—', icon: '⏱️', color: '#fbbf24' },
          { label: 'Games',     value: String(stats.totalGames), icon: '🎮', color: '#c084fc' },
        ].map(m => (
          <div
            key={m.label}
            style={{
              background: '#0d0f1a',
              borderRadius: 8,
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <span style={{ fontSize: 11, color: '#475569', display: 'flex', gap: 4 }}>
              {m.icon} {m.label}
            </span>
            <span style={{ fontSize: 20, fontWeight: 800, color: m.color, fontFamily: 'monospace' }}>
              {m.value}
            </span>
          </div>
        ))}
      </div>

      {/* By difficulty */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{ color: '#475569', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
          Best Times
        </p>
        {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => {
          const ds = stats.byDifficulty[d];
          const dr = ds.wins > 0 ? Math.round((ds.wins / ds.games) * 100) : 0;
          return (
            <div
              key={d}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                background: '#0d0f1a',
                borderRadius: 6,
              }}
            >
              <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>
                {DIFFICULTY_CONFIG[d].label}
              </span>
              <span style={{ color: '#64748b', fontSize: 12 }}>{dr}% wr</span>
              <span style={{ color: '#60a5fa', fontWeight: 700, fontFamily: 'monospace', fontSize: 14 }}>
                {ds.bestTime ? formatTime(ds.bestTime) : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
