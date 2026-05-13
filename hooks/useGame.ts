'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Board, Difficulty, GameStatus } from '@/types/game';
import { DIFFICULTY_CONFIG } from '@/types/game';
import {
  createEmptyBoard,
  createDailyBoard,
  placeMines,
  revealCell,
  toggleFlag,
  checkWin,
  revealAllMines,
  getDailySeed,
  getDailyDateString,
} from '@/lib/minesweeper';
import { calculateProbabilities, type ProbabilityMap } from '@/lib/probability';
import { saveGameResult } from '@/lib/supabase';
import { calcEloGain } from '@/lib/elo';
import { sounds } from '@/lib/sounds';

// Local stats stored in localStorage
export type LocalStats = {
  totalGames: number;
  wins: number;
  totalClicks: number;
  mineHits: number;
  totalTime: number;
  byDifficulty: Record<Difficulty, { games: number; wins: number; bestTime: number }>;
};

const STATS_KEY = 'minetrainer_stats';

function loadStats(): LocalStats {
  if (typeof window === 'undefined') return emptyStats();
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY) ?? '') as LocalStats;
  } catch {
    return emptyStats();
  }
}

function emptyStats(): LocalStats {
  return {
    totalGames: 0,
    wins: 0,
    totalClicks: 0,
    mineHits: 0,
    totalTime: 0,
    byDifficulty: {
      easy:   { games: 0, wins: 0, bestTime: 0 },
      medium: { games: 0, wins: 0, bestTime: 0 },
      hard:   { games: 0, wins: 0, bestTime: 0 },
    },
  };
}

function saveStats(stats: LocalStats) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

type UseGameOptions = {
  mode?: 'normal' | 'daily';
  userId?: string;
};

const COMBO_WINDOW_MS = 3000;

