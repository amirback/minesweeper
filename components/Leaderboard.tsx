'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Difficulty } from '@/types/game';
import { DIFFICULTY_CONFIG } from '@/types/game';
import { getLeaderboard, getCountryLeaderboard, isSupabaseConfigured, type LeaderboardEntry } from '@/lib/supabase';
import { formatTime } from '@/lib/minesweeper';
import { getRank } from '@/lib/elo';

const MEDALS = ['🥇', '🥈', '🥉'];

const COUNTRIES = [
  'All', 'Kazakhstan', 'Russia', 'USA', 'Germany', 'UK', 'France',
  'Ukraine', 'Turkey', 'Japan', 'Korea', 'China', 'India', 'Brazil', 'Canada', 'Australia', 'Other',
];

const COUNTRY_FLAGS: Record<string, string> = {
  Kazakhstan: '🇰🇿', Russia: '🇷🇺', USA: '🇺🇸', Germany: '🇩🇪',
  UK: '🇬🇧', France: '🇫🇷', Ukraine: '🇺🇦', Turkey: '🇹🇷',
  Japan: '🇯🇵', Korea: '🇰🇷', China: '🇨🇳', India: '🇮🇳',
  Brazil: '🇧🇷', Canada: '🇨🇦', Australia: '🇦🇺', Other: '🌍',
};

type Tab = 'global' | 'country';

type LeaderboardProps = {
  isDaily?: boolean;
  dailyDate?: string;
  currentUserId?: string;
};

export function Leaderboard({ isDaily = false, dailyDate, currentUserId }: LeaderboardProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [countryStats, setCountryStats] = useState<{ country: string; total_wins: number; avg_time: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('global');
  const [filterCountry, setFilterCountry] = useState('All');

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (tab === 'country') {
      setLoading(true);
      getCountryLeaderboard().then(setCountryStats).finally(() => setLoading(false));
      return;
    }
    setLoading(true);
    getLeaderboard(difficulty, isDaily, dailyDate, filterCountry === 'All' ? undefined : filterCountry)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [difficulty, isDaily, dailyDate, tab, filterCountry]);

  if (!isSupabaseConfigured) {
    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 24, textAlign: 'center', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <h3 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: 8 }}>Leaderboard Locked</h3>
        <p style={{ color: 'var(--text-2)', fontSize: 13 }}>Connect Supabase to enable global leaderboards!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Tab selector */}
      <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 8, padding: 3, gap: 2 }}>
        {(['global', 'country'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '6px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700,
              background: tab === t ? 'var(--green)' : 'transparent',
              color: tab === t ? '#060c04' : 'var(--text-2)',
              transition: 'all 0.15s',
            }}
          >
            {t === 'global' ? '🌍 Global' : '🗺️ By Country'}
          </button>
        ))}
      </div>

      {tab === 'global' && (
        <>
          {!isDaily && (
            <div style={{ display: 'flex', gap: 4 }}>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: '1px solid var(--border)', cursor: 'pointer',
                    background: difficulty === d ? 'var(--green)' : 'transparent', color: difficulty === d ? '#060c04' : 'var(--text-2)', transition: 'all 0.15s' }}>
                  {DIFFICULTY_CONFIG[d].label}
                </button>
              ))}
            </div>
          )}

          {/* Country filter */}
          <select
            value={filterCountry}
            onChange={e => setFilterCountry(e.target.value)}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)',
              borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer',
            }}
          >
            {COUNTRIES.map(c => (
              <option key={c} value={c}>{c === 'All' ? '🌍 All Countries' : `${COUNTRY_FLAGS[c] ?? '🌍'} ${c}`}</option>
            ))}
          </select>
        </>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-dim)' }}>Loading...</div>
      ) : tab === 'country' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {countryStats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-dim)' }}>No country data yet.</div>
          ) : countryStats.map((cs, i) => (
            <div key={cs.country} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 16, minWidth: 24, textAlign: 'center' }}>{i < 3 ? MEDALS[i] : `${i + 1}`}</span>
              <span style={{ fontSize: 18 }}>{COUNTRY_FLAGS[cs.country] ?? '🌍'}</span>
              <span style={{ flex: 1, color: 'var(--text)', fontWeight: 600, fontSize: 14 }}>{cs.country}</span>
              <span style={{ color: 'var(--green-hi)', fontSize: 12, fontWeight: 600 }}>{cs.total_wins} wins</span>
              <span style={{ color: 'var(--green-hi)', fontFamily: 'monospace', fontSize: 13, fontWeight: 700 }}>{formatTime(Math.round(cs.avg_time))} avg</span>
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-dim)', background: 'var(--bg-card)', borderRadius: 12 }}>
          No results yet. Be the first! 🏆
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {entries.map((entry, i) => {
            const rank = entry.elo ? getRank(entry.elo) : null;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-card)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 16, minWidth: 24, textAlign: 'center' }}>{i < 3 ? MEDALS[i] : `${i + 1}`}</span>
                {entry.country && <span style={{ fontSize: 15 }}>{COUNTRY_FLAGS[entry.country] ?? '🌍'}</span>}
                {entry.user_id ? (
                  <Link href={`/player/${entry.user_id}`} style={{ flex: 1, color: 'var(--green-hi)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}
                    onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}>
                    {entry.username}
                  </Link>
                ) : (
                  <span style={{ flex: 1, color: 'var(--text)', fontWeight: 600, fontSize: 14 }}>{entry.username}</span>
                )}
                {rank && <span style={{ fontSize: 13 }} title={rank.name}>{rank.icon}</span>}
                <span style={{ color: 'var(--green-hi)', fontWeight: 700, fontFamily: 'monospace', fontSize: 15 }}>{formatTime(entry.time_seconds)}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>{new Date(entry.created_at).toLocaleDateString()}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
