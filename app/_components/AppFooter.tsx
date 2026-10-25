'use client';

import { usePathname } from 'next/navigation';
import pkg from '../../package.json';
import styles from './AppFooter.module.css';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Fixed UTC formatting keeps server and client output identical.
function formatBuildTime(iso: string | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}, ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`;
}

function gameFromPath(pathname: string | null): string | undefined {
  const match = pathname?.match(/^\/games\/([^/]+)/);
  if (!match) return undefined;
  return match[1] === 'pattaya-games' ? 'pattaya' : match[1];
}

export default function AppFooter() {
  const game = gameFromPath(usePathname());
  const buildTime = formatBuildTime(process.env.NEXT_PUBLIC_BUILD_TIME);

  return (
    <footer
      className={`${styles.appFooter} ${game ? styles.game : ''}`}
      data-game={game}
    >
      <span className={styles.version}>
        v{pkg.version}
        {buildTime ? ` · built ${buildTime}` : ''}
      </span>
    </footer>
  );
}
