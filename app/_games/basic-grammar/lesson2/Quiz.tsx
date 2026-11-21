'use client';

import MazeQuiz from '@/app/_games/maze/_components/MazeQuiz';
import { pastBeQuestions } from '../beQuestions';

export default function Quiz({
  onComplete,
  primaryColor,
}: {
  onComplete: (score: number, total: number) => void;
  primaryColor: string;
}) {
  return (
    <MazeQuiz
      questions={pastBeQuestions}
      onComplete={onComplete}
      primaryColor={primaryColor}
      shuffleOptions
    />
  );
}
