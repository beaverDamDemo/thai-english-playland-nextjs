'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from '../../styles/map.module.css';
import { lessonMapButtons } from './lessonMapConfig';

const APP_VERSION = '0.0.16';
const MAP_ASPECT_RATIO = 1024 / 1536;
const PATTAYA_MAP_IMAGE_CACHE_BUSTER = '20260327-1';
const TOTAL_LESSONS = lessonMapButtons.length;
const STATS_KEY = 'englishPattayaStats';
const UNLOCKED_KEY = 'englishPattayaUnlockedLessons';
const PENDING_UNLOCK_KEY = 'englishPattayaPendingUnlockLesson';
const STATS_UPDATED_EVENT = 'pattaya-stats-updated';

type PattayaStats = {
  correctAnswers?: number;
  wrongAnswers?: number;
  quizAttempts?: number;
  totalMovesEarned?: number;
  lessonRuns?: Array<{
    lesson?: number;
    correct?: number;
    wrong?: number;
    playPoints?: number;
    movesEarned?: number;
    completedAt?: string;
  }>;
};

export default function PattayaGamesScreenPage() {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [unlockedLessons, setUnlockedLessons] = useState(1);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [totalMovesEarned, setTotalMovesEarned] = useState(0);
  const [lessonCompletions, setLessonCompletions] = useState(0);
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
      if (!rawStats) {
        setCorrectAnswers(0);
        setWrongAnswers(0);
        setQuizAttempts(0);
        setTotalMovesEarned(0);
        setLessonCompletions(0);
        return;
      }

      try {
        const parsed = JSON.parse(rawStats) as PattayaStats;
        setCorrectAnswers(parsed.correctAnswers ?? 0);
        setWrongAnswers(parsed.wrongAnswers ?? 0);
        setQuizAttempts(parsed.quizAttempts ?? 0);
        setTotalMovesEarned(parsed.totalMovesEarned ?? 0);
        setLessonCompletions(
          Array.isArray(parsed.lessonRuns) ? parsed.lessonRuns.length : 0,
        );
      } catch {
        // ignore malformed local storage values
        setCorrectAnswers(0);
        setWrongAnswers(0);
        setQuizAttempts(0);
        setTotalMovesEarned(0);
        setLessonCompletions(0);
      }
    };

    loadProgress();
    window.addEventListener('focus', loadProgress);
    window.addEventListener('storage', loadProgress);
    window.addEventListener('pageshow', loadProgress);
    window.addEventListener(STATS_UPDATED_EVENT, loadProgress);
    document.addEventListener('visibilitychange', loadProgress);
    return () => {
      window.removeEventListener('focus', loadProgress);
      window.removeEventListener('storage', loadProgress);
      window.removeEventListener('pageshow', loadProgress);
      window.removeEventListener(STATS_UPDATED_EVENT, loadProgress);
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
        <span className={styles.appTitle}>Pattaya Games Lessons</span>
        <Link href="/" className={styles.headerHomeLink}>
          <Image
            src="/assets/back.png"
            alt="Home"
            width={34}
            height={34}
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
              src={`/assets/pattaya%20Copilot_20260325_132439.png?v=${PATTAYA_MAP_IMAGE_CACHE_BUSTER}`}
              alt="Pattaya Lesson Map"
              fill
              priority
              unoptimized
              onLoad={() => setIsMapLoaded(true)}
            />

            {lessonMapButtons.map(({ num, color, left, top, available }) => {
              if (num > unlockedLessons) {
                return (
                  <div
                    key={num}
                    className={`${styles.locationPin} ${styles.locationLocked}`}
                    style={{ left: `${left}%`, top: `${top}%` }}
                  >
                    🔒
                  </div>
                );
              }

              if (!available) {
                return (
                  <div
                    key={num}
                    className={styles.locationPin}
                    style={{
                      borderColor: color,
                      left: `${left}%`,
                      top: `${top}%`,
                      opacity: 0.78,
                    }}
                    title="Coming soon"
                  >
                    {num}
                  </div>
                );
              }

              return (
                <Link
                  key={num}
                  href={`/pattaya-games/lesson${num}`}
                  className={`${styles.locationPin} ${
                    num === highlightedLesson ? styles.newlyUnlocked : ''
                  }`}
                  style={{
                    borderColor: color,
                    left: `${left}%`,
                    top: `${top}%`,
                  }}
                >
                  {num}
                  {num === highlightedLesson && (
                    <span className={styles.unlockBadge}>New!</span>
                  )}
                </Link>
              );
            })}
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
          <span className={styles.statChip}>
            Completions: {lessonCompletions}
          </span>
          <span className={styles.statChip}>Moves: {totalMovesEarned}</span>
        </div>
        <div className={styles.footerActions}>
          <span className={styles.footerVersion}>{APP_VERSION}</span>
        </div>
      </footer>
    </div>
  );
}
