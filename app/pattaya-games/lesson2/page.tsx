'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import styles from './Lesson2.module.css';
import quizStyles from '../../maze/_components/QuizButtons.module.css';
import MazeHeader from '../../maze/_components/MazeHeader';
import { trackEvent } from '../../_lib/analytics';

type Phase = 'practice' | 'play' | 'apply' | 'done';

type Challenge = {
  prompt: string;
  options: string[];
  answer: number;
};

const BOARD_SIZE = 7;
const ICONS = ['🔥', '❄️', '🌬️', '🌞', '🪙', '💎', '🧃'];
const LESSONS_TOTAL = 8;
const STATS_KEY = 'englishPattayaStats';
const UNLOCKED_KEY = 'englishPattayaUnlockedLessons';
const PENDING_UNLOCK_KEY = 'englishPattayaPendingUnlockLesson';
const STATS_UPDATED_EVENT = 'pattaya-stats-updated';

const practiceChallenges: Challenge[] = [
  {
    prompt: 'Ice cream is usually _______.',
    options: ['hot', 'cold', 'high', 'cheap'],
    answer: 1,
  },
  {
    prompt: 'A mountain is very _______.',
    options: ['low', 'high', 'cool down', 'warm up'],
    answer: 1,
  },
  {
    prompt: 'Tea can be very _______ right after you make it.',
    options: ['cold', 'cheap', 'hot', 'low'],
    answer: 2,
  },
  {
    prompt: 'If the room is too warm, open the window to _______.',
    options: ['warm up', 'cool down', 'go high', 'get expensive'],
    answer: 1,
  },
  {
    prompt: 'This T-shirt is only 100 baht. It is _______.',
    options: ['expensive', 'high', 'cheap', 'cold'],
    answer: 2,
  },
];

const applyChallenges: Challenge[] = [
  {
    prompt: 'After running, I need some water to _______.',
    options: ['cool down', 'warm up', 'stay high', 'be expensive'],
    answer: 0,
  },
  {
    prompt: 'In the morning, I stretch first to _______ my body.',
    options: ['cool down', 'warm up', 'make low', 'make cheap'],
    answer: 1,
  },
  {
    prompt: 'The phone costs 30,000 baht. It is _______.',
    options: ['cheap', 'cold', 'expensive', 'low'],
    answer: 2,
  },
  {
    prompt: 'The airplane is flying very _______ in the sky.',
    options: ['cheap', 'high', 'cold', 'cool'],
    answer: 1,
  },
  {
    prompt: 'At night on the beach, the wind feels _______.',
    options: ['hot', 'expensive', 'cold', 'high'],
    answer: 2,
  },
];

function randomIcon() {
  return ICONS[Math.floor(Math.random() * ICONS.length)];
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
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const board: string[][] = Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, () => randomIcon()),
    );
    const cleaned = clearAutoMatches(board).board;
    if (hasAvailableMove(cleaned)) {
      return cleaned;
    }
  }

  return clearAutoMatches(
    Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, () => randomIcon()),
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
        board[r][c] = idx < column.length ? column[idx] : randomIcon();
      }
    }
  }
}

type PattayaStats = {
  correctAnswers: number;
  wrongAnswers: number;
  quizAttempts: number;
  totalMovesEarned: number;
  lessonRuns?: Array<{
    lesson: number;
    correct: number;
    wrong: number;
    playPoints: number;
    movesEarned: number;
    completedAt: string;
  }>;
};

