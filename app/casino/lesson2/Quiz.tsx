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
    q: 'There _______ a cat on the sofa.',
    options: ['is', "isn't", 'are', 'have'],
    answer: 0,
  },
  {
    q: 'There _______ two apples in the bowl.',
    options: ['are', "aren't", 'is', 'was'],
    answer: 0,
  },
  {
    q: 'There _______ a book on the table.',
    options: ['is', "isn't", 'are', 'do'],
    answer: 0,
  },
  {
    q: 'There _______ any milk in the fridge.',
    options: ["isn't", 'is', 'are', 'has'],
    answer: 0,
  },
  {
    q: 'There _______ three chairs in the room.',
    options: ['are', 'is', 'have', 'was'],
    answer: 0,
  },
  {
    q: 'There _______ a dog in the garden.',
    options: ['is', "isn't", 'are', 'does'],
    answer: 0,
  },
  {
    q: 'There _______ many students in class today.',
    options: ['are', 'is', 'was', 'has'],
    answer: 0,
  },
  {
    q: 'There _______ a red car outside the house.',
    options: ['is', "isn't", 'are', 'were'],
    answer: 0,
  },
  {
    q: 'There _______ two windows in my bedroom.',
    options: ['are', 'is', 'do', 'has'],
    answer: 0,
  },
  {
    q: 'There _______ a problem with the computer.',
    options: ['is', "isn't", 'are', 'did'],
    answer: 0,
  },

  // negative-focus items (correct answer is the negative in slot 1)
  {
    q: 'There _______ any sugar left.',
    options: ['is', "isn't", 'are', 'do'],
    answer: 1,
  },
  {
    q: 'There _______ no chairs in the hall.',
    options: ['is', "isn't", 'are', 'have'],
    answer: 1,
  },
  {
    q: 'There _______ not many buses today.',
    options: ['are', "aren't", 'is', 'was'],
    answer: 1,
  },

  // mixed practice
  {
    q: 'There _______ a phone on the desk.',
    options: ['is', "isn't", 'are', 'have'],
    answer: 0,
  },
  {
    q: 'There _______ five books in the bag.',
    options: ['are', "aren't", 'is', 'was'],
    answer: 0,
  },
  {
    q: 'There _______ a letter for you.',
    options: ['is', "isn't", 'are', 'do'],
    answer: 0,
  },
  {
    q: 'There _______ two eggs in the box.',
    options: ['are', 'is', 'have', 'was'],
    answer: 0,
  },
  {
    q: 'There _______ a light in the kitchen.',
    options: ['is', "isn't", 'are', 'do'],
    answer: 0,
  },
  {
    q: 'There _______ many trees in the park.',
    options: ['are', 'is', 'was', 'has'],
    answer: 0,
  },

  // comprehension / meaning items
  {
    q: "If you see 'There are 0 cookies', that means there _______ any cookies.",
    options: ["aren't", 'are', 'is', 'was'],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence:',
    options: [
      'There is a pen on the desk.',
      'There are a pen on the desk.',
      'There is pens on the desk.',
      'There are is a pen on the desk.',
    ],
    answer: 0,
  },
  {
    q: 'There _______ a lot of water in the bottle.',
    options: ['is', 'are', 'have', 'do'],
    answer: 0,
  },
  {
    q: 'There _______ two people at the door.',
    options: ['are', 'is', 'was', 'has'],
    answer: 0,
  },
];

export default function Quiz({
  onComplete,
  primaryColor = '#E63946',
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
  const [feedbackIcon, setFeedbackIcon] = useState<'?' | '?' | null>(null);
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

    setFeedbackIcon(isCorrect ? '?' : '?');
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
          Roulette Quiz Complete!
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
          You earned {score} roulette credit{score !== 1 ? 's' : ''}!
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
            color: feedbackIcon === '?' ? '#4CAF50' : '#F44336',
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
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
