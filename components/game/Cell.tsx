'use client';

import React from 'react';
import type { Cell as CellType } from '@/types/game';
import { getProbBgColor } from '@/lib/probability';

const NUMBER_COLORS: Record<number, string> = {
  1: '#6ab4ff',
  2: '#5dcc6e',
  3: '#ff7755',
  4: '#c084fc',
  5: '#ffa040',
  6: '#40d9a0',
  7: '#f472b6',
  8: '#8aac5c',
};

type CellProps = {
  cell: CellType;
  probability?: number;
  showProbability: boolean;
  onClick: (row: number, col: number, clientX: number, clientY: number) => void;
  onRightClick: (row: number, col: number, clientX: number, clientY: number) => void;
  cellSize: number;
  isExploded?: boolean;
};

export function Cell({ cell, probability, showProbability, onClick, onRightClick, cellSize, isExploded }: CellProps) {
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onRightClick(cell.row, cell.col, e.clientX, e.clientY);
  };

  const emojiSize = cellSize * 0.5;
  const fontSize  = cellSize < 30 ? 11 : cellSize < 36 ? 13 : 15;

  let bgColor   = 'var(--cell-un)';
  let boxShadow = '2px 2px 0px #0a1207, -1px -1px 0px #3a5828';
  let cursor    = 'pointer';
  let content: React.ReactNode = null;

  if (cell.isRevealed && cell.isMine) {
    bgColor   = isExploded ? '#6b1a08' : '#4a1205';
    boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.6)';
    cursor    = 'default';
    content   = <span style={{ fontSize: emojiSize, lineHeight: 1 }}>💣</span>;
  } else if (cell.isRevealed) {
    bgColor   = 'var(--cell-rev)';
    boxShadow = 'inset 1px 1px 0px rgba(0,0,0,0.8)';
    cursor    = 'default';
    if (cell.neighborCount > 0) {
      content = (
        <span style={{
          color: NUMBER_COLORS[cell.neighborCount] ?? 'var(--text)',
          fontSize, fontWeight: 800, lineHeight: 1, fontFamily: 'monospace',
        }}>
          {cell.neighborCount}
        </span>
      );
    }
  } else if (cell.isFlagged) {
    content = <span style={{ fontSize: emojiSize, lineHeight: 1 }}>🚩</span>;
  } else if (showProbability && probability !== undefined) {
    bgColor = getProbBgColor(probability);
    const pct = Math.round(probability * 100);
    if (pct > 0) {
      content = (
        <span style={{ fontSize: cellSize < 32 ? 9 : 10, color: probability > 0.55 ? '#fff' : '#1a1a1a', fontWeight: 800, lineHeight: 1 }}>
          {pct}%
        </span>
      );
    } else {
      content = <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>✓</span>;
    }
  }

  return (
    <button
      style={{
        width: cellSize, height: cellSize,
        background: bgColor, boxShadow, border: 'none',
        outline: 'none', cursor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, userSelect: 'none',
        transition: 'background-color 0.06s',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
      onClick={e => onClick(cell.row, cell.col, e.clientX, e.clientY)}
      onContextMenu={handleRightClick}
      aria-label={`r${cell.row}c${cell.col}`}
    >
      {content}
    </button>
  );
}
