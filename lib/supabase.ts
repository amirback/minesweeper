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
  user_id?: string;
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
    .select('user_id, username, time_seconds, created_at, country, elo')
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

export async function getPublicProfile(userId: string) {
  if (!supabase) return null;
  const { data } = await supabase
    .from('profiles')
    .select('id, username, elo, country, player_id')
    .eq('id', userId)
    .single();
  return data as { id: string; username: string; elo: number; country: string; player_id: string } | null;
}

export async function checkFriendship(myId: string, targetId: string): Promise<'none' | 'pending_sent' | 'pending_received' | 'accepted'> {
  if (!supabase) return 'none';
  const { data } = await supabase
    .from('friendships')
    .select('id, status, requester_id, addressee_id')
    .or(`and(requester_id.eq.${myId},addressee_id.eq.${targetId}),and(requester_id.eq.${targetId},addressee_id.eq.${myId})`)
    .maybeSingle();
  if (!data) return 'none';
  if (data.status === 'accepted') return 'accepted';
  if (data.requester_id === myId) return 'pending_sent';
  return 'pending_received';
}

export async function updateUserCountry(userId: string, country: string) {
  if (!supabase) return;
  await supabase.from('profiles').update({ country }).eq('id', userId);
}

export async function updateUsername(userId: string, username: string) {
  if (!supabase) return { error: 'not configured' };
  const { error } = await supabase
    .from('profiles')
    .update({ username })
    .eq('id', userId);
  return { error };
}

export async function getUserStats(userId: string) {
  if (!supabase) return null;
  const { data } = await supabase
    .from('game_results')
    .select('difficulty, time_seconds, won, created_at, is_daily')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(300);
  return data as (GameResult & { created_at: string })[] | null;
}

// ─── Friends & Chat ────────────────────────────────────────────────────────

export async function findPlayerByShortId(shortId: string) {
  if (!supabase) return null;
  const clean = shortId.toUpperCase().replace(/[^A-F0-9]/g, '');
  if (clean.length < 8) return null;
  const { data } = await supabase
    .from('profiles')
    .select('id, username')
    .like('player_id', clean + '%')
    .maybeSingle();
  return data as { id: string; username: string } | null;
}

export async function sendFriendRequest(myId: string, targetId: string) {
  if (!supabase) return { error: 'not configured' };
  const { error } = await supabase.from('friendships').insert({ requester_id: myId, addressee_id: targetId });
  return { error };
}

export async function respondToFriendRequest(requestId: string, accept: boolean) {
  if (!supabase) return { error: 'not configured' };
  const { error } = await supabase
    .from('friendships')
    .update({ status: accept ? 'accepted' : 'declined' })
    .eq('id', requestId);
  return { error };
}

export type FriendEntry = {
  id: string; status: string;
  requester_id: string; addressee_id: string;
  requester_name: string; addressee_name: string;
};

export async function getFriendships(myId: string): Promise<FriendEntry[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('friendships')
    .select('id, status, requester_id, addressee_id, req:profiles!friendships_requester_id_fkey(username), adr:profiles!friendships_addressee_id_fkey(username)')
    .or(`requester_id.eq.${myId},addressee_id.eq.${myId}`)
    .neq('status', 'declined');
  if (!data) return [];
  return data.map((r: any) => ({
    id: r.id, status: r.status,
    requester_id: r.requester_id, addressee_id: r.addressee_id,
    requester_name: r.req?.username ?? '?', addressee_name: r.adr?.username ?? '?',
  }));
}

export type ChatMessage = {
  id: string; from_id: string; to_id: string;
  content: string; created_at: string; from_name?: string;
};

export async function getMessages(myId: string, friendId: string): Promise<ChatMessage[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('messages')
    .select('id, from_id, to_id, content, created_at, sender:profiles!messages_from_id_fkey(username)')
    .or(`and(from_id.eq.${myId},to_id.eq.${friendId}),and(from_id.eq.${friendId},to_id.eq.${myId})`)
    .order('created_at', { ascending: true })
    .limit(100);
  if (!data) return [];
  return data.map((r: any) => ({
    id: r.id, from_id: r.from_id, to_id: r.to_id,
    content: r.content, created_at: r.created_at,
    from_name: r.sender?.username,
  }));
}

