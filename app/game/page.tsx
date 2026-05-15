'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { createMatch } from '@/lib/supabase';
import { getUserProfile } from '@/lib/supabase';
import type { Difficulty } from '@/types/game';

type GameAreaProps = {
  userId?: string;
  initialDifficulty: Difficulty;
  onPlayAgain: () => void;
  onDifficultyChange: (d: Difficulty) => void;
};

function GameArea({ userId, initialDifficulty, onPlayAgain, onDifficultyChange }: GameAreaProps) {
  const {
    board, status, difficulty, flagsPlaced, flagsUsed, timer,
    showProbability, probabilities, flagMode, minesTotal, maxFlags,
    combo, eloGain, flagEvent,
    setFlagMode, resetGame, handleCellClick, handleCellRightClick, toggleProbability,
  } = useGame(initialDifficulty, { userId });

  const handleDifficultyChange = (d: Difficulty) => {
    resetGame(d);
    onDifficultyChange(d);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flex: '1 1 340px', minWidth: 0 }}>
        <GameHeader
          status={status} timer={timer} flagsPlaced={flagsPlaced} flagsUsed={flagsUsed}
          minesTotal={minesTotal} maxFlags={maxFlags}
          difficulty={difficulty} showProbability={showProbability} flagMode={flagMode}
          onReset={() => resetGame()}
          onDifficultyChange={handleDifficultyChange}
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
            Вероятность мины в каждой клетке.{' '}
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
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('easy');
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const handleCreateMatch = async () => {
    if (!user) { setAuthOpen(true); return; }
    setCreating(true);
    const prof = await getUserProfile(user.id);
    const name = prof?.username ?? user.email?.split('@')[0] ?? 'Player';
    const match = await createMatch(user.id, name);
    setCreating(false);
    if (match) router.push(`/duel/${match.id}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar user={user} onSignOut={signOut} onOpenAuth={() => setAuthOpen(true)} />

      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '16px 12px 40px', gap: 16,
      }}>
        <div style={{
          width: '100%', maxWidth: 1100,
          display: 'flex', gap: 20, alignItems: 'flex-start',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          <GameArea
            key={gameKey}
            userId={user?.id}
            initialDifficulty={currentDifficulty}
            onDifficultyChange={setCurrentDifficulty}
            onPlayAgain={() => setGameKey(k => k + 1)}
          />

          {/* Sidebar */}
          <div className="game-sidebar" style={{
            display: 'flex', flexDirection: 'column', gap: 16,
            width: 260, flexShrink: 0,
          }}>
            <button
              onClick={handleCreateMatch}
              disabled={creating}
              style={{
                width: '100%', background: 'rgba(245,158,11,0.15)',
                border: '2px solid rgba(245,158,11,0.5)', borderRadius: 8,
                padding: '12px 16px', cursor: creating ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 0.15s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.25)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.15)')}
            >
              <span style={{ fontSize: 22 }}>⚔️</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 17, letterSpacing: 2, color: 'var(--gold)' }}>
                  {creating ? 'СОЗДАЁМ...' : 'СОЗДАТЬ МАТЧ'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Дуэль 1 на 1</div>
              </div>
            </button>

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
