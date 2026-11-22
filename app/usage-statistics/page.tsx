'use client';

import { useEffect, useState } from 'react';
import SiteHeader from '../_components/SiteHeader';
import SiteFooter from '../_components/SiteFooter';
import SitePageMessage from '../_components/SitePageMessage';
import styles from './usageStatistics.module.css';
import CountBarChart, { type CountBarItem } from './CountBarChart';
import HourlyLineChart from './HourlyLineChart';

type ZoneStats = {
  id: string;
  title: string;
  icon: string;
  theme: string;
  playableLessons: number;
  learners: number;
  quizAttempts: number;
  started: number;
  completed: number;
};

type UserGrowthData = {
  totalUsers: number;
  zoneProgress: ZoneStats[];
  dailyUsers: Array<{ date: string; count: number }>;
  weeklyUsers: Array<{ weekStart: string; count: number }>;
  monthlyUsers: Array<{ monthStart: string; count: number }>;
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
  activityOverTime: {
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

type Timeframe = 'daily' | 'weekly' | 'monthly';

const TIMEFRAMES: Array<{ id: Timeframe; label: string; unit: string; period: string }> = [
  { id: 'daily', label: '30 days', unit: 'day', period: 'last 30 days' },
  { id: 'weekly', label: '12 weeks', unit: 'week', period: 'last 12 weeks' },
  { id: 'monthly', label: '12 months', unit: 'month', period: 'last 12 months' },
];

function formatDate(date: string, options: Intl.DateTimeFormatOptions): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', ...options });
}

function plural(count: number, word: string): string {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

function busiest<T extends { count: number }>(items: T[]): T | null {
  return items.reduce<T | null>((best, item) => (item.count > 0 && (!best || item.count > best.count) ? item : best), null);
}

function LoadingSkeleton() {
  const block = (className: string) => <span className={`${styles.skeleton} ${className}`} />;
  return (
    <>
    <SiteHeader title="Usage Statistics" icon="📈" theme="stats" width={1400} />
    <main className={styles.container} aria-busy="true">
      <p className={styles.srOnly} role="status">
        Loading usage statistics
      </p>
      <div className={styles.content} aria-hidden="true">
        <section className={`${styles.card} ${styles.cardWide} ${styles.kpiRow}`}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={styles.kpiTile}>
              {block(styles.skeletonShort)}
              {block(styles.skeletonNumber)}
            </div>
          ))}
        </section>
        {Array.from({ length: 2 }, (_, i) => (
          <section key={i} className={styles.card}>
            {block(styles.skeletonTitle)}
            <div className={styles.skeletonChart}>
              {Array.from({ length: 16 }, (_, j) => (
                <span key={j} className={`${styles.skeleton} ${styles.skeletonChartBar}`} />
              ))}
            </div>
          </section>
        ))}
        <section className={`${styles.card} ${styles.cardWide}`}>
          {block(styles.skeletonTitle)}
          <div className={styles.zoneGrid}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className={styles.skeletonModeCard}>
                {block(styles.skeletonMedium)}
                {block(styles.skeletonNumber)}
                {block(styles.skeletonShort)}
                {block(styles.skeletonProgress)}
              </div>
            ))}
          </div>
        </section>
        <section className={`${styles.card} ${styles.cardWide}`}>
          {block(styles.skeletonTitle)}
          <div className={styles.metricsGrid}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className={styles.skeletonMetricCard}>
                {block(styles.skeletonIcon)}
                {block(styles.skeletonMedium)}
                {block(styles.skeletonShort)}
              </div>
            ))}
          </div>
        </section>
        <section className={styles.card}>
          {block(styles.skeletonTitle)}
          <div className={styles.skeletonRows}>
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className={styles.skeletonRow}>
                {block(styles.skeletonRank)}
                {block(styles.skeletonMedium)}
                {block(styles.skeletonShort)}
              </div>
            ))}
          </div>
        </section>
        <section className={styles.card}>
          {block(styles.skeletonTitle)}
          <div className={styles.retentionCard}>
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className={styles.retentionMetric}>
                {block(styles.skeletonShort)}
                {block(styles.skeletonNumber)}
              </div>
            ))}
          </div>
          <div className={styles.skeletonLineChart} />
        </section>
      </div>
    </main>
    <SiteFooter theme="stats" width={1400} />
    </>
  );
}

