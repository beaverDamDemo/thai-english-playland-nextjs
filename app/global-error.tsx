'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import { Fredoka } from 'next/font/google';
import './globals.css';
import SiteHeader from './_components/SiteHeader';
import SiteFooter from './_components/SiteFooter';
import SitePageMessage from './_components/SitePageMessage';
import styles from './error.module.css';

// global-error replaces the root layout, so it brings its own font, styles and theme.
const fredoka = Fredoka({
  variable: '--font-fredoka',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const THEME_SCRIPT = `try{var t=localStorage.getItem('playland-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

/** Last-resort error page, shown when the root layout itself fails. */
export default function GlobalError({
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
    <html lang="en" className={fredoka.variable} suppressHydrationWarning>
      <head>
        <title>Oops! · Thai English Playland</title>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="antialiased">
        <SiteHeader title="Oops!" subtitle="Something went a bit wobbly." icon="🙈" theme="home" />
        <main className={styles.page}>
          <SitePageMessage
            icon="🛠️"
            title="Something went wrong"
            message="The playground tripped over. Try again, or go back Home in a moment."
            detail={error.digest ? `Error code: ${error.digest}` : undefined}
            onRetry={retry}
          />
        </main>
        <SiteFooter theme="home" />
      </body>
    </html>
  );
}
