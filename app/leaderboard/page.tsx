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
              color: '#e2e8f0',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            🏆 Global Leaderboard
          </h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            Best times across all difficulty levels
          </p>
        </div>

        <Leaderboard currentUserId={user?.id} />

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span
              style={{
                color: '#4f46e5',
                fontWeight: 600,
                fontSize: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              ← Play to set your best time
            </span>
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
