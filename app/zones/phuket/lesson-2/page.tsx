import CurriculumLessonPlaceholder from '@/app/_games/_components/CurriculumLessonPlaceholder';
import { getCurriculumZone, getZoneHref, zoneThemeGames } from '@/app/_games/curriculum';

const zone = getCurriculumZone('building-sentences')!;
const lesson = zone.lessons.find((item) => item.number === 2)!;

export default function Page() {
  return (
    <CurriculumLessonPlaceholder
      zoneTitle={zone.title}
      zoneHref={getZoneHref(zone)}
      lessonNumber={lesson.number}
      lessonTitle={lesson.title}
      theme={zoneThemeGames[zone.id]}
    />
  );
}
