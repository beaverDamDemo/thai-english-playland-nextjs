'use client';

import { useEffect, useState } from 'react';
import styles from './UnlockToast.module.css';

const VISIBLE_MS = 4500;

export default function UnlockToast({ nextLesson }: { nextLesson: number }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setVisible(false), VISIBLE_MS);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.toast} role="status">
      <span aria-hidden="true" className={styles.icon}>
        🔓
      </span>
      <span>
        Lesson {nextLesson} unlocked!
        <br />
        <span lang="th">ปลดล็อกบทเรียนที่ {nextLesson} แล้ว!</span>
      </span>
    </div>
  );
}
