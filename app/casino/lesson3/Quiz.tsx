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
  // singular near -> "This" (index 0)
  {
    q: '_______ is my book (near me).',
    options: ['This', 'That', 'These', 'Those'],
    answer: 0,
  },
  {
    q: '_______ cup (in my hand) is hot.',
    options: ['This', 'That', 'These', 'Those'],
    answer: 0,
  },
  {
    q: '_______ sandwich (on my plate) is for you.',
    options: ['This', 'That', 'These', 'Those'],
    answer: 0,
  },
  {
    q: '_______ chair (next to me) is broken.',
    options: ['This', 'That', 'These', 'Those'],
    answer: 0,
  },

  // singular far -> "That" (index 1)
  {
    q: '_______ is your house (over there).',
    options: ['This', 'That', 'These', 'Those'],
    answer: 1,
  },
  {
    q: "Pointing to a distant tree: '_______ is tall.'",
    options: ['This', 'That', 'These', 'Those'],
    answer: 1,
  },
  {
    q: "Pointing to a car far away: '_______ car is blue.'",
    options: ['This', 'That', 'These', 'Those'],
    answer: 1,
  },
  {
    q: "Pointing to a mountain in the distance: '_______ is high.'",
    options: ['This', 'That', 'These', 'Those'],
    answer: 1,
  },

  // plural near -> "These" (index 2)
  {
    q: '_______ are my keys (in my hand).',
    options: ['This', 'That', 'These', 'Those'],
    answer: 2,
  },
  {
    q: "Pointing to several pens near you: '_______ pens are new.'",
    options: ['This', 'That', 'These', 'Those'],
    answer: 2,
  },
  {
    q: "Pointing to two cookies in your hand: '_______ are for you.'",
    options: ['This', 'That', 'These', 'Those'],
    answer: 2,
  },
  {
    q: "Pointing to nearby shoes: '_______ shoes are dirty.'",
    options: ['This', 'That', 'These', 'Those'],
    answer: 2,
  },

  // plural far -> "Those" (index 3)
  {
    q: "Pointing to people across the street: '_______ people are waiting.'",
    options: ['This', 'That', 'These', 'Those'],
    answer: 3,
  },
  {
    q: "Pointing to houses far away: '_______ are old.'",
    options: ['This', 'That', 'These', 'Those'],
    answer: 3,
  },
  {
    q: "Pointing to trees in the distance: '_______ are tall.'",
    options: ['This', 'That', 'These', 'Those'],
    answer: 3,
  },
  {
    q: "Pointing to plates on the far table: '_______ plates are clean.'",
    options: ['This', 'That', 'These', 'Those'],
    answer: 3,
  },

  // mixed context, still unambiguous because of nouns
  {
    q: 'Choose the correct sentence for one nearby cup:',
    options: [
      'This cup is hot.',
      'That cup is hot.',
      'These cup is hot.',
      'Those cup is hot.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence for several nearby chairs:',
    options: [
      'This chairs are comfortable.',
      'That chairs are comfortable.',
      'These chairs are comfortable.',
      'Those chairs are comfortable.',
    ],
    answer: 2,
  },
  {
    q: 'Choose the correct sentence for one far window:',
    options: [
      'This window is open.',
      'That window is open.',
      'These window is open.',
      'Those window is open.',
    ],
    answer: 1,
  },
  {
    q: 'Choose the correct sentence for many far birds:',
    options: [
      'This birds are loud.',
      'That birds are loud.',
      'These birds are loud.',
      'Those birds are loud.',
    ],
    answer: 3,
  },

  // short comprehension items
  {
    q: "If something is close to you, you usually say '_______'.",
    options: ['This/These', 'That/Those', 'There', 'Here'],
    answer: 0,
  },
  {
    q: "If something is far from you, you usually say '_______'.",
    options: ['This/These', 'That/Those', 'Here', 'Now'],
    answer: 1,
  },
  {
    q: "You point to one friend next to you: '_______ is my friend.'",
    options: ['This', 'That', 'These', 'Those'],
    answer: 0,
  },
  {
    q: "You point to many friends across the street: '_______ are my friends.'",
    options: ['This', 'That', 'These', 'Those'],
    answer: 3,
  },
];

export default function Quiz({
  onComplete,
  primaryColor = '#1D3557',
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
          Slot Quiz Complete!
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
          You earned {score} spin credit{score !== 1 ? 's' : ''}!
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
