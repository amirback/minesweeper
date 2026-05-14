'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Difficulty, GameStatus } from '@/types/game';
import { DIFFICULTY_CONFIG } from '@/types/game';
import { formatTime } from '@/lib/minesweeper';
import { getRank } from '@/lib/elo';

function getSecondsUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

function DailyCountdown() {
  const [secs, setSecs] = useState(getSecondsUntilMidnight);
  useEffect(() => {
    const t = setInterval(() => setSecs(getSecondsUntilMidnight()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const fmt = (n: number) => String(n).padStart(2, '0');
  return (
    <div style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 12 }}>
      Следующая карта через:{' '}
      <span style={{ color: 'var(--gold)', fontFamily: 'monospace', fontWeight: 800 }}>
        {fmt(h)}:{fmt(m)}:{fmt(s)}
      </span>
    </div>
  );
}

const ELO_KEY = 'minetrainer_elo';

type Props = {
  status: GameStatus;
  timer: number;
  difficulty: Difficulty;
  mode?: 'normal' | 'daily';
  eloGain?: number | null;
  combo?: number;
  onPlayAgain: () => void;
};

export function GameOverlay({ status, timer, difficulty, mode = 'normal', eloGain, combo, onPlayAgain }: Props) {
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

  const borderColor = won ? 'var(--green)' : 'var(--danger)';
  const glow = won ? 'rgba(107,158,53,0.4)' : 'rgba(204,68,34,0.4)';

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)', zIndex: 50,
      padding: 16, overflowY: 'auto',
    }}>
      <div style={{
        background: 'var(--bg-card)', border: `2px solid ${borderColor}`,
        borderRadius: 8, padding: '28px 28px 24px', textAlign: 'center',
        maxWidth: 360, width: '100%',
        boxShadow: `0 0 60px ${glow}`,
        animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {rankUp && (
          <div style={{
            background: 'rgba(107,158,53,0.15)', border: '1px solid var(--green)',
            borderRadius: 6, padding: '8px 12px', marginBottom: 16,
            fontSize: 13, fontWeight: 800, color: 'var(--green-hi)', letterSpacing: 1,
          }}>
            ⬆ НОВЫЙ РАНГ! {rank?.icon} {rank?.name}
          </div>
        )}

        <div style={{ fontSize: 52, marginBottom: 6 }}>{won ? '🎉' : '💥'}</div>

        <h2 style={{
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          fontSize: 36, letterSpacing: 4,
          color: won ? 'var(--green-hi)' : 'var(--danger)', marginBottom: 4,
        }}>
          {won ? 'ПОБЕДА!' : 'ПОДРЫВ'}
        </h2>

        <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 16 }}>
          {won
            ? `Обезврежено мин: ${mines} · ${DIFFICULTY_CONFIG[difficulty].label}`
            : 'Попробуй ещё раз!'}
        </p>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: combo && combo >= 2 ? '1fr 1fr 1fr' : '1fr 1fr',
          gap: 8, marginBottom: 16,
        }}>
          {won && (
            <div style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: 6, padding: 10 }}>
              <div style={{ color: 'var(--text-dim)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Время</div>
              <div style={{ color: 'var(--green-hi)', fontWeight: 800, fontSize: 20, fontFamily: 'monospace' }}>{formatTime(timer)}</div>
            </div>
          )}
          {eloGain !== undefined && eloGain !== null && (
            <div style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: 6, padding: 10 }}>
              <div style={{ color: 'var(--text-dim)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>ELO</div>
              <div style={{ fontWeight: 800, fontSize: 20, fontFamily: 'monospace', color: eloGain >= 0 ? 'var(--green-hi)' : 'var(--danger)' }}>
                {eloGain >= 0 ? '+' : ''}{eloGain}
              </div>
            </div>
          )}
          {combo && combo >= 2 && (
            <div style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: 6, padding: 10 }}>
              <div style={{ color: 'var(--text-dim)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Комбо</div>
              <div style={{ color: 'var(--gold)', fontWeight: 800, fontSize: 20, fontFamily: 'monospace' }}>×{combo}</div>
            </div>
          )}
        </div>

        {rank && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16, fontSize: 13 }}>
            <span>{rank.icon}</span>
            <span style={{ color: rank.color, fontWeight: 800 }}>{rank.name}</span>
            <span style={{ color: 'var(--text-dim)', fontFamily: 'monospace' }}>{newElo} ELO</span>
          </div>
        )}

        {mode === 'daily' && won ? (
          <>
            <p style={{ color: 'var(--gold)', fontSize: 13, marginBottom: 12, fontWeight: 700 }}>⭐ Daily Challenge выполнен!</p>
            <DailyCountdown />
            <Link href="/game" style={{
              display: 'block', background: 'var(--green)', color: '#0b1a08',
              borderRadius: 4, padding: '14px 28px', fontSize: 16, fontWeight: 800,
              letterSpacing: 2, textDecoration: 'none', textAlign: 'center',
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              minHeight: 52, lineHeight: '24px',
            }}>
              В ГЛАВНОЕ МЕНЮ
            </Link>
          </>
        ) : (
          <button onClick={onPlayAgain} style={{
            background: won ? 'var(--green)' : 'var(--bg-card-2)',
            color: won ? '#0b1a08' : 'var(--text)',
            border: won ? 'none' : '1px solid var(--border)',
            borderRadius: 4, padding: '14px 28px', fontSize: 16, fontWeight: 800,
            cursor: 'pointer', width: '100%', letterSpacing: 2,
            fontFamily: "'Bebas Neue', Impact, sans-serif",
            minHeight: 52,
            transition: 'opacity 0.15s',
          }}
            onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseOut={e => (e.currentTarget.style.opacity = '1')}>
            {won ? 'ИГРАТЬ ЕЩЁ' : 'СНОВА В БОЙ'}
          </button>
        )}
      </div>
    </div>
  );
}
