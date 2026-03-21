// app/map/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/map.module.css';
import { useState, useEffect } from 'react';

const APP_VERSION = '0.0.14';
const HEADER_HEIGHT = 44;
const TOTAL_LESSONS = 8;
const STATS_KEY = 'englishMazeStats';
const UNLOCKED_KEY = 'englishMazeUnlockedLessons';

const lessons = [
  { num: 1, color: '#4CAF50', cls: 'location1' },
  { num: 2, color: '#2196F3', cls: 'location2' },
  { num: 3, color: '#FF9800', cls: 'location3' },
  { num: 4, color: '#F44336', cls: 'location4' },
  { num: 5, color: '#9C27B0', cls: 'location5' },
  { num: 6, color: '#009688', cls: 'location6' },
  { num: 7, color: '#E91E63', cls: 'location7' },
  { num: 8, color: '#3F51B5', cls: 'location8' },
];

export default function MapPage() {
  const [scale, setScale] = useState(1);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [unlockedLessons, setUnlockedLessons] = useState(1);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [totalMovesEarned, setTotalMovesEarned] = useState(0);

  useEffect(() => {
    const calculateScale = () => {
      const baseWidth = 1200;
      const baseHeight = 800;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight - HEADER_HEIGHT;

      const scaleByWidth = windowWidth / baseWidth;
      const scaleByHeight = windowHeight / baseHeight;

      const newScale = Math.min(scaleByWidth, scaleByHeight);
      setScale(Math.max(newScale, 0.5));
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  useEffect(() => {
    const loadProgress = () => {
      const rawUnlocked = window.localStorage.getItem(UNLOCKED_KEY);
      const parsedUnlocked = Number.parseInt(rawUnlocked ?? '1', 10);
      const safeUnlocked = Number.isFinite(parsedUnlocked)
        ? Math.min(TOTAL_LESSONS, Math.max(1, parsedUnlocked))
        : 1;
      setUnlockedLessons(safeUnlocked);

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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#f0f0f0',
      }}
    >
      <header className={styles.pageHeader}>
        <span className={styles.appTitle}>English Lessons Maze</span>
        <span className={styles.appVersion}>Version {APP_VERSION}</span>
      </header>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          overflow: 'auto',
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            width: '1200px',
            height: '800px',
          }}
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
              src="/assets/tinified/map-with-8-clickable-locations.png"
              alt="Game Map"
              fill
              priority
              onLoadingComplete={() => setIsMapLoaded(true)}
            />
            {lessons.map(({ num, color, cls }) =>
              num <= unlockedLessons ? (
                <Link
                  key={num}
                  href={`/maze/lesson${num}`}
                  className={`${styles[cls]} ${styles.locationPin}`}
                  style={{ borderColor: color }}
                >
                  {num}
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
        <span>Correct: {correctAnswers}</span>
        <span>Wrong: {wrongAnswers}</span>
        <span>
          Unlocked Lessons: {unlockedLessons}/{TOTAL_LESSONS}
        </span>
        <span>Quiz Attempts: {quizAttempts}</span>
        <span>Total Moves Earned: {totalMovesEarned}</span>
      </footer>
    </div>
  );
}
