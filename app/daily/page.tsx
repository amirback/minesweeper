'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';
import { Board } from '@/components/game/Board';
import { GameHeader } from '@/components/game/GameHeader';
import { GameOverlay } from '@/components/game/GameOverlay';
import { Leaderboard } from '@/components/Leaderboard';
import { NavBar } from '@/components/NavBar';
import { AuthModal } from '@/components/AuthModal';
import { getDailyDateString } from '@/lib/minesweeper';

export default function DailyPage() {
  const { user, signOut, signInWithEmail, signUpWithEmail } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const today = getDailyDateString();

  const {
    board,
    status,
    difficulty,
    flagsPlaced,
    timer,
    showProbability,
    probabilities,
    flagMode,
    minesTotal,
    dailyCompleted,
    setFlagMode,
    resetGame,
    handleCellClick,
    handleCellRightClick,
    toggleProbability,
  } = useGame('easy', { mode: 'daily', userId: user?.id });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar user={user} onSignOut={signOut} onOpenAuth={() => setAuthOpen(true)} />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 16px 40px',
          gap: 20,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 'clamp(20px, 5vw, 28px)',
              fontWeight: 900,
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 4,
            }}
          >
            📅 Daily Challenge
          </h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            {today} · Same board for everyone · Medium difficulty
          </p>
          <p style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>
            New board every day at midnight
          </p>
        </div>

        {/* Game */}
        <div
          style={{
            width: '100%',
            maxWidth: 700,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <GameHeader
            status={status}
            timer={timer}
            flagsPlaced={flagsPlaced}
            minesTotal={minesTotal}
            difficulty={difficulty}
            showProbability={showProbability}
            flagMode={flagMode}
            mode="daily"
            onReset={() => {}} // no reset for daily
            onDifficultyChange={() => {}}
            onToggleProbability={toggleProbability}
            onToggleFlagMode={() => setFlagMode(f => !f)}
          />

          <Board
            board={board}
            probabilities={probabilities}
            showProbability={showProbability}
            onCellClick={handleCellClick}
            onCellRightClick={handleCellRightClick}
            shake={status === 'lost'}
          />
        </div>

        {/* Daily leaderboard */}
        {(dailyCompleted || status === 'won') && (
          <div
            style={{
              width: '100%',
              maxWidth: 600,
              marginTop: 8,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#e2e8f0',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              🏆 Today&apos;s Rankings
            </h2>
            <Leaderboard isDaily={true} dailyDate={today} currentUserId={user?.id} />
          </div>
        )}

        <Link href="/" style={{ textDecoration: 'none', marginTop: 8 }}>
          <span style={{ color: '#475569', fontSize: 13 }}>← Back to free play</span>
        </Link>
      </main>

      <GameOverlay
        status={status}
        timer={timer}
        difficulty={difficulty}
        mode="daily"
        onPlayAgain={() => {}}
      />

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
