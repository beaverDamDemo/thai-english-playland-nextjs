'use client';

import Quiz from './Quiz';
import MazeLessonPage from '../_components/MazeLessonPage';

export default function Page() {
  return <MazeLessonPage lessonNumber={5} Quiz={Quiz} />;
}
