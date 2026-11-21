'use client';

import MazeQuiz from '@/app/_games/maze/_components/MazeQuiz';
import { presentBeQuestions } from '../beQuestions';

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
