// app/maze/lesson7/Quiz.tsx
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
    q: '_______ is my brother and he plays guitar.',
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
  },
  {
    q: '_______ is my sister and she loves painting.',
    options: ['she', 'he', 'his', 'her'],
    answer: 0,
  },
  {
    q: 'That is _______ phone on the desk, next to her bag.',
    options: ['her', 'he', 'she', 'his'],
    answer: 0,
  },
  {
    q: '[male] Johnny has a big dog. _______ dog barks loudly at strangers.',
    options: ['his', 'he', 'she', 'her'],
    answer: 0,
  },
  {
    q: "I met a girl named [female] Emily. _______ name is Emily and she's from Spain.",
    options: ['her', 'he', 'she', 'his'],
    answer: 0,
  },
  {
    q: '[male] John is a dentist. _______ is a dentist who works nearby.',
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
  },
  {
    q: '[male] John owns a red car. _______ car is parked in front of the house.',
    options: ['his', 'he', 'she', 'her'],
    answer: 0,
  },
  {
    q: '[female] Anna lives nearby. _______ house has a red roof and a garden.',
    options: ['her', 'he', 'she', 'his'],
    answer: 0,
  },
  {
    q: '[male] Uncle Tom lives in Berlin. _______ is my uncle who lives there.',
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
  },
  {
    q: '[female] Sarah is a nurse and helps people every day. _______ is a nurse who helps people every day.',
    options: ['she', 'he', 'his', 'her'],
    answer: 0,
  },
  {
    q: "[female] Sarah's name is written here. _______ name is Sarah and she's from Canada.",
    options: ['her', 'he', 'she', 'his'],
    answer: 0,
  },
  {
    q: '[female] Ms. Taylor is a teacher at our school. _______ is a teacher at our school.',
    options: ['she', 'he', 'his', 'her'],
    answer: 0,
  },
  {
    q: '[male] David is my cousin and he plays soccer. _______ is my cousin and he plays soccer.',
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
  },
  {
    q: 'I saw [female] Emily at the store yesterday. I saw _______ at the store yesterday.',
    options: ['her', 'he', 'she', 'his'],
    answer: 0,
  },
  {
    q: '[male] Alex owns a dog. _______ dog is very friendly.',
    options: ['his', 'he', 'she', 'her'],
    answer: 0,
  },
  {
    q: '[female] Mia has a cat. _______ cat sleeps all day.',
    options: ['her', 'he', 'she', 'his'],
    answer: 0,
  },
  {
    q: '[male] Uncle Paul lives in Paris. _______ is my uncle who lives in Paris.',
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
  },
  {
    q: '[female] Aunt Mary loves gardening. _______ is my aunt who loves gardening.',
    options: ['she', 'he', 'his', 'her'],
    answer: 0,
  },
  {
    q: "[male] Mike's phone is ringing. _______ phone is ringing.",
    options: ['his', 'he', 'she', 'her'],
    answer: 0,
  },
  {
    q: "[female] Lisa's purse is on the table. _______ purse is on the table.",
    options: ['her', 'he', 'she', 'his'],
    answer: 0,
  },
  {
    q: '[male] Tom is a student in my class. _______ is a student in my class.',
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
  },
  {
    q: '[female] Dr. Rose is a doctor at the hospital. _______ is a doctor at the hospital.',
    options: ['she', 'he', 'his', 'her'],
    answer: 0,
  },
  {
    q: '[male] James left his book on the shelf. _______ book is on the shelf.',
    options: ['his', 'he', 'she', 'her'],
    answer: 0,
  },
  {
    q: "[female] Olivia's keys are in her bag. _______ keys are in her bag.",
    options: ['her', 'he', 'she', 'his'],
    answer: 0,
  },
  {
    q: '[male] Brian studies engineering. _______ is my brother who studies engineering.',
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
  },
  {
    q: '[female] Emma sings beautifully. _______ is my sister who sings beautifully.',
    options: ['she', 'he', 'his', 'her'],
    answer: 0,
  },
  {
    q: '[female] Aunt Lisa teaches science. _______ is my aunt who teaches it.',
    options: ['she', 'he', 'his', 'her'],
    answer: 0,
  },
  {
    q: 'I gave the flowers to [female] my aunt. I gave the flowers to _______ as a thank-you.',
    options: ['her', 'he', 'she', 'his'],
    answer: 0,
  },
  {
    q: 'I saw [male] my uncle at the library yesterday. _______ was reading a newspaper near the window.',
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
  },
  {
    q: '[male] Tom left his pencil on the desk. _______ pencil is still there next to the notebook.',
    options: ['his', 'he', 'she', 'her'],
    answer: 0,
  },
  {
    q: "[female] Anna's backpack is purple. _______ backpack has stars on it and a keychain.",
    options: ['her', 'he', 'she', 'his'],
    answer: 0,
  },
  {
    q: 'My cousin [male] Jack plays basketball. _______ is very tall and athletic, just like his dad.',
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
  },
  {
    q: '[female] My sister volunteers often. _______ is very kind and helpful at the shelter.',
    options: ['she', 'he', 'his', 'her'],
    answer: 0,
  },
  {
    q: '[male] My uncle goes to the cafe often. _______ likes to sit by the window and read.',
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
  },
  {
    q: 'I call [female] my aunt every weekend. I talk to _______ on Sundays about her garden.',
    options: ['her', 'he', 'she', 'his'],
    answer: 0,
  },
  {
    q: "[male] My brother doesn't like spicy food. _______ prefers mild dishes.",
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
  },
  {
    q: "My friend [female] Emily doesn't enjoy loud music. _______ prefers quiet places.",
    options: ['she', 'he', 'his', 'her'],
    answer: 0,
  },
  {
    q: 'I gave the book to my classmate [female] Anna. I gave it to _______ after class.',
    options: ['her', 'he', 'she', 'his'],
    answer: 0,
  },
  {
    q: 'My neighbor [male] John plays the piano beautifully. _______ performs every weekend.',
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
  },
  {
    q: "My coworker [male] Mark doesn't work on weekends. _______ prefers to rest.",
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
  },
  {
    q: "My friend [female] Sarah doesn't eat meat. _______ is a vegetarian.",
    options: ['she', 'he', 'his', 'her'],
    answer: 0,
  },
  {
    q: 'I saw [female] my aunt at the concert last night. I waved to _______ from the crowd.',
    options: ['her', 'he', 'she', 'his'],
    answer: 0,
  },
  {
    q: '[male] My brother forgot his keys at home. _______ had to come back to get them.',
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
  },
  {
    q: 'My colleague [female] Jane is always on time for meetings. _______ is very punctual.',
    options: ['she', 'he', 'his', 'her'],
    answer: 0,
  },
  {
    q: "My friend [male] Tom doesn't watch TV often. _______ prefers reading.",
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
  },
  {
    q: '[female] My sister enjoys painting in her free time. _______ has a studio at home.',
    options: ['she', 'he', 'his', 'her'],
    answer: 0,
  },
  {
    q: "[male] My dad's car is parked outside. _______ car is the blue one.",
    options: ['his', 'he', 'she', 'her'],
    answer: 0,
  },
  {
    q: "[female] My mom's bag is on the chair. _______ bag is the red one.",
    options: ['her', 'he', 'she', 'his'],
    answer: 0,
  },
  {
    q: '[male] My brother lives in Canada. _______ is studying engineering there.',
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
  },
  {
    q: 'My friend [female] Lisa loves to dance. _______ takes ballet classes every week.',
    options: ['she', 'he', 'his', 'her'],
    answer: 0,
  },
  {
    q: "[male] My uncle doesn't like cold weather. _______ prefers summer.",
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
  },
  {
    q: "[female] My aunt doesn't drink coffee. _______ always chooses tea instead.",
    options: ['she', 'he', 'his', 'her'],
    answer: 0,
  },
  {
    q: 'I borrowed the pen from my classmate [male] John. I borrowed it from _______.',
    options: ['him', 'he', 'she', 'his'],
    answer: 0,
  },
  {
    q: 'I helped my friend [female] Emily with her homework. I helped _______ after school.',
    options: ['her', 'he', 'she', 'his'],
    answer: 0,
  },
  {
    q: 'My coworker [male] James always brings his lunch to work. _______ packs it every morning.',
    options: ['he', 'she', 'his', 'her'],
    answer: 0,
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
