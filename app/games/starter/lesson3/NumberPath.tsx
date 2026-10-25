'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import lessonHeaderStyles from '../lesson1/ColorsSvgViewer.module.css';
import { pingLessonOpen, saveProgressDelta } from '@/app/_lib/client/progress';
import GameStatsFooter from '@/app/_components/GameStatsFooter';
import styles from './NumberPath.module.css';

type NumberTile = {
  value: number;
  word: string;
};

type BoardCell = NumberTile | null;

type BoardPoint = {
  x: number;
  y: number;
};

const SMALL_NUMBER_WORDS = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty',
];

const TENS: NumberTile[] = [
  { value: 30, word: 'thirty' },
  { value: 40, word: 'forty' },
  { value: 50, word: 'fifty' },
  { value: 60, word: 'sixty' },
  { value: 70, word: 'seventy' },
  { value: 80, word: 'eighty' },
  { value: 90, word: 'ninety' },
  { value: 100, word: 'one hundred' },
];

const LAST_STAGE = 10;
const GRID_SIZE = 6;

function numbersForStage(stage: number): NumberTile[] {
  const smallNumberCount = stage === 1 ? 10 : 20;
  const smallNumbers = Array.from({ length: smallNumberCount }, (_, index) => ({
    value: index + 1,
    word: SMALL_NUMBER_WORDS[index],
  }));
  const tensCount = Math.min(Math.max(stage - 2, 0), TENS.length);

  return [...smallNumbers, ...TENS.slice(0, tensCount)];
}

function createBoard(stage: number, randomize = true): BoardCell[] {
  const numbers = numbersForStage(stage);
  const positions = Array.from(
    { length: GRID_SIZE * GRID_SIZE },
    (_, index) => index,
  );
  let seed = 0x6d2b79f5;

  for (let index = positions.length - 1; index > 0; index--) {
    if (!randomize) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
    }
    const random = randomize ? Math.random() : seed / 0x100000000;
    const swapIndex = Math.floor(random * (index + 1));
    [positions[index], positions[swapIndex]] = [
      positions[swapIndex],
      positions[index],
    ];
  }

  const board: BoardCell[] = Array(GRID_SIZE * GRID_SIZE).fill(null);
  numbers.forEach((number, index) => {
    board[positions[index]] = number;
  });

  return board;
}

async function unlockNextLesson(): Promise<void> {
  await saveProgressDelta('starter', { unlocked_lessons: 4 });
}

