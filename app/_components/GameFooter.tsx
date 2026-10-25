import styles from './GameFooter.module.css';

export type FooterGame = 'maze' | 'casino' | 'pattaya' | 'starter';

export type FooterStat = { label: string; value: string | number };

export default function GameFooter({
  game,
  stats,
}: {
  game: FooterGame;
  stats: FooterStat[];
}) {
  return (
    <footer className={styles.footer} data-game={game}>
      {stats.map(({ label, value }) => (
        <span key={label} className={styles.chip}>
          {label}: {value}
        </span>
      ))}
    </footer>
  );
}
