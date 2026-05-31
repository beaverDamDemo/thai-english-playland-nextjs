'use client';

import Quiz from './Quiz';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import { lessonMapButtons } from '../lessonMapConfig';

const MazePageComponent = dynamic(
  () => import('../../maze/_components/MazePageComponent'),
  { ssr: false, loading: () => <div>Loading...</div> },
);

const CasinoLesson5Page: FC = () => {
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

  const themeColor = '#2A9D8F';
  const themeColorDark = '#1C6E64';
  const backgroundGradient =
    'linear-gradient(135deg, #2A9D8F 0%, #1B5E55 100%)';

  if (!Scene) return <div>Loading...</div>;

  const QuizWrapper = (props: Record<string, unknown>) => (
    <Quiz onComplete={() => {}} primaryColor={themeColor} {...props} />
  );

  return (
    <MazePageComponent
      MazeScene={Scene}
      Quiz={QuizWrapper}
      lessonNumber={5}
      lessonTitle="Casino Lesson 5: Cashier & Chips"
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

const DynamicCasinoLesson5Page = dynamic(
  () => Promise.resolve(CasinoLesson5Page),
  {
    ssr: false,
  },
);

export default DynamicCasinoLesson5Page;
