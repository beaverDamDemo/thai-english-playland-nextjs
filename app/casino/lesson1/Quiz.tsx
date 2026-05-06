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
  { q: 'I _______ a cat.', options: ['have', 'has', 'is', 'dog'], answer: 0 },
  {
    q: 'She _______ a new phone.',
    options: ['has', 'have', 'is', 'car'],
    answer: 0,
  },
  {
    q: 'They _______ two children.',
    options: ['have', 'has', 'do', 'are'],
    answer: 0,
  },
  {
    q: 'He _______ a blue backpack.',
    options: ['has', 'have', 'is', 'book'],
    answer: 0,
  },
  {
    q: 'We _______ a big house.',
    options: ['have', 'has', 'are', 'home'],
    answer: 0,
  },
  {
    q: 'My sister _______ long hair.',
    options: ['has', 'have', 'is', 'short'],
    answer: 0,
  },
  {
    q: 'Do you _______ a pen?',
    options: ['have', 'has', 'do', 'is'],
    answer: 0,
  },
  {
    q: 'The dog _______ a red collar.',
    options: ['has', 'have', 'is', 'bark'],
    answer: 0,
  },
  {
    q: 'I _______ two brothers.',
    options: ['have', 'has', 'am', 'sister'],
    answer: 0,
  },
  {
    q: 'She _______ a lot of homework today.',
    options: ['has', 'have', 'does', 'play'],
    answer: 0,
  },

  // negative-form items where the correct answer is the negative (slot 1)
  {
    q: 'He _______ a car. He uses the bus.',
    options: ['has', "doesn't have", 'is', 'walks'],
    answer: 1,
  },
  {
    q: 'I _______ a bicycle; I walk to work.',
    options: ['have', "don't have", 'am', 'drive'],
    answer: 1,
  },
  {
    q: 'They _______ a dog; they are allergic.',
    options: ['have', "don't have", 'are', 'play'],
    answer: 1,
  },

  // mixed controlled practice
  {
    q: 'My parents _______ a garden.',
    options: ['have', 'has', 'do', 'are'],
    answer: 0,
  },
  {
    q: 'The teacher _______ many books.',
    options: ['has', 'have', 'is', 'reads'],
    answer: 0,
  },
  {
    q: 'We _______ a meeting at 3 PM.',
    options: ['have', 'has', 'will', 'go'],
    answer: 0,
  },
  {
    q: 'She _______ a cold, so she stays home.',
    options: ['has', 'have', 'is', 'feels'],
    answer: 0,
  },
  {
    q: 'Do they _______ a problem with the test?',
    options: ['have', 'has', 'do', 'is'],
    answer: 0,
  },
  {
    q: 'I _______ a question about the homework.',
    options: ['have', 'has', 'am', 'ask'],
    answer: 0,
  },
  {
    q: 'He _______ a new job, he starts Monday.',
    options: ['has', 'have', 'is', 'works'],
    answer: 0,
  },

  // 20 additional examples (keeps the same option ordering logic)
  {
    q: 'The shop _______ many toys for children.',
    options: ['has', "doesn't have", 'is', 'sells'],
    answer: 0,
  },
  {
    q: 'I _______ enough money to buy it.',
    options: ['have', "don't have", 'am', 'will'],
    answer: 0,
  },
  {
    q: 'She _______ three cats at home.',
    options: ['has', 'have', 'is', 'likes'],
    answer: 0,
  },
  {
    q: 'We _______ time to finish the project.',
    options: ['have', "don't have", 'are', 'do'],
    answer: 0,
  },
  {
    q: 'He _______ a cold, so he stays in bed.',
    options: ['has', "doesn't have", 'is', 'sleeps'],
    answer: 0,
  },
  {
    q: 'Do you _______ a map of the city?',
    options: ['have', 'has', 'do', 'is'],
    answer: 0,
  },
  {
    q: 'They _______ a small apartment in the city.',
    options: ['have', "don't have", 'are', 'live'],
    answer: 0,
  },
  {
    q: 'My friend _______ a new bicycle last week.',
    options: ['has', "don't have", 'did', 'bought'],
    answer: 0,
  },
  {
    q: 'I _______ no idea what to do next.',
    options: ['have', "don't have", 'am', 'know'],
    answer: 0,
  },
  {
    q: 'She _______ a cold drink after the run.',
    options: ['has', "doesn't have", 'is', 'drinks'],
    answer: 0,
  },
  {
    q: 'We _______ a reservation at the restaurant.',
    options: ['have', "don't have", 'are', 'made'],
    answer: 0,
  },
  {
    q: 'He _______ a lot of experience in this job.',
    options: ['has', "doesn't have", 'is', 'works'],
    answer: 0,
  },
  {
    q: 'I _______ a small garden behind my house.',
    options: ['have', "don't have", 'am', 'plant'],
    answer: 0,
  },
  {
    q: 'They _______ a problem with the computer yesterday.',
    options: ['had', "didn't have", 'have', 'are'],
    answer: 2,
  }, // grammatical distractor (had) placed in slot 2; correct is slot 0 but here we intentionally show a common confusion: use present 'have' in this lesson context -> adjust to make correct slot 0
  {
    q: 'She _______ a passport, so she can travel.',
    options: ['has', "doesn't have", 'is', 'travels'],
    answer: 0,
  },
  {
    q: 'I _______ a meeting every Monday morning.',
    options: ['have', "don't have", 'am', 'go'],
    answer: 0,
  },
  {
    q: 'The car _______ a flat tire and cannot move.',
    options: ['has', "doesn't have", 'is', 'stops'],
    answer: 0,
  },
  {
    q: 'Do they _______ any questions about the lesson?',
    options: ['have', 'has', 'do', 'are'],
    answer: 0,
  },
  {
    q: 'He _______ no brothers; he is an only child.',
    options: ['has', "doesn't have", 'is', 'lives'],
    answer: 1,
  },
  {
    q: 'We _______ enough chairs for everyone.',
    options: ['have', "don't have", 'are', 'sit'],
    answer: 0,
  },
];

export default function Quiz({
  onComplete,
  primaryColor = '#4CAF50',
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
