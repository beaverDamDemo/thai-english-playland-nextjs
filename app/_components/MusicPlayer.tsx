'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initMusic, setInLesson } from '../_lib/client/music';

const LESSON_PATH = /^\/games\/[^/]+\/lesson\d+/;

// Headless: restores the saved music preference and limits playback to lessons.
export default function MusicPlayer() {
  const pathname = usePathname();

  useEffect(() => {
    initMusic();
  }, []);

  useEffect(() => {
    setInLesson(LESSON_PATH.test(pathname ?? ''));
  }, [pathname]);

  return null;
}
