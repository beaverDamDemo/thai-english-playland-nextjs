'use client';

import { useEffect, useState, type ReactNode } from 'react';
import styles from './settings.module.css';
import SiteHeader from '../_components/SiteHeader';
import SiteFooter from '../_components/SiteFooter';
import ThemeToggle from '../_components/ThemeToggle';
import FontToggle from '../_components/FontToggle';
import MusicToggle from '../_components/MusicToggle';
import FontSizeToggle from '../_components/FontSizeToggle';
import { lessonMapButtons as mazeLessonMapButtons } from '../_games/maze/lessonMapConfig';
import { lessonMapButtons as casinoLessonMapButtons } from '../_games/casino/lessonMapConfig';
import { lessonMapButtons as pattayaLessonMapButtons } from '../_games/pattaya-games/lessonMapConfig';
import { lessonMapButtons as starterLessonMapButtons } from '../_games/starter/lessonMapConfig';
import { curriculumZones, type CurriculumZoneId } from '../_games/curriculum';

const MAZE_TOTAL_LESSONS = Math.max(1, mazeLessonMapButtons.length);
const CASINO_TOTAL_LESSONS = Math.max(1, casinoLessonMapButtons.length);
const PATTAYA_TOTAL_LESSONS = Math.max(1, pattayaLessonMapButtons.length);
const STARTER_TOTAL_LESSONS = Math.max(1, starterLessonMapButtons.length);

type SettingsResponse = {
  ok: boolean;
  totalUsers: number;
  error?: string;
};

const RESET_ACTIONS_THAI: Record<'all' | CurriculumZoneId, string> = {
  all: 'รีเซ็ตความคืบหน้าทั้งหมด',
  starter: 'รีเซ็ตความคืบหน้าของโซนผู้เริ่มต้น',
  'everyday-vocabulary': 'รีเซ็ตความคืบหน้าของโซนเชียงใหม่',
  'basic-grammar': 'รีเซ็ตความคืบหน้าของโซนคาสิโน',
  'building-sentences': 'รีเซ็ตความคืบหน้าของโซนภูเก็ต',
  'verbs-communication': 'รีเซ็ตความคืบหน้าของโซนพัทยา',
};

/** Placeholder cards with the same layout as the loaded page, so nothing jumps. */
function SettingsSkeleton() {
  const block = (className: string) => <span className={`${styles.skeleton} ${className}`} />;
  const card = (key: string, body: ReactNode) => (
    <section key={key} className={styles.card}>
      {block(styles.skeletonTitle)}
      {body}
    </section>
  );

  return (
    <>
      <p className={styles.srOnly} role="status">
        Loading settings
      </p>
      <div className={styles.skeletonGroup} aria-hidden="true">
        {card('overview', block(styles.skeletonLine))}
        {card(
          'progress',
          <>
            {block(styles.skeletonLineShort)}
            {block(styles.skeletonButton)}
            {block(styles.skeletonButton)}
          </>,
        )}
        {card(
          'zones',
          <>
            {block(styles.skeletonLineShort)}
            <div className={styles.buttonGroup}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`${styles.skeleton} ${styles.skeletonButton}`} />
              ))}
            </div>
          </>,
        )}
        {card(
          'preferences',
          <>
            {block(styles.skeletonLineShort)}
            <div className={styles.preferencesGroup}>
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className={styles.preferenceItem}>
                  {block(styles.skeletonLabel)}
                  {block(styles.skeletonToggle)}
                </div>
              ))}
            </div>
          </>,
        )}
        {card(
          'account',
          <>
            {block(styles.skeletonLine)}
            {block(styles.skeletonButton)}
          </>,
        )}
      </div>
    </>
  );
}

export default function SettingsPage() {
  const [data, setData] = useState<SettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'all' | CurriculumZoneId | 'deleteAccount';
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

  const handleResetZone = (zone: CurriculumZoneId, name: string) => {
    setConfirmAction({ type: zone, label: `Reset ${name}` });
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
    } else {
      // 'all' or one curriculum zone; the server knows which lessons belong to each zone.
      const isAll = confirmAction.type === 'all';
      fetch('/api/progress/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone: confirmAction.type }),
      })
        .then((response) => {
          if (!response.ok) throw new Error(`Reset failed: ${response.status}`);
        })
        .then(() => {
          showNotification(
            'success',
            isAll ? 'Progress reset successfully!' : `${confirmAction.label} progress reset successfully!`,
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
      { game_mode: 'starter', unlocked_lessons: STARTER_TOTAL_LESSONS },
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
    <>
    <SiteHeader title="Settings" icon="⚙️" theme="settings" />
    <main className={styles.container} aria-busy={loading}>
      {loading ? <SettingsSkeleton /> : null}
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
            <h2 className={styles.cardTitle}>Reset Specific Zone</h2>
            <p className={styles.note}>
              Reset progress for individual zones.
            </p>
            <div className={styles.buttonGroup}>
              {curriculumZones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => handleResetZone(zone.id, zone.title)}
                  className={styles.gameModeButton}
                >
                  {zone.icon} Reset {zone.title}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Preferences</h2>
            <p className={styles.note}>Customize your viewing experience.</p>
            <div className={styles.preferencesGroup}>
              <div className={styles.preferenceItem}>
                <span className={styles.preferenceLabel}>Theme</span>
                <ThemeToggle />
              </div>
              <div className={styles.preferenceItem}>
                <span className={styles.preferenceLabel}>Font Style</span>
                <FontToggle />
              </div>
              <div className={styles.preferenceItem}>
                <span className={styles.preferenceLabel}>Font Size</span>
                <FontSizeToggle />
              </div>
              <div className={styles.preferenceItem}>
                <span className={styles.preferenceLabel}>Music</span>
                <MusicToggle />
              </div>
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
            <h3 className={styles.modalTitle}>
              {confirmAction.type === 'deleteAccount'
                ? 'Confirm Account Deletion'
                : 'Confirm Reset'}
              <span className={styles.modalTranslation} lang="th">
                {confirmAction.type === 'deleteAccount'
                  ? 'ยืนยันการลบบัญชี'
                  : 'ยืนยันการรีเซ็ต'}
              </span>
            </h3>
            <p className={styles.modalMessage}>
              Are you sure you want to {confirmAction.label.toLowerCase()}? This
              action cannot be undone.
              <span className={styles.modalTranslation} lang="th">
                {confirmAction.type === 'deleteAccount'
                  ? 'คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี? การดำเนินการนี้ไม่สามารถย้อนกลับได้'
                  : `คุณแน่ใจหรือไม่ว่าต้องการ${RESET_ACTIONS_THAI[confirmAction.type]}? การดำเนินการนี้ไม่สามารถย้อนกลับได้`}
              </span>
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={handleCancelReset}
                className={styles.modalCancelButton}
              >
                Cancel
                <span className={styles.modalButtonTranslation} lang="th">
                  ยกเลิก
                </span>
              </button>
              <button
                onClick={handleConfirmReset}
                className={styles.modalConfirmButton}
              >
                {confirmAction.type === 'deleteAccount' ? 'Delete Account' : 'Confirm Reset'}
                <span className={styles.modalButtonTranslation} lang="th">
                  {confirmAction.type === 'deleteAccount' ? 'ลบบัญชี' : 'ยืนยันการรีเซ็ต'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div
          className={`${styles.notification} ${
            notification.type === 'success' ? styles.notificationSuccess : styles.notificationError
          }`}
        >
          {notification.type === 'success' ? '✓' : '✕'} {notification.message}
        </div>
      )}
    </main>
    <SiteFooter theme="settings" />
    </>
  );
}
