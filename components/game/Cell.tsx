'use client';

import React from 'react';
import type { Cell as CellType } from '@/types/game';
import { getProbBgColor } from '@/lib/probability';

const NUMBER_COLORS: Record<number, string> = {
  1: '#60a5fa',
  2: '#4ade80',
  3: '#f87171',
  4: '#c084fc',
  5: '#fb923c',
  6: '#34d399',
  7: '#f472b6',
  8: '#94a3b8',
};

type CellProps = {
  cell: CellType;
  probability?: number;
  showProbability: boolean;
  onClick: (row: number, col: number) => void;
  onRightClick: (row: number, col: number) => void;
  cellSize: number;
  isExploded?: boolean;
};

export function Cell({
  cell,
  probability,
  showProbability,
  onClick,
  onRightClick,
  cellSize,
  isExploded,
}: CellProps) {
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onRightClick(cell.row, cell.col);
  };

  const emojiSize = cellSize * 0.52;
  const fontSize = cellSize < 30 ? 11 : cellSize < 36 ? 13 : 15;

  let bgColor = '#252840';
  let boxShadow = '2px 2px 0px #151728, -1px -1px 0px #363a5c';
  let cursor = 'pointer';
  let content: React.ReactNode = null;

  if (cell.isRevealed && cell.isMine) {
    bgColor = isExploded ? '#991b1b' : '#7f1d1d';
    boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.5)';
    cursor = 'default';
    content = <span style={{ fontSize: emojiSize }}>💣</span>;
  } else if (cell.isRevealed) {
    bgColor = '#0d0f1c';
    boxShadow = 'inset 1px 1px 0px rgba(0,0,0,0.7)';
    cursor = 'default';
    if (cell.neighborCount > 0) {
      content = (
        <span
          style={{
            color: NUMBER_COLORS[cell.neighborCount] ?? '#fff',
            fontSize,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {cell.neighborCount}
        </span>
      );
    }
  } else if (cell.isFlagged) {
    content = <span style={{ fontSize: emojiSize }}>🚩</span>;
  } else {
    // Unrevealed
    if (showProbability && probability !== undefined) {
      bgColor = getProbBgColor(probability);
      const pct = Math.round(probability * 100);
      if (pct > 0) {
        content = (
          <span
            style={{
              fontSize: cellSize < 32 ? 9 : 10,
              color: probability > 0.55 ? '#fff' : '#1a1a1a',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {pct}%
          </span>
        );
      } else {
        content = (
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>✓</span>
        );
      }
    }
  }

  return (
    <button
      style={{
        width: cellSize,
        height: cellSize,
        background: bgColor,
        boxShadow,
        border: 'none',
        outline: 'none',
        cursor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        userSelect: 'none',
        transition: 'background-color 0.08s',
        WebkitTapHighlightColor: 'transparent',
      }}
      onClick={() => onClick(cell.row, cell.col)}
      onContextMenu={handleRightClick}
      aria-label={`r${cell.row}c${cell.col}`}
    >
      {content}
    </button>
  );
}