export default function PattayaLesson2Page() {
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
  const [movesLeft, setMovesLeft] = useState(9);
  const [playPoints, setPlayPoints] = useState(0);
  const [playActionText, setPlayActionText] = useState(
    'Match 3+ symbols to earn points!',
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

  useEffect(() => {
    void trackEvent('pattaya_lesson_opened', {
      lessonNumber: 2,
      topic: 'basic_describing_words',
    });
  }, []);

  function readStats(): PattayaStats {
    const payload = window.localStorage.getItem(STATS_KEY);
    const fallback: PattayaStats = {
      correctAnswers: 0,
      wrongAnswers: 0,
      quizAttempts: 0,
      totalMovesEarned: 0,
      lessonRuns: [],
    };
    if (!payload) return fallback;

    try {
      const parsed = JSON.parse(payload) as Partial<PattayaStats>;
      return {
        ...fallback,
        ...parsed,
        lessonRuns: Array.isArray(parsed.lessonRuns) ? parsed.lessonRuns : [],
      };
    } catch {
      return fallback;
    }
  }

  function writeStats(next: PattayaStats) {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(STATS_UPDATED_EVENT));
  }

  function recordAttemptIfNeeded() {
    if (attemptRecorded) return;
    const previous = readStats();
    writeStats({
      ...previous,
      quizAttempts: previous.quizAttempts + 1,
    });
    setAttemptRecorded(true);
  }

  function recordAnswerResult(isCorrect: boolean) {
    const previous = readStats();
    writeStats({
      ...previous,
      correctAnswers: previous.correctAnswers + (isCorrect ? 1 : 0),
      wrongAnswers: previous.wrongAnswers + (isCorrect ? 0 : 1),
    });
  }

  function persistProgress() {
    const previous = readStats();
    if (!attemptRecorded) {
      previous.quizAttempts += 1;
    }

    const earnedMoves = Math.max(1, Math.floor(playPoints / 120));
    const lessonRuns = Array.isArray(previous.lessonRuns)
      ? previous.lessonRuns
      : [];
    const nextStats: PattayaStats = {
      correctAnswers: previous.correctAnswers,
      wrongAnswers: previous.wrongAnswers,
      quizAttempts: previous.quizAttempts,
      totalMovesEarned: previous.totalMovesEarned + earnedMoves,
      lessonRuns: [
        ...lessonRuns,
        {
          lesson: 2,
          correct: learningCorrect,
          wrong: learningWrong,
          playPoints,
          movesEarned: earnedMoves,
          completedAt: new Date().toISOString(),
        },
      ],
    };
    writeStats(nextStats);

    void trackEvent('pattaya_lesson_completed', {
      lessonNumber: 2,
      learningCorrect,
      learningWrong,
      playPoints,
      earnedMoves,
      totalMovesEarned: nextStats.totalMovesEarned,
      totalCorrectAnswers: nextStats.correctAnswers,
      totalWrongAnswers: nextStats.wrongAnswers,
      totalQuizAttempts: nextStats.quizAttempts,
    });

    const rawUnlocked = window.localStorage.getItem(UNLOCKED_KEY);
    const unlocked = Number.parseInt(rawUnlocked ?? '1', 10);
    const safeUnlocked = Number.isFinite(unlocked)
      ? Math.min(LESSONS_TOTAL, Math.max(1, unlocked))
      : 1;

    const passed = learningCorrect >= 3;
    if (passed) {
      const nextUnlocked = Math.min(LESSONS_TOTAL, Math.max(safeUnlocked, 3));
      if (nextUnlocked > safeUnlocked) {
        window.localStorage.setItem(PENDING_UNLOCK_KEY, String(nextUnlocked));
      }
      window.localStorage.setItem(UNLOCKED_KEY, String(nextUnlocked));
    }
  }

  function handleChallengeAnswer(challenge: Challenge, pickedIndex: number) {
    if (selectedIndex !== null) return;
    const isCorrect = pickedIndex === challenge.answer;
    recordAttemptIfNeeded();
    recordAnswerResult(isCorrect);
    if (isCorrect) {
      setLearningCorrect((value) => value + 1);
    } else {
      setLearningWrong((value) => value + 1);
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
      setPlayActionText('Pick neighboring symbols only.');
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

    setBoard(draft);
    setSwappingTiles(new Set([`${fr}-${fc}`, `${tr}-${tc}`]));
    setPlayActionText('Swapping...');

    window.setTimeout(() => {
      setSwappingTiles(new Set());

      const resolved = clearAutoMatches(draft);
      const needsReshuffle = !hasAvailableMove(resolved.board);
      const boardAfterResolve = needsReshuffle ? makeBoard() : resolved.board;
      const gained = resolved.cleared * 10;
      const nextMoves = movesLeft - 1;

      setAnimatingTiles(found);
      setPlayActionText(`Matched ${found.size} blocks!`);

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
        setPlayPoints((value) => value + gained);
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
    ) {
      return;
    }
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
          <div className={styles.statsRow}>
            <div className={styles.stat}>Phase: {phase.toUpperCase()}</div>
            <div className={styles.stat}>
              Learning Correct: {learningCorrect}
            </div>
            <div className={styles.stat}>Learning Wrong: {learningWrong}</div>
            <div className={styles.stat}>Play Points: {playPoints}</div>
          </div>

          <div className={styles.progress}>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {phase === 'practice' && (
            <article className={styles.card} style={{ position: 'relative' }}>
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
              <span className={styles.phaseBadge}>PRACTICE</span>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
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
                  Question {practiceStep + 1} of {practiceChallenges.length}
                </p>
                <div className={quizStyles.progressTrack}>
                  <div
                    className={quizStyles.progressFill}
                    style={{
                      backgroundColor: '#0f766e',
                      width: `${(practiceStep / practiceChallenges.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <h2 className={styles.prompt}>{currentPractice.prompt}</h2>
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexDirection: 'column',
                  marginTop: '10px',
                }}
              >
                {currentPractice.options.map((option, idx) => (
                  <button
                    key={`${option}-${idx}`}
                    type="button"
                    className={`${quizStyles.quizOptionButton} ${
                      selectedIndex !== null && idx === currentPractice.answer
                        ? quizStyles.quizOptionCorrectFlash
                        : ''
                    }`}
                    style={{
                      backgroundColor:
                        selectedIndex === null
                          ? '#0f766e'
                          : idx === currentPractice.answer
                            ? '#4CAF50'
                            : '#0f766e',
                    }}
                    onClick={() => handleChallengeAnswer(currentPractice, idx)}
                    disabled={selectedIndex !== null}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </article>
          )}

          {phase === 'play' && (
            <article className={styles.card}>
              <span className={styles.phaseBadge}>PLAY</span>
              <h2 className={styles.prompt}>
                Match 3+ symbols in 9 moves ({movesLeft} moves left)
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
            <article className={styles.card} style={{ position: 'relative' }}>
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
                    pointerEvents: 'none',
                  }}
                >
                  {feedbackIcon}
                </div>
              )}
              <span className={styles.phaseBadge}>APPLY</span>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
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
                  Question {applyStep + 1} of {applyChallenges.length}
                </p>
                <div className={quizStyles.progressTrack}>
                  <div
                    className={quizStyles.progressFill}
                    style={{
                      backgroundColor: '#0f766e',
                      width: `${(applyStep / applyChallenges.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <h2 className={styles.prompt}>{currentApply.prompt}</h2>
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexDirection: 'column',
                  marginTop: '10px',
                }}
              >
                {currentApply.options.map((option, idx) => (
                  <button
                    key={`${option}-${idx}`}
                    type="button"
                    className={`${quizStyles.quizOptionButton} ${
                      selectedIndex !== null && idx === currentApply.answer
                        ? quizStyles.quizOptionCorrectFlash
                        : ''
                    }`}
                    style={{
                      backgroundColor:
                        selectedIndex === null
                          ? '#0f766e'
                          : idx === currentApply.answer
                            ? '#4CAF50'
                            : '#0f766e',
                    }}
                    onClick={() => handleChallengeAnswer(currentApply, idx)}
                    disabled={selectedIndex !== null}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </article>
          )}

          {phase === 'done' && (
            <article className={styles.card}>
              <span className={styles.phaseBadge}>COMPLETE</span>
              <h2 className={styles.prompt}>Lesson 2 Complete</h2>
              <p className={styles.help}>
                Learning accuracy: {learningCorrect}/
                {practiceChallenges.length + applyChallenges.length}
              </p>
              <p className={styles.help}>Play points: {playPoints}</p>
              <p className={styles.help}>Total score: {totalSessionScore}</p>
              <div className={styles.footerButtons}>
                <Link href="/pattaya-games" className={styles.footerLink}>
                  <Image
                    src="/assets/back.png"
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
