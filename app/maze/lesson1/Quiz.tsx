'use client';

import { useState } from 'react';
import styles from '../_components/QuizButtons.module.css';
import { questions } from './questions';

type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
};

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildBalancedQuestions(
  source: QuizQuestion[],
  count: number,
): QuizQuestion[] {
  const selected = shuffleArray(source).slice(0, count);
  const targetAnswerSlots = shuffleArray(
    Array.from({ length: count }, (_, i) => i % 4),
  );

  return selected.map((question, idx) => {
    const correctText = question.options[question.answer];
    const wrongOptions = shuffleArray(
      question.options.filter((_, optionIdx) => optionIdx !== question.answer),
    );
    const correctIndex = targetAnswerSlots[idx];
    const balancedOptions: string[] = [];
    let wrongPointer = 0;

    for (let optionIdx = 0; optionIdx < question.options.length; optionIdx++) {
      if (optionIdx === correctIndex) {
        balancedOptions.push(correctText);
      } else {
        balancedOptions.push(wrongOptions[wrongPointer]);
        wrongPointer += 1;
      }
    }

    return {
      ...question,
      options: balancedOptions,
      answer: correctIndex,
    };
  });
}

export default function Quiz({
  onComplete,
  primaryColor = '#4CAF50',
}: {
  onComplete: (score: number) => void;
  primaryColor?: string;
}) {
  // Select only 5 random questions from the full question bank
  const [selectedQuestions] = useState(() => {
    return buildBalancedQuestions(questions, 5);
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
