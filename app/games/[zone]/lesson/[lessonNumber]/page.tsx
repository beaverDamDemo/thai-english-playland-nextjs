import { notFound } from 'next/navigation';
import CurriculumLessonPlaceholder from '@/app/games/_components/CurriculumLessonPlaceholder';
import { getCurriculumZone } from '@/app/games/curriculum';

export default async function Page({
  params,
}: PageProps<'/games/[zone]/lesson/[lessonNumber]'>) {
  const { zone: zoneId, lessonNumber: lessonNumberParam } = await params;
  const zone = getCurriculumZone(zoneId);
  const lessonNumber = Number(lessonNumberParam);
  const lesson = zone?.lessons.find((item) => item.number === lessonNumber);

  if (!zone || !lesson || lesson.href) notFound();

  return (
    <CurriculumLessonPlaceholder
      zoneTitle={zone.title}
      zoneHref={`/games/${zone.id}`}
      lessonNumber={lesson.number}
      lessonTitle={lesson.title}
    />
  );
}
