import Link from 'next/link';
import styles from '../../../styles/map.module.css';

export default function CurriculumLessonPlaceholder({
  zoneTitle,
  zoneHref,
  lessonNumber,
  lessonTitle,
  theme,
}: {
  zoneTitle: string;
  zoneHref: string;
  lessonNumber: number;
  lessonTitle: string;
  /** Zone colour theme ([data-game] value). */
  theme?: string;
}) {
  return (
    <main className={styles.mazePage}>
      <header className={styles.pageHeader} data-game={theme}>
        <h1 className={styles.appTitle}>Lesson {lessonNumber}: {lessonTitle}</h1>
      </header>
      <section className={styles.curriculumPlaceholderPage}>
        <p>Lesson content coming soon.</p>
        <Link href={zoneHref}>Back to {zoneTitle}</Link>
      </section>
    </main>
  );
}
