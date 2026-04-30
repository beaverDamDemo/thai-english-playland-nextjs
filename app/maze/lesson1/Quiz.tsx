'use client';

import { useState } from 'react';
import styles from '../_components/QuizButtons.module.css';

type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
};

const questions: QuizQuestion[] = [
  {
    q: '7 AM is _______ in 24h format.',
    options: ['19:00', '7 AM', '7 PM', '7:00'],
    answer: 3,
  },
  {
    q: '7 PM is _______ in 24h format.',
    options: ['7:00', '7 AM', '7 PM', '19:00'],
    answer: 3,
  },
  {
    q: '7:00 in 24h format is _______.',
    options: ['7:00', '7 AM', '19:00', '7 PM'],
    answer: 1,
  },
  {
    q: '19:00 in 24h format is _______.',
    options: ['7:00', '7 PM', '19:00', '7 AM'],
    answer: 1,
  },
  {
    q: 'I eat breakfast at 7 AM, which is _______ in 24h format.',
    options: ['19:00', '7 AM', '7:00', '7 PM'],
    answer: 2,
  },
  {
    q: 'Dinner is served at 19:00, which is _______ in AM/PM format.',
    options: ['7:00', '7 PM', '19:00', '7 AM'],
    answer: 1,
  },
  {
    q: "The meeting starts at 7:00 in 24h format. That means it's _______.",
    options: ['7:00', '7 AM', '19:00', '7 PM'],
    answer: 1,
  },
  {
    q: "The movie begins at 7 PM. That's _______ in 24h format.",
    options: ['7:00', '7 AM', '19:00', '7 PM'],
    answer: 2,
  },
  {
    q: "She wakes up at 7:00. That's the same as _______.",
    options: ['7:00', '7 AM', '19:00', '7 PM'],
    answer: 1,
  },
  {
    q: "The concert starts at 19:00. That's the same as _______.",
    options: ['7:00', '19:00', '7 AM', '7 PM'],
    answer: 3,
  },
  {
    q: '7 AM is also written as _______.',
    options: ['19:00', '7 AM', '7 PM', '7:00'],
    answer: 3,
  },
  {
    q: '7 PM in 24h format is written as _______.',
    options: ['7:00', '19:00', '7 AM', '7 PM'],
    answer: 1,
  },
  {
    q: 'In 24h format, 7:00 means _______.',
    options: ['7:00', '7 AM', '19:00', '7 PM'],
    answer: 1,
  },
  {
    q: 'In 24h format, 7 PM is written as _______.',
    options: ['7:00', '19:00', '7 AM', '7 PM'],
    answer: 1,
  },
  {
    q: "If it's 7 AM now, the 24h format is _______.",
    options: ['19:00', '7:00', '7 AM', '7 PM'],
    answer: 1,
  },
  {
    q: "If it's 7 PM now, the 24h format is _______.",
    options: ['7:00', '19:00', '7 AM', '7 PM'],
    answer: 1,
  },
  {
    q: 'You see 7:00 on a train ticket. That means _______.',
    options: ['7:00', '19:00', '7 PM', '7 AM'],
    answer: 3,
  },
  {
    q: 'You see 19:00 on a concert ticket. That means _______.',
    options: ['7:00', '7 PM', '19:00', '7 AM'],
    answer: 1,
  },
  {
    q: "7 AM is early morning. It's written as _______.",
    options: ['19:00', '7:00', '7 AM', '7 PM'],
    answer: 1,
  },
  {
    q: "7 PM is evening time. It's written as _______.",
    options: ['7:00', '7 AM', '7 PM', '19:00'],
    answer: 3,
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

// Removes any option whose text already appears in the question prompt
// (e.g. drops "7 AM" from the choices when the question is "7 AM is ___ in 24h format.").
// The correct answer is always preserved, and its index is recomputed.
function pruneSelfReferentialOptions(q: QuizQuestion): QuizQuestion {
  const correctText = q.options[q.answer];
  const filteredOptions = q.options.filter(
    (opt) => opt === correctText || !q.q.includes(opt),
  );
  return {
    ...q,
    options: filteredOptions,
    answer: filteredOptions.indexOf(correctText),
  };
}

function buildBalancedQuestions(
  source: QuizQuestion[],
  count: number,
): QuizQuestion[] {
  return shuffleArray(source).slice(0, count).map(pruneSelfReferentialOptions);
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
