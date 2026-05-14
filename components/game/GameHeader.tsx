'use client';

import React from 'react';
import type { Difficulty, GameStatus } from '@/types/game';
import { DIFFICULTY_CONFIG } from '@/types/game';
import { formatTime } from '@/lib/minesweeper';
import { useLang } from '@/contexts/LanguageContext';

type GameHeaderProps = {
  status: GameStatus;
  timer: number;
  flagsPlaced: number;
  flagsUsed: number;
  minesTotal: number;
  maxFlags: number;
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
  idle: '😐', playing: '🤔', won: '😎', lost: '💀',
};

const DIFF_COLOR: Record<Difficulty, string> = {
  easy: '#4ca832', medium: '#c8a83a', hard: '#cc4422',
};

export function GameHeader({
  status, timer, flagsPlaced, flagsUsed, minesTotal, maxFlags,
  difficulty, showProbability, flagMode, mode = 'normal',
  onReset, onDifficultyChange, onToggleProbability, onToggleFlagMode,
}: GameHeaderProps) {
  const { tr } = useLang();
  const remaining = Math.max(0, minesTotal - flagsPlaced);
  const flagsLeft  = maxFlags - flagsUsed;
  const exhausted  = flagsLeft <= 0;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>

      {/* Difficulty selector */}
      {mode === 'normal' && (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
            <button key={d} onClick={() => onDifficultyChange(d)} style={{
              padding: '5px 18px', borderRadius: 3, fontSize: 13, fontWeight: 800,
              border: `2px solid ${difficulty === d ? DIFF_COLOR[d] : 'var(--border)'}`,
              cursor: 'pointer', letterSpacing: 1,
              background: difficulty === d ? `${DIFF_COLOR[d]}22` : 'var(--bg-card-2)',
              color: difficulty === d ? DIFF_COLOR[d] : 'var(--text-dim)',
              transition: 'all 0.15s',
            }}>
              {DIFFICULTY_CONFIG[d].label.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 6, padding: '8px 14px', gap: 8,
      }}>
        {/* Mine counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 64 }}>
          <span style={{ fontSize: 18 }}>💣</span>
          <span style={{ color: 'var(--danger)', fontWeight: 800, fontSize: 20, fontFamily: 'monospace', letterSpacing: 1 }}>
            {String(remaining).padStart(3, '0')}
          </span>
        </div>

        {/* Reset */}
        <button onClick={onReset} style={{
          fontSize: 22, background: 'var(--bg-card-2)', border: '1px solid var(--border)',
          borderRadius: 4, cursor: 'pointer', padding: '2px 10px', lineHeight: 1, transition: 'transform 0.1s',
        }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.88)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          title="Новая игра">
          {STATUS_EMOJI[status]}
        </button>

        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 64, justifyContent: 'flex-end' }}>
          <span style={{ color: 'var(--green-hi)', fontWeight: 800, fontSize: 20, fontFamily: 'monospace' }}>
            {formatTime(timer)}
          </span>
        </div>
      </div>

      {/* Tool row */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={onToggleProbability} style={{
          padding: '6px 14px', borderRadius: 3, fontSize: 12, fontWeight: 800,
          border: `1px solid ${showProbability ? 'var(--green)' : 'var(--border)'}`,
          cursor: 'pointer', letterSpacing: 0.5,
          background: showProbability ? 'rgba(107,158,53,0.2)' : 'var(--bg-card-2)',
          color: showProbability ? 'var(--green-hi)' : 'var(--text-2)',
          transition: 'all 0.15s',
        }}>
          {tr.aiHints} {showProbability ? tr.on : tr.off}
        </button>

        <button onClick={onToggleFlagMode}
          disabled={exhausted}
          style={{
            padding: '6px 14px', borderRadius: 3, fontSize: 12, fontWeight: 800,
            border: `1px solid ${exhausted ? 'var(--border)' : flagMode ? 'var(--danger)' : 'var(--border)'}`,
            cursor: exhausted ? 'not-allowed' : 'pointer', letterSpacing: 0.5,
            background: exhausted ? 'rgba(204,68,34,0.07)' : flagMode ? 'rgba(204,68,34,0.2)' : 'var(--bg-card-2)',
            color: exhausted ? '#5a3020' : flagMode ? '#ff7755' : 'var(--text-2)',
            transition: 'all 0.15s',
          }}
          title={exhausted ? 'Флаги закончились' : 'Режим флага (мобайл)'}>
          🚩 {flagsLeft}/{maxFlags} {flagMode ? 'ВКЛ' : 'ВЫКЛ'}
        </button>
      </div>
    </div>
  );
}
