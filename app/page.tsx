'use client';

import React, { useState } from 'react';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';
import { Board } from '@/components/game/Board';
import { GameHeader } from '@/components/game/GameHeader';
import { GameOverlay } from '@/components/game/GameOverlay';
import { NavBar } from '@/components/NavBar';
import { AuthModal } from '@/components/AuthModal';
import type { Difficulty } from '@/types/game';

export default function HomePage() {
  const { user, loading, signOut, signInWithEmail, signUpWithEmail } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

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
    setFlagMode,
    resetGame,
    handleCellClick,
    handleCellRightClick,
    toggleProbability,
  } = useGame('easy', { userId: user?.id });

  const handleDifficultyChange = (d: Difficulty) => {
    resetGame(d);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar user={user} onSignOut={signOut} onOpenAuth={() => setAuthOpen(true)} />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 16px 40px',
          gap: 20,
        }}
      >
        {/* Hero tagline */}
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <h1
            style={{
              fontSize: 'clamp(22px, 5vw, 32px)',
              fontWeight: 900,
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 4,
            }}
          >
            MineTrainer
          </h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            Minesweeper with real-time AI probability hints
          </p>
        </div>

        {/* Game container */}
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
            onReset={() => resetGame()}
            onDifficultyChange={handleDifficultyChange}
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

          {/* AI hint explanation */}
          {showProbability && (
            <div
              style={{
                background: '#151728',
                border: '1px solid #1e2235',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 12,
                color: '#64748b',
                maxWidth: 400,
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              🤖 <strong style={{ color: '#818cf8' }}>AI Coach</strong> — percentages show the
              probability each hidden cell contains a mine, calculated from adjacent number constraints.
              <span style={{ color: '#4ade80' }}> Green = safer</span>,{' '}
              <span style={{ color: '#f87171' }}>red = dangerous</span>.
            </div>
          )}
        </div>

        {/* Feature cards */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: 700,
            marginTop: 8,
          }}
        >
          {[
            { icon: '🤖', title: 'AI Coach', desc: 'Real-time mine probability on every cell' },
            { icon: '📅', title: 'Daily Challenge', desc: 'Same board for everyone, compete globally' },
            { icon: '🏆', title: 'Leaderboard', desc: 'Best times across all difficulty levels' },
          ].map(card => (
            <div
              key={card.title}
              style={{
                background: '#151728',
                border: '1px solid #1e2235',
                borderRadius: 10,
                padding: '14px 16px',
                width: 180,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{card.icon}</div>
              <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                {card.title}
              </div>
              <div style={{ color: '#475569', fontSize: 11 }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </main>

      <GameOverlay
        status={status}
        timer={timer}
        difficulty={difficulty}
        onPlayAgain={() => resetGame()}
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
