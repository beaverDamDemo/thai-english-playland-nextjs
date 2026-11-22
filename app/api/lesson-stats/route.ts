import { NextResponse } from 'next/server';
import { db } from '@/app/_lib/server/db';

/** Per-lesson totals across all learners, for the Lesson Content page. Public, like usage statistics. */
export async function GET() {
  const rows = await db<
    Array<{ lesson_id: string; learners: number; completed: number; correct: number; wrong: number; attempts: number }>
  >`
    SELECT lesson_id,
      COUNT(*)::integer AS learners,
      COUNT(*) FILTER (WHERE completed_at IS NOT NULL)::integer AS completed,
      COALESCE(SUM(correct_answers), 0)::integer AS correct,
      COALESCE(SUM(wrong_answers), 0)::integer AS wrong,
      COALESCE(SUM(quiz_attempts), 0)::integer AS attempts
    FROM public.thai_english_playland_lesson_progress
    GROUP BY lesson_id;
  `;

  return NextResponse.json({
    ok: true,
    lessons: Object.fromEntries(rows.map(({ lesson_id, ...stats }) => [lesson_id, stats])),
  });
}
