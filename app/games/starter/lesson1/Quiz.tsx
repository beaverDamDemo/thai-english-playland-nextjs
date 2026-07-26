'use client';
import MazeQuiz, { type QuizQuestion } from '@/app/games/maze/_components/MazeQuiz';

const questions: QuizQuestion[] = [
  { q: 'What color is the sky on a sunny day?',        options: ['green', 'blue', 'red', 'purple'],   answer: 1 },
  { q: 'What color is grass?',                         options: ['brown', 'blue', 'green', 'red'],    answer: 2 },
  { q: 'What color is a ripe banana?',                 options: ['green', 'red', 'blue', 'yellow'],   answer: 3 },
  { q: 'What color is snow?',                          options: ['grey', 'black', 'white', 'yellow'], answer: 2 },
  { q: 'What color is a fire truck?',                  options: ['blue', 'red', 'green', 'orange'],   answer: 1 },
  { q: 'What color is coal?',                          options: ['white', 'black', 'orange', 'blue'], answer: 1 },
  { q: 'What color is a strawberry?',                  options: ['blue', 'yellow', 'red', 'green'],   answer: 2 },
  { q: 'What color is a grape?',                       options: ['orange', 'pink', 'green', 'purple'],answer: 3 },
  { q: 'What color are leaves in autumn?',             options: ['blue', 'purple', 'orange', 'white'],answer: 2 },
  { q: 'What color is milk?',                          options: ['yellow', 'white', 'grey', 'pink'],  answer: 1 },
  { q: 'What color is the sun?',                       options: ['white', 'red', 'blue', 'yellow'],   answer: 3 },
  { q: 'What color is chocolate?',                     options: ['brown', 'green', 'blue', 'yellow'], answer: 0 },
  { q: 'What color is a lemon?',                       options: ['red', 'blue', 'yellow', 'purple'],  answer: 2 },
  { q: 'What color are most tree trunks?',             options: ['blue', 'white', 'brown', 'pink'],   answer: 2 },
  { q: 'What color is a carrot?',                      options: ['green', 'orange', 'red', 'purple'], answer: 1 },
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
