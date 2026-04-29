import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from './db';

export const SESSION_COOKIE_NAME = 'playland_session';
const SESSION_TTL_DAYS = 30;

type PasswordParts = {
  salt: string;
  hash: string;
};

function parsePasswordHash(passwordHash: string): PasswordParts | null {
  const [salt, hash] = passwordHash.split(':');
  if (!salt || !hash) return null;
  return { salt, hash };
}

function hashWithSalt(password: string, salt: string) {
  return new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(derivedKey.toString('hex'));
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await hashWithSalt(password, salt);
  return `${salt}:${hash}`;
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  const parsed = parsePasswordHash(passwordHash);
  if (!parsed) return false;

  const computedHash = await hashWithSalt(password, parsed.salt);
  const left = Buffer.from(computedHash, 'hex');
  const right = Buffer.from(parsed.hash, 'hex');

  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_-]{3,30}$/.test(username);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export async function createSession(userId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await db`
    INSERT INTO public.thai_english_playland_user_sessions (user_id, session_token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()});
  `;

  return token;
}

export async function getCurrentSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const rows = await db<Array<{ id: number; username: string; }>>`
    SELECT u.id, u.username
    FROM public.thai_english_playland_user_sessions s
    JOIN public.thai_english_playland_users u ON u.id = s.user_id
    WHERE s.session_token = ${token}
      AND s.expires_at > NOW()
    LIMIT 1;
  `;

  return rows[0] ?? null;
}

export async function clearSessionToken(token: string): Promise<void> {
  await db`
    DELETE FROM public.thai_english_playland_user_sessions
    WHERE session_token = ${token};
  `;
}
