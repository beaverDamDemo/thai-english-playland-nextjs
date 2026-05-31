// app/maze/lesson3/Quiz.tsx
'use client';

import MazeQuiz, { type QuizQuestion } from '../_components/MazeQuiz';

const questions: QuizQuestion[] = [
  {
    q: 'Every weekday, I _______ to school by bike.',
    options: ['go', 'went', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'Yesterday, she _______ to the market for fruit.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'Tomorrow, we _______ to the zoo with our class.',
    options: ['will go', 'go', 'went', 'is going'],
    answer: 0,
  },
  {
    q: 'Right now, he _______ to the gym for his workout.',
    options: ['is going', 'go', 'went', 'will go'],
    answer: 0,
  },
  {
    q: 'Last weekend, they _______ to the beach for a picnic.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'On Mondays, I _______ to work by train.',
    options: ['go', 'went', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'Every Friday, we _______ to the cinema after dinner.',
    options: ['go', 'went', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'Later today, I _______ to the store for groceries.',
    options: ['will go', 'go', 'went', 'is going'],
    answer: 0,
  },
  {
    q: 'At the moment, she _______ to the library to study.',
    options: ['is going', 'go', 'went', 'will go'],
    answer: 0,
  },
  {
    q: 'Last summer, they _______ to the mountains for hiking.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'Next week, I _______ to visit my grandparents.',
    options: ['will go', 'go', 'went', 'is going'],
    answer: 0,
  },
  {
    q: 'He _______ to the dentist yesterday.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'We _______ to the museum every year.',
    options: ['go', 'went', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'She _______ to the cafe right now.',
    options: ['is going', 'go', 'went', 'will go'],
    answer: 0,
  },
  {
    q: 'They _______ to the concert last night.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'I _______ to the park every morning.',
    options: ['go', 'went', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'He _______ to the airport tomorrow.',
    options: ['will go', 'go', 'went', 'is going'],
    answer: 0,
  },
  {
    q: 'She _______ to the bakery now.',
    options: ['is going', 'go', 'went', 'will go'],
    answer: 0,
  },
  {
    q: 'We _______ to the lake last weekend.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'I _______ to the gym three times a week.',
    options: ['go', 'went', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'They _______ to the restaurant tonight.',
    options: ['will go', 'go', 'went', 'is going'],
    answer: 0,
  },
  {
    q: 'He _______ to the office earlier today.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'She _______ to the bookstore every Saturday.',
    options: ['go', 'went', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'We _______ to the party later.',
    options: ['will go', 'go', 'went', 'is going'],
    answer: 0,
  },
  {
    q: 'I _______ to the doctor yesterday.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'He _______ to the supermarket now.',
    options: ['is going', 'go', 'went', 'will go'],
    answer: 0,
  },
  {
    q: 'They _______ to the stadium last Sunday.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'She _______ to the salon tomorrow.',
    options: ['will go', 'go', 'went', 'is going'],
    answer: 0,
  },
  {
    q: 'We _______ to the zoo every summer.',
    options: ['go', 'went', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'I _______ to the cafe this afternoon.',
    options: ['will go', 'go', 'went', 'is going'],
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
      shuffleOptions={true}
    />
  );
}
