'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles/map.module.css';
import { useState, useEffect } from 'react';

const APP_VERSION = '0.0.14';
const MAP_ASPECT_RATIO = 1024 / 1536;
const MAP_IMAGE_CACHE_BUSTER = '20260321-1';
const TOTAL_LESSONS = 9;
const STATS_KEY = 'englishMazeStats';
const UNLOCKED_KEY = 'englishMazeUnlockedLessons';
const PENDING_UNLOCK_KEY = 'englishMazePendingUnlockLesson';

const lessons = [
  { num: 1, color: '#4CAF50', cls: 'location1' },
  { num: 2, color: '#F44336', cls: 'location2' },
  { num: 3, color: '#FF9800', cls: 'location3' },
  { num: 4, color: '#2196F3', cls: 'location4' },
  { num: 5, color: '#9C27B0', cls: 'location5' },
  { num: 6, color: '#009688', cls: 'location6' },
  { num: 7, color: '#E91E63', cls: 'location7' },
  { num: 8, color: '#3F51B5', cls: 'location8' },
  { num: 9, color: '#795548', cls: 'location9' },
];

export default function MazeScreenPage() {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [unlockedLessons, setUnlockedLessons] = useState(1);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [totalMovesEarned, setTotalMovesEarned] = useState(0);
  const [highlightedLesson, setHighlightedLesson] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const loadProgress = () => {
      const rawUnlocked = window.localStorage.getItem(UNLOCKED_KEY);
      const parsedUnlocked = Number.parseInt(rawUnlocked ?? '1', 10);
      const safeUnlocked = Number.isFinite(parsedUnlocked)
        ? Math.min(TOTAL_LESSONS, Math.max(1, parsedUnlocked))
        : 1;
      setUnlockedLessons(safeUnlocked);

      const rawPending = window.localStorage.getItem(PENDING_UNLOCK_KEY);
      const parsedPending = Number.parseInt(rawPending ?? '', 10);
      const safePending = Number.isFinite(parsedPending)
        ? Math.min(TOTAL_LESSONS, Math.max(1, parsedPending))
        : null;
      if (safePending && safePending <= safeUnlocked) {
        setHighlightedLesson(safePending);
        window.localStorage.removeItem(PENDING_UNLOCK_KEY);
      }

      const rawStats = window.localStorage.getItem(STATS_KEY);
      if (!rawStats) return;

      try {
        const parsed = JSON.parse(rawStats) as {
          correctAnswers?: number;
          wrongAnswers?: number;
          quizAttempts?: number;
          totalMovesEarned?: number;
        };
        setCorrectAnswers(parsed.correctAnswers ?? 0);
        setWrongAnswers(parsed.wrongAnswers ?? 0);
        setQuizAttempts(parsed.quizAttempts ?? 0);
        setTotalMovesEarned(parsed.totalMovesEarned ?? 0);
      } catch {
        // ignore malformed values
      }
    };

    loadProgress();
    window.addEventListener('focus', loadProgress);
    window.addEventListener('storage', loadProgress);
    window.addEventListener('pageshow', loadProgress);
    document.addEventListener('visibilitychange', loadProgress);
    return () => {
      window.removeEventListener('focus', loadProgress);
      window.removeEventListener('storage', loadProgress);
      window.removeEventListener('pageshow', loadProgress);
      document.removeEventListener('visibilitychange', loadProgress);
    };
  }, []);

  useEffect(() => {
    if (!highlightedLesson) return;
    const timeoutId = window.setTimeout(() => setHighlightedLesson(null), 7000);
    return () => window.clearTimeout(timeoutId);
  }, [highlightedLesson]);

  const handleResetProgress = () => {
    if (
      typeof window !== 'undefined' &&
      window.confirm(
        'Are you sure you want to reset all progress? This cannot be undone.',
      )
    ) {
      window.localStorage.removeItem(STATS_KEY);
      window.localStorage.removeItem(UNLOCKED_KEY);
      window.localStorage.removeItem(PENDING_UNLOCK_KEY);
      setCorrectAnswers(0);
      setWrongAnswers(0);
      setQuizAttempts(0);
      setTotalMovesEarned(0);
      setUnlockedLessons(1);
      window.location.reload();
    }
  };

  return (
    <div className={styles.mazePage}>
      <header className={styles.pageHeader}>
        <span className={styles.appTitle}>Maze Game Lessons</span>
        <Link href="/" className={styles.headerHomeLink}>
          <Image
            src="/assets/home-icon.png"
            alt="Home"
            width={28}
            height={28}
            className={styles.homeLinkImg}
          />
        </Link>
      </header>

      <div className={styles.mapViewport}>
        <div
          className={styles.mapFrame}
          style={{ aspectRatio: MAP_ASPECT_RATIO }}
        >
          <div className={styles.mapContainer}>
            {!isMapLoaded && (
              <div
                className={styles.loaderOverlay}
                role="status"
                aria-live="polite"
              >
                <div className={styles.loaderSpinner} aria-hidden="true" />
                <span className={styles.loaderText}>Loading map...</span>
              </div>
            )}
            <Image
              src={`/assets/tinified/map-with-9-clickable-locations.png?v=${MAP_IMAGE_CACHE_BUSTER}`}
              alt="Game Map"
              fill
              priority
              unoptimized
              onLoad={() => setIsMapLoaded(true)}
            />
            {lessons.map(({ num, color, cls }) =>
              num <= unlockedLessons ? (
                <Link
                  key={num}
                  href={`/maze/lesson${num}`}
                  className={`${styles[cls]} ${styles.locationPin} ${
                    num === highlightedLesson ? styles.newlyUnlocked : ''
                  }`}
                  style={{ borderColor: color }}
                >
                  {num}
                  {num === highlightedLesson && (
                    <span className={styles.unlockBadge}>New!</span>
                  )}
                </Link>
              ) : (
                <div
                  key={num}
                  className={`${styles[cls]} ${styles.locationPin} ${styles.locationLocked}`}
                >
                  🔒
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      <footer className={styles.mapFooter}>
        <div className={styles.footerStats}>
          <span className={styles.statChip}>Correct: {correctAnswers}</span>
          <span className={styles.statChip}>Wrong: {wrongAnswers}</span>
          <span className={styles.statChip}>
            Unlocked: {unlockedLessons}/{TOTAL_LESSONS}
          </span>
          <span className={styles.statChip}>Attempts: {quizAttempts}</span>
          <span className={styles.statChip}>Moves: {totalMovesEarned}</span>
        </div>
        <div className={styles.footerActions}>
          <span className={styles.footerVersion}>{APP_VERSION}</span>
          <button className={styles.resetButton} onClick={handleResetProgress}>
            Reset
          </button>
        </div>
      </footer>
    </div>
  );
}
