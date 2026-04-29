import { NextResponse } from 'next/server';
import { db } from '@/app/_lib/server/db';
import {
  SESSION_COOKIE_NAME,
  createSession,
  hashPassword,
  isValidPassword,
  isValidUsername,
} from '@/app/_lib/server/auth';

type RegisterBody = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as RegisterBody;
  const username = (body.username ?? '').trim();
  const password = body.password ?? '';

  if (!isValidUsername(username)) {
    return NextResponse.json(
      { ok: false, error: 'Username must be 3-30 chars (letters, numbers, _ or -).' },
      { status: 400 },
    );
  }

  if (!isValidPassword(password)) {
    return NextResponse.json(
      { ok: false, error: 'Password must be at least 8 characters.' },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);

  try {
    const users = await db<Array<{ id: number; username: string; }>>`
      INSERT INTO public.thai_english_playland_users (username, password_hash)
      VALUES (${username}, ${passwordHash})
      RETURNING id, username;
    `;

    const user = users[0];
    const sessionToken = await createSession(user.id);
    const response = NextResponse.json({ ok: true, user });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    const errorCode =
      error && typeof error === 'object' && 'code' in error
        ? (error as { code?: string; }).code
        : undefined;

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      errorCode === '23505'
    ) {
      return NextResponse.json(
        { ok: false, error: 'Username already exists.' },
        { status: 409 },
      );
    }

    if (errorCode === '42P01') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Database tables are missing. Run db/init/001_schema.sql first.',
        },
        { status: 500 },
      );
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error('Registration error:', error);
      let dbDebug = 'unavailable';
      try {
        const dbUrl = process.env.POSTGRES_URL;
        if (dbUrl) {
          const parsed = new URL(dbUrl);
          dbDebug = `${parsed.username}@${parsed.hostname}:${parsed.port || '5432'}${parsed.pathname}`;
        } else {
          dbDebug = 'POSTGRES_URL not set';
        }
      } catch {
        dbDebug = 'invalid POSTGRES_URL';
      }
      return NextResponse.json(
        {
          ok: false,
          error: `Registration failed: ${error instanceof Error ? error.message : 'Unknown server error'
            } (db=${dbDebug})`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Registration failed.' },
      { status: 500 },
    );
  }
}
