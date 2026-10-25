'use client';

import { useEffect, useState } from 'react';
import GameFooter, { type FooterGame } from './GameFooter';
import styles from './GameFooter.module.css';

type Progress = {
  unlocked_lessons: number;
  correct_answers: number;
  wrong_answers: number;
  quiz_attempts: number;
  total_moves_earned: number;
};

/** GameFooter filled with the player's saved totals for one game (loaded on mount). */
export default function GameStatsFooter({
  game,
  totalLessons,
}: {
  game: FooterGame;
  totalLessons: number;
}) {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/progress')
      .then((r) => r.json())
      .then((data: { ok?: boolean; progress?: Record<string, Progress> }) => {
        if (active && data.ok && data.progress?.[game]) {
          setProgress(data.progress[game]);
        }
      })
      .catch(() => null);
    return () => {
      active = false;
    };
  }, [game]);

  const p = progress;
  return (
    <div className={styles.sticky}>
      <GameFooter
        game={game}
        stats={[
          { label: 'Correct', value: p?.correct_answers ?? 0 },
          { label: 'Wrong', value: p?.wrong_answers ?? 0 },
          {
            label: 'Unlocked',
            value: `${Math.min(totalLessons, p?.unlocked_lessons ?? 1)}/${totalLessons}`,
          },
          { label: 'Attempts', value: p?.quiz_attempts ?? 0 },
          { label: 'Moves', value: p?.total_moves_earned ?? 0 },
        ]}
      />
    </div>
  );
}
