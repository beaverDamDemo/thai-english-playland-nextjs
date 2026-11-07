'use client';

import Quiz from './Quiz';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import { casinoLessonThemes, lessonMapButtons } from '../lessonMapConfig';

const MazePageComponent = dynamic(
  () => import('../../maze/_components/MazePageComponent'),
  { ssr: false, loading: () => <div>Loading...</div> },
);

const CasinoLesson4Page: FC = () => {
  const [Scene, setScene] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    import('./scene').then((m) => {
      if (mounted) setScene(() => m.MazeScene);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const { color: themeColor, dark: themeColorDark } = casinoLessonThemes[4];
  const backgroundGradient =
    `linear-gradient(135deg, ${themeColor} 0%, ${themeColorDark} 100%)`;

  if (!Scene) return <div>Loading...</div>;

  const QuizWrapper = (props: Record<string, unknown>) => (
    <Quiz onComplete={() => {}} primaryColor={themeColor} {...props} />
  );

  return (
    <MazePageComponent
      MazeScene={Scene}
      Quiz={QuizWrapper}
      lessonNumber={4}
      lessonTitle="Casino Lesson 4: Article Slots"
      themeColor={themeColor}
      themeColorDark={themeColorDark}
      backgroundGradient={backgroundGradient}
      totalLessons={lessonMapButtons.length}
      statsKey="englishCasinoStats"
      unlockedKey="englishCasinoUnlockedLessons"
      pendingUnlockKey="englishCasinoPendingUnlockLesson"
      backHref="/games/casino"
      returnHref="/games/casino"
      returnLabel="Return to Casino"
    />
  );
};

const DynamicCasinoLesson4Page = dynamic(
  () => Promise.resolve(CasinoLesson4Page),
  {
    ssr: false,
  },
);

export default DynamicCasinoLesson4Page;
