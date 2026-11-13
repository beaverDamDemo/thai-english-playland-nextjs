'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './usageStatistics.module.css';

type UserGrowthData = {
  totalUsers: number;
  zoneProgress: Array<{ id: string; title: string; icon: string; started: number; completed: number }>;
  dailyUsers: Array<{ date: string; count: number }>;
  weeklyUsers: Array<{ weekStart: string; count: number }>;
  monthlyUsers: Array<{ monthStart: string; count: number }>;
  gameModePopularity: Array<{
    gameMode: string;
    totalAttempts: number;
    uniqueUsers: number;
  }>;
  userDistribution: Array<{ gameMode: string; userCount: number }>;
  engagementMetrics: {
    avgQuizAttempts: number;
    avgCorrectAnswers: number;
    avgWrongAnswers: number;
    avgMovesEarned: number;
    avgSuccessRate: number;
  };
  mostActiveUsers: Array<{
    username: string;
    totalAttempts: number;
    totalCorrect: number;
    totalWrong: number;
    totalMoves: number;
  }>;
  progressStats: Array<{
    gameMode: string;
    avgUnlockedLessons: number;
    avgSuccessRate: number;
    completedUsers: number;
    totalUsersInMode: number;
  }>;
  activityOverTime: {
    dailyActivity: Array<{
      date: string;
      totalAttempts: number;
      activeUsers: number;
    }>;
    dailyLessonUsers: Array<{ date: string; count: number }>;
    lessonActivityTrackingStart: string | null;
    hourlyActivity: Array<{ hour: number; activityCount: number }>;
    retention: {
      returningUsers: number;
      totalUsers: number;
      retentionRate: number;
    };
  };
};

function getGameModeDetails(gameMode: string): { emoji: string; name: string } {
  if (gameMode === 'maze') return { emoji: '🐘', name: 'Chiang Mai' };
  if (gameMode === 'casino') return { emoji: '🎰', name: 'Golden Baht Casino' };
  if (gameMode === 'pattaya') return { emoji: '🏖️', name: 'Pattaya' };
  if (gameMode === 'starter') return { emoji: '🌱', name: 'Starter' };

  return {
    emoji: '🎮',
    name: gameMode.charAt(0).toUpperCase() + gameMode.slice(1),
  };
}

