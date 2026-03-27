'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './MazeHeader.module.css';

const APP_VERSION = '0.0.14';

export default function MazeHeader({
  score,
  backHref = '/maze',
}: {
  score: number;
  backHref?: string;
}) {
  return (
    <header className={styles.header}>
      <Link href={backHref} className={styles.backArrow}>
        <Image
          src="/assets/back.png"
          alt="Home"
          width={28}
          height={28}
          className={styles.homeLinkImg}
        />
      </Link>
      <div className={styles.metaGroup}>
        <div className={styles.version}>Version {APP_VERSION}</div>
        <div className={styles.score}>Score: {score}</div>
      </div>
    </header>
  );
}
