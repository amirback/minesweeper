'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase';
import { RankBadge } from './RankBadge';
import { sounds } from '@/lib/sounds';

const ELO_KEY = 'minetrainer_elo';

type NavBarProps = {
  user: User | null;
  onSignOut: () => void;
  onOpenAuth: () => void;
  cloudElo?: number;
};

export function NavBar({ user, onSignOut, onOpenAuth, cloudElo }: NavBarProps) {
  const [elo, setElo] = useState(1000);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (cloudElo !== undefined) {
      setElo(cloudElo);
    } else if (typeof window !== 'undefined') {
      setElo(parseInt(localStorage.getItem(ELO_KEY) ?? '1000', 10));
    }
  }, [cloudElo]);

  const navLinkStyle: React.CSSProperties = {
    color: '#94a3b8', fontSize: 13, fontWeight: 600,
    padding: '4px 10px', borderRadius: 6,
    display: 'flex', alignItems: 'center', gap: 4,
    textDecoration: 'none', transition: 'color 0.15s',
  };

  return (
    <nav style={{
      background: '#0d0f1c', borderBottom: '1px solid #1e2235',
      padding: '0 16px', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 22 }}>💣</span>
        <span style={{
          fontWeight: 800, fontSize: 16,
          background: 'linear-gradient(90deg, #818cf8, #c084fc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px',
        }}>MineTrainer</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Link href="/daily" style={navLinkStyle}
          onMouseOver={e => (e.currentTarget.style.color = '#fff')}
          onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}>
          📅 Daily
        </Link>
        <Link href="/leaderboard" style={navLinkStyle}
          onMouseOver={e => (e.currentTarget.style.color = '#fff')}
          onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}>
          🏆 Board
        </Link>
        <Link href="/stats" style={navLinkStyle}
          onMouseOver={e => (e.currentTarget.style.color = '#fff')}
          onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}>
          📊 Stats
        </Link>

        {/* Rank badge */}
        <div style={{ marginLeft: 4 }}>
          <RankBadge elo={elo} size="sm" />
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => { const m = sounds.toggle(); setMuted(m); }}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 16, padding: '2px 4px', opacity: muted ? 0.4 : 1,
          }}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? '🔇' : '🔊'}
        </button>

        {isSupabaseConfigured && (
          user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#60a5fa', fontSize: 12, fontWeight: 600 }}>
                {user.email?.split('@')[0]}
              </span>
              <button onClick={onSignOut}
                style={{ background: '#1e2235', color: '#94a3b8', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                Out
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth}
              style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>
              Sign in
            </button>
          )
        )}
      </div>
    </nav>
  );
}
