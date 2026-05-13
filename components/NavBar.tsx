'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase';

type NavBarProps = {
  user: User | null;
  onSignOut: () => void;
  onOpenAuth: () => void;
};

export function NavBar({ user, onSignOut, onOpenAuth }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      style={{
        background: '#0d0f1c',
        borderBottom: '1px solid #1e2235',
        padding: '0 16px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 22 }}>💣</span>
        <span
          style={{
            fontWeight: 800,
            fontSize: 16,
            background: 'linear-gradient(90deg, #818cf8, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}
        >
          MineTrainer
        </span>
      </Link>

      {/* Desktop nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Link href="/daily" style={{ textDecoration: 'none' }}>
          <span
            style={{
              color: '#94a3b8',
              fontSize: 13,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'color 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.color = '#fff')}
            onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}
          >
            📅 Daily
          </span>
        </Link>

        <Link href="/leaderboard" style={{ textDecoration: 'none' }}>
          <span
            style={{
              color: '#94a3b8',
              fontSize: 13,
              fontWeight: 600,
              padding: '4px 10px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'color 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.color = '#fff')}
            onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}
          >
            🏆 Leaderboard
          </span>
        </Link>

        {isSupabaseConfigured && (
          <>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#60a5fa', fontSize: 12, fontWeight: 600 }}>
                  {user.email?.split('@')[0]}
                </span>
                <button
                  onClick={onSignOut}
                  style={{
                    background: '#1e2235',
                    color: '#94a3b8',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                style={{
                  background: '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 14px',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Sign in
              </button>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