export function useGame(initialDifficulty: Difficulty = 'easy', options: UseGameOptions = {}) {
  const { mode = 'normal', userId } = options;

  const dailyDifficulty: Difficulty = 'medium';
  const [difficulty, setDifficulty] = useState<Difficulty>(
    mode === 'daily' ? dailyDifficulty : initialDifficulty
  );

  const initBoard = useCallback(() => {
    if (mode === 'daily') {
      const { rows, cols, mines } = DIFFICULTY_CONFIG[dailyDifficulty];
      return createDailyBoard(rows, cols, mines, getDailySeed());
    }
    const { rows, cols } = DIFFICULTY_CONFIG[initialDifficulty];
    return createEmptyBoard(rows, cols);
  }, [mode, initialDifficulty]);

  const [board, setBoard] = useState<Board>(initBoard);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [flagsPlaced, setFlagsPlaced] = useState(0);
  const [timer, setTimer] = useState(0);
  const [showProbability, setShowProbability] = useState(false);
  const [probabilities, setProbabilities] = useState<ProbabilityMap>(new Map());
  const [flagMode, setFlagMode] = useState(false);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [combo, setCombo] = useState(0);
  const [eloGain, setEloGain] = useState<number | null>(null);
  const [flagEvent, setFlagEvent] = useState<{ id: number; x: number; y: number; isMine: boolean; gameActive: boolean } | null>(null);
  const flagEventIdRef = useRef(0);

  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSafeClickRef = useRef<number>(0);
  const comboRef = useRef(0);

  useEffect(() => {
    if (status === 'playing') {
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setTimer(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  useEffect(() => {
    if (showProbability) setProbabilities(calculateProbabilities(board));
  }, [board, showProbability]);

  const bumpCombo = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastSafeClickRef.current;
    const newCombo = elapsed <= COMBO_WINDOW_MS ? comboRef.current + 1 : 1;
    comboRef.current = newCombo;
    lastSafeClickRef.current = now;
    setCombo(newCombo);
    sounds.combo(newCombo);
  }, []);

  const breakCombo = useCallback(() => {
    if (comboRef.current > 1) sounds.comboBreak();
    comboRef.current = 0;
    lastSafeClickRef.current = 0;
    setCombo(0);
  }, []);

  const resetGame = useCallback(
    (newDifficulty?: Difficulty) => {
      const diff = newDifficulty ?? difficulty;
      if (newDifficulty && mode !== 'daily') setDifficulty(newDifficulty);
      const { rows, cols } = DIFFICULTY_CONFIG[diff];
      setBoard(createEmptyBoard(rows, cols));
      setStatus('idle');
      setFlagsPlaced(0);
      setTimer(0);
      setCombo(0);
      setEloGain(null);
      startTimeRef.current = null;
      comboRef.current = 0;
      lastSafeClickRef.current = 0;
      setProbabilities(new Map());
    },
    [difficulty, mode]
  );

  const handleGameEnd = useCallback(
    async (won: boolean, finalTimer: number) => {
      // Local stats
      const stats = loadStats();
      stats.totalGames++;
      if (won) stats.wins++;
      stats.totalTime += finalTimer;
      stats.byDifficulty[difficulty].games++;
      if (won) {
        stats.byDifficulty[difficulty].wins++;
        const best = stats.byDifficulty[difficulty].bestTime;
        if (!best || finalTimer < best) stats.byDifficulty[difficulty].bestTime = finalTimer;
      }
      saveStats(stats);

      // ELO
      const gain = calcEloGain(difficulty, won, finalTimer);
      setEloGain(gain);

      if (mode === 'daily' && won) {
        setDailyCompleted(true);
        if (userId) {
          await saveGameResult({
            user_id: userId,
            difficulty: dailyDifficulty,
            time_seconds: finalTimer,
            won: true,
            is_daily: true,
            daily_date: getDailyDateString(),
            elo_delta: gain,
          });
        }
      } else if (userId) {
        await saveGameResult({
          user_id: userId,
          difficulty,
          time_seconds: finalTimer,
          won,
          is_daily: false,
          elo_delta: gain,
        });
      }
    },
    [mode, userId, difficulty]
  );

  const handleCellClick = useCallback(
    (row: number, col: number, clientX?: number, clientY?: number) => {
      if (status === 'won' || status === 'lost') return;

      if (flagMode) {
        if (board[row][col].isRevealed) return;
        const newBoard = toggleFlag(board, row, col);
        const placing = newBoard[row][col].isFlagged;
        if (placing) {
          sounds.flag();
          flagEventIdRef.current++;
          setFlagEvent({
            id: flagEventIdRef.current,
            x: clientX ?? window.innerWidth / 2,
            y: clientY ?? window.innerHeight / 2,
            isMine: board[row][col].isMine,
            gameActive: status === 'playing',
          });
        } else {
          sounds.click();
        }
        setBoard(newBoard);
        setFlagsPlaced(f => f + (placing ? 1 : -1));
        return;
      }

      const { rows, cols, mines } = DIFFICULTY_CONFIG[difficulty];
      let currentBoard = board;

      if (status === 'idle') {
        if (mode === 'daily') {
          setStatus('playing');
          startTimeRef.current = Date.now();
        } else {
          currentBoard = placeMines(board, rows, cols, mines, row, col);
          setStatus('playing');
          startTimeRef.current = Date.now();
        }
      }

      // Chord reveal on already-revealed number
      if (currentBoard[row][col].isRevealed) {
        const cell = currentBoard[row][col];
        if (cell.neighborCount === 0) return;

        let flagCount = 0;
        const unrevealed: [number, number][] = [];
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr;
            const nc = col + dc;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (currentBoard[nr][nc].isFlagged) flagCount++;
            else if (!currentBoard[nr][nc].isRevealed) unrevealed.push([nr, nc]);
          }
        }
        if (flagCount !== cell.neighborCount) return;
        if (unrevealed.length === 0) return;

        const hitMine = unrevealed.some(([nr, nc]) => currentBoard[nr][nc].isMine);
        if (hitMine) {
          sounds.explosion();
          breakCombo();
          const stats = loadStats();
          stats.totalClicks++;
          stats.mineHits++;
          saveStats(stats);
          setBoard(revealAllMines(currentBoard));
          setStatus('lost');
          handleGameEnd(false, timer);
          return;
        }

        let afterChord = currentBoard;
        for (const [nr, nc] of unrevealed) {
          afterChord = revealCell(afterChord, nr, nc, rows, cols);
        }
        sounds.cascade();
        bumpCombo();

        const stats = loadStats();
        stats.totalClicks++;
        saveStats(stats);

        if (checkWin(afterChord)) {
          setBoard(afterChord);
          setStatus('won');
          sounds.victory();
          breakCombo();
          handleGameEnd(true, timer);
          return;
        }
        setBoard(afterChord);
        return;
      }

      if (currentBoard[row][col].isFlagged) return;

      // Update click stats
      const stats = loadStats();
      stats.totalClicks++;

      if (currentBoard[row][col].isMine) {
        stats.mineHits++;
        saveStats(stats);
        sounds.explosion();
        breakCombo();
        setBoard(revealAllMines(currentBoard));
        setStatus('lost');
        handleGameEnd(false, timer);
        return;
      }
      saveStats(stats);

      const newBoard = revealCell(currentBoard, row, col, rows, cols);
      sounds.click();
      bumpCombo();

      if (checkWin(newBoard)) {
        setBoard(newBoard);
        setStatus('won');
        sounds.victory();
        breakCombo();
        handleGameEnd(true, timer);
        return;
      }
      setBoard(newBoard);
    },
    [board, status, difficulty, flagMode, mode, timer, handleGameEnd, bumpCombo, breakCombo]
  );

  const handleCellRightClick = useCallback(
    (row: number, col: number, clientX = 0, clientY = 0) => {
      if (status === 'won' || status === 'lost') return;
      if (board[row][col].isRevealed) return;
      const newBoard = toggleFlag(board, row, col);
      const placing = newBoard[row][col].isFlagged;
      if (placing) {
        sounds.flag();
        flagEventIdRef.current++;
        setFlagEvent({
          id: flagEventIdRef.current,
          x: clientX,
          y: clientY,
          isMine: board[row][col].isMine,
          gameActive: status === 'playing',
        });
      } else {
        sounds.click();
      }
      setBoard(newBoard);
      setFlagsPlaced(f => f + (placing ? 1 : -1));
    },
    [board, status]
  );

  const toggleProbability = useCallback(() => {
    setShowProbability(prev => {
      if (!prev) setProbabilities(calculateProbabilities(board));
      else setProbabilities(new Map());
      return !prev;
    });
  }, [board]);

  const minesTotal = DIFFICULTY_CONFIG[mode === 'daily' ? dailyDifficulty : difficulty].mines;

  return {
    board,
    status,
    difficulty,
    flagsPlaced,
    timer,
    showProbability,
    probabilities,
    flagMode,
    minesTotal,
    dailyCompleted,
    combo,
    eloGain,
    flagEvent,
    setFlagMode,
    resetGame,
    handleCellClick,
    handleCellRightClick,
    toggleProbability,
  };
}

export { loadStats };
