import { NextResponse } from "next/server";
import { db } from "@/app/_lib/server/db";
import { getCurrentSessionUser } from "@/app/_lib/server/auth";
import { evaluateProgressAchievements } from "@/app/_lib/server/achievements";
import { curriculumZones } from "@/app/games/curriculum";

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

  const lessons = await db`
    SELECT lesson_id, started_at, completed_at, correct_answers, wrong_answers, quiz_attempts, total_moves_earned
    FROM public.thai_english_playland_lesson_progress
    WHERE user_id = ${user.id};
  `;

  return NextResponse.json({ ok: true, progress, lessons });
}

type SaveBody = {
  game_mode?: string;
  lesson_id?: string;
  completed?: boolean;
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
  if (
    body.lesson_id !== undefined &&
    !curriculumZones.some((zone) =>
      zone.lessons.some((lesson) => lesson.id === body.lesson_id && lesson.href),
    )
  ) {
    return NextResponse.json(
      { ok: false, error: "Invalid lesson_id." },
      { status: 400 },
    );
  }
  if (body.completed !== undefined && typeof body.completed !== "boolean") {
    return NextResponse.json(
      { ok: false, error: "Invalid completed value." },
      { status: 400 },
    );
  }

  try {
    await db.begin(async (sql) => {
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
      await sql.unsafe(`
        INSERT INTO public.thai_english_playland_user_progress AS p (user_id, game_mode, unlocked_lessons, correct_answers, wrong_answers, quiz_attempts, total_moves_earned, updated_at)
        VALUES (
          $1, $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          NOW()
        )
        ON CONFLICT (user_id, game_mode) DO UPDATE SET
          unlocked_lessons   = GREATEST(p.unlocked_lessons, EXCLUDED.unlocked_lessons),
          correct_answers    = p.correct_answers + EXCLUDED.correct_answers,
          wrong_answers      = p.wrong_answers + EXCLUDED.wrong_answers,
          quiz_attempts      = p.quiz_attempts + EXCLUDED.quiz_attempts,
          total_moves_earned = p.total_moves_earned + EXCLUDED.total_moves_earned,
          updated_at         = NOW();
      `, [user.id, game_mode, unlock, inc(correct_answers), inc(wrong_answers), inc(quiz_attempts), inc(total_moves_earned)]);
      if (body.lesson_id) {
        await sql.unsafe(`
          INSERT INTO public.thai_english_playland_lesson_progress AS p
            (user_id, lesson_id, completed_at, correct_answers, wrong_answers, quiz_attempts, total_moves_earned)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (user_id, lesson_id) DO UPDATE SET
            completed_at = COALESCE(p.completed_at, EXCLUDED.completed_at),
            correct_answers = p.correct_answers + EXCLUDED.correct_answers,
            wrong_answers = p.wrong_answers + EXCLUDED.wrong_answers,
            quiz_attempts = p.quiz_attempts + EXCLUDED.quiz_attempts,
            total_moves_earned = p.total_moves_earned + EXCLUDED.total_moves_earned,
            updated_at = NOW();
        `, [user.id, body.lesson_id, body.completed === true ? new Date() : null,
          inc(correct_answers), inc(wrong_answers), inc(quiz_attempts), inc(total_moves_earned)]);
      }
    } else {
    await sql.unsafe(`
      INSERT INTO public.thai_english_playland_user_progress (user_id, game_mode, unlocked_lessons, correct_answers, wrong_answers, quiz_attempts, total_moves_earned, updated_at)
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        NOW()
      )
      ON CONFLICT (user_id, game_mode) DO UPDATE SET
        unlocked_lessons  = EXCLUDED.unlocked_lessons,
        correct_answers   = EXCLUDED.correct_answers,
        wrong_answers     = EXCLUDED.wrong_answers,
        quiz_attempts     = EXCLUDED.quiz_attempts,
        total_moves_earned = EXCLUDED.total_moves_earned,
        updated_at        = NOW();
    `, [user.id, game_mode, unlocked_lessons ?? 1, correct_answers ?? 0,
      wrong_answers ?? 0, quiz_attempts ?? 0, total_moves_earned ?? 0]);
    if (
      unlocked_lessons === 1 &&
      correct_answers === 0 &&
      wrong_answers === 0 &&
      quiz_attempts === 0 &&
      total_moves_earned === 0
    ) {
      const lessonIds = curriculumZones.flatMap((zone) =>
        zone.lessons.filter((lesson) => {
          const href = lesson.href;
          if (!href) return false;
          if (game_mode === "starter") return href.startsWith("/games/starter/");
          if (game_mode === "casino") return href.startsWith("/games/casino/");
          if (game_mode === "pattaya") return href.startsWith("/games/pattaya-games/");
          return href.startsWith("/games/maze/") ||
            href.startsWith("/games/basic-grammar/") ||
            href.startsWith("/games/verbs-communication/");
        }).map((lesson) => lesson.id),
      );
      if (lessonIds.length) {
        await sql.unsafe(`
          DELETE FROM public.thai_english_playland_lesson_progress
          WHERE user_id = $1 AND lesson_id = ANY($2::text[]);
        `, [user.id, lessonIds]);
      }
    }
    }
    if (body.delta === true) {
      await sql.unsafe(`
        INSERT INTO public.thai_english_playland_daily_lesson_activity
          (activity_date, user_id)
        VALUES (CURRENT_DATE, $1)
        ON CONFLICT (activity_date, user_id) DO NOTHING;
      `, [user.id]);
    }
    });
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
