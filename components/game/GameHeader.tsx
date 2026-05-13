'use client';

import React from 'react';
import type { Difficulty, GameStatus } from '@/types/game';
import { DIFFICULTY_CONFIG } from '@/types/game';
import { formatTime } from '@/lib/minesweeper';

type GameHeaderProps = {
  status: GameStatus;
  timer: number;
  flagsPlaced: number;
  minesTotal: number;
  difficulty: Difficulty;
  showProbability: boolean;
  flagMode: boolean;
  mode?: 'normal' | 'daily';
  onReset: () => void;
  onDifficultyChange: (d: Difficulty) => void;
  onToggleProbability: () => void;
  onToggleFlagMode: () => void;
};

const STATUS_EMOJI: Record<GameStatus, string> = {
  idle: '😊',
  playing: '🤔',
  won: '😎',
  lost: '😵',
};

export function GameHeader({
  status,
  timer,
  flagsPlaced,
  minesTotal,
  difficulty,
  showProbability,
  flagMode,
  mode = 'normal',
  onReset,
  onDifficultyChange,
  onToggleProbability,
  onToggleFlagMode,
}: GameHeaderProps) {
  const remaining = Math.max(0, minesTotal - flagsPlaced);

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Difficulty selector */}
      {mode === 'normal' && (
        <div className="flex gap-1 justify-center">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
            <button
              key={d}
              onClick={() => onDifficultyChange(d)}
              style={{
                padding: '4px 14px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: difficulty === d ? '#4f46e5' : '#1e2235',
                color: difficulty === d ? '#fff' : '#94a3b8',
                transition: 'all 0.15s',
              }}
            >
              {DIFFICULTY_CONFIG[d].label}
            </button>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#151728',
          borderRadius: 8,
          padding: '8px 12px',
          gap: 8,
        }}
      >
        {/* Mine counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 60 }}>
          <span style={{ fontSize: 18 }}>💣</span>
          <span style={{ color: '#f87171', fontWeight: 700, fontSize: 18, fontFamily: 'monospace' }}>
            {String(remaining).padStart(3, '0')}
          </span>
        </div>

        {/* Reset button */}
        <button
          onClick={onReset}
          style={{
            fontSize: 22,
            background: '#1e2235',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            padding: '2px 8px',
            lineHeight: 1,
            transition: 'transform 0.1s',
          }}
          onMouseDown={e => ((e.currentTarget.style.transform = 'scale(0.9)'))}
          onMouseUp={e => ((e.currentTarget.style.transform = 'scale(1)'))}
          onMouseLeave={e => ((e.currentTarget.style.transform = 'scale(1)'))}
          title="New game"
        >
          {STATUS_EMOJI[status]}
        </button>

        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 60, justifyContent: 'flex-end' }}>
          <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: 18, fontFamily: 'monospace' }}>
            {formatTime(timer)}
          </span>
          <span style={{ fontSize: 18 }}>⏱️</span>
        </div>
      </div>

      {/* Tool buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={onToggleProbability}
          style={{
            padding: '5px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            background: showProbability ? '#7c3aed' : '#1e2235',
            color: showProbability ? '#fff' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'all 0.15s',
          }}
        >
          🤖 AI Hints {showProbability ? 'ON' : 'OFF'}
        </button>

        <button
          onClick={onToggleFlagMode}
          style={{
            padding: '5px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            background: flagMode ? '#dc2626' : '#1e2235',
            color: flagMode ? '#fff' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'all 0.15s',
          }}
          title="Toggle flag mode (mobile)"
        >
          🚩 Flag Mode {flagMode ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
}
