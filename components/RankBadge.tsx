'use client';

import React from 'react';
import { getRank, getProgressToNextRank } from '@/lib/elo';

type RankBadgeProps = {
  elo: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export function RankBadge({ elo, showProgress = false, size = 'md' }: RankBadgeProps) {
  const { current, next, progress } = getProgressToNextRank(elo);

  const fontSize = size === 'sm' ? 11 : size === 'lg' ? 15 : 13;
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  const pad = size === 'sm' ? '2px 6px' : size === 'lg' ? '5px 12px' : '3px 8px';

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: pad,
          borderRadius: 6,
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${current.color}44`,
          boxShadow: `0 0 8px ${current.color}22`,
        }}
      >
        <span style={{ fontSize: iconSize }}>{current.icon}</span>
        <span style={{ fontSize, fontWeight: 700, color: current.color }}>
          {current.name}
        </span>
        <span style={{ fontSize: fontSize - 1, color: '#64748b', fontFamily: 'monospace' }}>
          {elo}
        </span>
      </div>

      {showProgress && next && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div
            style={{
              height: 4,
              background: '#1e2235',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${current.color}, ${next.color})`,
                borderRadius: 2,
                transition: 'width 0.5s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#475569' }}>
            <span>{current.name}</span>
            <span>{progress}% → {next.icon} {next.name}</span>
          </div>
        </div>
      )}
    </div>
  );
}
