import Image from 'next/image';
import Link from 'next/link';
import styles from '../HomeView.module.css';

export default function CasinoScreenPage() {
  return (
    <main className={`${styles.playfulScreen} ${styles.casinoScreen}`}>
      <div className={styles.screenShapeOne} aria-hidden="true" />
      <div className={styles.screenShapeTwo} aria-hidden="true" />

      <header className={styles.screenHeader}>
        <h1 className={styles.screenTitle}>Casino Screen</h1>
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
          Casino mode now has its first playable lesson.
        </p>
        <p className={styles.screenSubtext}>
          Start with Lesson 1 here. More casino lessons can be added beside it
          later.
        </p>
        <div className={styles.screenLinks}>
          <Link href="/" className={styles.secondaryButton}>
            Back Home
          </Link>
          <Link href="/casino/lesson1" className={styles.primaryButton}>
            Play Lesson 1
          </Link>
        </div>
      </section>
    </main>
  );
}
