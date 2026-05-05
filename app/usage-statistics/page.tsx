'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './usageStatistics.module.css';

type UserGrowthData = {
  totalUsers: number;
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
    hourlyActivity: Array<{ hour: number; activityCount: number }>;
    retention: {
      returningUsers: number;
      totalUsers: number;
      retentionRate: number;
    };
  };
};

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

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!data) return <div className={styles.error}>No data available</div>;

  const chartData =
    timeframe === 'daily'
      ? data.dailyUsers
      : timeframe === 'weekly'
        ? data.weeklyUsers
        : data.monthlyUsers;
  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  const renderChart = () => {
    if (timeframe === 'daily') {
      return data.dailyUsers.map((item) => {
        const height = (item.count / maxCount) * 100;
        const label = new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        return (
          <div key={item.date} className={styles.barContainer}>
            <div className={styles.bar} style={{ height: `${height}%` }}>
              <span className={styles.barValue}>{item.count}</span>
            </div>
            <span className={styles.barLabel}>{label}</span>
          </div>
        );
      });
    } else if (timeframe === 'weekly') {
      return data.weeklyUsers.map((item) => {
        const height = (item.count / maxCount) * 100;
        const label = `W${new Date(item.weekStart).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}`;
        return (
          <div key={item.weekStart} className={styles.barContainer}>
            <div className={styles.bar} style={{ height: `${height}%` }}>
              <span className={styles.barValue}>{item.count}</span>
            </div>
            <span className={styles.barLabel}>{label}</span>
          </div>
        );
      });
    } else {
      return data.monthlyUsers.map((item) => {
        const height = (item.count / maxCount) * 100;
        const label = new Date(item.monthStart).toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });
        return (
          <div key={item.monthStart} className={styles.barContainer}>
            <div className={styles.bar} style={{ height: `${height}%` }}>
              <span className={styles.barValue}>{item.count}</span>
            </div>
            <span className={styles.barLabel}>{label}</span>
          </div>
        );
      });
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>
          Back to Home
        </Link>
        <h1 className={styles.title}>📈 Usage Statistics</h1>
      </div>

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

          <div className={styles.chartContainer}>
            <div className={styles.chart}>{renderChart()}</div>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Game Mode Popularity</h2>

          <div className={styles.gameModeStats}>
            {data.gameModePopularity.map((mode) => {
              const maxAttempts = Math.max(
                ...data.gameModePopularity.map((m) => m.totalAttempts),
                1,
              );
              const barWidth = (mode.totalAttempts / maxAttempts) * 100;
              const gameEmoji =
                mode.gameMode === 'maze'
                  ? '🌀'
                  : mode.gameMode === 'casino'
                    ? '🎰'
                    : '🏖️';
              const gameName =
                mode.gameMode.charAt(0).toUpperCase() + mode.gameMode.slice(1);

              return (
                <div key={mode.gameMode} className={styles.gameModeItem}>
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

          <div className={styles.leaderboard}>
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
                user.username.length > 0
                  ? user.username[0] + '*'.repeat(user.username.length - 1)
                  : '';

              return (
                <div key={user.username} className={styles.leaderboardItem}>
                  <span className={styles.leaderboardRank}>{medal}</span>
                  <span className={styles.leaderboardUsername}>
                    {maskedUsername}
                  </span>
                  <div className={styles.leaderboardStats}>
                    <span className={styles.leaderboardStat}>
                      <span className={styles.leaderboardStatLabel}>
                        Attempts:
                      </span>
                      <span className={styles.leaderboardStatValue}>
                        {user.totalAttempts}
                      </span>
                    </span>
                    <span className={styles.leaderboardStat}>
                      <span className={styles.leaderboardStatLabel}>
                        Success:
                      </span>
                      <span className={styles.leaderboardStatValue}>
                        {successRate}%
                      </span>
                    </span>
                    <span className={styles.leaderboardStat}>
                      <span className={styles.leaderboardStatLabel}>
                        Moves:
                      </span>
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
          <h2 className={styles.cardTitle}>Progress Statistics</h2>

          <div className={styles.progressStatsGrid}>
            {data.progressStats.map((stat) => {
              const gameEmoji =
                stat.gameMode === 'maze'
                  ? '🌀'
                  : stat.gameMode === 'casino'
                    ? '🎰'
                    : '🏖️';
              const gameName =
                stat.gameMode.charAt(0).toUpperCase() + stat.gameMode.slice(1);
              const completionRate =
                stat.totalUsersInMode > 0
                  ? (
                      (stat.completedUsers / stat.totalUsersInMode) *
                      100
                    ).toFixed(1)
                  : '0';

              return (
                <div key={stat.gameMode} className={styles.progressStatCard}>
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
                        Completed Users
                      </span>
                      <span className={styles.progressMetricValue}>
                        {stat.completedUsers} / {stat.totalUsersInMode}
                      </span>
                    </div>
                    <div className={styles.progressMetric}>
                      <span className={styles.progressMetricLabel}>
                        Completion Rate
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

          <h3 className={styles.subTitle}>
            Peak Activity Hours (Last 30 Days)
          </h3>
          <div className={styles.hourlyActivityChart}>
            {data.activityOverTime.hourlyActivity.map((hour) => {
              const maxActivity = Math.max(
                ...data.activityOverTime.hourlyActivity.map(
                  (h) => h.activityCount,
                ),
                1,
              );
              const barHeight = (hour.activityCount / maxActivity) * 100;
              const peakHour = hour.activityCount === maxActivity;

              return (
                <div key={hour.hour} className={styles.hourBarContainer}>
                  <div
                    className={styles.hourBar}
                    style={{ height: `${barHeight}%` }}
                  >
                    <span className={styles.hourBarValue}>
                      {hour.activityCount}
                    </span>
                  </div>
                  <span
                    className={`${styles.hourLabel} ${peakHour ? styles.peakHour : ''}`}
                  >
                    {hour.hour}:00
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
