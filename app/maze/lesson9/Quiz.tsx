'use client';

import MazeQuiz, { type QuizQuestion } from '../_components/MazeQuiz';

const questions: QuizQuestion[] = [
  {
    q: 'Choose the correct sentence.',
    options: [
      'She likes tea.',
      'She like tea.',
      'She liking tea.',
      'She liked tea now.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: ['He is tired.', 'He are tired.', 'He am tired.', 'He be tired.'],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'I like music.',
      'I likes music.',
      'I liking music.',
      'I am like music.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct negative sentence.',
    options: [
      'I do not like coffee.',
      'I not like coffee.',
      'I am not like coffee.',
      'I does not like coffee.',
    ],
    answer: 0,
  },
  {
    q: 'Complete: "She ___ pizza."',
    options: ['like', 'likes', 'liked', 'liking'],
    answer: 1,
  },
  {
    q: 'Complete: "They ___ not like spicy food."',
    options: ['do', 'does', 'is', 'are'],
    answer: 0,
  },
  {
    q: 'Choose the feeling word: "I need food."',
    options: ['happy', 'tired', 'hungry', 'angry'],
    answer: 2,
  },
  {
    q: 'Choose the feeling word: "I need sleep."',
    options: ['hungry', 'tired', 'happy', 'cold'],
    answer: 1,
  },
  {
    q: 'Choose the feeling word: "I smile a lot today."',
    options: ['happy', 'tired', 'hungry', 'late'],
    answer: 0,
  },
  {
    q: 'Small talk: "How are you?" Choose a natural answer.',
    options: [
      'I am happy, thank you.',
      'I are happy.',
      'Happy is me.',
      'I happy.',
    ],
    answer: 0,
  },
  {
    q: 'Small talk: "Are you hungry?" Choose a natural answer.',
    options: [
      'Yes, I am hungry.',
      'Yes, I hungry.',
      'Yes, I is hungry.',
      'Yes, hungry I am not.',
    ],
    answer: 0,
  },
  {
    q: 'Small talk: "Do you like tea?" Choose a natural answer.',
    options: ['Yes, I do.', 'Yes, I am.', 'Yes, I like do.', 'Yes, do I.'],
    answer: 0,
  },
  {
    q: 'Complete: "He ___ not like milk."',
    options: ['do', 'does', 'is', 'are'],
    answer: 1,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'She does not like coffee.',
      'She do not like coffee.',
      'She is not like coffee.',
      'She not likes coffee.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'He likes apples.',
      'He like apples.',
      'He liking apples.',
      'He does likes apples.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: ['I am tired.', 'I is tired.', 'I are tired.', 'I be tired.'],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: ['We are happy.', 'We is happy.', 'We am happy.', 'We be happy.'],
    answer: 0,
  },
  {
    q: 'Pick the best response: "What do you like?"',
    options: ['I like tea.', 'I am tea.', 'I do tea.', 'I tea.'],
    answer: 0,
  },
  {
    q: 'Pick the best response: "How is he today?"',
    options: ['He is tired.', 'He tired is.', 'He are tired.', 'He do tired.'],
    answer: 0,
  },
  {
    q: 'Choose the incorrect sentence.',
    options: [
      'She likes music.',
      'He is hungry.',
      'I am happy.',
      'They is tired.',
    ],
    answer: 3,
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
