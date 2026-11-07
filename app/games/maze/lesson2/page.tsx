'use client';

import Quiz from './Quiz';
import MazeLessonPage from '../_components/MazeLessonPage';

export default function Page() {
  return (
    <MazeLessonPage
      lessonNumber={2}
      Quiz={Quiz}
      returnHref="/games/everyday-vocabulary"
      returnLabel="Return to Chiang Mai"
    />
  );
}
