'use client';
import Quiz from './Quiz';
import StarterLessonPage from '../_components/StarterLessonPage';

export default function Page() {
  return <StarterLessonPage lessonNumber={3} Quiz={Quiz} />;
}
