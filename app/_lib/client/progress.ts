'use client';

import { getLessonByHref } from '@/app/_games/curriculum';
import {
  recordAnswer as recordStreakAnswer,
  reportPerfectIfFlawless,
  resetStreak,
} from '@/app/_lib/client/quizStreak';

export type ProgressGameMode = 'maze' | 'casino' | 'pattaya' | 'starter';

export type ProgressDelta = {
  unlocked_lessons?: number;
  correct_answers?: number;
  wrong_answers?: number;
  quiz_attempts?: number;
  total_moves_earned?: number;
  completed?: boolean;
};

/** Adds increments to the user's stored progress (server applies them atomically). */
export async function saveProgressDelta(
  gameMode: ProgressGameMode,
  delta: ProgressDelta = {},
): Promise<void> {
  const lesson = getLessonByHref(window.location.pathname);
  // Finishing a lesson without a single wrong answer earns "Flawless" (sent once per visit).
  if (delta.completed === true) reportPerfectIfFlawless();
  try {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ game_mode: gameMode, lesson_id: lesson?.id, delta: true, ...delta }),
    });
    if (!res.ok && res.status !== 401) {
      console.error('Failed to save progress:', res.status);
    } else if (res.ok) {
      window.dispatchEvent(new Event('playland-progress-updated'));
    }
  } catch (err) {
    console.error('Error saving progress:', err);
  }
}

/**
 * Records one answered question: bumps correct or wrong, plus attempts, and feeds the
 * in-a-row tracker (On Fire / Unstoppable / Legendary / Comeback Kid achievements).
 * Games that call quizStreak.recordAnswer themselves must not also call this.
 */
export function recordAnswer(
  gameMode: ProgressGameMode,
  isCorrect: boolean,
): void {
  recordStreakAnswer(isCorrect);
  void saveProgressDelta(gameMode, {
    correct_answers: isCorrect ? 1 : 0,
    wrong_answers: isCorrect ? 0 : 1,
    quiz_attempts: 1,
  });
}

/**
 * Records that a lesson was opened so partial plays still show as activity,
 * and starts a fresh in-a-row count for this lesson visit.
 */
export function pingLessonOpen(gameMode: ProgressGameMode): void {
  resetStreak();
  void saveProgressDelta(gameMode);
}
