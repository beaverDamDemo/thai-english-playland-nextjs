import { db } from '@/app/_lib/server/db';
import { curriculumZones } from '@/app/_games/curriculum';

export type AchievementCategory =
  | 'streak'
  | 'days'
  | 'lessons'
  | 'totals'
  | 'special';

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  sortOrder: number;
};

// Full list of achievements in the app.
// IDs are stable slugs; do not rename once in production.
export const ACHIEVEMENTS: AchievementDef[] = [
  // Streaks (awarded via per-answer events - deferred integration)
  { id: 'streak_5', title: 'On Fire', description: '5 correct answers in a row', icon: '🔥', category: 'streak', sortOrder: 10 },
  { id: 'streak_10', title: 'Unstoppable', description: '10 correct answers in a row', icon: '⚡', category: 'streak', sortOrder: 11 },
  { id: 'streak_15', title: 'Legendary', description: '15 correct answers in a row', icon: '💫', category: 'streak', sortOrder: 12 },

  // Consecutive days
  { id: 'days_3', title: 'Getting Started', description: 'Play 3 days in a row', icon: '📅', category: 'days', sortOrder: 20 },
  { id: 'days_7', title: 'Week Warrior', description: 'Play 7 days in a row', icon: '🗓️', category: 'days', sortOrder: 21 },
  { id: 'days_30', title: 'Month Master', description: 'Play 30 days in a row', icon: '👑', category: 'days', sortOrder: 22 },

  // Lesson milestones (combined across modes)
  { id: 'lessons_1', title: 'First Steps', description: 'Complete your first lesson', icon: '🎓', category: 'lessons', sortOrder: 30 },
  { id: 'lessons_3', title: 'Apprentice', description: 'Complete 3 lessons', icon: '📘', category: 'lessons', sortOrder: 31 },
  { id: 'lessons_10', title: 'Scholar', description: 'Complete 10 lessons', icon: '📚', category: 'lessons', sortOrder: 32 },

  // Correct totals
  { id: 'correct_50', title: 'Sharp Mind', description: '50 correct answers total', icon: '🎯', category: 'totals', sortOrder: 40 },
  { id: 'correct_100', title: 'Century Club', description: '100 correct answers total', icon: '💯', category: 'totals', sortOrder: 41 },
  { id: 'correct_200', title: 'Brainiac', description: '200 correct answers total', icon: '🧠', category: 'totals', sortOrder: 42 },

  // Special (some deferred until per-answer events are integrated)
  { id: 'explorer', title: 'Explorer', description: `Play a lesson in all ${curriculumZones.length} zones`, icon: '🧭', category: 'special', sortOrder: 50 },
  { id: 'perfect_lesson', title: 'Flawless', description: 'Complete a lesson with no wrong answers', icon: '✨', category: 'special', sortOrder: 51 },
  { id: 'comeback', title: 'Comeback Kid', description: 'Answer correctly after 3 wrong in a row', icon: '🔄', category: 'special', sortOrder: 52 },
];

/**
 * Seed the definitions table (idempotent upsert).
 * Called lazily when the achievements API is hit.
 */
let didSeed = false;
export async function seedAchievementDefinitions(): Promise<void> {
  if (didSeed) return;
  for (const a of ACHIEVEMENTS) {
    await db`
      INSERT INTO public.thai_english_playland_achievement_definitions
        (id, title, description, icon, category, sort_order)
      VALUES (${a.id}, ${a.title}, ${a.description}, ${a.icon}, ${a.category}, ${a.sortOrder})
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        category = EXCLUDED.category,
        sort_order = EXCLUDED.sort_order;
    `;
  }
  didSeed = true;
}

type ProgressRow = {
  game_mode: string;
  unlocked_lessons: number;
  correct_answers: number;
  wrong_answers: number;
  quiz_attempts: number;
  total_moves_earned: number;
};

async function getProgress(userId: number): Promise<ProgressRow[]> {
  return await db<ProgressRow[]>`
    SELECT game_mode, unlocked_lessons, correct_answers, wrong_answers, quiz_attempts, total_moves_earned
    FROM public.thai_english_playland_user_progress
    WHERE user_id = ${userId};
  `;
}

async function getEarnedIds(userId: number): Promise<Set<string>> {
  const rows = await db<{ achievement_id: string }[]>`
    SELECT achievement_id
    FROM public.thai_english_playland_user_achievements
    WHERE user_id = ${userId};
  `;
  return new Set(rows.map((r) => r.achievement_id));
}

async function awardAchievement(userId: number, achievementId: string): Promise<void> {
  await db`
    INSERT INTO public.thai_english_playland_user_achievements (user_id, achievement_id)
    VALUES (${userId}, ${achievementId})
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  `;
}

/** A "play day" for the days-in-a-row achievements starts at midnight in this time zone. */
const PLAY_DAY_TIME_ZONE = 'Asia/Bangkok';

