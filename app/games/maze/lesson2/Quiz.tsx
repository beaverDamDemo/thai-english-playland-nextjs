// app/maze/lesson2/Quiz.tsx
'use client';

import MazeQuiz, { type QuizQuestion } from '../_components/MazeQuiz';

const questions: QuizQuestion[] = [
  {
    q: 'My _______ is older than me and loves video games.',
    options: ['brother', 'sister', 'siblings', 'boyfriend'],
    answer: 0,
  },
  {
    q: 'Her _______ is coming to visit from college.',
    options: ['sister', 'brother', 'siblings', 'boyfriend'],
    answer: 0,
  },
  {
    q: "They are twins, so they're _______.",
    options: ['siblings', 'sister', 'brother', 'boyfriend'],
    answer: 0,
  },
  {
    q: 'She went to the movies with her _______ last night.',
    options: ['boyfriend', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: "He bought flowers for his _______ on Valentine's Day.",
    options: ['girlfriend', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: "My dad's _______ is a great cook.",
    options: ['wife', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: 'She introduced me to her _______ at the party.',
    options: ['husband', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: 'I have one _______ and two brothers.',
    options: ['sister', 'brother', 'siblings', 'boyfriend'],
    answer: 0,
  },
  {
    q: "We're not just friends-he's my _______.",
    options: ['boyfriend', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: 'Anna and her _______ are planning their wedding.',
    options: ['fiance', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: 'My _______ and I grew up in the same room.',
    options: ['brother', 'sister', 'siblings', 'boyfriend'],
    answer: 0,
  },
  {
    q: "She's not married, but she has a _______.",
    options: ['boyfriend', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: "He's married, and his _______ is a teacher.",
    options: ['wife', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: 'My _______ and I are going on a trip together.',
    options: ['girlfriend', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: 'Do you have any _______ or are you an only child?',
    options: ['siblings', 'sister', 'brother', 'boyfriend'],
    answer: 0,
  },
  {
    q: 'Her _______ is very supportive of her career.',
    options: ['husband', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: 'My _______ and I share clothes sometimes.',
    options: ['sister', 'brother', 'siblings', 'boyfriend'],
    answer: 0,
  },
  {
    q: "He's not my husband yet, just my _______.",
    options: ['boyfriend', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: "She's married to my uncle, so she's my uncle's _______.",
    options: ['wife', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: "We're close friends, but not _______-we're just classmates.",
    options: ['siblings', 'sister', 'brother', 'boyfriend'],
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
