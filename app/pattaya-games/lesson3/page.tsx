'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Lesson3.module.css';
import { trackEvent } from '../../_lib/analytics';

const LESSONS_TOTAL = 8;
const ROUND_SIZE = 4;

type VerbEntry = {
  base: string;
  past: string;
  participle: string;
};

const VERBS: VerbEntry[] = [
  { base: 'Buy', past: 'Bought', participle: 'Bought' },
  { base: 'Bring', past: 'Brought', participle: 'Brought' },
  { base: 'Think', past: 'Thought', participle: 'Thought' },
  { base: 'Go', past: 'Went', participle: 'Gone' },
  { base: 'Give', past: 'Gave', participle: 'Given' },
  { base: 'Take', past: 'Took', participle: 'Taken' },
  { base: 'Say', past: 'Said', participle: 'Said' },
  { base: 'Make', past: 'Made', participle: 'Made' },
  { base: 'Come', past: 'Came', participle: 'Come' },
  { base: 'Sleep', past: 'Slept', participle: 'Slept' },
  { base: 'Drink', past: 'Drank', participle: 'Drunk' },
  { base: 'Run', past: 'Ran', participle: 'Run' },
];

type QuizQuestion = {
  verb: VerbEntry;
  askPast: boolean;
  correctAnswer: string;
  options: string[];
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeDisractors(
  correct: string,
  field: 'past' | 'participle',
): string[] {
  const pool = VERBS.map((v) =>
    field === 'past' ? v.past : v.participle,
  ).filter((w) => w.toLowerCase() !== correct.toLowerCase());
  return shuffle(pool).slice(0, 3);
}

function buildRound(): QuizQuestion[] {
  const selected = shuffle(VERBS).slice(0, ROUND_SIZE);
  return selected.map((verb) => {
    const askPast = Math.random() < 0.5;
    const correct = askPast ? verb.past : verb.participle;
    const distractors = makeDisractors(
      correct,
      askPast ? 'past' : 'participle',
    );
    const options = shuffle([correct, ...distractors]);
    return { verb, askPast, correctAnswer: correct, options };
  });
}

type Phase = 'quiz' | 'shoot' | 'done';

type Shot = { id: number; x: number; hit: boolean };
type HitEffect = { id: number; x: number; y: number };

const TANK_SPEED_MS = 4000;

export default function PattayaLesson3Page() {
  const [phase, setPhase] = useState<Phase>('quiz');

  const [round, setRound] = useState<QuizQuestion[]>(() => buildRound());
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const [roundsDone, setRoundsDone] = useState(0);
  const [shotsEarned, setShotsEarned] = useState(0);

  const [shotsLeft, setShotsLeft] = useState(0);
  const [mouseX, setMouseX] = useState(50);
  const [mouseY, setMouseY] = useState(50);
  const [tankX, setTankX] = useState(10);
  const [tankDir, setTankDir] = useState(1);
  const tankDirRef = useRef(1);
  const [tankHits, setTankHits] = useState(0);
  const [shots, setShots] = useState<Shot[]>([]);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  const [shotIdCounter, setShotIdCounter] = useState(0);
  const [hitIdCounter, setHitIdCounter] = useState(0);
  const arenaRef = useRef<HTMLDivElement>(null);
  const tankXRef = useRef(10);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const [savedProgress, setSavedProgress] = useState(false);

  useEffect(() => {
    void trackEvent('pattaya_lesson_opened', {
      lessonNumber: 3,
      topic: 'irregular_verbs',
    });
  }, []);

  function handleAnswer(optionIndex: number) {
    if (selected !== null) return;
    const q = round[qIndex];
    const isCorrect = q.options[optionIndex] === q.correctAnswer;
    setSelected(optionIndex);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setRoundCorrect((v) => v + 1);
      setTotalCorrect((v) => v + 1);
    } else {
      setTotalWrong((v) => v + 1);
    }

    window.setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      if (qIndex + 1 < round.length) {
        setQIndex((v) => v + 1);
      } else {
        finishRound(isCorrect ? roundCorrect + 1 : roundCorrect);
      }
    }, 900);
  }

  function finishRound(correctThisRound: number) {
    const newTotal = shotsEarned + correctThisRound;
    setShotsEarned(newTotal);
    setRoundsDone((v) => v + 1);

    if (correctThisRound === 0) {
      setShotsLeft(newTotal);
      setPhase('shoot');
    } else {
      setRound(buildRound());
      setQIndex(0);
      setRoundCorrect(0);
    }
  }

  function skipToShoot() {
    setShotsLeft(shotsEarned);
    setPhase('shoot');
  }

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouseX(((e.clientX - rect.left) / rect.width) * 100);
    setMouseY(((e.clientY - rect.top) / rect.height) * 100);
  }, []);

  useEffect(() => {
    if (phase !== 'shoot') return;

    const ARENA_WIDTH = 80;
    const speed = ARENA_WIDTH / (TANK_SPEED_MS / 16);

    function tick(time: number) {
      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const dt = Math.min(time - lastTimeRef.current, 100);
      lastTimeRef.current = time;

      const pixelSpeed = speed * (dt / 16);
      let nx = tankXRef.current + pixelSpeed * tankDirRef.current;

      let dir = tankDirRef.current;
      if (nx > 85) {
        nx = 85;
        dir = -1;
      }
      if (nx < 5) {
        nx = 5;
        dir = 1;
      }

      tankXRef.current = nx;
      tankDirRef.current = dir;
      setTankX(nx);
      setTankDir(dir);

      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      lastTimeRef.current = null;
    };
  }, [phase]);

  function fireShot() {
    if (shotsLeft <= 0) return;
    const sx = mouseX;
    const sy = mouseY;
    const tx = tankXRef.current;
    const TANK_HALF = 7;
    const isHit = Math.abs(sx - tx) < TANK_HALF && sy > 55 && sy < 90;

    const sid = shotIdCounter;
    setShotIdCounter((v) => v + 1);
    setShots((prev) => [...prev, { id: sid, x: sx, hit: isHit }]);
    setShotsLeft((v) => v - 1);

    if (isHit) {
      setTankHits((v) => v + 1);
      const hid = hitIdCounter;
      setHitIdCounter((v) => v + 1);
      setHitEffects((prev) => [...prev, { id: hid, x: tx, y: 72 }]);
      window.setTimeout(
        () => setHitEffects((prev) => prev.filter((h) => h.id !== hid)),
        800,
      );
    }

    window.setTimeout(
      () => setShots((prev) => prev.filter((s) => s.id !== sid)),
      600,
    );

    if (shotsLeft - 1 <= 0) {
      window.setTimeout(() => {
        setPhase('done');
        persistProgress(isHit ? tankHits + 1 : tankHits);
      }, 700);
    }
  }

  function persistProgress(hits: number) {
    if (savedProgress) return;
    setSavedProgress(true);
    const passed = shotsEarned >= 3;

    fetch('/api/progress')
      .then((r) => r.json())
      .then(
        (data: {
          ok?: boolean;
          progress?: Record<
            string,
            {
              unlocked_lessons: number;
              correct_answers: number;
              wrong_answers: number;
              quiz_attempts: number;
              total_moves_earned: number;
            }
          >;
        }) => {
          const p =
            data.ok && data.progress
              ? (data.progress['pattaya'] ?? null)
              : null;
          const prevUnlocked = p
            ? Math.min(LESSONS_TOTAL, Math.max(1, p.unlocked_lessons))
            : 1;
          const nextUnlocked = passed
            ? Math.min(LESSONS_TOTAL, Math.max(prevUnlocked, 4))
            : prevUnlocked;
          return fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              game_mode: 'pattaya',
              correct_answers: (p?.correct_answers ?? 0) + totalCorrect,
              wrong_answers: (p?.wrong_answers ?? 0) + totalWrong,
              quiz_attempts: (p?.quiz_attempts ?? 0) + roundsDone,
              total_moves_earned: (p?.total_moves_earned ?? 0) + hits,
              unlocked_lessons: nextUnlocked,
            }),
          });
        },
      )
      .then(() => {
        void trackEvent('pattaya_lesson_completed', {
          lessonNumber: 3,
          totalCorrect,
          totalWrong,
          shotsEarned,
          tankHits: hits,
        });
      })
      .catch(() => null);
  }

  if (phase === 'quiz') {
    const q = round[qIndex];
    const label = q.askPast ? 'past simple' : 'past participle';
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>Irregular Verbs</h1>
              <p className={styles.subtitle}>
                Earn shots by answering correctly!
              </p>
            </div>
            <Link href="/pattaya-games" className={styles.headerHomeLink}>
              <span className={styles.backArrow}>←</span>
            </Link>
          </header>

          <div className={styles.scoreBar}>
            <span className={styles.scoreChip}>✓ {totalCorrect}</span>
            <span className={styles.scoreChipBad}>✗ {totalWrong}</span>
            <span className={styles.scoreChip}>🎯 {shotsEarned} shots</span>
            <span className={styles.scoreChip}>Round {roundsDone + 1}</span>
          </div>

          <div className={styles.panel}>
            <div className={styles.verbTable}>
              <div className={styles.verbRow}>
                <span className={styles.verbLabel}>Base</span>
                <span className={styles.verbBase}>{q.verb.base}</span>
              </div>
              <div className={styles.verbRow}>
                <span className={styles.verbLabel}>Past simple</span>
                <span
                  className={q.askPast ? styles.verbBlank : styles.verbKnown}
                >
                  {q.askPast ? '______?' : q.verb.past}
                </span>
              </div>
              <div className={styles.verbRow}>
                <span className={styles.verbLabel}>Past participle</span>
                <span
                  className={!q.askPast ? styles.verbBlank : styles.verbKnown}
                >
                  {!q.askPast ? '______?' : q.verb.participle}
                </span>
              </div>
            </div>

            <p className={styles.prompt}>
              What is the <strong>{label}</strong> of{' '}
              <strong>{q.verb.base.toLowerCase()}</strong>?
            </p>

            <div className={styles.optionGrid}>
              {q.options.map((opt, i) => {
                let cls = styles.optionButton;
                if (selected !== null) {
                  if (opt === q.correctAnswer) cls = styles.optionCorrect;
                  else if (i === selected) cls = styles.optionWrong;
                }
                return (
                  <button
                    key={i}
                    className={cls}
                    onClick={() => handleAnswer(i)}
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
                  feedback === 'correct'
                    ? styles.feedbackGood
                    : styles.feedbackBad
                }
              >
                {feedback === 'correct'
                  ? '✓ Correct! +1 shot'
                  : `✗ The answer is: ${q.correctAnswer}`}
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
                {VERBS.map((v) => (
                  <tr key={v.base}>
                    <td>{v.base}</td>
                    <td>{v.past}</td>
                    <td>{v.participle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {shotsEarned > 0 && (
            <div className={styles.skipWrap}>
              <button className={styles.skipButton} onClick={skipToShoot}>
                Go shoot ({shotsEarned} shots ready) →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'shoot') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.title}>Tank Shoot!</h1>
              <p className={styles.subtitle}>
                Shots: {shotsLeft} left · Hits: {tankHits}
              </p>
            </div>
            <Link href="/pattaya-games" className={styles.headerHomeLink}>
              <span className={styles.backArrow}>←</span>
            </Link>
          </header>

          <div
            ref={arenaRef}
            className={styles.arena}
            onMouseMove={handleMouseMove}
            onClick={fireShot}
          >
            <div className={styles.sky} />
            <div className={styles.ground} />

            <div
              className={styles.tank}
              style={{
                left: `${tankX}%`,
                transform: `scaleX(${tankDir === -1 ? -1 : 1})`,
              }}
            >
              <div className={styles.tankBody}>
                <div className={styles.tankTurret} />
                <div className={styles.tankBarrel} />
                <div className={styles.tankTrack} />
              </div>
            </div>

            {hitEffects.map((h) => (
              <div
                key={h.id}
                className={styles.explosion}
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
              >
                💥
              </div>
            ))}

            {shots.map((s) => (
              <div
                key={s.id}
                className={styles.shotTracer}
                style={{ left: `${s.x}%`, top: '10%' }}
              />
            ))}

            <div
              className={styles.crosshair}
              style={{ left: `${mouseX}%`, top: `${mouseY}%` }}
            >
              <div className={styles.crosshairH} />
              <div className={styles.crosshairV} />
              <div className={styles.crosshairCircle} />
            </div>

            <div className={styles.shotCounter}>
              {Array.from({ length: shotsLeft }).map((_, i) => (
                <span key={i} className={styles.shotDot}>
                  ●
                </span>
              ))}
            </div>
          </div>

          <p className={styles.arenaHint}>
            Click to fire! Tank hits: {tankHits}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.doneCard}>
          <h1 className={styles.doneTitle}>Well done! 🎖️</h1>
          <p className={styles.doneStat}>
            Correct answers: <strong>{totalCorrect}</strong>
          </p>
          <p className={styles.doneStat}>
            Wrong answers: <strong>{totalWrong}</strong>
          </p>
          <p className={styles.doneStat}>
            Rounds completed: <strong>{roundsDone}</strong>
          </p>
          <p className={styles.doneStat}>
            Shots fired: <strong>{shotsEarned}</strong>
          </p>
          <p className={styles.doneStat}>
            Tank hits: <strong>{tankHits}</strong>
          </p>
          {shotsEarned >= 3 && (
            <p className={styles.doneUnlock}>🔓 Lesson 4 unlocked!</p>
          )}
          <div className={styles.doneActions}>
            <Link href="/pattaya-games" className={styles.doneLink}>
              ← Back to map
            </Link>
            <button
              className={styles.doneRetry}
              onClick={() => {
                setPhase('quiz');
                setRound(buildRound());
                setQIndex(0);
                setRoundCorrect(0);
                setTotalCorrect(0);
                setTotalWrong(0);
                setRoundsDone(0);
                setShotsEarned(0);
                setShotsLeft(0);
                setTankHits(0);
                setShots([]);
                setHitEffects([]);
                setSavedProgress(false);
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
