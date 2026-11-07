'use client';

import MazeLessonPage from '../../maze/_components/MazeLessonPage';
import Quiz from './Quiz';

export default function Page() {
  return (
    <MazeLessonPage
      lessonNumber={3}
      lessonTitleOverride="Future Forms (will / going to)"
      Quiz={Quiz}
      returnHref="/games/verbs-communication"
      returnLabel="Return to Pattaya"
    />
  );
}
