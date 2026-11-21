import Link from 'next/link';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import styles from './SiteChrome.module.css';
import type { SitePageTheme } from './siteChrome';

/** Playful header for non-game pages (Settings, All Users Progress, Usage Statistics). */
export default function SiteHeader({
  title,
  icon,
  theme,
  width = 1200,
}: {
  title: string;
  icon: string;
  theme: SitePageTheme;
  /** Max width of the page column, so the header content lines up with it. */
  width?: number;
}) {
  return (
    <header
      className={styles.header}
      data-game={theme}
      style={{ '--site-width': `${width}px` } as CSSProperties}
    >
      <div className={styles.headerInner}>
        <Link href="/" className={styles.back} aria-label="Back to Home">
          <Image src="/assets/tinified/back.png" alt="" width={58} height={41} />
        </Link>
        <h1 className={styles.title}>{title}</h1>
        <span className={styles.badge} aria-hidden="true">
          {icon}
        </span>
      </div>
    </header>
  );
}
