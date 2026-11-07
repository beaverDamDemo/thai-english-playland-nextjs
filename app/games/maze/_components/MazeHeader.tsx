'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import styles from './MazeHeader.module.css';
import MusicToggle from '../../../_components/MusicToggle';

export type HeaderGame = 'maze' | 'casino' | 'pattaya' | 'starter';

export default function MazeHeader({
  score,
  title,
  scale = 1,
  backHref = '/games/maze',
  game = 'maze',
}: {
  score: number;
  title: string;
  scale?: number;
  backHref?: string;
  game?: HeaderGame;
}) {
  void score;

  return (
    <header
      className={styles.header}
      data-game={game}
      style={{ '--header-control-size': `${45 / Math.min(scale, 1)}px` } as CSSProperties}
    >
      <Link href={backHref} className={styles.backArrow}>
        <Image
          src="/assets/tinified/back.png"
          alt="Home"
          width={34}
          height={34}
          className={styles.homeLinkImg}
        />
      </Link>
      <h1 className={styles.title}>{title}</h1>
      <MusicToggle />
    </header>
  );
}
