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
    q: 'Choose the correct sentence.',
    options: [
      'She likes tea.',
      'She like tea.',
      'She liking tea.',
      'She liked tea now.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: ['He is tired.', 'He are tired.', 'He am tired.', 'He be tired.'],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'I like music.',
      'I likes music.',
      'I liking music.',
      'I am like music.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct negative sentence.',
    options: [
      'I do not like coffee.',
      'I not like coffee.',
      'I am not like coffee.',
      'I does not like coffee.',
    ],
    answer: 0,
  },
  {
    q: 'Complete: "She ___ pizza."',
    options: ['like', 'likes', 'liked', 'liking'],
    answer: 1,
  },
  {
    q: 'Complete: "They ___ not like spicy food."',
    options: ['do', 'does', 'is', 'are'],
    answer: 0,
  },
  {
    q: 'Choose the feeling word: "I need food."',
    options: ['happy', 'tired', 'hungry', 'angry'],
    answer: 2,
  },
  {
    q: 'Choose the feeling word: "I need sleep."',
    options: ['hungry', 'tired', 'happy', 'cold'],
    answer: 1,
  },
  {
    q: 'Choose the feeling word: "I smile a lot today."',
    options: ['happy', 'tired', 'hungry', 'late'],
    answer: 0,
  },
  {
    q: 'Small talk: "How are you?" Choose a natural answer.',
    options: [
      'I am happy, thank you.',
      'I are happy.',
      'Happy is me.',
      'I happy.',
    ],
    answer: 0,
  },
  {
    q: 'Small talk: "Are you hungry?" Choose a natural answer.',
    options: [
      'Yes, I am hungry.',
      'Yes, I hungry.',
      'Yes, I is hungry.',
      'Yes, hungry I am not.',
    ],
    answer: 0,
  },
  {
    q: 'Small talk: "Do you like tea?" Choose a natural answer.',
    options: ['Yes, I do.', 'Yes, I am.', 'Yes, I like do.', 'Yes, do I.'],
    answer: 0,
  },
  {
    q: 'Complete: "He ___ not like milk."',
    options: ['do', 'does', 'is', 'are'],
    answer: 1,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'She does not like coffee.',
      'She do not like coffee.',
      'She is not like coffee.',
      'She not likes coffee.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'He likes apples.',
      'He like apples.',
      'He liking apples.',
      'He does likes apples.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: ['I am tired.', 'I is tired.', 'I are tired.', 'I be tired.'],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: ['We are happy.', 'We is happy.', 'We am happy.', 'We be happy.'],
    answer: 0,
  },
  {
    q: 'Pick the best response: "What do you like?"',
    options: ['I like tea.', 'I am tea.', 'I do tea.', 'I tea.'],
    answer: 0,
  },
  {
    q: 'Pick the best response: "How is he today?"',
    options: ['He is tired.', 'He tired is.', 'He are tired.', 'He do tired.'],
    answer: 0,
  },
  {
    q: 'Choose the incorrect sentence.',
    options: [
      'She likes music.',
      'He is hungry.',
      'I am happy.',
      'They is tired.',
    ],
    answer: 3,
  },
];

export default function Quiz({
  onComplete,
  primaryColor,
}: {
  onComplete: (score: number, total: number) => void;
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
