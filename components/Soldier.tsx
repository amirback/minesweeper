'use client';

import React, { useEffect, useState } from 'react';

export type FlagEventData = {
  id: number;
  x: number;
  y: number;
  isMine: boolean;
  gameActive: boolean;
};

type Phase = 'drop' | 'result' | 'gone';

export function Soldier({ event }: { event: FlagEventData | null }) {
  const [data, setData] = useState<(FlagEventData & { phase: Phase }) | null>(null);

  useEffect(() => {
    if (!event) return;
    setData({ ...event, phase: 'drop' });
    const t1 = setTimeout(() => setData(d => d ? { ...d, phase: 'result' } : null), 650);
    const t2 = setTimeout(() => setData(d => d ? { ...d, phase: 'gone' } : null), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [event?.id]);

  if (!data || data.phase === 'gone') return null;

  const { x, y, isMine, gameActive, phase } = data;

  const emoji =
    phase === 'drop'
      ? '🪂'
      : !gameActive
        ? '🚩'
        : isMine
          ? '💀'
          : '😎';

  const anim =
    phase === 'drop'
      ? 'soldierFall 0.6s cubic-bezier(0.22,1,0.36,1) forwards'
      : isMine && gameActive
        ? 'soldierDie 0.5s ease forwards'
        : 'soldierWin 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards';

  return (
    <div
      style={{
        position: 'fixed',
        left: x - 22,
        top: y - 22,
        fontSize: 30,
        zIndex: 999,
        pointerEvents: 'none',
        animation: anim,
        filter:
          phase === 'result' && gameActive
            ? isMine
              ? 'drop-shadow(0 0 10px #ef4444)'
              : 'drop-shadow(0 0 10px #4ade80)'
            : 'none',
      }}
    >
      {emoji}
      <style>{`
        @keyframes soldierFall {
          from { transform: translateY(-110px) scale(0.4); opacity: 0; }
          80%  { transform: translateY(6px) scale(1.1); opacity: 1; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes soldierDie {
          0%   { transform: scale(1) rotate(0deg); opacity: 1; }
          25%  { transform: scale(1.6) rotate(-25deg); filter: brightness(3); }
          100% { transform: scale(0.5) rotate(200deg) translateY(14px); opacity: 0; }
        }
        @keyframes soldierWin {
          0%   { transform: scale(1) rotate(0deg); }
          40%  { transform: scale(1.5) rotate(-12deg); }
          70%  { transform: scale(1.3) rotate(10deg); }
          100% { transform: scale(1.2) rotate(-4deg); }
        }
      `}</style>
    </div>
  );
}
