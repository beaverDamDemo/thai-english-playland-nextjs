'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getLessonByHref } from '@/app/games/curriculum';
import GameFooter, { type FooterGame } from './GameFooter';
import styles from './GameFooter.module.css';

type Progress = {
  unlocked_lessons: number;
  correct_answers: number;
  wrong_answers: number;
  quiz_attempts: number;
  total_moves_earned: number;
};

type LessonProgress = Omit<Progress, 'unlocked_lessons'> & {
  lesson_id: string;
  completed_at: string | null;
};

/** GameFooter filled with the player's saved totals for one game (loaded on mount). */
export default function GameStatsFooter({
  game,
  totalLessons,
  sticky = true,
}: {
  game: FooterGame;
  totalLessons: number;
  sticky?: boolean;
}) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress | null>(null);
  const [loadError, setLoadError] = useState(false);
  const pathname = usePathname();
  const lesson = getLessonByHref(pathname);

  useEffect(() => {
    let active = true;
    let requestId = 0;
    const loadProgress = () => {
      const currentRequest = ++requestId;
      return fetch('/api/progress')
      .then((response) => {
        if (!response.ok) throw new Error(`Progress request failed: ${response.status}`);
        return response.json();
      })
      .then((data: { ok?: boolean; progress?: Record<string, Progress>; lessons?: LessonProgress[] }) => {
        if (!data.ok || !data.progress?.[game] || !Array.isArray(data.lessons)) {
          throw new Error('Invalid progress response');
        }
        if (active && requestId === currentRequest) {
          setProgress(data.progress[game]);
          setLessonProgress(data.lessons.find((entry) => entry.lesson_id === lesson?.id) ?? null);
          setLoadError(false);
        }
      })
      .catch((error) => {
        console.error('Failed to load lesson progress:', error);
        if (active && requestId === currentRequest) setLoadError(true);
      });
    };
    void loadProgress();
    window.addEventListener('playland-progress-updated', loadProgress);
    return () => {
      active = false;
      window.removeEventListener('playland-progress-updated', loadProgress);
    };
  }, [game, lesson?.id]);

  const p = lesson ? lessonProgress : progress;
  return (
    <div className={sticky ? styles.sticky : undefined}>
      <GameFooter
        game={game}
        stats={loadError ? [{ label: 'Progress', value: 'Unavailable' }] : !progress ? [{ label: 'Progress', value: 'Loading' }] : [
          { label: 'Correct', value: p?.correct_answers ?? 0 },
          { label: 'Wrong', value: p?.wrong_answers ?? 0 },
          ...(lesson ? [{
            label: 'Completed',
            value: lessonProgress?.completed_at ? 'Yes' : 'No',
          }] : [{
            label: 'Unlocked',
            value: `${Math.min(totalLessons, progress?.unlocked_lessons ?? 1)}/${totalLessons}`,
          }]),
          { label: 'Attempts', value: p?.quiz_attempts ?? 0 },
          { label: 'Moves', value: p?.total_moves_earned ?? 0 },
        ]}
      />
    </div>
  );
}
