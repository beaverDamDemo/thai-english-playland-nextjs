import { NextResponse } from "next/server";
import { db } from "@/app/_lib/server/db";
import { getCurrentSessionUser } from "@/app/_lib/server/auth";
import { curriculumZones, type CurriculumZoneId } from "@/app/_games/curriculum";

type ResetBody = { zone?: CurriculumZoneId | "all" };

/**
 * Resets a learner's progress for one curriculum zone (or everything).
 *
 * Zone reset clears the per-lesson records that zones and lesson footers read:
 * lesson_progress rows and saved lesson_state (e.g. Color Mixing, Animals) for
 * every lesson in that zone. Legacy per-game-mode counters in user_progress are
 * keyed by code folder, not by zone, so they are only reset by "all".
 */
export async function POST(request: Request) {
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as ResetBody;
  const zone = body.zone;
  const target = zone === "all" ? null : curriculumZones.find((z) => z.id === zone);
  if (zone !== "all" && !target) {
    return NextResponse.json({ ok: false, error: "Invalid zone." }, { status: 400 });
  }

  try {
    await db.begin(async (sql) => {
      if (zone === "all") {
        await sql.unsafe(
          `DELETE FROM public.thai_english_playland_lesson_progress WHERE user_id = $1;`,
          [user.id],
        );
        await sql.unsafe(
          `DELETE FROM public.thai_english_playland_lesson_state WHERE user_id = $1;`,
          [user.id],
        );
        await sql.unsafe(
          `UPDATE public.thai_english_playland_user_progress
           SET unlocked_lessons = 1, correct_answers = 0, wrong_answers = 0,
               quiz_attempts = 0, total_moves_earned = 0, updated_at = NOW()
           WHERE user_id = $1;`,
          [user.id],
        );
        return;
      }

      const lessonIds = target!.lessons.map((lesson) => lesson.id);
      await sql.unsafe(
        `DELETE FROM public.thai_english_playland_lesson_progress
         WHERE user_id = $1 AND lesson_id = ANY($2::text[]);`,
        [user.id, lessonIds],
      );
      await sql.unsafe(
        `DELETE FROM public.thai_english_playland_lesson_state
         WHERE user_id = $1 AND lesson_id = ANY($2::text[]);`,
        [user.id, lessonIds],
      );
    });
  } catch (err) {
    console.error("POST /api/progress/reset: Database error:", err);
    return NextResponse.json({ ok: false, error: "Database error." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
