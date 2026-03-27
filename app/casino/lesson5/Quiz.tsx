'use client';

import { useState } from 'react';
import { useThaiQuestion } from '../../maze/_components/useThaiQuestion';
import styles from '../../maze/_components/QuizButtons.module.css';

const questions = [
  {
    q: 'What does "buy-in" mean in a casino?',
    options: [
      'exchange cash for chips',
      'leave the casino',
      'spin a wheel',
      'play for free',
    ],
    answer: 0,
  },
  {
    q: 'What does "cash out" mean?',
    options: [
      'exchange chips for money',
      'borrow chips',
      'change tables',
      'double your bet',
    ],
    answer: 0,
  },
  {
    q: 'A chip value is also called its...',
    options: ['denomination', 'direction', 'duration', 'dimension'],
    answer: 0,
  },
  {
    q: 'Choose the polite sentence for a cashier.',
    options: [
      'I want chips, now.',
      'Can I buy in for 500 baht, please?',
      'Give me red chips.',
      'You must do this.',
    ],
    answer: 1,
  },
  {
    q: 'If one green chip is 25 and you have 4, total is...',
    options: ['75', '100', '125', '150'],
    answer: 1,
  },
  {
    q: 'If one black chip is 100 and you have 3, total is...',
    options: ['200', '250', '300', '350'],
    answer: 2,
  },
  {
    q: 'Pick the best phrase: "Could I get a ____, please?"',
    options: ['receipt', 'roulette', 'dealer', 'slot'],
    answer: 0,
  },
  {
    q: 'What does "balance" mean?',
    options: [
      'money/chips remaining',
      'table decoration',
      'number of players',
      'sound volume',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'I need to cash out these chips.',
      'I need cash outed this chips.',
      'I am cashing to out chips nowed.',
      'I need cashed these out chipses.',
    ],
    answer: 0,
  },
  {
    q: 'What is "change" in a cashier context?',
    options: [
      'money returned after payment',
      'new game rules',
      'a type of card',
      'a jackpot light',
    ],
    answer: 0,
  },
  {
    q: 'If you buy chips worth 220 and pay 300, change is...',
    options: ['60', '70', '80', '90'],
    answer: 2,
  },
  {
    q: 'If red chip = 10, and you have 5 red chips, total is...',
    options: ['40', '50', '60', '70'],
    answer: 1,
  },
  {
    q: 'What does "verify" mean at the cashier?',
    options: ['check carefully', 'hide money', 'change dealer', 'spin again'],
    answer: 0,
  },
  {
    q: 'Choose the best completion: "Please count the chips and confirm the ____."',
    options: ['total', 'window', 'music', 'weather'],
    answer: 0,
  },
  {
    q: 'If two black chips (100 each) and one red chip (10), total is...',
    options: ['200', '210', '220', '230'],
    answer: 1,
  },
  {
    q: 'What does "exchange" mean here?',
    options: [
      'trade one thing for another',
      'watch the game',
      'stop talking',
      'close the casino',
    ],
    answer: 0,
  },
  {
    q: 'Pick the natural request at a cashier desk.',
    options: [
      'Can you exchange these chips for cash?',
      'Exchange me to this money now.',
      'I exchange this at your.',
      'Can chips to money this.',
    ],
    answer: 0,
  },
  {
    q: 'If your receipt says 480, your payout is...',
    options: ['480', '580', '380', '280'],
    answer: 0,
  },
  {
    q: 'What is a denomination set?',
    options: [
      'different chip values',
      'different casino songs',
      'different dealers',
      'different doors',
    ],
    answer: 0,
  },
  {
    q: 'Best completion: "I would like to buy in for 1,000 ____."',
    options: ['baht', 'dealer', 'table', 'receipt'],
    answer: 0,
  },
];

export default function Quiz({
  onComplete,
  primaryColor = '#2A9D8F',
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
          Cashier Quiz Complete!
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
          You earned {score} cashier credit{score !== 1 ? 's' : ''}!
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
