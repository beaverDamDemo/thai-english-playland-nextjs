import { NextResponse } from 'next/server';
import { db } from '@/app/_lib/server/db';
import { getCurrentSessionUser, SESSION_COOKIE_NAME } from '@/app/_lib/server/auth';

export async function DELETE() {
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'Not authenticated.' },
      { status: 401 },
    );
  }

  try {
    // Delete user's progress data
    await db`
      DELETE FROM public.thai_english_playland_user_progress
      WHERE user_id = ${user.id};
    `;

    // Delete user account
    await db`
      DELETE FROM public.thai_english_playland_users
      WHERE id = ${user.id};
    `;

    const response = NextResponse.json({ ok: true });

    // Clear session cookie
    response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to delete account.' },
      { status: 500 },
    );
  }
}
