// app/maze/lesson2/Quiz.tsx
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
    q: 'My _______ is older than me and loves video games.',
    options: ['brother', 'sister', 'siblings', 'boyfriend'],
    answer: 0,
  },
  {
    q: 'Her _______ is coming to visit from college.',
    options: ['sister', 'brother', 'siblings', 'boyfriend'],
    answer: 0,
  },
  {
    q: "They are twins, so they're _______.",
    options: ['siblings', 'sister', 'brother', 'boyfriend'],
    answer: 0,
  },
  {
    q: 'She went to the movies with her _______ last night.',
    options: ['boyfriend', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: "He bought flowers for his _______ on Valentine's Day.",
    options: ['girlfriend', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: "My dad's _______ is a great cook.",
    options: ['wife', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: 'She introduced me to her _______ at the party.',
    options: ['husband', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: 'I have one _______ and two brothers.',
    options: ['sister', 'brother', 'siblings', 'boyfriend'],
    answer: 0,
  },
  {
    q: "We're not just friends-he's my _______.",
    options: ['boyfriend', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: 'Anna and her _______ are planning their wedding.',
    options: ['fiance', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: 'My _______ and I grew up in the same room.',
    options: ['brother', 'sister', 'siblings', 'boyfriend'],
    answer: 0,
  },
  {
    q: "She's not married, but she has a _______.",
    options: ['boyfriend', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: "He's married, and his _______ is a teacher.",
    options: ['wife', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: 'My _______ and I are going on a trip together.',
    options: ['girlfriend', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: 'Do you have any _______ or are you an only child?',
    options: ['siblings', 'sister', 'brother', 'boyfriend'],
    answer: 0,
  },
  {
    q: 'Her _______ is very supportive of her career.',
    options: ['husband', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: 'My _______ and I share clothes sometimes.',
    options: ['sister', 'brother', 'siblings', 'boyfriend'],
    answer: 0,
  },
  {
    q: "He's not my husband yet, just my _______.",
    options: ['boyfriend', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: "She's married to my uncle, so she's my uncle's _______.",
    options: ['wife', 'sister', 'brother', 'siblings'],
    answer: 0,
  },
  {
    q: "We're close friends, but not _______-we're just classmates.",
    options: ['siblings', 'sister', 'brother', 'boyfriend'],
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
  // Select only 5 random questions from the full question bank and shuffle their options
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
