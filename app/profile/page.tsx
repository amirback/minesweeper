'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NavWithAuth } from '@/components/NavWithAuth';
import { RankBadge } from '@/components/RankBadge';
import { AvatarDisplay } from '@/components/Avatars';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/contexts/LanguageContext';
import { getUserProfile, getUserStats } from '@/lib/supabase';
import type { GameResult } from '@/lib/supabase';

const ELO_KEY    = 'minetrainer_elo';
const AVATAR_KEY = 'saper_avatar';

type Difficulty = 'easy' | 'medium' | 'hard';

function calcStats(data: (GameResult & { created_at: string })[]) {
  const all = data ?? [];
  const total = all.length;
  const wins  = all.filter(g => g.won).length;
  const winRate = total ? Math.round((wins / total) * 100) : 0;

  const best: Record<Difficulty, number | null> = { easy: null, medium: null, hard: null };
  (['easy', 'medium', 'hard'] as Difficulty[]).forEach(d => {
    const times = all.filter(g => g.won && g.difficulty === d).map(g => g.time_seconds);
    best[d] = times.length ? Math.min(...times) : null;
  });

  const acc = all.length
    ? Math.round((all.filter(g => g.won).length / all.length) * 100)
    : 0;

  const recent = all.slice(0, 10);
  return { total, wins, winRate, best, acc, recent };
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { lang } = useLang();

  const [profile, setProfile] = useState<{ username: string; elo: number; country: string } | null>(null);
  const [stats, setStats]     = useState<ReturnType<typeof calcStats> | null>(null);
  const [avatarId, setAvatarId] = useState(0);
  const [elo, setElo]           = useState(1000);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAvatarId(parseInt(localStorage.getItem(AVATAR_KEY) ?? '0', 10));
      setElo(parseInt(localStorage.getItem(ELO_KEY) ?? '1000', 10));
    }
    if (!user) { setLoading(false); return; }
    Promise.all([getUserProfile(user.id), getUserStats(user.id)]).then(([prof, raw]) => {
      setProfile(prof);
      if (raw) setStats(calcStats(raw));
      setLoading(false);
    });
  }, [user]);

  const tr = {
    title:    lang === 'ru' ? 'Мой профиль' : lang === 'kz' ? 'Менің профилім' : 'My Profile',
    signIn:   lang === 'ru' ? 'Войдите чтобы увидеть профиль' : lang === 'kz' ? 'Профильді көру үшін кіріңіз' : 'Sign in to view profile',
    games:    lang === 'ru' ? 'Игр' : lang === 'kz' ? 'Ойын' : 'Games',
    wins:     lang === 'ru' ? 'Победы' : lang === 'kz' ? 'Жеңіс' : 'Wins',
    winRate:  lang === 'ru' ? 'Процент побед' : lang === 'kz' ? 'Жеңіс %' : 'Win Rate',
    bestTime: lang === 'ru' ? 'Лучшее время' : lang === 'kz' ? 'Үздік уақыт' : 'Best Time',
    activity: lang === 'ru' ? 'Последние игры' : lang === 'kz' ? 'Соңғы ойындар' : 'Recent Games',
    noGames:  lang === 'ru' ? 'Игр пока нет' : lang === 'kz' ? 'Ойын жоқ' : 'No games yet',
    edit:     lang === 'ru' ? 'Редактировать' : lang === 'kz' ? 'Өңдеу' : 'Edit Profile',
    playerId: lang === 'ru' ? 'ID игрока' : lang === 'kz' ? 'Ойыншы ID' : 'Player ID',
    daily:    lang === 'ru' ? 'Daily' : 'Daily',
  };

  const section: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '20px 24px', width: '100%',
  };
  const label: React.CSSProperties = { color: 'var(--text-2)', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 };
  const value: React.CSSProperties = { color: 'var(--text)', fontSize: 24, fontWeight: 800, fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: 2 };

  const playerShortId = user ? user.id.replace(/-/g, '').slice(0, 12).toUpperCase() : '';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavWithAuth user={user} onSignOut={signOut} />

      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '24px 16px 60px', gap: 20, maxWidth: 620, margin: '0 auto', width: '100%',
      }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          fontSize: 'clamp(30px,7vw,44px)', letterSpacing: 5, color: 'var(--green-hi)',
        }}>
          {tr.title}
        </h1>

        {!user ? (
          <div style={{ ...section, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>{tr.signIn}</p>
          </div>
        ) : loading ? (
          <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>...</div>
        ) : (
          <>
            {/* ── Avatar + name card ── */}
            <div style={{ ...section, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--border-hi)', boxShadow: '0 0 20px rgba(34,197,94,0.25)' }}>
                  <AvatarDisplay id={avatarId} size={80} />
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ color: 'var(--text)', fontSize: 22, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>
                  {profile?.username ?? user.email?.split('@')[0] ?? 'Player'}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <RankBadge elo={profile?.elo ?? elo} size="sm" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid var(--border-hi)', borderRadius: 4, padding: '4px 10px', fontSize: 12, color: 'var(--green-hi)', letterSpacing: 2, fontFamily: 'monospace' }}>
                    {playerShortId}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(playerShortId)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 13 }}
                    title="Copy ID">
                    📋
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/settings" style={{
                  background: 'rgba(34,197,94,0.12)', border: '1px solid var(--border-hi)',
                  color: 'var(--green-hi)', borderRadius: 6, padding: '8px 16px',
                  fontSize: 13, fontWeight: 800, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {tr.edit}
                </Link>
                {user && (
                  <Link href={`/player/${user.id}`} style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
                    color: 'var(--text-2)', borderRadius: 6, padding: '8px 16px',
                    fontSize: 13, fontWeight: 700, textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    Публичный профиль
                  </Link>
                )}
                <button onClick={signOut} style={{
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  color: '#ef4444', borderRadius: 6, padding: '8px 16px',
                  fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {lang === 'ru' ? 'Выйти' : lang === 'kz' ? 'Шығу' : 'Sign Out'}
                </button>
              </div>
            </div>

            {/* ── Stats row ── */}
            {stats && (
              <div style={{ ...section }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center' }}>
                  <div>
                    <div style={label}>{tr.games}</div>
                    <div style={value}>{stats.total}</div>
                  </div>
                  <div>
                    <div style={label}>{tr.wins}</div>
                    <div style={{ ...value, color: 'var(--green-hi)' }}>{stats.wins}</div>
                  </div>
                  <div>
                    <div style={label}>{tr.winRate}</div>
                    <div style={{ ...value, color: stats.winRate >= 50 ? 'var(--green-hi)' : 'var(--gold)' }}>{stats.winRate}%</div>
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />

                {/* ELO */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={label}>ELO</div>
                    <div style={{ ...value, color: 'var(--gold)', fontSize: 28 }}>{profile?.elo ?? elo}</div>
                  </div>
                  {profile?.country && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={label}>{lang === 'ru' ? 'Страна' : 'Country'}</div>
                      <div style={{ color: 'var(--text)', fontSize: 20, fontWeight: 800 }}>{profile.country}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Best times ── */}
            {stats && (
              <div style={section}>
                <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14, color: 'var(--text-2)' }}>
                  {tr.bestTime}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => {
                    const best = stats.best[d];
                    return (
                      <div key={d} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '10px 14px' }}>
                        <span style={{ color: 'var(--text-2)', fontWeight: 700, fontSize: 14, textTransform: 'capitalize' }}>{d}</span>
                        <span style={{ color: best ? 'var(--green-hi)' : 'var(--text-dim)', fontWeight: 800, fontSize: 18, fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: 2 }}>
                          {best ? fmt(best) : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Recent games ── */}
            {stats && (
              <div style={section}>
                <div style={{ color: 'var(--text-2)', fontWeight: 800, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
                  {tr.activity}
                </div>
                {stats.recent.length === 0 ? (
                  <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>{tr.noGames}</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {stats.recent.map((g, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', fontSize: 13 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 16 }}>{g.won ? '✅' : '💥'}</span>
                          <span style={{ color: 'var(--text-2)', textTransform: 'capitalize', fontWeight: 700 }}>{g.difficulty}</span>
                          {g.is_daily && <span style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--gold)', borderRadius: 3, padding: '1px 6px', fontSize: 11, fontWeight: 800 }}>{tr.daily}</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {g.won && <span style={{ color: 'var(--green-hi)', fontWeight: 800, fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: 1, fontSize: 16 }}>{fmt(g.time_seconds)}</span>}
                          <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>
                            {new Date(g.created_at!).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'kz' ? 'kk-KZ' : 'en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <Link href="/game" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: 13 }}>
          ← {lang === 'ru' ? 'Назад к игре' : lang === 'kz' ? 'Ойынға оралу' : 'Back to game'}
        </Link>
      </main>
    </div>
  );
}
