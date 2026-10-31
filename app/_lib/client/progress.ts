'use client';

export type ProgressGameMode = 'maze' | 'casino' | 'pattaya' | 'starter';

export type ProgressDelta = {
  unlocked_lessons?: number;
  correct_answers?: number;
  wrong_answers?: number;
  quiz_attempts?: number;
  total_moves_earned?: number;
};

/** Adds increments to the user's stored progress (server applies them atomically). */
export async function saveProgressDelta(
  gameMode: ProgressGameMode,
  delta: ProgressDelta = {},
): Promise<void> {
  try {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ game_mode: gameMode, delta: true, ...delta }),
    });
    if (!res.ok && res.status !== 401) {
      console.error('Failed to save progress:', res.status);
    }
  } catch (err) {
    console.error('Error saving progress:', err);
  }
}

/** Records one answered question: bumps correct or wrong, plus attempts. */
export function recordAnswer(
  gameMode: ProgressGameMode,
  isCorrect: boolean,
): void {
  void saveProgressDelta(gameMode, {
    correct_answers: isCorrect ? 1 : 0,
    wrong_answers: isCorrect ? 0 : 1,
    quiz_attempts: 1,
  });
}

/** Records that a lesson was opened so partial plays still show as activity. */
export function pingLessonOpen(gameMode: ProgressGameMode): void {
  void saveProgressDelta(gameMode);
}
