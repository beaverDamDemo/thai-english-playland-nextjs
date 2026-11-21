'use client';

import MazeLessonPage from '../../maze/_components/MazeLessonPage';
import Quiz from './Quiz';

export default function Page() {
  return (
    <MazeLessonPage
      lessonNumber={4}
      lessonTitleOverride="Forms of be (is / am / are)"
      Quiz={Quiz}
      returnHref="/zones/the-golden-baht-casino"
      returnLabel="Return to The Golden Baht Casino"
    />
  );
}
