import { NextResponse } from 'next/server';
import { db } from '@/app/_lib/server/db';
import { getCurrentSessionUser } from '@/app/_lib/server/auth';
import { evaluateProgressAchievements } from '@/app/_lib/server/achievements';

export type GameMode = 'maze' | 'casino' | 'pattaya';

export type ProgressRow = {
  game_mode: GameMode;
  unlocked_lessons: number;
  correct_answers: number;
  wrong_answers: number;
  quiz_attempts: number;
  total_moves_earned: number;
};

export async function GET() {
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Not authenticated.' }, { status: 401 });
  }

  const rows = await db<ProgressRow[]>`
    SELECT game_mode, unlocked_lessons, correct_answers, wrong_answers, quiz_attempts, total_moves_earned
    FROM public.thai_english_playland_user_progress
    WHERE user_id = ${user.id};
  `;

  const progress: Record<GameMode, Omit<ProgressRow, 'game_mode'>> = {
    maze: { unlocked_lessons: 1, correct_answers: 0, wrong_answers: 0, quiz_attempts: 0, total_moves_earned: 0 },
    casino: { unlocked_lessons: 1, correct_answers: 0, wrong_answers: 0, quiz_attempts: 0, total_moves_earned: 0 },
    pattaya: { unlocked_lessons: 1, correct_answers: 0, wrong_answers: 0, quiz_attempts: 0, total_moves_earned: 0 },
  };

  for (const row of rows) {
    if (row.game_mode in progress) {
      progress[row.game_mode] = {
        unlocked_lessons: row.unlocked_lessons,
        correct_answers: row.correct_answers,
        wrong_answers: row.wrong_answers,
        quiz_attempts: row.quiz_attempts,
        total_moves_earned: row.total_moves_earned,
      };
    }
  }

  return NextResponse.json({ ok: true, progress });
}

type SaveBody = {
  game_mode?: string;
  unlocked_lessons?: number;
  correct_answers?: number;
  wrong_answers?: number;
  quiz_attempts?: number;
  total_moves_earned?: number;
};

export async function POST(request: Request) {
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Not authenticated.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as SaveBody;
  const { game_mode, unlocked_lessons, correct_answers, wrong_answers, quiz_attempts, total_moves_earned } = body;

  const validModes: GameMode[] = ['maze', 'casino', 'pattaya'];
  if (!game_mode || !validModes.includes(game_mode as GameMode)) {
    return NextResponse.json({ ok: false, error: 'Invalid game_mode.' }, { status: 400 });
  }

  await db`
    INSERT INTO public.thai_english_playland_user_progress (user_id, game_mode, unlocked_lessons, correct_answers, wrong_answers, quiz_attempts, total_moves_earned, updated_at)
    VALUES (
      ${user.id}, ${game_mode},
      ${unlocked_lessons ?? 1},
      ${correct_answers ?? 0},
      ${wrong_answers ?? 0},
      ${quiz_attempts ?? 0},
      ${total_moves_earned ?? 0},
      NOW()
    )
    ON CONFLICT (user_id, game_mode) DO UPDATE SET
      unlocked_lessons  = EXCLUDED.unlocked_lessons,
      correct_answers   = EXCLUDED.correct_answers,
      wrong_answers     = EXCLUDED.wrong_answers,
      quiz_attempts     = EXCLUDED.quiz_attempts,
      total_moves_earned = EXCLUDED.total_moves_earned,
      updated_at        = NOW();
  `;

  let newAchievements: string[] = [];
  try {
    newAchievements = await evaluateProgressAchievements(user.id);
  } catch (err) {
    console.error('Failed to evaluate achievements:', err);
  }

  return NextResponse.json({ ok: true, newAchievements });
}
