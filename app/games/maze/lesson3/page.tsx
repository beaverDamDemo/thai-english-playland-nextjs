'use client';

import Quiz from './Quiz';
import MazeLessonPage from '../_components/MazeLessonPage';

export default function Page() {
  return (
    <MazeLessonPage
      lessonNumber={3}
      Quiz={Quiz}
      lessonTitleOverride="Future Forms (will / going to)"
      returnHref="/games/verbs-communication"
      returnLabel="Return to Pattaya"
    />
  );
}
