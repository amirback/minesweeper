export type Rank = {
  name: string;
  icon: string;
  minElo: number;
  color: string;
  gradient: string;
};

export const RANKS: Rank[] = [
  { name: 'Bronze',        icon: '▪', minElo: 0,    color: '#4a7a3a', gradient: 'from-green-900 to-green-800' },
  { name: 'Silver',        icon: '▪', minElo: 1200, color: '#5a9048', gradient: 'from-green-800 to-green-700' },
  { name: 'Gold',          icon: '▪', minElo: 1500, color: '#6aaa58', gradient: 'from-green-700 to-green-600' },
  { name: 'Platinum',      icon: '▪', minElo: 1800, color: '#7abe68', gradient: 'from-green-600 to-green-500' },
  { name: 'Diamond',       icon: '▪', minElo: 2100, color: '#22c55e', gradient: 'from-green-500 to-green-400' },
  { name: 'Master',        icon: '▲', minElo: 2400, color: '#36d470', gradient: 'from-green-400 to-green-300' },
  { name: 'Grandmaster',   icon: '▲', minElo: 2800, color: '#4ade80', gradient: 'from-green-300 to-green-200' },
  { name: 'Quantum Miner', icon: '★', minElo: 3200, color: '#4ade80', gradient: 'from-green-200 to-green-100' },
];

export function getRank(elo: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (elo >= RANKS[i].minElo) return RANKS[i];
  }
  return RANKS[0];
}

export function getProgressToNextRank(elo: number): {
  current: Rank;
  next: Rank | null;
  progress: number;
} {
  const current = getRank(elo);
  const idx = RANKS.findIndex(r => r.name === current.name);
  const next = RANKS[idx + 1] ?? null;
  if (!next) return { current, next, progress: 100 };
  const progress = ((elo - current.minElo) / (next.minElo - current.minElo)) * 100;
  return { current, next, progress: Math.min(100, Math.round(progress)) };
}

const DIFF_MULT: Record<string, number> = { easy: 1, medium: 1.6, hard: 2.8 };
const REF_TIMES: Record<string, number>  = { easy: 120, medium: 300, hard: 600 };

export function calcEloGain(
  difficulty: 'easy' | 'medium' | 'hard',
  won: boolean,
  timeSeconds: number
): number {
  const m = DIFF_MULT[difficulty];
  if (!won) return -Math.round(15 * m);
  const base = 20 * m;
  const speedRatio = Math.max(0, (REF_TIMES[difficulty] - timeSeconds) / REF_TIMES[difficulty]);
  const timeBonus = speedRatio * 20 * m;
  return Math.round(base + timeBonus);
}
