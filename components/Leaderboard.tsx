'use client';

import React, { useState, useEffect } from 'react';
import type { Difficulty } from '@/types/game';
import { DIFFICULTY_CONFIG } from '@/types/game';
import { getLeaderboard, isSupabaseConfigured, type LeaderboardEntry } from '@/lib/supabase';
import { formatTime } from '@/lib/minesweeper';

type LeaderboardProps = {
  isDaily?: boolean;
  dailyDate?: string;
  currentUserId?: string;
};

const MEDALS = ['🥇', '🥈', '🥉'];

export function Leaderboard({ isDaily = false, dailyDate, currentUserId }: LeaderboardProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    getLeaderboard(difficulty, isDaily, dailyDate)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [difficulty, isDaily, dailyDate]);

  if (!isSupabaseConfigured) {
    return (
      <div
        style={{
          background: '#151728',
          borderRadius: 12,
          padding: '24px',
          textAlign: 'center',
          border: '1px solid #1e2235',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <h3 style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 8 }}>Leaderboard Locked</h3>
        <p style={{ color: '#64748b', fontSize: 13 }}>
          Connect Supabase to enable global leaderboards and track your scores!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Difficulty tabs */}
      {!isDaily && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: difficulty === d ? '#4f46e5' : '#1e2235',
                color: difficulty === d ? '#fff' : '#94a3b8',
                transition: 'all 0.15s',
              }}
            >
              {DIFFICULTY_CONFIG[d].label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>Loading...</div>
      ) : entries.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 32,
            color: '#64748b',
            background: '#151728',
            borderRadius: 12,
          }}
        >
          No results yet. Be the first! 🏆
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {entries.map((entry, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: '#151728',
                borderRadius: 8,
                padding: '10px 14px',
                border: '1px solid #1e2235',
              }}
            >
              <span style={{ fontSize: 16, minWidth: 24, textAlign: 'center' }}>
                {i < 3 ? MEDALS[i] : `${i + 1}`}
              </span>
              <span style={{ flex: 1, color: '#e2e8f0', fontWeight: 600, fontSize: 14 }}>
                {entry.username}
              </span>
              <span
                style={{
                  color: '#60a5fa',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  fontSize: 15,
                }}
              >
                {formatTime(entry.time_seconds)}
              </span>
              <span style={{ color: '#475569', fontSize: 11 }}>
                {new Date(entry.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
