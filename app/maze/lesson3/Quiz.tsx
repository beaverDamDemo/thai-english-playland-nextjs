// app/maze/lesson3/Quiz.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  recordAnswer,
  resetStreak,
  reportPerfectLesson,
} from '@/app/_lib/client/quizStreak';
import { useThaiQuestion } from '../_components/useThaiQuestion';
import styles from '../_components/QuizButtons.module.css';
import { shuffleOptions } from '../_components/shuffleUtils';

const questions = [
  {
    q: 'Every weekday, I _______ to school by bike.',
    options: ['go', 'went', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'Yesterday, she _______ to the market for fruit.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'Tomorrow, we _______ to the zoo with our class.',
    options: ['will go', 'go', 'went', 'is going'],
    answer: 0,
  },
  {
    q: 'Right now, he _______ to the gym for his workout.',
    options: ['is going', 'go', 'went', 'will go'],
    answer: 0,
  },
  {
    q: 'Last weekend, they _______ to the beach for a picnic.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'On Mondays, I _______ to work by train.',
    options: ['go', 'went', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'Every Friday, we _______ to the cinema after dinner.',
    options: ['go', 'went', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'Later today, I _______ to the store for groceries.',
    options: ['will go', 'go', 'went', 'is going'],
    answer: 0,
  },
  {
    q: 'At the moment, she _______ to the library to study.',
    options: ['is going', 'go', 'went', 'will go'],
    answer: 0,
  },
  {
    q: 'Last summer, they _______ to the mountains for hiking.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'Next week, I _______ to visit my grandparents.',
    options: ['will go', 'go', 'went', 'is going'],
    answer: 0,
  },
  {
    q: 'He _______ to the dentist yesterday.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'We _______ to the museum every year.',
    options: ['go', 'went', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'She _______ to the cafe right now.',
    options: ['is going', 'go', 'went', 'will go'],
    answer: 0,
  },
  {
    q: 'They _______ to the concert last night.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'I _______ to the park every morning.',
    options: ['go', 'went', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'He _______ to the airport tomorrow.',
    options: ['will go', 'go', 'went', 'is going'],
    answer: 0,
  },
  {
    q: 'She _______ to the bakery now.',
    options: ['is going', 'go', 'went', 'will go'],
    answer: 0,
  },
  {
    q: 'We _______ to the lake last weekend.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'I _______ to the gym three times a week.',
    options: ['go', 'went', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'They _______ to the restaurant tonight.',
    options: ['will go', 'go', 'went', 'is going'],
    answer: 0,
  },
  {
    q: 'He _______ to the office earlier today.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'She _______ to the bookstore every Saturday.',
    options: ['go', 'went', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'We _______ to the party later.',
    options: ['will go', 'go', 'went', 'is going'],
    answer: 0,
  },
  {
    q: 'I _______ to the doctor yesterday.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'He _______ to the supermarket now.',
    options: ['is going', 'go', 'went', 'will go'],
    answer: 0,
  },
  {
    q: 'They _______ to the stadium last Sunday.',
    options: ['went', 'go', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'She _______ to the salon tomorrow.',
    options: ['will go', 'go', 'went', 'is going'],
    answer: 0,
  },
  {
    q: 'We _______ to the zoo every summer.',
    options: ['go', 'went', 'will go', 'is going'],
    answer: 0,
  },
  {
    q: 'I _______ to the cafe this afternoon.',
    options: ['will go', 'go', 'went', 'is going'],
    answer: 0,
  },
];

export default function Quiz({
  onComplete,
  primaryColor,
}: {
  onComplete: (score: number) => void;
  primaryColor: string;
}) {
  const [selectedQuestions] = useState(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5).map((q) => {
      const shuffledOptions = shuffleOptions(q.options);
      const newAnswerIndex = shuffledOptions.indexOf(q.options[q.answer]);
      return { ...q, options: shuffledOptions, answer: newAnswerIndex };
    });
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
            key={`${current}-${i}`}
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
