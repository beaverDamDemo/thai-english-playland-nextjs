'use client';

import { useEffect, useState } from 'react';
import {
  recordAnswer,
  resetStreak,
  reportPerfectLesson,
} from '@/app/_lib/client/quizStreak';
import { useThaiQuestion } from '../../maze/_components/useThaiQuestion';
import styles from '../../maze/_components/QuizButtons.module.css';
import type { Question } from '../types';

const questions: Question[] = [
  {
    q: 'The cat is ___ the box.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 0,
  },
  {
    q: 'The book is ___ the table.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 2,
  },
  {
    q: 'The shoes are ___ the bed.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 3,
  },
  {
    q: 'The lamp is ___ the sofa.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 1,
  },
  {
    q: 'There is a toy ___ the box.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 0,
  },
  {
    q: 'The cup is ___ the shelf.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 2,
  },
  {
    q: 'The cat is hiding ___ the chair.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 3,
  },
  {
    q: 'The postbox is ___ the door.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 1,
  },
  {
    q: 'Put the keys ___ your bag.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 0,
  },
  {
    q: 'The picture hangs ___ the wall.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 2,
  },
  {
    q: 'The ball rolled ___ the table.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 3,
  },
  {
    q: 'The bakery is ___ the bank.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 1,
  },
  {
    q: 'There is water ___ the glass.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 0,
  },
  {
    q: 'The phone is ___ the desk.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 2,
  },
  {
    q: 'The cat sleeps ___ the blanket.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 3,
  },
  {
    q: 'The bus stop is ___ the school.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 1,
  },
  {
    q: 'The letter is ___ the envelope.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 0,
  },
  {
    q: 'The vase is ___ the table.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 2,
  },
  {
    q: 'The cat is ___ the blanket (it is below the blanket).',
    options: ['in', 'next to', 'on', 'under'],
    answer: 3,
  },
  {
    q: 'The coffee shop is ___ the cinema.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 1,
  },
  {
    q: 'The toys are ___ the box (inside).',
    options: ['in', 'next to', 'on', 'under'],
    answer: 0,
  },
  {
    q: 'The remote control is ___ the TV.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 2,
  },
  {
    q: 'The cat is hiding ___ the table (below it).',
    options: ['in', 'next to', 'on', 'under'],
    answer: 3,
  },
  {
    q: 'The post office is ___ the supermarket.',
    options: ['in', 'next to', 'on', 'under'],
    answer: 1,
  },
];

export default function Quiz({
  onComplete,
  primaryColor = '#2A9D8F',
}: {
  onComplete: (score: number, total: number) => void;
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

  useEffect(() => {
    resetStreak();
  }, []);

  function handleAnswer(index: number) {
    if (selectedIndex !== null) return;
    let newScore = score;
    const isCorrect = index === selectedQuestions[current].answer;
    recordAnswer(isCorrect);
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
          if (newScore === selectedQuestions.length) reportPerfectLesson();
          onComplete(newScore, selectedQuestions.length);
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
          Cashier Quiz Complete!
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
          You earned {score} cashier credit{score !== 1 ? 's' : ''}!
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

        <h2 className={styles.englishPrompt}>{selectedQuestions[current].q}</h2>
        <p className={styles.thaiPrompt}>{thaiQuestion || '\u00a0'}</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
        {selectedQuestions[current].options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            className={`${styles.quizOptionButton} ${
              selectedIndex !== null &&
              idx === selectedQuestions[current].answer
                ? styles.quizOptionCorrectFlash
                : ''
            }`}
            style={{
              backgroundColor:
                selectedIndex === null
                  ? primaryColor
                  : idx === selectedQuestions[current].answer
                    ? '#4CAF50'
                    : primaryColor,
              fontStyle:
                selectedIndex !== null &&
                idx === selectedQuestions[current].answer
                  ? 'italic'
                  : undefined,
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
