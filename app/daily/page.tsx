'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';
import { Board } from '@/components/game/Board';
import { GameHeader } from '@/components/game/GameHeader';
import { GameOverlay } from '@/components/game/GameOverlay';
import { Leaderboard } from '@/components/Leaderboard';
import { NavBar } from '@/components/NavBar';
import { AuthModal } from '@/components/AuthModal';
import { getDailyDateString } from '@/lib/minesweeper';

const DAILY_WON_AT_KEY = 'saper_daily_won_at';
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSecondsLeft(wonAt: number) {
  return Math.max(0, Math.floor((wonAt + COOLDOWN_MS - Date.now()) / 1000));
}

function Countdown({ wonAt }: { wonAt: number }) {
  const [secs, setSecs] = useState(() => getSecondsLeft(wonAt));
  useEffect(() => {
    const t = setInterval(() => setSecs(getSecondsLeft(wonAt)), 1000);
    return () => clearInterval(t);
  }, [wonAt]);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const f = (n: number) => String(n).padStart(2, '0');
  return (
    <span style={{ color: 'var(--gold)', fontFamily: 'monospace', fontWeight: 800, fontSize: 28, letterSpacing: 3 }}>
      {f(h)}:{f(m)}:{f(s)}
    </span>
  );
}

export default function DailyPage() {
  const { user, signOut, signInWithEmail, signUpWithEmail } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [wonAt, setWonAt] = useState<number | null>(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  const today = getDailyDateString();

  useEffect(() => {
    const stored = parseInt(localStorage.getItem(DAILY_WON_AT_KEY) ?? '0');
    if (stored && Date.now() - stored < COOLDOWN_MS) {
      setWonAt(stored);
      setCooldownActive(true);
    }
  }, []);

  const {
    board, status, difficulty, flagsPlaced, flagsUsed, timer,
    showProbability, probabilities, flagMode, minesTotal, maxFlags,
    dailyCompleted, eloGain,
    setFlagMode, resetGame, handleCellClick, handleCellRightClick, toggleProbability,
  } = useGame('medium', { mode: 'daily', userId: user?.id });

  useEffect(() => {
    if (status === 'won' || dailyCompleted) {
      const now = Date.now();
      localStorage.setItem(DAILY_WON_AT_KEY, String(now));
      setWonAt(now);
      setCooldownActive(true);
    }
  }, [status, dailyCompleted]);

  const section: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '24px 28px', width: '100%', maxWidth: 520,
    textAlign: 'center',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar user={user} onSignOut={signOut} onOpenAuth={() => setAuthOpen(true)} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 40px', gap: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', Impact, sans-serif",
            fontSize: 'clamp(28px, 7vw, 40px)', letterSpacing: 4,
            color: 'var(--text)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10, marginBottom: 4,
          }}>
            Daily Challenge
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
            {today} · Одна карта для всех · Средняя сложность
          </p>
        </div>

        {cooldownActive && status !== 'won' && wonAt ? (
          /* ── Cooldown locked ── */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%' }}>
            <div style={section}>
              <h2 style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: 28, letterSpacing: 3, color: 'var(--green-hi)', marginBottom: 8,
              }}>
                Уже сыграно!
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 16 }}>
                Следующая попытка через:
              </p>
              <Countdown wonAt={wonAt} />
              <div style={{ marginTop: 24 }}>
                <Link href="/game" style={{
                  display: 'inline-block', background: 'var(--green)', color: '#0b1a08',
                  borderRadius: 4, padding: '12px 28px', fontSize: 15, fontWeight: 800,
                  letterSpacing: 2, textDecoration: 'none',
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                }}>
                  В ГЛАВНОЕ МЕНЮ
                </Link>
              </div>
            </div>

            <div style={{ width: '100%', maxWidth: 600 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                🏆 Сегодняшний рейтинг
              </h2>
              <Leaderboard isDaily={true} dailyDate={today} currentUserId={user?.id} />
            </div>
          </div>
        ) : (
          /* ── Game board ── */
          <>
            <div style={{ width: '100%', maxWidth: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <GameHeader
                status={status} timer={timer} flagsPlaced={flagsPlaced} flagsUsed={flagsUsed}
                minesTotal={minesTotal} maxFlags={maxFlags}
                difficulty={difficulty} showProbability={showProbability} flagMode={flagMode}
                mode="daily"
                onReset={() => {}}
                onDifficultyChange={() => {}}
                onToggleProbability={toggleProbability}
                onToggleFlagMode={() => setFlagMode(f => !f)}
              />
              <Board
                board={board} probabilities={probabilities} showProbability={showProbability}
                onCellClick={handleCellClick} onCellRightClick={handleCellRightClick}
                shake={status === 'lost'}
              />
            </div>

            {(dailyCompleted || status === 'won') && (
              <div style={{ width: '100%', maxWidth: 600, marginTop: 8 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-2)', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
                  Сегодняшний рейтинг
                </h2>
                <Leaderboard isDaily={true} dailyDate={today} currentUserId={user?.id} />
              </div>
            )}

            <Link href="/game" style={{ textDecoration: 'none', marginTop: 8 }}>
              <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>← Назад к игре</span>
            </Link>
          </>
        )}
      </main>

      <GameOverlay
        status={status} timer={timer} difficulty={difficulty}
        mode="daily" eloGain={eloGain}
        onPlayAgain={() => resetGame()}
      />

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSignIn={async (email, password) => {
            const result = await signInWithEmail(email, password);
            if (!result.error) setAuthOpen(false);
            return { error: result.error as Error | null };
          }}
          onSignUp={async (email, password, username) => {
            const result = await signUpWithEmail(email, password, username);
            return { error: result.error as Error | null };
          }}
        />
      )}
    </div>
  );
}
