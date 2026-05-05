'use client';

import { useEffect, useState } from 'react';
import {
  recordAnswer,
  resetStreak,
  reportPerfectLesson,
} from '@/app/_lib/client/quizStreak';
import { useThaiQuestion } from '../_components/useThaiQuestion';
import styles from '../_components/QuizButtons.module.css';

type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
};

const questions: QuizQuestion[] = [
  // Keep some hour 7 questions (reduced from 18 to 4)
  {
    q: '7 AM is _______ in 24h format.',
    options: ['19:00', '7 PM', '7:00'],
    answer: 2,
  },
  {
    q: '7 PM is _______ in 24h format.',
    options: ['7:00', '7 AM', '19:00'],
    answer: 2,
  },
  {
    q: '19:00 in 24h format is _______.',
    options: ['7:00', '7 PM', '7 AM'],
    answer: 1,
  },
  {
    q: 'I eat breakfast at 7 AM, which is _______ in 24h format.',
    options: ['19:00', '7:00', '7 PM'],
    answer: 1,
  },
  // Different hours
  {
    q: '3 PM is _______ in 24h format.',
    options: ['15:00', '3:00', '21:00'],
    answer: 0,
  },
  {
    q: '9 AM is _______ in 24h format.',
    options: ['9:00', '21:00', '9 PM'],
    answer: 0,
  },
  {
    q: '15:00 in 24h format is _______.',
    options: ['3:00', '3 PM', '3 AM'],
    answer: 1,
  },
  {
    q: '21:00 in 24h format is _______.',
    options: ['9:00', '9 PM', '9 AM'],
    answer: 1,
  },
  {
    q: "The train leaves at 9:00. That means it's _______.",
    options: ['9 AM', '21:00', '9 PM'],
    answer: 0,
  },
  {
    q: "The flight arrives at 15:00. That's the same as _______.",
    options: ['3:00', '3 PM', '3 AM'],
    answer: 1,
  },
  // Noon and midnight
  {
    q: 'Noon (12 PM) is _______ in 24h format.',
    options: ['00:00', '12:00', '24:00'],
    answer: 1,
  },
  {
    q: 'Midnight (12 AM) is _______ in 24h format.',
    options: ['12:00', '24:00', '00:00'],
    answer: 2,
  },
  {
    q: '12:00 in 24h format is _______.',
    options: ['12 AM', '12 PM', 'Noon'],
    answer: 2,
  },
  {
    q: '00:00 in 24h format is _______.',
    options: ['12 PM', '12:00', 'Noon'],
    answer: 1,
  },
  {
    q: 'The sun is highest at noon, which is _______ in 24h format.',
    options: ['00:00', '24:00', '12:00'],
    answer: 2,
  },
  {
    q: 'The day starts at midnight, which is _______ in 24h format.',
    options: ['12:00', '00:00', '24:00'],
    answer: 1,
  },
  // Parts of the day
  {
    q: 'Morning is the time _______.',
    options: ['before noon', 'after noon', 'at noon', 'at midnight'],
    answer: 0,
  },
  {
    q: 'Afternoon is the time _______.',
    options: ['before noon', 'after noon', 'at night', 'in the morning'],
    answer: 1,
  },
  {
    q: 'Evening comes before _______.',
    options: ['morning', 'afternoon', 'night', 'noon'],
    answer: 2,
  },
  {
    q: 'Night is the time when it is _______.',
    options: ['bright', 'dark', 'noon', 'before noon'],
    answer: 1,
  },
  {
    q: 'We usually eat breakfast in the _______.',
    options: ['morning', 'afternoon', 'evening', 'night'],
    answer: 0,
  },
  {
    q: 'Lunch is typically eaten in the _______.',
    options: ['morning', 'afternoon', 'evening', 'night'],
    answer: 1,
  },
  {
    q: 'Dinner is usually eaten in the _______.',
    options: ['morning', 'afternoon', 'evening', 'night'],
    answer: 2,
  },
  {
    q: 'The sun rises in the _______.',
    options: ['morning', 'afternoon', 'evening', 'night'],
    answer: 0,
  },
  {
    q: 'The sun sets in the _______.',
    options: ['morning', 'afternoon', 'evening', 'night'],
    answer: 2,
  },
  {
    q: 'We sleep at _______.',
    options: ['morning', 'afternoon', 'evening', 'night'],
    answer: 3,
  },
  {
    q: 'School usually starts in the _______.',
    options: ['morning', 'afternoon', 'evening', 'night'],
    answer: 0,
  },
  {
    q: 'Stars are visible at _______.',
    options: ['morning', 'afternoon', 'evening', 'night'],
    answer: 3,
  },
  {
    q: 'Before noon means _______.',
    options: ['AM', 'PM', '24h', 'Noon'],
    answer: 0,
  },
  {
    q: 'After noon means _______.',
    options: ['AM', 'PM', '24h', 'Midnight'],
    answer: 1,
  },
];

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildBalancedQuestions(
  source: QuizQuestion[],
  count: number,
): QuizQuestion[] {
  return shuffleArray(source).slice(0, count);
}

export default function Quiz({
  onComplete,
  primaryColor = '#4CAF50',
}: {
  onComplete: (score: number) => void;
  primaryColor?: string;
}) {
  // Select only 5 random questions from the full question bank
  const [selectedQuestions] = useState(() => {
    return buildBalancedQuestions(questions, 5);
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
