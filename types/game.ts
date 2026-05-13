export type Difficulty = 'easy' | 'medium' | 'hard';

export type DifficultyConfig = {
  rows: number;
  cols: number;
  mines: number;
  label: string;
};

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: { rows: 9, cols: 9, mines: 10, label: 'Easy' },
  medium: { rows: 16, cols: 16, mines: 40, label: 'Medium' },
  hard: { rows: 16, cols: 30, mines: 99, label: 'Hard' },
};

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export type Cell = {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
};

export type Board = Cell[][];
