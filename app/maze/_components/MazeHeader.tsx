'use client';

import Link from 'next/link';
import styles from './MazeHeader.module.css';

const APP_VERSION = '0.0.9';

export default function MazeHeader({ score }: { score: number }) {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.backArrow}>
        ← Back
      </Link>
      <div className={styles.metaGroup}>
        <div className={styles.version}>Version {APP_VERSION}</div>
        <div className={styles.score}>Score: {score}</div>
      </div>
    </header>
  );
}
