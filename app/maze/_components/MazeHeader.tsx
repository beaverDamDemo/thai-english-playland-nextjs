'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './MazeHeader.module.css';

export default function MazeHeader({
  score,
  backHref = '/maze',
}: {
  score: number;
  backHref?: string;
}) {
  void score;

  return (
    <header className={styles.header}>
      <Link href={backHref} className={styles.backArrow}>
        <Image
          src="/assets/back.png"
          alt="Home"
          width={34}
          height={34}
          className={styles.homeLinkImg}
        />
      </Link>
    </header>
  );
}
