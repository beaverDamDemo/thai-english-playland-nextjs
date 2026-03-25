// app/maze/lesson6/Quiz.tsx
'use client';

import { useState } from 'react';
import styles from '../_components/QuizButtons.module.css';

const questions = [
  {
    q: 'Choose the correct verb: "I ___ to school every day."',
    options: ['go', 'goes', 'went', 'going'],
    answer: 0,
  },
  {
    q: 'Choose the correct verb: "She ___ a book at night."',
    options: ['read', 'reads', 'reading', 'readed'],
    answer: 1,
  },
  {
    q: 'Choose the correct verb: "They ___ rice for lunch."',
    options: ['eat', 'eats', 'ate', 'eating'],
    answer: 0,
  },
  {
    q: 'Choose the correct verb: "My father ___ at a bank."',
    options: ['work', 'worked', 'works', 'working'],
    answer: 2,
  },
  {
    q: 'Choose the correct verb: "We ___ at 10 p.m."',
    options: ['sleep', 'sleeps', 'slept', 'sleeping'],
    answer: 1,
  },
  {
    q: 'Complete: "I ___ breakfast at 7."',
    options: ['eat', 'eats', 'ate', 'eaten'],
    answer: 0,
  },
  {
    q: 'Complete: "He ___ to work by bus."',
    options: ['go', 'goes', 'going', 'gone'],
    answer: 1,
  },
  {
    q: 'Complete: "She ___ every evening."',
    options: ['read', 'reads', 'reading', 'to read'],
    answer: 1,
  },
  {
    q: 'Choose the best sentence.',
    options: [
      'I goes to school.',
      'I go to school.',
      'I going to school.',
      'I gone to school.',
    ],
    answer: 1,
  },
  {
    q: 'Choose the best sentence.',
    options: [
      'She read a book every day.',
      'She reads a book every day.',
      'She reading a book every day.',
      'She to read a book every day.',
    ],
    answer: 1,
  },
  {
    q: 'Choose the best sentence.',
    options: [
      'They eats dinner at home.',
      'They eating dinner at home.',
      'They eat dinner at home.',
      'They eaten dinner at home.',
    ],
    answer: 2,
  },
  {
    q: 'Choose the best sentence.',
    options: [
      'He works in a store.',
      'He work in a store.',
      'He worked in a store every day now.',
      'He working in a store.',
    ],
    answer: 0,
  },
  {
    q: 'Complete: "At night, the baby ___."',
    options: ['sleep', 'sleeps', 'slept', 'sleeping'],
    answer: 1,
  },
  {
    q: 'Fill in the blank: "I ___ English at home."',
    options: ['read', 'reads', 'reading', 'reads to'],
    answer: 0,
  },
  {
    q: 'Fill in the blank: "My mom ___ breakfast early."',
    options: ['eat', 'eats', 'eating', 'ate'],
    answer: 1,
  },
  {
    q: 'Which sentence is in present simple?',
    options: [
      'I went to school.',
      'I will go to school.',
      'I go to school.',
      'I am go to school.',
    ],
    answer: 2,
  },
  {
    q: 'Choose the wrong sentence.',
    options: [
      'I work at home.',
      'She works at home.',
      'He work at home.',
      'They work at home.',
    ],
    answer: 2,
  },
  {
    q: 'Choose the correct sentence with sleep.',
    options: [
      'She sleep early.',
      'She sleeps early.',
      'She sleeping early.',
      'She slept early every day now.',
    ],
    answer: 0,
  },
];

export default function Quiz({
  onComplete,
  primaryColor = '#4CAF50',
}: {
  onComplete: (score: number) => void;
  primaryColor?: string;
}) {
  const [selectedQuestions] = useState(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  });

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  function handleAnswer(index: number) {
    let newScore = score;
    if (index === selectedQuestions[current].answer) {
      newScore = score + 1;
      setScore(newScore);
    }
    const nextQuestion = current + 1;

    if (nextQuestion >= selectedQuestions.length) {
      setFinished(true);
      onComplete(newScore);
    } else {
      setCurrent(nextQuestion);
    }
  }

  if (finished) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2
          style={{
            color: primaryColor,
            fontSize: '24px',
            margin: '0 0 15px 0',
          }}
        >
          Quiz Complete!
        </h2>
        <p style={{ fontSize: '16px', color: '#333', margin: '10px 0' }}>
          You got {score} out of {selectedQuestions.length} correct answers.
        </p>
        <p
          style={{
            fontSize: '16px',
            color: primaryColor,
            margin: '10px 0',
            fontWeight: 'bold',
          }}
        >
          You will have {score} move{score !== 1 ? 's' : ''} to continue the
          maze!
        </p>
      </div>
    );
  }

  return (
    <div
      key={current}
      className={styles.questionSlide}
      style={{ padding: '0' }}
    >
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#666',
            }}
          >
            Question {current + 1} of {selectedQuestions.length}
          </p>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{
                backgroundColor: primaryColor,
                width: `${(current / selectedQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>
        <p
          style={{
            margin: '15px 0',
            fontSize: '16px',
            fontWeight: '500',
            color: '#333',
          }}
        >
          {selectedQuestions[current].q}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
        {selectedQuestions[current].options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className={styles.quizOptionButton}
            style={{ backgroundColor: primaryColor }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
