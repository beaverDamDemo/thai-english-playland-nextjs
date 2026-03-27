// app/maze/lesson2/Quiz.tsx
'use client';

import { useState } from 'react';
import { useThaiQuestion } from '../_components/useThaiQuestion';
import styles from '../_components/QuizButtons.module.css';

const questions = [
  {
    q: 'Choose the noun for a male adult.',
    options: ['man', 'run', 'happy', 'read'],
    answer: 0,
  },
  {
    q: 'Choose the noun for a female adult.',
    options: ['woman', 'walk', 'blue', 'sleep'],
    answer: 0,
  },
  {
    q: 'Which word is a child male?',
    options: ['girl', 'boy', 'friend', 'chair'],
    answer: 1,
  },
  {
    q: 'Which word is a child female?',
    options: ['book', 'boy', 'girl', 'phone'],
    answer: 2,
  },
  {
    q: 'Choose a word for someone you like and trust.',
    options: ['friend', 'bag', 'table', 'store'],
    answer: 0,
  },
  {
    q: 'Which word names this object: You call people with it.',
    options: ['book', 'phone', 'chair', 'boy'],
    answer: 1,
  },
  {
    q: 'Which item do you carry on your shoulder?',
    options: ['bag', 'book', 'man', 'girl'],
    answer: 0,
  },
  {
    q: 'Which object is for reading?',
    options: ['chair', 'book', 'phone', 'friend'],
    answer: 1,
  },
  {
    q: 'Choose the object you sit on.',
    options: ['woman', 'bag', 'chair', 'boy'],
    answer: 2,
  },
  {
    q: 'Complete the sentence: "This is a ___."',
    options: ['book', 'run', 'quickly', 'happy'],
    answer: 0,
  },
  {
    q: 'Complete: "This is a woman. ___ is my teacher."',
    options: ['She', 'Book', 'Bag', 'Chair'],
    answer: 0,
  },
  {
    q: 'Choose the correct noun: "Tom is my ___."',
    options: ['friend', 'sleep', 'under', 'blue'],
    answer: 0,
  },
  {
    q: 'Which sentence is correct?',
    options: [
      'This is a book.',
      'This are a book.',
      'This is books.',
      'This is to book.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the best completion: "This is my ___."',
    options: ['phone', 'run', 'go', 'eat'],
    answer: 0,
  },
  {
    q: 'Pick the people word.',
    options: ['chair', 'friend', 'book', 'bag'],
    answer: 1,
  },
  {
    q: 'Pick the objects pair.',
    options: [
      'man and woman',
      'boy and girl',
      'phone and bag',
      'friend and teacher',
    ],
    answer: 2,
  },
  {
    q: 'Complete: "This is a ___. I read it every day."',
    options: ['book', 'chair', 'phone', 'girl'],
    answer: 0,
  },
  {
    q: 'Choose the noun in this sentence: "The boy has a bag."',
    options: ['boy', 'has', 'a', 'The'],
    answer: 0,
  },
  {
    q: 'Complete: "This is my friend. ___ is kind."',
    options: ['He', 'Book', 'Chair', 'Bag'],
    answer: 0,
  },
  {
    q: 'Choose the correct simple sentence.',
    options: [
      'This is a chair.',
      'This chair are.',
      'Is this chair a.',
      'This is chairs.',
    ],
    answer: 0,
  },
];

export default function Quiz({
  onComplete,
  primaryColor = '#4CAF50',
}: {
  onComplete: (score: number) => void;
  primaryColor?: string;
}) {
  // Select only 5 random questions from the full question bank
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
