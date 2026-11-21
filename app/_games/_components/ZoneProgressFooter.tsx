'use client';

import { useEffect, useState } from 'react';
import GameFooter from '@/app/_components/GameFooter';
import { formatZoneCompletion, zoneThemeGames, type CurriculumZone } from '../curriculum';

type LessonProgress = {
  lesson_id: string;
  completed_at: string | null;
};

export default function ZoneProgressFooter({ zone }: { zone: CurriculumZone }) {
  const [completedIds, setCompletedIds] = useState<string[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch('/api/progress', { signal: controller.signal });
        if (!response.ok) throw new Error(`Progress request failed: ${response.status}`);
        const data: { ok: boolean; lessons?: LessonProgress[] } = await response.json();
        if (!data.ok || !Array.isArray(data.lessons)) throw new Error('Invalid progress response');
        setCompletedIds(data.lessons.filter((lesson) => lesson.completed_at).map((lesson) => lesson.lesson_id));
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Failed to load zone progress:', err);
        setError(true);
      }
    }
    void load();
    return () => controller.abort();
  }, [zone.lessons]);

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
