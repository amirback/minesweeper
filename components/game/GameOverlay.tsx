'use client';

import React from 'react';
import type { Difficulty, GameStatus } from '@/types/game';
import { DIFFICULTY_CONFIG } from '@/types/game';
import { formatTime } from '@/lib/minesweeper';

type GameOverlayProps = {
  status: GameStatus;
  timer: number;
  difficulty: Difficulty;
  mode?: 'normal' | 'daily';
  onPlayAgain: () => void;
};

export function GameOverlay({ status, timer, difficulty, mode = 'normal', onPlayAgain }: GameOverlayProps) {
  if (status !== 'won' && status !== 'lost') return null;

  const won = status === 'won';
  const { mines } = DIFFICULTY_CONFIG[difficulty];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#151728',
          border: `2px solid ${won ? '#4f46e5' : '#dc2626'}`,
          borderRadius: 16,
          padding: '32px 40px',
          textAlign: 'center',
          maxWidth: 340,
          width: '100%',
          boxShadow: `0 0 60px ${won ? 'rgba(79,70,229,0.4)' : 'rgba(220,38,38,0.4)'}`,
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 8 }}>{won ? '🎉' : '💥'}</div>

        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: won ? '#818cf8' : '#f87171',
            marginBottom: 4,
          }}
        >
          {won ? 'You Won!' : 'Game Over'}
        </h2>

        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
          {won
            ? `Cleared ${mines} mines on ${DIFFICULTY_CONFIG[difficulty].label} difficulty`
            : 'Better luck next time!'}
        </p>

        {won && (
          <div
            style={{
              background: '#0d0f1a',
              borderRadius: 8,
              padding: '12px 20px',
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'center',
              gap: 24,
            }}
          >
            <div>
              <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                Time
              </div>
              <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: 22, fontFamily: 'monospace' }}>
                {formatTime(timer)}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                Mines
              </div>
              <div style={{ color: '#4ade80', fontWeight: 700, fontSize: 22, fontFamily: 'monospace' }}>
                {mines}
              </div>
            </div>
          </div>
        )}

        {mode === 'daily' && won && (
          <p style={{ color: '#fbbf24', fontSize: 13, marginBottom: 16 }}>
            ⭐ Daily Challenge Complete! Check the leaderboard.
          </p>
        )}

        {mode !== 'daily' && (
          <button
            onClick={onPlayAgain}
            style={{
              background: won ? '#4f46e5' : '#1e2235',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 28px',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
              transition: 'opacity 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseOut={e => (e.currentTarget.style.opacity = '1')}
          >
            {won ? '🔄 Play Again' : '🔄 Try Again'}
          </button>
        )}

        {mode === 'daily' && (
          <p style={{ color: '#475569', fontSize: 12, marginTop: 8 }}>
            Come back tomorrow for a new daily challenge!
          </p>
        )}
      </div>
    </div>
  );
}
