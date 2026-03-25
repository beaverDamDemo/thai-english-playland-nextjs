// app/maze/lesson3/Quiz.tsx
'use client';

import { useState } from 'react';
import styles from '../_components/QuizButtons.module.css';

const questions = [
  {
    q: 'Choose the correct phrase for something I own.',
    options: ['my phone', 'your phone', 'he phone', 'she phone'],
    answer: 0,
  },
  {
    q: 'Choose the correct phrase for something you own.',
    options: ['my bag', 'your bag', 'our bags', 'it bag'],
    answer: 1,
  },
  {
    q: 'Complete: "This is ___ name." (I am speaking about myself)',
    options: ['my', 'your', 'she', 'their'],
    answer: 0,
  },
  {
    q: 'Complete: "What is ___ name?" (I am asking you)',
    options: ['my', 'his', 'your', 'our'],
    answer: 2,
  },
  {
    q: 'Choose the correct sentence.',
    options: [
      'This is my book.',
      'This is your I book.',
      'This my is book.',
      'This is book my.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence when talking to a friend.',
    options: [
      'Is this my bag?',
      'Is this your bag?',
      'Is this she bag?',
      'Is this he bag?',
    ],
    answer: 1,
  },
  {
    q: 'Fill in the blank: "This is ___ phone." (I own it)',
    options: ['my', 'your', 'her', 'their'],
    answer: 0,
  },
  {
    q: 'Fill in the blank: "This is ___ chair." (You own it)',
    options: ['my', 'your', 'its', 'our'],
    answer: 1,
  },
  {
    q: 'Choose the best answer: "Is this my book or your book?"',
    options: [
      'book and book',
      'my book or your book',
      'yes book',
      'book is blue',
    ],
    answer: 1,
  },
  {
    q: 'Complete: "___ name is Ali." (I am Ali)',
    options: ['My', 'Your', 'His', 'Her'],
    answer: 0,
  },
  {
    q: 'Complete: "___ name is Ken." (I am talking to Ken)',
    options: ['My', 'Your', 'Our', 'Its'],
    answer: 1,
  },
  {
    q: 'Pick the short sentence with my/your used correctly.',
    options: [
      'Your are my friend.',
      'You are my friend.',
      'You my are friend.',
      'My are you friend.',
    ],
    answer: 1,
  },
  {
    q: 'Choose the phrase for "the bag belongs to you".',
    options: ['my bag', 'your bag', 'his bag', 'our bag'],
    answer: 1,
  },
  {
    q: 'Choose the phrase for "the pen belongs to me".',
    options: ['my pen', 'your pen', 'their pen', 'its pen'],
    answer: 0,
  },
  {
    q: 'Complete: "Is this ___ phone?" (I am asking you)',
    options: ['my', 'your', 'our', 'its'],
    answer: 1,
  },
  {
    q: 'Complete: "No, it is ___ phone." (I answer: it belongs to me)',
    options: ['your', 'my', 'their', 'his'],
    answer: 1,
  },
  {
    q: 'Choose the best mini-dialogue ending: "What is your name?"',
    options: [
      'My name is Lina.',
      'Your name is Lina.',
      'Name book chair.',
      'I yes no.',
    ],
    answer: 0,
  },
  {
    q: 'Choose the correct sentence order.',
    options: [
      'my this is bag',
      'this is bag my',
      'this is my bag',
      'is this my bag',
    ],
    answer: 2,
  },
  {
    q: 'Choose the correct question.',
    options: [
      'This your book is?',
      'Is this your book?',
      'Your is this book?',
      'Is your this book?',
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

  function handleAnswer(index: number) {
    let newScore = score;
    if (index === selectedQuestions[current].answer) {
      newScore = score + 1;
      setScore(newScore);
    }
    const nextQuestion = current + 1;

    if (nextQuestion >= selectedQuestions.length) {
      setFinished(true);
      onComplete(newScore);
    } else {
      setCurrent(nextQuestion);
    }
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
      style={{ padding: '0' }}
    >
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
            fontSize: '16px',
            fontWeight: '500',
            color: '#333',
          }}
        >
          {selectedQuestions[current].q}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
        {selectedQuestions[current].options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className={styles.quizOptionButton}
            style={{ backgroundColor: primaryColor }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