function NumberPathContent() {
  const [stage, setStage] = useState(1);
  const [path, setPath] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [stageComplete, setStageComplete] = useState(false);
  const [message, setMessage] = useState(
    'Start at One and follow the numbers.',
  );
  const boardRef = useRef<HTMLDivElement>(null);
  const [linePoints, setLinePoints] = useState<BoardPoint[]>([]);
  const [pointerPoint, setPointerPoint] = useState<BoardPoint | null>(null);

  const numbers = numbersForStage(stage);
  const [board, setBoard] = useState<BoardCell[]>(() => createBoard(1, false));

  useEffect(() => {
    pingLessonOpen('starter');
  }, []);
  const nextNumber = numbers[path.length];

  useEffect(() => {
    if (!isDragging) return;

    const stopDragging = () => {
      setIsDragging(false);
      setPointerPoint(null);
    };
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);
    return () => {
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };
  }, [isDragging]);

  function getBoardPoint(clientX: number, clientY: number): BoardPoint | null {
    const boardElement = boardRef.current;
    const bounds = boardElement?.getBoundingClientRect();
    if (!bounds || bounds.width === 0 || bounds.height === 0) return null;

    return {
      x: Math.max(
        0,
        Math.min(100, ((clientX - bounds.left) / bounds.width) * 100),
      ),
      y: Math.max(
        0,
        Math.min(100, ((clientY - bounds.top) / bounds.height) * 100),
      ),
    };
  }

  function getNumberCenter(value: number): BoardPoint | null {
    const boardElement = boardRef.current;
    const numberCell = boardElement?.querySelector<HTMLButtonElement>(
      `[data-number-value="${value}"]`,
    );
    const boardBounds = boardElement?.getBoundingClientRect();
    const cellBounds = numberCell?.getBoundingClientRect();
    if (
      !boardBounds ||
      !cellBounds ||
      boardBounds.width === 0 ||
      boardBounds.height === 0
    ) {
      return null;
    }

    return {
      x:
        ((cellBounds.left + cellBounds.width / 2 - boardBounds.left) /
          boardBounds.width) *
        100,
      y:
        ((cellBounds.top + cellBounds.height / 2 - boardBounds.top) /
          boardBounds.height) *
        100,
    };
  }

  function finishStage(): void {
    setIsDragging(false);
    setStageComplete(true);
    if (stage === LAST_STAGE) {
      setMessage('Number path complete! You reached one hundred.');
      void unlockNextLesson();
    } else {
      setMessage('Path complete! Ready for the next board?');
    }
  }

  function extendPath(value: number): void {
    if (!isDragging || stageComplete || path.includes(value)) return;

    appendExpectedNumber(value);
  }

  function appendExpectedNumber(value: number): void {
    if (stageComplete || path.includes(value) || value !== nextNumber?.value) {
      return;
    }

    const nextPath = [...path, value];
    setPath(nextPath);
    const center = getNumberCenter(value);
    if (center) setLinePoints((current) => [...current, center]);
    if (nextPath.length === numbers.length) {
      finishStage();
    } else {
      setMessage(
        `${nextPath.length} of ${numbers.length} connected. Keep going!`,
      );
    }
  }

  function chooseNumberWithKeyboard(value: number): void {
    if (path.length === 0) {
      startPath(value);
      setIsDragging(false);
      return;
    }

    appendExpectedNumber(value);
  }

  function startPath(value: number): void {
    if (stageComplete) return;

    if (value === numbers[0]?.value) {
      setPath([value]);
      const center = getNumberCenter(value);
      setLinePoints(center ? [center] : []);
      setIsDragging(true);
      setMessage('One connected. Keep your finger down and follow the path.');
      return;
    }

    if (path[path.length - 1] === value) {
      setIsDragging(true);
      return;
    }

    setMessage('Start at One, then drag through the numbers in order.');
  }

  function advanceStage(): void {
    const nextStage = stage + 1;
    setStage(nextStage);
    setBoard(createBoard(nextStage));
    setPath([]);
    setLinePoints([]);
    setPointerPoint(null);
    setStageComplete(false);
    setMessage('Start at One and follow the numbers.');
  }

  function restartPath(): void {
    setBoard(createBoard(stage));
    setPath([]);
    setLinePoints([]);
    setPointerPoint(null);
    setIsDragging(false);
    setStageComplete(false);
    setMessage('Start at One and follow the numbers.');
  }

  const displayedLinePoints =
    isDragging && pointerPoint ? [...linePoints, pointerPoint] : linePoints;

  return (
    <main className={styles.page}>
      <header className={lessonHeaderStyles.header} data-game="starter">
        <Link href="/games/starter" className={lessonHeaderStyles.back}>
          <Image
            src="/assets/tinified/back.png"
            alt="Back"
            width={34}
            height={34}
          />
        </Link>
        <h1 className={styles.headerTitle} id="number-path-title">
          Number Path
        </h1>
        <span className={styles.stageTag}>STAGE {stage}</span>
      </header>

      <section className={styles.game} aria-labelledby="number-path-title">
        <div className={styles.intro}>
          <p className={styles.kicker}>COUNT UP THE PATH</p>
          <p className={styles.instructions}>
            Press and drag from the smallest number to the biggest.
          </p>
        </div>

        <div className={styles.progressRow}>
          <span className={styles.levelLabel}>
            {stage === 1
              ? 'Numbers 1 to 10'
              : stage === 2
                ? 'Numbers 1 to 20'
                : `1 to 20, then ${numbers
                    .slice(20)
                    .map(({ value }) => value)
                    .join(', ')}`}
          </span>
          <span className={styles.counter}>
            {path.length} <span>/ {numbers.length}</span>
          </span>
        </div>

        <p className={styles.status} aria-live="polite">
          {message}
        </p>

        <div
          ref={boardRef}
          className={styles.board}
          role="group"
          aria-label={`Stage ${stage} number path board`}
          onContextMenu={(event) => event.preventDefault()}
          onPointerDown={(event) => {
            if (event.button !== 0 || !(event.target instanceof Element))
              return;
            const numberCell = event.target.closest<HTMLButtonElement>(
              '[data-number-value]',
            );
            const value = Number(numberCell?.dataset.numberValue);
            if (!numberCell || !Number.isInteger(value)) return;

            const canStartDragging =
              value === numbers[0]?.value || path[path.length - 1] === value;
            event.preventDefault();
            if (canStartDragging) {
              setPointerPoint(getBoardPoint(event.clientX, event.clientY));
            }
            startPath(value);
            if (canStartDragging) {
              event.currentTarget.setPointerCapture(event.pointerId);
            }
          }}
          onPointerMove={(event) => {
            if (!isDragging) return;
            setPointerPoint(getBoardPoint(event.clientX, event.clientY));
            const target = document.elementFromPoint(
              event.clientX,
              event.clientY,
            );
            const numberCell = target?.closest<HTMLButtonElement>(
              '[data-number-value]',
            );
            const value = Number(numberCell?.dataset.numberValue);
            if (numberCell && Number.isInteger(value)) extendPath(value);
          }}
          onPointerUp={() => {
            setIsDragging(false);
            setPointerPoint(null);
          }}
          onPointerCancel={() => {
            setIsDragging(false);
            setPointerPoint(null);
          }}
        >
          {displayedLinePoints.length > 1 ? (
            <svg
              className={styles.dragLine}
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <polyline
                points={displayedLinePoints
                  .map(({ x, y }) => `${x},${y}`)
                  .join(' ')}
              />
            </svg>
          ) : null}
          {board.map((cell, index) => {
            if (!cell) {
              return (
                <div
                  key={`empty-${index}`}
                  className={styles.emptyCell}
                  aria-hidden="true"
                />
              );
            }

            const pathIndex = path.indexOf(cell.value);
            const selected = pathIndex !== -1;

            return (
              <button
                key={cell.value}
                type="button"
                className={`${styles.numberCell} ${selected ? styles.selectedCell : ''} ${stageComplete ? styles.completeCell : ''}`}
                data-number-value={cell.value}
                aria-label={`${cell.word}${selected ? `, path step ${pathIndex + 1}` : ''}`}
                aria-pressed={selected}
                onClick={(event) => {
                  if (event.detail === 0 && !isDragging) {
                    chooseNumberWithKeyboard(cell.value);
                  }
                }}
              >
                {cell.word}
              </button>
            );
          })}
        </div>

        {stageComplete ? (
          <div className={styles.completion} role="status">
            <p>
              {stage === LAST_STAGE
                ? 'Wonderful work! You completed every number path.'
                : 'Lovely path! New numbers are ready.'}
            </p>
            {stage === LAST_STAGE ? (
              <Link href="/games/starter" className={styles.nextButton}>
                Return to Starter Zone
              </Link>
            ) : (
              <button
                className={styles.nextButton}
                type="button"
                onClick={advanceStage}
              >
                Next board <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
        ) : (
          <button
            className={styles.restartButton}
            type="button"
            onClick={restartPath}
          >
            Start over
          </button>
        )}
      </section>
    </main>
  );
}

export default function NumberPath() {
  return (
    <>
      <NumberPathContent />
      <GameStatsFooter game="starter" totalLessons={7} />
    </>
  );
}
