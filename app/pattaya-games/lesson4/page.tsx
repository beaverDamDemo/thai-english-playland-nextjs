'use client';

import Link from 'next/link';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  recordAnswer,
  resetStreak,
  reportPerfectLesson,
} from '@/app/_lib/client/quizStreak';
import MazeHeader from '../../maze/_components/MazeHeader';
import { useThaiQuestion } from '../../maze/_components/useThaiQuestion';
import styles from './Lesson4.module.css';

const LESSONS_TOTAL = 8;
const TOTAL_QUESTIONS = 8;
const MAX_HP = 3;
const PASS_SCORE = 5;

type Question = {
  q: string;
  options: string[];
  answer: number;
};

const QUESTIONS: Question[] = [
  {
    q: 'The captain _____ the order yesterday.',
    options: ['gave', 'gives', 'giving', 'given'],
    answer: 0,
  },
  {
    q: 'Our fleet _____ across the Pacific in 1942.',
    options: ['sailed', 'sails', 'sailing', 'sail'],
    answer: 0,
  },
  {
    q: 'The torpedo _____ the enemy hull.',
    options: ['struck', 'strike', 'striking', 'strikes'],
    answer: 0,
  },
  {
    q: 'Sailors _____ trained for many months.',
    options: ['were', 'was', 'is', 'are being'],
    answer: 0,
  },
  {
    q: 'The destroyer _____ at full speed now.',
    options: ['is moving', 'move', 'moved', 'moves'],
    answer: 0,
  },
  {
    q: 'The submarine _____ beneath the waves.',
    options: ['hid', 'hides', 'hide', 'hidden'],
    answer: 0,
  },
  {
    q: 'They _____ a message to headquarters.',
    options: ['sent', 'send', 'sending', 'sends'],
    answer: 0,
  },
  {
    q: 'The convoy _____ safely across the Atlantic.',
    options: ['arrived', 'arrives', 'arriving', 'arrive'],
    answer: 0,
  },
  {
    q: 'Enemy planes _____ spotted on the horizon.',
    options: ['were', 'was', 'is', 'be'],
    answer: 0,
  },
  {
    q: 'The admiral _____ a brave decision.',
    options: ['made', 'makes', 'making', 'make'],
    answer: 0,
  },
  {
    q: 'The crew _____ the deck every morning.',
    options: ['cleaned', 'cleans', 'cleaning', 'clean'],
    answer: 0,
  },
  {
    q: 'We _____ the harbor at dawn.',
    options: ['left', 'leave', 'leaving', 'leaves'],
    answer: 0,
  },
  {
    q: 'The ship _____ in the storm.',
    options: ['rocked', 'rocks', 'rocking', 'rock'],
    answer: 0,
  },
  {
    q: 'My friend _____ in the navy.',
    options: ['served', 'serves', 'serving', 'serve'],
    answer: 0,
  },
  {
    q: 'The radar _____ an object nearby.',
    options: ['detected', 'detects', 'detecting', 'detect'],
    answer: 0,
  },
  {
    q: 'They _____ the enemy ship.',
    options: ['chased', 'chase', 'chasing', 'chases'],
    answer: 0,
  },
  {
    q: 'The waves _____ against the hull.',
    options: ['crashed', 'crash', 'crashing', 'crashes'],
    answer: 0,
  },
  {
    q: 'He _____ the wheel carefully.',
    options: ['steered', 'steers', 'steering', 'steer'],
    answer: 0,
  },
  {
    q: 'The sailors _____ their uniforms.',
    options: ['wore', 'wear', 'wearing', 'wears'],
    answer: 0,
  },
  {
    q: 'We _____ the island yesterday.',
    options: ['visited', 'visit', 'visiting', 'visits'],
    answer: 0,
  },
  {
    q: 'The engine _____ loudly.',
    options: ['roared', 'roars', 'roaring', 'roar'],
    answer: 0,
  },
  {
    q: 'She _____ to the captain.',
    options: ['spoke', 'speaks', 'speaking', 'speak'],
    answer: 0,
  },
  {
    q: 'The flag _____ in the wind.',
    options: ['waved', 'waves', 'waving', 'wave'],
    answer: 0,
  },
  {
    q: 'They _____ the supplies.',
    options: ['loaded', 'load', 'loading', 'loads'],
    answer: 0,
  },
  {
    q: 'The boat _____ slowly.',
    options: ['moved', 'moves', 'moving', 'move'],
    answer: 0,
  },
  {
    q: 'I _____ the map.',
    options: ['checked', 'check', 'checking', 'checks'],
    answer: 0,
  },
  {
    q: 'The sailors _____ hard work.',
    options: ['did', 'do', 'doing', 'does'],
    answer: 0,
  },
  {
    q: 'We _____ the port.',
    options: ['entered', 'enter', 'entering', 'enters'],
    answer: 0,
  },
  {
    q: 'The ship _____ on time.',
    options: ['departed', 'departs', 'departing', 'depart'],
    answer: 0,
  },
  {
    q: 'They _____ the rescue mission.',
    options: ['completed', 'complete', 'completing', 'completes'],
    answer: 0,
  },
  {
    q: 'The captain _____ the crew.',
    options: ['led', 'leads', 'leading', 'lead'],
    answer: 0,
  },
  {
    q: 'We _____ at sea.',
    options: ['sailed', 'sail', 'sailing', 'sails'],
    answer: 0,
  },
  {
    q: 'The sun _____ over the ocean.',
    options: ['rose', 'rises', 'rising', 'rise'],
    answer: 0,
  },
  {
    q: 'He _____ the anchor.',
    options: ['dropped', 'drops', 'dropping', 'drop'],
    answer: 0,
  },
  {
    q: 'The birds _____ around the ship.',
    options: ['flew', 'fly', 'flying', 'flies'],
    answer: 0,
  },
  {
    q: 'They _____ the cargo.',
    options: ['unloaded', 'unload', 'unloading', 'unloads'],
    answer: 0,
  },
  {
    q: 'The water _____ cold.',
    options: ['felt', 'feels', 'feeling', 'feel'],
    answer: 0,
  },
  {
    q: 'Our ship _____ heavy fire last night.',
    options: ['took', 'takes', 'taking', 'take'],
    answer: 0,
  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Ship = {
  id: number;
  label: string;
  isCorrect: boolean;
  // x in % of arena width (center of ship)
  x: number;
  // y in % of arena height (sea band ~45-90%)
  y: number;
  // speed in % per second
  vx: number;
  exploding: boolean;
  flagColor: string;
  fadingOut: boolean;
  fadingIn: boolean;
  questionIndex: number;
  scaleX: number; // 1 for right, -1 for left (horizontal flip)
};

type Effect = {
  id: number;
  type: 'explosion' | 'splash';
  x: number;
  y: number;
};

type Torpedo = {
  id: number;
  // start position (player ship muzzle, in %)
  startX: number;
  startY: number;
  // current position (in %)
  x: number;
  y: number;
  // target position
  targetX: number;
  targetY: number;
  shipId: number;
};

const SHIP_LANES = [50, 62, 74, 86]; // y% positions in arena (sea band)

const FLAG_COLORS = [
  '#ff6b6b', // red
  '#4ecdc4', // teal
  '#ffe66d', // yellow
  '#95e1d3', // mint
  '#f38181', // coral
  '#aa96da', // purple
  '#fcbad3', // pink
  '#a8d8ea', // sky blue
];

function spawnShipsForQuestion(q: Question, questionIndex: number): Ship[] {
  // Build an indexed copy then shuffle so each option becomes a ship
  const items = q.options.map((opt, i) => ({ opt, isCorrect: i === q.answer }));
  const shuffled = shuffle(items);
  // Assign each ship a lane (shuffled), starting offscreen-ish positions
  const lanes = shuffle([...SHIP_LANES]);
  const flagColor = FLAG_COLORS[questionIndex % FLAG_COLORS.length];
  return shuffled.map((item, i) => {
    // Direction: alternate so ships travel both ways for visual variety
    const dir = i % 2 === 0 ? -1 : 1;
    const startX =
      dir === 1 ? -10 + Math.random() * 10 : 110 - Math.random() * 10;
    return {
      id: Date.now() + i + Math.floor(Math.random() * 1000),
      label: item.opt,
      isCorrect: item.isCorrect,
      x: startX,
      y: lanes[i] ?? 50 + i * 12,
      vx: dir * (4 + Math.random() * 3), // 4-7% per second
      exploding: false,
      flagColor,
      fadingOut: false,
      fadingIn: true,
      questionIndex,
      scaleX: dir === 1 ? 1 : -1,
    };
  });
}

function PattayaLesson4Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timestamp = searchParams.get('t');
  const [questions, setQuestions] = useState<Question[]>(QUESTIONS);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(MAX_HP);
  const [ships, setShips] = useState<Ship[]>([]);
  const shipsRef = useRef<Ship[]>([]);
  const [effects, setEffects] = useState<Effect[]>([]);
  const [torpedoes, setTorpedoes] = useState<Torpedo[]>([]);
  const torpedoesRef = useRef<Torpedo[]>([]);
  const [phase, setPhase] = useState<'play' | 'done'>('play');
  const [savedProgress, setSavedProgress] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const arenaRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const effectIdRef = useRef(0);
  const torpedoIdRef = useRef(0);
  const lockedRef = useRef(false); // prevent double-tap during torpedo travel

  const currentQ = questions[qIndex];
  const thaiQ = useThaiQuestion(currentQ?.q ?? '');

  const handlePlayAgain = useCallback(() => {
    router.push(`/pattaya-games/lesson4?t=${Date.now()}`);
  }, [router]);

  // Shuffle questions on client only to avoid hydration mismatch
  useEffect(() => {
    setTimeout(() => {
      setQuestions(shuffle(QUESTIONS).slice(0, TOTAL_QUESTIONS));
      resetStreak();
    }, 0);
  }, []);

  // Reset game when timestamp changes (play again button)
  useEffect(() => {
    if (timestamp) {
      setTimeout(() => {
        setQIndex(0);
        setScore(0);
        setHp(MAX_HP);
        setShips([]);
        shipsRef.current = [];
        setEffects([]);
        setTorpedoes([]);
        torpedoesRef.current = [];
        setPhase('play');
        setSavedProgress(false);
        setTotalCorrect(0);
        setTotalWrong(0);
        lockedRef.current = false;
      }, 0);
    }
  }, [timestamp]);

  // Spawn ships when question changes
  useEffect(() => {
    if (phase !== 'play' || !currentQ) return;
    // On first question, clear ships. On subsequent questions, keep old ships navigating
    const isFirstQuestion = qIndex === 0;
    setTimeout(() => {
      const fresh = spawnShipsForQuestion(currentQ, qIndex);
      shipsRef.current = isFirstQuestion
        ? fresh
        : [...shipsRef.current, ...fresh];
      setShips([...shipsRef.current]);
      lockedRef.current = false;
      // Remove fadingIn state after animation
      setTimeout(() => {
        shipsRef.current = shipsRef.current.map((s) => ({
          ...s,
          fadingIn: false,
        }));
        setShips([...shipsRef.current]);
      }, 500);
    }, 300);
  }, [qIndex, phase, currentQ]);

  // Animation loop: move ships + torpedoes
  useEffect(() => {
    if (phase !== 'play') return;

    function tick(time: number) {
      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const dt = Math.min(time - lastTimeRef.current, 100) / 1000;
      lastTimeRef.current = time;

      // Move ships (bounce current question ships at edges, remove previous question ships when off-screen)
      const nextShips = shipsRef.current
        .map((s) => {
          if (s.exploding) return s;
          let nx = s.x + s.vx * dt;
          let nvx = s.vx;
          let nscaleX = s.scaleX;

          // Bounce current question ships at edges
          if (s.questionIndex === qIndex) {
            if (nx > 115) {
              nx = 115;
              nvx = -Math.abs(s.vx);
              nscaleX = -1;
            } else if (nx < -15) {
              nx = -15;
              nvx = Math.abs(s.vx);
              nscaleX = 1;
            }
          }
          return { ...s, x: nx, vx: nvx, scaleX: nscaleX };
        })
        .filter((s) => {
          // Always keep current question ships
          if (s.questionIndex === qIndex) return true;
          // Remove previous question ships when off-screen
          return s.x > -20 && s.x < 120;
        });
      shipsRef.current = nextShips;
      setShips([...nextShips]);

      // Move torpedoes toward target
      const TORP_SPEED = 90; // % per second
      const nextTorps: Torpedo[] = [];
      for (const t of torpedoesRef.current) {
        const dx = t.targetX - t.x;
        const dy = t.targetY - t.y;
        const dist = Math.hypot(dx, dy);
        const step = TORP_SPEED * dt;
        if (dist <= step) {
          // arrived — handled by setTimeout that fired with the torpedo
          continue;
        }
        nextTorps.push({
          ...t,
          x: t.x + (dx / dist) * step,
          y: t.y + (dy / dist) * step,
        });
      }
      torpedoesRef.current = nextTorps;
      setTorpedoes([...nextTorps]);

      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      lastTimeRef.current = null;
    };
  }, [phase, qIndex]);

  const spawnEffect = useCallback(
    (type: Effect['type'], x: number, y: number) => {
      const id = effectIdRef.current++;
      setEffects((prev) => [...prev, { id, type, x, y }]);
      window.setTimeout(() => {
        setEffects((prev) => prev.filter((e) => e.id !== id));
      }, 700);
    },
    [],
  );

  const handleShipTap = useCallback(
    (ship: Ship) => {
      if (lockedRef.current || phase !== 'play' || ship.exploding) return;
      lockedRef.current = true;

      // Fire torpedo from player ship (bottom center) to ship position
      const tid = torpedoIdRef.current++;
      const torp: Torpedo = {
        id: tid,
        startX: 50,
        startY: 95,
        x: 50,
        y: 95,
        targetX: ship.x,
        targetY: ship.y + 8, // Aim at center of lower half of ship
        shipId: ship.id,
      };
      torpedoesRef.current = [...torpedoesRef.current, torp];
      setTorpedoes([...torpedoesRef.current]);

      // Calculate flight time based on distance
      const dx = ship.x - 50;
      const dy = ship.y + 8 - 95; // Use targetY for distance calculation
      const dist = Math.hypot(dx, dy);
      const flightMs = (dist / 90) * 1000; // 90% per second

      window.setTimeout(() => {
        // Remove torpedo
        torpedoesRef.current = torpedoesRef.current.filter((t) => t.id !== tid);
        setTorpedoes([...torpedoesRef.current]);

        // Resolve hit using current ship position
        const liveShip = shipsRef.current.find((s) => s.id === ship.id);
        const hitX = liveShip?.x ?? ship.x;
        const hitY = (liveShip?.y ?? ship.y) + 8; // Match torpedo targetY offset

        if (ship.isCorrect) {
          recordAnswer(true);
          setTotalCorrect((v) => v + 1);
          setScore((v) => v + 1);
          spawnEffect('explosion', hitX, hitY);
          // Mark ship exploding, keep other ships navigating
          shipsRef.current = shipsRef.current.map((s) =>
            s.id === ship.id ? { ...s, exploding: true } : s,
          );
          setShips([...shipsRef.current]);

          window.setTimeout(() => {
            // Move to next question or finish
            if (qIndex + 1 >= questions.length) {
              setPhase('done');
            } else {
              setQIndex((v) => v + 1);
            }
          }, 700);
        } else {
          recordAnswer(false);
          setTotalWrong((v) => v + 1);
          spawnEffect('splash', hitX, hitY);
          setHp((v) => {
            const next = v - 1;
            if (next <= 0) {
              window.setTimeout(() => setPhase('done'), 400);
            }
            return next;
          });
          // Allow another shot
          window.setTimeout(() => {
            lockedRef.current = false;
          }, 300);
        }
      }, flightMs);
    },
    [phase, qIndex, questions.length, spawnEffect],
  );

  // Persist progress on done
  useEffect(() => {
    if (phase !== 'done' || savedProgress) return;
    setTimeout(() => {
      setSavedProgress(true);
      const passed = score >= PASS_SCORE;
      if (totalWrong === 0 && totalCorrect > 0) reportPerfectLesson();

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
              ? Math.min(LESSONS_TOTAL, Math.max(prevUnlocked, 5))
              : prevUnlocked;
            return fetch('/api/progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                game_mode: 'pattaya',
                correct_answers: (p?.correct_answers ?? 0) + totalCorrect,
                wrong_answers: (p?.wrong_answers ?? 0) + totalWrong,
                quiz_attempts:
                  (p?.quiz_attempts ?? 0) + totalCorrect + totalWrong,
                total_moves_earned: (p?.total_moves_earned ?? 0) + score,
                unlocked_lessons: nextUnlocked,
              }),
            });
          },
        )
        .catch(() => null);
    }, 0);
  }, [phase, savedProgress, score, totalCorrect, totalWrong]);

  if (phase === 'done') {
    const passed = score >= PASS_SCORE;
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <MazeHeader score={score} backHref="/pattaya-games" />
          <div className={styles.endPanel}>
            <h2 className={styles.endTitle}>
              {passed ? 'Mission Accomplished!' : 'Mission Failed'}
            </h2>
            <p className={styles.endText}>
              You sank {score} / {questions.length} enemy ships.
            </p>
            <p className={styles.endText}>
              {passed
                ? 'Lesson 5 unlocked!'
                : `Sink at least ${PASS_SCORE} ships to advance.`}
            </p>
            <div className={styles.btnRow}>
              <button onClick={handlePlayAgain} className={styles.btn}>
                Play again
              </button>
              <Link
                href="/pattaya-games"
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                Back to map
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <MazeHeader score={score} backHref="/pattaya-games" />

        <div className={styles.hud}>
          <span className={styles.chip}>
            Q {qIndex + 1}/{questions.length}
          </span>
          <span className={styles.chipGood}>🎯 {score}</span>
          <span className={styles.chipBad}>
            {'❤️'.repeat(hp)}
            {'🤍'.repeat(MAX_HP - hp)}
          </span>
        </div>

        <div ref={arenaRef} className={styles.arena}>
          <div className={styles.questionPanel}>
            <p className={styles.questionText}>{currentQ?.q}</p>
            {thaiQ && thaiQ !== currentQ?.q && (
              <p className={styles.questionThai}>{thaiQ}</p>
            )}
          </div>

          <div className={styles.sky}>
            <div
              className={styles.cloud}
              style={{ left: '15%', top: '15%', width: 60, height: 18 }}
            />
            <div
              className={styles.cloud}
              style={{ left: '60%', top: '8%', width: 80, height: 22 }}
            />
            <div
              className={styles.cloud}
              style={{ left: '80%', top: '22%', width: 50, height: 14 }}
            />
          </div>
          <div className={styles.sea}>
            <div className={styles.wave} style={{ top: '20%' }} />
            <div className={styles.wave} style={{ top: '45%' }} />
            <div className={styles.wave} style={{ top: '70%' }} />
            <div className={styles.wave} style={{ top: '90%' }} />
          </div>

          {/* Enemy ships */}
          {ships.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.ship} ${
                s.exploding ? styles.shipExploding : ''
              } ${s.fadingIn ? styles.shipFadingIn : ''} ${
                s.fadingOut ? styles.shipFadingOut : ''
              }`}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                transform: `translate(-50%, -50%) scaleX(${s.scaleX})`,
              }}
              onClick={() => handleShipTap(s)}
              disabled={s.exploding || s.fadingOut}
              aria-label={`Enemy ship ${s.label}`}
            >
              <span
                className={styles.shipLabel}
                style={{ transform: `scaleX(${s.scaleX})` }}
              >
                {s.label}
              </span>
              <svg
                className={styles.shipHull}
                viewBox="-10 0 100 38"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Wake effect behind ship */}
                <ellipse
                  cx="45"
                  cy="34"
                  rx="35"
                  ry="4"
                  fill="rgba(255,255,255,0.15)"
                />
                {/* Main hull with pointed bow */}
                <polygon
                  points="-10,28 4,20 86,20 80,32 10,32"
                  fill="#4a3a2a"
                  stroke="#2a1a0a"
                  strokeWidth="1"
                />
                {/* Hull plating lines */}
                <line
                  x1="2"
                  y1="24"
                  x2="80"
                  y2="24"
                  stroke="#3a2a1a"
                  strokeWidth="0.5"
                />
                <line
                  x1="6"
                  y1="28"
                  x2="78"
                  y2="28"
                  stroke="#3a2a1a"
                  strokeWidth="0.5"
                />
                {/* Deck */}
                <rect x="8" y="18" width="74" height="4" fill="#5a4a3a" />
                <rect x="8" y="18" width="74" height="1" fill="#6a5a4a" />
                {/* Superstructure/bridge */}
                <rect
                  x="28"
                  y="12"
                  width="34"
                  height="8"
                  fill="#3a3a3a"
                  stroke="#2a2a2a"
                  strokeWidth="0.5"
                />
                <rect x="30" y="10" width="30" height="4" fill="#4a4a4a" />
                {/* Bridge windows */}
                <rect x="32" y="13" width="4" height="3" fill="#7ab8d8" />
                <rect x="38" y="13" width="4" height="3" fill="#7ab8d8" />
                <rect x="44" y="13" width="4" height="3" fill="#7ab8d8" />
                <rect x="50" y="13" width="4" height="3" fill="#7ab8d8" />
                {/* Bridge roof */}
                <polygon points="28,12 62,12 58,10 32,10" fill="#3a3a3a" />
                {/* Forward funnel */}
                <rect x="22" y="6" width="6" height="12" fill="#2a2a2a" />
                <rect x="21" y="5" width="8" height="2" fill="#3a3a3a" />
                {/* Funnel smoke */}
                <ellipse
                  cx="25"
                  cy="4"
                  rx="8"
                  ry="3"
                  fill="#5a5a5a"
                  opacity="0.4"
                />
                <ellipse
                  cx="27"
                  cy="2"
                  rx="6"
                  ry="2"
                  fill="#6a6a6a"
                  opacity="0.3"
                />
                {/* Aft funnel */}
                <rect x="62" y="6" width="6" height="12" fill="#2a2a2a" />
                <rect x="61" y="5" width="8" height="2" fill="#3a3a3a" />
                {/* Funnel smoke */}
                <ellipse
                  cx="65"
                  cy="4"
                  rx="8"
                  ry="3"
                  fill="#5a5a5a"
                  opacity="0.4"
                />
                <ellipse
                  cx="67"
                  cy="2"
                  rx="6"
                  ry="2"
                  fill="#6a6a6a"
                  opacity="0.3"
                />
                {/* Forward turret */}
                <circle
                  cx="18"
                  cy="15"
                  r="5"
                  fill="#3a3a3a"
                  stroke="#2a2a2a"
                  strokeWidth="0.5"
                />
                <rect x="14" y="14" width="8" height="3" fill="#2a2a2a" />
                <rect x="16" y="11" width="10" height="2" fill="#2a2a2a" />
                {/* Aft turret */}
                <circle
                  cx="72"
                  cy="15"
                  r="5"
                  fill="#3a3a3a"
                  stroke="#2a2a2a"
                  strokeWidth="0.5"
                />
                <rect x="68" y="14" width="8" height="3" fill="#2a2a2a" />
                <rect x="64" y="11" width="10" height="2" fill="#2a2a2a" />
                {/* Mast */}
                <line
                  x1="45"
                  y1="12"
                  x2="45"
                  y2="2"
                  stroke="#2a1a0a"
                  strokeWidth="1"
                />
                {/* Antenna */}
                <line
                  x1="45"
                  y1="2"
                  x2="50"
                  y2="0"
                  stroke="#2a1a0a"
                  strokeWidth="0.5"
                />
                <circle cx="50" cy="0" r="1" fill="#3a3a3a" />
                {/* Stern flag */}
                <line
                  x1="12"
                  y1="18"
                  x2="12"
                  y2="8"
                  stroke="#2a1a0a"
                  strokeWidth="0.5"
                />
                <polygon points="12,8 5,10 12,12" fill={s.flagColor} />
                {/* Bow detail - pointed prow with shadow */}
                <polygon points="-10,28 4,20 8,22 4,30 -6,30" fill="#3a2a1a" />
                {/* Bow wave / spray */}
                <path
                  d="M -14,30 Q -8,26 0,28 Q -4,32 -14,30 Z"
                  fill="rgba(255,255,255,0.55)"
                />
                <ellipse
                  cx="-10"
                  cy="31"
                  rx="6"
                  ry="1.4"
                  fill="rgba(255,255,255,0.4)"
                />
                {/* Waterline highlight */}
                <line
                  x1="4"
                  y1="32"
                  x2="86"
                  y2="32"
                  stroke="#7ab8d8"
                  strokeWidth="0.5"
                  opacity="0.4"
                />
              </svg>
            </button>
          ))}

          {/* Torpedoes in flight */}
          {torpedoes.map((t) => (
            <div
              key={t.id}
              className={styles.torpedo}
              style={{ left: `${t.x}%`, top: `${t.y}%` }}
            />
          ))}

          {/* Effects */}
          {effects.map((e) =>
            e.type === 'explosion' ? (
              <svg
                key={e.id}
                className={styles.explosion}
                style={{ left: `${e.x}%`, top: `${e.y}%` }}
                viewBox="0 0 90 90"
              >
                <circle cx="45" cy="45" r="40" fill="#ff8a3a" opacity="0.8" />
                <circle cx="45" cy="45" r="28" fill="#ffd166" opacity="0.9" />
                <circle cx="45" cy="45" r="14" fill="#fff" />
              </svg>
            ) : (
              <div
                key={e.id}
                className={styles.splash}
                style={{ left: `${e.x}%`, top: `${e.y}%` }}
              />
            ),
          )}

          {/* Player destroyer at bottom */}
          <svg
            className={styles.playerShip}
            viewBox="0 0 120 54"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Wake effect */}
            <ellipse
              cx="60"
              cy="52"
              rx="50"
              ry="3"
              fill="rgba(255,255,255,0.2)"
            />
            {/* Main hull */}
            <polygon
              points="6,28 114,28 106,48 14,48"
              fill="#3a4a5a"
              stroke="#1a2a3a"
              strokeWidth="1"
            />
            {/* Hull plating lines */}
            <line
              x1="14"
              y1="34"
              x2="106"
              y2="34"
              stroke="#2a3a4a"
              strokeWidth="0.5"
            />
            <line
              x1="16"
              y1="40"
              x2="104"
              y2="40"
              stroke="#2a3a4a"
              strokeWidth="0.5"
            />
            <line
              x1="18"
              y1="44"
              x2="102"
              y2="44"
              stroke="#2a3a4a"
              strokeWidth="0.5"
            />
            {/* Deck */}
            <rect x="10" y="26" width="100" height="4" fill="#4a5a6a" />
            <rect x="10" y="26" width="100" height="1" fill="#5a6a7a" />
            {/* Bow flare */}
            <polygon points="6,28 14,28 14,48 6,42" fill="#2a3a4a" />
            {/* Superstructure/bridge */}
            <rect
              x="38"
              y="16"
              width="44"
              height="12"
              fill="#2a2a3a"
              stroke="#1a1a2a"
              strokeWidth="0.5"
            />
            <rect x="40" y="14" width="40" height="4" fill="#3a3a4a" />
            {/* Bridge windows */}
            <rect x="42" y="17" width="5" height="4" fill="#8ac8e8" />
            <rect x="50" y="17" width="5" height="4" fill="#8ac8e8" />
            <rect x="58" y="17" width="5" height="4" fill="#8ac8e8" />
            <rect x="66" y="17" width="5" height="4" fill="#8ac8e8" />
            <rect x="74" y="17" width="5" height="4" fill="#8ac8e8" />
            {/* Bridge roof */}
            <polygon points="38,16 82,16 78,14 42,14" fill="#2a2a3a" />
            {/* Bridge detail */}
            <rect x="45" y="20" width="30" height="2" fill="#1a1a2a" />
            {/* Forward funnel */}
            <rect x="28" y="8" width="8" height="18" fill="#1a1a2a" />
            <rect x="26" y="6" width="12" height="3" fill="#2a2a3a" />
            {/* Funnel top band */}
            <rect x="27" y="7" width="10" height="1" fill="#3a3a4a" />
            {/* Funnel smoke */}
            <ellipse
              cx="32"
              cy="5"
              rx="10"
              ry="4"
              fill="#5a5a6a"
              opacity="0.35"
            />
            <ellipse
              cx="35"
              cy="2"
              rx="8"
              ry="3"
              fill="#6a6a7a"
              opacity="0.25"
            />
            {/* Aft funnel */}
            <rect x="84" y="8" width="8" height="18" fill="#1a1a2a" />
            <rect x="82" y="6" width="12" height="3" fill="#2a2a3a" />
            {/* Funnel top band */}
            <rect x="83" y="7" width="10" height="1" fill="#3a3a4a" />
            {/* Funnel smoke */}
            <ellipse
              cx="88"
              cy="5"
              rx="10"
              ry="4"
              fill="#5a5a6a"
              opacity="0.35"
            />
            <ellipse
              cx="91"
              cy="2"
              rx="8"
              ry="3"
              fill="#6a6a7a"
              opacity="0.25"
            />
            {/* Forward turret (main) */}
            <circle
              cx="24"
              cy="20"
              r="7"
              fill="#1a1a2a"
              stroke="#0a0a1a"
              strokeWidth="0.5"
            />
            <rect x="16" y="18" width="16" height="4" fill="#0a0a1a" />
            <rect x="18" y="14" width="14" height="3" fill="#0a0a1a" />
            {/* Forward secondary turret */}
            <circle
              cx="38"
              cy="22"
              r="4"
              fill="#1a1a2a"
              stroke="#0a0a1a"
              strokeWidth="0.5"
            />
            <rect x="34" y="20" width="8" height="2" fill="#0a0a1a" />
            <rect x="35" y="17" width="8" height="2" fill="#0a0a1a" />
            {/* Aft turret (main) */}
            <circle
              cx="96"
              cy="20"
              r="7"
              fill="#1a1a2a"
              stroke="#0a0a1a"
              strokeWidth="0.5"
            />
            <rect x="88" y="18" width="16" height="4" fill="#0a0a1a" />
            <rect x="88" y="14" width="14" height="3" fill="#0a0a1a" />
            {/* Aft secondary turret */}
            <circle
              cx="82"
              cy="22"
              r="4"
              fill="#1a1a2a"
              stroke="#0a0a1a"
              strokeWidth="0.5"
            />
            <rect x="78" y="20" width="8" height="2" fill="#0a0a1a" />
            <rect x="77" y="17" width="8" height="2" fill="#0a0a1a" />
            {/* Main mast */}
            <line
              x1="60"
              y1="16"
              x2="60"
              y2="2"
              stroke="#1a2a3a"
              strokeWidth="1.5"
            />
            {/* Mast top platform */}
            <rect x="56" y="2" width="8" height="2" fill="#2a3a4a" />
            {/* Radar antenna */}
            <ellipse cx="60" cy="1" rx="6" ry="1" fill="#1a1a2a" />
            <line
              x1="54"
              y1="1"
              x2="66"
              y2="1"
              stroke="#2a2a3a"
              strokeWidth="0.5"
            />
            {/* Forward mast */}
            <line
              x1="30"
              y1="16"
              x2="30"
              y2="4"
              stroke="#1a2a3a"
              strokeWidth="1"
            />
            <rect x="28" y="3" width="4" height="2" fill="#2a3a4a" />
            {/* Aft mast */}
            <line
              x1="90"
              y1="16"
              x2="90"
              y2="4"
              stroke="#1a2a3a"
              strokeWidth="1"
            />
            <rect x="88" y="3" width="4" height="2" fill="#2a3a4a" />
            {/* Flag staff */}
            <line
              x1="60"
              y1="14"
              x2="60"
              y2="0"
              stroke="#1a2a3a"
              strokeWidth="0.8"
            />
            {/* Naval ensign */}
            <polygon points="60,0 70,3 60,6" fill="#3366cc" />
            <rect x="60" y="2" width="10" height="2" fill="#cc3333" />
            {/* Deck detail - cargo hatches */}
            <rect x="20" y="24" width="12" height="2" fill="#3a4a5a" rx="1" />
            <rect x="36" y="24" width="12" height="2" fill="#3a4a5a" rx="1" />
            <rect x="52" y="24" width="16" height="2" fill="#3a4a5a" rx="1" />
            <rect x="72" y="24" width="12" height="2" fill="#3a4a5a" rx="1" />
            {/* Anchor */}
            <polygon points="12,28 16,28 16,32 12,32" fill="#4a5a6a" />
            <line
              x1="14"
              y1="28"
              x2="14"
              y2="34"
              stroke="#3a4a5a"
              strokeWidth="1"
            />
            <circle
              cx="14"
              cy="35"
              r="1.5"
              fill="none"
              stroke="#3a4a5a"
              strokeWidth="0.8"
            />
            {/* Waterline highlight */}
            <line
              x1="6"
              y1="48"
              x2="114"
              y2="48"
              stroke="#8ac8e8"
              strokeWidth="0.5"
              opacity="0.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function PattayaLesson4Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PattayaLesson4Content />
    </Suspense>
  );
}
