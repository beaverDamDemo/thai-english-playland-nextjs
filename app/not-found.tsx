import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <main className={styles.page}>
        <nav aria-label="Not found page actions">
          <Link className={styles.primaryAction} href="/">
            Return Home
          </Link>
        </nav>
    </main>
  );
}