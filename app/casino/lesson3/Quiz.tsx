'use client';

import { useState } from 'react';
import { useThaiQuestion } from '../../maze/_components/useThaiQuestion';
import styles from '../../maze/_components/QuizButtons.module.css';

const questions = [
  {
    q: 'What do we call the rotating columns in a slot machine?',
    options: ['reels', 'cards', 'tracks', 'doors'],
    answer: 0,
  },
  {
    q: 'What do you press to start the machine?',
    options: ['spin button', 'home key', 'map button', 'speaker'],
    answer: 0,
  },
  {
    q: 'A row of symbols across the machine is called a...',
    options: ['payline', 'lesson', 'ticket', 'wallet'],
    answer: 0,
  },
  {
    q: 'If three matching symbols land, you usually...',
    options: ['lose', 'win', 'pause', 'fold'],
    answer: 1,
  },
  {
    q: 'What are the pictures on the reels called?',
    options: ['symbols', 'letters', 'coins only', 'bets only'],
    answer: 0,
  },
  {
    q: 'Choose the best sentence: "I ___ the slot machine."',
    options: ['spin', 'spun', 'press', 'pressed'],
    answer: 3,
  },
  {
    q: 'What is the money you can still use in the game?',
    options: ['credits', 'weather', 'sound', 'speed'],
    answer: 0,
  },
  {
    q: 'The amount you risk each round is your...',
    options: ['bet', 'teacher', 'window', 'music'],
    answer: 0,
  },
  {
    q: 'What does "jackpot" mean?',
    options: ['a very big win', 'a broken machine', 'one coin', 'a table game'],
    answer: 0,
  },
  {
    q: 'Choose the natural sentence.',
    options: [
      'The reels are spinning.',
      'The reels is spinning.',
      'The reels spinning is.',
      'The reels are spin.',
    ],
    answer: 0,
  },
  {
    q: 'If the symbols do not match, the spin is usually a...',
    options: ['loss', 'lesson', 'bonus key', 'bank'],
    answer: 0,
  },
  {
    q: 'A slot machine bonus round is an extra...',
    options: ['feature', 'shoe', 'table', 'door'],
    answer: 0,
  },
  {
    q: 'What does "cash out" mean?',
    options: [
      'take your winnings/credits',
      'spin again',
      'change the wheel',
      'hide the machine',
    ],
    answer: 0,
  },
  {
    q: 'Choose the best phrase: "Line up three bells" means...',
    options: [
      'match three bell symbols',
      'ring a real bell',
      'leave the game',
      'buy three bells',
    ],
    answer: 0,
  },
  {
    q: 'Which word belongs to slot machines?',
    options: ['reel', 'dealer button', 'goalkeeper', 'suitcase'],
    answer: 0,
  },
  {
    q: 'What does "payout" mean in slots?',
    options: [
      'money or credits you win',
      'the machine sound',
      'the game screen',
      'the chair',
    ],
    answer: 0,
  },
  {
    q: 'Choose the best completion: "She won because the symbols ___."',
    options: ['matched', 'opened', 'walked', 'talked'],
    answer: 0,
  },
  {
    q: 'What is a "wild" symbol used for?',
    options: [
      'to help complete combinations',
      'to stop the game',
      'to lower your credits',
      'to change language',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'I have one credit left.',
      'I has one credit left.',
      'I having one credit left.',
      'I am one credit leave.',
    ],
    answer: 0,
  },
  {
    q: 'After the reels stop, you check the...',
    options: ['result', 'teacher', 'window curtain', 'street'],
    answer: 0,
  },
];

export default function Quiz({
  onComplete,
  primaryColor = '#1D3557',
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
          Slot Quiz Complete!
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
          You earned {score} spin credit{score !== 1 ? 's' : ''}!
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
