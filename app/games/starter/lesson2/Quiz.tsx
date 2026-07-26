'use client';
import MazeQuiz, { type QuizQuestion } from '@/app/games/maze/_components/MazeQuiz';

const questions: QuizQuestion[] = [
  { q: 'Which animal says "meow"?',                        options: ['dog', 'cat', 'bird', 'fish'],        answer: 1 },
  { q: 'Which animal says "woof"?',                        options: ['cat', 'horse', 'dog', 'cow'],        answer: 2 },
  { q: 'Which animal is the largest land animal?',         options: ['lion', 'elephant', 'hippo', 'bear'], answer: 1 },
  { q: 'Which animal has a very long neck?',               options: ['tiger', 'zebra', 'giraffe', 'monkey'],answer: 2 },
  { q: 'Which animal hops and has long ears?',             options: ['squirrel', 'rabbit', 'hamster', 'cat'],answer: 1 },
  { q: 'Which animal can fly?',                            options: ['fish', 'dog', 'bird', 'cat'],        answer: 2 },
  { q: 'Which animal has black and white stripes?',        options: ['lion', 'tiger', 'panda', 'zebra'],   answer: 3 },
  { q: 'Which animal gives us milk?',                      options: ['horse', 'cow', 'dog', 'fish'],       answer: 1 },
  { q: 'Which animal has a trunk?',                        options: ['lion', 'tiger', 'elephant', 'bear'], answer: 2 },
  { q: 'A baby cat is called a _______.',                  options: ['cub', 'puppy', 'kitten', 'foal'],    answer: 2 },
  { q: 'A baby dog is called a _______.',                  options: ['kitten', 'cub', 'foal', 'puppy'],    answer: 3 },
  { q: 'Which animal lives in water and has fins?',        options: ['rabbit', 'cow', 'fish', 'cat'],      answer: 2 },
  { q: 'Which animal lays eggs?',                          options: ['dog', 'cat', 'horse', 'hen'],        answer: 3 },
  { q: 'Which animal is called "man\'s best friend"?',     options: ['cat', 'bird', 'horse', 'dog'],       answer: 3 },
  { q: 'Which animal has a mane around its face?',         options: ['tiger', 'lion', 'bear', 'wolf'],     answer: 1 },
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
