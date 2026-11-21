import styles from './GameFooter.module.css';

export type FooterGame = 'maze' | 'casino' | 'pattaya' | 'starter';
export type FooterTheme = FooterGame | 'pattaya-zone';

export type FooterStat = { label: string; value: string | number };

const STAT_ICONS: Record<string, string> = {
  Correct: '✅',
  Wrong: '❌',
  Completed: '🏁',
  Unlocked: '🔓',
  Attempts: '🎯',
  Moves: '👣',
  Lessons: '📚',
  Done: '🌟',
  Change: '✏️',
  Blank: '🫧',
  Progress: '⏳',
};

export default function GameFooter({
  game,
  stats,
}: {
  game: FooterTheme;
  stats: FooterStat[];
}) {
  return (
    <footer className={styles.footer} data-game={game}>
      {stats.map(({ label, value }) => (
        <span key={label} className={styles.chip} title={`${label}: ${value}`}>
          <span className={styles.chipIcon} aria-hidden="true">
            {STAT_ICONS[label] ?? '⭐'}
          </span>
          <span className={styles.chipLabel}>{label}</span>
          <span className={styles.chipValue}>{value}</span>
        </span>
      ))}
    </footer>
  );
}
