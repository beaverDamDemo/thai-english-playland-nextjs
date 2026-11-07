'use client';

import MazeLessonPage from '../../maze/_components/MazeLessonPage';
import Quiz from './Quiz';

export default function Page() {
  return (
    <MazeLessonPage
      lessonNumber={4}
      lessonTitleOverride="Forms of be (was / were)"
      Quiz={Quiz}
      returnHref="/games/basic-grammar"
      returnLabel="Return to The Golden Baht Casino"
    />
  );
}
