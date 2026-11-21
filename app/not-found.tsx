import Link from 'next/link';
import styles from './not-found.module.css';
import SiteHeader from './_components/SiteHeader';
import SiteFooter from './_components/SiteFooter';

export default function NotFound() {
  return (
    <>
      <SiteHeader title="Page Not Found" subtitle="Oops! This page wandered off." icon="🧭" theme="home" />
      <main className={styles.page}>
        <div className={styles.imageArea}>
          <nav aria-label="Not found page actions">
            <Link className={styles.primaryAction} href="/">
              Return Home
            </Link>
          </nav>
        </div>
      </main>
      <SiteFooter theme="home" />
    </>
  );
}
