// app/maze/lesson5/Quiz.tsx
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
    q: '_______ you like pizza?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ she live near here with her parents?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ we going to the park today after lunch?',
    options: ['Are', 'Do', 'Does', 'Did'],
    answer: 0,
  },
  {
    q: '_______ you see that movie last weekend at the cinema?',
    options: ['Did', 'Do', 'Does', 'Are'],
    answer: 0,
  },
  {
    q: '_______ your friends coming over later for the game night?',
    options: ['Are', 'Do', 'Does', 'Did'],
    answer: 0,
  },
  {
    q: '_______ he play guitar well in his band?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ you remember her name from the meeting yesterday?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ she call you yesterday after the presentation?',
    options: ['Did', 'Do', 'Does', 'Are'],
    answer: 0,
  },
  {
    q: '_______ they usually take the bus to school?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ your brother enjoy playing chess with you?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ you know how to cook pasta?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ she work at the hospital?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ we have homework today?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ they come to the party last night?',
    options: ['Did', 'Do', 'Does', 'Are'],
    answer: 0,
  },
  {
    q: '_______ he like reading novels?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ you hear that noise?',
    options: ['Did', 'Do', 'Does', 'Are'],
    answer: 0,
  },
  {
    q: '_______ she speak French fluently?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ we need to bring our books?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ they arrive on time?',
    options: ['Did', 'Do', 'Does', 'Are'],
    answer: 0,
  },
  {
    q: '_______ your parents live nearby?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ he go to the gym every day?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ you finish your project yesterday?',
    options: ['Did', 'Do', 'Does', 'Are'],
    answer: 0,
  },
  {
    q: '_______ she enjoy the concert?',
    options: ['Did', 'Do', 'Does', 'Are'],
    answer: 0,
  },
  {
    q: '_______ we meet at the cafe later?',
    options: ['Are', 'Do', 'Does', 'Did'],
    answer: 0,
  },
  {
    q: '_______ they play football on weekends?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ your sister study biology?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ he come to school yesterday?',
    options: ['Did', 'Do', 'Does', 'Are'],
    answer: 0,
  },
  {
    q: '_______ you like this song?',
    options: ['Do', 'Does', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ she have a pet cat?',
    options: ['Does', 'Do', 'Did', 'Are'],
    answer: 0,
  },
  {
    q: '_______ we going to start soon?',
    options: ['Are', 'Do', 'Does', 'Did'],
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
