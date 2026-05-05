'use client';

import Quiz from './Quiz';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import { getLessonConfig, getBackgroundGradient } from '../lessonMapConfig';

const MazePageComponent = dynamic(
  () => import('../_components/MazePageComponent'),
  { ssr: false, loading: () => <div>Loading...</div> },
);

const MazePage: FC = () => {
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

  const lessonConfig = getLessonConfig(8);
  if (!lessonConfig) return <div>Loading...</div>;

  const {
    color: themeColor,
    colorDark: themeColorDark,
    title: lessonTitle,
    columns,
  } = lessonConfig;
  const backgroundGradient = getBackgroundGradient(themeColor, themeColorDark);

  if (!Scene) return <div>Loading...</div>;

  const QuizWrapper: React.ComponentType<Record<string, unknown>> = (props) => (
    <Quiz onComplete={() => {}} primaryColor={themeColor} {...props} />
  );

  return (
    <MazePageComponent
      MazeScene={Scene}
      Quiz={QuizWrapper}
      lessonNumber={8}
      lessonTitle={lessonTitle}
      themeColor={themeColor}
      themeColorDark={themeColorDark}
      backgroundGradient={backgroundGradient}
      columns={columns}
    />
  );
};

const DynamicMazePage = dynamic(() => Promise.resolve(MazePage), {
  ssr: false,
});
export default DynamicMazePage;
