'use client';

import Quiz from './Quiz';
import MazeLessonPage from '../_components/MazeLessonPage';

export default function Page() {
  return (
    <MazeLessonPage
      lessonNumber={4}
      Quiz={Quiz}
      returnHref="/games/basic-grammar"
      returnLabel="Return to The Golden Baht Casino"
    />
  );
}
