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
  last_active?: string;
};

export default function AllUsersProgressPage() {
  const [users, setUsers] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<
    | 'activity'
    | 'successRate'
    | 'joinedDate'
    | 'totalMoves'
    | 'lastActive'
    | null
  >(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
  } | null>(null);

  useEffect(() => {
    // Fetch current user
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.user) {
          setCurrentUser({ id: data.user.id, username: data.user.username });
        }
      })
      .catch(() => console.error('Failed to fetch current user'));

    // Fetch all users progress
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

  // Handle sort click
  const handleSort = (
    column:
      | 'activity'
      | 'successRate'
      | 'joinedDate'
      | 'totalMoves'
      | 'lastActive',
  ) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Sort users based on current sort column
  const sortedUsers = [...users].sort((a, b) => {
    if (!sortColumn) return 0;

    const aTotalCorrect =
      a.maze.correct_answers +
      a.casino.correct_answers +
      a.pattaya.correct_answers;
    const aTotalWrong =
      a.maze.wrong_answers + a.casino.wrong_answers + a.pattaya.wrong_answers;
    const aTotalAttempts =
      a.maze.quiz_attempts + a.casino.quiz_attempts + a.pattaya.quiz_attempts;
    const aSuccessRate =
      aTotalCorrect + aTotalWrong > 0
        ? (aTotalCorrect / (aTotalCorrect + aTotalWrong)) * 100
        : 0;
    const aJoinedDate = new Date(a.created_at).getTime();
    const aTotalMoves =
      a.maze.total_moves_earned +
      a.casino.total_moves_earned +
      a.pattaya.total_moves_earned;
    const aLastActive = a.last_active ? new Date(a.last_active).getTime() : 0;

    const bTotalCorrect =
      b.maze.correct_answers +
      b.casino.correct_answers +
      b.pattaya.correct_answers;
    const bTotalWrong =
      b.maze.wrong_answers + b.casino.wrong_answers + b.pattaya.wrong_answers;
    const bTotalAttempts =
      b.maze.quiz_attempts + b.casino.quiz_attempts + b.pattaya.quiz_attempts;
    const bSuccessRate =
      bTotalCorrect + bTotalWrong > 0
        ? (bTotalCorrect / (bTotalCorrect + bTotalWrong)) * 100
        : 0;
    const bJoinedDate = new Date(b.created_at).getTime();
    const bTotalMoves =
      b.maze.total_moves_earned +
      b.casino.total_moves_earned +
      b.pattaya.total_moves_earned;
    const bLastActive = b.last_active ? new Date(b.last_active).getTime() : 0;

    let comparison = 0;
    if (sortColumn === 'activity') {
      comparison = aTotalAttempts - bTotalAttempts;
    } else if (sortColumn === 'successRate') {
      comparison = aSuccessRate - bSuccessRate;
    } else if (sortColumn === 'joinedDate') {
      comparison = aJoinedDate - bJoinedDate;
    } else if (sortColumn === 'totalMoves') {
      comparison = aTotalMoves - bTotalMoves;
    } else if (sortColumn === 'lastActive') {
      comparison = aLastActive - bLastActive;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Calculate leaderboard rankings based on total correct answers and attempts
  let leaderboard = users
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
    .sort((a, b) => b.score - a.score);

  // If current user exists and is not in top 10, add them as 11th
  if (currentUser) {
    const currentUserInLeaderboard = leaderboard.find(
      (u) => u.id === currentUser.id,
    );
    if (!currentUserInLeaderboard) {
      const currentUserData = users.find((u) => u.id === currentUser.id);
      if (currentUserData) {
        const totalCorrect =
          currentUserData.maze.correct_answers +
          currentUserData.casino.correct_answers +
          currentUserData.pattaya.correct_answers;
        const totalWrong =
          currentUserData.maze.wrong_answers +
          currentUserData.casino.wrong_answers +
          currentUserData.pattaya.wrong_answers;
        const totalAttempts =
          currentUserData.maze.quiz_attempts +
          currentUserData.casino.quiz_attempts +
          currentUserData.pattaya.quiz_attempts;
        const successRate =
          totalCorrect + totalWrong > 0
            ? (totalCorrect / (totalCorrect + totalWrong)) * 100
            : 0;
        const score = totalCorrect * 10 + successRate * 2;

        leaderboard.push({
          ...currentUserData,
          totalCorrect,
          totalWrong,
          totalAttempts,
          successRate,
          score,
        });
      }
    }
  }

  // Take only top 10 (or 11 if current user was added)
  leaderboard = leaderboard.slice(0, currentUser ? 11 : 10);

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
            const isCurrentUser = currentUser && user.id === currentUser.id;
            const hue = Math.round((user.successRate / 100) * 120); // 0 to 120 (red to green)
            const successRateColor = `hsl(${hue}, 70%, 50%)`;
            const scoreBarWidth = (user.score / maxScore) * 100;
            const correctBarWidth = (user.totalCorrect / maxCorrect) * 100;

            return (
              <div
                key={user.id}
                className={`${styles.leaderboardItem} ${isCurrentUser ? styles.currentUserLeaderboardItem : ''}`}
              >
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
              <th
                className={`${styles.headerCell} ${styles.sortableHeader}`}
                onClick={() => handleSort('activity')}
              >
                Activity{' '}
                {sortColumn === 'activity' &&
                  (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className={`${styles.headerCell} ${styles.sortableHeader}`}
                onClick={() => handleSort('successRate')}
              >
                Success Rate{' '}
                {sortColumn === 'successRate' &&
                  (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className={`${styles.headerCell} ${styles.sortableHeader}`}
                onClick={() => handleSort('totalMoves')}
              >
                Total Moves{' '}
                {sortColumn === 'totalMoves' &&
                  (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className={`${styles.headerCell} ${styles.sortableHeader}`}
                onClick={() => handleSort('lastActive')}
              >
                Last Active{' '}
                {sortColumn === 'lastActive' &&
                  (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className={`${styles.headerCell} ${styles.sortableHeader}`}
                onClick={() => handleSort('joinedDate')}
              >
                Joined{' '}
                {sortColumn === 'joinedDate' &&
                  (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {sortedUsers.map((user) => {
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
              const totalMoves =
                user.maze.total_moves_earned +
                user.casino.total_moves_earned +
                user.pattaya.total_moves_earned;
              // Calculate dynamic color based on success rate (0% = red, 50% = yellow, 100% = green)
              const hue = Math.round((successRate / 100) * 120); // 0 to 120 (red to green)
              const successRateColor = `hsl(${hue}, 70%, 50%)`;
              const successRateBarColor = `hsl(${hue}, 70%, 45%)`;
              const date = new Date(user.created_at);
              const joinedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
              const lastActiveDate = user.last_active
                ? new Date(user.last_active)
                : null;
              const lastActiveDisplay = lastActiveDate
                ? `${String(lastActiveDate.getDate()).padStart(2, '0')}/${String(lastActiveDate.getMonth() + 1).padStart(2, '0')}/${lastActiveDate.getFullYear()}`
                : 'Never';
              const maskedUsername =
                user.username.length > 0
                  ? user.username[0] + '*'.repeat(user.username.length - 1)
                  : '';
              const isCurrentUser = currentUser && user.id === currentUser.id;

              return (
                <tr
                  key={user.id}
                  className={`${styles.row} ${isCurrentUser ? styles.currentUserRow : ''}`}
                >
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
                  <td className={`${styles.cell} ${styles.movesCell}`}>
                    <div className={styles.movesValue}>{totalMoves}</div>
                    <div className={styles.movesLabel}>moves</div>
                  </td>
                  <td className={`${styles.cell} ${styles.lastActiveCell}`}>
                    {lastActiveDisplay}
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
