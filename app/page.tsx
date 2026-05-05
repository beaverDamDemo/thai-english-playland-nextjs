'use client';

// app/map/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './HomeView.module.css';
import { useEffect, useState } from 'react';
import { lessonMapButtons as mazeLessonMapButtons } from './maze/lessonMapConfig';
import { lessonMapButtons as casinoLessonMapButtons } from './casino/lessonMapConfig';
import { lessonMapButtons as pattayaLessonMapButtons } from './pattaya-games/lessonMapConfig';

const MAZE_TOTAL_LESSONS = Math.max(1, mazeLessonMapButtons.length);
const CASINO_TOTAL_LESSONS = Math.max(1, casinoLessonMapButtons.length);
const PATTAYA_TOTAL_LESSONS = Math.max(1, pattayaLessonMapButtons.length);

type ProgressStats = {
  correctAnswers: number;
  wrongAnswers: number;
  quizAttempts: number;
  totalMovesEarned: number;
};

const EMPTY_STATS: ProgressStats = {
  correctAnswers: 0,
  wrongAnswers: 0,
  quizAttempts: 0,
  totalMovesEarned: 0,
};

type AchievementDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  sortOrder: number;
};

type EarnedAchievement = {
  id: string;
  earned_at: string;
};

export default function HomePage() {
  const router = useRouter();
  const [mazeUnlocked, setMazeUnlocked] = useState(1);
  const [casinoUnlocked, setCasinoUnlocked] = useState(1);
  const [pattayaUnlocked, setPattayaUnlocked] = useState(1);
  const [mazeStats, setMazeStats] = useState<ProgressStats>(EMPTY_STATS);
  const [casinoStats, setCasinoStats] = useState<ProgressStats>(EMPTY_STATS);
  const [pattayaStats, setPattayaStats] = useState<ProgressStats>(EMPTY_STATS);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [achievementDefs, setAchievementDefs] = useState<AchievementDef[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<
    EarnedAchievement[]
  >([]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then(
        (data: {
          authenticated?: boolean;
          user?: { username: string } | null;
        }) => {
          if (data.authenticated && data.user) setUsername(data.user.username);
        },
      )
      .catch(() => null);
  }, []);

  useEffect(() => {
    fetch('/api/progress')
      .then((r) => r.json())
      .then(
        (data: {
          ok?: boolean;
          progress?: Record<
            string,
            {
              unlocked_lessons: number;
              correct_answers: number;
              wrong_answers: number;
              quiz_attempts: number;
              total_moves_earned: number;
            }
          >;
        }) => {
          if (!data.ok || !data.progress) return;
          const maze = data.progress['maze'];
          const casino = data.progress['casino'];
          const pattaya = data.progress['pattaya'];
          if (maze) {
            setMazeUnlocked(
              Math.min(MAZE_TOTAL_LESSONS, Math.max(1, maze.unlocked_lessons)),
            );
            setMazeStats({
              correctAnswers: maze.correct_answers,
              wrongAnswers: maze.wrong_answers,
              quizAttempts: maze.quiz_attempts,
              totalMovesEarned: maze.total_moves_earned,
            });
          }
          if (casino) {
            setCasinoUnlocked(
              Math.min(
                CASINO_TOTAL_LESSONS,
                Math.max(1, casino.unlocked_lessons),
              ),
            );
            setCasinoStats({
              correctAnswers: casino.correct_answers,
              wrongAnswers: casino.wrong_answers,
              quizAttempts: casino.quiz_attempts,
              totalMovesEarned: casino.total_moves_earned,
            });
          }
          if (pattaya) {
            setPattayaUnlocked(
              Math.min(
                PATTAYA_TOTAL_LESSONS,
                Math.max(1, pattaya.unlocked_lessons),
              ),
            );
            setPattayaStats({
              correctAnswers: pattaya.correct_answers,
              wrongAnswers: pattaya.wrong_answers,
              quizAttempts: pattaya.quiz_attempts,
              totalMovesEarned: pattaya.total_moves_earned,
            });
          }
        },
      )
      .catch(() => null);
  }, []);

  useEffect(() => {
    fetch('/api/achievements')
      .then((r) => r.json())
      .then(
        (data: {
          ok?: boolean;
          definitions?: AchievementDef[];
          earned?: EarnedAchievement[];
        }) => {
          if (!data.ok) return;
          if (data.definitions) setAchievementDefs(data.definitions);
          if (data.earned) setEarnedAchievements(data.earned);
        },
      )
      .catch(() => null);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/register');
      router.refresh();
    }
  };

  return (
    <main className={styles.playfulHome}>
      <div className={styles.shapeOne} aria-hidden="true" />
      <div className={styles.shapeTwo} aria-hidden="true" />
      <div className={styles.shapeThree} aria-hidden="true" />
      <div className={styles.shapeFour} aria-hidden="true" />

      <header className={`${styles.header} ${styles.centeredHeader}`}>
        {username ? (
          <div className={styles.greetingSection}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>🧒</div>
            </div>
            <div className={styles.welcomeText}>
              <p className={styles.helloText}>Welcome back,</p>
              <h1 className={styles.userName}>{username}!</h1>
            </div>
          </div>
        ) : (
          <div className={styles.titleWrapper}>
            <span className={styles.titleEmoji}>🎪</span>
            <h1 className={styles.title}>Thai English Playland</h1>
          </div>
        )}
      </header>

      <p className={styles.chooseGameText}>Choose a game to play</p>

      <section className={styles.hubGrid} aria-label="Game mode links">
        <Link
          href="/maze"
          className={`${styles.hubCard} ${styles.mazeCard} ${styles.mazeCardWithMap}`}
        >
          <Image
            src="/assets/tinified/map-with-9-clickable-locations.png"
            alt="Map with 9 clickable lesson locations"
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className={styles.mazeCardMap}
            priority
          />
          <div className={styles.mazeCardBody}>
            <span className={styles.hubTitle}>
              <span className={styles.hubIcon}>🌀</span>Maze Adventures
            </span>
          </div>
          <span className={styles.hubArrow}>→</span>
        </Link>

        <Link
          href="/casino"
          className={`${styles.hubCard} ${styles.casinoCard} ${styles.mazeCardWithMap}`}
        >
          <Image
            src="/assets/tinified/casino-map-with-5-clickable-locations.png"
            alt="Casino map with 5 clickable lesson locations"
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className={styles.mazeCardMap}
          />
          <div className={styles.mazeCardBody}>
            <span className={styles.hubTitle}>
              <span className={styles.hubIcon}>🎰</span>Casino Games
            </span>
          </div>
          <span className={styles.hubArrow}>→</span>
        </Link>

        <Link
          href="/pattaya-games"
          className={`${styles.hubCard} ${styles.pattayaCard} ${styles.mazeCardWithMap}`}
        >
          <Image
            src="/assets/tinified/pattaya%20Copilot_20260325_132439.png"
            alt="Pattaya map with clickable lesson locations"
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className={styles.mazeCardMap}
          />
          <div className={styles.mazeCardBody}>
            <span className={styles.hubTitle}>
              <span className={styles.hubIcon}>🏖️</span>Pattaya Fun
            </span>
          </div>
          <span className={styles.hubArrow}>→</span>
        </Link>
      </section>

      <section className={styles.progressCard} aria-label="Your progress">
        <h2 className={styles.progressTitle}>Your Progress</h2>
        <div className={styles.progressDisplay}>
          <article className={styles.progressBlock}>
            <h3 className={styles.progressBlockTitle}>🌀 Maze</h3>
            <div className={styles.progressRows}>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>Unlocked</span>
                <strong className={styles.progressValue}>
                  {mazeUnlocked}/{MAZE_TOTAL_LESSONS}
                </strong>
              </div>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>✅ Correct</span>
                <strong className={styles.progressValue}>
                  {mazeStats.correctAnswers}
                </strong>
              </div>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>❌ Wrong</span>
                <strong className={styles.progressValue}>
                  {mazeStats.wrongAnswers}
                </strong>
              </div>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>🎯 Attempts</span>
                <strong className={styles.progressValue}>
                  {mazeStats.quizAttempts}
                </strong>
              </div>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>👣 Moves</span>
                <strong className={styles.progressValue}>
                  {mazeStats.totalMovesEarned}
                </strong>
              </div>
            </div>
          </article>

          <article className={styles.progressBlock}>
            <h3 className={styles.progressBlockTitle}>� Casino</h3>
            <div className={styles.progressRows}>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>Unlocked</span>
                <strong className={styles.progressValue}>
                  {casinoUnlocked}/{CASINO_TOTAL_LESSONS}
                </strong>
              </div>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>✅ Correct</span>
                <strong className={styles.progressValue}>
                  {casinoStats.correctAnswers}
                </strong>
              </div>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>❌ Wrong</span>
                <strong className={styles.progressValue}>
                  {casinoStats.wrongAnswers}
                </strong>
              </div>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>� Attempts</span>
                <strong className={styles.progressValue}>
                  {casinoStats.quizAttempts}
                </strong>
              </div>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>👣 Moves</span>
                <strong className={styles.progressValue}>
                  {casinoStats.totalMovesEarned}
                </strong>
              </div>
            </div>
          </article>

          <article className={styles.progressBlock}>
            <h3 className={styles.progressBlockTitle}>🏖️ Pattaya</h3>
            <div className={styles.progressRows}>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>Unlocked</span>
                <strong className={styles.progressValue}>
                  {pattayaUnlocked}/{PATTAYA_TOTAL_LESSONS}
                </strong>
              </div>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>✅ Correct</span>
                <strong className={styles.progressValue}>
                  {pattayaStats.correctAnswers}
                </strong>
              </div>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>❌ Wrong</span>
                <strong className={styles.progressValue}>
                  {pattayaStats.wrongAnswers}
                </strong>
              </div>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>🎯 Attempts</span>
                <strong className={styles.progressValue}>
                  {pattayaStats.quizAttempts}
                </strong>
              </div>
              <div className={styles.progressRow}>
                <span className={styles.progressLabel}>👣 Moves</span>
                <strong className={styles.progressValue}>
                  {pattayaStats.totalMovesEarned}
                </strong>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section
        className={styles.achievementsCard}
        aria-label="Your achievements"
      >
        <h2 className={styles.progressTitle}>
          🏅 Achievements
          <span className={styles.achievementsCount}>
            {earnedAchievements.length}/{achievementDefs.length}
          </span>
        </h2>
        <div className={styles.achievementsGrid}>
          {[...achievementDefs]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((def) => {
              const earned = earnedAchievements.find((e) => e.id === def.id);
              const isEarned = Boolean(earned);
              return (
                <div
                  key={def.id}
                  className={`${styles.achievementItem} ${
                    isEarned
                      ? styles.achievementEarned
                      : styles.achievementLocked
                  }`}
                  title={
                    isEarned && earned
                      ? `Earned ${new Date(earned.earned_at).toLocaleDateString()}`
                      : 'Not earned yet'
                  }
                >
                  <span className={styles.achievementIcon}>{def.icon}</span>
                  <div className={styles.achievementInfo}>
                    <span className={styles.achievementTitle}>{def.title}</span>
                    <span className={styles.achievementDescription}>
                      {def.description}
                    </span>
                  </div>
                </div>
              );
            })}
          {achievementDefs.length === 0 && (
            <p className={styles.achievementsEmpty}>Loading achievements...</p>
          )}
        </div>
      </section>

      <section
        className={styles.bottomPageActions}
        aria-label="Progress actions"
      >
        <div className={styles.progressActions}>
          <Link href="/settings" className={styles.settingsLink}>
            Settings
          </Link>
          <Link
            href="/all-users-progress"
            className={styles.allUsersProgressLink}
          >
            All Users Progress
          </Link>
          <Link href="/usage-statistics" className={styles.usageStatisticsLink}>
            📈 Usage Statistics
          </Link>
          <button
            className={styles.logoutButton}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
      </section>
    </main>
  );
}
