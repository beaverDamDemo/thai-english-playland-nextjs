'use client';

import Link from 'next/link';
import styles from './LessonStateNotice.module.css';

export function LessonStateLoading({ error }: { error: boolean }) {
  return (
    <main className={styles.notice} role={error ? 'alert' : 'status'}>
      {error ? (
        <p>Could not load your progress. Please reload this page. · โหลดความคืบหน้าไม่สำเร็จ กรุณาโหลดหน้านี้ใหม่</p>
      ) : (
        <p>Loading your progress... · กำลังโหลดความคืบหน้า...</p>
      )}
      <Link href="/games/starter">Back to Starter · กลับไปหน้าบทเรียน</Link>
    </main>
  );
}

export function LessonStateSaveError({ retry }: { retry: () => void }) {
  return (
    <div className={styles.notice} role="alert">
      <p>Progress could not be saved. Try again, or reload if progress was reset. · บันทึกความคืบหน้าไม่สำเร็จ ลองอีกครั้งหรือโหลดหน้าใหม่</p>
      <button type="button" onClick={retry}>Try saving again · ลองบันทึกอีกครั้ง</button>
    </div>
  );
}
