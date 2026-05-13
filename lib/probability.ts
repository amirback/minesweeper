import type { Board } from '@/types/game';

export type ProbabilityMap = Map<string, number>;

export function calculateProbabilities(board: Board): ProbabilityMap {
  const rows = board.length;
  if (rows === 0) return new Map();
  const cols = board[0].length;

  const constraintsByCell = new Map<string, number[]>();

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (!cell.isRevealed || cell.isMine || cell.neighborCount === 0) continue;

      let adjacentFlags = 0;
      const unrevealed: string[] = [];

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          const neighbor = board[nr][nc];
          if (neighbor.isFlagged) adjacentFlags++;
          else if (!neighbor.isRevealed) unrevealed.push(`${nr},${nc}`);
        }
      }

      const remainingMines = cell.neighborCount - adjacentFlags;

      for (const key of unrevealed) {
        if (!constraintsByCell.has(key)) constraintsByCell.set(key, []);
        const prob = unrevealed.length === 0 ? 0 : Math.min(1, Math.max(0, remainingMines / unrevealed.length));
        constraintsByCell.get(key)!.push(prob);
      }
    }
  }

  const result = new Map<string, number>();
  for (const [key, probs] of constraintsByCell) {
    result.set(key, Math.max(...probs));
  }
  return result;
}

export function getProbBgColor(prob: number): string {
  const r = Math.round(180 * prob + 30);
  const g = Math.round(150 * (1 - prob) + 20);
  const b = 40;
  return `rgb(${r}, ${g}, ${b})`;
}
