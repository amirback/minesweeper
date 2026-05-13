export type Rank = {
  name: string;
  icon: string;
  minElo: number;
  color: string;
  gradient: string;
};

export const RANKS: Rank[] = [
  { name: 'Bronze',        icon: '🥉', minElo: 0,    color: '#cd7f32', gradient: 'from-amber-800 to-amber-600' },
  { name: 'Silver',        icon: '🥈', minElo: 1200, color: '#c0c0c0', gradient: 'from-slate-400 to-slate-300' },
  { name: 'Gold',          icon: '🥇', minElo: 1500, color: '#ffd700', gradient: 'from-yellow-500 to-yellow-300' },
  { name: 'Platinum',      icon: '💎', minElo: 1800, color: '#e0e8ff', gradient: 'from-blue-300 to-indigo-200' },
  { name: 'Diamond',       icon: '💠', minElo: 2100, color: '#7dd3fc', gradient: 'from-cyan-400 to-sky-300' },
  { name: 'Master',        icon: '🎯', minElo: 2400, color: '#f97316', gradient: 'from-orange-500 to-amber-400' },
  { name: 'Grandmaster',   icon: '👑', minElo: 2800, color: '#ef4444', gradient: 'from-red-500 to-rose-400' },
  { name: 'Quantum Miner', icon: '⚛️', minElo: 3200, color: '#a78bfa', gradient: 'from-violet-500 to-purple-400' },
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
