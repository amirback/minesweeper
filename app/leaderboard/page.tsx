'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Leaderboard } from '@/components/Leaderboard';
import { NavBar } from '@/components/NavBar';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';

export default function LeaderboardPage() {
  const { user, signOut, signInWithEmail, signUpWithEmail } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar user={user} onSignOut={signOut} onOpenAuth={() => setAuthOpen(true)} />

      <main
        style={{
          flex: 1,
          maxWidth: 600,
          width: '100%',
          margin: '0 auto',
          padding: '32px 16px',
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: 'var(--text)',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              letterSpacing: 3,
            }}
          >
            🏆 Global Leaderboard
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
            Best times across all difficulty levels
          </p>
        </div>

        <Leaderboard currentUserId={user?.id} />

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Link href="/game" style={{ textDecoration: 'none', color: 'var(--text-dim)', fontSize: 13 }}>
            ← Back to game
          </Link>
        </div>
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
