'use client';

import React, { useEffect, useState } from 'react';

type ComboDisplayProps = {
  combo: number;
};

const COMBO_COLORS = ['#60a5fa', '#4ade80', '#fbbf24', '#f97316', '#ef4444', '#a78bfa', '#f472b6'];

export function ComboDisplay({ combo }: ComboDisplayProps) {
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (combo >= 2) {
      setVisible(true);
      setKey(k => k + 1);
      const t = setTimeout(() => setVisible(false), 1800);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [combo]);

  if (!visible || combo < 2) return null;

  const colorIdx = Math.min(combo - 2, COMBO_COLORS.length - 1);
  const color = COMBO_COLORS[colorIdx];
  const scale = Math.min(1 + (combo - 2) * 0.08, 1.5);

  return (
    <div
      key={key}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
        zIndex: 30,
        pointerEvents: 'none',
        textAlign: 'center',
        animation: 'comboAppear 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <style>{`
        @keyframes comboAppear {
          from { opacity: 0; transform: translate(-50%, -60%) scale(0.6); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes comboPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
      <div
        style={{
          fontSize: 36,
          fontWeight: 900,
          color,
          textShadow: `0 0 20px ${color}88, 0 0 40px ${color}44`,
          letterSpacing: '-1px',
          lineHeight: 1,
          animation: 'comboPulse 0.4s ease infinite',
        }}
      >
        ×{combo} COMBO!
      </div>
      {combo >= 5 && (
        <div style={{ fontSize: 14, color: '#fbbf24', fontWeight: 700, marginTop: 2 }}>
          🔥 ON FIRE
        </div>
      )}
    </div>
  );
}
