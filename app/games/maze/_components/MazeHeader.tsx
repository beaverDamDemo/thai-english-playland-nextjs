'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './MazeHeader.module.css';

export type HeaderGame = 'maze' | 'casino' | 'pattaya' | 'starter';

export default function MazeHeader({
  score,
  backHref = '/games/maze',
  game = 'maze',
}: {
  score: number;
  backHref?: string;
  game?: HeaderGame;
}) {
  void score;

  return (
    <header className={`${styles.header} ${styles[game]}`}>
      <Link href={backHref} className={styles.backArrow}>
        <Image
          src="/assets/tinified/back.png"
          alt="Home"
          width={34}
          height={34}
          className={styles.homeLinkImg}
        />
      </Link>
    </header>
  );
}
