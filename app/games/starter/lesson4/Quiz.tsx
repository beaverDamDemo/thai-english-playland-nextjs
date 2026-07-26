'use client';
import MazeQuiz, { type QuizQuestion } from '@/app/games/maze/_components/MazeQuiz';

const questions: QuizQuestion[] = [
  { q: 'What do you drink when you are thirsty?',              options: ['salt', 'water', 'rice', 'sugar'],       answer: 1 },
  { q: 'An _______ a day keeps the doctor away.',              options: ['orange', 'apple', 'banana', 'mango'],   answer: 1 },
  { q: 'You make scrambled _______ for breakfast.',            options: ['milk', 'butter', 'eggs', 'bread'],      answer: 2 },
  { q: 'Many Asian countries eat _______ as a staple food.',   options: ['pizza', 'pasta', 'rice', 'bread'],      answer: 2 },
  { q: 'You spread butter on _______.',                        options: ['water', 'rice', 'bread', 'soup'],       answer: 2 },
  { q: 'You add _______ to make food taste sweet.',            options: ['salt', 'pepper', 'sugar', 'oil'],       answer: 2 },
  { q: 'Milk comes from a _______.',                           options: ['pig', 'chicken', 'cow', 'fish'],        answer: 2 },
  { q: 'A _______ is a long yellow fruit.',                    options: ['apple', 'orange', 'banana', 'mango'],   answer: 2 },
  { q: 'Bread is baked in an _______.',                        options: ['fridge', 'oven', 'microwave', 'pot'],   answer: 1 },
  { q: '"Soup" is usually served _______.',                    options: ['frozen', 'dry', 'hot', 'raw'],          answer: 2 },
  { q: 'Pizza and pasta come from _______.',                   options: ['France', 'Italy', 'Japan', 'Mexico'],   answer: 1 },
  { q: 'Sushi is a traditional _______ food.',                 options: ['Chinese', 'Korean', 'Japanese', 'Thai'],answer: 2 },
  { q: 'You add _______ to coffee to make it less bitter.',    options: ['salt', 'pepper', 'sugar', 'flour'],     answer: 2 },
  { q: 'Oranges and lemons are types of _______ fruit.',       options: ['berry', 'tropical', 'citrus', 'stone'], answer: 2 },
  { q: 'Fish and chips is a popular dish from _______.',       options: ['USA', 'England', 'France', 'Spain'],    answer: 1 },
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
