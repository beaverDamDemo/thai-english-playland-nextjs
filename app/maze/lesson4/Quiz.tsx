// app/maze/lesson4/Quiz.tsx
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
    q: 'The dog _______ hungry right now.',
    options: ['is', 'are', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'They _______ at the park yesterday afternoon.',
    options: ['were', 'is', 'are', 'was'],
    answer: 0,
  },
  {
    q: 'My friends _______ always very kind and helpful.',
    options: ['are', 'is', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'She _______ a teacher before she retired.',
    options: ['was', 'is', 'are', 'were'],
    answer: 0,
  },
  {
    q: 'We _______ excited about the trip tomorrow.',
    options: ['are', 'is', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'He _______ at home when I called.',
    options: ['was', 'is', 'are', 'were'],
    answer: 0,
  },
  {
    q: 'The books _______ on the shelf last week.',
    options: ['were', 'is', 'are', 'was'],
    answer: 0,
  },
  {
    q: 'This sandwich _______ delicious at the moment.',
    options: ['is', 'are', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'You _______ very tired after the long hike yesterday.',
    options: ['were', 'is', 'are', 'was'],
    answer: 0,
  },
  {
    q: 'The children _______ playing outside right now.',
    options: ['are', 'is', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'I _______ happy to see you yesterday.',
    options: ['was', 'is', 'are', 'were'],
    answer: 0,
  },
  {
    q: 'They _______ ready for the exam.',
    options: ['are', 'is', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'She _______ in the kitchen earlier.',
    options: ['was', 'is', 'are', 'were'],
    answer: 0,
  },
  {
    q: 'The flowers _______ blooming beautifully.',
    options: ['are', 'is', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'He _______ sick last week.',
    options: ['was', 'is', 'are', 'were'],
    answer: 0,
  },
  {
    q: 'We _______ at the concert last night.',
    options: ['were', 'is', 'are', 'was'],
    answer: 0,
  },
  {
    q: 'The sky _______ clear today.',
    options: ['is', 'are', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'You _______ amazing in your performance.',
    options: ['were', 'is', 'are', 'was'],
    answer: 0,
  },
  {
    q: 'The students _______ studying in the library.',
    options: ['are', 'is', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'I _______ nervous before the interview.',
    options: ['was', 'is', 'are', 'were'],
    answer: 0,
  },
  {
    q: 'The chairs _______ arranged neatly.',
    options: ['are', 'is', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'She _______ late to the meeting.',
    options: ['was', 'is', 'are', 'were'],
    answer: 0,
  },
  {
    q: 'They _______ helpful during the event.',
    options: ['were', 'is', 'are', 'was'],
    answer: 0,
  },
  {
    q: 'The cake _______ delicious.',
    options: ['is', 'are', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'We _______ tired after the trip.',
    options: ['were', 'is', 'are', 'was'],
    answer: 0,
  },
  {
    q: 'He _______ in the office now.',
    options: ['is', 'are', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'The lights _______ off last night.',
    options: ['were', 'is', 'are', 'was'],
    answer: 0,
  },
  {
    q: 'You _______ welcome to join us.',
    options: ['are', 'is', 'was', 'were'],
    answer: 0,
  },
  {
    q: 'She _______ my best friend in school.',
    options: ['was', 'is', 'are', 'were'],
    answer: 0,
  },
  {
    q: 'The birds _______ singing this morning.',
    options: ['are', 'is', 'was', 'were'],
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
