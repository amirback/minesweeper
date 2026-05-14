'use client';

import React, { useState } from 'react';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';
import { Board } from '@/components/game/Board';
import { GameHeader } from '@/components/game/GameHeader';
import { GameOverlay } from '@/components/game/GameOverlay';
import { ComboDisplay } from '@/components/game/ComboDisplay';
import { Soldier } from '@/components/Soldier';
import { NavBar } from '@/components/NavBar';
import { AuthModal } from '@/components/AuthModal';
import { LiveFeed } from '@/components/LiveFeed';
import { StatsPanel } from '@/components/StatsPanel';
import type { Difficulty } from '@/types/game';

type GameAreaProps = { userId?: string; onPlayAgain: () => void };

function GameArea({ userId, onPlayAgain }: GameAreaProps) {
  const {
    board, status, difficulty, flagsPlaced, flagsUsed, timer,
    showProbability, probabilities, flagMode, minesTotal, maxFlags,
    combo, eloGain, flagEvent,
    setFlagMode, resetGame, handleCellClick, handleCellRightClick, toggleProbability,
  } = useGame('easy', { userId });

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flex: '1 1 340px', minWidth: 0 }}>
        <GameHeader
          status={status} timer={timer} flagsPlaced={flagsPlaced} flagsUsed={flagsUsed}
          minesTotal={minesTotal} maxFlags={maxFlags}
          difficulty={difficulty} showProbability={showProbability} flagMode={flagMode}
          onReset={() => resetGame()}
          onDifficultyChange={(d: Difficulty) => resetGame(d)}
          onToggleProbability={toggleProbability}
          onToggleFlagMode={() => setFlagMode(f => !f)}
        />
        <Board
          board={board} probabilities={probabilities} showProbability={showProbability}
          onCellClick={handleCellClick} onCellRightClick={handleCellRightClick}
          shake={status === 'lost'}
        />
        {showProbability && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 12px', fontSize: 12,
            color: 'var(--text-2)', maxWidth: 380, textAlign: 'center',
          }}>
            <strong style={{ color: 'var(--green-hi)' }}>AI-Coach</strong> — показывает вероятность мины в каждой клетке.{' '}
            <span style={{ color: '#4ca832' }}>Зелёный = безопаснее</span>,{' '}
            <span style={{ color: 'var(--danger)' }}>красный = опасно</span>.
          </div>
        )}
      </div>

      <ComboDisplay combo={combo} />
      <Soldier event={flagEvent} />

      <GameOverlay
        status={status} timer={timer} difficulty={difficulty}
        eloGain={eloGain} combo={combo}
        onPlayAgain={onPlayAgain}
      />
    </>
  );
}

export default function GamePage() {
  const { user, signOut, signInWithEmail, signUpWithEmail } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar user={user} onSignOut={signOut} onOpenAuth={() => setAuthOpen(true)} />

      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '16px 12px 40px', gap: 16,
      }}>
        {/* Two-column: game + sidebar */}
        <div style={{
          width: '100%', maxWidth: 1100,
          display: 'flex', gap: 20, alignItems: 'flex-start',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          <GameArea
            key={gameKey}
            userId={user?.id}
            onPlayAgain={() => setGameKey(k => k + 1)}
          />

          {/* Sidebar */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 16,
            width: 260, flexShrink: 0,
          }}>
            <StatsPanel />

            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 14,
            }}>
              <h3 style={{
                color: 'var(--text)', fontWeight: 700, fontSize: 14,
                marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#4ca832',
                  display: 'inline-block', boxShadow: '0 0 6px #4ca832',
                }}/>
                Активность
              </h3>
              <LiveFeed />
            </div>
          </div>
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
