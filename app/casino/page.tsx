'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles/map.module.css';
import { useEffect, useState } from 'react';

const APP_VERSION = '0.0.14';
const MAP_ASPECT_RATIO = 1024 / 1536;
const CASINO_MAP_IMAGE_CACHE_BUSTER = '20260326-1';
const TOTAL_LESSONS = 7;
const STATS_KEY = 'englishCasinoStats';
const UNLOCKED_KEY = 'englishCasinoUnlockedLessons';
const PENDING_UNLOCK_KEY = 'englishCasinoPendingUnlockLesson';

const lessons = [
  { num: 1, color: '#264653', left: 0, top: 0, cls: 'location1' },
  { num: 2, color: '#E63946', left: 9, top: 80, cls: 'location2' },
  { num: 3, color: '#1D3557', left: 35.4, top: 58.6, cls: 'location3' },
  { num: 4, color: '#2A9D8F', left: 47.7, top: 46.7, cls: 'location4' },
  { num: 5, color: '#F4A261', left: 37.5, top: 22.9, cls: 'location5' },
];

export default function CasinoScreenPage() {
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

  return (
    <div className={styles.mazePage}>
      <header className={styles.pageHeader}>
        <span className={styles.appTitle}>Casino Game Lessons</span>
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
              src={`/assets/casino-map-with-5-clickable-locations.png?v=${CASINO_MAP_IMAGE_CACHE_BUSTER}`}
              alt="Casino Lesson Map"
              fill
              priority
              unoptimized
              onLoad={() => setIsMapLoaded(true)}
            />
            {lessons.map(({ num, color, cls }) =>
              num <= unlockedLessons ? (
                <Link
                  key={num}
                  href={`/casino/lesson${num}`}
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
        </div>
      </footer>
    </div>
  );
}
