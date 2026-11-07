'use client';

import MazeQuiz from '@/app/games/maze/_components/MazeQuiz';
import { presentBeQuestions } from '@/app/games/maze/lesson4/Quiz';

export default function Quiz({
  onComplete,
  primaryColor,
}: {
  onComplete: (score: number, total: number) => void;
  primaryColor: string;
}) {
  return (
    <MazeQuiz
      questions={presentBeQuestions}
      onComplete={onComplete}
      primaryColor={primaryColor}
      shuffleOptions
    />
  );
}
