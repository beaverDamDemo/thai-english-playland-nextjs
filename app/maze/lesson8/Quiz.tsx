// app/maze/lesson8/Quiz.tsx
'use client';

import { useState } from 'react';
import { useThaiQuestion } from '../_components/useThaiQuestion';
import styles from '../_components/QuizButtons.module.css';

const questions = [
  {
    q: 'Choose the place word: "I study at ___."',
    options: ['school', 'under', 'next to', 'happy'],
    answer: 0,
  },
  {
    q: 'Choose the place word: "I save money at the ___."',
    options: ['bank', 'store', 'home', 'table'],
    answer: 0,
  },
  {
    q: 'Choose the place word: "I buy food at the ___."',
    options: ['store', 'school', 'bank', 'under'],
    answer: 0,
  },
  {
    q: 'Choose the place word: "I sleep at ___."',
    options: ['home', 'bank', 'store', 'next to'],
    answer: 0,
  },
  {
    q: 'Complete: "The book is ___ the table."',
    options: ['on', 'under', 'in', 'next to'],
    answer: 0,
  },
  {
    q: 'Complete: "The cat is ___ the table."',
    options: ['on', 'under', 'at', 'from'],
    answer: 1,
  },
  {
    q: 'Complete: "The pen is ___ the bag."',
    options: ['in', 'on', 'under', 'next to'],
    answer: 0,
  },
  {
    q: 'Complete: "The chair is ___ the desk."',
    options: ['next to', 'under', 'in', 'on'],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'The bag is on the table.',
      'The bag is in the table.',
      'The bag is under to table.',
      'The bag on is table.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'The cat is under the chair.',
      'The cat is on under chair.',
      'The cat under is chair.',
      'The cat is in chair under.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'The phone is next to the book.',
      'The phone is next the book.',
      'The phone next to is book.',
      'The phone in next to book.',
    ],
    answer: 0,
  },
  {
    q: 'Pick the preposition that means inside.',
    options: ['in', 'on', 'under', 'next to'],
    answer: 0,
  },
  {
    q: 'Pick the preposition that means above and touching.',
    options: ['on', 'in', 'under', 'next to'],
    answer: 0,
  },
  {
    q: 'Pick the preposition that means below.',
    options: ['on', 'under', 'in', 'next to'],
    answer: 1,
  },
  {
    q: 'Pick the preposition that means beside.',
    options: ['in', 'on', 'next to', 'under'],
    answer: 2,
  },
  {
    q: 'Fill in the blank: "She is ___ home."',
    options: ['at', 'on', 'under', 'next to'],
    answer: 0,
  },
  {
    q: 'Fill in the blank: "He is ___ school now."',
    options: ['at', 'under', 'on', 'next to'],
    answer: 0,
  },
  {
    q: 'Choose the best mini-reading answer: "The bag is under the chair." Where is the bag?',
    options: [
      'under the chair',
      'on the chair',
      'in the chair',
      'next to the chair',
    ],
    answer: 0,
  },
  {
    q: 'Choose the best mini-reading answer: "The bank is next to the store." Where is the bank?',
    options: [
      'under the store',
      'in the store',
      'next to the store',
      'on the store',
    ],
    answer: 2,
  },
  {
    q: 'Choose the incorrect sentence.',
    options: [
      'The book is on the desk.',
      'The key is in the bag.',
      'The cat is next to the sofa.',
      'The phone is under to table.',
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
  const [feedbackIcon, setFeedbackIcon] = useState<'✓' | '✗' | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const thaiQuestion = useThaiQuestion(selectedQuestions[current]?.q ?? '');

  function handleAnswer(index: number) {
    if (selectedIndex !== null) return;
    let newScore = score;
    const isCorrect = index === selectedQuestions[current].answer;
    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
    }
    setFeedbackIcon(isCorrect ? '✓' : '✗');
    setSelectedIndex(index);
    const nextQuestion = current + 1;

    setTimeout(
      () => {
        setFeedbackIcon(null);
        setSelectedIndex(null);
        if (nextQuestion >= selectedQuestions.length) {
          setFinished(true);
          onComplete(newScore);
        } else {
          setCurrent(nextQuestion);
        }
      },
      isCorrect ? 300 : 800,
    );
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
      style={{ padding: '0', position: 'relative' }}
    >
      {feedbackIcon && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '80px',
            fontWeight: 'bold',
            zIndex: 2000,
            animation: 'feedbackFadeOut 0.3s ease-out forwards',
            color: feedbackIcon === '✓' ? '#4CAF50' : '#F44336',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {feedbackIcon}
        </div>
      )}
      <style>{`
        @keyframes feedbackFadeOut {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.5);
          }
        }
      `}</style>
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
            fontSize: '18px',
            fontWeight: '500',
            color: '#333',
          }}
        >
          {selectedQuestions[current].q}
        </p>
        <p
          style={{
            margin: '0',
            fontSize: '14px',
            color: '#666',
            lineHeight: 1.45,
          }}
        >
          {thaiQuestion}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
        {selectedQuestions[current].options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className={`${styles.quizOptionButton} ${
              selectedIndex !== null && i === selectedQuestions[current].answer
                ? styles.quizOptionCorrectFlash
                : ''
            }`}
            style={{
              backgroundColor:
                selectedIndex === null
                  ? primaryColor
                  : i === selectedQuestions[current].answer
                    ? '#4CAF50'
                    : primaryColor,
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
