import Image from 'next/image';
import Link from 'next/link';
import ZoneProgressFooter from './ZoneProgressFooter';
import { LessonPinLink, ZoneCompletionProvider } from './ZoneCompletion';
import { getLessonHref, zoneThemeGames, type CurriculumZone, type CurriculumZoneId } from '../curriculum';
import styles from '../../../styles/map.module.css';

const lessonStatusLabels = {
  done: 'Done',
  change: 'Needs change',
  blank: 'Blank',
} as const;

const lessonStatusIcons = {
  done: '✓',
  change: '✎',
  blank: '○',
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
    <ZoneCompletionProvider>
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
            const href = getLessonHref(zone, lesson);
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
                <LessonPinLink
                  href={href}
                  lessonId={lesson.id}
                  number={lesson.number}
                  label={`Lesson ${lesson.number}: ${lesson.title}. ${lesson.activity}: ${lesson.description} Status: ${statusLabel.toLowerCase()}.`}
                  style={
                    {
                      borderColor: point.color,
                      '--location-border': point.color,
                    } as React.CSSProperties
                  }
                />
                <span
                  className={`${styles.lessonCloud} ${lessonStatusClasses[lesson.status]}`}
                  aria-hidden="true"
                >
                  <span className={styles.lessonCloudStatus}>
                    <span className={styles.lessonCloudStatusIcon}>
                      {lessonStatusIcons[lesson.status]}
                    </span>
                    {statusLabel}
                  </span>
                  <span className={styles.lessonCloudTitle}>
                    {lesson.title}
                  </span>
                  <span className={styles.lessonCloudActivity}>
                    <span className={styles.lessonCloudActivityIcon}>
                      {lesson.icon}
                    </span>
                    {lesson.activity}
                  </span>
                  <span className={styles.lessonCloudDescription}>
                    {lesson.description}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <ZoneProgressFooter zone={zone} />
    </main>
    </ZoneCompletionProvider>
  );
}
