// app/maze/lesson8/Quiz.tsx
'use client';

import MazeQuiz, { type QuizQuestion } from '../_components/MazeQuiz';

const questions: QuizQuestion[] = [
  {
    q: 'Choose the place word: "I study at ___."',
    options: ['school', 'under', 'next to', 'happy'],
    answer: 0,
  },
  {
    q: 'Choose the place word: "I save money at the ___."',
    options: ['bank', 'store', 'home', 'table'],
    answer: 0,
  },
  {
    q: 'Choose the place word: "I buy food at the ___."',
    options: ['store', 'school', 'bank', 'under'],
    answer: 0,
  },
  {
    q: 'Choose the place word: "I sleep at ___."',
    options: ['home', 'bank', 'store', 'next to'],
    answer: 0,
  },
  {
    q: 'Complete: "The book is ___ the table."',
    options: ['on', 'under', 'in', 'next to'],
    answer: 0,
  },
  {
    q: 'Complete: "The cat is ___ the table."',
    options: ['on', 'under', 'at', 'from'],
    answer: 1,
  },
  {
    q: 'Complete: "The pen is ___ the bag."',
    options: ['in', 'on', 'under', 'next to'],
    answer: 0,
  },
  {
    q: 'Complete: "The chair is ___ the desk."',
    options: ['next to', 'under', 'in', 'on'],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'The bag is on the table.',
      'The bag is in the table.',
      'The bag is under to table.',
      'The bag on is table.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'The cat is under the chair.',
      'The cat is on under chair.',
      'The cat under is chair.',
      'The cat is in chair under.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'The phone is next to the book.',
      'The phone is next the book.',
      'The phone next to is book.',
      'The phone in next to book.',
    ],
    answer: 0,
  },
  {
    q: 'Pick the preposition that means inside.',
    options: ['in', 'on', 'under', 'next to'],
    answer: 0,
  },
  {
    q: 'Pick the preposition that means above and touching.',
    options: ['on', 'in', 'under', 'next to'],
    answer: 0,
  },
  {
    q: 'Pick the preposition that means below.',
    options: ['on', 'under', 'in', 'next to'],
    answer: 1,
  },
  {
    q: 'Pick the preposition that means beside.',
    options: ['in', 'on', 'next to', 'under'],
    answer: 2,
  },
  {
    q: 'Fill in the blank: "She is ___ home."',
    options: ['at', 'on', 'under', 'next to'],
    answer: 0,
  },
  {
    q: 'Fill in the blank: "He is ___ school now."',
    options: ['at', 'under', 'on', 'next to'],
    answer: 0,
  },
  {
    q: 'Choose the best mini-reading answer: "The bag is under the chair." Where is the bag?',
    options: [
      'under the chair',
      'on the chair',
      'in the chair',
      'next to the chair',
    ],
    answer: 0,
  },
  {
    q: 'Choose the best mini-reading answer: "The bank is next to the store." Where is the bank?',
    options: [
      'under the store',
      'in the store',
      'next to the store',
      'on the store',
    ],
    answer: 2,
  },
  {
    q: 'Choose the incorrect sentence.',
    options: [
      'The book is on the desk.',
      'The key is in the bag.',
      'The cat is next to the sofa.',
      'The phone is under to table.',
    ],
    answer: 1,
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
      shuffleOptions={true}
    />
  );
}
