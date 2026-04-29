import { NextResponse } from 'next/server';
import { db } from '@/app/_lib/server/db';
import { getCurrentSessionUser } from '@/app/_lib/server/auth';

export async function GET() {
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const userCountRows = await db<Array<{ total: number; }>>`
    SELECT COUNT(*)::int AS total
    FROM public.thai_english_playland_users;
  `;

  return NextResponse.json({
    ok: true,
    requestedBy: user.username,
    totalUsers: userCountRows[0]?.total ?? 0,
  });
}
