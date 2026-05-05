'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  recordAnswer,
  resetStreak,
  reportPerfectLesson,
} from '@/app/_lib/client/quizStreak';
import styles from './Lesson1.module.css';
import MazeHeader from '../../maze/_components/MazeHeader';
import Quiz, { type Challenge } from './Quiz';

type Phase = 'practice' | 'play' | 'apply' | 'done';

const BOARD_SIZE = 6;
const CANDIES = ['🍒', '🍋', '🍇', '🍉', '🍍', '🥥'];
const LESSONS_TOTAL = 8;
const LESSONS_MIN_PASS = 3;

const practiceChallenges: Challenge[] = [
  {
    prompt: 'She is _______ to music right now.',
    options: ['listen', 'listens', 'listening', 'listened'],
    answer: 2,
  },
  {
    prompt: 'I want _______ a movie tonight.',
    options: ['watching', 'watch', 'watches', 'to watching'],
    answer: 1,
  },
  {
    prompt: 'They enjoy _______ on the beach.',
    options: ['walk', 'walked', 'to walk', 'walking'],
    answer: 3,
  },
  {
    prompt: 'He seems _______ today.',
    options: ['tiring', 'tire', 'tired', 'to tiring'],
    answer: 2,
  },
  {
    prompt: 'We are _______ for the bus.',
    options: ['wait', 'waited', 'waits', 'waiting'],
    answer: 3,
  },
];

const applyChallenges: Challenge[] = [
  {
    prompt: 'I need _______ my English skills. (It is necessary for me.)',
    options: ['improving', 'improve', 'improved', 'to improving'],
    answer: 1,
  },
  {
    prompt: 'She avoided _______ to him after the argument.',
    options: ['talk', 'to talk', 'talked', 'talking'],
    answer: 3,
  },
  {
    prompt: 'He decided _______ a new job.',
    options: ['finding', 'find', 'to find', 'finded'],
    answer: 2,
  },
  {
    prompt: 'Look! The children are _______ in the park.',
    options: ['play', 'played', 'plays', 'playing'],
    answer: 3,
  },
  {
    prompt: 'My hobby is _______ old maps.',
    options: ['collect', 'to collect', 'collecting', 'collected'],
    answer: 2,
  },
];

function randomCandy() {
  return CANDIES[Math.floor(Math.random() * CANDIES.length)];
}

function hasAvailableMove(board: string[][]) {
  for (let r = 0; r < BOARD_SIZE; r += 1) {
    for (let c = 0; c < BOARD_SIZE; c += 1) {
      const candidates: Array<[number, number]> = [];
      if (r + 1 < BOARD_SIZE) candidates.push([r + 1, c]);
      if (c + 1 < BOARD_SIZE) candidates.push([r, c + 1]);

      for (const [nr, nc] of candidates) {
        const draft = cloneBoard(board);
        const temp = draft[r][c];
        draft[r][c] = draft[nr][nc];
        draft[nr][nc] = temp;
        if (detectMatches(draft).size > 0) {
          return true;
        }
      }
    }
  }

  return false;
}

function makeBoard() {
  // Keep trying until we get a clean board with at least one valid move.
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const board: string[][] = Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, () => randomCandy()),
    );
    const cleaned = clearAutoMatches(board).board;
    if (hasAvailableMove(cleaned)) {
      return cleaned;
    }
  }

  // Fallback safety path.
  return clearAutoMatches(
    Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, () => randomCandy()),
    ),
  ).board;
}

function cloneBoard(board: string[][]) {
  return board.map((row) => [...row]);
}

function areAdjacent(a: [number, number], b: [number, number]) {
  const dr = Math.abs(a[0] - b[0]);
  const dc = Math.abs(a[1] - b[1]);
  return dr + dc === 1;
}

