'use client';
import MazeQuiz, { type QuizQuestion } from '@/app/games/maze/_components/MazeQuiz';

const questions: QuizQuestion[] = [
  { q: 'How do you write the number 3 in words?',       options: ['two', 'three', 'four', 'five'],            answer: 1 },
  { q: 'How do you write the number 7 in words?',       options: ['six', 'eight', 'seven', 'nine'],           answer: 2 },
  { q: 'How do you write the number 10 in words?',      options: ['nine', 'eleven', 'ten', 'twelve'],         answer: 2 },
  { q: 'How do you write the number 15 in words?',      options: ['thirteen', 'fourteen', 'fifteen', 'sixteen'], answer: 2 },
  { q: 'How do you write the number 20 in words?',      options: ['eighteen', 'nineteen', 'twenty', 'thirty'],answer: 2 },
  { q: '"Twelve" is the number _______.',               options: ['10', '11', '12', '13'],                    answer: 2 },
  { q: '"First" is used for which position?',           options: ['2nd', '1st', '3rd', '4th'],                answer: 1 },
  { q: '"Second" is used for which position?',          options: ['1st', '2nd', '3rd', '4th'],                answer: 1 },
  { q: '"Third" is used for which position?',           options: ['1st', '2nd', '3rd', '4th'],                answer: 2 },
  { q: 'How many days are in a week?',                  options: ['5', '6', '7', '8'],                        answer: 2 },
  { q: 'How many months are in a year?',                options: ['10', '11', '12', '13'],                    answer: 2 },
  { q: '"One hundred" is written as _______.',          options: ['10', '100', '1,000', '1,000,000'],         answer: 1 },
  { q: 'What comes after "nineteen"?',                  options: ['eighteen', 'twenty', 'thirty', 'eleven'],  answer: 1 },
  { q: '"Fifty" is half of _______.',                   options: ['twenty', 'thirty', 'one hundred', 'two hundred'], answer: 2 },
  { q: 'How many sides does a triangle have?',          options: ['2', '3', '4', '5'],                        answer: 1 },
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
