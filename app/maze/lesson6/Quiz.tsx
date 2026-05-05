// app/maze/lesson6/Quiz.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  recordAnswer,
  resetStreak,
  reportPerfectLesson,
} from '@/app/_lib/client/quizStreak';
import { useThaiQuestion } from '../_components/useThaiQuestion';
import styles from '../_components/QuizButtons.module.css';

const questions = [
  {
    q: 'Can you give _______ a ride to the station?',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I think _______ phone is ringing.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: 'She asked _______ to help with the project.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: '_______ backpack is heavier than yours.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'I saw _______ at the cafe yesterday.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'He gave _______ a compliment.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: '_______ dog is barking outside.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: "I'll meet _______ at the station.",
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'Could you pass _______ the salt?',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: '_______ handwriting is very neat.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: 'I brought this book for _______.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: '_______ umbrella is in the car.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'She smiled at _______ when she saw me.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I think _______ keys are on the counter.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: '_______ brother is coming to visit.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'Can you lend _______ your pen?',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I made this cake for _______.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: '_______ shoes are by the door.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'He asked _______ to join him.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: "I'll call _______ later.",
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: '_______ idea was brilliant.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: 'She gave _______ a gift.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I want to talk to _______ about it.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: '_______ name is written here.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'Please help _______ with this.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I saw _______ at the store.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: '_______ house is painted blue.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'She gave _______ a ride.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I think _______ jacket is here.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: '_______ favorite food is pasta.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'Can you help _______ with this box?',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I live in a small cottage. _______ house has a blue door and white walls with ivy growing on the side.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'During lunch, he leaned over and told _______ a joke that made me laugh out loud.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I will meet _______ at the library at 3 PM to study together.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I heard that your sibling plays music. _______ brother plays guitar in a band that performs on weekends.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: 'I have two siblings. _______ sister is studying medicine at university and wants to become a surgeon.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'Before the meeting starts, can you show _______ how to use this app?',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I made this for _______ to say thank you for your help yesterday.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I think that vehicle belongs to you. _______ car is parked outside the school next to the red one.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: 'I love history class. _______ favorite subject is history, especially ancient civilizations and wars.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'This assignment is tricky. Can you help _______ with it?',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: "I'll call _______ when I get home to check in.",
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I trained my pet well. _______ dog can do tricks like jumping and rolling.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'She handed me a novel. She gave _______ a book to read.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I recognized you in the crowd. I saw _______ at the concert last night.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: "This device isn't working. _______ phone can't connect to the internet.",
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: 'I just bought a new computer. _______ laptop is very fast and reliable.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'He invited me to join the group. He asked _______ to join the team.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: "Let's grab lunch together. I'll meet _______ after lunch.",
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'That suggestion was brilliant. _______ idea was really creative.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: 'My battery is low. Can you lend _______ your charger?',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I made this dessert for you. I brought this for _______ to enjoy.',
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'I left them by the door. _______ shoes are in the hallway.',
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: 'She smiled warmly when she saw me. She smiled at _______.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: "We need to discuss the details. I'll talk to _______ about the plan.",
    options: ['you', 'me', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'Your writing is beautiful. _______ handwriting is very neat.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: 'He offered me a lift. He gave _______ a ride home.',
    options: ['me', 'you', 'my', 'your'],
    answer: 0,
  },
  {
    q: 'That coat looks familiar. I think _______ jacket is in the closet.',
    options: ['your', 'me', 'you', 'my'],
    answer: 0,
  },
  {
    q: "I'm expecting a visitor. _______ brother is coming to visit.",
    options: ['my', 'me', 'you', 'your'],
    answer: 0,
  },
  {
    q: "I didn't understand the instructions. Can you explain this to _______ again?",
    options: ['me', 'you', 'my', 'your'],
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
  const [selectedQuestions] = useState(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  });

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedbackIcon, setFeedbackIcon] = useState<'?' | '?' | null>(null);
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
    setFeedbackIcon(isCorrect ? '?' : '?');
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
            color: feedbackIcon === '?' ? '#4CAF50' : '#F44336',
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