function detectMatches(board: string[][]): Set<string> {
  const matched = new Set<string>();

  for (let r = 0; r < BOARD_SIZE; r += 1) {
    let c = 0;
    while (c < BOARD_SIZE) {
      const value = board[r][c];
      let end = c + 1;
      while (end < BOARD_SIZE && board[r][end] === value) end += 1;
      if (value && end - c >= 3) {
        for (let k = c; k < end; k += 1) matched.add(`${r}-${k}`);
      }
      c = end;
    }
  }

  for (let c = 0; c < BOARD_SIZE; c += 1) {
    let r = 0;
    while (r < BOARD_SIZE) {
      const value = board[r][c];
      let end = r + 1;
      while (end < BOARD_SIZE && board[end][c] === value) end += 1;
      if (value && end - r >= 3) {
        for (let k = r; k < end; k += 1) matched.add(`${k}-${c}`);
      }
      r = end;
    }
  }

  return matched;
}

function clearAutoMatches(input: string[][]) {
  const board = cloneBoard(input);
  let totalCleared = 0;

  while (true) {
    const matches = detectMatches(board);
    if (matches.size === 0) return { board, cleared: totalCleared };

    totalCleared += matches.size;
    matches.forEach((key) => {
      const [r, c] = key.split('-').map(Number);
      board[r][c] = '';
    });

    for (let c = 0; c < BOARD_SIZE; c += 1) {
      const column: string[] = [];
      for (let r = BOARD_SIZE - 1; r >= 0; r -= 1) {
        if (board[r][c]) column.push(board[r][c]);
      }

      for (let r = BOARD_SIZE - 1, idx = 0; r >= 0; r -= 1, idx += 1) {
        board[r][c] = idx < column.length ? column[idx] : randomCandy();
      }
    }
  }
}

