import Image from 'next/image';
import Link from 'next/link';
import styles from '../HomeView.module.css';

export default function PattayaGamesScreenPage() {
  return (
    <main className={`${styles.playfulScreen} ${styles.pattayaGamesScreen}`}>
      <div className={styles.screenShapeOne} aria-hidden="true" />
      <div className={styles.screenShapeTwo} aria-hidden="true" />

      <header className={styles.screenHeader}>
        <h1 className={styles.screenTitle}>Pattaya Games</h1>
        <Link href="/" className={styles.headerHomeLink}>
          <Image
            src="/assets/home-icon.png"
            alt="Home"
            width={28}
            height={28}
            className={styles.homeLinkImg}
          />
        </Link>
      </header>

      <section className={styles.screenCard}>
        <p className={styles.screenText}>
          This area is ready for Pattaya-themed English mini-games.
        </p>
        <p className={styles.screenSubtext}>
          The screen is intentionally blank for now, with the playful layout
          ready to build on.
        </p>
        <div className={styles.screenLinks}>
          <Link href="/" className={styles.secondaryButton}>
            Back Home
          </Link>
          <Link href="/maze" className={styles.primaryButton}>
            Open Maze
          </Link>
        </div>
      </section>
    </main>
  );
}
