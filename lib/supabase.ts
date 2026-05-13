import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export type GameResult = {
  id?: string;
  user_id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time_seconds: number;
  won: boolean;
  is_daily: boolean;
  daily_date?: string;
  created_at?: string;
};

export type LeaderboardEntry = {
  username: string;
  time_seconds: number;
  created_at: string;
};

export async function saveGameResult(result: Omit<GameResult, 'id' | 'created_at'>) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('game_results').insert(result).select().single();
  if (error) console.error('Error saving game result:', error);
  return data;
}

export async function getLeaderboard(difficulty: 'easy' | 'medium' | 'hard', isDaily = false, dailyDate?: string) {
  if (!supabase) return [];
  let query = supabase
    .from('leaderboard_view')
    .select('username, time_seconds, created_at')
    .eq('difficulty', difficulty)
    .eq('won', true)
    .eq('is_daily', isDaily)
    .order('time_seconds', { ascending: true })
    .limit(50);

  if (isDaily && dailyDate) {
    query = query.eq('daily_date', dailyDate);
  }

  const { data, error } = await query;
  if (error) console.error('Error fetching leaderboard:', error);
  return (data as LeaderboardEntry[]) ?? [];
}

export async function getUserStats(userId: string) {
  if (!supabase) return null;
  const { data } = await supabase
    .from('game_results')
    .select('difficulty, won, time_seconds')
    .eq('user_id', userId)
    .eq('is_daily', false);
  return data;
}
