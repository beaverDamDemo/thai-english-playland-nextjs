'use client';

import styles from './Lesson3.module.css';

export type VerbEntry = {
  base: string;
  past: string;
  participle: string;
};

export type QuizQuestion = {
  verb: VerbEntry;
  askPast: boolean;
  correctAnswer: string;
  options: string[];
};

type QuizProps = {
  question: QuizQuestion;
  selected: number | null;
  feedback: 'correct' | 'wrong' | null;
  shotsEarned: number;
  verbs: VerbEntry[];
  onAnswer: (optionIndex: number) => void;
  onSkipToShoot?: () => void;
};

export default function Quiz({
  question,
  selected,
  feedback,
  shotsEarned,
  verbs,
  onAnswer,
  onSkipToShoot,
}: QuizProps) {
  const label = question.askPast ? 'past simple' : 'past participle';

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.verbTable}>
          <div className={styles.verbRow}>
            <span className={styles.verbLabel}>Base</span>
            <span className={styles.verbBase}>{question.verb.base}</span>
          </div>
          <div className={styles.verbRow}>
            <span className={styles.verbLabel}>Past simple</span>
            <span
              className={question.askPast ? styles.verbBlank : styles.verbKnown}
            >
              {question.askPast ? '______?' : question.verb.past}
            </span>
          </div>
          <div className={styles.verbRow}>
            <span className={styles.verbLabel}>Past participle</span>
            <span
              className={
                !question.askPast ? styles.verbBlank : styles.verbKnown
              }
            >
              {!question.askPast ? '______?' : question.verb.participle}
            </span>
          </div>
        </div>

        <p className={styles.prompt}>
          What is the <strong>{label}</strong> of{' '}
          <strong>{question.verb.base.toLowerCase()}</strong>?
        </p>

        <div className={styles.optionGrid}>
          {question.options.map((opt, i) => {
            let cls = styles.optionButton;
            if (selected !== null) {
              if (opt === question.correctAnswer) cls = styles.optionCorrect;
              else if (i === selected) cls = styles.optionWrong;
            }
            return (
              <button
                key={i}
                className={cls}
                onClick={() => onAnswer(i)}
                disabled={selected !== null}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {feedback && (
          <p
            className={
              feedback === 'correct' ? styles.feedbackGood : styles.feedbackBad
            }
          >
            {feedback === 'correct'
              ? '✓ Correct! +1 shot'
              : `✗ The answer is: ${question.correctAnswer}`}
          </p>
        )}
      </div>

      <div className={styles.refCard}>
        <p className={styles.refTitle}>Reference</p>
        <table className={styles.refTable}>
          <thead>
            <tr>
              <th>Base</th>
              <th>Past Simple</th>
              <th>Past Participle</th>
            </tr>
          </thead>
          <tbody>
            {verbs.map((v) => (
              <tr key={v.base}>
                <td>{v.base}</td>
                <td>{v.past}</td>
                <td>{v.participle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {shotsEarned > 0 && onSkipToShoot && (
        <div className={styles.skipWrap}>
          <button className={styles.skipButton} onClick={onSkipToShoot}>
            Go shoot ({shotsEarned} shots ready) →
          </button>
        </div>
      )}
    </>
  );
}
