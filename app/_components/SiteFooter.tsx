'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';
import styles from './SiteChrome.module.css';
import { SITE_PAGES, type SitePageTheme } from './siteChrome';

const LINKS = [{ href: '/', label: 'Home', icon: '🏠' }, ...SITE_PAGES];

/** Playful footer for non-game pages: candy-pill links between them, plus optional extra buttons. */
export default function SiteFooter({
  theme,
  width = 1200,
  children,
}: {
  theme: SitePageTheme;
  width?: number;
  /** Extra pills after the links, e.g. <SiteFooterButton>. */
  children?: ReactNode;
}) {
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
        {children}
      </nav>
    </footer>
  );
}

/** A footer pill that runs an action instead of navigating (e.g. Log Out). */
export function SiteFooterButton({
  icon,
  children,
  onClick,
  disabled,
}: {
  icon: string;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" className={styles.navLink} onClick={onClick} disabled={disabled}>
      <span className={styles.navIcon} aria-hidden="true">
        {icon}
      </span>
      {children}
    </button>
  );
}
