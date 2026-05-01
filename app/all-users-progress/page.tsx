'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
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

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🏆 All Users Progress</h1>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← Back to Home
        </button>
      </div>

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
