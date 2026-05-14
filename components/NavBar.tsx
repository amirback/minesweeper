'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase';
import { RankBadge } from './RankBadge';
import { AvatarDisplay } from './Avatars';
import { sounds } from '@/lib/sounds';
import { useLang } from '@/contexts/LanguageContext';

const ELO_KEY    = 'minetrainer_elo';
const AVATAR_KEY = 'saper_avatar';

type NavBarProps = {
  user: User | null;
  onSignOut: () => void;
  onOpenAuth: () => void;
  cloudElo?: number;
};

export function NavBar({ user, onSignOut, onOpenAuth, cloudElo }: NavBarProps) {
  const { tr } = useLang();
  const [elo, setElo]       = useState(1000);
  const [muted, setMuted]   = useState(false);
  const [avatarId, setAvatarId] = useState(0);

  useEffect(() => {
    if (cloudElo !== undefined) setElo(cloudElo);
    else if (typeof window !== 'undefined')
      setElo(parseInt(localStorage.getItem(ELO_KEY) ?? '1000', 10));
    if (typeof window !== 'undefined')
      setAvatarId(parseInt(localStorage.getItem(AVATAR_KEY) ?? '0', 10));
  }, [cloudElo]);

  const link: React.CSSProperties = {
    color: 'var(--text-2)', fontSize: 14, fontWeight: 700,
    padding: '4px 10px', borderRadius: 4,
    display: 'flex', alignItems: 'center', gap: 5,
    textDecoration: 'none', transition: 'color 0.15s', letterSpacing: 0.5,
    whiteSpace: 'nowrap',
  };

  return (
    <nav style={{
      background: 'var(--bg-card)', borderBottom: '2px solid var(--border)',
      padding: '0 16px', height: 54,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 40, gap: 8,
    }}>
      {/* Logo */}
      <Link href="/game" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <svg width="26" height="26" viewBox="0 0 32 32">
          <circle cx="16" cy="18" r="10" fill="#2a2a2a"/>
          <line x1="16" y1="8"  x2="16" y2="12" stroke="#1e1e1e" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="16" cy="6.5" r="2.2" fill="#1e1e1e"/>
          <line x1="27" y1="18" x2="23" y2="18" stroke="#1e1e1e" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="28.5" cy="18" r="2.2" fill="#1e1e1e"/>
          <line x1="5" y1="18"  x2="9"  y2="18" stroke="#1e1e1e" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="3.5" cy="18" r="2.2" fill="#1e1e1e"/>
          <path d="M19 9 Q26 4 23 1" stroke="#8B6914" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <circle cx="23" cy="1" r="2" fill="#FF6600"/>
        </svg>
        <span style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: 3, color: 'var(--green-hi)' }}>
          SAPER
        </span>
      </Link>

      {/* Links */}
      <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
        <Link href="/daily"       style={link} onMouseOver={e=>(e.currentTarget.style.color='var(--green-hi)')} onMouseOut={e=>(e.currentTarget.style.color='var(--text-2)')}>{tr.daily}</Link>
        <Link href="/leaderboard" style={link} onMouseOver={e=>(e.currentTarget.style.color='var(--green-hi)')} onMouseOut={e=>(e.currentTarget.style.color='var(--text-2)')}>{tr.leaderboard}</Link>
        <Link href="/stats"       style={link} onMouseOver={e=>(e.currentTarget.style.color='var(--green-hi)')} onMouseOut={e=>(e.currentTarget.style.color='var(--text-2)')}>{tr.stats}</Link>
        <Link href="/profile"     style={link} onMouseOver={e=>(e.currentTarget.style.color='var(--green-hi)')} onMouseOut={e=>(e.currentTarget.style.color='var(--text-2)')}>👤 {tr.profile ?? 'Profile'}</Link>
        <Link href="/friends"     style={link} onMouseOver={e=>(e.currentTarget.style.color='var(--green-hi)')} onMouseOut={e=>(e.currentTarget.style.color='var(--text-2)')}>👥 {tr.friends ?? 'Friends'}</Link>
        <Link href="/settings"    style={link} onMouseOver={e=>(e.currentTarget.style.color='var(--green-hi)')} onMouseOut={e=>(e.currentTarget.style.color='var(--text-2)')}>⚙️ {tr.settings}</Link>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div className="hide-mobile">
          <RankBadge elo={elo} size="sm" />
        </div>

        <button
          onClick={() => { const m = sounds.toggle(); setMuted(m); }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, padding: '2px 4px', opacity: muted ? 0.35 : 1 }}
          title={muted ? 'Включить звук' : 'Выключить звук'}>
          {muted ? '🔇' : '🔊'}
        </button>

        {isSupabaseConfigured && (
          user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <AvatarDisplay id={avatarId} size={32} />
                <span className="hide-mobile" style={{ color: 'var(--green-hi)', fontSize: 13, fontWeight: 700 }}>
                  {user.email?.split('@')[0]}
                </span>
              </Link>
              <button onClick={onSignOut}
                style={{ background: 'var(--bg-card-2)', color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
                {tr.signOut}
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth}
              style={{ background: 'var(--green)', color: '#0b1a08', border: 'none', borderRadius: 4, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 800, letterSpacing: 0.5 }}>
              {tr.signIn}
            </button>
          )
        )}

        {/* Mobile: settings icon */}
        <Link href="/settings" className="mobile-only" style={{ color: 'var(--text-2)', textDecoration: 'none', fontSize: 18 }}>
          ⚙️
        </Link>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .hide-mobile { display: none !important; }
          .mobile-only { display: inline-flex !important; }
        }
        .mobile-only { display: none; }
      `}</style>
    </nav>
  );
}
