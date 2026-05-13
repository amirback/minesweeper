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
  elo_delta?: number;
  created_at?: string;
};

export type LeaderboardEntry = {
  username: string;
  time_seconds: number;
  created_at: string;
  country?: string;
  elo?: number;
};

export type LiveFeedEntry = {
  username: string;
  difficulty: string;
  time_seconds: number;
  won: boolean;
  country?: string;
  created_at: string;
};

export async function saveGameResult(result: Omit<GameResult, 'id' | 'created_at'>) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('game_results').insert(result).select().single();
  if (error) console.error('Error saving game result:', error);

  // Update ELO in profile
  if (!error && result.elo_delta && result.user_id) {
    await supabase.rpc('update_elo', {
      user_id_param: result.user_id,
      elo_delta: result.elo_delta,
    });
  }
  return data;
}

export async function getLeaderboard(
  difficulty: 'easy' | 'medium' | 'hard',
  isDaily = false,
  dailyDate?: string,
  country?: string
) {
  if (!supabase) return [];
  let query = supabase
    .from('leaderboard_view')
    .select('username, time_seconds, created_at, country, elo')
    .eq('difficulty', difficulty)
    .eq('won', true)
    .eq('is_daily', isDaily)
    .order('time_seconds', { ascending: true })
    .limit(50);

  if (isDaily && dailyDate) query = query.eq('daily_date', dailyDate);
  if (country) query = query.eq('country', country);

  const { data, error } = await query;
  if (error) console.error('Error fetching leaderboard:', error);
  return (data as LeaderboardEntry[]) ?? [];
}

export async function getCountryLeaderboard() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('country_stats_view')
    .select('country, total_wins, avg_time')
    .order('total_wins', { ascending: false })
    .limit(20);
  if (error) console.error(error);
  return data ?? [];
}

export async function getLiveFeed(limit = 15): Promise<LiveFeedEntry[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('leaderboard_view')
    .select('username, difficulty, time_seconds, won, country, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data as LiveFeedEntry[]) ?? [];
}

export async function getUserProfile(userId: string) {
  if (!supabase) return null;
  const { data } = await supabase
    .from('profiles')
    .select('username, elo, country')
    .eq('id', userId)
    .single();
  return data as { username: string; elo: number; country: string } | null;
}

export async function updateUserCountry(userId: string, country: string) {
  if (!supabase) return;
  await supabase.from('profiles').update({ country }).eq('id', userId);
}

export function subscribeToLiveFeed(
  onInsert: (entry: LiveFeedEntry) => void
) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel('live-completions')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'game_results' },
      async (payload) => {
        const row = payload.new as GameResult & { created_at: string };
        const { data: profile } = await supabase!
          .from('profiles')
          .select('username, country')
          .eq('id', row.user_id)
          .single();
        if (profile) {
          onInsert({
            username: profile.username,
            difficulty: row.difficulty,
            time_seconds: row.time_seconds,
            won: row.won,
            country: profile.country,
            created_at: row.created_at,
          });
        }
      }
    )
    .subscribe();

  return () => supabase!.removeChannel(channel);
}
