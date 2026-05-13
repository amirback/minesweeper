'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { NavBar } from '@/components/NavBar';
import { AuthModal } from '@/components/AuthModal';
import { StatsPanel } from '@/components/StatsPanel';
import { RankBadge } from '@/components/RankBadge';
import { RANKS } from '@/lib/elo';

export default function StatsPage() {
  const { user, signOut, signInWithEmail, signUpWithEmail } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar user={user} onSignOut={signOut} onOpenAuth={() => setAuthOpen(true)} />

      <main style={{ flex: 1, maxWidth: 680, width: '100%', margin: '0 auto', padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#e2e8f0', marginBottom: 4 }}>📊 Your Stats</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>Track your progress across all sessions</p>
        </div>

        <StatsPanel />

        {/* Rank roadmap */}
        <div style={{ background: '#151728', border: '1px solid #1e2235', borderRadius: 12, padding: 16 }}>
          <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🗺️ Rank Roadmap</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {RANKS.map(rank => (
              <div
                key={rank.name}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', background: '#0d0f1a', borderRadius: 8,
                  border: `1px solid ${rank.color}22`,
                }}
              >
                <span style={{ fontSize: 22 }}>{rank.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: rank.color, fontWeight: 700, fontSize: 14 }}>{rank.name}</div>
                  <div style={{ color: '#475569', fontSize: 11 }}>
                    {rank.name === 'Quantum Miner' ? 'Top tier — elite miners only' : `${rank.minElo}+ ELO`}
                  </div>
                </div>
                {rank.name !== 'Bronze' && (
                  <div style={{ color: '#334155', fontSize: 11, fontFamily: 'monospace' }}>
                    {rank.minElo} ELO
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div style={{ background: '#151728', border: '1px solid #1e2235', borderRadius: 12, padding: 16 }}>
          <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>⚡ ELO Tips</h3>
          <ul style={{ color: '#64748b', fontSize: 13, lineHeight: 1.7, paddingLeft: 16 }}>
            <li>Hard difficulty gives <strong style={{ color: '#c084fc' }}>2.8× ELO multiplier</strong></li>
            <li>Fast clears earn a <strong style={{ color: '#4ade80' }}>speed bonus</strong> on top of base ELO</li>
            <li>Losses cost ELO — the higher the difficulty, the more you lose</li>
            <li>Use AI hints to learn, then turn them off to earn full credit</li>
            <li>Daily challenges count toward your ELO!</li>
          </ul>
        </div>

        <Link href="/" style={{ textDecoration: 'none', textAlign: 'center' }}>
          <span style={{ color: '#4f46e5', fontWeight: 600, fontSize: 14 }}>← Play now to earn ELO</span>
        </Link>
      </main>

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSignIn={async (email, password) => {
            const result = await signInWithEmail(email, password);
            if (!result.error) setAuthOpen(false);
            return { error: result.error as Error | null };
          }}
          onSignUp={async (email, password, username) => {
            const result = await signUpWithEmail(email, password, username);
            return { error: result.error as Error | null };
          }}
        />
      )}
    </div>
  );
}
