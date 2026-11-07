import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import postgres from 'postgres';

const envLine = readFileSync('.env.local', 'utf8').split(/\r?\n/)
  .find((line) => line.startsWith('DATABASE_URL='));
if (!envLine) throw new Error('DATABASE_URL is missing from .env.local.');
const databaseUrl = envLine.slice('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
const baseUrl = process.env.TEST_BASE_URL ?? 'http://localhost:4200';
const localHosts = ['localhost', '127.0.0.1', '[::1]'];
if (!localHosts.includes(new URL(databaseUrl).hostname) || !localHosts.includes(new URL(baseUrl).hostname)) {
  throw new Error('Integration tests require a local database and server.');
}

test('lesson state is account-bound, resumable and invalidated by resets', async () => {
  const db = postgres(databaseUrl, { max: 1 });
  const users = [];
  try {
    for (let i = 0; i < 2; i++) {
      const username = `test_state_${randomBytes(6).toString('hex')}`;
      const token = randomBytes(32).toString('hex');
      const [user] = await db`
        INSERT INTO public.thai_english_playland_users (username, password_hash)
        VALUES (${username}, 'test-only') RETURNING id
      `;
      users.push({ id: user.id, username, token });
      await db`
        INSERT INTO public.thai_english_playland_user_sessions (user_id, session_token, expires_at)
        VALUES (${user.id}, ${token}, NOW() + INTERVAL '1 hour')
      `;
    }

    async function request(user, path, method = 'GET', body) {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', Cookie: `playland_session=${user.token}` },
        body: body === undefined ? undefined : JSON.stringify(body),
        redirect: 'manual',
      });
      return { status: response.status, body: await response.json() };
    }
    const [first, second] = users;
    const load = (user, id) => request(user, `/api/lesson-state?lesson_id=${id}`);
    const save = (user, id, generation, state) =>
      request(user, '/api/lesson-state', 'PUT', { lesson_id: id, generation, state });

    const initial = await load(first, 'color-mixing');
    assert.equal(initial.status, 200);
    assert.equal(initial.body.state, null);
    const generation = initial.body.generation;
    assert.equal((await save(first, 'color-mixing', generation, { level: 2, matchedColors: ['blue'] })).status, 200);
    assert.deepEqual((await load(first, 'color-mixing')).body.state, { level: 2, matchedColors: ['blue'] });

    const other = await load(second, 'color-mixing');
    assert.equal(other.body.state, null);
    assert.notEqual(other.body.generation, generation);
    assert.equal((await save(second, 'color-mixing', generation, { level: 1, matchedColors: [] })).status, 409);
    assert.equal((await save(first, 'color-mixing', generation, { level: 1, matchedColors: ['purple'] })).status, 400);

    const finalColors = ['blue', 'yellow', 'green', 'orange', 'purple', 'gray', 'pink', 'brown', 'black', 'white'];
    assert.equal((await save(first, 'color-mixing', generation, { level: 4, matchedColors: finalColors })).status, 200);
    const animal = await load(first, 'animals');
    assert.equal((await save(first, 'animals', animal.body.generation, { finishedLevels: [true, true, true, true] })).status, 200);
    const progress = await request(first, '/api/progress');
    for (const id of ['color-mixing', 'animals']) {
      assert.ok(progress.body.lessons.some((lesson) => lesson.lesson_id === id && lesson.completed_at));
    }
    const achievements = await db`
      SELECT achievement_id FROM public.thai_english_playland_user_achievements WHERE user_id = ${first.id}
    `;
    assert.ok(achievements.some((achievement) => achievement.achievement_id === 'lessons_1'));
    assert.equal((await request(first, '/api/progress', 'POST', {
      game_mode: 'starter', lesson_id: 'animals', delta: true, completed: true,
    })).status, 409);

    assert.equal((await request(first, '/api/progress', 'POST', {
      game_mode: 'starter', unlocked_lessons: 1, correct_answers: 0,
      wrong_answers: 0, quiz_attempts: 0, total_moves_earned: 0,
    })).status, 200);
    assert.equal((await save(first, 'color-mixing', generation, { level: 1, matchedColors: ['red'] })).status, 409);
    assert.equal((await save(first, 'animals', animal.body.generation, { finishedLevels: [true, true, true, true] })).status, 409);
    const afterReset = await load(first, 'color-mixing');
    assert.equal(afterReset.body.state, null);
    assert.notEqual(afterReset.body.generation, generation);
    const resetProgress = await request(first, '/api/progress');
    assert.ok(!resetProgress.body.lessons.some((lesson) => ['color-mixing', 'animals'].includes(lesson.lesson_id)));
  } finally {
    for (const user of users) {
      await db`DELETE FROM public.thai_english_playland_users WHERE id = ${user.id} AND username = ${user.username}`;
    }
    await db.end();
  }
});
