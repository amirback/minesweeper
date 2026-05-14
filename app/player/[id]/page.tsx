'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { NavBar } from '@/components/NavBar';
import { RankBadge } from '@/components/RankBadge';
import { AvatarDisplay } from '@/components/Avatars';
import { useAuth } from '@/hooks/useAuth';
import {
  getPublicProfile, getUserStats, checkFriendship,
  sendFriendRequest, getFriendships,
} from '@/lib/supabase';
import type { GameResult } from '@/lib/supabase';

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'loading' | 'self';

export default function PlayerProfilePage() {
  const { user, signOut } = useAuth();
  const params = useParams<{ id: string }>();
  const targetId = params.id;

  const [profile, setProfile] = useState<{ id: string; username: string; elo: number; country: string; player_id: string } | null>(null);
  const [stats, setStats] = useState<{ total: number; wins: number; winRate: number } | null>(null);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('loading');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, user?.id]);

  const loadProfile = async () => {
    setLoading(true);
    const prof = await getPublicProfile(targetId);
    setProfile(prof);

    if (prof) {
      const raw = await getUserStats(targetId);
      if (raw) {
        const total = raw.length;
        const wins = raw.filter((g: GameResult) => g.won).length;
        setStats({ total, wins, winRate: total ? Math.round(wins / total * 100) : 0 });
      }
    }

    if (user && targetId === user.id) {
      setFriendStatus('self');
    } else if (user) {
      const status = await checkFriendship(user.id, targetId);
      setFriendStatus(status);
    } else {
      setFriendStatus('none');
    }

    setLoading(false);
  };

  const handleAddFriend = async () => {
    if (!user || !profile) return;
    setFriendStatus('loading');
    const { error } = await sendFriendRequest(user.id, profile.id);
    setFriendStatus(error ? 'none' : 'pending_sent');
  };

  const profileUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const section: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '20px 24px', width: '100%',
  };

  const label: React.CSSProperties = {
    color: 'var(--text-2)', fontSize: 12, fontWeight: 700,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4,
  };

  const value: React.CSSProperties = {
    color: 'var(--text)', fontSize: 24, fontWeight: 800,
    fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: 2,
  };

  const renderFriendButton = () => {
    if (friendStatus === 'self') return null;
    if (!user) return (
      <Link href="/game" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid var(--border-hi)', color: 'var(--green-hi)', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>
        Войдите чтобы добавить
      </Link>
    );
    if (friendStatus === 'loading') return <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>...</span>;
    if (friendStatus === 'accepted') return (
      <span style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid var(--border-hi)', color: 'var(--green-hi)', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 800 }}>
        ✓ Уже друзья
      </span>
    );
    if (friendStatus === 'pending_sent') return (
      <span style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.4)', color: 'var(--gold)', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 800 }}>
        Запрос отправлен
      </span>
    );
    if (friendStatus === 'pending_received') return (
      <Link href="/friends" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid var(--border-hi)', color: 'var(--green-hi)', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 800, textDecoration: 'none' }}>
        Принять запрос →
      </Link>
    );
    return (
      <button onClick={handleAddFriend} style={{
        background: 'var(--green)', color: '#0b1a08', border: 'none',
        borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 800, cursor: 'pointer',
      }}>
        + Добавить в друзья
      </button>
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar user={user} onSignOut={signOut} onOpenAuth={() => {}} />

      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '24px 16px 60px', gap: 20, maxWidth: 600, margin: '0 auto', width: '100%',
      }}>
        {loading ? (
          <div style={{ color: 'var(--text-dim)', fontSize: 14 }}>Загрузка...</div>
        ) : !profile ? (
          <div style={{ ...section, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-2)' }}>Профиль не найден</p>
            <Link href="/game" style={{ color: 'var(--green-hi)', fontSize: 13 }}>← На главную</Link>
          </div>
        ) : (
          <>
            {/* Avatar + name card */}
            <div style={{ ...section, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--border-hi)', boxShadow: '0 0 20px rgba(34,197,94,0.25)', flexShrink: 0 }}>
                <AvatarDisplay id={0} size={80} />
              </div>

              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ color: 'var(--text)', fontSize: 22, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>
                  {profile.username}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <RankBadge elo={profile.elo ?? 1000} size="sm" />
                </div>
                {profile.country && (
                  <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>{profile.country}</div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                {renderFriendButton()}
                <button onClick={copyLink} style={{
                  background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-dim)',
                  borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer',
                }}>
                  {copied ? '✓ Скопировано' : '🔗 Поделиться'}
                </button>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div style={section}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={label}>Игр</div>
                    <div style={value}>{stats.total}</div>
                  </div>
                  <div>
                    <div style={label}>Побед</div>
                    <div style={{ ...value, color: 'var(--green-hi)' }}>{stats.wins}</div>
                  </div>
                  <div>
                    <div style={label}>Win Rate</div>
                    <div style={{ ...value, color: stats.winRate >= 50 ? 'var(--green-hi)' : 'var(--gold)' }}>{stats.winRate}%</div>
                  </div>
                </div>
                <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />
                <div>
                  <div style={label}>ELO</div>
                  <div style={{ ...value, color: 'var(--gold)', fontSize: 28 }}>{profile.elo ?? 1000}</div>
                </div>
              </div>
            )}

            {/* Player ID */}
            {profile.player_id && (
              <div style={section}>
                <div style={label}>Player ID</div>
                <code style={{
                  background: 'rgba(34,197,94,0.10)', border: '1px solid var(--border-hi)',
                  borderRadius: 4, padding: '6px 12px', fontSize: 13,
                  color: 'var(--green-hi)', letterSpacing: 2, fontFamily: 'monospace',
                  display: 'inline-block',
                }}>
                  {profile.player_id.slice(0, 12)}
                </code>
              </div>
            )}
          </>
        )}

        <Link href="/game" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: 13 }}>
          ← На главную
        </Link>
      </main>
    </div>
  );
}
