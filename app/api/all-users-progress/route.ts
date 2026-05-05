import { NextResponse } from 'next/server';
import { db } from '@/app/_lib/server/db';

export async function GET() {
  const rows = await db`
    SELECT
      u.id,
      u.username,
      u.created_at,
      p.game_mode,
      p.unlocked_lessons,
      p.correct_answers,
      p.wrong_answers,
      p.quiz_attempts,
      p.total_moves_earned,
      p.updated_at as progress_updated_at
    FROM public.thai_english_playland_users u
    LEFT JOIN public.thai_english_playland_user_progress p ON u.id = p.user_id
    ORDER BY u.created_at DESC, p.game_mode;
  `;

  // Group by user
  type UserWithProgress = {
    id: number;
    username: string;
    created_at: Date;
    maze: { unlocked_lessons: number; correct_answers: number; wrong_answers: number; quiz_attempts: number; total_moves_earned: number; };
    casino: { unlocked_lessons: number; correct_answers: number; wrong_answers: number; quiz_attempts: number; total_moves_earned: number; };
    pattaya: { unlocked_lessons: number; correct_answers: number; wrong_answers: number; quiz_attempts: number; total_moves_earned: number; };
    last_active: Date | null;
  };

  const usersMap = new Map<number, UserWithProgress>();

  for (const row of rows) {
    if (!usersMap.has(row.id)) {
      usersMap.set(row.id, {
        id: row.id,
        username: row.username,
        created_at: row.created_at,
        maze: { unlocked_lessons: 1, correct_answers: 0, wrong_answers: 0, quiz_attempts: 0, total_moves_earned: 0 },
        casino: { unlocked_lessons: 1, correct_answers: 0, wrong_answers: 0, quiz_attempts: 0, total_moves_earned: 0 },
        pattaya: { unlocked_lessons: 1, correct_answers: 0, wrong_answers: 0, quiz_attempts: 0, total_moves_earned: 0 },
        last_active: row.progress_updated_at || null,
      });
    } else {
      const user = usersMap.get(row.id)!;
      // Update last_active to the most recent progress update
      if (row.progress_updated_at && (!user.last_active || row.progress_updated_at > user.last_active)) {
        user.last_active = row.progress_updated_at;
      }
    }

    const user = usersMap.get(row.id);
    if (row.game_mode && user && user[row.game_mode as keyof UserWithProgress]) {
      (user[row.game_mode as keyof UserWithProgress] as UserWithProgress[keyof UserWithProgress]) = {
        unlocked_lessons: row.unlocked_lessons,
        correct_answers: row.correct_answers,
        wrong_answers: row.wrong_answers,
        quiz_attempts: row.quiz_attempts,
        total_moves_earned: row.total_moves_earned,
      };
    }
  }

  const users = Array.from(usersMap.values());
  return NextResponse.json({ ok: true, users });
}
