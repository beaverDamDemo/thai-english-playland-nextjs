import { NextResponse } from 'next/server';
import { db } from '@/app/_lib/server/db';
import {
  SESSION_COOKIE_NAME,
  createSession,
  verifyPassword,
} from '@/app/_lib/server/auth';

type LoginBody = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const username = (body.username ?? '').trim();
  const password = body.password ?? '';

  if (!username || !password) {
    return NextResponse.json(
      { ok: false, error: 'Missing username or password.' },
      { status: 400 },
    );
  }

  const users = await db<Array<{ id: number; username: string; password_hash: string; }>>`
    SELECT id, username, password_hash
    FROM public.thai_english_playland_users
    WHERE username = ${username}
    LIMIT 1;
  `;
  const user = users[0];

  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'Invalid username or password.' },
      { status: 401 },
    );
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json(
      { ok: false, error: 'Invalid username or password.' },
      { status: 401 },
    );
  }

  const sessionToken = await createSession(user.id);
  const response = NextResponse.json({
    ok: true,
    user: { id: user.id, username: user.username },
  });

  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