/**
 * Update consecutive-days tracking for today's activity.
 * Returns the new consecutive_days count.
 */
async function updateConsecutiveDays(userId: number): Promise<number> {
  // All date maths happens in the database, in learners' local time (Thailand), so the
  // result can't depend on the Node server's or the database's own time zone. (Mixing
  // them used to count a "new day" on every request.)
  const rows = await db<Array<{ consecutive_days: number; max_consecutive_days: number; days_since: number | null }>>`
    SELECT consecutive_days, max_consecutive_days,
      ((NOW() AT TIME ZONE ${PLAY_DAY_TIME_ZONE})::date - last_play_date) AS days_since
    FROM public.thai_english_playland_user_streak_state
    WHERE user_id = ${userId};
  `;

  if (rows.length === 0) {
    // Two progress saves can arrive at once for a new player; the second one must not fail.
    await db`
      INSERT INTO public.thai_english_playland_user_streak_state
        (user_id, last_play_date, consecutive_days, max_consecutive_days)
      VALUES (${userId}, (NOW() AT TIME ZONE ${PLAY_DAY_TIME_ZONE})::date, 1, 1)
      ON CONFLICT (user_id) DO NOTHING;
    `;
    return 1;
  }

  const row = rows[0];
  const daysSince = row.days_since === null ? null : Number(row.days_since);
  // Already played today: keep the count.
  if (daysSince === 0) return row.consecutive_days;
  // Played yesterday: the run continues. Anything else (gap, or no date yet) starts again.
  const nextConsecutive = daysSince === 1 ? row.consecutive_days + 1 : 1;

  const nextMax = Math.max(row.max_consecutive_days, nextConsecutive);
  await db`
    UPDATE public.thai_english_playland_user_streak_state
    SET last_play_date = (NOW() AT TIME ZONE ${PLAY_DAY_TIME_ZONE})::date,
        consecutive_days = ${nextConsecutive},
        max_consecutive_days = ${nextMax},
        updated_at = NOW()
    WHERE user_id = ${userId};
  `;
  return nextConsecutive;
}

/**
 * Evaluate and award all progress-based achievements (milestones, days, explorer).
 * Called after progress is saved (e.g. from /api/progress POST).
 * Streak/perfect/comeback achievements require per-answer events and are handled elsewhere.
 */
export async function evaluateProgressAchievements(userId: number): Promise<string[]> {
  await seedAchievementDefinitions();
  const [progress, earned] = await Promise.all([
    getProgress(userId),
    getEarnedIds(userId),
  ]);
  const completedRows = await db<{ count: number }[]>`
    SELECT COUNT(*)::integer AS count
    FROM public.thai_english_playland_lesson_progress
    WHERE user_id = ${userId} AND completed_at IS NOT NULL;
  `;
  // Every lesson the learner has opened (a lesson_progress row is created on first play).
  const playedRows = await db<{ lesson_id: string }[]>`
    SELECT lesson_id
    FROM public.thai_english_playland_lesson_progress
    WHERE user_id = ${userId};
  `;

  const newlyEarned: string[] = [];
  const award = async (id: string) => {
    if (earned.has(id)) return;
    await awardAchievement(userId, id);
    newlyEarned.push(id);
  };

  const lessonsCompleted = completedRows[0].count;
  if (lessonsCompleted >= 1) await award('lessons_1');
  if (lessonsCompleted >= 3) await award('lessons_3');
  if (lessonsCompleted >= 10) await award('lessons_10');

  // Correct total milestones
  const totalCorrect = progress.reduce((sum, p) => sum + p.correct_answers, 0);
  if (totalCorrect >= 50) await award('correct_50');
  if (totalCorrect >= 100) await award('correct_100');
  if (totalCorrect >= 200) await award('correct_200');

  // Explorer: has played at least one lesson in every curriculum zone.
  const played = new Set(playedRows.map((row) => row.lesson_id));
  const playedEveryZone = curriculumZones.every((zone) =>
    zone.lessons.some((lesson) => played.has(lesson.id)),
  );
  if (playedEveryZone) await award('explorer');

  // Consecutive days
  const consecutive = await updateConsecutiveDays(userId);
  if (consecutive >= 3) await award('days_3');
  if (consecutive >= 7) await award('days_7');
  if (consecutive >= 30) await award('days_30');

  return newlyEarned;
}

export type EarnedAchievement = {
  id: string;
  earned_at: string;
};

export async function getUserAchievements(userId: number): Promise<EarnedAchievement[]> {
  const rows = await db<{ achievement_id: string; earned_at: Date }[]>`
    SELECT achievement_id, earned_at
    FROM public.thai_english_playland_user_achievements
    WHERE user_id = ${userId}
    ORDER BY earned_at DESC;
  `;
  return rows.map((r) => ({
    id: r.achievement_id,
    earned_at: r.earned_at.toISOString(),
  }));
}
