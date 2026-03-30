'use client';

// app/map/page.tsx
import Link from 'next/link';
import styles from './HomeView.module.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { lessonMapButtons as mazeLessonMapButtons } from './maze/lessonMapConfig';
import { lessonMapButtons as casinoLessonMapButtons } from './casino/lessonMapConfig';
import { lessonMapButtons as pattayaLessonMapButtons } from './pattaya-games/lessonMapConfig';
import { trackEvent } from './_lib/analytics';

const APP_VERSION = '0.0.14';
const MAZE_TOTAL_LESSONS = Math.max(1, mazeLessonMapButtons.length);
const CASINO_TOTAL_LESSONS = Math.max(1, casinoLessonMapButtons.length);
const PATTAYA_TOTAL_LESSONS = Math.max(1, pattayaLessonMapButtons.length);
const MAZE_STATS_KEY = 'englishMazeStats';
const MAZE_UNLOCKED_KEY = 'englishMazeUnlockedLessons';
const CASINO_STATS_KEY = 'englishCasinoStats';
const CASINO_UNLOCKED_KEY = 'englishCasinoUnlockedLessons';
const PATTAYA_UNLOCKED_KEY = 'englishPattayaUnlockedLessons';

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
  const [pattayaUnlocked, setPattayaUnlocked] = useState(1);
  const [mazeStats, setMazeStats] = useState<ProgressStats>(EMPTY_STATS);
  const [casinoStats, setCasinoStats] = useState<ProgressStats>(EMPTY_STATS);
  const hasTrackedHomeViewRef = useRef(false);

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

      const rawPattayaUnlocked =
        window.localStorage.getItem(PATTAYA_UNLOCKED_KEY);
      const parsedPattayaUnlocked = Number.parseInt(
        rawPattayaUnlocked ?? '1',
        10,
      );
      setPattayaUnlocked(
        Number.isFinite(parsedPattayaUnlocked)
          ? Math.min(PATTAYA_TOTAL_LESSONS, Math.max(1, parsedPattayaUnlocked))
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

  useEffect(() => {
    if (hasTrackedHomeViewRef.current) return;
    hasTrackedHomeViewRef.current = true;

    void trackEvent('home_viewed', {
      mazeUnlocked,
      casinoUnlocked,
      pattayaUnlocked,
      totalCorrect,
      totalWrong,
      totalAttempts,
      totalMoves,
    });
  }, [
    mazeUnlocked,
    casinoUnlocked,
    pattayaUnlocked,
    totalCorrect,
    totalWrong,
    totalAttempts,
    totalMoves,
  ]);

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
      window.localStorage.removeItem(PATTAYA_UNLOCKED_KEY);
      window.localStorage.removeItem('englishPattayaPendingUnlockLesson');
      window.location.reload();
    }
  };

  const handleUnlockAllLessons = () => {
    window.localStorage.setItem(MAZE_UNLOCKED_KEY, String(MAZE_TOTAL_LESSONS));
    window.localStorage.setItem(
      CASINO_UNLOCKED_KEY,
      String(CASINO_TOTAL_LESSONS),
    );
    window.localStorage.setItem(
      PATTAYA_UNLOCKED_KEY,
      String(PATTAYA_TOTAL_LESSONS),
    );
    window.localStorage.removeItem('englishMazePendingUnlockLesson');
    window.localStorage.removeItem('englishCasinoPendingUnlockLesson');
    window.localStorage.removeItem('englishPattayaPendingUnlockLesson');

    setMazeUnlocked(MAZE_TOTAL_LESSONS);
    setCasinoUnlocked(CASINO_TOTAL_LESSONS);
    setPattayaUnlocked(PATTAYA_TOTAL_LESSONS);
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
            Lesson map with 5 casino lesson slots.
          </span>
        </Link>

        <Link
          href="/pattaya-games"
          className={`${styles.hubCard} ${styles.pattayaCard}`}
        >
          <span className={styles.hubTitle}>Pattaya Games Screen</span>
          <span className={styles.hubText}>
            Various games and activities from Pattaya.
          </span>
        </Link>
      </section>

      <section className={styles.progressCard} aria-label="Your progress">
        <h2 className={styles.progressTitle}>Your Progress</h2>
        <div className={styles.progressDisplay}>
          <article className={styles.progressBlock}>
            <h3 className={styles.progressBlockTitle}>Lesson Unlocks</h3>
            <div className={styles.progressRows}>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>Maze</span>
                <strong className={styles.progressValue}>
                  {mazeUnlocked}/{MAZE_TOTAL_LESSONS}
                </strong>
              </div>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>Casino</span>
                <strong className={styles.progressValue}>
                  {casinoUnlocked}/{CASINO_TOTAL_LESSONS}
                </strong>
              </div>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>Pattaya</span>
                <strong className={styles.progressValue}>
                  {pattayaUnlocked}/{PATTAYA_TOTAL_LESSONS}
                </strong>
              </div>
            </div>
          </article>

          <article className={styles.progressBlock}>
            <h3 className={styles.progressBlockTitle}>Quiz Totals</h3>
            <div className={styles.progressRows}>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>Correct</span>
                <strong className={styles.progressValue}>{totalCorrect}</strong>
              </div>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>Wrong</span>
                <strong className={styles.progressValue}>{totalWrong}</strong>
              </div>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>Attempts</span>
                <strong className={styles.progressValue}>
                  {totalAttempts}
                </strong>
              </div>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>Moves</span>
                <strong className={styles.progressValue}>{totalMoves}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section
        className={styles.bottomPageActions}
        aria-label="Progress actions"
      >
        <div className={styles.progressActions}>
          <button
            className={styles.progressUnlockButton}
            onClick={handleUnlockAllLessons}
          >
            Unlock All Lessons
          </button>
          <button
            className={styles.progressResetButton}
            onClick={handleResetProgress}
          >
            Reset Progress
          </button>
        </div>
      </section>

      <footer className={`${styles.footerBar} ${styles.rightFooterBar}`}>
        <span className={styles.footerVersion}>{APP_VERSION}</span>
      </footer>
    </main>
  );
}
