'use client';

// app/map/page.tsx
import Link from 'next/link';
import styles from './HomeView.module.css';
import { useEffect, useMemo, useState } from 'react';

const APP_VERSION = '0.0.14';
const MAZE_TOTAL_LESSONS = 9;
const CASINO_TOTAL_LESSONS = 1;
const MAZE_STATS_KEY = 'englishMazeStats';
const MAZE_UNLOCKED_KEY = 'englishMazeUnlockedLessons';
const CASINO_STATS_KEY = 'englishCasinoStats';
const CASINO_UNLOCKED_KEY = 'englishCasinoUnlockedLessons';

type ProgressStats = {
  correctAnswers: number;
  wrongAnswers: number;
  quizAttempts: number;
  totalMovesEarned: number;
};

const EMPTY_STATS: ProgressStats = {
  correctAnswers: 0,
  wrongAnswers: 0,
  quizAttempts: 0,
  totalMovesEarned: 0,
};

function parseStats(raw: string | null): ProgressStats {
  if (!raw) return EMPTY_STATS;
  try {
    const parsed = JSON.parse(raw) as Partial<ProgressStats>;
    return {
      correctAnswers: parsed.correctAnswers ?? 0,
      wrongAnswers: parsed.wrongAnswers ?? 0,
      quizAttempts: parsed.quizAttempts ?? 0,
      totalMovesEarned: parsed.totalMovesEarned ?? 0,
    };
  } catch {
    return EMPTY_STATS;
  }
}

export default function HomePage() {
  const [mazeUnlocked, setMazeUnlocked] = useState(1);
  const [casinoUnlocked, setCasinoUnlocked] = useState(1);
  const [mazeStats, setMazeStats] = useState<ProgressStats>(EMPTY_STATS);
  const [casinoStats, setCasinoStats] = useState<ProgressStats>(EMPTY_STATS);

  useEffect(() => {
    const loadProgress = () => {
      const rawMazeUnlocked = window.localStorage.getItem(MAZE_UNLOCKED_KEY);
      const parsedMazeUnlocked = Number.parseInt(rawMazeUnlocked ?? '1', 10);
      setMazeUnlocked(
        Number.isFinite(parsedMazeUnlocked)
          ? Math.min(MAZE_TOTAL_LESSONS, Math.max(1, parsedMazeUnlocked))
          : 1,
      );

      const rawCasinoUnlocked =
        window.localStorage.getItem(CASINO_UNLOCKED_KEY);
      const parsedCasinoUnlocked = Number.parseInt(
        rawCasinoUnlocked ?? '1',
        10,
      );
      setCasinoUnlocked(
        Number.isFinite(parsedCasinoUnlocked)
          ? Math.min(CASINO_TOTAL_LESSONS, Math.max(1, parsedCasinoUnlocked))
          : 1,
      );

      setMazeStats(parseStats(window.localStorage.getItem(MAZE_STATS_KEY)));
      setCasinoStats(parseStats(window.localStorage.getItem(CASINO_STATS_KEY)));
    };

    loadProgress();
    window.addEventListener('focus', loadProgress);
    window.addEventListener('storage', loadProgress);
    window.addEventListener('pageshow', loadProgress);
    return () => {
      window.removeEventListener('focus', loadProgress);
      window.removeEventListener('storage', loadProgress);
      window.removeEventListener('pageshow', loadProgress);
    };
  }, []);

  const totalCorrect = useMemo(
    () => mazeStats.correctAnswers + casinoStats.correctAnswers,
    [mazeStats.correctAnswers, casinoStats.correctAnswers],
  );
  const totalWrong = useMemo(
    () => mazeStats.wrongAnswers + casinoStats.wrongAnswers,
    [mazeStats.wrongAnswers, casinoStats.wrongAnswers],
  );
  const totalAttempts = useMemo(
    () => mazeStats.quizAttempts + casinoStats.quizAttempts,
    [mazeStats.quizAttempts, casinoStats.quizAttempts],
  );
  const totalMoves = useMemo(
    () => mazeStats.totalMovesEarned + casinoStats.totalMovesEarned,
    [mazeStats.totalMovesEarned, casinoStats.totalMovesEarned],
  );

  const handleResetProgress = () => {
    if (
      window.confirm(
        'Reset all progress for Maze and Casino? This cannot be undone.',
      )
    ) {
      window.localStorage.removeItem(MAZE_STATS_KEY);
      window.localStorage.removeItem(MAZE_UNLOCKED_KEY);
      window.localStorage.removeItem('englishMazePendingUnlockLesson');
      window.localStorage.removeItem(CASINO_STATS_KEY);
      window.localStorage.removeItem(CASINO_UNLOCKED_KEY);
      window.localStorage.removeItem('englishCasinoPendingUnlockLesson');
      window.location.reload();
    }
  };

  return (
    <main className={styles.playfulHome}>
      <div className={styles.shapeOne} aria-hidden="true" />
      <div className={styles.shapeTwo} aria-hidden="true" />
      <header className={`${styles.header} ${styles.centeredHeader}`}>
        <h1 className={styles.title}>Thai English Playland</h1>
      </header>

      <section className={styles.hubGrid} aria-label="Game mode links">
        <Link href="/maze" className={`${styles.hubCard} ${styles.mazeCard}`}>
          <span className={styles.hubTitle}>Maze Game Lessons</span>
          <span className={styles.hubText}>
            Classic lesson path with unlocks.
          </span>
        </Link>

        <Link
          href="/casino"
          className={`${styles.hubCard} ${styles.casinoCard}`}
        >
          <span className={styles.hubTitle}>Casino Game Lessons</span>
          <span className={styles.hubText}>
            Lesson map with 7 casino lesson slots.
          </span>
        </Link>

        <Link
          href="/pattaya-games"
          className={`${styles.hubCard} ${styles.pattayaCard}`}
        >
          <span className={styles.hubTitle}>Pattaya Games Screen</span>
          <span className={styles.hubText}>
            Blank screen ready for Pattaya games.
          </span>
        </Link>
      </section>

      <section className={styles.progressCard} aria-label="Your progress">
        <h2 className={styles.progressTitle}>Your Progress</h2>
        <div className={styles.progressStats}>
          <span className={styles.progressChip}>
            Maze Unlocked: {mazeUnlocked}/{MAZE_TOTAL_LESSONS}
          </span>
          <span className={styles.progressChip}>
            Casino Unlocked: {casinoUnlocked}/{CASINO_TOTAL_LESSONS}
          </span>
          <span className={styles.progressChip}>Correct: {totalCorrect}</span>
          <span className={styles.progressChip}>Wrong: {totalWrong}</span>
          <span className={styles.progressChip}>Attempts: {totalAttempts}</span>
          <span className={styles.progressChip}>Moves: {totalMoves}</span>
        </div>
        <button
          className={styles.progressResetButton}
          onClick={handleResetProgress}
        >
          Reset Progress
        </button>
      </section>

      <footer className={`${styles.footerBar} ${styles.rightFooterBar}`}>
        <span className={styles.footerVersion}>{APP_VERSION}</span>
      </footer>
    </main>
  );
}