export default function PattayaLesson1Page() {
  const [phase, setPhase] = useState<Phase>('practice');
  const [practiceStep, setPracticeStep] = useState(0);
  const [applyStep, setApplyStep] = useState(0);
  const [feedbackIcon, setFeedbackIcon] = useState<'✓' | '✗' | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [attemptRecorded, setAttemptRecorded] = useState(false);

  const [learningCorrect, setLearningCorrect] = useState(0);
  const [learningWrong, setLearningWrong] = useState(0);

  const [board, setBoard] = useState<string[][]>(() => makeBoard());
  const [selectedTile, setSelectedTile] = useState<[number, number] | null>(
    null,
  );
  const [movesLeft, setMovesLeft] = useState(8);
  const [playPoints, setPlayPoints] = useState(0);
  const [playActionText, setPlayActionText] = useState(
    'Match 3+ candies to earn points!',
  );
  const [animatingTiles, setAnimatingTiles] = useState<Set<string>>(new Set());
  const [cascadingTiles, setCascadingTiles] = useState<Set<string>>(new Set());
  const [swappingTiles, setSwappingTiles] = useState<Set<string>>(new Set());

  const totalLearningTasks = practiceChallenges.length + applyChallenges.length;
  const progressPercent = useMemo(() => {
    const learningUnits = practiceStep + applyStep + (phase === 'done' ? 1 : 0);
    const totalUnits = totalLearningTasks + 1 + (phase === 'done' ? 1 : 0);
    return Math.min(100, Math.round((learningUnits / totalUnits) * 100));
  }, [practiceStep, applyStep, phase, totalLearningTasks]);

  function recordAttemptIfNeeded() {
    if (attemptRecorded) return;
    setAttemptRecorded(true);
  }

  function persistProgress() {
    const earnedMoves = Math.max(1, Math.floor(playPoints / 120));
    const passed = learningCorrect >= LESSONS_MIN_PASS;

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
            ? Math.min(LESSONS_TOTAL, Math.max(prevUnlocked, 2))
            : prevUnlocked;

          return fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              game_mode: 'pattaya',
              correct_answers: (p?.correct_answers ?? 0) + learningCorrect,
              wrong_answers: (p?.wrong_answers ?? 0) + learningWrong,
              quiz_attempts:
                (p?.quiz_attempts ?? 0) + (attemptRecorded ? 1 : 1),
              total_moves_earned: (p?.total_moves_earned ?? 0) + earnedMoves,
              unlocked_lessons: nextUnlocked,
            }),
          });
        },
      )
      .catch(() => null);
  }

  useEffect(() => {
    resetStreak();
  }, []);

  function handleChallengeAnswer(challenge: Challenge, pickedIndex: number) {
    if (selectedIndex !== null) return;
    const isCorrect = pickedIndex === challenge.answer;
    recordAnswer(isCorrect);
    recordAttemptIfNeeded();
    if (isCorrect) {
      setLearningCorrect((v) => v + 1);
    } else {
      setLearningWrong((v) => v + 1);
    }
    setFeedbackIcon(isCorrect ? '✓' : '✗');
    setSelectedIndex(pickedIndex);

    window.setTimeout(
      () => {
        setFeedbackIcon(null);
        setSelectedIndex(null);
        if (phase === 'practice') {
          const next = practiceStep + 1;
          if (next >= practiceChallenges.length) {
            setPhase('play');
            return;
          }
          setPracticeStep(next);
          return;
        }

        if (phase === 'apply') {
          const next = applyStep + 1;
          if (next >= applyChallenges.length) {
            persistProgress();
            if (
              learningCorrect ===
              practiceChallenges.length + applyChallenges.length
            ) {
              reportPerfectLesson();
            }
            setPhase('done');
            return;
          }
          setApplyStep(next);
        }
      },
      isCorrect ? 300 : 800,
    );
  }

  function attemptSwap(from: [number, number], to: [number, number]) {
    if (
      !areAdjacent(from, to) ||
      movesLeft <= 0 ||
      animatingTiles.size > 0 ||
      cascadingTiles.size > 0 ||
      swappingTiles.size > 0
    ) {
      setPlayActionText('Pick neighboring candies only.');
      return;
    }

    const draft = cloneBoard(board);
    const [fr, fc] = from;
    const [tr, tc] = to;
    const temp = draft[fr][fc];
    draft[fr][fc] = draft[tr][tc];
    draft[tr][tc] = temp;

    const found = detectMatches(draft);
    if (found.size === 0) {
      setPlayActionText('No match from that move. Try a different swap.');
      setSelectedTile(null);
      return;
    }

    // Step 1: commit swap to board and show swap animation
    setBoard(draft);
    setSwappingTiles(new Set([`${fr}-${fc}`, `${tr}-${tc}`]));
    setPlayActionText('Swapping...');

    window.setTimeout(() => {
      // Step 2: swap animation done — start match flash
      setSwappingTiles(new Set());

      const resolved = clearAutoMatches(draft);
      const needsReshuffle = !hasAvailableMove(resolved.board);
      const boardAfterResolve = needsReshuffle ? makeBoard() : resolved.board;
      const gained = resolved.cleared * 10;
      const nextMoves = movesLeft - 1;

      setAnimatingTiles(found);
      setPlayActionText(`Matched ${found.size} blocks!`);

      // Animate matched tiles then cascade
      window.setTimeout(() => {
        setBoard(boardAfterResolve);
        const cascading = new Set<string>();
        for (let c = 0; c < BOARD_SIZE; c += 1) {
          for (let r = BOARD_SIZE - 1; r >= 0; r -= 1) {
            if (boardAfterResolve[r][c]) {
              cascading.add(`${r}-${c}`);
            }
          }
        }
        setCascadingTiles(cascading);
        setAnimatingTiles(new Set());
      }, 620);

      window.setTimeout(() => {
        setMovesLeft(nextMoves);
        setPlayPoints((v) => v + gained);
        setPlayActionText(
          needsReshuffle
            ? `Great! +${gained} points. ${nextMoves} moves left. Board reshuffled.`
            : `Great! +${gained} points. ${nextMoves} moves left.`,
        );
        setCascadingTiles(new Set());
        setSelectedTile(null);

        if (nextMoves === 0) {
          window.setTimeout(() => {
            setPhase('apply');
          }, 450);
        }
      }, 920);
    }, 280);
  }

  function onTileClick(r: number, c: number) {
    if (phase !== 'play') return;
    if (
      animatingTiles.size > 0 ||
      cascadingTiles.size > 0 ||
      swappingTiles.size > 0
    )
      return;
    if (!selectedTile) {
      setSelectedTile([r, c]);
      setPlayActionText('Select a second tile to swap.');
      return;
    }
    attemptSwap(selectedTile, [r, c]);
  }

  const currentPractice = practiceChallenges[practiceStep];
  const currentApply = applyChallenges[applyStep];
  const totalSessionScore = learningCorrect * 100 + playPoints;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <MazeHeader score={0} backHref="/pattaya-games" />

        <section className={styles.panel}>
          <div className={styles.progress}>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {phase === 'practice' && (
            <Quiz
              challenge={currentPractice}
              step={practiceStep}
              total={practiceChallenges.length}
              selectedIndex={selectedIndex}
              feedbackIcon={feedbackIcon}
              onAnswer={handleChallengeAnswer}
            />
          )}

          {phase === 'play' && (
            <article className={styles.card}>
              <span className={styles.phaseBadge}>PLAY</span>
              <h2 className={styles.prompt}>
                Match 3+ candies in 8 moves ({movesLeft} moves left)
              </h2>
              <div className={styles.boardWrap}>
                <div className={styles.board}>
                  {board.map((row, r) =>
                    row.map((tile, c) => {
                      const isSelected =
                        selectedTile?.[0] === r && selectedTile?.[1] === c;
                      const tileKey = `${r}-${c}`;
                      const isMatched = animatingTiles.has(tileKey);
                      const isCascading = cascadingTiles.has(tileKey);
                      const isSwapping = swappingTiles.has(tileKey);
                      return (
                        <button
                          key={tileKey}
                          type="button"
                          className={`${styles.tile} ${
                            isSelected ? styles.selectedTile : ''
                          } ${isMatched ? styles.tileMatched : ''} ${
                            isCascading ? styles.tileCascade : ''
                          } ${isSwapping ? styles.tileSwap : ''}`}
                          onClick={() => onTileClick(r, c)}
                          disabled={isMatched || isCascading || isSwapping}
                        >
                          {tile}
                        </button>
                      );
                    }),
                  )}
                </div>
                <p className={styles.swapHint}>{playActionText}</p>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setBoard(makeBoard());
                    setSelectedTile(null);
                    setPlayActionText('Board refreshed. Keep matching.');
                  }}
                  disabled={movesLeft === 0}
                >
                  Shuffle Board
                </button>
              </div>
            </article>
          )}

          {phase === 'apply' && (
            <Quiz
              challenge={currentApply}
              step={applyStep}
              total={applyChallenges.length}
              selectedIndex={selectedIndex}
              feedbackIcon={feedbackIcon}
              onAnswer={handleChallengeAnswer}
            />
          )}

          {phase === 'done' && (
            <article className={styles.card}>
              <span className={styles.phaseBadge}>COMPLETE</span>
              <h2 className={styles.prompt}>Lesson 1 Complete</h2>
              <p className={styles.help}>
                Learning accuracy: {learningCorrect}/
                {practiceChallenges.length + applyChallenges.length}
              </p>
              <p className={styles.help}>Play points: {playPoints}</p>
              <p className={styles.help}>Total score: {totalSessionScore}</p>
              <div className={styles.footerButtons}>
                <Link href="/pattaya-games" className={styles.footerLink}>
                  <Image
                    src="/assets/tinified/back.png"
                    alt="Return to Map"
                    width={28}
                    height={28}
                  />
                  Return
                </Link>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => window.location.reload()}
                >
                  Replay Lesson
                </button>
              </div>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
