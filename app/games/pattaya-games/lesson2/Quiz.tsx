'use client';

import type { ReactNode } from 'react';

import { useThaiQuestion } from '../../maze/_components/useThaiQuestion';
import quizStyles from '../../maze/_components/QuizButtons.module.css';

export type Challenge = {
  prompt: string;
  options: string[];
  answer: number;
};

const THEME_COLOR = '#a81903';

type QuizProps = {
  challenge: Challenge;
  step: number;
  selectedIndex: number | null;
  feedbackIcon: '✓' | '✗' | null;
  onAnswer: (challenge: Challenge, pickedIndex: number) => void;
};

export default function Quiz({
  challenge,
  step,
  selectedIndex,
  feedbackIcon,
  onAnswer,
}: QuizProps) {
  const thaiQuestion = useThaiQuestion(challenge.prompt);
  const answeredCorrectly =
    selectedIndex !== null && selectedIndex === challenge.answer;
  const blankMatch = challenge.prompt.match(/_{2,}/);
  let promptNode: ReactNode = challenge.prompt;
  if (answeredCorrectly && blankMatch && blankMatch.index !== undefined) {
    const start = blankMatch.index;
    promptNode = (
      <>
        {challenge.prompt.slice(0, start)}
        <span
          style={{
            color: '#2e7d32',
            fontStyle: 'italic',
            textDecoration: 'underline',
            textUnderlineOffset: '4px',
            background: 'rgba(76, 175, 80, 0.15)',
            borderRadius: '4px',
            padding: '0 4px',
          }}
        >
          {challenge.options[challenge.answer]}
        </span>
        {challenge.prompt.slice(start + blankMatch[0].length)}
      </>
    );
  }
  return (
    <div
      className={quizStyles.questionSlide}
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
            animation: `feedbackFadeOut ${feedbackIcon === '✓' ? '1s' : '0.3s'} ease-out forwards`,
            color: feedbackIcon === '✓' ? '#4CAF50' : '#F44336',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
          }}
        >
          {feedbackIcon}
        </div>
      )}
      <style>{`
        @keyframes feedbackFadeOut {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
        }
      `}</style>
      <div style={{ marginBottom: '10px' }}>
        <p
          style={{
            margin: '0 0 8px',
            fontWeight: 'bold',
            fontSize: '13px',
            color: '#666',
          }}
        >
          Question {step + 1}
        </p>
        <h2 className={quizStyles.englishPrompt}>{promptNode}</h2>
        <p className={quizStyles.thaiPrompt}>{thaiQuestion || '\u00a0'}</p>
        {answeredCorrectly && (
          <p
            style={{
              margin: '6px 0 0',
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#2e7d32',
            }}
          >
            ✓ Correct! +moves unlocked
          </p>
        )}
      </div>
      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
        {challenge.options.map((option, idx) => (
          <button
            key={`${option}-${idx}`}
            type="button"
            className={`${quizStyles.quizOptionButton} ${
              selectedIndex !== null && idx === challenge.answer
                ? quizStyles.quizOptionCorrectFlash
                : ''
            }`}
            style={{
              backgroundColor:
                selectedIndex === null
                  ? THEME_COLOR
                  : idx === challenge.answer
                    ? '#4CAF50'
                    : THEME_COLOR,
              fontStyle:
                selectedIndex !== null && idx === challenge.answer
                  ? 'italic'
                  : undefined,
            }}
            onClick={() => onAnswer(challenge, idx)}
            disabled={selectedIndex !== null}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
