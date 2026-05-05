import { NextResponse } from 'next/server';
import { db } from '@/app/_lib/server/db';

export async function GET() {
  // Get total users count
  const totalUsersResult = await db`
    SELECT COUNT(*) as count
    FROM public.thai_english_playland_users;
  `;
  const totalUsers = Number(totalUsersResult[0]?.count || 0);

  // Get users created over time (daily for last 30 days)
  const dailyUsersResult = await db`
    SELECT
      DATE(created_at) as date,
      COUNT(*) as count
    FROM public.thai_english_playland_users
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY date ASC;
  `;

  // Get users created over time (weekly for last 12 weeks)
  const weeklyUsersResult = await db`
    SELECT
      DATE_TRUNC('week', created_at) as week_start,
      COUNT(*) as count
    FROM public.thai_english_playland_users
    WHERE created_at >= NOW() - INTERVAL '12 weeks'
    GROUP BY DATE_TRUNC('week', created_at)
    ORDER BY week_start ASC;
  `;

  // Get users created over time (monthly for last 12 months)
  const monthlyUsersResult = await db`
    SELECT
      DATE_TRUNC('month', created_at) as month_start,
      COUNT(*) as count
    FROM public.thai_english_playland_users
    WHERE created_at >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY month_start ASC;
  `;

  // Get game mode popularity (by quiz attempts)
  const gameModePopularityResult = await db`
    SELECT
      game_mode,
      SUM(quiz_attempts) as total_attempts,
      COUNT(DISTINCT user_id) as unique_users
    FROM public.thai_english_playland_user_progress
    GROUP BY game_mode
    ORDER BY total_attempts DESC;
  `;

  // Get distribution of users across game modes
  const userDistributionResult = await db`
    SELECT
      game_mode,
      COUNT(DISTINCT user_id) as user_count
    FROM public.thai_english_playland_user_progress
    GROUP BY game_mode
    ORDER BY user_count DESC;
  `;

  // Get engagement metrics (averages per user)
  const engagementMetricsResult = await db`
    SELECT
      AVG(quiz_attempts) as avg_quiz_attempts,
      AVG(correct_answers) as avg_correct_answers,
      AVG(wrong_answers) as avg_wrong_answers,
      AVG(total_moves_earned) as avg_moves_earned,
      AVG(CASE WHEN quiz_attempts > 0 THEN (correct_answers::float / (correct_answers + wrong_answers)) * 100 ELSE 0 END) as avg_success_rate
    FROM public.thai_english_playland_user_progress
  `;

  // Get most active users leaderboard
  const mostActiveUsersResult = await db`
    SELECT
      u.username,
      SUM(p.quiz_attempts) as total_attempts,
      SUM(p.correct_answers) as total_correct,
      SUM(p.wrong_answers) as total_wrong,
      SUM(p.total_moves_earned) as total_moves
    FROM public.thai_english_playland_users u
    JOIN public.thai_english_playland_user_progress p ON u.id = p.user_id
    GROUP BY u.id, u.username
    ORDER BY total_attempts DESC
    LIMIT 10;
  `;

  // Get progress statistics by game mode
  const progressStatsResult = await db`
    SELECT
      game_mode,
      AVG(unlocked_lessons) as avg_unlocked_lessons,
      AVG(CASE WHEN quiz_attempts > 0 THEN (correct_answers::float / (correct_answers + wrong_answers)) * 100 ELSE 0 END) as avg_success_rate,
      COUNT(CASE WHEN unlocked_lessons >= 9 THEN 1 END) as completed_users,
      COUNT(DISTINCT user_id) as total_users_in_mode
    FROM public.thai_english_playland_user_progress
    GROUP BY game_mode
    ORDER BY game_mode;
  `;

  // Get quiz attempts over time (daily for last 30 days)
  const dailyActivityResult = await db`
    SELECT
      DATE(updated_at) as date,
      SUM(quiz_attempts) as total_attempts,
      COUNT(DISTINCT user_id) as active_users
    FROM public.thai_english_playland_user_progress
    WHERE updated_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(updated_at)
    ORDER BY date ASC;
  `;

  // Get peak activity periods (hour of day)
  const hourlyActivityResult = await db`
    SELECT
      EXTRACT(HOUR FROM updated_at) as hour,
      COUNT(*) as activity_count
    FROM public.thai_english_playland_user_progress
    WHERE updated_at >= NOW() - INTERVAL '30 days'
    GROUP BY EXTRACT(HOUR FROM updated_at)
    ORDER BY hour;
  `;

  // Get user retention (users who returned after 7 days)
  const retentionResult = await db`
    SELECT
      COUNT(DISTINCT CASE
        WHEN p.updated_at >= NOW() - INTERVAL '7 days'
        AND u.created_at < NOW() - INTERVAL '14 days'
        THEN p.user_id
      END) as returning_users,
      COUNT(DISTINCT p.user_id) as total_users
    FROM public.thai_english_playland_user_progress p
    JOIN public.thai_english_playland_users u ON p.user_id = u.id
    WHERE u.created_at <= NOW() - INTERVAL '14 days';
  `;

  return NextResponse.json({
    ok: true,
    data: {
      totalUsers,
      dailyUsers: dailyUsersResult.map((row) => ({
        date: row.date?.toISOString().split('T')[0] || '',
        count: Number(row.count || 0),
      })),
      weeklyUsers: weeklyUsersResult.map((row) => ({
        weekStart: row.week_start?.toISOString().split('T')[0] || '',
        count: Number(row.count || 0),
      })),
      monthlyUsers: monthlyUsersResult.map((row) => ({
        monthStart: row.month_start?.toISOString().split('T')[0] || '',
        count: Number(row.count || 0),
      })),
      gameModePopularity: gameModePopularityResult.map((row) => ({
        gameMode: row.game_mode,
        totalAttempts: Number(row.total_attempts || 0),
        uniqueUsers: Number(row.unique_users || 0),
      })),
      userDistribution: userDistributionResult.map((row) => ({
        gameMode: row.game_mode,
        userCount: Number(row.user_count || 0),
      })),
      engagementMetrics: {
        avgQuizAttempts: Number(engagementMetricsResult[0]?.avg_quiz_attempts || 0),
        avgCorrectAnswers: Number(engagementMetricsResult[0]?.avg_correct_answers || 0),
        avgWrongAnswers: Number(engagementMetricsResult[0]?.avg_wrong_answers || 0),
        avgMovesEarned: Number(engagementMetricsResult[0]?.avg_moves_earned || 0),
        avgSuccessRate: Number(engagementMetricsResult[0]?.avg_success_rate || 0),
      },
      mostActiveUsers: mostActiveUsersResult.map((row) => ({
        username: row.username,
        totalAttempts: Number(row.total_attempts || 0),
        totalCorrect: Number(row.total_correct || 0),
        totalWrong: Number(row.total_wrong || 0),
        totalMoves: Number(row.total_moves || 0),
      })),
      progressStats: progressStatsResult.map((row) => ({
        gameMode: row.game_mode,
        avgUnlockedLessons: Number(row.avg_unlocked_lessons || 0),
        avgSuccessRate: Number(row.avg_success_rate || 0),
        completedUsers: Number(row.completed_users || 0),
        totalUsersInMode: Number(row.total_users_in_mode || 0),
      })),
      activityOverTime: {
        dailyActivity: dailyActivityResult.map((row) => ({
          date: row.date?.toISOString().split('T')[0] || '',
          totalAttempts: Number(row.total_attempts || 0),
          activeUsers: Number(row.active_users || 0),
        })),
        hourlyActivity: hourlyActivityResult.map((row) => ({
          hour: Number(row.hour || 0),
          activityCount: Number(row.activity_count || 0),
        })),
        retention: {
          returningUsers: Number(retentionResult[0]?.returning_users || 0),
          totalUsers: Number(retentionResult[0]?.total_users || 0),
          retentionRate: retentionResult[0]?.total_users > 0
            ? ((Number(retentionResult[0]?.returning_users || 0) / Number(retentionResult[0]?.total_users || 1)) * 100)
            : 0,
        },
      },
    },
  });
}
