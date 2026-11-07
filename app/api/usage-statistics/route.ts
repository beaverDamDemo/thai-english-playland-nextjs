import { NextResponse } from "next/server";
import { db } from "@/app/_lib/server/db";

export async function GET() {
  // Get total users count
  const totalUsersResult = await db`
    SELECT COUNT(*) as count
    FROM public.thai_english_playland_users;
  `;
  const totalUsers = Number(totalUsersResult[0]?.count || 0);

  // Get users created on each of the last 30 calendar days, including today.
  const dailyUsersResult = await db`
    WITH days AS (
      SELECT generate_series(
        (CURRENT_DATE - 29)::timestamp,
        CURRENT_DATE::timestamp,
        INTERVAL '1 day'
      )::date AS day
    ),
    registrations AS (
      SELECT DATE(created_at) AS day, COUNT(*) AS count
      FROM public.thai_english_playland_users
      WHERE created_at >= CURRENT_DATE - 29
        AND created_at < CURRENT_DATE + 1
      GROUP BY DATE(created_at)
    )
    SELECT
      TO_CHAR(days.day, 'YYYY-MM-DD') AS date,
      COALESCE(registrations.count, 0) AS count
    FROM days
    LEFT JOIN registrations ON registrations.day = days.day
    ORDER BY days.day ASC;
  `;

  // Get users created in each of the last 12 calendar weeks, including this week.
  const weeklyUsersResult = await db`
    WITH weeks AS (
      SELECT generate_series(
        DATE_TRUNC('week', CURRENT_DATE::timestamp) - INTERVAL '11 weeks',
        DATE_TRUNC('week', CURRENT_DATE::timestamp),
        INTERVAL '1 week'
      )::date AS week_start
    ),
    registrations AS (
      SELECT DATE_TRUNC('week', created_at)::date AS week_start, COUNT(*) AS count
      FROM public.thai_english_playland_users
      WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE::timestamp) - INTERVAL '11 weeks'
        AND created_at < DATE_TRUNC('week', CURRENT_DATE::timestamp) + INTERVAL '1 week'
      GROUP BY DATE_TRUNC('week', created_at)::date
    )
    SELECT
      TO_CHAR(weeks.week_start, 'YYYY-MM-DD') AS week_start,
      COALESCE(registrations.count, 0) AS count
    FROM weeks
    LEFT JOIN registrations ON registrations.week_start = weeks.week_start
    ORDER BY weeks.week_start ASC;
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
    WITH game_modes (game_mode, sort_order) AS (
      VALUES ('starter', 1), ('maze', 2), ('casino', 3), ('pattaya', 4)
    )
    SELECT
      m.game_mode,
      COALESCE(SUM(p.quiz_attempts), 0) as total_attempts,
      COUNT(DISTINCT p.user_id) as unique_users
    FROM game_modes m
    LEFT JOIN public.thai_english_playland_user_progress p ON p.game_mode = m.game_mode
    GROUP BY m.game_mode, m.sort_order
    ORDER BY m.sort_order ASC;
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
    WITH game_modes (game_mode, total_lessons, sort_order) AS (
      VALUES ('starter', 7, 1), ('maze', 9, 2), ('casino', 6, 3), ('pattaya', 8, 4)
    )
    SELECT
      m.game_mode,
      COALESCE(AVG(p.unlocked_lessons), 0) as avg_unlocked_lessons,
      COALESCE(AVG(CASE WHEN p.quiz_attempts > 0 THEN (p.correct_answers::float / (p.correct_answers + p.wrong_answers)) * 100 ELSE 0 END), 0) as avg_success_rate,
      COUNT(CASE WHEN p.unlocked_lessons >= m.total_lessons THEN 1 END) as completed_users,
      COUNT(DISTINCT p.user_id) as total_users_in_mode
    FROM game_modes m
    LEFT JOIN public.thai_english_playland_user_progress p ON p.game_mode = m.game_mode
    GROUP BY m.game_mode, m.total_lessons, m.sort_order
    ORDER BY m.sort_order;
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

  // Count distinct users who opened at least one lesson on each tracked day.
  const dailyLessonUsersResult = await db`
    WITH tracking AS (
      SELECT started_at
      FROM public.thai_english_playland_activity_tracking
      WHERE id = 1
    ),
    activity_days AS (
      SELECT generate_series(
        GREATEST(CURRENT_DATE - 29, tracking.started_at)::timestamp,
        CURRENT_DATE::timestamp,
        INTERVAL '1 day'
      )::date AS activity_date
      FROM tracking
    )
    SELECT
      TO_CHAR(days.activity_date, 'YYYY-MM-DD') AS date,
      COUNT(activity.user_id) AS count,
      TO_CHAR(tracking.started_at, 'YYYY-MM-DD') AS tracking_started_at
    FROM tracking
    JOIN activity_days days ON TRUE
    LEFT JOIN public.thai_english_playland_daily_lesson_activity activity
      ON activity.activity_date = days.activity_date
    GROUP BY days.activity_date, tracking.started_at
    ORDER BY days.activity_date ASC;
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
        date: row.date,
        count: Number(row.count),
      })),
      weeklyUsers: weeklyUsersResult.map((row) => ({
        weekStart: row.week_start,
        count: Number(row.count),
      })),
      monthlyUsers: monthlyUsersResult.map((row) => ({
        monthStart: row.month_start?.toISOString().split("T")[0] || "",
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
        avgQuizAttempts: Number(
          engagementMetricsResult[0]?.avg_quiz_attempts || 0,
        ),
        avgCorrectAnswers: Number(
          engagementMetricsResult[0]?.avg_correct_answers || 0,
        ),
        avgWrongAnswers: Number(
          engagementMetricsResult[0]?.avg_wrong_answers || 0,
        ),
        avgMovesEarned: Number(
          engagementMetricsResult[0]?.avg_moves_earned || 0,
        ),
        avgSuccessRate: Number(
          engagementMetricsResult[0]?.avg_success_rate || 0,
        ),
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
        dailyLessonUsers: dailyLessonUsersResult.map((row) => ({
          date: row.date,
          count: Number(row.count || 0),
        })),
        lessonActivityTrackingStart:
          dailyLessonUsersResult[0]?.tracking_started_at || null,
        dailyActivity: dailyActivityResult.map((row) => ({
          date: row.date?.toISOString().split("T")[0] || "",
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
          retentionRate:
            retentionResult[0]?.total_users > 0
              ? (Number(retentionResult[0]?.returning_users || 0) /
                  Number(retentionResult[0]?.total_users || 1)) *
                100
              : 0,
        },
      },
    },
  });
}
