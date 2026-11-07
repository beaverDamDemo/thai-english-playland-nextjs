import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { db } from '@/app/_lib/server/db';
import { getCurrentSessionUser } from '@/app/_lib/server/auth';
import { evaluateProgressAchievements } from '@/app/_lib/server/achievements';
import { isLessonStateComplete, isStatefulLessonId, isValidLessonState } from '@/app/games/starter/lessonState';

export async function GET(request: Request) {
  const user = await getCurrentSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Not authenticated.' }, { status: 401 });
  const lessonId = new URL(request.url).searchParams.get('lesson_id');
  if (!isStatefulLessonId(lessonId)) {
    return NextResponse.json({ ok: false, error: 'Invalid lesson_id.' }, { status: 400 });
  }

  try {
    const rows = await db<{ generation: string; state: unknown }[]>`
      INSERT INTO public.thai_english_playland_lesson_state (user_id, lesson_id, generation)
      VALUES (${user.id}, ${lessonId}, ${randomUUID()})
      ON CONFLICT (user_id, lesson_id) DO UPDATE SET lesson_id = EXCLUDED.lesson_id
      RETURNING generation, state;
    `;
    return NextResponse.json({ ok: true, generation: rows[0].generation, state: rows[0].state });
  } catch (error) {
    console.error('Failed to load lesson state:', error);
    return NextResponse.json({ ok: false, error: 'Could not load lesson progress.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getCurrentSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: 'Not authenticated.' }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 });
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }
  const { lesson_id: lessonId, generation, state } = body as Record<string, unknown>;
  if (!isStatefulLessonId(lessonId) || typeof generation !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(generation) ||
      !isValidLessonState(lessonId, state)) {
    return NextResponse.json({ ok: false, error: 'Invalid lesson state.' }, { status: 400 });
  }

  const completed = isLessonStateComplete(lessonId, state);
  try {
    const saved = await db.begin(async (sql) => {
      const rows = await sql.unsafe<{ generation: string }[]>(`
        UPDATE public.thai_english_playland_lesson_state
        SET state = $1::jsonb, updated_at = NOW()
        WHERE user_id = $2 AND lesson_id = $3 AND generation = $4::uuid
        RETURNING generation;
      `, [sql.json(state), user.id, lessonId, generation]);
      if (!rows.length) return false;
      if (completed) {
        await sql.unsafe(`
          INSERT INTO public.thai_english_playland_user_progress AS p (user_id, game_mode, unlocked_lessons)
          VALUES ($1, 'starter', $2)
          ON CONFLICT (user_id, game_mode) DO UPDATE SET
            unlocked_lessons = GREATEST(p.unlocked_lessons, EXCLUDED.unlocked_lessons),
            updated_at = NOW();
        `, [user.id, lessonId === 'color-mixing' ? 3 : 5]);
        await sql.unsafe(`
          INSERT INTO public.thai_english_playland_lesson_progress AS p (user_id, lesson_id, completed_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (user_id, lesson_id) DO UPDATE SET
            completed_at = COALESCE(p.completed_at, EXCLUDED.completed_at),
            updated_at = NOW();
        `, [user.id, lessonId]);
      }
      return true;
    });
    if (!saved) {
      return NextResponse.json({ ok: false, error: 'Progress was reset. Reload the lesson.' }, { status: 409 });
    }
    if (completed) {
      try {
        await evaluateProgressAchievements(user.id);
      } catch (error) {
        console.error('Failed to evaluate achievements:', error);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to save lesson state:', error);
    return NextResponse.json({ ok: false, error: 'Could not save lesson progress.' }, { status: 500 });
  }
}
