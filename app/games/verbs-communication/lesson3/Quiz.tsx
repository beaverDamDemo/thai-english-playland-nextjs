'use client';

import MazeQuiz, {
  type QuizQuestion,
} from '@/app/games/maze/_components/MazeQuiz';

const questions: QuizQuestion[] = [
  {
    q: 'I think it _______ rain later.',
    options: ['will', 'was', 'is', 'does'],
    answer: 0,
  },
  {
    q: 'Look at those clouds! It _______ rain.',
    options: ['is going to', 'will be', 'did', 'has'],
    answer: 0,
  },
  {
    q: 'We _______ visit our grandparents next weekend.',
    options: ['are going to', 'were', 'do', 'have'],
    answer: 0,
  },
  {
    q: 'I promise I _______ help you with your homework.',
    options: ['will', 'am going', 'was', 'did'],
    answer: 0,
  },
  {
    q: 'She bought flour and eggs. She _______ make a cake.',
    options: ['is going to', 'will to', 'did', 'has'],
    answer: 0,
  },
  {
    q: 'The phone is ringing. I _______ answer it.',
    options: ['will', 'am going', 'was', 'does'],
    answer: 0,
  },
  {
    q: 'They have tickets. They _______ see a movie tonight.',
    options: ['are going to', 'will to', 'were', 'do'],
    answer: 0,
  },
  {
    q: 'Maybe our team _______ win the game.',
    options: ['will', 'is going', 'did', 'has'],
    answer: 0,
  },
  {
    q: 'He packed his suitcase. He _______ travel tomorrow.',
    options: ['is going to', 'will to', 'was', 'does'],
    answer: 0,
  },
  {
    q: 'I am sure you _______ enjoy the book.',
    options: ['will', 'are going', 'did', 'have'],
    answer: 0,
  },
  {
    q: 'We _______ have dinner at six. We made a plan.',
    options: ['are going to', 'will to', 'were', 'do'],
    answer: 0,
  },
  {
    q: 'I think I _______ take the blue one.',
    options: ['will', 'am going', 'was', 'does'],
    answer: 0,
  },
];

export default function Quiz({
  onComplete,
  primaryColor,
}: {
  onComplete: (score: number, total: number) => void;
  primaryColor: string;
}) {
  return (
    <MazeQuiz
      questions={questions}
      onComplete={onComplete}
      primaryColor={primaryColor}
      shuffleOptions
    />
  );
}
