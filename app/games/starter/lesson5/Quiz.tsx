'use client';
import MazeQuiz, { type QuizQuestion } from '@/app/games/maze/_components/MazeQuiz';

const questions: QuizQuestion[] = [
  { q: 'You wear _______ on your feet.',                       options: ['hat', 'gloves', 'shoes', 'scarf'],      answer: 2 },
  { q: 'You wear _______ on your head.',                       options: ['shirt', 'hat', 'socks', 'pants'],       answer: 1 },
  { q: 'You wear _______ on your hands in cold weather.',      options: ['boots', 'gloves', 'socks', 'scarf'],    answer: 1 },
  { q: 'What do you wear on your legs?',                       options: ['shirt', 'hat', 'trousers', 'gloves'],   answer: 2 },
  { q: 'A _______ is worn around the neck to keep warm.',      options: ['belt', 'scarf', 'tie', 'glove'],        answer: 1 },
  { q: 'You wear a _______ when it rains.',                    options: ['sandals', 'raincoat', 'shorts', 'swimsuit'], answer: 1 },
  { q: 'You wear _______ inside your shoes.',                  options: ['gloves', 'socks', 'boots', 'belt'],     answer: 1 },
  { q: 'A _______ keeps the sun off your face.',               options: ['jacket', 'glove', 'hat', 'scarf'],      answer: 2 },
  { q: 'You wear a _______ to a formal event.',                options: ['pyjamas', 'swimsuit', 'suit', 'shorts'], answer: 2 },
  { q: 'In hot weather you wear _______ instead of trousers.', options: ['coat', 'shorts', 'scarf', 'jumper'],    answer: 1 },
  { q: 'A _______ is worn over a shirt to keep warm.',         options: ['tie', 'sandal', 'belt', 'jumper'],      answer: 3 },
  { q: 'You wear a _______ to swim.',                          options: ['suit', 'raincoat', 'swimsuit', 'jacket'], answer: 2 },
  { q: 'A _______ is a formal strip of fabric worn round the neck.', options: ['scarf', 'belt', 'tie', 'glove'], answer: 2 },
  { q: 'You wear a _______ on your feet for the beach.',       options: ['boots', 'sandals', 'gloves', 'socks'],  answer: 1 },
  { q: 'A _______ keeps your trousers from falling down.',     options: ['scarf', 'belt', 'tie', 'sock'],         answer: 1 },
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