export default function UsageStatisticsPage() {
  const [data, setData] = useState<UserGrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>(
    'daily',
  );

  useEffect(() => {
    fetch('/api/usage-statistics')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch statistics');
        return res.json();
      })
      .then((response) => {
        if (response.ok) {
          setData(response.data);
        } else {
          throw new Error(response.error || 'Unknown error');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className={styles.container} aria-busy="true">
        <p className={styles.srOnly} role="status">
          Loading usage statistics
        </p>
        <div className={styles.header} aria-hidden="true">
          <span className={`${styles.skeleton} ${styles.skeletonBackLink}`} />
          <span className={`${styles.skeleton} ${styles.skeletonPageTitle}`} />
        </div>

        <div className={styles.content} aria-hidden="true">
          <section className={styles.card}>
            <span className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <div className={styles.skeletonTotal}>
              <span className={`${styles.skeleton} ${styles.skeletonMedium}`} />
              <span className={`${styles.skeleton} ${styles.skeletonNumber}`} />
            </div>
            <div className={styles.skeletonSelector}>
              <span className={`${styles.skeleton} ${styles.skeletonPill}`} />
              <span className={`${styles.skeleton} ${styles.skeletonPill}`} />
              <span className={`${styles.skeleton} ${styles.skeletonPill}`} />
            </div>
            <div className={styles.skeletonChart}>
              {Array.from({ length: 12 }, (_, index) => (
                <span
                  key={index}
                  className={`${styles.skeleton} ${styles.skeletonChartBar}`}
                />
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <span className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <span className={`${styles.skeleton} ${styles.skeletonDescription}`} />
            <div className={styles.skeletonDailyActivityChart}>
              {Array.from({ length: 12 }, (_, index) => (
                <span
                  key={index}
                  className={`${styles.skeleton} ${styles.skeletonDailyActivityBar}`}
                />
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <span className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <div className={styles.skeletonModeGrid}>
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className={styles.skeletonModeCard}>
                  <span className={`${styles.skeleton} ${styles.skeletonMedium}`} />
                  <span className={`${styles.skeleton} ${styles.skeletonShort}`} />
                  <span className={`${styles.skeleton} ${styles.skeletonProgress}`} />
                </div>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <span className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <div className={styles.skeletonMetricsGrid}>
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className={styles.skeletonMetricCard}>
                  <span className={`${styles.skeleton} ${styles.skeletonIcon}`} />
                  <span className={`${styles.skeleton} ${styles.skeletonMedium}`} />
                  <span className={`${styles.skeleton} ${styles.skeletonShort}`} />
                </div>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <span className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <div className={styles.skeletonLeaderboard}>
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className={styles.skeletonLeaderboardItem}>
                  <span className={`${styles.skeleton} ${styles.skeletonRank}`} />
                  <span className={`${styles.skeleton} ${styles.skeletonName}`} />
                  <span className={`${styles.skeleton} ${styles.skeletonStat}`} />
                  <span className={`${styles.skeleton} ${styles.skeletonStat}`} />
                  <span className={`${styles.skeleton} ${styles.skeletonStat}`} />
                </div>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <span className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <div className={styles.skeletonModeGrid}>
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className={styles.skeletonProgressCard}>
                  <span className={`${styles.skeleton} ${styles.skeletonMedium}`} />
                  <div className={styles.skeletonProgressMetrics}>
                    {Array.from({ length: 4 }, (_, metricIndex) => (
                      <span
                        key={metricIndex}
                        className={`${styles.skeleton} ${styles.skeletonShort}`}
                      />
                    ))}
                  </div>
                  <span className={`${styles.skeleton} ${styles.skeletonProgress}`} />
                </div>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <span className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <div className={styles.skeletonTotal}>
              <span className={`${styles.skeleton} ${styles.skeletonMedium}`} />
              <span className={`${styles.skeleton} ${styles.skeletonMedium}`} />
            </div>
            <div className={styles.skeletonHourlyChart}>
              {Array.from({ length: 24 }, (_, index) => (
                <span
                  key={index}
                  className={`${styles.skeleton} ${styles.skeletonHourTile}`}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!data) return <div className={styles.error}>No data available</div>;

  const chartData =
    timeframe === 'daily'
      ? data.dailyUsers
      : timeframe === 'weekly'
        ? data.weeklyUsers
        : data.monthlyUsers;
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  const growthBars = chartData.map((item) => {
    const date = 'date' in item ? item.date : 'weekStart' in item ? item.weekStart : item.monthStart;
    const label = new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      ...(timeframe === 'monthly' ? { year: '2-digit' } : { day: 'numeric' }),
    });
    return { date, label, count: item.count };
  });

  const maxDailyLessonUsers = Math.max(
    ...data.activityOverTime.dailyLessonUsers.map((day) => day.count),
    1,
  );

  const hourlyCounts = new Map(
    data.activityOverTime.hourlyActivity.map(({ hour, activityCount }) => [hour, activityCount]),
  );
  const maxHourlyActivity = Math.max(...hourlyCounts.values(), 0);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          Back to Home
        </Link>
        <h1 className={styles.title}>📈 Usage Statistics</h1>
      </header>

      <div className={styles.content}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>User Growth</h2>

          <div className={styles.totalUsers}>
            <span className={styles.totalUsersLabel}>Total Users</span>
            <span className={styles.totalUsersValue}>{data.totalUsers}</span>
          </div>

          <div className={styles.timeframeSelector}>
            <button
              className={`${styles.timeframeButton} ${timeframe === 'daily' ? styles.active : ''}`}
              onClick={() => setTimeframe('daily')}
            >
              Daily (30 days)
            </button>
            <button
              className={`${styles.timeframeButton} ${timeframe === 'weekly' ? styles.active : ''}`}
              onClick={() => setTimeframe('weekly')}
            >
              Weekly (12 weeks)
            </button>
            <button
              className={`${styles.timeframeButton} ${timeframe === 'monthly' ? styles.active : ''}`}
              onClick={() => setTimeframe('monthly')}
            >
              Monthly (12 months)
            </button>
          </div>

          <h3 id="user-growth-chart-title" className={styles.chartTitle}>
            New Users {timeframe === 'daily' ? 'per Day' : timeframe === 'weekly' ? 'per Week' : 'per Month'}
          </h3>
          <div className={styles.chartContainer} role="region" aria-labelledby="user-growth-chart-title" tabIndex={0}>
            <div className={`${styles.chart} ${timeframe === 'daily' ? styles.dailyGrowthChart : ''}`}>
              {growthBars.map((item) => (
                <div key={item.date} className={styles.barContainer} role="img" aria-label={`${timeframe === 'weekly' ? 'Week of ' : ''}${item.date}: ${item.count} new users`}>
                  <div className={styles.barTrack}>
                    <span className={styles.barValue}>{item.count}</span>
                    <div className={styles.bar} style={{ height: `${(item.count / maxCount) * 100}%` }} />
                  </div>
                  <span className={styles.barLabel}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Daily Lesson Participation</h2>
          <p className={styles.dailyLessonDescription}>
            Signed-in users who opened at least one lesson each day.
            {data.activityOverTime.lessonActivityTrackingStart
              ? ` Tracking started ${new Date(
                  `${data.activityOverTime.lessonActivityTrackingStart}T00:00:00`,
                ).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}.`
              : ' Daily tracking has not started yet.'}
          </p>
          {data.activityOverTime.dailyLessonUsers.length > 0 ? (
            <div
              className={styles.dailyLessonChartContainer}
              role="group"
              aria-label="Daily unique users who opened at least one lesson"
            >
              {(() => {
                const items = data.activityOverTime.dailyLessonUsers;
                const padL = 28;
                const padR = 16;
                const padT = 24;
                const padB = 32;
                const height = 250;
                const width = Math.max(1080, items.length * 36);
                const plotW = width - padL - padR;
                const plotH = height - padT - padB;
                const points = items.map((item, i) => ({
                  item,
                  x: padL + (items.length > 1 ? (i / (items.length - 1)) * plotW : plotW / 2),
                  y: padT + plotH - (item.count / maxDailyLessonUsers) * plotH,
                }));
                const path = points.map((p) => `${p.x},${p.y}`).join(' ');

                return (
                  <svg
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    role="list"
                  >
                    <line
                      x1={padL}
                      y1={padT + plotH}
                      x2={width - padR}
                      y2={padT + plotH}
                      stroke="#9ca3af"
                      strokeWidth="1"
                    />
                    <polyline
                      points={path}
                      fill="none"
                      stroke="#667eea"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    {points.map(({ item, x, y }) => {
                      const date = new Date(`${item.date}T00:00:00`);
                      const dateLabel = date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      });

                      return (
                        <g
                          key={item.date}
                          role="listitem"
                          aria-label={`${dateLabel}: ${item.count} signed-in ${item.count === 1 ? 'user' : 'users'} opened a lesson`}
                        >
                          <circle cx={x} cy={y} r="4" fill="#667eea" />
                          <text
                            x={x}
                            y={y - 9}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#888"
                          >
                            {item.count}
                          </text>
                          <text
                            x={x}
                            y={height - 10}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#888"
                          >
                            {dateLabel}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>
          ) : (
            <p className={styles.dailyLessonEmpty}>
              No lesson activity has been recorded yet.
            </p>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Game Mode Popularity</h2>

          <div className={styles.gameModeStats}>
            {data.gameModePopularity.map((mode) => {
              const maxAttempts = Math.max(
                ...data.gameModePopularity.map((m) => m.totalAttempts),
                1,
              );
              const maxUsers = Math.max(
                ...data.gameModePopularity.map((m) => m.uniqueUsers),
                1,
              );
              const barWidth = (mode.totalAttempts / maxAttempts) * 100;
              const { emoji: gameEmoji, name: gameName } = getGameModeDetails(mode.gameMode);

              return (
                <div
                  key={mode.gameMode}
                  className={styles.gameModeItem}
                  data-game={mode.gameMode}
                >
                  <div className={styles.gameModeHeader}>
                    <span className={styles.gameModeIcon}>{gameEmoji}</span>
                    <span className={styles.gameModeName}>{gameName}</span>
                  </div>
                  <div className={styles.gameModeMetrics}>
                    <div className={styles.metric}>
                      <span className={styles.metricLabel}>Quiz Attempts</span>
                      <span className={styles.metricValue}>
                        {mode.totalAttempts}
                      </span>
                    </div>
                    <div className={styles.metric}>
                      <span className={styles.metricLabel}>Unique Users</span>
                      <span className={styles.metricValue}>
                        {mode.uniqueUsers}
                      </span>
                    </div>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className={styles.progressBar} style={{ marginTop: 6 }}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${(mode.uniqueUsers / maxUsers) * 100}%`,
                        opacity: 0.6,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Engagement Metrics</h2>

          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricCardIcon}>🎯</span>
              <span className={styles.metricCardLabel}>Avg Quiz Attempts</span>
              <span className={styles.metricCardValue}>
                {data.engagementMetrics.avgQuizAttempts.toFixed(1)}
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricCardIcon}>✅</span>
              <span className={styles.metricCardLabel}>
                Avg Correct Answers
              </span>
              <span className={styles.metricCardValue}>
                {data.engagementMetrics.avgCorrectAnswers.toFixed(1)}
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricCardIcon}>❌</span>
              <span className={styles.metricCardLabel}>Avg Wrong Answers</span>
              <span className={styles.metricCardValue}>
                {data.engagementMetrics.avgWrongAnswers.toFixed(1)}
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricCardIcon}>👣</span>
              <span className={styles.metricCardLabel}>Avg Moves Earned</span>
              <span className={styles.metricCardValue}>
                {data.engagementMetrics.avgMovesEarned.toFixed(1)}
              </span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricCardIcon}>📊</span>
              <span className={styles.metricCardLabel}>Avg Success Rate</span>
              <span className={styles.metricCardValue}>
                {data.engagementMetrics.avgSuccessRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Most Active Users</h2>

          <div className={styles.leaderboard} role="table" aria-label="Most active users ranked by attempts">
            <div className={styles.leaderboardHeader} role="row">
              <span role="columnheader" aria-label="Rank">#</span>
              <span role="columnheader">Player</span>
              <div className={styles.leaderboardHeaderStats} role="presentation">
                <span role="columnheader">Attempts</span>
                <span role="columnheader">Success</span>
                <span role="columnheader">Moves</span>
              </div>
            </div>
            {data.mostActiveUsers.map((user, index) => {
              const successRate =
                user.totalCorrect + user.totalWrong > 0
                  ? (
                      (user.totalCorrect /
                        (user.totalCorrect + user.totalWrong)) *
                      100
                    ).toFixed(1)
                  : '0';
              const medal =
                index === 0
                  ? '🥇'
                  : index === 1
                    ? '🥈'
                    : index === 2
                      ? '🥉'
                      : `${index + 1}.`;
              const maskedUsername =
                user.username.slice(0, 2) +
                '*'.repeat(Math.max(user.username.length - 2, 0));

              return (
                <div key={user.username} className={styles.leaderboardItem} role="row">
                  <span className={styles.leaderboardRank} role="cell" aria-label={`Rank ${index + 1}`}>{medal}</span>
                  <span className={styles.leaderboardUsername} role="cell">
                    <span className={styles.leaderboardName} title={maskedUsername}>{maskedUsername}</span>
                  </span>
                  <div className={styles.leaderboardStats} role="presentation">
                    <span className={styles.leaderboardStat} role="cell">
                      <span className={styles.leaderboardStatValue}>
                        {user.totalAttempts}
                      </span>
                    </span>
                    <span className={styles.leaderboardStat} role="cell">
                      <span className={styles.leaderboardStatValue}>
                        {successRate}%
                      </span>
                    </span>
                    <span className={styles.leaderboardStat} role="cell">
                      <span className={styles.leaderboardStatValue}>
                        {user.totalMoves}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Curriculum Zone Progress</h2>
          <p>Counts represent individual learner-lesson records.</p>
          <div className={styles.progressStatsGrid}>
            {data.zoneProgress.map((zone) => (
              <div key={zone.id} className={styles.progressStatCard}>
                <div className={styles.progressStatHeader}>
                  <span className={styles.progressStatIcon}>{zone.icon}</span>
                  <span className={styles.progressStatName}>{zone.title}</span>
                </div>
                <div className={styles.progressStatMetrics}>
                  <div className={styles.progressMetric}>
                    <span className={styles.progressMetricLabel}>Lessons Started</span>
                    <span className={styles.progressMetricValue}>{zone.started}</span>
                  </div>
                  <div className={styles.progressMetric}>
                    <span className={styles.progressMetricLabel}>Lessons Completed</span>
                    <span className={styles.progressMetricValue}>{zone.completed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Legacy Game Mode Progress</h2>

          <div className={styles.progressStatsGrid}>
            {data.progressStats.map((stat) => {
              const { emoji: gameEmoji, name: gameName } = getGameModeDetails(stat.gameMode);
              const completionRate =
                stat.totalUsersInMode > 0
                  ? (
                      (stat.completedUsers / stat.totalUsersInMode) *
                      100
                    ).toFixed(1)
                  : '0';

              return (
                <div
                  key={stat.gameMode}
                  className={styles.progressStatCard}
                  data-game={stat.gameMode}
                >
                  <div className={styles.progressStatHeader}>
                    <span className={styles.progressStatIcon}>{gameEmoji}</span>
                    <span className={styles.progressStatName}>{gameName}</span>
                  </div>
                  <div className={styles.progressStatMetrics}>
                    <div className={styles.progressMetric}>
                      <span className={styles.progressMetricLabel}>
                        Avg Unlocked Lessons
                      </span>
                      <span className={styles.progressMetricValue}>
                        {stat.avgUnlockedLessons.toFixed(1)}
                      </span>
                    </div>
                    <div className={styles.progressMetric}>
                      <span className={styles.progressMetricLabel}>
                        Avg Success Rate
                      </span>
                      <span className={styles.progressMetricValue}>
                        {stat.avgSuccessRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className={styles.progressMetric}>
                      <span className={styles.progressMetricLabel}>
                        Users With All Legacy Lessons Unlocked
                      </span>
                      <span className={styles.progressMetricValue}>
                        {stat.completedUsers} / {stat.totalUsersInMode}
                      </span>
                    </div>
                    <div className={styles.progressMetric}>
                      <span className={styles.progressMetricLabel}>
                        Legacy Unlock Rate
                      </span>
                      <span className={styles.progressMetricValue}>
                        {completionRate}%
                      </span>
                    </div>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Activity Over Time</h2>

          <div className={styles.retentionCard}>
            <div className={styles.retentionMetric}>
              <span className={styles.retentionLabel}>
                Returning Users (7 days)
              </span>
              <span className={styles.retentionValue}>
                {data.activityOverTime.retention.returningUsers}
              </span>
            </div>
            <div className={styles.retentionMetric}>
              <span className={styles.retentionLabel}>Retention Rate</span>
              <span className={styles.retentionValue}>
                {data.activityOverTime.retention.retentionRate.toFixed(1)}%
              </span>
            </div>
          </div>

          <h3 id="hourly-activity-title" className={styles.subTitle}>
            Peak Activity Hours (Last 30 Days)
          </h3>
          <p className={styles.hourlyDescription}>
            Each game-mode progress record is counted once, at its most recent update.
            Times use the database time zone; this is not a count of every gameplay event.
          </p>
          <div className={styles.hourlyActivityChart} aria-labelledby="hourly-activity-title" role="region">
            <div className={styles.hourlyLegend}>
              <span>Less activity</span>
              <span className={styles.hourlyLegendSwatches} aria-hidden="true">
                <span className={styles.hourLevelZero} />
                <span className={styles.hourLevelLow} />
                <span className={styles.hourLevelMedium} />
                <span className={styles.hourLevelHigh} />
              </span>
              <span>More activity</span>
              <span className={styles.hourlyPeakLegend}>Outlined = peak</span>
            </div>
            {maxHourlyActivity === 0 && (
              <p className={styles.hourlyEmpty}>No progress updates in the last 30 days.</p>
            )}
            <div className={styles.hourlyGrid} role="list" aria-label="Progress records by hour">
              {Array.from({ length: 24 }, (_, hour) => {
                const count = hourlyCounts.get(hour) ?? 0;
                const peakHour = count > 0 && count === maxHourlyActivity;
                const level = count === 0
                  ? styles.hourLevelZero
                  : count / maxHourlyActivity <= 1 / 3
                    ? styles.hourLevelLow
                    : count / maxHourlyActivity <= 2 / 3
                      ? styles.hourLevelMedium
                      : styles.hourLevelHigh;
                const hourLabel = `${String(hour).padStart(2, '0')}:00`;

                return (
                  <div
                    key={hour}
                    role="listitem"
                    className={`${styles.hourTile} ${level} ${peakHour ? styles.hourPeak : ''}`}
                    aria-label={`${hourLabel}: ${count} ${count === 1 ? 'progress record' : 'progress records'}${peakHour ? ', peak' : ''}`}
                  >
                    <span className={styles.hourTime}>{hourLabel}</span>
                    <span className={styles.hourCount}>{count}</span>
                    {peakHour && <span className={styles.hourPeakLabel}>Peak</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
