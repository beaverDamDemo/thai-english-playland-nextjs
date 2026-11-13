import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import postgres from 'postgres';

const envLine = readFileSync('.env.local', 'utf8').split(/\r?\n/)
  .find((line) => line.startsWith('DATABASE_URL='));
if (!envLine) throw new Error('DATABASE_URL is missing from .env.local.');
const databaseUrl = envLine.slice('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
const parsedUrl = new URL(databaseUrl);
if (!['localhost', '127.0.0.1', '[::1]'].includes(parsedUrl.hostname)) {
  throw new Error('Schema integration tests require a local database.');
}

test('lesson migrations preserve existing data on first application and reapplication', async () => {
  const databaseName = `playland_schema_test_${randomBytes(8).toString('hex')}`;
  const admin = postgres(databaseUrl, { max: 1 });
  let created = false;
  let db;
  try {
    await admin`CREATE DATABASE ${admin(databaseName)}`;
    created = true;
    parsedUrl.pathname = `/${databaseName}`;
    db = postgres(parsedUrl.toString(), { max: 1 });
    const migration = async (name) => {
      await db.unsafe(readFileSync(`db/init/${name}`, 'utf8'));
    };
    for (const name of ['001_schema.sql', '002_achievements.sql', '003_daily_lesson_activity.sql']) {
      await migration(name);
    }
    const [user] = await db`
      INSERT INTO public.thai_english_playland_users (username, password_hash)
      VALUES ('migration_test', 'test-only') RETURNING id
    `;
    await db`INSERT INTO public.thai_english_playland_user_progress (user_id, game_mode, correct_answers)
      VALUES (${user.id}, 'starter', 7)`;
    await db`INSERT INTO public.thai_english_playland_user_sessions (user_id, session_token, expires_at)
      VALUES (${user.id}, 'migration-test-token', NOW() + INTERVAL '1 hour')`;
    await db`INSERT INTO public.thai_english_playland_achievement_definitions
      VALUES ('test', 'test', 'test', 'x', 'special', 1)`;
    await db`INSERT INTO public.thai_english_playland_user_achievements (user_id, achievement_id)
      VALUES (${user.id}, 'test')`;
    await db`INSERT INTO public.thai_english_playland_user_streak_state (user_id, current_streak)
      VALUES (${user.id}, 3)`;
    await db`INSERT INTO public.thai_english_playland_daily_lesson_activity (user_id, activity_date)
      VALUES (${user.id}, CURRENT_DATE)`;
    await db`UPDATE public.thai_english_playland_activity_tracking SET started_at = '2020-01-01'`;

    await migration('004_lesson_progress.sql');
    await db`INSERT INTO public.thai_english_playland_lesson_progress (user_id, lesson_id)
      VALUES (${user.id}, 'color-mixing')`;
    await migration('005_account_lesson_state.sql');
    await db`INSERT INTO public.thai_english_playland_lesson_state (user_id, lesson_id, generation, state)
      VALUES (${user.id}, 'color-mixing', '00000000-0000-0000-0000-000000000001', '{"level":1}')`;

    for (const name of ['004_lesson_progress.sql', '005_account_lesson_state.sql']) {
      await migration(name);
    }
    const [result] = await db`
      SELECT
        (SELECT correct_answers FROM public.thai_english_playland_user_progress WHERE user_id = ${user.id}) AS answers,
        (SELECT current_streak FROM public.thai_english_playland_user_streak_state WHERE user_id = ${user.id}) AS streak,
        (SELECT COUNT(*)::int FROM public.thai_english_playland_user_achievements WHERE user_id = ${user.id}) AS achievements,
        (SELECT COUNT(*)::int FROM public.thai_english_playland_user_sessions WHERE user_id = ${user.id}) AS sessions,
        (SELECT COUNT(*)::int FROM public.thai_english_playland_daily_lesson_activity WHERE user_id = ${user.id}) AS activity,
        (SELECT COUNT(*)::int FROM public.thai_english_playland_lesson_progress WHERE user_id = ${user.id}) AS lessons,
        (SELECT state->>'level' FROM public.thai_english_playland_lesson_state WHERE user_id = ${user.id}) AS level,
        (SELECT started_at::text FROM public.thai_english_playland_activity_tracking WHERE id = 1) AS tracking_start
    `;
    assert.deepEqual({ ...result }, {
      answers: 7, streak: 3, achievements: 1, sessions: 1, activity: 1,
      lessons: 1, level: '1', tracking_start: '2020-01-01',
    });
  } finally {
    if (db) await db.end();
    if (created) await admin`DROP DATABASE ${admin(databaseName)}`;
    await admin.end();
  }
});
