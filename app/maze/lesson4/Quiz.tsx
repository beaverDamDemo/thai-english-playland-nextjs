// app/maze/lesson4/Quiz.tsx
'use client';

import { useState } from 'react';
import styles from '../_components/QuizButtons.module.css';

const questions = [
  {
    q: 'Choose the correct pronoun for a boy: Tom is a student. ___ is kind.',
    options: ['He', 'She', 'It', 'They'],
    answer: 0,
  },
  {
    q: 'Choose the correct pronoun for a girl: Anna is happy. ___ is smiling.',
    options: ['He', 'She', 'You', 'We'],
    answer: 1,
  },
  {
    q: 'Complete: "___ is Tom."',
    options: ['He', 'She', 'They', 'It'],
    answer: 0,
  },
  {
    q: 'Complete: "___ is Anna."',
    options: ['He', 'She', 'It', 'We'],
    answer: 1,
  },
  {
    q: 'Identify the correct sentence.',
    options: ['He is a girl.', 'She is a woman.', 'He is Anna.', 'She is Tom.'],
    answer: 1,
  },
  {
    q: 'Who is a man? Choose the right pronoun.',
    options: ['He', 'She', 'It', 'They'],
    answer: 0,
  },
  {
    q: 'Who is a woman? Choose the right pronoun.',
    options: ['He', 'She', 'It', 'You'],
    answer: 1,
  },
  {
    q: 'Read and choose: "This is Jack. ___ is my friend."',
    options: ['He', 'She', 'We', 'It'],
    answer: 0,
  },
  {
    q: 'Read and choose: "This is Lina. ___ is my friend."',
    options: ['He', 'She', 'It', 'They'],
    answer: 1,
  },
  {
    q: 'Choose the best question answer pair.',
    options: [
      'Who is Anna? He is Anna.',
      'Who is Tom? She is Tom.',
      'Who is Tom? He is Tom.',
      'Who is Mia? He is Mia.',
    ],
    answer: 2,
  },
  {
    q: 'Which sentence uses he correctly?',
    options: [
      'He is my mother.',
      'He is my brother.',
      'He is my sister.',
      'He is Anna.',
    ],
    answer: 1,
  },
  {
    q: 'Which sentence uses she correctly?',
    options: [
      'She is my father.',
      'She is my uncle.',
      'She is my sister.',
      'She is Tom.',
    ],
    answer: 2,
  },
  {
    q: 'Choose the correct reading: "Mila is a girl."',
    options: ['He is Mila.', 'She is Mila.', 'It is Mila.', 'They is Mila.'],
    answer: 1,
  },
  {
    q: 'Choose the correct reading: "Ben is a boy."',
    options: ['He is Ben.', 'She is Ben.', 'They are Ben.', 'It are Ben.'],
    answer: 0,
  },
  {
    q: 'Complete: "___ is a man. ___ is strong."',
    options: ['He / He', 'She / She', 'He / She', 'She / He'],
    answer: 0,
  },
  {
    q: 'Complete: "___ is a woman. ___ is kind."',
    options: ['He / He', 'He / She', 'She / She', 'She / He'],
    answer: 2,
  },
  {
    q: 'Pick the incorrect sentence.',
    options: [
      'He is a boy.',
      'She is a girl.',
      'He is a woman.',
      'She is Anna.',
    ],
    answer: 2,
  },
  {
    q: 'Choose the correct pair.',
    options: [
      'Tom = she, Anna = he',
      'Tom = he, Anna = she',
      'Tom = it, Anna = they',
      'Tom = we, Anna = you',
    ],
    answer: 1,
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
