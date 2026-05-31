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
    q: 'I saw ___ cat in the garden.',
    options: ['—', 'a', 'an', 'the'],
    answer: 1,
  },
  {
    q: 'She ate ___ apple after school.',
    options: ['—', 'a', 'an', 'the'],
    answer: 2,
  },
  {
    q: 'Please close ___ door when you leave.',
    options: ['—', 'a', 'an', 'the'],
    answer: 3,
  },
  {
    q: '___ water in this bottle is cold.',
    options: ['—', 'a', 'an', 'the'],
    answer: 3,
  },
  {
    q: 'He wants to buy ___ new phone.',
    options: ['—', 'a', 'an', 'the'],
    answer: 1,
  },
  {
    q: 'Can I have ___ orange, please?',
    options: ['—', 'a', 'an', 'the'],
    answer: 2,
  },
  {
    q: '___ sun is bright today.',
    options: ['—', 'a', 'an', 'the'],
    answer: 3,
  },
  {
    q: 'I need ___ pen to write this note.',
    options: ['—', 'a', 'an', 'the'],
    answer: 1,
  },
  {
    q: 'She is ___ teacher at my school.',
    options: ['—', 'a', 'an', 'the'],
    answer: 1,
  },
  {
    q: '___ dogs are friendly pets.',
    options: ['—', 'a', 'an', 'the'],
    answer: 0,
  },

  {
    q: 'He bought ___ umbrella because it was raining.',
    options: ['—', 'a', 'an', 'the'],
    answer: 2,
  },
  {
    q: 'We visited ___ museum on Saturday.',
    options: ['—', 'a', 'an', 'the'],
    answer: 3,
  },
  {
    q: 'I have ___ idea for the project.',
    options: ['—', 'a', 'an', 'the'],
    answer: 2,
  },
  {
    q: 'She drinks ___ coffee every morning.',
    options: ['—', 'a', 'an', 'the'],
    answer: 0,
  },
  {
    q: 'Put ___ book on the table, please.',
    options: ['—', 'a', 'an', 'the'],
    answer: 3,
  },
  {
    q: 'He wants to be ___ engineer when he grows up.',
    options: ['—', 'a', 'an', 'the'],
    answer: 2,
  },
  {
    q: 'They saw ___ movie last night.',
    options: ['—', 'a', 'an', 'the'],
    answer: 3,
  },
  {
    q: 'I need ___ egg for the recipe.',
    options: ['—', 'a', 'an', 'the'],
    answer: 2,
  },
  {
    q: '___ children are playing in the park.',
    options: ['—', 'a', 'an', 'the'],
    answer: 0,
  },
  {
    q: 'She found ___ wallet on the street.',
    options: ['—', 'a', 'an', 'the'],
    answer: 1,
  },

  { q: 'Please pass ___ salt.', options: ['—', 'a', 'an', 'the'], answer: 3 },
  {
    q: 'He wants ___ orange juice, not water.',
    options: ['—', 'a', 'an', 'the'],
    answer: 2,
  },
  {
    q: 'I saw ___ old man sitting on the bench.',
    options: ['—', 'a', 'an', 'the'],
    answer: 1,
  },
  {
    q: '___ moon looks beautiful tonight.',
    options: ['—', 'a', 'an', 'the'],
    answer: 3,
  },
];

export default function Quiz({
  onComplete,
  primaryColor = '#9C27B0',
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
          game!
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
        {thaiQuestion && thaiQuestion !== selectedQuestions[current].q && (
          <p
            style={{
              margin: '5px 0 15px 0',
              fontSize: '14px',
              fontWeight: '400',
              color: '#666',
              fontStyle: 'italic',
            }}
          >
            ({thaiQuestion})
          </p>
        )}
      </div>
      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
        {selectedQuestions[current].options.map((opt: string, i: number) => (
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
              fontStyle:
                selectedIndex !== null &&
                i === selectedQuestions[current].answer
                  ? 'italic'
                  : undefined,
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
