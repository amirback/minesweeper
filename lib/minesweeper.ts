import type { Board } from '@/types/game';

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function calcNeighborCounts(board: Board, rows: number, cols: number): Board {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) count++;
        }
      }
      board[r][c].neighborCount = count;
    }
  }
  return board;
}

export function createEmptyBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      row,
      col,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0,
    }))
  );
}

export function placeMines(
  board: Board,
  rows: number,
  cols: number,
  mines: number,
  safeRow: number,
  safeCol: number
): Board {
  const newBoard = board.map(r => r.map(c => ({ ...c, isMine: false, neighborCount: 0 })));

  const safeZone = new Set<string>();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const sr = safeRow + dr;
      const sc = safeCol + dc;
      if (sr >= 0 && sr < rows && sc >= 0 && sc < cols) {
        safeZone.add(`${sr},${sc}`);
      }
    }
  }

  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!newBoard[r][c].isMine && !safeZone.has(`${r},${c}`)) {
      newBoard[r][c].isMine = true;
      placed++;
    }
  }

  return calcNeighborCounts(newBoard, rows, cols);
}

function _buildSeededBoard(rows: number, cols: number, mines: number, seed: number, safeZone: Set<string>): Board {
  const newBoard = createEmptyBoard(rows, cols);
  const rng = mulberry32(seed);
  const positions: [number, number][] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (!safeZone.has(`${r},${c}`)) positions.push([r, c]);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  for (let i = 0; i < mines; i++) {
    const [r, c] = positions[i];
    newBoard[r][c].isMine = true;
  }
  return calcNeighborCounts(newBoard, rows, cols);
}

export function createDailyBoard(rows: number, cols: number, mines: number, seed: number): Board {
  const centerRow = Math.floor(rows / 2);
  const centerCol = Math.floor(cols / 2);

  // 5×5 safe zone so cascade from center is always limited
  const safeZone = new Set<string>();
  for (let dr = -2; dr <= 2; dr++)
    for (let dc = -2; dc <= 2; dc++) {
      const sr = centerRow + dr, sc = centerCol + dc;
      if (sr >= 0 && sr < rows && sc >= 0 && sc < cols) safeZone.add(`${sr},${sc}`);
    }

  // Find a seed offset where clicking center does NOT immediately win
  for (let offset = 0; offset < 50; offset++) {
    const board = _buildSeededBoard(rows, cols, mines, seed + offset, safeZone);
    const afterClick = revealCell(board, centerRow, centerCol, rows, cols);
    if (!checkWin(afterClick)) {
      // Return the board with center already pre-revealed — one-click win is now impossible
      return afterClick;
    }
  }
  return _buildSeededBoard(rows, cols, mines, seed, safeZone);
}

export function createBoardFromMines(rows: number, cols: number, minePositions: [number, number][]): Board {
  const board = createEmptyBoard(rows, cols);
  for (const [r, c] of minePositions) {
    if (r >= 0 && r < rows && c >= 0 && c < cols) board[r][c].isMine = true;
  }
  return calcNeighborCounts(board, rows, cols);
}

export function revealCell(board: Board, row: number, col: number, rows: number, cols: number): Board {
  const newBoard = board.map(r => r.map(c => ({ ...c })));
  if (newBoard[row][col].isRevealed || newBoard[row][col].isFlagged) return newBoard;

  const queue: [number, number][] = [[row, col]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
    if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged || newBoard[r][c].isMine) continue;

    visited.add(key);
    newBoard[r][c].isRevealed = true;

    if (newBoard[r][c].neighborCount === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) queue.push([r + dr, c + dc]);
        }
      }
    }
  }

  return newBoard;
}

export function chordReveal(board: Board, row: number, col: number, rows: number, cols: number): Board {
  const cell = board[row][col];
  if (!cell.isRevealed || cell.neighborCount === 0) return board;

  let flagCount = 0;
  const unrevealed: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (board[nr][nc].isFlagged) flagCount++;
      else if (!board[nr][nc].isRevealed) unrevealed.push([nr, nc]);
    }
  }

  if (flagCount !== cell.neighborCount) return board;

  let newBoard = board;
  for (const [nr, nc] of unrevealed) {
    newBoard = revealCell(newBoard, nr, nc, rows, cols);
  }
  return newBoard;
}

export function toggleFlag(board: Board, row: number, col: number): Board {
  const newBoard = board.map(r => r.map(c => ({ ...c })));
  if (!newBoard[row][col].isRevealed) {
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
  }
  return newBoard;
}

export function checkWin(board: Board): boolean {
  return board.every(row => row.every(cell => cell.isMine || cell.isRevealed));
}

export function revealAllMines(board: Board): Board {
  return board.map(row =>
    row.map(cell => ({ ...cell, isRevealed: cell.isMine ? true : cell.isRevealed }))
  );
}

export function getDailySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

export function getDailyDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
