'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getActivityRecency } from './activityRecency';
import styles from './allUsersProgress.module.css';

type GameProgress = {
  unlocked_lessons: number;
  correct_answers: number;
  wrong_answers: number;
  quiz_attempts: number;
  total_moves_earned: number;
};

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
  pattaya: GameProgress;
  starter: GameProgress;
  last_active?: string;
};

const GAME_KEYS = ['maze', 'casino', 'pattaya', 'starter'] as const;
const LEADERBOARD_AVATARS = [
  '🐼', '🦊', '🐸', '🐨', '🐯', '🐰', '🐻', '🐵', '🐧', '🦁',
];

type SortColumn = 'username' | 'starter' | 'maze' | 'casino' | 'pattaya'
  | 'activity' | 'successRate' | 'joinedDate' | 'totalMoves' | 'lastActive';
type LeaderboardSort = 'score' | 'totalCorrect' | 'successRate';

const LEADERBOARD_COLUMNS: { key: LeaderboardSort; label: string }[] = [
  { key: 'score', label: 'Score' },
  { key: 'totalCorrect', label: 'Correct' },
  { key: 'successRate', label: 'Success' },
];

const TABLE_COLUMNS: { key: SortColumn; label: string; game?: boolean }[] = [
  { key: 'username', label: 'Username' },
  { key: 'starter', label: '🌱 Starter', game: true },
  { key: 'maze', label: '🌀 Maze', game: true },
  { key: 'casino', label: '🎰 Casino', game: true },
  { key: 'pattaya', label: '🏖️ Pattaya', game: true },
  { key: 'activity', label: 'Activity' },
  { key: 'successRate', label: 'Success Rate' },
  { key: 'totalMoves', label: 'Total Moves' },
  { key: 'lastActive', label: 'Last Active' },
  { key: 'joinedDate', label: 'Joined' },
];

function maskUsername(username: string): string {
  return username.slice(0, 2) + '*'.repeat(Math.max(username.length - 2, 0));
}

function sumStat(user: UserProgress, key: keyof GameProgress): number {
  return GAME_KEYS.reduce((total, game) => total + (user[game]?.[key] ?? 0), 0);
}

