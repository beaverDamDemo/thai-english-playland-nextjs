'use client';

import Link from 'next/link';
import { createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import styles from '../../../styles/map.module.css';

type CompletionState = {
  /** Ids of lessons this learner has completed; null while loading. */
  completedIds: Set<string> | null;
  error: boolean;
};

const CompletionContext = createContext<CompletionState>({ completedIds: null, error: false });

/** Loads the learner's lesson progress once and shares it with the pins and the footer. */
export function ZoneCompletionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CompletionState>({ completedIds: null, error: false });

  useEffect(() => {
    let controller = new AbortController();
    async function load() {
      controller.abort();
      controller = new AbortController();
      try {
        const response = await fetch('/api/progress', { signal: controller.signal });
        if (!response.ok) throw new Error(`Progress request failed: ${response.status}`);
        const data: { ok: boolean; lessons?: Array<{ lesson_id: string; completed_at: string | null }> } =
          await response.json();
        if (!data.ok || !Array.isArray(data.lessons)) throw new Error('Invalid progress response');
        const ids = data.lessons.filter((lesson) => lesson.completed_at).map((lesson) => lesson.lesson_id);
        setState({ completedIds: new Set(ids), error: false });
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Failed to load lesson progress:', err);
        setState((current) => ({ ...current, error: true }));
      }
    }
    void load();
    // Refresh if progress is saved while this page is open (e.g. from another tab's lesson).
    window.addEventListener('playland-progress-updated', load);
    return () => {
      controller.abort();
      window.removeEventListener('playland-progress-updated', load);
    };
  }, []);

  return <CompletionContext.Provider value={state}>{children}</CompletionContext.Provider>;
}

export function useZoneCompletion(): CompletionState {
  return useContext(CompletionContext);
}

/** The numbered lesson circle on a zone map, with a gold medal once the learner has finished it. */
export function LessonPinLink({
  href,
  lessonId,
  number,
  label,
  style,
}: {
  href: string;
  lessonId: string;
  number: number;
  label: string;
  style: CSSProperties;
}) {
  const { completedIds } = useZoneCompletion();
  const finished = completedIds?.has(lessonId) ?? false;

  return (
    <Link
      href={href}
      className={`${styles.locationPin} ${styles.curriculumLocationPin} ${finished ? styles.pinFinished : ''}`}
      aria-label={finished ? `${label} You finished this lesson.` : label}
      title={finished ? 'You finished this lesson!' : undefined}
      style={style}
    >
      {number}
      {finished ? (
        <span className={styles.pinMedal} aria-hidden="true">
          ⭐
        </span>
      ) : null}
    </Link>
  );
}
