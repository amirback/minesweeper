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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (cloudElo !== undefined) setElo(cloudElo);
    else if (typeof window !== 'undefined')
      setElo(parseInt(localStorage.getItem(ELO_KEY) ?? '1000', 10));
  }, [cloudElo]);

  const link: React.CSSProperties = {
    color: 'var(--text-2)', fontSize: 14, fontWeight: 700,
    padding: '4px 10px', borderRadius: 4,
    display: 'flex', alignItems: 'center', gap: 5,
    textDecoration: 'none', transition: 'color 0.15s', letterSpacing: 0.5,
  };

  return (
    <nav style={{
      background: 'var(--bg-card)', borderBottom: '2px solid var(--border)',
      padding: '0 16px', height: 54,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      {/* Logo */}
      <Link href="/game" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="28" height="28" viewBox="0 0 32 32">
          <circle cx="16" cy="18" r="11" fill="#2a2a2a"/>
          <line x1="16" y1="7" x2="16" y2="11" stroke="#1e1e1e" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="16" cy="6" r="2.5" fill="#1e1e1e"/>
          <line x1="27" y1="18" x2="23" y2="18" stroke="#1e1e1e" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="28" cy="18" r="2.5" fill="#1e1e1e"/>
          <line x1="5" y1="18" x2="9" y2="18" stroke="#1e1e1e" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="4" cy="18" r="2.5" fill="#1e1e1e"/>
          <path d="M19 9 Q26 4 23 1" stroke="#8B6914" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <circle cx="23" cy="1" r="2" fill="#FF6600"/>
        </svg>
        <span style={{
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          fontWeight: 700, fontSize: 22, letterSpacing: 3,
          color: 'var(--green-hi)',
        }}>SAPER</span>
      </Link>

      {/* Desktop links */}
      <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Link href="/daily" style={link}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--text-2)')}>
          📅 Daily
        </Link>
        <Link href="/leaderboard" style={link}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--text-2)')}>
          🏆 Рейтинг
        </Link>
        <Link href="/stats" style={link}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--text-2)')}>
          📊 Стата
        </Link>

        <div style={{ marginLeft: 4 }}>
          <RankBadge elo={elo} size="sm" />
        </div>

        <button
          onClick={() => { const m = sounds.toggle(); setMuted(m); }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, padding: '2px 6px', opacity: muted ? 0.35 : 1 }}
          title={muted ? 'Включить звук' : 'Выключить звук'}
        >
          {muted ? '🔇' : '🔊'}
        </button>

        {isSupabaseConfigured && (
          user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--green-hi)', fontSize: 13, fontWeight: 700 }}>
                {user.email?.split('@')[0]}
              </span>
              <button onClick={onSignOut}
                style={{ background: 'var(--bg-card-2)', color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
                Выход
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth}
              style={{ background: 'var(--green)', color: '#0b1a08', border: 'none', borderRadius: 4, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 800, letterSpacing: 0.5 }}>
              Войти
            </button>
          )
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(o => !o)}
        style={{ display: 'none', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text)' }}
        className="mobile-menu-btn"
      >
        ☰
      </button>

      <style>{`
        @media (max-width: 600px) {
          .hide-mobile { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
