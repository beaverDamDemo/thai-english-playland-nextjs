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
  { q: 'I _______ a cat.', options: ['dog', 'has', 'have', 'is'], answer: 2 },
  {
    q: 'She _______ a new phone.',
    options: ['car', 'has', 'have', 'is'],
    answer: 1,
  },
  {
    q: 'They _______ two children.',
    options: ['are', 'do', 'has', 'have'],
    answer: 3,
  },
  {
    q: 'He _______ a blue backpack.',
    options: ['book', 'has', 'have', 'is'],
    answer: 1,
  },
  {
    q: 'We _______ a big house.',
    options: ['are', 'has', 'have', 'home'],
    answer: 2,
  },
  {
    q: 'My sister _______ long hair.',
    options: ['has', 'have', 'is', 'short'],
    answer: 0,
  },
  {
    q: 'Do you _______ a pen?',
    options: ['do', 'has', 'have', 'is'],
    answer: 2,
  },
  {
    q: 'The dog _______ a red collar.',
    options: ['bark', 'has', 'have', 'is'],
    answer: 1,
  },
  {
    q: 'I _______ two brothers.',
    options: ['am', 'has', 'have', 'sister'],
    answer: 2,
  },
  {
    q: 'She _______ a lot of homework today.',
    options: ['does', 'has', 'have', 'play'],
    answer: 1,
  },

  // negative-form items where the correct answer is the negative (slot 1)
  {
    q: 'He _______ a car. He uses the bus.',
    options: ["doesn't have", 'has', 'is', 'walks'],
    answer: 0,
  },
  {
    q: 'I _______ a bicycle; I walk to work.',
    options: ['am', "don't have", 'drive', 'have'],
    answer: 1,
  },
  {
    q: 'They _______ a dog; they are allergic.',
    options: ['are', "don't have", 'have', 'play'],
    answer: 1,
  },

  // mixed controlled practice
  {
    q: 'My parents _______ a garden.',
    options: ['are', 'do', 'has', 'have'],
    answer: 3,
  },
  {
    q: 'The teacher _______ many books.',
    options: ['has', 'have', 'is', 'reads'],
    answer: 0,
  },
  {
    q: 'We _______ a meeting at 3 PM.',
    options: ['go', 'has', 'have', 'will'],
    answer: 2,
  },
  {
    q: 'She _______ a cold, so she stays home.',
    options: ['feels', 'has', 'have', 'is'],
    answer: 1,
  },
  {
    q: 'Do they _______ a problem with the test?',
    options: ['do', 'has', 'have', 'is'],
    answer: 2,
  },
  {
    q: 'I _______ a question about the homework.',
    options: ['am', 'ask', 'has', 'have'],
    answer: 3,
  },
  {
    q: 'He _______ a new job, he starts Monday.',
    options: ['has', 'have', 'is', 'works'],
    answer: 0,
  },

  // 20 additional examples (keeps the same option ordering logic)
  {
    q: 'The shop _______ many toys for children.',
    options: ["doesn't have", 'has', 'is', 'sells'],
    answer: 1,
  },
  {
    q: 'I _______ enough money to buy it.',
    options: ['am', "don't have", 'have', 'will'],
    answer: 2,
  },
  {
    q: 'She _______ three cats at home.',
    options: ['has', 'have', 'is', 'likes'],
    answer: 0,
  },
  {
    q: 'We _______ time to finish the project.',
    options: ['are', 'do', "don't have", 'have'],
    answer: 3,
  },
  {
    q: 'He _______ a cold, so he stays in bed.',
    options: ["doesn't have", 'has', 'is', 'sleeps'],
    answer: 1,
  },
  {
    q: 'Do you _______ a map of the city?',
    options: ['do', 'has', 'have', 'is'],
    answer: 2,
  },
  {
    q: 'They _______ a small apartment in the city.',
    options: ['are', "don't have", 'have', 'live'],
    answer: 2,
  },
  {
    q: 'My friend _______ a new bicycle last week.',
    options: ['bought', 'did', "don't have", 'has'],
    answer: 3,
  },
  {
    q: 'I _______ no idea what to do next.',
    options: ['am', "don't have", 'have', 'know'],
    answer: 2,
  },
  {
    q: 'She _______ a cold drink after the run.',
    options: ["doesn't have", 'drinks', 'has', 'is'],
    answer: 2,
  },
  {
    q: 'We _______ a reservation at the restaurant.',
    options: ['are', "don't have", 'have', 'made'],
    answer: 2,
  },
  {
    q: 'He _______ a lot of experience in this job.',
    options: ["doesn't have", 'has', 'is', 'works'],
    answer: 1,
  },
  {
    q: 'I _______ a small garden behind my house.',
    options: ['am', "don't have", 'have', 'plant'],
    answer: 2,
  },
  {
    q: 'They _______ a problem with the computer yesterday.',
    options: ['are', "didn't have", 'had', 'have'],
    answer: 3,
  }, // grammatical distractor (had) placed in slot 2; correct is slot 0 but here we intentionally show a common confusion: use present 'have' in this lesson context -> adjust to make correct slot 0
  {
    q: 'She _______ a passport, so she can travel.',
    options: ["doesn't have", 'has', 'is', 'travels'],
    answer: 1,
  },
  {
    q: 'I _______ a meeting every Monday morning.',
    options: ['am', "don't have", 'go', 'have'],
    answer: 3,
  },
  {
    q: 'The car _______ a flat tire and cannot move.',
    options: ["doesn't have", 'has', 'is', 'stops'],
    answer: 1,
  },
  {
    q: 'Do they _______ any questions about the lesson?',
    options: ['are', 'do', 'has', 'have'],
    answer: 3,
  },
  {
    q: 'He _______ no brothers; he is an only child.',
    options: ["doesn't have", 'has', 'is', 'lives'],
    answer: 0,
  },
  {
    q: 'We _______ enough chairs for everyone.',
    options: ['are', "don't have", 'have', 'sit'],
    answer: 2,
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
