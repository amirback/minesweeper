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

type UseGameOptions = {
  mode?: 'normal' | 'daily';
  userId?: string;
};

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

  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  useEffect(() => {
    if (showProbability) {
      setProbabilities(calculateProbabilities(board));
    }
  }, [board, showProbability]);

  const resetGame = useCallback(
    (newDifficulty?: Difficulty) => {
      const diff = newDifficulty ?? difficulty;
      if (newDifficulty && mode !== 'daily') setDifficulty(newDifficulty);
      const { rows, cols } = DIFFICULTY_CONFIG[diff];
      setBoard(createEmptyBoard(rows, cols));
      setStatus('idle');
      setFlagsPlaced(0);
      setTimer(0);
      startTimeRef.current = null;
      setProbabilities(new Map());
    },
    [difficulty, mode]
  );

  const handleGameEnd = useCallback(
    async (won: boolean, finalTimer: number, currentBoard: Board) => {
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
          });
        }
      } else if (won && userId) {
        await saveGameResult({
          user_id: userId,
          difficulty,
          time_seconds: finalTimer,
          won: true,
          is_daily: false,
        });
      }
    },
    [mode, userId, difficulty]
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (status === 'won' || status === 'lost') return;

      if (flagMode) {
        if (board[row][col].isRevealed) return;
        const newBoard = toggleFlag(board, row, col);
        const delta = newBoard[row][col].isFlagged ? 1 : -1;
        setBoard(newBoard);
        setFlagsPlaced(f => f + delta);
        return;
      }

      const { rows, cols, mines } = DIFFICULTY_CONFIG[difficulty];
      let currentBoard = board;

      if (status === 'idle') {
        if (mode === 'daily') {
          // Daily board already has mines placed
          setStatus('playing');
          startTimeRef.current = Date.now();
          // If first click is on a mine in daily mode, just start - no safe zone
        } else {
          currentBoard = placeMines(board, rows, cols, mines, row, col);
          setStatus('playing');
          startTimeRef.current = Date.now();
        }
      }

      // Chord reveal: clicking a revealed number
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
          setBoard(revealAllMines(currentBoard));
          setStatus('lost');
          return;
        }

        let afterChord = currentBoard;
        for (const [nr, nc] of unrevealed) {
          afterChord = revealCell(afterChord, nr, nc, rows, cols);
        }

        if (checkWin(afterChord)) {
          setBoard(afterChord);
          setStatus('won');
          handleGameEnd(true, timer, afterChord);
          return;
        }
        setBoard(afterChord);
        return;
      }

      if (currentBoard[row][col].isFlagged) return;

      if (currentBoard[row][col].isMine) {
        const revealedBoard = revealAllMines(currentBoard);
        setBoard(revealedBoard);
        setStatus('lost');
        return;
      }

      const newBoard = revealCell(currentBoard, row, col, rows, cols);
      if (checkWin(newBoard)) {
        setBoard(newBoard);
        setStatus('won');
        handleGameEnd(true, timer, newBoard);
        return;
      }
      setBoard(newBoard);
    },
    [board, status, difficulty, flagMode, mode, timer, handleGameEnd]
  );

  const handleCellRightClick = useCallback(
    (row: number, col: number) => {
      if (status === 'won' || status === 'lost') return;
      if (board[row][col].isRevealed) return;
      const newBoard = toggleFlag(board, row, col);
      const delta = newBoard[row][col].isFlagged ? 1 : -1;
      setBoard(newBoard);
      setFlagsPlaced(f => f + delta);
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
    setFlagMode,
    resetGame,
    handleCellClick,
    handleCellRightClick,
    toggleProbability,
  };
}
