'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isValidLessonState, type LessonStates, type StatefulLessonId } from '@/app/games/starter/lessonState';

export function useLessonState<K extends StatefulLessonId>(lessonId: K) {
  const [loaded, setLoaded] = useState(false);
  const [initialState, setInitialState] = useState<LessonStates[K] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const generation = useRef<string | null>(null);
  const latest = useRef<LessonStates[K] | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/lesson-state?lesson_id=${encodeURIComponent(lessonId)}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!response.ok) throw new Error(`Load failed: ${response.status}`);
        const data: { ok?: boolean; generation?: unknown; state?: unknown } = await response.json();
        if (!data.ok || typeof data.generation !== 'string' ||
            (data.state !== null && !isValidLessonState(lessonId, data.state))) {
          throw new Error('Invalid lesson state response');
        }
        generation.current = data.generation;
        setInitialState(data.state);
        setLoaded(true);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Failed to load lesson progress:', error);
        setLoadError(true);
      }
    }
    void load();
    return () => controller.abort();
  }, [lessonId]);

  const save = useCallback((state: LessonStates[K]) => {
    latest.current = state;
    queue.current = queue.current.then(async () => {
      try {
        if (!generation.current) throw new Error('Lesson state has not loaded');
        const response = await fetch('/api/lesson-state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lesson_id: lessonId, generation: generation.current, state }),
          keepalive: true,
        });
        if (!response.ok) throw new Error(`Save failed: ${response.status}`);
        setSaveError(false);
        window.dispatchEvent(new Event('playland-progress-updated'));
      } catch (error) {
        console.error('Failed to save lesson progress:', error);
        setSaveError(true);
      }
    });
  }, [lessonId]);

  const retry = useCallback(() => {
    if (latest.current) save(latest.current);
  }, [save]);

  return { loaded, initialState, loadError, saveError, save, retry };
}
