import { NextResponse } from "next/server";
import { db } from "@/app/_lib/server/db";
import { getCurrentSessionUser } from "@/app/_lib/server/auth";
import { evaluateProgressAchievements } from "@/app/_lib/server/achievements";

export type GameMode = "maze" | "casino" | "pattaya" | "starter";

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
    return NextResponse.json(
      { ok: false, error: "Not authenticated." },
      { status: 401 },
    );
  }

  const rows = await db<ProgressRow[]>`
    SELECT game_mode, unlocked_lessons, correct_answers, wrong_answers, quiz_attempts, total_moves_earned
    FROM public.thai_english_playland_user_progress
    WHERE user_id = ${user.id};
  `;

  const progress: Record<GameMode, Omit<ProgressRow, "game_mode">> = {
    maze: {
      unlocked_lessons: 1,
      correct_answers: 0,
      wrong_answers: 0,
      quiz_attempts: 0,
      total_moves_earned: 0,
    },
    casino: {
      unlocked_lessons: 1,
      correct_answers: 0,
      wrong_answers: 0,
      quiz_attempts: 0,
      total_moves_earned: 0,
    },
    pattaya: {
      unlocked_lessons: 1,
      correct_answers: 0,
      wrong_answers: 0,
      quiz_attempts: 0,
      total_moves_earned: 0,
    },
    starter: {
      unlocked_lessons: 1,
      correct_answers: 0,
      wrong_answers: 0,
      quiz_attempts: 0,
      total_moves_earned: 0,
    },
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
  delta?: boolean;
  unlocked_lessons?: number;
  correct_answers?: number;
  wrong_answers?: number;
  quiz_attempts?: number;
  total_moves_earned?: number;
};

export async function POST(request: Request) {
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as SaveBody;
  const {
    game_mode,
    unlocked_lessons,
    correct_answers,
    wrong_answers,
    quiz_attempts,
    total_moves_earned,
  } = body;

  // console.log('POST /api/progress:', { user_id: user.id, game_mode, unlocked_lessons, correct_answers, wrong_answers, quiz_attempts, total_moves_earned });

  const validModes: GameMode[] = ["maze", "casino", "pattaya", "starter"];
  if (!game_mode || !validModes.includes(game_mode as GameMode)) {
    return NextResponse.json(
      { ok: false, error: "Invalid game_mode." },
      { status: 400 },
    );
  }

  try {
    if (body.delta === true) {
      // Counters are increments applied atomically, so clients never need to
      // read-then-write (which could overwrite newer data with stale totals).
      const inc = (v: unknown) =>
        typeof v === "number" && Number.isFinite(v)
          ? Math.max(0, Math.floor(v))
          : 0;
      const unlock =
        typeof unlocked_lessons === "number" && Number.isFinite(unlocked_lessons)
          ? Math.max(1, Math.floor(unlocked_lessons))
          : 1;
      await db`
        INSERT INTO public.thai_english_playland_user_progress AS p (user_id, game_mode, unlocked_lessons, correct_answers, wrong_answers, quiz_attempts, total_moves_earned, updated_at)
        VALUES (
          ${user.id}, ${game_mode},
          ${unlock},
          ${inc(correct_answers)},
          ${inc(wrong_answers)},
          ${inc(quiz_attempts)},
          ${inc(total_moves_earned)},
          NOW()
        )
        ON CONFLICT (user_id, game_mode) DO UPDATE SET
          unlocked_lessons   = GREATEST(p.unlocked_lessons, EXCLUDED.unlocked_lessons),
          correct_answers    = p.correct_answers + EXCLUDED.correct_answers,
          wrong_answers      = p.wrong_answers + EXCLUDED.wrong_answers,
          quiz_attempts      = p.quiz_attempts + EXCLUDED.quiz_attempts,
          total_moves_earned = p.total_moves_earned + EXCLUDED.total_moves_earned,
          updated_at         = NOW();
      `;
    } else {
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
    }
    if (body.delta === true) {
      await db`
        INSERT INTO public.thai_english_playland_daily_lesson_activity
          (activity_date, user_id)
        VALUES (CURRENT_DATE, ${user.id})
        ON CONFLICT (activity_date, user_id) DO NOTHING;
      `;
    }
    // console.log('POST /api/progress: Successfully saved');
  } catch (err) {
    console.error("POST /api/progress: Database error:", err);
    return NextResponse.json(
      { ok: false, error: "Database error." },
      { status: 500 },
    );
  }

  let newAchievements: string[] = [];
  try {
    newAchievements = await evaluateProgressAchievements(user.id);
  } catch (err) {
    console.error("Failed to evaluate achievements:", err);
  }

  return NextResponse.json({ ok: true, newAchievements });
}
