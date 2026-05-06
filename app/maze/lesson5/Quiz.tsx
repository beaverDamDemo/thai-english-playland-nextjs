// app/maze/lesson5/Quiz.tsx
'use client';

import MazeQuiz, { type QuizQuestion } from '../_components/MazeQuiz';

const questions: QuizQuestion[] = [
  {
    q: '_______ you like pizza?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ she live near here with her parents?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ we going to the park today after lunch?',
    options: ['Are', 'Do', 'Does', 'Did'],
    answer: 0,
  },
  {
    q: '_______ you see that movie last weekend at the cinema?',
    options: ['Did', 'Do', 'Does', 'Are'],
    answer: 0,
  },
  {
    q: '_______ your friends coming over later for the game night?',
    options: ['Are', 'Do', 'Does', 'Did'],
    answer: 0,
  },
  {
    q: '_______ he play guitar well in his band?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ you remember her name from the meeting yesterday?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ she call you yesterday after the presentation?',
    options: ['Did', 'Do', 'Does', 'Are'],
    answer: 0,
  },
  {
    q: '_______ they usually take the bus to school?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ your brother enjoy playing chess with you?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ you know how to cook pasta?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ she work at the hospital?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ we have homework today?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ they come to the party last night?',
    options: ['Did', 'Do', 'Does', 'Are'],
    answer: 0,
  },
  {
    q: '_______ he like reading novels?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ you hear that noise?',
    options: ['Did', 'Do', 'Does', 'Are'],
    answer: 0,
  },
  {
    q: '_______ she speak French fluently?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ we need to bring our books?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ they arrive on time?',
    options: ['Did', 'Do', 'Does', 'Are'],
    answer: 0,
  },
  {
    q: '_______ your parents live nearby?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ he go to the gym every day?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ you finish your project yesterday?',
    options: ['Did', 'Do', 'Does', 'Are'],
    answer: 0,
  },
  {
    q: '_______ she enjoy the concert?',
    options: ['Did', 'Do', 'Does', 'Are'],
    answer: 0,
  },
  {
    q: '_______ we meet at the cafe later?',
    options: ['Are', 'Do', 'Does', 'Did'],
    answer: 0,
  },
  {
    q: '_______ they play football on weekends?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ your sister study biology?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ he come to school yesterday?',
    options: ['Did', 'Do', 'Does', 'Are'],
    answer: 0,
  },
  {
    q: '_______ you like this song?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ she have a pet cat?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ we going to start soon?',
    options: ['Are', 'Do', 'Does', 'Did'],
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
