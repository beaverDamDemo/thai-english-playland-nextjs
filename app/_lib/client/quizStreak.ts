'use client';

// Module-level streak state. Reset explicitly by lesson components on mount
// so that navigating away mid-lesson naturally drops the streak (component
// unmounts, and when the next lesson mounts it calls resetStreak()).
let correctStreak = 0;
let wrongStreak = 0;

async function fireEvent(body: Record<string, unknown>): Promise<void> {
  try {
    await fetch('/api/achievements/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Silent: achievements are non-critical; don't interrupt quiz UX.
  }
}

/**
 * Record the outcome of a single quiz answer.
 * Fires streak achievements at 5, 10, 15 correct in a row.
 * Fires comeback when a correct answer follows 3+ wrong in a row.
 */
export function recordAnswer(correct: boolean): void {
  if (correct) {
    const wasWrongStreak = wrongStreak;
    correctStreak += 1;
    wrongStreak = 0;

    if (
      correctStreak === 5 ||
      correctStreak === 10 ||
      correctStreak === 15
    ) {
      void fireEvent({ type: 'streak', threshold: correctStreak });
    }
    if (wasWrongStreak >= 3) {
      void fireEvent({ type: 'comeback' });
    }
  } else {
    correctStreak = 0;
    wrongStreak += 1;
  }
  if (typeof window !== 'undefined') {
    // Helpful for debugging in DevTools console.
    (window as unknown as { __quizStreak?: unknown }).__quizStreak = {
      correctStreak,
      wrongStreak,
    };
  }
}

/** Reset the in-memory streak. Call on lesson mount. */
export function resetStreak(): void {
  correctStreak = 0;
  wrongStreak = 0;
}

/** Report a perfect lesson completion (no wrong answers). */
export function reportPerfectLesson(): void {
  void fireEvent({ type: 'perfect_lesson' });
}

export function getStreakSnapshot(): {
  correctStreak: number;
  wrongStreak: number;
} {
  return { correctStreak, wrongStreak };
}