export default function UsageStatisticsPage() {
  const [data, setData] = useState<UserGrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('daily');

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

  if (loading) return <LoadingSkeleton />;
  if (error || !data) {
    return (
      <>
        <SiteHeader title="Usage Statistics" icon="📈" theme="stats" width={1400} />
        <main className={styles.container}>
          <SitePageMessage
            title={error ? 'Could not load the statistics' : 'No statistics yet'}
            message={error ?? 'There is no usage data to show yet.'}
            retry={Boolean(error)}
            theme="stats"
          />
        </main>
        <SiteFooter theme="stats" width={1400} />
      </>
    );
  }

  const activeTimeframe = TIMEFRAMES.find((t) => t.id === timeframe) ?? TIMEFRAMES[0];

  const growthSeries =
    timeframe === 'daily'
      ? data.dailyUsers.map((d) => ({ date: d.date, count: d.count }))
      : timeframe === 'weekly'
        ? data.weeklyUsers.map((d) => ({ date: d.weekStart, count: d.count }))
        : data.monthlyUsers.map((d) => ({ date: d.monthStart, count: d.count }));

  const growthBars: CountBarItem[] = growthSeries.map(({ date, count }) => {
    const label =
      timeframe === 'monthly'
        ? formatDate(date, { month: 'short', year: '2-digit' })
        : formatDate(date, { month: 'short', day: 'numeric' });
    const prefix = timeframe === 'weekly' ? 'Week of ' : '';
    return { key: date, label, count, ariaLabel: `${prefix}${label}: ${plural(count, 'new user')}` };
  });
  const growthTotal = growthSeries.reduce((sum, d) => sum + d.count, 0);
  const growthPeak = busiest(growthBars);
  const newUsersLast30 = data.dailyUsers.reduce((sum, d) => sum + d.count, 0);

  const lessonDays = data.activityOverTime.dailyLessonUsers;
  const lessonBars: CountBarItem[] = lessonDays.map(({ date, count }) => {
    const label = formatDate(date, { month: 'short', day: 'numeric' });
    return { key: date, label, count, ariaLabel: `${label}: ${plural(count, 'learner')} opened a lesson` };
  });
  const learnerDays = lessonDays.reduce((sum, d) => sum + d.count, 0);
  const activeDays = lessonDays.filter((d) => d.count > 0).length;
  const lessonPeak = busiest(lessonBars);

  const zones = data.zoneProgress;
  const maxZoneLearners = Math.max(1, ...zones.map((z) => z.learners));
  const zonesPlayed = zones.filter((z) => z.started > 0).length;

  const hourlyByHour = new Map(
    data.activityOverTime.hourlyActivity.map(({ hour, activityCount }) => [hour, activityCount]),
  );
  const hourlyCounts = Array.from({ length: 24 }, (_, hour) => hourlyByHour.get(hour) ?? 0);
  const maxHourlyActivity = Math.max(0, ...hourlyCounts);

  return (
    <>
    <SiteHeader title="Usage Statistics" icon="📈" theme="stats" width={1400} />
    <main className={styles.container}>
      <div className={styles.content}>
        <section className={`${styles.card} ${styles.cardWide} ${styles.kpiRow}`} aria-label="Summary">
          <div className={styles.kpiTile}>
            <span className={styles.kpiLabel}>Total users</span>
            <span className={styles.kpiValue}>{data.totalUsers}</span>
          </div>
          <div className={styles.kpiTile}>
            <span className={styles.kpiLabel}>New users · 30 days</span>
            <span className={styles.kpiValue}>{newUsersLast30}</span>
          </div>
          <div className={styles.kpiTile}>
            <span className={styles.kpiLabel}>Learner-days · 30 days</span>
            <span className={styles.kpiValue}>{learnerDays}</span>
            <span className={styles.kpiHint}>on {plural(activeDays, 'active day')}</span>
          </div>
          <div className={styles.kpiTile}>
            <span className={styles.kpiLabel}>Zones played</span>
            <span className={styles.kpiValue}>
              {zonesPlayed}
              <span className={styles.kpiValueSuffix}> / {zones.length}</span>
            </span>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeading}>
            <h2 id="user-growth-title" className={styles.cardTitle}>
              New Users
            </h2>
            <div className={styles.segmented} role="group" aria-label="Timeframe">
              {TIMEFRAMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={timeframe === t.id}
                  className={`${styles.segmentedButton} ${timeframe === t.id ? styles.active : ''}`}
                  onClick={() => setTimeframe(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <p className={styles.cardSummary}>
            <strong>{plural(growthTotal, 'new user')}</strong> in the {activeTimeframe.period}
            {growthPeak
              ? ` · busiest ${activeTimeframe.unit}: ${growthPeak.label} (${growthPeak.count})`
              : ''}
          </p>
          <CountBarChart
            items={growthBars}
            ariaLabel={`New users per ${activeTimeframe.unit}`}
            labelEvery={timeframe === 'daily' ? 5 : timeframe === 'weekly' ? 2 : 1}
            highlightLast
          />
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeading}>
            <h2 className={styles.cardTitle}>Daily Lesson Participation</h2>
          </div>
          <p className={styles.cardSummary}>
            Signed-in learners who opened at least one lesson each day.
            {data.activityOverTime.lessonActivityTrackingStart
              ? ` Tracking since ${formatDate(data.activityOverTime.lessonActivityTrackingStart, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}.`
              : ' Daily tracking has not started yet.'}
            {lessonPeak ? ` Busiest day: ${lessonPeak.label} (${lessonPeak.count}).` : ''}
          </p>
          {lessonBars.length > 0 ? (
            <CountBarChart
              items={lessonBars}
              ariaLabel="Learners who opened a lesson, per day"
              labelEvery={lessonBars.length > 14 ? 5 : 1}
              highlightLast
            />
          ) : (
            <p className={styles.emptyState}>No lesson activity has been recorded yet.</p>
          )}
        </section>

        <section className={`${styles.card} ${styles.cardWide}`}>
          <div className={styles.cardHeading}>
            <h2 className={styles.cardTitle}>Zone Popularity</h2>
          </div>
          <p className={styles.cardSummary}>
            All curriculum zones, including ones nobody has tried yet. Lesson counts are learner-lesson records.
          </p>
          <div className={styles.zoneGrid}>
            {zones.map((zone) => {
              const played = zone.started > 0;
              return (
                <article
                  key={zone.id}
                  className={`${styles.zoneCard} ${played ? '' : styles.zoneCardEmpty}`}
                  data-game={zone.theme}
                >
                  <header className={styles.zoneHeader}>
                    <span className={styles.zoneIcon} aria-hidden="true">
                      {zone.icon}
                    </span>
                    <span className={styles.zoneTitle}>{zone.title}</span>
                  </header>
                  <div className={styles.zoneLearners}>
                    <span className={styles.zoneLearnersValue}>{zone.learners}</span>
                    <span className={styles.zoneLearnersLabel}>{zone.learners === 1 ? 'learner' : 'learners'}</span>
                  </div>
                  <div
                    className={styles.zoneBar}
                    role="meter"
                    aria-valuemin={0}
                    aria-valuemax={maxZoneLearners}
                    aria-valuenow={zone.learners}
                    aria-label={`${zone.title} learners`}
                  >
                    <div className={styles.zoneBarFill} style={{ width: `${(zone.learners / maxZoneLearners) * 100}%` }} />
                  </div>
                  {played ? (
                    <dl className={styles.zoneStats}>
                      <div>
                        <dt>Started</dt>
                        <dd>{zone.started}</dd>
                      </div>
                      <div>
                        <dt>Completed</dt>
                        <dd>{zone.completed}</dd>
                      </div>
                      <div>
                        <dt>Quiz tries</dt>
                        <dd>{zone.quizAttempts}</dd>
                      </div>
                    </dl>
                  ) : (
                    <p className={styles.zoneEmptyNote}>Not played yet</p>
                  )}
                  <p className={styles.zoneFootnote}>{plural(zone.playableLessons, 'playable lesson')}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className={`${styles.card} ${styles.cardWide}`}>
          <div className={styles.cardHeading}>
            <h2 className={styles.cardTitle}>Engagement Metrics</h2>
          </div>
          <p className={styles.cardSummary}>Averages per learner per game mode.</p>
          <div className={styles.metricsGrid}>
            {[
              { icon: '🎯', label: 'Avg Quiz Attempts', value: data.engagementMetrics.avgQuizAttempts.toFixed(1) },
              { icon: '✅', label: 'Avg Correct Answers', value: data.engagementMetrics.avgCorrectAnswers.toFixed(1) },
              { icon: '❌', label: 'Avg Wrong Answers', value: data.engagementMetrics.avgWrongAnswers.toFixed(1) },
              { icon: '👣', label: 'Avg Moves Earned', value: data.engagementMetrics.avgMovesEarned.toFixed(1) },
              { icon: '📊', label: 'Avg Success Rate', value: `${data.engagementMetrics.avgSuccessRate.toFixed(1)}%` },
            ].map((metric) => (
              <div key={metric.label} className={styles.metricCard}>
                <span className={styles.metricCardIcon} aria-hidden="true">
                  {metric.icon}
                </span>
                <span className={styles.metricCardLabel}>{metric.label}</span>
                <span className={styles.metricCardValue}>{metric.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeading}>
            <h2 className={styles.cardTitle}>Most Active Users</h2>
          </div>

          {data.mostActiveUsers.length === 0 ? (
            <p className={styles.emptyState}>Nobody has played yet.</p>
          ) : (
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
                const answered = user.totalCorrect + user.totalWrong;
                const successRate = answered > 0 ? ((user.totalCorrect / answered) * 100).toFixed(1) : '0';
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                const maskedUsername =
                  user.username.slice(0, 2) + '*'.repeat(Math.max(user.username.length - 2, 0));

                return (
                  <div key={user.username} className={styles.leaderboardItem} role="row">
                    <span className={styles.leaderboardRank} role="cell" aria-label={`Rank ${index + 1}`}>
                      {medal}
                    </span>
                    <span className={styles.leaderboardUsername} role="cell">
                      <span className={styles.leaderboardName} title={maskedUsername}>
                        {maskedUsername}
                      </span>
                    </span>
                    <div className={styles.leaderboardStats} role="presentation">
                      <span className={styles.leaderboardStat} role="cell">
                        <span className={styles.leaderboardStatValue}>{user.totalAttempts}</span>
                      </span>
                      <span className={styles.leaderboardStat} role="cell">
                        <span className={styles.leaderboardStatValue}>{successRate}%</span>
                      </span>
                      <span className={styles.leaderboardStat} role="cell">
                        <span className={styles.leaderboardStatValue}>{user.totalMoves}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeading}>
            <h2 className={styles.cardTitle}>Activity Over Time</h2>
          </div>

          <div className={styles.retentionCard}>
            <div className={styles.retentionMetric}>
              <span className={styles.retentionLabel}>Returning Users (7 days)</span>
              <span className={styles.retentionValue}>{data.activityOverTime.retention.returningUsers}</span>
            </div>
            <div className={styles.retentionMetric}>
              <span className={styles.retentionLabel}>Retention Rate</span>
              <span className={styles.retentionValue}>
                {data.activityOverTime.retention.retentionRate.toFixed(1)}%
              </span>
            </div>
          </div>

          <h3 id="hourly-activity-title" className={styles.subTitle}>
            Activity by Hour of Day (Last 30 Days)
          </h3>
          <p className={styles.hourlyDescription}>
            Each game-mode progress record is counted once, at its most recent update. Times use the database
            time zone; this is not a count of every gameplay event.
          </p>
          {maxHourlyActivity === 0 ? (
            <p className={styles.emptyState}>No progress updates in the last 30 days.</p>
          ) : (
            <HourlyLineChart counts={hourlyCounts} ariaLabel="Progress records by hour of day, last 30 days" />
          )}
        </section>

      </div>
    </main>
    <SiteFooter theme="stats" width={1400} />
    </>
  );
}
