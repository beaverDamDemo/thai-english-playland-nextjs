'use client';

import styles from './SitePageMessage.module.css';

/** Friendly card for a page that couldn't load its data (shown inside the normal page layout). */
export default function SitePageMessage({
  title,
  message,
  icon = '🙈',
  retry = true,
  onRetry,
  detail,
  theme,
}: {
  title: string;
  message: string;
  icon?: string;
  retry?: boolean;
  /** What "Try again" does; defaults to reloading the page. */
  onRetry?: () => void;
  /** Small print under the message, e.g. an error code to quote. */
  detail?: string;
  /** Page colour theme ([data-game] value) for the button, e.g. 'home' or 'stats'. */
  theme?: string;
}) {
  return (
    <section className={styles.card} role="alert" data-game={theme}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
      {detail ? <p className={styles.detail}>{detail}</p> : null}
      {retry ? (
        <button
          type="button"
          className={styles.button}
          onClick={onRetry ?? (() => window.location.reload())}
        >
          🔄 Try again
        </button>
      ) : null}
    </section>
  );
}
