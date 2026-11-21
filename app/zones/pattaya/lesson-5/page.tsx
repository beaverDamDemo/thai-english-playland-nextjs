import CurriculumLessonPlaceholder from '@/app/_games/_components/CurriculumLessonPlaceholder';
import { getCurriculumZone, getZoneHref } from '@/app/_games/curriculum';

const zone = getCurriculumZone('verbs-communication')!;
const lesson = zone.lessons.find((item) => item.number === 5)!;

export default function Page() {
  return (
    <CurriculumLessonPlaceholder
      zoneTitle={zone.title}
      zoneHref={getZoneHref(zone)}
      lessonNumber={lesson.number}
      lessonTitle={lesson.title}
    />
  );
}
