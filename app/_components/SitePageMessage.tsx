'use client';

import styles from './SitePageMessage.module.css';

/** Friendly card for a page that couldn't load its data (shown inside the normal page layout). */
export default function SitePageMessage({
  title,
  message,
  icon = '🙈',
  retry = true,
}: {
  title: string;
  message: string;
  icon?: string;
  retry?: boolean;
}) {
  return (
    <section className={styles.card} role="alert">
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
      {retry ? (
        <button type="button" className={styles.button} onClick={() => window.location.reload()}>
          🔄 Try again
        </button>
      ) : null}
    </section>
  );
}
