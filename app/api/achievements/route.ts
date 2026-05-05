import { NextResponse } from 'next/server';
import { getCurrentSessionUser } from '@/app/_lib/server/auth';
import {
  ACHIEVEMENTS,
  getUserAchievements,
  seedAchievementDefinitions,
} from '@/app/_lib/server/achievements';

export async function GET() {
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'Not authenticated.' },
      { status: 401 },
    );
  }

  await seedAchievementDefinitions();
  const earned = await getUserAchievements(user.id);

  return NextResponse.json({
    ok: true,
    definitions: ACHIEVEMENTS,
    earned,
  });
}