export default function AllUsersProgressPage() {
  const [users, setUsers] = useState<UserProgress[]>([]);
  const [activityAsOf, setActivityAsOf] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [leaderboardSort, setLeaderboardSort] = useState<LeaderboardSort>('score');
  const [leaderboardDirection, setLeaderboardDirection] = useState<'asc' | 'desc'>('desc');
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
          setActivityAsOf(Date.now());
          setUsers(data.users);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className={styles.container} aria-busy="true">
        <p className={styles.srOnly} role="status">
          Loading all users progress
        </p>
        <div className={styles.header} aria-hidden="true">
          <span className={`${styles.skeleton} ${styles.skeletonBackLink}`} />
          <span className={`${styles.skeleton} ${styles.skeletonPageTitle}`} />
        </div>

        <section className={styles.leaderboardSection} aria-hidden="true">
          <span className={`${styles.skeleton} ${styles.skeletonSectionTitle}`} />
          <div className={styles.skeletonLeaderboard}>
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className={styles.skeletonLeaderboardItem}>
                <span className={`${styles.skeleton} ${styles.skeletonRank}`} />
                <span className={`${styles.skeleton} ${styles.skeletonName}`} />
                <div className={styles.skeletonLeaderboardStats}>
                  <span className={`${styles.skeleton} ${styles.skeletonStat}`} />
                  <span className={`${styles.skeleton} ${styles.skeletonStat}`} />
                  <span className={`${styles.skeleton} ${styles.skeletonStat}`} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.leaderboardSection} aria-hidden="true">
          <span className={`${styles.skeleton} ${styles.skeletonSectionTitle}`} />
          <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                {Array.from({ length: 10 }, (_, index) => (
                  <th key={index} className={styles.headerCell}>
                    <span
                      className={`${styles.skeleton} ${styles.skeletonTableHeading}`}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {Array.from({ length: 6 }, (_, rowIndex) => (
                <tr key={rowIndex} className={styles.row}>
                  {Array.from({ length: 10 }, (_, cellIndex) => (
                    <td key={cellIndex} className={styles.cell}>
                      <span
                        className={`${styles.skeleton} ${styles.skeletonTableCell}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
      </main>
    );
  }
  if (error) return <div className={styles.error}>Error: {error}</div>;

  // Handle sort click
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(column === 'username' ? 'asc' : 'desc');
    }
  };

  const handleLeaderboardSort = (column: LeaderboardSort) => {
    if (leaderboardSort === column) {
      setLeaderboardDirection((direction) => direction === 'asc' ? 'desc' : 'asc');
    } else {
      setLeaderboardSort(column);
      setLeaderboardDirection('desc');
    }
  };

  // Sort users based on current sort column
  const sortedUsers = [...users].sort((a, b) => {
    if (!sortColumn) return 0;

    const aTotalCorrect = sumStat(a, 'correct_answers');
    const aTotalWrong = sumStat(a, 'wrong_answers');
    const aTotalAttempts = sumStat(a, 'quiz_attempts');
    const aSuccessRate =
      aTotalCorrect + aTotalWrong > 0
        ? (aTotalCorrect / (aTotalCorrect + aTotalWrong)) * 100
        : 0;
    const aJoinedDate = new Date(a.created_at).getTime();
    const aTotalMoves = sumStat(a, 'total_moves_earned');
    const aLastActive = a.last_active ? new Date(a.last_active).getTime() : 0;

    const bTotalCorrect = sumStat(b, 'correct_answers');
    const bTotalWrong = sumStat(b, 'wrong_answers');
    const bTotalAttempts = sumStat(b, 'quiz_attempts');
    const bSuccessRate =
      bTotalCorrect + bTotalWrong > 0
        ? (bTotalCorrect / (bTotalCorrect + bTotalWrong)) * 100
        : 0;
    const bJoinedDate = new Date(b.created_at).getTime();
    const bTotalMoves = sumStat(b, 'total_moves_earned');
    const bLastActive = b.last_active ? new Date(b.last_active).getTime() : 0;

    let comparison = 0;
    if (sortColumn === 'username') {
      comparison = maskUsername(a.username).localeCompare(maskUsername(b.username));
    } else if (sortColumn === 'starter' || sortColumn === 'maze' || sortColumn === 'casino' || sortColumn === 'pattaya') {
      comparison = a[sortColumn].unlocked_lessons - b[sortColumn].unlocked_lessons;
    } else if (sortColumn === 'activity') {
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
  const rankedUsers = users
    .map((user) => {
      const totalCorrect = sumStat(user, 'correct_answers');
      const totalWrong = sumStat(user, 'wrong_answers');
      const totalAttempts = sumStat(user, 'quiz_attempts');
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
    .map((user, index) => ({ ...user, rank: index + 1 }));

  const leaderboard = rankedUsers.slice(0, 10);
  const currentUserEntry = rankedUsers.find((user) => user.id === currentUser?.id);
  if (currentUserEntry && currentUserEntry.rank > 10) {
    leaderboard.push(currentUserEntry);
  }
  leaderboard.sort((a, b) => {
    const difference = a[leaderboardSort] - b[leaderboardSort];
    return (leaderboardDirection === 'asc' ? difference : -difference) || a.rank - b.rank;
  });

  const maxScore = Math.max(...leaderboard.map((u) => u.score), 1);
  const maxCorrect = Math.max(...leaderboard.map((u) => u.totalCorrect), 1);
  const maxMoves = users.reduce(
    (max, user) => Math.max(max, sumStat(user, 'total_moves_earned')),
    0,
  );

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          Back to Home
        </Link>
        <h1 className={styles.title}>🏆 All Users Progress</h1>
      </header>

      <section className={styles.leaderboardSection}>
        <h2 id="leaderboard-title" className={styles.leaderboardTitle}>🥇 Top 10 Leaderboard</h2>
        <div className={styles.leaderboard} role="table" aria-labelledby="leaderboard-title">
          <div className={styles.leaderboardHeader} role="row">
            <span role="columnheader" aria-label="Score rank">#</span>
            <span role="columnheader">Player</span>
            <div className={styles.leaderboardHeaderStats} role="presentation">
              {LEADERBOARD_COLUMNS.map((column) => (
                <span
                  key={column.key}
                  role="columnheader"
                  aria-sort={leaderboardSort === column.key ? (leaderboardDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <button
                    type="button"
                    className={styles.sortableHeader}
                    onClick={() => handleLeaderboardSort(column.key)}
                    aria-label={`Sort leaderboard by ${column.label}`}
                  >
                    {column.label}{' '}
                    <span aria-hidden="true">
                      {leaderboardSort === column.key ? (leaderboardDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </button>
                </span>
              ))}
            </div>
          </div>
          {leaderboard.map((user) => {
            const medal =
              user.rank === 1
                ? '🥇'
                : user.rank === 2
                  ? '🥈'
                  : user.rank === 3
                    ? '🥉'
                    : `${user.rank}.`;
            const maskedUsername = maskUsername(user.username);
            const isCurrentUser = currentUser && user.id === currentUser.id;
            const hue = Math.round((user.successRate / 100) * 120); // 0 to 120 (red to green)
            const successRateColor = `hsl(${hue}, 70%, 50%)`;
            const scoreBarWidth = (user.score / maxScore) * 100;
            const correctBarWidth = (user.totalCorrect / maxCorrect) * 100;

            return (
              <div
                key={user.id}
                className={`${styles.leaderboardItem} ${isCurrentUser ? styles.currentUserLeaderboardItem : ''}`}
                role="row"
              >
                <span className={styles.leaderboardRank} role="cell" aria-label={`Score rank ${user.rank}`}>{medal}</span>
                <span className={styles.leaderboardUsername} role="cell">
                  <span aria-hidden="true">
                    {LEADERBOARD_AVATARS[user.id % LEADERBOARD_AVATARS.length]}
                  </span>
                  <span className={styles.leaderboardName} title={maskedUsername}>
                    {maskedUsername}
                  </span>
                  {isCurrentUser && (
                    <span className={styles.currentUserLabel}>You</span>
                  )}
                </span>
                <div className={styles.leaderboardStats} role="presentation">
                  <span className={styles.leaderboardStat} role="cell">
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
                  <span className={styles.leaderboardStat} role="cell">
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
                  <span className={styles.leaderboardStat} role="cell">
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

      <section className={styles.leaderboardSection}>
        <h2 id="users-progress-title" className={styles.leaderboardTitle}>
          📊 All Players Progress
        </h2>
        <div className={styles.tableContainer}>
        <table className={styles.table} aria-labelledby="users-progress-title">
          <thead className={styles.thead}>
            <tr>
              {TABLE_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`${styles.headerCell} ${column.key === 'username' ? styles.stickyCol : ''}`}
                  data-game={column.game ? column.key : undefined}
                  aria-sort={sortColumn === column.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <button
                    type="button"
                    className={styles.sortableHeader}
                    onClick={() => handleSort(column.key)}
                    aria-label={`Sort by ${column.label}${column.game ? ' unlocked level' : ''}`}
                  >
                    {column.label}{' '}
                    <span aria-hidden="true">
                      {sortColumn === column.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {sortedUsers.map((user) => {
              const totalCorrect = sumStat(user, 'correct_answers');
              const totalWrong = sumStat(user, 'wrong_answers');
              const totalAttempts = sumStat(user, 'quiz_attempts');
              const successRate =
                totalCorrect + totalWrong > 0
                  ? Math.round(
                      (totalCorrect / (totalCorrect + totalWrong)) * 100,
                    )
                  : 0;
              const totalMoves = sumStat(user, 'total_moves_earned');
              // Calculate dynamic color based on success rate (0% = red, 50% = yellow, 100% = green)
              const hue = Math.round((successRate / 100) * 120); // 0 to 120 (red to green)
              const successRateColor = `hsl(${hue}, 70%, 50%)`;
              const successRateBarColor = `hsl(${hue}, 70%, 45%)`;
              const date = new Date(user.created_at);
              const joinedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
              const lastActiveDate = user.last_active
                ? new Date(user.last_active)
                : null;
              const activityRecency = getActivityRecency(lastActiveDate, activityAsOf);
              const lastActiveDisplay = lastActiveDate && Number.isFinite(lastActiveDate.getTime())
                ? `${String(lastActiveDate.getDate()).padStart(2, '0')}/${String(lastActiveDate.getMonth() + 1).padStart(2, '0')}/${lastActiveDate.getFullYear()}`
                : null;
              const maskedUsername = maskUsername(user.username);
              const isCurrentUser = currentUser && user.id === currentUser.id;

              return (
                <tr
                  key={user.id}
                  className={`${styles.row} ${isCurrentUser ? styles.currentUserRow : ''}`}
                >
                  <td
                    className={`${styles.cell} ${styles.usernameCell} ${styles.stickyCol}`}
                  >
                    {maskedUsername}
                    {isCurrentUser && (
                      <span className={styles.currentUserLabel}>You</span>
                    )}
                  </td>
                  <td className={styles.cell}>
                    <div className={styles.gameStats}>
                      <div className={styles.level}>
                        L{user.starter.unlocked_lessons}
                      </div>
                      <div className={styles.correct}>
                        ✅ {user.starter.correct_answers}
                      </div>
                      <div className={styles.wrong}>
                        ❌ {user.starter.wrong_answers}
                      </div>
                    </div>
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
                    <div
                      className={styles.activityBarContainer}
                      role="img"
                      aria-label={`${totalMoves} moves compared with the highest total of ${maxMoves}`}
                      title={`Compared with the highest total of ${maxMoves} moves`}
                    >
                      <div
                        className={styles.activityBar}
                        style={{
                          width: `${maxMoves > 0 ? (totalMoves / maxMoves) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td className={`${styles.cell} ${styles.lastActiveCell}`}>
                    <span
                      className={`${styles.activityRecency} ${styles[activityRecency.level]}`}
                    >
                      {activityRecency.label}
                    </span>
                    {lastActiveDisplay && (
                      <div className={styles.lastActiveDate}>{lastActiveDisplay}</div>
                    )}
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
      </section>
    </main>
  );
}
