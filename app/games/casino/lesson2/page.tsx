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

const CasinoLesson2Page: FC = () => {
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

  const { color: themeColor, dark: themeColorDark } = casinoLessonThemes[2];
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
      lessonNumber={2}
      lessonTitle="There Is / There Are"
      themeColor={themeColor}
      themeColorDark={themeColorDark}
      backgroundGradient={backgroundGradient}
      totalLessons={lessonMapButtons.length}
      statsKey="englishCasinoStats"
      unlockedKey="englishCasinoUnlockedLessons"
      pendingUnlockKey="englishCasinoPendingUnlockLesson"
      backHref="/games/basic-grammar"
      returnHref="/games/basic-grammar"
      returnLabel="Return to The Golden Baht Casino"
    />
  );
};

const DynamicCasinoLesson2Page = dynamic(
  () => Promise.resolve(CasinoLesson2Page),
  {
    ssr: false,
  },
);

export default DynamicCasinoLesson2Page;
