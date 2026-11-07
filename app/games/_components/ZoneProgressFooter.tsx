'use client';

import { useEffect, useState } from 'react';
import GameFooter from '@/app/_components/GameFooter';
import { zoneThemeGames, type CurriculumZone } from '../curriculum';

type LessonProgress = {
  lesson_id: string;
  completed_at: string | null;
};

export default function ZoneProgressFooter({ zone }: { zone: CurriculumZone }) {
  const [completed, setCompleted] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch('/api/progress', { signal: controller.signal });
        if (!response.ok) throw new Error(`Progress request failed: ${response.status}`);
        const data: { ok: boolean; lessons?: LessonProgress[] } = await response.json();
        if (!data.ok || !Array.isArray(data.lessons)) throw new Error('Invalid progress response');
        const ids = new Set(zone.lessons.map((lesson) => lesson.id));
        setCompleted(data.lessons.filter((lesson) => ids.has(lesson.lesson_id) && lesson.completed_at).length);
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
        { label: 'Completed', value: error ? 'Unavailable' : completed === null ? 'Loading' : `${completed}/${zone.lessons.length}` },
        { label: 'Lessons', value: zone.lessons.length },
        { label: 'Done', value: lessonCounts.done },
        { label: 'Change', value: lessonCounts.change },
        { label: 'Blank', value: lessonCounts.blank },
      ]}
    />
  );
}
