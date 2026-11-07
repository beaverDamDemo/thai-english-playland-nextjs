import Image from 'next/image';
import Link from 'next/link';
import ZoneProgressFooter from './ZoneProgressFooter';
import { zoneThemeGames, type CurriculumZone, type CurriculumZoneId } from '../curriculum';
import styles from '../../../styles/map.module.css';

const lessonStatusLabels = {
  done: 'DONE',
  change: 'CHANGE',
  blank: 'BLANK',
} as const;

const lessonStatusClasses = {
  done: styles.lessonStatusDone,
  change: styles.lessonStatusChange,
  blank: styles.lessonStatusBlank,
} as const;

const zoneBackgroundClasses: Partial<Record<CurriculumZoneId, string>> = {
  starter: styles.starterMap,
  'everyday-vocabulary': styles.chiangMaiMap,
  'basic-grammar': styles.goldenBahtMap,
  'building-sentences': styles.phuketMap,
  'verbs-communication': styles.pattayaMap,
};

export default function CurriculumZonePage({
  zone,
}: {
  zone: CurriculumZone;
}) {
  return (
    <main className={`${styles.mazePage} ${styles.curriculumZonePage}`}>
      <header
        className={`${styles.pageHeader} ${styles.curriculumHeader}`}
        data-game={zoneThemeGames[zone.id]}
      >
        <span className={styles.appTitle}>
          {zone.icon} {zone.title}
        </span>
        <Link href="/" className={styles.headerHomeLink}>
          <Image
            src="/assets/tinified/back.png"
            alt="Home"
            width={34}
            height={34}
            className={styles.homeLinkImg}
          />
        </Link>
      </header>

      <div className={styles.curriculumViewport}>
        <div
          className={`${styles.curriculumMap} ${zoneBackgroundClasses[zone.id] ?? ''}`}
        >
          {zone.lessons.map((lesson, index) => {
            const point = zone.mapPoints[index];
            const href =
              lesson.href ??
              `/games/${zone.id}/lesson/${lesson.number}`;
            const statusLabel = lessonStatusLabels[lesson.status];

            return (
              <div
                key={lesson.number}
                className={`${styles.curriculumLessonMarker} ${
                  point.left > 50
                    ? styles.curriculumMarkerLeft
                    : styles.curriculumMarkerRight
                }`}
                style={
                  {
                    '--marker-left': `${point.left}%`,
                    top: `calc(5% + ${point.top}%)`,
                  } as React.CSSProperties
                }
              >
                <Link
                  href={href}
                  className={`${styles.locationPin} ${styles.curriculumLocationPin}`}
                  aria-label={`Lesson ${lesson.number}: ${lesson.title}. ${lesson.activity}. Status: ${statusLabel.toLowerCase()}.`}
                  style={
                    {
                      borderColor: point.color,
                      '--location-border': point.color,
                    } as React.CSSProperties
                  }
                >
                  {lesson.number}
                </Link>
                <span className={styles.lessonCloud} aria-hidden="true">
                  <span className={styles.lessonCloudTitle}>
                    {lesson.title}
                  </span>
                  <span className={styles.lessonCloudActivity}>
                    {lesson.activity}
                  </span>
                  <span
                    className={`${styles.lessonCloudStatus} ${lessonStatusClasses[lesson.status]}`}
                  >
                    {statusLabel}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <ZoneProgressFooter zone={zone} />
    </main>
  );
}
