'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import SiteHeader from './_components/SiteHeader';
import SiteFooter from './_components/SiteFooter';
import SitePageMessage from './_components/SitePageMessage';
import styles from './error.module.css';

/** Shown when any page crashes while rendering. The root layout (and its version strip) stays. */
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <SiteHeader title="Oops!" subtitle="Something went a bit wobbly." icon="🙈" theme="home" />
      <main className={styles.page}>
        <SitePageMessage
          icon="🛠️"
          title="Something went wrong"
          message="This page tripped over. Try again, or go back Home and pick another game."
          detail={error.digest ? `Error code: ${error.digest}` : undefined}
          onRetry={retry}
        />
      </main>
      <SiteFooter theme="home" />
    </>
  );
}
