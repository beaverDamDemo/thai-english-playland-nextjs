import { NextResponse } from 'next/server';
import { db } from '@/app/_lib/server/db';
import { getCurrentSessionUser } from '@/app/_lib/server/auth';
import { seedAchievementDefinitions } from '@/app/_lib/server/achievements';

type EventBody =
  | { type: 'streak'; threshold: number }
  | { type: 'comeback' }
  | { type: 'perfect_lesson' };

export async function POST(request: Request) {
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'Not authenticated.' },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as EventBody | null;
  if (!body || typeof body !== 'object' || !('type' in body)) {
    return NextResponse.json(
      { ok: false, error: 'Invalid body.' },
      { status: 400 },
    );
  }

  let achievementId: string | null = null;
  if (body.type === 'streak') {
    if (body.threshold === 5) achievementId = 'streak_5';
    else if (body.threshold === 10) achievementId = 'streak_10';
    else if (body.threshold === 15) achievementId = 'streak_15';
  } else if (body.type === 'comeback') {
    achievementId = 'comeback';
  } else if (body.type === 'perfect_lesson') {
    achievementId = 'perfect_lesson';
  }

  if (!achievementId) {
    return NextResponse.json(
      { ok: false, error: 'Unknown event type.' },
      { status: 400 },
    );
  }

  await seedAchievementDefinitions();
  await db`
    INSERT INTO public.thai_english_playland_user_achievements (user_id, achievement_id)
    VALUES (${user.id}, ${achievementId})
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  `;

  return NextResponse.json({ ok: true, achievementId });
}
