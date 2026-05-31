'use client';

import MazeQuiz, { type QuizQuestion } from '../_components/MazeQuiz';

const questions: QuizQuestion[] = [
  // Keep some hour 7 questions (reduced from 18 to 4)
  {
    q: '7 AM is _______ in 24h format.',
    options: ['7:00', '19:00', '7 PM'],
    answer: 0,
  },
  {
    q: '7 PM is _______ in 24h format.',
    options: ['7:00', '19:00', '7 AM'],
    answer: 1,
  },
  {
    q: '19:00 in 24h format is _______.',
    options: ['7:00', '7 AM', '7 PM'],
    answer: 2,
  },
  {
    q: 'I eat breakfast at 7 AM, which is _______ in 24h format.',
    options: ['7:00', '19:00', '7 PM'],
    answer: 0,
  },
  // Different hours
  {
    q: '3 PM is _______ in 24h format.',
    options: ['3:00', '15:00', '21:00'],
    answer: 1,
  },
  {
    q: '9 AM is _______ in 24h format.',
    options: ['9:00', '21:00', '9 PM'],
    answer: 0,
  },
  {
    q: '15:00 in 24h format is _______.',
    options: ['3:00', '3 AM', '3 PM'],
    answer: 2,
  },
  {
    q: '21:00 in 24h format is _______.',
    options: ['9:00', '9 AM', '9 PM'],
    answer: 2,
  },
  {
    q: "The train leaves at 9:00. That means it's _______.",
    options: ['9:00', '9 AM', '9 PM'],
    answer: 1,
  },
  {
    q: "The flight arrives at 15:00. That's the same as _______.",
    options: ['15:00', '3 AM', '3 PM'],
    answer: 2,
  },
  // Noon and midnight
  {
    q: 'Noon (12 PM) is _______ in 24h format.',
    options: ['00:00', '12:00', '24:00'],
    answer: 1,
  },
  {
    q: 'Midnight (12 AM) is _______ in 24h format.',
    options: ['00:00', '12:00', '24:00'],
    answer: 0,
  },
  {
    q: '12:00 in 24h format is _______.',
    options: ['12:00', '12 AM', '12 PM'],
    answer: 0,
  },
  {
    q: '00:00 in 24h format is _______.',
    options: ['00:00', '12 AM', '12 PM'],
    answer: 1,
  },
  {
    q: 'The sun is highest at noon, which is _______ in 24h format.',
    options: ['00:00', '12:00', '24:00'],
    answer: 1,
  },
  {
    q: 'The day starts at midnight, which is _______ in 24h format.',
    options: ['00:00', '12:00', '24:00'],
    answer: 0,
  },
  // Parts of the day
  {
    q: 'Morning is the time _______.',
    options: ['before noon', 'after noon', 'at noon', 'at midnight'],
    answer: 0,
  },
  {
    q: 'Afternoon is the time _______.',
    options: ['before noon', 'after noon', 'at night', 'in the morning'],
    answer: 1,
  },
  {
    q: 'Evening comes before _______.',
    options: ['morning', 'afternoon', 'night', 'noon'],
    answer: 2,
  },
  {
    q: 'Night is the time when it is _______.',
    options: ['bright', 'dark', 'noon', 'before noon'],
    answer: 1,
  },
  {
    q: 'We usually eat breakfast in the _______.',
    options: ['morning', 'afternoon', 'evening', 'night'],
    answer: 0,
  },
  {
    q: 'Lunch is typically eaten in the _______.',
    options: ['morning', 'afternoon', 'evening', 'night'],
    answer: 1,
  },
  {
    q: 'Dinner is usually eaten in the _______.',
    options: ['morning', 'afternoon', 'evening', 'night'],
    answer: 2,
  },
  {
    q: 'The sun rises in the _______.',
    options: ['morning', 'afternoon', 'evening', 'night'],
    answer: 0,
  },
  {
    q: 'The sun sets in the _______.',
    options: ['morning', 'afternoon', 'evening', 'night'],
    answer: 2,
  },
  {
    q: 'We sleep at _______.',
    options: ['morning', 'afternoon', 'evening', 'night'],
    answer: 3,
  },
  {
    q: 'School usually starts in the _______.',
    options: ['morning', 'afternoon', 'evening', 'night'],
    answer: 0,
  },
  {
    q: 'Stars are visible at _______.',
    options: ['morning', 'afternoon', 'evening', 'night'],
    answer: 3,
  },
  {
    q: 'Before noon means _______.',
    options: ['AM', 'PM', '24h', 'Noon'],
    answer: 0,
  },
  {
    q: 'After noon means _______.',
    options: ['AM', 'PM', '24h', 'Midnight'],
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
      shuffleOptions={false}
    />
  );
}
