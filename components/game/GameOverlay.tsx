'use client';

import React, { useEffect, useState } from 'react';
import type { Difficulty, GameStatus } from '@/types/game';
import { DIFFICULTY_CONFIG } from '@/types/game';
import { formatTime } from '@/lib/minesweeper';
import { getRank } from '@/lib/elo';

const ELO_KEY = 'minetrainer_elo';

type GameOverlayProps = {
  status: GameStatus;
  timer: number;
  difficulty: Difficulty;
  mode?: 'normal' | 'daily';
  eloGain?: number | null;
  combo?: number;
  onPlayAgain: () => void;
};

export function GameOverlay({ status, timer, difficulty, mode = 'normal', eloGain, combo, onPlayAgain }: GameOverlayProps) {
  const [newElo, setNewElo] = useState<number | null>(null);
  const [prevRankName, setPrevRankName] = useState('');
  const [rankUp, setRankUp] = useState(false);

  useEffect(() => {
    if ((status === 'won' || status === 'lost') && eloGain !== null && eloGain !== undefined) {
      const prev = parseInt(typeof window !== 'undefined' ? (localStorage.getItem(ELO_KEY) ?? '1000') : '1000', 10);
      const prevRank = getRank(prev).name;
      const next = Math.max(0, prev + eloGain);
      const nextRankName = getRank(next).name;
      localStorage.setItem(ELO_KEY, String(next));
      setNewElo(next);
      setPrevRankName(prevRank);
      if (nextRankName !== prevRank) setRankUp(true);
    }
  }, [status, eloGain]);

  if (status !== 'won' && status !== 'lost') return null;

  const won = status === 'won';
  const { mines } = DIFFICULTY_CONFIG[difficulty];
  const rank = newElo !== null ? getRank(newElo) : null;

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 50, padding: 16,
    }}>
      <div style={{
        background: '#151728',
        border: `2px solid ${won ? '#4f46e5' : '#dc2626'}`,
        borderRadius: 16, padding: '28px 36px', textAlign: 'center',
        maxWidth: 360, width: '100%',
        boxShadow: `0 0 80px ${won ? 'rgba(79,70,229,0.35)' : 'rgba(220,38,38,0.35)'}`,
        animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {rankUp && (
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5, #c084fc)',
            borderRadius: 8, padding: '8px 12px', marginBottom: 16,
            fontSize: 13, fontWeight: 700, color: '#fff',
          }}>
            🎉 RANK UP! {rank?.icon} {rank?.name}
          </div>
        )}

        <div style={{ fontSize: 56, marginBottom: 6 }}>{won ? '🎉' : '💥'}</div>

        <h2 style={{ fontSize: 26, fontWeight: 800, color: won ? '#818cf8' : '#f87171', marginBottom: 4 }}>
          {won ? 'You Won!' : 'Game Over'}
        </h2>

        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
          {won
            ? `Cleared ${mines} mines · ${DIFFICULTY_CONFIG[difficulty].label}`
            : 'Better luck next time!'}
        </p>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: combo && combo >= 2 ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {won && (
            <div style={{ background: '#0d0f1a', borderRadius: 8, padding: '10px' }}>
              <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Time</div>
              <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: 20, fontFamily: 'monospace' }}>{formatTime(timer)}</div>
            </div>
          )}
          {eloGain !== undefined && eloGain !== null && (
            <div style={{ background: '#0d0f1a', borderRadius: 8, padding: '10px' }}>
              <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>ELO</div>
              <div style={{
                fontWeight: 700, fontSize: 20, fontFamily: 'monospace',
                color: eloGain >= 0 ? '#4ade80' : '#f87171',
              }}>
                {eloGain >= 0 ? '+' : ''}{eloGain}
              </div>
            </div>
          )}
          {combo && combo >= 2 && (
            <div style={{ background: '#0d0f1a', borderRadius: 8, padding: '10px' }}>
              <div style={{ color: '#64748b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Best Combo</div>
              <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: 20, fontFamily: 'monospace' }}>×{combo}</div>
            </div>
          )}
        </div>

        {rank && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16, fontSize: 13 }}>
            <span>{rank.icon}</span>
            <span style={{ color: rank.color, fontWeight: 700 }}>{rank.name}</span>
            <span style={{ color: '#475569', fontFamily: 'monospace' }}>{newElo} ELO</span>
          </div>
        )}

        {mode === 'daily' && won && (
          <p style={{ color: '#fbbf24', fontSize: 13, marginBottom: 16 }}>⭐ Daily Challenge Complete!</p>
        )}

        {(mode !== 'daily' || !won) && (
          <button onClick={onPlayAgain}
            style={{
              background: won ? '#4f46e5' : '#1e2235', color: '#fff', border: 'none',
              borderRadius: 8, padding: '10px 28px', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', width: '100%', transition: 'opacity 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseOut={e => (e.currentTarget.style.opacity = '1')}>
            {won ? '🔄 Play Again' : '🔄 Try Again'}
          </button>
        )}

        {mode === 'daily' && won && (
          <p style={{ color: '#475569', fontSize: 12, marginTop: 8 }}>New board tomorrow!</p>
        )}
      </div>
    </div>
  );
}