export async function sendMessage(fromId: string, toId: string, content: string) {
  if (!supabase) return { error: 'not configured' };
  const { error } = await supabase.from('messages').insert({ from_id: fromId, to_id: toId, content });
  return { error };
}

export function subscribeToMessages(
  myId: string,
  onInsert: (msg: ChatMessage) => void
) {
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`messages-${myId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `to_id=eq.${myId}` },
      async (payload) => {
        const row = payload.new as any;
        const { data: profile } = await supabase!.from('profiles').select('username').eq('id', row.from_id).single();
        onInsert({ id: row.id, from_id: row.from_id, to_id: row.to_id, content: row.content, created_at: row.created_at, from_name: profile?.username });
      })
    .subscribe();
  return () => supabase!.removeChannel(channel);
}

// ─── Duel Matches ─────────────────────────────────────────────────────────────

export type Match = {
  id: string;
  player1_id: string;
  player2_id: string | null;
  player1_name: string | null;
  player2_name: string | null;
  status: 'waiting' | 'placing' | 'playing' | 'finished';
  player1_mines: string | null;
  player2_mines: string | null;
  player1_time: number | null;
  player2_time: number | null;
  winner_id: string | null;
  created_at: string;
};

export async function createMatch(player1Id: string, player1Name: string): Promise<Match | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('matches')
    .insert({ player1_id: player1Id, player1_name: player1Name, status: 'waiting' })
    .select().single();
  if (error) { console.error('createMatch', error); return null; }
  return data as Match;
}

export async function joinMatch(matchId: string, player2Id: string, player2Name: string): Promise<Match | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('matches')
    .update({ player2_id: player2Id, player2_name: player2Name, status: 'placing' })
    .eq('id', matchId).eq('status', 'waiting').select().single();
  if (error) { console.error('joinMatch', error); return null; }
  return data as Match;
}

export async function submitMines(matchId: string, playerNum: 1 | 2, mines: [number, number][], currentMatch: Match): Promise<void> {
  if (!supabase) return;
  const minesJson = JSON.stringify(mines);
  const updates: Record<string, unknown> = playerNum === 1
    ? { player1_mines: minesJson }
    : { player2_mines: minesJson };
  const opponentMines = playerNum === 1 ? currentMatch.player2_mines : currentMatch.player1_mines;
  if (opponentMines) updates.status = 'playing';
  await supabase.from('matches').update(updates).eq('id', matchId);
}

export async function recordMatchTime(matchId: string, playerNum: 1 | 2, time: number, currentMatch: Match): Promise<void> {
  if (!supabase) return;
  const updates: Record<string, unknown> = playerNum === 1
    ? { player1_time: time } : { player2_time: time };
  const otherTime = playerNum === 1 ? currentMatch.player2_time : currentMatch.player1_time;
  if (otherTime !== null && otherTime !== undefined) {
    const win = playerNum === 1 ? time < otherTime : time < otherTime;
    updates.winner_id = win
      ? (playerNum === 1 ? currentMatch.player1_id : currentMatch.player2_id)
      : (playerNum === 1 ? currentMatch.player2_id : currentMatch.player1_id);
    updates.status = 'finished';
  }
  await supabase.from('matches').update(updates).eq('id', matchId);
}

export async function getMatch(matchId: string): Promise<Match | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('matches').select('*').eq('id', matchId).single();
  return data as Match | null;
}

export function subscribeToMatch(matchId: string, onUpdate: (m: Match) => void) {
  if (!supabase) return () => {};
  const channel = supabase.channel(`match-${matchId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
      (payload) => onUpdate(payload.new as Match))
    .subscribe();
  return () => supabase!.removeChannel(channel);
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
