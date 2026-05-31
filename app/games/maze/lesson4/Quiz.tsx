// app/maze/lesson4/Quiz.tsx
'use client';

import MazeQuiz, { type QuizQuestion } from '../_components/MazeQuiz';

const questions: QuizQuestion[] = [
  {
    q: 'The dog _______ hungry right now.',
    options: ['is', 'are', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'They _______ at the park yesterday afternoon.',
    options: ['were', 'is', 'are', 'was'],
    answer: 0,
  },
  {
    q: 'My friends _______ always very kind and helpful.',
    options: ['are', 'is', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'She _______ a teacher before she retired.',
    options: ['was', 'is', 'are', 'were'],
    answer: 0,
  },
  {
    q: 'We _______ excited about the trip tomorrow.',
    options: ['are', 'is', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'He _______ at home when I called.',
    options: ['was', 'is', 'are', 'were'],
    answer: 0,
  },
  {
    q: 'The books _______ on the shelf last week.',
    options: ['were', 'is', 'are', 'was'],
    answer: 0,
  },
  {
    q: 'This sandwich _______ delicious at the moment.',
    options: ['is', 'are', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'You _______ very tired after the long hike yesterday.',
    options: ['were', 'is', 'are', 'was'],
    answer: 0,
  },
  {
    q: 'The children _______ playing outside right now.',
    options: ['are', 'is', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'I _______ happy to see you yesterday.',
    options: ['was', 'is', 'are', 'were'],
    answer: 0,
  },
  {
    q: 'They _______ ready for the exam.',
    options: ['are', 'is', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'She _______ in the kitchen earlier.',
    options: ['was', 'is', 'are', 'were'],
    answer: 0,
  },
  {
    q: 'The flowers _______ blooming beautifully.',
    options: ['are', 'is', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'He _______ sick last week.',
    options: ['was', 'is', 'are', 'were'],
    answer: 0,
  },
  {
    q: 'We _______ at the concert last night.',
    options: ['were', 'is', 'are', 'was'],
    answer: 0,
  },
  {
    q: 'The sky _______ clear today.',
    options: ['is', 'are', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'You _______ amazing in your performance.',
    options: ['were', 'is', 'are', 'was'],
    answer: 0,
  },
  {
    q: 'The students _______ studying in the library.',
    options: ['are', 'is', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'I _______ nervous before the interview.',
    options: ['was', 'is', 'are', 'were'],
    answer: 0,
  },
  {
    q: 'The chairs _______ arranged neatly.',
    options: ['are', 'is', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'She _______ late to the meeting.',
    options: ['was', 'is', 'are', 'were'],
    answer: 0,
  },
  {
    q: 'They _______ helpful during the event.',
    options: ['were', 'is', 'are', 'was'],
    answer: 0,
  },
  {
    q: 'The cake _______ delicious.',
    options: ['is', 'are', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'We _______ tired after the trip.',
    options: ['were', 'is', 'are', 'was'],
    answer: 0,
  },
  {
    q: 'He _______ in the office now.',
    options: ['is', 'are', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'The lights _______ off last night.',
    options: ['were', 'is', 'are', 'was'],
    answer: 0,
  },
  {
    q: 'You _______ welcome to join us.',
    options: ['are', 'is', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'She _______ my best friend in school.',
    options: ['was', 'is', 'are', 'were'],
    answer: 0,
  },
  {
    q: 'The birds _______ singing this morning.',
    options: ['are', 'is', 'was', 'were'],
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
