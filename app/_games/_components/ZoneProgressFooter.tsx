'use client';

import GameFooter from '@/app/_components/GameFooter';
import { formatZoneCompletion, zoneThemeGames, type CurriculumZone } from '../curriculum';
import { useZoneCompletion } from './ZoneCompletion';

export default function ZoneProgressFooter({ zone }: { zone: CurriculumZone }) {
  // Shares the progress already loaded for the zone's lesson pins (one request per page).
  const { completedIds, error } = useZoneCompletion();

  const lessonCounts = zone.lessons.reduce(
    (counts, lesson) => {
      counts[lesson.status] += 1;
      return counts;
    },
    { done: 0, change: 0, blank: 0 },
  );

  return (
    <GameFooter
      game={zoneThemeGames[zone.id]}
      stats={[
        // Out of the playable lessons only: blank lessons can't be completed yet.
        { label: 'Completed', value: error ? 'Unavailable' : completedIds === null ? 'Loading' : formatZoneCompletion(zone, completedIds) },
        { label: 'Lessons', value: zone.lessons.length },
        { label: 'Done', value: lessonCounts.done },
        { label: 'Change', value: lessonCounts.change },
        { label: 'Blank', value: lessonCounts.blank },
      ]}
    />
  );
}
