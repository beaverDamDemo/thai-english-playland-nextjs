// app/maze/lesson7/Quiz.tsx
'use client';

import { useState } from 'react';
import { useThaiQuestion } from '../_components/useThaiQuestion';
import styles from '../_components/QuizButtons.module.css';

const questions = [
  {
    q: 'Choose the correct form for today: "I ___ to school now."',
    options: ['go', 'went', 'will go', 'gone'],
    answer: 0,
  },
  {
    q: 'Choose the correct form for yesterday: "I ___ to school yesterday."',
    options: ['go', 'goes', 'went', 'will go'],
    answer: 2,
  },
  {
    q: 'Choose the correct form for tomorrow: "I ___ to school tomorrow."',
    options: ['go', 'went', 'will go', 'going'],
    answer: 2,
  },
  {
    q: 'Match the time word: "went" goes with...',
    options: ['today', 'yesterday', 'tomorrow', 'now'],
    answer: 1,
  },
  {
    q: 'Match the time word: "will go" goes with...',
    options: ['yesterday', 'last week', 'tomorrow', 'before'],
    answer: 2,
  },
  {
    q: 'Match the time word: "go" in this lesson often means...',
    options: ['today/now', 'yesterday', 'tomorrow only', 'never'],
    answer: 0,
  },
  {
    q: 'Complete: "She ___ to work yesterday."',
    options: ['go', 'went', 'will go', 'goes'],
    answer: 1,
  },
  {
    q: 'Complete: "He ___ to the bank tomorrow."',
    options: ['go', 'went', 'will go', 'goes'],
    answer: 2,
  },
  {
    q: 'Complete: "They ___ home now."',
    options: ['go', 'went', 'will go', 'goes'],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'I went now.',
      'I will go yesterday.',
      'I go now.',
      'I go tomorrow yesterday.',
    ],
    answer: 2,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'I went yesterday.',
      'I will go yesterday.',
      'I go tomorrow.',
      'I went tomorrow.',
    ],
    answer: 1,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'I will go tomorrow.',
      'I went tomorrow.',
      'I go yesterday.',
      'I will went tomorrow.',
    ],
    answer: 0,
  },
  {
    q: 'Fill in the blank: "We ___ to class yesterday."',
    options: ['go', 'goes', 'went', 'will go'],
    answer: 2,
  },
  {
    q: 'Fill in the blank: "We ___ to class tomorrow."',
    options: ['go', 'went', 'will go', 'goes'],
    answer: 2,
  },
  {
    q: 'Fill in the blank: "We ___ to class now."',
    options: ['go', 'went', 'will go', 'gone'],
    answer: 0,
  },
  {
    q: 'Choose the tense for "I went yesterday."',
    options: ['present', 'past', 'future', 'question'],
    answer: 1,
  },
  {
    q: 'Choose the tense for "I will go tomorrow."',
    options: ['present', 'past', 'future', 'negative'],
    answer: 2,
  },
  {
    q: 'Choose the tense for "I go now."',
    options: ['past', 'future', 'present', 'past perfect'],
    answer: 2,
  },
  {
    q: 'Select the best timeline order.',
    options: [
      'went, go, will go',
      'go, went, will go',
      'will go, go, went',
      'go, will go, went',
    ],
    answer: 0,
  },
  {
    q: 'Complete: "Yesterday she ___ to the store, but tomorrow she ___ again."',
    options: ['go / go', 'went / will go', 'will go / went', 'goes / go'],
    answer: 1,
  },
  {
    q: 'Pick the wrong sentence for this lesson.',
    options: [
      'I go now.',
      'I went yesterday.',
      'I will go tomorrow.',
      'I went tomorrow.',
    ],
    answer: 1,
  },
];

export default function Quiz({
  onComplete,
  primaryColor = '#4CAF50',
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
