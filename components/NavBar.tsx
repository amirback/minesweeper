'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase';
import { RankBadge } from './RankBadge';
import { AvatarDisplay } from './Avatars';
import { sounds } from '@/lib/sounds';
import { useLang } from '@/contexts/LanguageContext';
import type { Lang } from '@/lib/i18n';
import { ProModal } from './ProModal';

const ELO_KEY    = 'minetrainer_elo';
const AVATAR_KEY = 'saper_avatar';

const SHORT: Record<string, Record<Lang, string>> = {
  '/daily':       { en: 'Daily',   ru: 'Дейли',   kz: 'Күн.' },
  '/leaderboard': { en: 'Top',     ru: 'Топ',     kz: 'Топ' },
  '/stats':       { en: 'Stats',   ru: 'Стата',   kz: 'Стат.' },
  '/profile':     { en: 'Profile', ru: 'Профиль', kz: 'Профиль' },
  '/friends':     { en: 'Friends', ru: 'Друзья',  kz: 'Достар' },
  '/settings':    { en: 'Set.',    ru: 'Настр.',  kz: 'Баптау' },
  '/ai':          { en: '✦ AI',    ru: '✦ AI',    kz: '✦ AI' },
};

const BOTTOM_LINKS = ['/daily', '/leaderboard', '/stats', '/profile', '/friends', '/ai'];

type NavBarProps = {
  user: User | null;
  onSignOut: () => void;
  onOpenAuth: () => void;
  cloudElo?: number;
};

export function NavBar({ user, onSignOut, onOpenAuth, cloudElo }: NavBarProps) {
  const { tr, lang } = useLang();
  const pathname = usePathname();
  const [elo, setElo]       = useState(1000);
  const [muted, setMuted]   = useState(false);
  const [avatarId, setAvatarId] = useState(0);
  const [proOpen, setProOpen] = useState(false);

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
    <>
      {/* ── Top navbar ── */}
      <nav style={{
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
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

        {/* Desktop links */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
          <Link href="/daily"       style={link} onMouseOver={e=>(e.currentTarget.style.color='var(--green-hi)')} onMouseOut={e=>(e.currentTarget.style.color='var(--text-2)')}>{tr.daily}</Link>
          <Link href="/leaderboard" style={link} onMouseOver={e=>(e.currentTarget.style.color='var(--green-hi)')} onMouseOut={e=>(e.currentTarget.style.color='var(--text-2)')}>{tr.leaderboard}</Link>
          <Link href="/stats"       style={link} onMouseOver={e=>(e.currentTarget.style.color='var(--green-hi)')} onMouseOut={e=>(e.currentTarget.style.color='var(--text-2)')}>{tr.stats}</Link>
          <Link href="/profile"     style={link} onMouseOver={e=>(e.currentTarget.style.color='var(--green-hi)')} onMouseOut={e=>(e.currentTarget.style.color='var(--text-2)')}>{tr.profile ?? 'Profile'}</Link>
          <Link href="/friends"     style={link} onMouseOver={e=>(e.currentTarget.style.color='var(--green-hi)')} onMouseOut={e=>(e.currentTarget.style.color='var(--text-2)')}>{tr.friends ?? 'Friends'}</Link>
          <Link href="/settings"    style={link} onMouseOver={e=>(e.currentTarget.style.color='var(--green-hi)')} onMouseOut={e=>(e.currentTarget.style.color='var(--text-2)')}>{tr.settings}</Link>
          <Link href="/ai" style={{
            background: pathname === '/ai' ? '#ef4444' : 'rgba(239,68,68,0.12)',
            color: '#ef4444', fontSize: 12, fontWeight: 800,
            padding: '4px 10px', borderRadius: 4,
            display: 'flex', alignItems: 'center', gap: 4,
            textDecoration: 'none', letterSpacing: 1,
            border: '1px solid rgba(239,68,68,0.35)',
            whiteSpace: 'nowrap',
            ...(pathname === '/ai' ? { color: '#fff' } : {}),
          }}>
            ✦ AI
          </Link>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div className="hide-mobile">
            <RankBadge elo={elo} size="sm" />
          </div>

          <button onClick={() => setProOpen(true)} style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            border: 'none', borderRadius: 4, padding: '5px 12px',
            color: '#000', fontSize: 12, fontWeight: 900,
            cursor: 'pointer', letterSpacing: 1,
            fontFamily: "'Bebas Neue', Impact, sans-serif",
            whiteSpace: 'nowrap',
          }}>
            ⚡ PRO
          </button>

          <button
            onClick={() => { const m = sounds.toggle(); setMuted(m); }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, padding: '2px 4px', opacity: muted ? 0.35 : 1 }}
            title={muted ? 'Включить звук' : 'Выключить звук'}>
            {muted ? '🔇' : '🔊'}
          </button>

          {isSupabaseConfigured && (
            user ? (
              <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <AvatarDisplay id={avatarId} size={32} />
                <span className="hide-mobile" style={{ color: 'var(--green-hi)', fontSize: 13, fontWeight: 700 }}>
                  {user.email?.split('@')[0]}
                </span>
              </Link>
            ) : (
              <button onClick={onOpenAuth}
                style={{ background: 'var(--green)', color: '#0b1a08', border: 'none', borderRadius: 4, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 800, letterSpacing: 0.5 }}>
                {tr.signIn}
              </button>
            )
          )}
        </div>
      </nav>

      {/* ── Bottom mobile nav ── */}
      <nav className="mobile-bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 54, background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        display: 'none', zIndex: 50,
      }}>
        {BOTTOM_LINKS.map(href => {
          const isActive = pathname === href;
          const label = SHORT[href][lang as Lang] ?? SHORT[href].en;
          return (
            <Link key={href} href={href} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', gap: 0,
              color: href === '/ai' ? '#ef4444' : isActive ? 'var(--green-hi)' : 'var(--text-dim)',
              borderTop: `2px solid ${href === '/ai' && isActive ? '#ef4444' : isActive ? 'var(--green-hi)' : 'transparent'}`,
              fontSize: 10, fontWeight: isActive ? 800 : 600,
              letterSpacing: 0.2, lineHeight: 1.2,
              transition: 'color 0.12s',
              paddingTop: 4,
            }}>
              {label}
            </Link>
          );
        })}
      </nav>

      <style>{`
        @media (max-width: 600px) {
          .hide-mobile { display: none !important; }
          .mobile-bottom-nav { display: flex !important; }
        }
      `}</style>

      {proOpen && <ProModal onClose={() => setProOpen(false)} />}
    </>
  );
}
