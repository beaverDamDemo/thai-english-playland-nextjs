'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import type { ComponentType, FC } from 'react';
import { getLessonConfig, getBackgroundGradient } from '../lessonMapConfig';

const MazePageComponent = dynamic(() => import('./MazePageComponent'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

type QuizComponent = ComponentType<{
  onComplete: (score: number, total: number) => void;
  primaryColor: string;
}>;

type Props = {
  lessonNumber: number;
  Quiz: QuizComponent;
};

const MazeLessonPage: FC<Props> = ({ lessonNumber, Quiz }) => {
  const [Scene, setScene] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    import('./createMazeScene').then((m) => {
      if (mounted) setScene(() => m.createMazeScene(lessonNumber));
    });
    return () => {
      mounted = false;
    };
  }, [lessonNumber]);

  const lessonConfig = getLessonConfig(lessonNumber);
  if (!lessonConfig) return <div>Loading...</div>;

  const {
    color: themeColor,
    colorDark: themeColorDark,
    title: lessonTitle,
    columns,
  } = lessonConfig;
  const backgroundGradient = getBackgroundGradient(themeColor, themeColorDark);

  if (!Scene) return <div>Loading...</div>;

  const QuizWrapper: ComponentType<Record<string, unknown>> = (props) => (
    <Quiz onComplete={() => {}} primaryColor={themeColor} {...props} />
  );

  return (
    <MazePageComponent
      MazeScene={Scene}
      Quiz={QuizWrapper}
      lessonNumber={lessonNumber}
      lessonTitle={lessonTitle}
      themeColor={themeColor}
      themeColorDark={themeColorDark}
      backgroundGradient={backgroundGradient}
      columns={columns}
    />
  );
};

export default dynamic(() => Promise.resolve(MazeLessonPage), { ssr: false });
