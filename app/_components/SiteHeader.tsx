import Link from 'next/link';
import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import styles from './SiteChrome.module.css';
import type { SitePageTheme } from './siteChrome';

/** Playful header for non-game pages (Home, Settings, All Users Progress, Usage Statistics, 404). */
export default function SiteHeader({
  title,
  subtitle,
  icon,
  theme,
  leading,
  width = 1200,
}: {
  title: string;
  /** Small line under the title (e.g. a greeting). */
  subtitle?: ReactNode;
  icon: string;
  theme: SitePageTheme;
  /** Replaces the BACK-to-Home sign on the left (e.g. the home page avatar). */
  leading?: ReactNode;
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
        {leading ?? (
          <Link href="/" className={styles.back} aria-label="Back to Home">
            <Image src="/assets/tinified/back.png" alt="" width={58} height={41} />
          </Link>
        )}
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        <span className={styles.badge} aria-hidden="true">
          {icon}
        </span>
      </div>
    </header>
  );
}

/** Round candy avatar for the left slot of SiteHeader. */
export function SiteHeaderAvatar({ emoji }: { emoji: string }) {
  return (
    <span className={styles.avatar} aria-hidden="true">
      {emoji}
    </span>
  );
}
