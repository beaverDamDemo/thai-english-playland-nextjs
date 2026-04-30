'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Lesson3.module.css';
import MazeHeader from '../../maze/_components/MazeHeader';
import Quiz, { type VerbEntry, type QuizQuestion } from './Quiz';

const LESSONS_TOTAL = 8;
const ROUND_SIZE = 4;

const VERBS: VerbEntry[] = [
  {
    base: 'Bring',
    past: 'Brought',
    participle: 'Brought',
    distractors: ['Brang', 'Bringed', 'Brung', 'Broughten'],
  },
  {
    base: 'Buy',
    past: 'Bought',
    participle: 'Bought',
    distractors: ['Buyed', 'Buied', 'Boughten', 'Bayed'],
  },
  {
    base: 'Come',
    past: 'Came',
    participle: 'Come',
    distractors: ['Comed', 'Camed', 'Comen', 'Cumen'],
  },
  {
    base: 'Drink',
    past: 'Drank',
    participle: 'Drunk',
    distractors: ['Drinked', 'Dranken', 'Drinken', 'Dronk'],
  },
  {
    base: 'Give',
    past: 'Gave',
    participle: 'Given',
    distractors: ['Gived', 'Gaven', 'Givven', 'Gaved'],
  },
  {
    base: 'Go',
    past: 'Went',
    participle: 'Gone',
    distractors: ['Goed', 'Wented', 'Goned', 'Wenten'],
  },
  {
    base: 'Make',
    past: 'Made',
    participle: 'Made',
    distractors: ['Maked', 'Maden', 'Mayed', 'Mode'],
  },
  {
    base: 'Run',
    past: 'Ran',
    participle: 'Run',
    distractors: ['Runned', 'Rann', 'Ren', 'Runed'],
  },
  {
    base: 'Say',
    past: 'Said',
    participle: 'Said',
    distractors: ['Sayed', 'Sayd', 'Saided', 'Sed'],
  },
  {
    base: 'Sleep',
    past: 'Slept',
    participle: 'Slept',
    distractors: ['Sleeped', 'Slepted', 'Slep', 'Sleepen'],
  },
  {
    base: 'Take',
    past: 'Took',
    participle: 'Taken',
    distractors: ['Taked', 'Tooken', 'Tooked', 'Taen'],
  },
  {
    base: 'Think',
    past: 'Thought',
    participle: 'Thought',
    distractors: ['Thinked', 'Thunk', 'Thoughten', 'Thinken'],
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

function makeDisractors(verb: VerbEntry, correct: string): string[] {
  const lowerCorrect = correct.toLowerCase();
  const pool: string[] = [];

  // The other form (past vs participle) is a strong, realistic distractor
  // when it differs from the correct answer.
  const otherForm = correct === verb.past ? verb.participle : verb.past;
  if (otherForm.toLowerCase() !== lowerCorrect) {
    pool.push(otherForm);
  }

  // Per-verb hand-crafted plausible wrong forms (regularized, alt vowels, etc.).
  if (verb.distractors) {
    for (const d of verb.distractors) {
      if (d.toLowerCase() !== lowerCorrect && !pool.includes(d)) {
        pool.push(d);
      }
    }
  }

  // Shuffle and take 3. If we somehow have fewer than 3 candidates, fall
  // back to past/participle forms from other verbs.
  const picked = shuffle(pool).slice(0, 3);
  if (picked.length < 3) {
    const fallback = VERBS.flatMap((v) => [v.past, v.participle]).filter(
      (w) =>
        w.toLowerCase() !== lowerCorrect &&
        !picked.some((p) => p.toLowerCase() === w.toLowerCase()),
    );
    for (const w of shuffle(fallback)) {
      if (picked.length >= 3) break;
      picked.push(w);
    }
  }
  return picked;
}

function buildRound(): QuizQuestion[] {
  const selected = shuffle(VERBS).slice(0, ROUND_SIZE);
  return selected.map((verb) => {
    const askPast = Math.random() < 0.5;
    const correct = askPast ? verb.past : verb.participle;
    const distractors = makeDisractors(verb, correct);
    const options = shuffle([correct, ...distractors]);
    return { verb, askPast, correctAnswer: correct, options };
  });
}

type Phase = 'quiz' | 'shoot' | 'done';

// Ballistics constants
const MV = 600; // muzzle velocity m/s
const G = 9.81; // gravity m/s²
const DRAG = 0.08; // drag coefficient s⁻¹ (intentionally high for visible effect)
const MIN_DIST = 800; // metres
const MAX_DIST = 1800; // metres

// Arena layout (% of arena height)
const HORIZON_PCT = 48; // where the ground meets sky visually
const GROUND_PCT = 65; // where the tank tracks sit at minimum distance

// Tank apparent width at reference distance (% of arena width)
const TANK_W_REF = 8; // % at 800 m
const DIST_REF = 800;

function tankWidthPct(dist: number) {
  return (TANK_W_REF * DIST_REF) / dist;
}

// ── Single source of truth for tank geometry ──
// X values are in % of arena WIDTH (matches tankX, mouseX).
// Y values are in % of arena HEIGHT (matches mouseY, shell sy, GROUND_PCT).
//
// The tank's SVG has aspect ratio 160:80 = 2:1, so rendered height in pixels
// = rendered width in pixels × 0.5. To convert that to % of arena HEIGHT we
// need the arena's aspect ratio (width/height). Pass it in via `arenaAspect`.
//
// Inside the SVG, the last 4/80 = 0.05 of height is empty space below the tracks,
// so the tracks (visual ground contact) sit at GROUND_PCT, and the SVG's visual
// bottom edge sits trackGap% (in arena-height units) below that.
function getTankBounds(tankX: number, tankDist: number, arenaAspect: number) {
  const width = tankWidthPct(tankDist); // % of arena width
  // Convert visual height from %-of-arena-width → %-of-arena-height
  const height = width * 0.5 * arenaAspect;
  const trackGap = width * 0.025 * arenaAspect;
  const bottom = GROUND_PCT + trackGap; // bottom edge of tank div from top of arena (%-of-height)
  const top = bottom - height;
  const left = tankX - width / 2;
  const right = tankX + width / 2;
  return {
    left,
    right,
    top,
    bottom,
    centerX: tankX,
    centerY: (top + bottom) / 2,
    width,
    height,
  };
}

// The tank sits on the ground. Further tanks appear closer to the horizon.
function tankYPct(dist: number) {
  // linear interpolation: 800m → GROUND_PCT, 1800m → HORIZON_PCT+2
  const t = (dist - MIN_DIST) / (MAX_DIST - MIN_DIST);
  return GROUND_PCT - t * (GROUND_PCT - HORIZON_PCT - 2);
}

// Shell always fires flat — elevation compensation is done visually via the ruler marks.
// The user places the correct range mark on the target; the crosshair fires horizontally.
function aimAngle(): number {
  return 0;
}

type Shell = {
  id: number;
  // world-space launch state
  dist: number; // range to target in metres
  v0x: number; // horizontal speed m/s
  v0y: number; // vertical speed m/s (up = positive)
  t: number; // elapsed time seconds
  // screen-space start (for rendering)
  startXPct: number;
  startYPct: number;
  // current screen pos
  screenX: number;
  screenY: number;
  hit: boolean | null; // null = in flight
  tankXAtFire: number; // tank X% when fired
  tankDist: number; // tank distance when fired
  opacity: number; // for fading out when flying over wall
  fadingOverWall: boolean; // true when shell is flying over wall and fading
};

type HitEffect = { id: number; x: number; y: number };

export default function PattayaLesson3Page() {
  const [phase, setPhase] = useState<Phase>('quiz');

  const [round, setRound] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const [roundsDone, setRoundsDone] = useState(0);
  const [shotsEarned, setShotsEarned] = useState(0);

  // Generate round client-side only to avoid hydration mismatch
  // (buildRound uses Math.random which would differ between server and client)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRound(buildRound());
  }, []);

  const [shotsLeft, setShotsLeft] = useState(0);
  const [mouseX, setMouseX] = useState(50);
  const [mouseY, setMouseY] = useState(50);
  const [tankX, setTankX] = useState(20); // % across arena
  const [tankDir, setTankDir] = useState(1);
  const [tankDistDisplay, setTankDistDisplay] = useState(MIN_DIST);
  const tankDirRef = useRef(1);
  const tankXRef = useRef(20);
  const tankDistRef = useRef(MIN_DIST);
  const [tankHits, setTankHits] = useState(0);
  const [shells, setShells] = useState<Shell[]>([]);
  const shellsRef = useRef<Shell[]>([]);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  const [impactFlashes, setImpactFlashes] = useState<
    { id: number; x: number; y: number; type: 'tank' | 'wall' | 'ground' }[]
  >([]);
  const [tankFlash, setTankFlash] = useState(false);
  const [firing, setFiring] = useState(false);
  const [muzzleSmoke, setMuzzleSmoke] = useState(false);
  const shellIdRef = useRef(0);
  const hitIdRef = useRef(0);
  const arenaRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const mouseXRef = useRef(50);
  const mouseYRef = useRef(50);
  // Arena aspect ratio (width / height) — needed for tank height calculations
  const arenaAspectRef = useRef(2.375);

  useEffect(() => {
    const updateAspect = () => {
      const el = arenaRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.height > 0) {
        arenaAspectRef.current = rect.width / rect.height;
      }
    };
    updateAspect();
    window.addEventListener('resize', updateAspect);
    return () => window.removeEventListener('resize', updateAspect);
  }, []);

  const [savedProgress, setSavedProgress] = useState(false);

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
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    setMouseX(mx);
    setMouseY(my);
    mouseXRef.current = mx;
    mouseYRef.current = my;
  }, []);

  // Main animation loop: moves tank + advances shells
  useEffect(() => {
    if (phase !== 'shoot') return;

    // Randomize tank distance once on first shoot session
    if (tankDistRef.current === MIN_DIST) {
      tankDistRef.current = MIN_DIST + Math.random() * (MAX_DIST - MIN_DIST);
      setTankDistDisplay(tankDistRef.current);
    }

    // Tank lateral speed in % of arena width per second
    const TANK_PCT_SPEED = 1.2; // % per second

    function tick(time: number) {
      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const dt = Math.min(time - lastTimeRef.current, 100) / 1000; // seconds
      lastTimeRef.current = time;

      // ── Move tank ──
      let nx = tankXRef.current + TANK_PCT_SPEED * dt * tankDirRef.current;
      let dir = tankDirRef.current;
      if (nx > 88) {
        nx = 88;
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

      // Debug info (positions are computed at render time via getTankBounds)

      // ── Advance shells ──
      const nextShells = shellsRef.current
        .map((s): Shell => {
          if (s.hit !== null) return s; // already resolved
          const t2 = s.t + dt;

          // ── World-space ballistics with drag ──
          // Horizontal: v_x(t) = v0x·e^(-k·t)  →  x(t) = v0x/k · (1 - e^(-k·t))
          const ekt = Math.exp(-DRAG * t2);
          const worldX = (s.v0x / DRAG) * (1 - ekt);

          // ── Screen X: shell travels straight — no horizontal drift on screen ──
          const sx = s.startXPct;

          // ── Screen Y: always falls downward from aim point ──
          // Treat v0y=0 for screen: shell starts at crosshair and only drops due to gravity+drag.
          // y(t) = (g/k)/k · (1 - e^(-k·t)) - g·t/k  [with v0y=0, simplifies to pure drop]
          const M_PER_PCT = 1.5; // 1% screen height = 1.5 m — exaggerated for clear visibility
          const gravDrop = (G / DRAG / DRAG) * (1 - ekt) - (G * t2) / DRAG; // always negative (downward)
          const sy = s.startYPct + -gravDrop / M_PER_PCT; // -gravDrop is positive → increases Y → falls down

          // Impact detection: shell reached or passed the target distance
          if (worldX >= s.dist) {
            // ── Use getTankBounds as single source of truth ──
            // Both bounds and sy are in % from TOP of arena (0=top, 100=bottom).
            const bounds = getTankBounds(
              s.tankXAtFire,
              s.tankDist,
              arenaAspectRef.current,
            );
            const lateralMissPct = Math.abs(s.tankXAtFire - s.startXPct);
            const isHit =
              sy >= bounds.top &&
              sy <= bounds.bottom &&
              lateralMissPct < bounds.width / 2;

            console.log('[HIT?]', {
              dist: s.dist.toFixed(1),
              sy: sy.toFixed(2),
              tankTop: bounds.top.toFixed(2),
              tankBot: bounds.bottom.toFixed(2),
              tankLeft: bounds.left.toFixed(2),
              tankRight: bounds.right.toFixed(2),
              shellX: s.startXPct.toFixed(2),
              lateralMiss: lateralMissPct.toFixed(2),
              lateralThreshold: (bounds.width / 2).toFixed(2),
              isHit,
            });

            const spawnFlash = (
              x: number,
              y: number,
              type: 'tank' | 'wall' | 'ground',
            ) => {
              const fid = hitIdRef.current++;
              setImpactFlashes((prev) => [...prev, { id: fid, x, y, type }]);
              window.setTimeout(
                () =>
                  setImpactFlashes((prev) => prev.filter((f) => f.id !== fid)),
                800,
              );
            };

            if (isHit) {
              setTankHits((v) => v + 1);
              const hid = hitIdRef.current++;
              setHitEffects((prev) => [
                ...prev,
                { id: hid, x: tankXRef.current, y: GROUND_PCT - 5 },
              ]);
              window.setTimeout(
                () => setHitEffects((prev) => prev.filter((h) => h.id !== hid)),
                900,
              );
              // Tank hit flashes at shell's screen position (which landed on the tank)
              spawnFlash(sx, sy, 'tank');
              spawnFlash(sx - 1.5, sy - 2, 'tank');
              spawnFlash(sx + 1, sy + 1, 'tank');
              setTankFlash(true);
              window.setTimeout(() => setTankFlash(false), 400);
              return {
                ...s,
                t: t2,
                screenX: sx,
                screenY: sy,
                hit: isHit,
                opacity: 1,
                fadingOverWall: false,
              };
            }
            // Note: Explosion effects (spawnFlash) are only shown for tank hits, not for wall/ground misses
            // Check if shell flew over the wall (above wall top when passing target)
            const wallHeightPct = (180 / 1600) * 100; // SVG aspect ratio
            const wallTop = GROUND_PCT - wallHeightPct;
            const flewOverWall = sy < wallTop;
            return {
              ...s,
              t: t2,
              screenX: sx,
              screenY: sy,
              hit: isHit,
              opacity: flewOverWall ? 1 : 1,
              fadingOverWall: flewOverWall,
            };
          }

          // Shell still in flight - check if it's fading over wall
          if (s.fadingOverWall) {
            const newOpacity = Math.max(0, s.opacity - dt * 1.5); // fade over ~0.67 seconds
            if (newOpacity <= 0) {
              // Shell fully faded, mark as resolved (hit=false means missed)
              return {
                ...s,
                t: t2,
                screenX: sx,
                screenY: sy,
                hit: false,
                opacity: 0,
                fadingOverWall: true,
              };
            }
            return {
              ...s,
              t: t2,
              screenX: sx,
              screenY: sy,
              opacity: newOpacity,
            };
          }
          return { ...s, t: t2, screenX: sx, screenY: sy };
        })
        .filter(
          (s) =>
            s.hit === null || (s.hit !== null && s.t < s.dist / s.v0x + 0.5),
        );

      shellsRef.current = nextShells;
      setShells([...nextShells]);

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
    const arena = arenaRef.current;
    if (!arena) return;

    const my = mouseYRef.current;

    // Elevation angle from aim position
    const theta = aimAngle();
    const v0x = MV * Math.cos(theta);
    const v0y = MV * Math.sin(theta);

    const dist = tankDistRef.current;
    const id = shellIdRef.current++;

    const mx = mouseXRef.current;

    const newShell: Shell = {
      id,
      dist,
      v0x,
      v0y,
      t: 0,
      startXPct: mx, // fired from crosshair X
      startYPct: my, // fired from crosshair Y
      screenX: mx,
      screenY: my,
      hit: null,
      tankXAtFire: tankXRef.current,
      tankDist: dist,
      opacity: 1,
      fadingOverWall: false,
    };

    shellsRef.current = [...shellsRef.current, newShell];
    setShells([...shellsRef.current]);

    // Muzzle blast effects
    setFiring(true);
    setMuzzleSmoke(true);
    window.setTimeout(() => setFiring(false), 120);
    window.setTimeout(() => setMuzzleSmoke(false), 600);

    setShotsLeft((v) => v - 1);

    // Auto-clean shell after it resolves (flight time + buffer)
    const flightMs = (dist / v0x) * 1000 + 600;
    window.setTimeout(() => {
      shellsRef.current = shellsRef.current.filter((s) => s.id !== id);
      setShells([...shellsRef.current]);
    }, flightMs);

    if (shotsLeft - 1 <= 0) {
      window.setTimeout(() => {
        setPhase('done');
        persistProgress(tankHits);
      }, flightMs + 200);
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
      .catch(() => null);
  }

  if (phase === 'quiz') {
    const q = round[qIndex];
    // Prevent hydration mismatch / undefined access during initial client render
    if (!q) {
      return (
        <div className={styles.page}>
          <div className={styles.container}>
            <MazeHeader score={0} backHref="/pattaya-games" />
            <div className={styles.panel}>
              <p className={styles.prompt}>Loading quiz…</p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <MazeHeader score={0} backHref="/pattaya-games" />
          <Quiz
            question={q}
            selected={selected}
            feedback={feedback}
            shotsEarned={shotsEarned}
            verbs={VERBS}
            onAnswer={handleAnswer}
            onSkipToShoot={skipToShoot}
          />
        </div>
      </div>
    );
  }

  if (phase === 'shoot') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <MazeHeader score={0} backHref="/pattaya-games" />

          <div className={styles.statsRow}>
            <span className={styles.scoreChip}>🎯 Shots: {shotsLeft}</span>
            <span className={styles.scoreChip}>💥 Hits: {tankHits}</span>
          </div>

          <div
            ref={arenaRef}
            className={styles.arena}
            onMouseMove={handleMouseMove}
            onClick={fireShot}
          >
            {/* Sky with clouds */}
            <svg
              className={styles.skySvg}
              viewBox="0 0 600 195"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2a6db5" />
                  <stop offset="100%" stopColor="#87ceeb" />
                </linearGradient>
              </defs>
              <rect width="600" height="195" fill="url(#skyGrad)" />
              {/* Cloud 1 */}
              <g opacity="0.92">
                <ellipse cx="120" cy="55" rx="48" ry="22" fill="#fff" />
                <ellipse cx="90" cy="62" rx="32" ry="18" fill="#fff" />
                <ellipse cx="150" cy="63" rx="30" ry="16" fill="#fff" />
                <ellipse cx="120" cy="68" rx="50" ry="14" fill="#f5f5f5" />
              </g>
              {/* Cloud 2 */}
              <g opacity="0.88">
                <ellipse cx="430" cy="38" rx="55" ry="20" fill="#fff" />
                <ellipse cx="400" cy="46" rx="36" ry="16" fill="#fff" />
                <ellipse cx="462" cy="47" rx="34" ry="15" fill="#fff" />
                <ellipse cx="430" cy="51" rx="58" ry="13" fill="#f0f0f0" />
              </g>
            </svg>
            <div className={styles.ground} />

            {/* Decorative wall — full width, fixed vertical position */}
            <div
              className={styles.wall}
              style={{
                left: 0,
                bottom: `${100 - tankYPct(MIN_DIST)}%`,
                width: '100%',
              }}
            >
              <svg
                viewBox="0 0 1600 180"
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                preserveAspectRatio="none"
              >
                {/* Wall background */}
                <rect x="0" y="0" width="1600" height="180" fill="#b89e7a" />
                {/* Uniform brick pattern — 18 rows × 80 cols covering full height */}
                {Array.from({ length: 18 }, (_, row) =>
                  Array.from({ length: 80 }, (_, col) => (
                    <rect
                      key={`${row}-${col}`}
                      x={col * 20 + (row % 2) * 10}
                      y={row * 10}
                      width="19"
                      height="9"
                      rx="0.5"
                      fill={row % 2 === col % 2 ? '#c4aa87' : '#a08860'}
                      stroke="#7a6848"
                      strokeWidth="0.4"
                    />
                  )),
                )}
                {/* Moss/vine accents */}
                {[80, 200, 380, 560, 740, 900, 1060, 1220, 1400, 1520].map(
                  (x, i) => (
                    <rect
                      key={i}
                      x={x}
                      y="62"
                      width="4"
                      height={18 + (i % 5) * 8}
                      rx="2"
                      fill="#4a6a30"
                      opacity="0.35"
                    />
                  ),
                )}
                <rect
                  x="0"
                  y="172"
                  width="1600"
                  height="8"
                  fill="#3a2a18"
                  opacity="0.5"
                  rx="2"
                />
              </svg>
            </div>

            <div
              className={styles.tank}
              style={{
                // NOTE: width% is relative to arena WIDTH but bottom% is relative to arena HEIGHT.
                // We use `left` + `bottom` (not `top`+`height`) so the SVG auto-sizes to its
                // natural aspect ratio (160×80) using the width. This keeps the tank sitting
                // exactly on the grass line regardless of arena aspect ratio.
                left: `${tankX}%`,
                bottom: `${100 - GROUND_PCT - tankWidthPct(tankDistDisplay) * 0.025}%`,
                width: `${tankWidthPct(tankDistDisplay)}%`,
                transform: `translateX(-50%) scaleX(${tankDir === -1 ? -1 : 1})`,
              }}
            >
              {/* Tiger I SVG */}
              <svg
                viewBox="0 0 160 80"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.tankSvg}
              >
                {/* === TRACKS === */}
                <rect
                  x="4"
                  y="54"
                  width="152"
                  height="22"
                  rx="11"
                  ry="11"
                  fill="#2a2a18"
                  stroke="#444430"
                  strokeWidth="1.5"
                />
                {/* track links */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
                  <rect
                    key={i}
                    x={8 + i * 12}
                    y="55"
                    width="10"
                    height="20"
                    rx="3"
                    fill="none"
                    stroke="#555540"
                    strokeWidth="1"
                  />
                ))}
                {/* road wheels */}
                {[18, 38, 58, 78, 98, 118, 138].map((cx, i) => (
                  <g key={i}>
                    <circle
                      cx={cx}
                      cy="65"
                      r="9"
                      fill="#3a3a22"
                      stroke="#555540"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={cx}
                      cy="65"
                      r="4"
                      fill="#2a2a18"
                      stroke="#666650"
                      strokeWidth="1"
                    />
                    <circle cx={cx} cy="65" r="1.5" fill="#888870" />
                  </g>
                ))}
                {/* drive sprocket (front) */}
                <circle
                  cx="148"
                  cy="63"
                  r="8"
                  fill="#3a3a22"
                  stroke="#555540"
                  strokeWidth="1.5"
                />
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                  <rect
                    key={i}
                    x="145"
                    y="55"
                    width="6"
                    height="4"
                    rx="1"
                    fill="#555540"
                    transform={`rotate(${angle} 148 63)`}
                  />
                ))}
                {/* idler wheel (rear) */}
                <circle
                  cx="12"
                  cy="63"
                  r="8"
                  fill="#3a3a22"
                  stroke="#555540"
                  strokeWidth="1.5"
                />
                <circle
                  cx="12"
                  cy="63"
                  r="3.5"
                  fill="#2a2a18"
                  stroke="#666650"
                  strokeWidth="1"
                />

                {/* === HULL LOWER === */}
                <polygon
                  points="10,54 150,54 155,42 5,42"
                  fill="#4a4a2e"
                  stroke="#333322"
                  strokeWidth="1"
                />

                {/* === HULL UPPER === */}
                {/* front glacis plate */}
                <polygon
                  points="130,42 155,42 155,28 132,28"
                  fill="#565638"
                  stroke="#333322"
                  strokeWidth="1"
                />
                {/* rear plate */}
                <polygon
                  points="5,42 10,42 10,30 5,30"
                  fill="#4e4e30"
                  stroke="#333322"
                  strokeWidth="1"
                />
                {/* main hull top */}
                <rect
                  x="10"
                  y="28"
                  width="122"
                  height="14"
                  fill="#525234"
                  stroke="#333322"
                  strokeWidth="1"
                />
                {/* hull side skirts / Schürzen hints */}
                <rect
                  x="8"
                  y="44"
                  width="144"
                  height="8"
                  rx="1"
                  fill="#3e3e26"
                  stroke="#2a2a18"
                  strokeWidth="0.8"
                />

                {/* === TURRET === */}
                {/* turret base ring */}
                <rect
                  x="44"
                  y="24"
                  width="72"
                  height="4"
                  rx="2"
                  fill="#3a3a22"
                  stroke="#333322"
                  strokeWidth="0.8"
                />
                {/* turret body — boxy Tiger shape */}
                <polygon
                  points="48,6 112,6 118,10 118,28 42,28 42,10"
                  fill="#4e4e30"
                  stroke="#333322"
                  strokeWidth="1.2"
                />
                {/* turret front angled plate */}
                <polygon
                  points="112,6 118,10 118,28 112,28"
                  fill="#5a5a38"
                  stroke="#333322"
                  strokeWidth="1"
                />
                {/* turret rear */}
                <polygon
                  points="48,6 42,10 42,28 48,28"
                  fill="#464628"
                  stroke="#333322"
                  strokeWidth="1"
                />
                {/* commander's cupola */}
                <ellipse
                  cx="68"
                  cy="6"
                  rx="10"
                  ry="5"
                  fill="#424226"
                  stroke="#333322"
                  strokeWidth="1"
                />
                <ellipse
                  cx="68"
                  cy="4"
                  rx="7"
                  ry="3"
                  fill="#3a3a20"
                  stroke="#444430"
                  strokeWidth="0.8"
                />
                {/* cupola vision ports */}
                {[-4, -1, 2, 5].map((dx, i) => (
                  <rect
                    key={i}
                    x={65 + dx}
                    y="2"
                    width="2"
                    height="3"
                    rx="0.5"
                    fill="#222216"
                    stroke="#555540"
                    strokeWidth="0.5"
                  />
                ))}

                {/* === GUN (88mm KwK 36) === */}
                {/* mantlet */}
                <ellipse
                  cx="118"
                  cy="18"
                  rx="9"
                  ry="10"
                  fill="#3e3e26"
                  stroke="#2e2e1a"
                  strokeWidth="1.2"
                />
                {/* barrel — long and thin, Tiger 88mm */}
                <rect
                  x="118"
                  y="15.5"
                  width="38"
                  height="5"
                  rx="2"
                  fill="#2e2e1a"
                  stroke="#222210"
                  strokeWidth="0.8"
                />
                {/* muzzle brake */}
                <rect
                  x="154"
                  y="13"
                  width="6"
                  height="10"
                  rx="2"
                  fill="#252515"
                  stroke="#222210"
                  strokeWidth="0.8"
                />
                <line
                  x1="155"
                  y1="13"
                  x2="155"
                  y2="23"
                  stroke="#333322"
                  strokeWidth="0.6"
                />
                <line
                  x1="157"
                  y1="13"
                  x2="157"
                  y2="23"
                  stroke="#333322"
                  strokeWidth="0.6"
                />
                <line
                  x1="159"
                  y1="14"
                  x2="159"
                  y2="22"
                  stroke="#333322"
                  strokeWidth="0.6"
                />

                {/* === DETAILS === */}
                {/* exhaust / engine deck vents */}
                {[0, 1, 2].map((i) => (
                  <rect
                    key={i}
                    x={14 + i * 8}
                    y="30"
                    width="6"
                    height="3"
                    rx="1"
                    fill="#2e2e1a"
                    stroke="#444430"
                    strokeWidth="0.6"
                  />
                ))}
                {/* tow cable hooks */}
                <circle
                  cx="18"
                  cy="44"
                  r="2.5"
                  fill="none"
                  stroke="#666650"
                  strokeWidth="1.2"
                />
                <circle
                  cx="142"
                  cy="44"
                  r="2.5"
                  fill="none"
                  stroke="#666650"
                  strokeWidth="1.2"
                />
                {/* antenna mount */}
                <rect
                  x="22"
                  y="6"
                  width="2"
                  height="18"
                  rx="1"
                  fill="#5a5a38"
                  stroke="#333322"
                  strokeWidth="0.5"
                />
                {/* hull MG port */}
                <rect
                  x="128"
                  y="32"
                  width="6"
                  height="4"
                  rx="1"
                  fill="#2a2a18"
                  stroke="#444430"
                  strokeWidth="0.8"
                />
                <circle cx="131" cy="34" r="1.5" fill="#1a1a10" />

                {/* === ZIMMERIT / texture lines === */}
                {[32, 36, 40].map((y) => (
                  <line
                    key={y}
                    x1="12"
                    y1={y}
                    x2="128"
                    y2={y}
                    stroke="#3a3a24"
                    strokeWidth="0.4"
                    strokeDasharray="4,3"
                  />
                ))}
              </svg>
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

            {shells.map(
              (s) =>
                s.hit === null && (
                  <div
                    key={s.id}
                    className={styles.shellDot}
                    style={{
                      left: `${s.screenX}%`,
                      top: `${s.screenY}%`,
                      opacity: s.opacity,
                    }}
                  />
                ),
            )}

            {/* Tank hit screen flash */}
            {tankFlash && <div className={styles.tankHitFlash} />}

            {/* Impact flash effects */}
            {impactFlashes.map((f) => (
              <div
                key={f.id}
                className={styles.impactFlash}
                data-type={f.type}
                style={{ left: `${f.x}%`, top: `${f.y}%` }}
              />
            ))}

            {/* Muzzle smoke puff */}
            {muzzleSmoke && (
              <div
                className={styles.muzzleSmoke}
                style={{
                  left: `${mouseX}%`,
                  top: `${mouseY}%`,
                }}
              />
            )}

            {/* War Thunder style scope overlay — full arena, vignette + reticle */}
            <svg
              className={`${styles.scope}${firing ? ` ${styles.scopeKick}` : ''}`}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Radial gradient centred on mouse: clear → dark fog → solid black */}
                <radialGradient
                  id="scopeVignette"
                  cx={mouseX}
                  cy={mouseY}
                  r="72"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="black" stopOpacity="0" />
                  <stop offset="82%" stopColor="black" stopOpacity="0" />
                  <stop offset="92%" stopColor="black" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="black" stopOpacity="0.9" />
                </radialGradient>
              </defs>

              {/* Vignette fill over whole arena */}
              <rect
                x="0"
                y="0"
                width="100"
                height="100"
                fill="url(#scopeVignette)"
              />

              {/* ── Reticle group — coordinates in viewBox (0–100) units ── */}
              {/* Horizontal line - standard width */}
              <g stroke="#000000" strokeWidth="0.5" opacity="0.95">
                <line x1="0" y1={mouseY} x2="100" y2={mouseY} />
              </g>
              {/* Vertical line - narrower */}
              <g stroke="#000000" strokeWidth="0.25" opacity="0.95">
                <line x1={mouseX} y1="0" x2={mouseX} y2="100" />
              </g>

              {/*
                Range ladder — physically calibrated to actual ballistics:
                MV=600 m/s, DRAG=0.08 s⁻¹, M_PER_PCT=1.5
                Flat shot drop at each range (screen % below aim point):
                  800m  → ~5.3%
                  1000m → ~9.8%
                  1200m → ~14.5%
                  1400m → ~20%
                Each mark shows "aim this far above target to hit at that range"
              */}
              <g stroke="#000000" strokeWidth="0.45" opacity="0.9">
                {/* Major ticks — uniform length 4, labels all at same X */}
                {[
                  { dy: 6.26, label: '800' },
                  { dy: 9.98, label: '1000' },
                  { dy: 14.67, label: '1200' },
                  { dy: 20.38, label: '1400' },
                  { dy: 27.2, label: '1600' },
                  { dy: 35.19, label: '1800' },
                  { dy: 44.44, label: '2000' },
                  { dy: 55.04, label: '2200' },
                ].map(({ dy, label }, i) => (
                  <g key={i}>
                    <line
                      x1={mouseX + 6}
                      y1={mouseY + dy}
                      x2={mouseX + 11}
                      y2={mouseY + dy}
                    />
                    <text
                      x={mouseX + 12}
                      y={mouseY + dy + 1.0}
                      fill="#000000"
                      fontSize="2.2"
                      fontFamily="monospace"
                      fontWeight="bold"
                      strokeWidth="0"
                    >
                      {label}
                    </text>
                  </g>
                ))}

                {/* Minor ticks at 900/1100/1300/1500/1700/1900/2100m — no label */}
                {[8.0, 12.2, 17.39, 23.65, 31.04, 39.65, 49.57].map((dy, i) => (
                  <line
                    key={i}
                    x1={mouseX + 6}
                    y1={mouseY + dy}
                    x2={mouseX + 9}
                    y2={mouseY + dy}
                  />
                ))}
              </g>

              {/* Horizontal ticks on center vertical line — even 100m marks (wider, both sides) */}
              <g stroke="#000000" strokeWidth="0.45" opacity="0.9">
                {[6.26, 9.98, 14.67, 20.38, 27.2, 35.19, 44.44, 55.04].map(
                  (dy, i) => (
                    <line
                      key={i}
                      x1={mouseX - 1.2}
                      y1={mouseY + dy}
                      x2={mouseX + 1.2}
                      y2={mouseY + dy}
                    />
                  ),
                )}
              </g>
              {/* Horizontal ticks on center vertical line — odd 100m marks (narrower, both sides) */}
              <g stroke="#000000" strokeWidth="0.35" opacity="0.9">
                {[8.0, 12.2, 17.39, 23.65, 31.04, 39.65, 49.57].map((dy, i) => (
                  <line
                    key={i}
                    x1={mouseX - 1}
                    y1={mouseY + dy}
                    x2={mouseX + 1}
                    y2={mouseY + dy}
                  />
                ))}
              </g>
            </svg>

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
                tankDistRef.current = MIN_DIST; // reset so next shoot session re-randomizes
                setTankDistDisplay(MIN_DIST);
                setShells([]);
                shellsRef.current = [];
                setHitEffects([]);
                setImpactFlashes([]);
                setTankFlash(false);
                setFiring(false);
                setMuzzleSmoke(false);
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
