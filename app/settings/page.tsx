'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './settings.module.css';
import { lessonMapButtons as mazeLessonMapButtons } from '../maze/lessonMapConfig';
import { lessonMapButtons as casinoLessonMapButtons } from '../casino/lessonMapConfig';
import { lessonMapButtons as pattayaLessonMapButtons } from '../pattaya-games/lessonMapConfig';

const MAZE_TOTAL_LESSONS = Math.max(1, mazeLessonMapButtons.length);
const CASINO_TOTAL_LESSONS = Math.max(1, casinoLessonMapButtons.length);
const PATTAYA_TOTAL_LESSONS = Math.max(1, pattayaLessonMapButtons.length);

type SettingsResponse = {
  ok: boolean;
  totalUsers: number;
  error?: string;
};

export default function SettingsPage() {
  const [data, setData] = useState<SettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'all' | 'maze' | 'casino' | 'pattaya' | 'deleteAccount';
    label: string;
  } | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const response = await fetch('/api/settings/overview', {
          cache: 'no-store',
        });
        const json = (await response.json()) as SettingsResponse;
        if (!response.ok || !json.ok) {
          setError(json.error ?? 'Failed to load settings.');
          return;
        }
        if (!cancelled) {
          setData(json);
        }
      } catch {
        if (!cancelled) {
          setError('Network error while loading settings.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleResetProgress = () => {
    setConfirmAction({ type: 'all', label: 'Reset All Progress' });
  };

  const handleResetGameMode = (mode: string) => {
    const label = `Reset ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
    setConfirmAction({ type: mode as 'maze' | 'casino' | 'pattaya', label });
  };

  const handleConfirmReset = () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'deleteAccount') {
      fetch('/api/auth/delete-account', {
        method: 'DELETE',
      })
        .then(() => {
          showNotification('success', 'Account deleted successfully!');
          setConfirmAction(null);
          setTimeout(() => {
            window.location.href = '/register';
          }, 2000);
        })
        .catch(() => {
          showNotification(
            'error',
            'Failed to delete account. Please try again.',
          );
          setConfirmAction(null);
        });
    } else if (confirmAction.type === 'all') {
      const modes = ['maze', 'casino', 'pattaya'];
      Promise.all(
        modes.map((mode) =>
          fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              game_mode: mode,
              unlocked_lessons: 1,
              correct_answers: 0,
              wrong_answers: 0,
              quiz_attempts: 0,
              total_moves_earned: 0,
            }),
          }),
        ),
      )
        .then(() => {
          showNotification('success', 'Progress reset successfully!');
          setConfirmAction(null);
        })
        .catch(() => {
          showNotification(
            'error',
            'Failed to reset progress. Please try again.',
          );
          setConfirmAction(null);
        });
    } else {
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_mode: confirmAction.type,
          unlocked_lessons: 1,
          correct_answers: 0,
          wrong_answers: 0,
          quiz_attempts: 0,
          total_moves_earned: 0,
        }),
      })
        .then(() => {
          showNotification(
            'success',
            `${confirmAction.label} progress reset successfully!`,
          );
          setConfirmAction(null);
        })
        .catch(() => {
          showNotification(
            'error',
            'Failed to reset progress. Please try again.',
          );
          setConfirmAction(null);
        });
    }
  };

  const handleCancelReset = () => {
    setConfirmAction(null);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteAccount = () => {
    setConfirmAction({ type: 'deleteAccount', label: 'Delete Account' });
  };

  const handleUnlockAllLessons = () => {
    const updates = [
      { game_mode: 'maze', unlocked_lessons: MAZE_TOTAL_LESSONS },
      { game_mode: 'casino', unlocked_lessons: CASINO_TOTAL_LESSONS },
      { game_mode: 'pattaya', unlocked_lessons: PATTAYA_TOTAL_LESSONS },
    ];
    Promise.all(
      updates.map((u) =>
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...u,
            correct_answers: 0,
            wrong_answers: 0,
            quiz_attempts: 0,
            total_moves_earned: 0,
          }),
        }),
      ),
    )
      .then(() => {
        showNotification('success', 'All lessons unlocked successfully!');
      })
      .catch(() => {
        showNotification(
          'error',
          'Failed to unlock lessons. Please try again.',
        );
      });
  };

  return (
    <main className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Settings</h1>
        <Link href="/" className={styles.backLink}>
          Back to Home
        </Link>
      </div>

      {loading ? <p className={styles.note}>Loading...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {data ? (
        <>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Database Overview</h2>
            <p className={styles.metric}>Total users: {data.totalUsers}</p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Progress Management</h2>
            <p className={styles.note}>
              Unlock all lessons or reset all your game progress.
            </p>
            <button
              onClick={handleUnlockAllLessons}
              className={styles.unlockButton}
            >
              Unlock All Lessons
            </button>
            <button
              onClick={handleResetProgress}
              className={styles.resetButton}
            >
              Reset All Progress
            </button>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Reset Specific Game Mode</h2>
            <p className={styles.note}>
              Reset progress for individual game modes.
            </p>
            <div className={styles.buttonGroup}>
              <button
                onClick={() => handleResetGameMode('maze')}
                className={styles.gameModeButton}
              >
                🌀 Reset Maze
              </button>
              <button
                onClick={() => handleResetGameMode('casino')}
                className={styles.gameModeButton}
              >
                🎰 Reset Casino
              </button>
              <button
                onClick={() => handleResetGameMode('pattaya')}
                className={styles.gameModeButton}
              >
                🏖️ Reset Pattaya
              </button>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Account Management</h2>
            <p className={styles.note}>
              Delete your account and all associated data. This action cannot be
              undone.
            </p>
            <button
              onClick={handleDeleteAccount}
              className={styles.deleteAccountButton}
            >
              Delete Account
            </button>
          </section>
        </>
      ) : null}

      {confirmAction && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Confirm Reset</h3>
            <p className={styles.modalMessage}>
              Are you sure you want to {confirmAction.label.toLowerCase()}? This
              action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={handleCancelReset}
                className={styles.modalCancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className={styles.modalConfirmButton}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div
          className={`${styles.notification} ${
            notification.type === 'success' ? styles.success : styles.error
          }`}
        >
          {notification.type === 'success' ? '✓' : '✕'} {notification.message}
        </div>
      )}
    </main>
  );
}
