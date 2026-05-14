'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { NavBar } from '@/components/NavBar';
import {
  getMatch, joinMatch, submitMines, recordMatchTime, subscribeToMatch,
  getUserProfile,
  type Match,
} from '@/lib/supabase';
import {
  createBoardFromMines, revealCell, toggleFlag, checkWin, revealAllMines, formatTime,
} from '@/lib/minesweeper';
import type { Board } from '@/types/game';

const ROWS = 16, COLS = 16, MINES = 40;

// ── Mine Placement Grid ───────────────────────────────────────────────────────
function PlacementGrid({ mines, onToggle }: { mines: Set<string>; onToggle: (r: number, c: number) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: 2, userSelect: 'none' }}>
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => {
          const isMine = mines.has(`${r},${c}`);
          return (
            <div
              key={`${r}-${c}`}
              onClick={() => onToggle(r, c)}
              style={{
                width: 26, height: 26, borderRadius: 3,
                background: isMine ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.08)',
                border: `1px solid ${isMine ? '#ef4444' : 'rgba(255,255,255,0.07)'}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, transition: 'all 0.1s',
              }}
            >
              {isMine ? '💣' : ''}
            </div>
          );
        })
      )}
    </div>
  );
}

// ── Play Board ────────────────────────────────────────────────────────────────
const NUM_COLORS: Record<number, string> = {
  1: '#3b82f6', 2: '#22c55e', 3: '#ef4444', 4: '#7c3aed',
  5: '#dc2626', 6: '#0891b2', 7: '#1e293b', 8: '#94a3b8',
};

function PlayGrid({ board, onReveal, onFlag }: {
  board: Board;
  onReveal: (r: number, c: number) => void;
  onFlag: (r: number, c: number) => void;
}) {
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: 2 }}
      onContextMenu={e => e.preventDefault()}
    >
      {board.map((row, r) =>
        row.map((cell, c) => {
          let bg = 'rgba(34,197,94,0.08)';
          let border = 'rgba(255,255,255,0.07)';
          if (cell.isRevealed) { bg = cell.isMine ? '#ef444466' : 'rgba(0,0,0,0.4)'; border = 'transparent'; }
          if (cell.isFlagged) { bg = 'rgba(239,68,68,0.2)'; border = '#ef4444'; }
          return (
            <div
              key={`${r}-${c}`}
              onClick={() => onReveal(r, c)}
              onContextMenu={(e) => { e.preventDefault(); onFlag(r, c); }}
              style={{ width: 26, height: 26, borderRadius: 2, background: bg, border: `1px solid ${border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: cell.neighborCount > 0 ? NUM_COLORS[cell.neighborCount] ?? '#fff' : 'transparent' }}
            >
              {cell.isRevealed
                ? (cell.isMine ? '💣' : cell.neighborCount > 0 ? cell.neighborCount : '')
                : cell.isFlagged ? '🚩' : ''}
            </div>
          );
        })
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DuelPage({ params }: { params: { id: string } }) {
  const { user, signOut } = useAuth();
  const matchId = params.id;

  const [match, setMatch]         = useState<Match | null>(null);
  const [phase, setPhase]         = useState<'loading' | 'waiting' | 'placing' | 'playing' | 'finished'>('loading');
  const [playerNum, setPlayerNum] = useState<1 | 2 | null>(null);
  const [myMines, setMyMines]     = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied]       = useState(false);

  // Play state
  const [board, setBoard]     = useState<Board | null>(null);
  const [status, setStatus]   = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [timer, setTimer]     = useState(0);
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef              = useRef<number | null>(null);
  const finishedRef           = useRef(false);

  const matchUrl = typeof window !== 'undefined' ? `${window.location.origin}/duel/${matchId}` : '';

  // Load match on mount
  useEffect(() => {
    loadMatch();
    const unsub = subscribeToMatch(matchId, (updated) => {
      setMatch(updated);
      applyMatch(updated);
    });
    return () => { unsub(); if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  // Detect player number when user loads
  useEffect(() => {
    if (!match || !user) return;
    if (match.player1_id === user.id) setPlayerNum(1);
    else if (match.player2_id === user.id) setPlayerNum(2);
    else if (!match.player2_id && match.status === 'waiting') {
      handleJoin();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.id, user?.id]);

  const loadMatch = async () => {
    const m = await getMatch(matchId);
    if (m) { setMatch(m); applyMatch(m); }
  };

  const applyMatch = (m: Match) => {
    if (m.status === 'waiting') setPhase('waiting');
    else if (m.status === 'placing') setPhase('placing');
    else if (m.status === 'playing') setPhase('playing');
    else setPhase('finished');
  };

  const handleJoin = async () => {
    if (!user) return;
    const prof = await getUserProfile(user.id);
    const name = prof?.username ?? user.email?.split('@')[0] ?? 'Player';
    const updated = await joinMatch(matchId, user.id, name);
    if (updated) { setMatch(updated); setPlayerNum(2); applyMatch(updated); }
  };

  // Start play board when phase transitions to 'playing'
  useEffect(() => {
    if (phase !== 'playing' || !match || !playerNum || board || finishedRef.current) return;
    const opponentMinesJson = playerNum === 1 ? match.player2_mines : match.player1_mines;
    if (!opponentMinesJson) return;
    const mineArr: [number, number][] = JSON.parse(opponentMinesJson);
    const newBoard = createBoardFromMines(ROWS, COLS, mineArr);
    setBoard(newBoard);
    setStatus('playing');
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (startRef.current) setTimer(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
  }, [phase, match, playerNum, board]);

  const handleReveal = useCallback((r: number, c: number) => {
    if (!board || status !== 'playing' || finishedRef.current) return;
    if (board[r][c].isRevealed || board[r][c].isFlagged) return;
    if (board[r][c].isMine) {
      clearInterval(timerRef.current!);
      setBoard(revealAllMines(board));
      setStatus('lost');
      return;
    }
    const newBoard = revealCell(board, r, c, ROWS, COLS);
    setBoard(newBoard);
    if (checkWin(newBoard)) {
      clearInterval(timerRef.current!);
      finishedRef.current = true;
      const t = Math.floor((Date.now() - startRef.current!) / 1000);
      setStatus('won');
      setTimer(t);
      if (playerNum && match) recordMatchTime(matchId, playerNum, t, match);
    }
  }, [board, status, playerNum, match, matchId]);

  const handleFlag = useCallback((r: number, c: number) => {
    if (!board || status !== 'playing') return;
    setBoard(toggleFlag(board, r, c));
  }, [board, status]);

  const toggleMine = (r: number, c: number) => {
    if (submitted) return;
    const key = `${r},${c}`;
    setMyMines(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else if (next.size < MINES) next.add(key);
      return next;
    });
  };

  const handleSubmitMines = async () => {
    if (!match || !playerNum || myMines.size !== MINES) return;
    const mineArr: [number, number][] = Array.from(myMines).map(k => {
      const [r, c] = k.split(',').map(Number);
      return [r, c];
    });
    await submitMines(matchId, playerNum, mineArr, match);
    setSubmitted(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(matchUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Render ──
  const card: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '20px 24px',
  };

  const renderContent = () => {
    if (phase === 'loading') return <div style={{ color: 'var(--text-dim)' }}>Загрузка матча...</div>;

    if (phase === 'waiting') return (
      <div style={{ ...card, textAlign: 'center', maxWidth: 440 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚔️</div>
        <h2 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 26, letterSpacing: 3, color: 'var(--gold)', marginBottom: 8 }}>
          ОЖИДАНИЕ ПРОТИВНИКА
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 20 }}>
          Поделись ссылкой — как только друг зайдёт, матч начнётся
        </p>
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: 'var(--gold)', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 12 }}>
          {matchUrl}
        </div>
        <button onClick={copyLink} style={{ background: copied ? 'var(--green)' : 'var(--gold)', color: '#0b1a08', border: 'none', borderRadius: 6, padding: '10px 24px', fontSize: 14, fontWeight: 800, cursor: 'pointer', letterSpacing: 1, fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
          {copied ? '✓ СКОПИРОВАНО' : '📋 КОПИРОВАТЬ ССЫЛКУ'}
        </button>
      </div>
    );

    if (phase === 'placing') {
      const myReady = playerNum === 1 ? !!match?.player1_mines : !!match?.player2_mines;
      const oppReady = playerNum === 1 ? !!match?.player2_mines : !!match?.player1_mines;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ ...card, textAlign: 'center' }}>
            {submitted || myReady ? (
              <>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <p style={{ color: 'var(--green-hi)', fontWeight: 700 }}>Мины расставлены!</p>
                <p style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 6 }}>
                  {oppReady ? 'Матч начинается...' : 'Ждём противника...'}
                </p>
              </>
            ) : (
              <>
                <h2 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 22, letterSpacing: 3, color: 'var(--gold)', marginBottom: 4 }}>
                  РАССТАВЬ МИНЫ
                </h2>
                <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 12 }}>
                  Мин поставлено: <strong style={{ color: myMines.size === MINES ? 'var(--green-hi)' : 'var(--gold)' }}>{myMines.size}/{MINES}</strong>
                </p>
                <PlacementGrid mines={myMines} onToggle={toggleMine} />
                <button
                  onClick={handleSubmitMines}
                  disabled={myMines.size !== MINES}
                  style={{ marginTop: 14, background: myMines.size === MINES ? 'var(--green)' : 'var(--border)', color: '#0b1a08', border: 'none', borderRadius: 6, padding: '10px 28px', fontSize: 15, fontWeight: 800, cursor: myMines.size === MINES ? 'pointer' : 'not-allowed', letterSpacing: 2, fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
                  ГОТОВО
                </button>
              </>
            )}
          </div>
        </div>
      );
    }

    if (phase === 'playing' && board) {
      const opponentName = playerNum === 1 ? match?.player2_name : match?.player1_name;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          {(status === 'won' || status === 'lost') && (
            <div style={{ ...card, textAlign: 'center', border: `2px solid ${status === 'won' ? 'var(--green)' : 'var(--danger)'}`, maxWidth: 340, width: '100%' }}>
              <div style={{ fontSize: 48, marginBottom: 6 }}>{status === 'won' ? '🏆' : '💥'}</div>
              <h2 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 28, letterSpacing: 3, color: status === 'won' ? 'var(--green-hi)' : 'var(--danger)', marginBottom: 8 }}>
                {status === 'won' ? 'ПОБЕДА!' : 'ПОДРЫВ'}
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 12 }}>
                {status === 'won' ? `Ваше время: ${formatTime(timer)}` : 'Вы наступили на мину противника'}
              </p>
              {match?.winner_id && (
                <p style={{ color: 'var(--gold)', fontWeight: 700, fontSize: 14 }}>
                  Победитель: {match.winner_id === match.player1_id ? match.player1_name : match.player2_name}
                </p>
              )}
              <p style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 8 }}>
                Ждём результата противника...
              </p>
            </div>
          )}

          <div style={{ ...card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ color: 'var(--text-2)', fontSize: 13 }}>Карта: <strong>{opponentName ?? 'Противник'}</strong></span>
              <span style={{ color: 'var(--green-hi)', fontFamily: 'monospace', fontWeight: 800, fontSize: 18 }}>{formatTime(timer)}</span>
            </div>
            <PlayGrid board={board} onReveal={handleReveal} onFlag={handleFlag} />
          </div>
        </div>
      );
    }

    if (phase === 'finished') {
      const winnerName = match?.winner_id === match?.player1_id ? match?.player1_name : match?.player2_name;
      const iWon = match?.winner_id === user?.id;
      return (
        <div style={{ ...card, textAlign: 'center', maxWidth: 380 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>{iWon ? '🏆' : '💔'}</div>
          <h2 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 30, letterSpacing: 3, color: iWon ? 'var(--green-hi)' : 'var(--danger)', marginBottom: 8 }}>
            {iWon ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ'}
          </h2>
          <p style={{ color: 'var(--text-2)', marginBottom: 6 }}>Победитель: <strong style={{ color: 'var(--gold)' }}>{winnerName}</strong></p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-dim)', fontSize: 11 }}>{match?.player1_name}</div>
              <div style={{ color: 'var(--green-hi)', fontFamily: 'monospace', fontWeight: 800 }}>{match?.player1_time != null ? formatTime(match.player1_time) : '—'}</div>
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: 18 }}>vs</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-dim)', fontSize: 11 }}>{match?.player2_name}</div>
              <div style={{ color: 'var(--green-hi)', fontFamily: 'monospace', fontWeight: 800 }}>{match?.player2_time != null ? formatTime(match.player2_time) : '—'}</div>
            </div>
          </div>
          <Link href="/game" style={{ display: 'inline-block', marginTop: 20, background: 'var(--green)', color: '#0b1a08', borderRadius: 4, padding: '10px 24px', fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 15, letterSpacing: 2, fontWeight: 800, textDecoration: 'none' }}>
            В ГЛАВНОЕ МЕНЮ
          </Link>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar user={user} onSignOut={signOut} onOpenAuth={() => {}} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px 60px', gap: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 'clamp(28px,7vw,40px)', letterSpacing: 4, color: 'var(--gold)' }}>
            ⚔️ Дуэль
          </h1>
          {match && (
            <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
              {match.player1_name} vs {match.player2_name ?? '???'}
            </p>
          )}
        </div>

        {renderContent()}

        <Link href="/game" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: 13 }}>
          ← Назад к игре
        </Link>
      </main>
    </div>
  );
}
