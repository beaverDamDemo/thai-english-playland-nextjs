'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './allUsersProgress.module.css';

type UserProgress = {
  id: number;
  username: string;
  created_at: string;
  maze: {
    unlocked_lessons: number;
    correct_answers: number;
    wrong_answers: number;
    quiz_attempts: number;
    total_moves_earned: number;
  };
  casino: {
    unlocked_lessons: number;
    correct_answers: number;
    wrong_answers: number;
    quiz_attempts: number;
    total_moves_earned: number;
  };
  pattaya: {
    unlocked_lessons: number;
    correct_answers: number;
    wrong_answers: number;
    quiz_attempts: number;
    total_moves_earned: number;
  };
};

export default function AllUsersProgressPage() {
  const [users, setUsers] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/all-users-progress')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then((data) => {
        if (data.ok) {
          setUsers(data.users);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  // Calculate leaderboard rankings based on total correct answers and attempts
  const leaderboard = users
    .map((user) => {
      const totalCorrect =
        user.maze.correct_answers +
        user.casino.correct_answers +
        user.pattaya.correct_answers;
      const totalWrong =
        user.maze.wrong_answers +
        user.casino.wrong_answers +
        user.pattaya.wrong_answers;
      const totalAttempts =
        user.maze.quiz_attempts +
        user.casino.quiz_attempts +
        user.pattaya.quiz_attempts;
      const successRate =
        totalCorrect + totalWrong > 0
          ? (totalCorrect / (totalCorrect + totalWrong)) * 100
          : 0;
      const score = totalCorrect * 10 + successRate * 2; // Scoring formula

      return {
        ...user,
        totalCorrect,
        totalWrong,
        totalAttempts,
        successRate,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const maxScore = Math.max(...leaderboard.map((u) => u.score), 1);
  const maxCorrect = Math.max(...leaderboard.map((u) => u.totalCorrect), 1);

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🏆 All Users Progress</h1>
        <Link href="/" className={styles.backLink}>
          Back to Home
        </Link>
      </div>

      <section className={styles.leaderboardSection}>
        <h2 className={styles.leaderboardTitle}>🥇 Top 10 Leaderboard</h2>
        <div className={styles.leaderboard}>
          {leaderboard.map((user, index) => {
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
            const hue = Math.round((user.successRate / 100) * 120); // 0 to 120 (red to green)
            const successRateColor = `hsl(${hue}, 70%, 50%)`;
            const scoreBarWidth = (user.score / maxScore) * 100;
            const correctBarWidth = (user.totalCorrect / maxCorrect) * 100;

            return (
              <div key={user.id} className={styles.leaderboardItem}>
                <span className={styles.leaderboardRank}>{medal}</span>
                <span className={styles.leaderboardUsername}>
                  {maskedUsername}
                </span>
                <div className={styles.leaderboardStats}>
                  <span className={styles.leaderboardStat}>
                    <span className={styles.leaderboardStatLabel}>Score</span>
                    <span className={styles.leaderboardStatValue}>
                      {Math.round(user.score)}
                    </span>
                    <div className={styles.leaderboardBar}>
                      <div
                        className={styles.leaderboardBarFill}
                        style={{ width: `${scoreBarWidth}%` }}
                      />
                    </div>
                  </span>
                  <span className={styles.leaderboardStat}>
                    <span className={styles.leaderboardStatLabel}>Correct</span>
                    <span className={styles.leaderboardStatValue}>
                      {user.totalCorrect}
                    </span>
                    <div className={styles.leaderboardBar}>
                      <div
                        className={styles.leaderboardBarFill}
                        style={{ width: `${correctBarWidth}%` }}
                      />
                    </div>
                  </span>
                  <span className={styles.leaderboardStat}>
                    <span className={styles.leaderboardStatLabel}>Success</span>
                    <span
                      className={styles.leaderboardStatValue}
                      style={{ color: successRateColor }}
                    >
                      {user.successRate.toFixed(1)}%
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.headerCell}>Username</th>
              <th className={styles.headerCell}>🌀 Maze</th>
              <th className={styles.headerCell}>🎰 Casino</th>
              <th className={styles.headerCell}>🏖️ Pattaya</th>
              <th className={styles.headerCell}>Activity</th>
              <th className={styles.headerCell}>Success Rate</th>
              <th className={styles.headerCell}>Joined</th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {users.map((user) => {
              const totalCorrect =
                user.maze.correct_answers +
                user.casino.correct_answers +
                user.pattaya.correct_answers;
              const totalWrong =
                user.maze.wrong_answers +
                user.casino.wrong_answers +
                user.pattaya.wrong_answers;
              const totalAttempts =
                user.maze.quiz_attempts +
                user.casino.quiz_attempts +
                user.pattaya.quiz_attempts;
              const successRate =
                totalCorrect + totalWrong > 0
                  ? Math.round(
                      (totalCorrect / (totalCorrect + totalWrong)) * 100,
                    )
                  : 0;
              // Calculate dynamic color based on success rate (0% = red, 50% = yellow, 100% = green)
              const hue = Math.round((successRate / 100) * 120); // 0 to 120 (red to green)
              const successRateColor = `hsl(${hue}, 70%, 50%)`;
              const successRateBarColor = `hsl(${hue}, 70%, 45%)`;
              const date = new Date(user.created_at);
              const joinedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
              const maskedUsername =
                user.username.length > 0
                  ? user.username[0] + '*'.repeat(user.username.length - 1)
                  : '';

              return (
                <tr key={user.id} className={styles.row}>
                  <td className={`${styles.cell} ${styles.usernameCell}`}>
                    {maskedUsername}
                  </td>
                  <td className={styles.cell}>
                    <div className={styles.gameStats}>
                      <div className={styles.level}>
                        L{user.maze.unlocked_lessons}
                      </div>
                      <div className={styles.correct}>
                        ✅ {user.maze.correct_answers}
                      </div>
                      <div className={styles.wrong}>
                        ❌ {user.maze.wrong_answers}
                      </div>
                    </div>
                  </td>
                  <td className={styles.cell}>
                    <div className={styles.gameStats}>
                      <div className={styles.level}>
                        L{user.casino.unlocked_lessons}
                      </div>
                      <div className={styles.correct}>
                        ✅ {user.casino.correct_answers}
                      </div>
                      <div className={styles.wrong}>
                        ❌ {user.casino.wrong_answers}
                      </div>
                    </div>
                  </td>
                  <td className={styles.cell}>
                    <div className={styles.gameStats}>
                      <div className={styles.level}>
                        L{user.pattaya.unlocked_lessons}
                      </div>
                      <div className={styles.correct}>
                        ✅ {user.pattaya.correct_answers}
                      </div>
                      <div className={styles.wrong}>
                        ❌ {user.pattaya.wrong_answers}
                      </div>
                    </div>
                  </td>
                  <td className={`${styles.cell} ${styles.activityCell}`}>
                    <div className={styles.activityValue}>{totalAttempts}</div>
                    <div className={styles.activityLabel}>attempts</div>
                    <div className={styles.activityBarContainer}>
                      <div
                        className={styles.activityBar}
                        style={{
                          width: `${Math.min(totalAttempts * 2, 100)}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td className={`${styles.cell} ${styles.successRateCell}`}>
                    <div
                      className={styles.successRateValue}
                      style={{ color: successRateColor }}
                    >
                      {successRate}%
                    </div>
                    <div className={styles.successRateBarContainer}>
                      <div
                        className={styles.successRateBar}
                        style={{
                          width: `${successRate}%`,
                          background: `linear-gradient(90deg, ${successRateColor} 0%, ${successRateBarColor} 100%)`,
                        }}
                      />
                    </div>
                  </td>
                  <td className={`${styles.cell} ${styles.joinedDate}`}>
                    {joinedDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
