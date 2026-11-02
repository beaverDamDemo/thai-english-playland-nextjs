'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  recordAnswer,
  resetStreak,
  reportPerfectLesson,
} from '@/app/_lib/client/quizStreak';
import { pingLessonOpen, saveProgressDelta } from '@/app/_lib/client/progress';
import GameStatsFooter from '@/app/_components/GameStatsFooter';
import styles from './Lesson1.module.css';
import MazeHeader from '../../maze/_components/MazeHeader';
import Quiz, { type Challenge } from './Quiz';

type Phase = 'play' | 'done';

const BOARD_SIZE = 6;
const TARGET_SCORE = 500; // points needed to finish the level
const MIN_CORRECT = 3; // correct answers needed to finish the level
const START_MOVES = 10;
const MOVES_PER_CORRECT = 2;
const STREAK_BONUS_EVERY = 3; // every Nth correct answer in a row gives +1 move

function streakMultiplier(streak: number): number {
  if (streak >= 6) return 3;
  if (streak >= 3) return 2;
  return 1;
}
const CANDIES = ['🍒', '🍋', '🍇', '🍉', '🍍', '🥥'];

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

const QUESTIONS: Challenge[] = [...practiceChallenges, ...applyChallenges];

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
  let chains = 0;

  while (true) {
    const matches = detectMatches(board);
    if (matches.size === 0) return { board, cleared: totalCleared, chains };

    chains += 1;
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

function PattayaLesson1PageContent() {
  const [phase, setPhase] = useState<Phase>('play');
  const [qIndex, setQIndex] = useState(0);
  const [feedbackIcon, setFeedbackIcon] = useState<'✓' | '✗' | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [learningCorrect, setLearningCorrect] = useState(0);
  const [learningWrong, setLearningWrong] = useState(0);
  const [streak, setStreak] = useState(0);
  const [stars, setStars] = useState(0);

  const [board, setBoard] = useState<string[][]>(() => makeBoard());
  const [selectedTile, setSelectedTile] = useState<[number, number] | null>(
    null,
  );
  const [movesLeft, setMovesLeft] = useState(START_MOVES);
  const [playPoints, setPlayPoints] = useState(0);
  const [playActionText, setPlayActionText] = useState(
    'Match 3+ candies to earn points!',
  );
  const [animatingTiles, setAnimatingTiles] = useState<Set<string>>(new Set());
  const [cascadingTiles, setCascadingTiles] = useState<Set<string>>(new Set());
  const [swappingTiles, setSwappingTiles] = useState<Set<string>>(new Set());

  const multiplier = streakMultiplier(streak);
  const progressPercent = Math.min(
    100,
    Math.round((playPoints / TARGET_SCORE) * 100),
  );

  function persistProgress(points: number) {
    void saveProgressDelta('pattaya', {
      correct_answers: learningCorrect,
      wrong_answers: learningWrong,
      quiz_attempts: learningCorrect + learningWrong,
      total_moves_earned: Math.max(1, Math.floor(points / 120)),
      unlocked_lessons: 2,
    });
  }

  useEffect(() => {
    resetStreak();
    pingLessonOpen('pattaya');
  }, []);

  // Finish the level once the score goal and the minimum correct answers are met
  useEffect(() => {
    if (phase !== 'play') return;
    if (playPoints < TARGET_SCORE || learningCorrect < MIN_CORRECT) return;
    if (
      animatingTiles.size > 0 ||
      cascadingTiles.size > 0 ||
      swappingTiles.size > 0
    )
      return;

    const id = window.setTimeout(() => {
      setStars(learningWrong <= 1 ? 3 : learningWrong <= 4 ? 2 : 1);
      persistProgress(playPoints);
      if (learningWrong === 0) reportPerfectLesson();
      setPhase('done');
    }, 600);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    phase,
    playPoints,
    learningCorrect,
    animatingTiles,
    cascadingTiles,
    swappingTiles,
  ]);

  function handleChallengeAnswer(challenge: Challenge, pickedIndex: number) {
    if (selectedIndex !== null) return;
    const isCorrect = pickedIndex === challenge.answer;
    recordAnswer(isCorrect);

    if (isCorrect) {
      const nextStreak = streak + 1;
      const bonus = nextStreak % STREAK_BONUS_EVERY === 0 ? 1 : 0;
      const earned = MOVES_PER_CORRECT + bonus;
      setLearningCorrect((v) => v + 1);
      setStreak(nextStreak);
      setMovesLeft((v) => v + earned);
      setPlayActionText(
        `Correct! +${earned} moves${bonus ? ' (streak bonus!)' : ''}`,
      );
    } else {
      setLearningWrong((v) => v + 1);
      setStreak(0);
      setMovesLeft((v) => Math.max(0, v - 1));
      setPlayActionText('Wrong answer: -1 move and your streak is reset.');
    }
    setFeedbackIcon(isCorrect ? '✓' : '✗');
    setSelectedIndex(pickedIndex);

    window.setTimeout(
      () => {
        setFeedbackIcon(null);
        setSelectedIndex(null);
        setQIndex((v) => v + 1);
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
    setMovesLeft((v) => Math.max(0, v - 1));
    setSwappingTiles(new Set([`${fr}-${fc}`, `${tr}-${tc}`]));
    setPlayActionText('Swapping...');

    window.setTimeout(() => {
      // Step 2: swap animation done — start match flash
      setSwappingTiles(new Set());

      const resolved = clearAutoMatches(draft);
      const needsReshuffle = !hasAvailableMove(resolved.board);
      const boardAfterResolve = needsReshuffle ? makeBoard() : resolved.board;
      const chainBonus = Math.max(0, resolved.chains - 1) * 25;
      const gained = resolved.cleared * 10 * multiplier + chainBonus;

      setAnimatingTiles(found);
      setPlayActionText(`Matched ${found.size} candies!`);

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
        setPlayPoints((v) => v + gained);
        const extras = [
          multiplier > 1 ? `x${multiplier} streak` : '',
          resolved.chains > 1 ? `${resolved.chains}x chain!` : '',
          needsReshuffle ? 'board reshuffled' : '',
        ].filter(Boolean);
        setPlayActionText(
          `+${gained} points${extras.length ? ` (${extras.join(', ')})` : ''}`,
        );
        setCascadingTiles(new Set());
        setSelectedTile(null);
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

  const currentQuestion = QUESTIONS[qIndex % QUESTIONS.length];
  const totalSessionScore = learningCorrect * 100 + playPoints;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <MazeHeader score={0} backHref="/games/pattaya-games" game="pattaya" />

        <section className={styles.panel}>
          <div className={styles.progress}>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {phase === 'play' && (
            <>
              <div className={styles.goalBar}>
                <span className={styles.goalChip} title="Score goal">
                  ⭐ {Math.min(playPoints, TARGET_SCORE)}/{TARGET_SCORE}
                </span>
                <span className={styles.goalChip} title="Correct answers needed">
                  ✅ {Math.min(learningCorrect, MIN_CORRECT)}/{MIN_CORRECT}
                </span>
                <span className={styles.goalChipBad} title="Wrong answers">
                  ❌ {learningWrong}
                </span>
                <span
                  className={`${styles.goalChip} ${movesLeft <= 2 ? styles.goalChipWarn : ''}`}
                  title="Moves left"
                >
                  👆 {movesLeft}
                </span>
                <span
                  className={`${styles.goalChip} ${multiplier > 1 ? styles.goalChipHot : ''}`}
                  title="Answer streak and score multiplier"
                >
                  🔥 {streak} · x{multiplier}
                </span>
              </div>

              <div className={styles.playGrid}>
                <article className={styles.card}>
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
                              disabled={
                                movesLeft === 0 ||
                                isMatched ||
                                isCascading ||
                                isSwapping
                              }
                            >
                              {tile}
                            </button>
                          );
                        }),
                      )}
                    </div>
                    <p className={styles.swapHint}>
                      {movesLeft === 0
                        ? 'Out of moves! Answer a question to get more.'
                        : playActionText}
                    </p>
                  </div>
                </article>

                <div className={styles.questionCard}>
                  <p className={styles.questionHint}>
                    Answer correctly: +{MOVES_PER_CORRECT} moves. Every{' '}
                    {STREAK_BONUS_EVERY} in a row: +1 move and a higher score
                    multiplier.
                  </p>
                  <Quiz
                    challenge={currentQuestion}
                    step={qIndex}
                    selectedIndex={selectedIndex}
                    feedbackIcon={feedbackIcon}
                    onAnswer={handleChallengeAnswer}
                  />
                </div>
              </div>
            </>
          )}

          {phase === 'done' && (
            <article className={styles.card}>
              <span className={styles.phaseBadge}>COMPLETE</span>
              <h2 className={styles.prompt}>Lesson 1 Complete</h2>
              <p className={styles.stars}>
                {'⭐'.repeat(stars)}
                {'☆'.repeat(3 - stars)}
              </p>
              <p className={styles.help}>
                Correct answers: {learningCorrect} · Wrong: {learningWrong}
              </p>
              <p className={styles.help}>Play points: {playPoints}</p>
              <p className={styles.help}>Total score: {totalSessionScore}</p>
              <p className={styles.unlockBanner}>🔓 Lesson 2 unlocked!</p>
              <div className={styles.footerButtons}>
                <Link href="/games/pattaya-games" className={styles.footerLink}>
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

export default function PattayaLesson1Page() {
  return (
    <>
      <PattayaLesson1PageContent />
      <GameStatsFooter game="pattaya" totalLessons={8} />
    </>
  );
}
