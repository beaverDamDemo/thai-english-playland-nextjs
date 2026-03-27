'use client';

import { useState } from 'react';
import { useThaiQuestion } from '../../maze/_components/useThaiQuestion';
import styles from '../../maze/_components/QuizButtons.module.css';

const questions = [
  {
    q: 'In roulette, where do you place your chips to make a bet?',
    options: ['on the wheel', 'on the table', 'on the card', 'in your pocket'],
    answer: 1,
  },
  {
    q: 'What does the dealer do before the result in roulette?',
    options: ['deals cards', 'spins the wheel', 'rolls dice', 'shuffles chips'],
    answer: 1,
  },
  {
    q: 'Choose the opposite pair used in roulette betting.',
    options: ['high and low', 'red and black', 'hot and cold', 'east and west'],
    answer: 1,
  },
  {
    q: 'If your number appears, your bet is...',
    options: ['lost', 'void', 'won', 'frozen'],
    answer: 2,
  },
  {
    q: 'A roulette "round" means one complete...',
    options: ['spin', 'meal', 'lesson', 'ticket'],
    answer: 0,
  },
  {
    q: 'What does "odd" mean?',
    options: [
      'divisible by 2',
      'not divisible by 2',
      'bigger than 20',
      'green only',
    ],
    answer: 1,
  },
  {
    q: 'What does "even" mean?',
    options: [
      'not divisible by 2',
      'always red',
      'divisible by 2',
      'higher than 30',
    ],
    answer: 2,
  },
  {
    q: 'Choose the best sentence: "I ____ on black."',
    options: ['bet', 'spin', 'deal', 'draw'],
    answer: 0,
  },
  {
    q: 'The amount of money/chips you use is called your...',
    options: ['weather', 'stake', 'wheel', 'sound'],
    answer: 1,
  },
  {
    q: 'If you lose the round, your chips are...',
    options: ['returned', 'kept by the house', 'multiplied', 'hidden'],
    answer: 1,
  },
  {
    q: 'Choose the best phrase: "Place your bets" means...',
    options: [
      'start dancing',
      'put chips on choices',
      'leave the table',
      'count cards',
    ],
    answer: 1,
  },
  {
    q: 'In roulette, 0 is usually colored...',
    options: ['green', 'red', 'black', 'blue'],
    answer: 0,
  },
  {
    q: 'Pick the correct sentence.',
    options: [
      'The wheel spin every round.',
      'The wheel spins every round.',
      'The wheel spinning every round.',
      'The wheel spuning every round.',
    ],
    answer: 1,
  },
  {
    q: 'What is a "payout"?',
    options: [
      'a break time',
      'money won from a bet',
      'a type of wheel',
      'a table color',
    ],
    answer: 1,
  },
  {
    q: 'Choose the best completion: "She won because her bet was ____."',
    options: ['correct', 'heavy', 'quiet', 'open'],
    answer: 0,
  },
  {
    q: 'Which is a roulette vocabulary word?',
    options: ['wheel', 'backpack', 'kitchen', 'village'],
    answer: 0,
  },
  {
    q: 'What does "house edge" refer to?',
    options: ['casino advantage', 'table height', 'wheel speed', 'chip color'],
    answer: 0,
  },
  {
    q: 'Choose the natural sentence.',
    options: [
      'I placed my chips on even.',
      'I place my chips at even yesterday.',
      'I am placing chip on evens nowed.',
      'I putted chips by even.',
    ],
    answer: 0,
  },
  {
    q: 'In roulette, "inside bet" is usually...',
    options: [
      'a bet on specific numbers',
      'a bet outside the casino',
      'a free bet',
      'a team bet',
    ],
    answer: 0,
  },
  {
    q: 'Choose the best completion: "After the spin, we checked the ____."',
    options: ['result', 'kitchen', 'teacher', 'window'],
    answer: 0,
  },
];

export default function Quiz({
  onComplete,
  primaryColor = '#E63946',
}: {
  onComplete: (score: number) => void;
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
