'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CSSProperties } from 'react';
import styles from './SiteChrome.module.css';
import { SITE_PAGES, type SitePageTheme } from './siteChrome';

const LINKS = [{ href: '/', label: 'Home', icon: '🏠' }, ...SITE_PAGES];

/** Playful footer for non-game pages: candy-pill links between them. */
export default function SiteFooter({ theme, width = 1200 }: { theme: SitePageTheme; width?: number }) {
  const pathname = usePathname();

  return (
    <footer
      className={styles.footer}
      data-game={theme}
      style={{ '--site-width': `${width}px` } as CSSProperties}
    >
      <nav className={styles.footerNav} aria-label="Pages">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={styles.navLink}
            aria-current={pathname === link.href ? 'page' : undefined}
          >
            <span className={styles.navIcon} aria-hidden="true">
              {link.icon}
            </span>
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
