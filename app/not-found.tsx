import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <main className={styles.page}>
      <section className={styles.message}>
        <nav aria-label="Not found page actions">
          <Link className={styles.primaryAction} href="/">
            Return Home
          </Link>
        </nav>
      </section>
    </main>
  );
}