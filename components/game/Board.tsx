'use client';

import React from 'react';
import type { Board as BoardType } from '@/types/game';
import type { ProbabilityMap } from '@/lib/probability';
import { Cell } from './Cell';

type BoardProps = {
  board: BoardType;
  probabilities: ProbabilityMap;
  showProbability: boolean;
  onCellClick: (row: number, col: number, clientX: number, clientY: number) => void;
  onCellRightClick: (row: number, col: number, clientX: number, clientY: number) => void;
  shake?: boolean;
};

function getCellSize(cols: number): number {
  if (cols <= 9) return 44;
  if (cols <= 16) return 36;
  return 30;
}

export function Board({
  board,
  probabilities,
  showProbability,
  onCellClick,
  onCellRightClick,
  shake,
}: BoardProps) {
  if (board.length === 0) return null;

  const cols = board[0].length;
  const cellSize = getCellSize(cols);

  return (
    <div className="overflow-auto max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div
        style={{
          display: 'inline-grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gap: '1px',
          background: '#11132a',
          padding: '3px',
          borderRadius: '6px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
          animation: shake ? 'shake 0.4s ease' : undefined,
        }}
      >
        {board.map(row =>
          row.map(cell => (
            <Cell
              key={`${cell.row}-${cell.col}`}
              cell={cell}
              probability={probabilities.get(`${cell.row},${cell.col}`)}
              showProbability={showProbability}
              onClick={onCellClick}
              onRightClick={onCellRightClick}
              cellSize={cellSize}
            />
          ))
        )}
      </div>
    </div>
  );
}
