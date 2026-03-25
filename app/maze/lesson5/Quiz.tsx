// app/maze/lesson5/Quiz.tsx
'use client';

import { useState } from 'react';
import styles from '../_components/QuizButtons.module.css';

const questions = [
  {
    q: 'Choose the correct sentence.',
    options: ['I am Anna.', 'I is Anna.', 'I are Anna.', 'I be Anna.'],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'You am my friend.',
      'You are my friend.',
      'You is my friend.',
      'You be my friend.',
    ],
    answer: 1,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'He are from Japan.',
      'He am from Japan.',
      'He is from Japan.',
      'He be from Japan.',
    ],
    answer: 2,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'She is happy.',
      'She are happy.',
      'She am happy.',
      'She be happy.',
    ],
    answer: 0,
  },
  {
    q: 'Fill in: "I ___ a student."',
    options: ['am', 'is', 'are', 'be'],
    answer: 0,
  },
  {
    q: 'Fill in: "You ___ my friend."',
    options: ['am', 'is', 'are', 'be'],
    answer: 2,
  },
  {
    q: 'Fill in: "He ___ tired."',
    options: ['am', 'are', 'is', 'be'],
    answer: 2,
  },
  {
    q: 'Fill in: "She ___ from Korea."',
    options: ['is', 'are', 'am', 'be'],
    answer: 0,
  },
  {
    q: 'Reorder the words: "am / I / happy"',
    options: ['I am happy.', 'I happy am.', 'Am I happy.', 'Happy am I.'],
    answer: 0,
  },
  {
    q: 'Reorder the words: "friend / are / my / You"',
    options: [
      'You are my friend.',
      'You my are friend.',
      'Are you my friend.',
      'You are friend my.',
    ],
    answer: 0,
  },
  {
    q: 'Reorder the words: "is / He / tall"',
    options: ['He is tall.', 'He tall is.', 'Is he tall.', 'Tall he is.'],
    answer: 0,
  },
  {
    q: 'Reorder the words: "is / She / my / teacher"',
    options: [
      'She my is teacher.',
      'She is teacher my.',
      'She is my teacher.',
      'Is she my teacher.',
    ],
    answer: 2,
  },
  {
    q: 'Choose the incorrect sentence.',
    options: ['I am ready.', 'You are kind.', 'He are strong.', 'She is nice.'],
    answer: 2,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'I am from Brazil.',
      'I is from Brazil.',
      'I are from Brazil.',
      'I be from Brazil.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'You are hungry.',
      'You is hungry.',
      'You am hungry.',
      'You be hungry.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'He is my brother.',
      'He are my brother.',
      'He am my brother.',
      'He be my brother.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'She is in class.',
      'She are in class.',
      'She am in class.',
      'She be in class.',
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
