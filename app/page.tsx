// app/map/page.tsx
import Link from 'next/link';
import styles from './HomeView.module.css';
const APP_VERSION = '0.0.14';

export default function HomePage() {
  return (
    <main className={styles.playfulHome}>
      <div className={styles.shapeOne} aria-hidden="true" />
      <div className={styles.shapeTwo} aria-hidden="true" />
      <header className={`${styles.header} ${styles.centeredHeader}`}>
        <h1 className={styles.title}>Thai English Playland</h1>
      </header>

      <section className={styles.hubGrid} aria-label="Game mode links">
        <Link href="/maze" className={`${styles.hubCard} ${styles.mazeCard}`}>
          <span className={styles.hubTitle}>Maze Game Lessons</span>
          <span className={styles.hubText}>
            Classic lesson path with unlocks.
          </span>
        </Link>

        <Link
          href="/casino"
          className={`${styles.hubCard} ${styles.casinoCard}`}
        >
          <span className={styles.hubTitle}>Casino Screen</span>
          <span className={styles.hubText}>
            Blank screen ready for casino games.
          </span>
        </Link>

        <Link
          href="/pattaya-games"
          className={`${styles.hubCard} ${styles.pattayaCard}`}
        >
          <span className={styles.hubTitle}>Pattaya Games Screen</span>
          <span className={styles.hubText}>
            Blank screen ready for Pattaya games.
          </span>
        </Link>
      </section>

      <footer className={`${styles.footerBar} ${styles.rightFooterBar}`}>
        <span className={styles.footerVersion}>{APP_VERSION}</span>
      </footer>
    </main>
  );
}
