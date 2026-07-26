'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from '../../../styles/map.module.css';
import { useEffect, useState } from 'react';
import { lessonMapButtons } from './lessonMapConfig';

const MAP_ASPECT_RATIO = 3 / 4;
const TOTAL_LESSONS = lessonMapButtons.length;

export default function StarterLearnersZonePage() {
  const [unlockedLessons, setUnlockedLessons] = useState(1);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [totalMovesEarned, setTotalMovesEarned] = useState(0);
  const [highlightedLesson, setHighlightedLesson] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/progress')
      .then((r) => r.json())
      .then(
        (data: {
          ok?: boolean;
          progress?: Record<string, {
            unlocked_lessons: number;
            correct_answers: number;
            wrong_answers: number;
            quiz_attempts: number;
            total_moves_earned: number;
          }>;
        }) => {
          if (!data.ok || !data.progress) return;
          const p = data.progress['starter'];
          if (!p) return;
          setUnlockedLessons(Math.min(TOTAL_LESSONS, Math.max(1, p.unlocked_lessons)));
          setCorrectAnswers(p.correct_answers);
          setWrongAnswers(p.wrong_answers);
          setQuizAttempts(p.quiz_attempts);
          setTotalMovesEarned(p.total_moves_earned);
        },
      )
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!highlightedLesson) return;
    const timeoutId = window.setTimeout(() => setHighlightedLesson(null), 7000);
    return () => window.clearTimeout(timeoutId);
  }, [highlightedLesson]);

  return (
    <div className={styles.mazePage}>
      <header className={styles.pageHeader}>
        <span className={styles.appTitle}>Starter Learners Zone</span>
        <Link href="/" className={styles.headerHomeLink}>
          <Image
            src="/assets/tinified/back.png"
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
          <div
            className={styles.mapContainer}
            style={{ background: 'linear-gradient(170deg, #0d1b4b 0%, #1a3a6b 50%, #1e5080 100%)' }}
          >
            {lessonMapButtons.map(({ num, color, left, top }) =>
              num <= unlockedLessons ? (
                <Link
                  key={num}
                  href={`/games/starter/lesson${num}`}
                  className={`${styles.locationPin} ${
                    num === highlightedLesson ? styles.newlyUnlocked : ''
                  }`}
                  style={
                    {
                      borderColor: color,
                      left: `${left}%`,
                      top: `${top}%`,
                      '--location-border': color,
                    } as React.CSSProperties
                  }
                >
                  {num}
                  {num === highlightedLesson && (
                    <span className={styles.unlockBadge}>New!</span>
                  )}
                </Link>
              ) : (
                <div
                  key={num}
                  className={`${styles.locationPin} ${styles.locationLocked}`}
                  style={{ left: `${left}%`, top: `${top}%` }}
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
      </footer>
    </div>
  );
}

