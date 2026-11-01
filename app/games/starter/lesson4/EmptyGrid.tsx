'use client';

import Image from 'next/image';
import MusicToggle from '../../../_components/MusicToggle';
import UnlockToast from '../_components/UnlockToast';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import lessonHeaderStyles from '../lesson1/ColorsSvgViewer.module.css';
import { pingLessonOpen, recordAnswer, saveProgressDelta } from '@/app/_lib/client/progress';
import GameStatsFooter from '@/app/_components/GameStatsFooter';
import styles from './EmptyGrid.module.css';
import { ANIMAL_LEVELS, EXIT_ROWS, type AnimalRound } from './animals';

type Direction = 'north' | 'east' | 'south' | 'west';
type PipeKind = 'straight' | 'cross' | 'corner';
type PipePiece = { kind: PipeKind; rotation: number };

type PipeTool = {
  id: string;
  label: string;
  description: string;
  piece: PipePiece;
};

const GRID_SIZE = 8;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;
const LEVEL_GRID_SIZES = [5, 8, 8, 8];
const START_CELL = 0;
const FLOW_START_DELAY_SECONDS = 5;
const ROUND_TIME_LIMIT_SECONDS = 10;
const FLOW_DURATION_SECONDS = 3.575;
const COMPLETE_FLOW_SPEEDUP = 10;
const PIPE_DRAG_TYPE = 'application/x-playland-pipe';
const PIPE_SOURCE_TYPE = 'application/x-playland-pipe-source';
const DIRECTIONS: Direction[] = ['north', 'east', 'south', 'west'];
const OPPOSITE: Record<Direction, Direction> = {
  north: 'south',
  east: 'west',
  south: 'north',
  west: 'east',
};
const MOVEMENT: Record<Direction, { row: number; column: number }> = {
  north: { row: -1, column: 0 },
  east: { row: 0, column: 1 },
  south: { row: 1, column: 0 },
  west: { row: 0, column: -1 },
};
const SVG_ENDPOINT: Record<Direction, string> = {
  north: '50 0',
  east: '100 50',
  south: '50 100',
  west: '0 50',
};
const PIPE_TOOLS: PipeTool[] = [
  {
    id: 'horizontal',
    label: 'Horizontal',
    description: 'Horizontal straight pipe',
    piece: { kind: 'straight', rotation: 0 },
  },
  {
    id: 'cross',
    label: 'Cross',
    description: 'Four-way cross pipe',
    piece: { kind: 'cross', rotation: 0 },
  },
  {
    id: 'corner-ne',
    label: 'Corner S-W',
    description: 'Corner pipe open south and west',
    piece: { kind: 'corner', rotation: 2 },
  },
];

function getPipeConnections(piece: PipePiece): Direction[] {
  if (piece.kind === 'cross') return DIRECTIONS;
  if (piece.kind === 'straight') {
    return piece.rotation % 2 === 0 ? ['east', 'west'] : ['north', 'south'];
  }

  return [
    DIRECTIONS[piece.rotation % DIRECTIONS.length],
    DIRECTIONS[(piece.rotation + 1) % DIRECTIONS.length],
  ];
}

function parseDraggedPipe(value: string): PipePiece | null {
  const [kind, rotationText] = value.split(':');
  const rotation = Number(rotationText);
  if (!Number.isInteger(rotation) || rotation < 0 || rotation > 3) return null;
  if (kind !== 'straight' && kind !== 'cross' && kind !== 'corner') return null;
  return { kind, rotation };
}

function getFlowSteps(
  pipes: Array<PipePiece | null>,
  exitCells: number[],
  obstacleCells: ReadonlySet<number>,
  gridSize: number,
): { steps: number[]; incoming: Array<Direction | null>; outgoing: Direction[][] } {
  const flowSteps = Array<number>(CELL_COUNT).fill(-1);
  const incoming = Array<Direction | null>(CELL_COUNT).fill(null);
  const outgoing: Direction[][] = Array.from(
    { length: CELL_COUNT },
    () => [],
  );
  const queue = [START_CELL];
  flowSteps[START_CELL] = 0;

  const openingsOf = (cell: number): Direction[] =>
    obstacleCells.has(cell)
      ? []
      : cell === START_CELL
      ? ['east']
      : exitCells.includes(cell)
        ? ['west']
        : pipes[cell]
          ? getPipeConnections(pipes[cell])
          : [];

  for (let cursor = 0; cursor < queue.length; cursor++) {
    const current = queue[cursor];
    const row = Math.floor(current / gridSize);
    const column = current % gridSize;

    for (const direction of openingsOf(current)) {
      const movement = MOVEMENT[direction];
      const nextRow = row + movement.row;
      const nextColumn = column + movement.column;
      if (
        nextRow < 0 ||
        nextRow >= gridSize ||
        nextColumn < 0 ||
        nextColumn >= gridSize
      ) {
        continue;
      }

      const nextCell = nextRow * gridSize + nextColumn;
      if (
        !obstacleCells.has(nextCell) &&
        openingsOf(nextCell).includes(OPPOSITE[direction]) &&
        flowSteps[nextCell] === -1
      ) {
        flowSteps[nextCell] = flowSteps[current] + 1;
        incoming[nextCell] = OPPOSITE[direction];
        outgoing[current].push(direction);
        queue.push(nextCell);
      }
    }
  }

  return { steps: flowSteps, incoming, outgoing };
}

function areExitsReachable(
  obstacleCells: ReadonlySet<number>,
  exitCells: number[],
  gridSize: number,
): boolean {
  const reachable = new Set([START_CELL]);
  const queue = [START_CELL];

  // Exits only accept water from the west and are dead ends; the start only opens east.
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const cell = queue[cursor];
    const row = Math.floor(cell / gridSize);
    const column = cell % gridSize;

    for (const direction of cell === START_CELL ? ['east' as const] : DIRECTIONS) {
      const movement = MOVEMENT[direction];
      const nextRow = row + movement.row;
      const nextColumn = column + movement.column;
      if (
        nextRow < 0 ||
        nextRow >= gridSize ||
        nextColumn < 0 ||
        nextColumn >= gridSize
      ) {
        continue;
      }

      const nextCell = nextRow * gridSize + nextColumn;
      if (obstacleCells.has(nextCell) || reachable.has(nextCell)) continue;
      if (exitCells.includes(nextCell)) {
        if (direction === 'east') reachable.add(nextCell);
        continue;
      }
      reachable.add(nextCell);
      queue.push(nextCell);
    }
  }

  return exitCells.every((cell) => reachable.has(cell));
}

function getObstacleCells(
  levelIndex: number,
  roundIndex: number,
  gridSize: number,
  exitCells: number[],
  layoutSeed: number,
): Set<number> {
  let seed =
    (levelIndex + 1) * 1009 + (roundIndex + 1) * 7919 + gridSize + layoutSeed;
  const random = (): number => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  const candidates = Array.from(
    { length: gridSize * gridSize },
    (_, cell) => cell,
  ).filter((cell) => cell !== START_CELL && !exitCells.includes(cell));

  for (let index = candidates.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [candidates[index], candidates[swapIndex]] = [
      candidates[swapIndex],
      candidates[index],
    ];
  }

  const obstacles = new Set<number>();
  const targetCount = Math.floor(gridSize * gridSize * 0.16);

  for (const cell of candidates) {
    obstacles.add(cell);
    if (!areExitsReachable(obstacles, exitCells, gridSize)) {
      obstacles.delete(cell);
      continue;
    }
    if (obstacles.size === targetCount) break;
  }

  return obstacles;
}

function speak(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

type Exit = { cell: number; round: AnimalRound; isTarget: boolean };

function shuffledIndices(length: number): number[] {
  const order = Array.from({ length }, (_, index) => index);
  for (let index = length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }
  return order;
}

// Target animal plus two choices from the same level, at fixed exits.
function buildExits(
  levelIndex: number,
  roundIndex: number,
  gridSize: number,
  layoutSeed: number,
): Exit[] {
  const { rounds } = ANIMAL_LEVELS[levelIndex];
  const rows = EXIT_ROWS[
    (roundIndex + levelIndex + layoutSeed) % EXIT_ROWS.length
  ].map((row) => Math.round((row * (gridSize - 1)) / 7));
  const targetSlot = (roundIndex * 2 + levelIndex + layoutSeed) % rows.length;
  let distractor = 1;
  return rows.map((row, slot) => {
    const isTarget = slot === targetSlot;
    const source = isTarget
      ? rounds[roundIndex]
      : rounds[(roundIndex + distractor++) % rounds.length];
    return { cell: row * gridSize + gridSize - 1, round: source, isTarget };
  });
}

function PipeArtwork({
  piece,
  terminal,
  connected,
  flowing = false,
  flowDelaySeconds = 0,
  flowDurationSeconds = 1.625,
  flowIncoming,
  flowOutgoing = [],
}: {
  piece?: PipePiece;
  terminal?: 'start' | 'end';
  connected: boolean;
  flowing?: boolean;
  flowDelaySeconds?: number;
  flowDurationSeconds?: number;
  flowIncoming?: Direction | null;
  flowOutgoing?: Direction[];
}) {
  const connections = terminal
    ? terminal === 'start'
      ? ['east']
      : ['west']
    : piece
      ? getPipeConnections(piece)
      : [];
  const colors = terminal
    ? { rim: '#3f4448', fill: '#7d868c' }
    : connected
      ? { rim: '#3f4448', fill: '#8f989e' }
      : { rim: '#4a5055', fill: '#b4bbc0' };
  const path = connections
    .map((direction) => `M 50 50 L ${SVG_ENDPOINT[direction as Direction]}`)
    .join(' ');

  return (
    <svg
      className={styles.pipeArtwork}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke={colors.rim}
        strokeLinecap="butt"
        strokeWidth="26"
      />
      <rect x="37" y="37" width="26" height="26" fill={colors.rim} />
      <path
        d={path}
        fill="none"
        stroke={colors.fill}
        strokeLinecap="butt"
        strokeWidth="18"
      />
      <rect x="41" y="41" width="18" height="18" fill={colors.fill} />
      {flowing &&
        (flowOutgoing.length > 0
          ? flowOutgoing.map((direction) => {
              const flowPath = flowIncoming
                ? `M ${SVG_ENDPOINT[flowIncoming]} L 50 50 L ${SVG_ENDPOINT[direction]}`
                : `M 50 50 L ${SVG_ENDPOINT[direction]}`;
              return (
                <path
                  className={styles.flowingWater}
                  d={flowPath}
                  fill="none"
                  key={direction}
                  pathLength="100"
                  stroke="#9cf6ff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="9"
                  style={{
                    animationDelay: `${flowDelaySeconds}s`,
                    animationDuration: `${flowDurationSeconds}s`,
                  }}
                />
              );
            })
          : terminal === 'end' &&
              flowIncoming && (
                <path
                  className={styles.flowingWater}
                  d={`M ${SVG_ENDPOINT[flowIncoming]} L 50 50`}
                  fill="none"
                  pathLength="100"
                  stroke="#9cf6ff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="9"
                  style={{
                    animationDelay: `${flowDelaySeconds}s`,
                    animationDuration: `${flowDurationSeconds}s`,
                  }}
                />
              ))}
    </svg>
  );
}

function EmptyGridContent() {
  const hasSavedCompletionRef = useRef(false);
  const [levelIndex, setLevelIndex] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundStarted, setRoundStarted] = useState(false);
  const [flowStarted, setFlowStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(FLOW_START_DELAY_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const [layoutSeed, setLayoutSeed] = useState(0);
  const [animalOrder, setAnimalOrder] = useState(() =>
    Array.from({ length: ANIMAL_LEVELS[0].rounds.length }, (_, index) => index),
  );
  const [waterArrived, setWaterArrived] = useState(false);
  const [pipes, setPipes] = useState<Array<PipePiece | null>>(() =>
    Array(CELL_COUNT).fill(null),
  );
  const [selectedPipe, setSelectedPipe] = useState<PipePiece>(
    PIPE_TOOLS[0].piece,
  );
  const level = ANIMAL_LEVELS[levelIndex];
  const animalIndex = animalOrder[roundIndex];
  const current = level.rounds[animalIndex];
  const gridSize = LEVEL_GRID_SIZES[levelIndex];
  const exits = buildExits(levelIndex, animalIndex, gridSize, layoutSeed);
  const exitCells = exits.map((exit) => exit.cell);
  const obstacleCells = getObstacleCells(
    levelIndex,
    roundIndex,
    gridSize,
    exitCells,
    layoutSeed,
  );
  const flow = getFlowSteps(
    pipes,
    exitCells,
    obstacleCells,
    gridSize,
  );
  const routeComplete = exits.some(
    (exit) => exit.isTarget && flow.steps[exit.cell] >= 0,
  );
  const wrongExit = exits.find(
    (exit) => !exit.isTarget && flow.steps[exit.cell] >= 0,
  );
  const flowDurationSeconds = routeComplete
    ? FLOW_DURATION_SECONDS / COMPLETE_FLOW_SPEEDUP
    : FLOW_DURATION_SECONDS;
  const waterFlowing = flowStarted || routeComplete;
  const targetStep = Math.max(
    0,
    ...exits
      .filter((exit) => exit.isTarget)
      .map((exit) => flow.steps[exit.cell]),
  );
  const isLastRound = roundIndex === (level.roundCount ?? level.rounds.length) - 1;
  const isLastLevel = levelIndex === ANIMAL_LEVELS.length - 1;
  const lessonComplete = waterArrived && isLastRound && isLastLevel;
  const completedLevels =
    levelIndex + (routeComplete && isLastRound ? 1 : 0);

  useEffect(() => {
    if (!routeComplete) return;

    const timeoutId = window.setTimeout(
      () => setWaterArrived(true),
      targetStep * flowDurationSeconds * 1000,
    );
    return () => {
      window.clearTimeout(timeoutId);
      setWaterArrived(false);
    };
  }, [routeComplete, targetStep, flowDurationSeconds]);

  useEffect(() => {
    if (!lessonComplete || hasSavedCompletionRef.current) return;
    hasSavedCompletionRef.current = true;

    void saveProgressDelta('starter', { unlocked_lessons: 5 });
  }, [lessonComplete]);

  useEffect(() => {
    if (routeComplete) recordAnswer('starter', true);
  }, [routeComplete]);

  const hasWrongExit = Boolean(wrongExit);
  useEffect(() => {
    if (hasWrongExit) recordAnswer('starter', false);
  }, [hasWrongExit]);

  useEffect(() => {
    if (!roundStarted || routeComplete) return;

    const timeoutId = window.setTimeout(() => {
      if (timeLeft <= 1) {
        if (!flowStarted) {
          setFlowStarted(true);
          setTimeLeft(ROUND_TIME_LIMIT_SECONDS);
        } else {
          recordAnswer('starter', false);
          setPipes(Array(CELL_COUNT).fill(null));
          setRoundStarted(false);
          setFlowStarted(false);
          setTimeLeft(FLOW_START_DELAY_SECONDS);
          setTimedOut(true);
        }
        return;
      }

      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [flowStarted, roundStarted, routeComplete, timeLeft]);

  useEffect(() => {
    if (!timedOut) return;

    const timeoutId = window.setTimeout(() => setTimedOut(false), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [timedOut]);

  useEffect(() => {
    if (waterArrived) speak(current.animal);
  }, [waterArrived, current.animal]);

  useEffect(() => {
    pingLessonOpen('starter');
    // Random layout is picked after mount to avoid a hydration mismatch.
    const timeoutId = window.setTimeout(
      () => {
        setLayoutSeed(Math.floor(Math.random() * 1000));
        setAnimalOrder(shuffledIndices(ANIMAL_LEVELS[0].rounds.length));
      },
      0,
    );
    return () => window.clearTimeout(timeoutId);
  }, []);

  function nextRound(): void {
    if (isLastRound) {
      setLevelIndex((value) => value + 1);
      setRoundIndex(0);
      setAnimalOrder(shuffledIndices(ANIMAL_LEVELS[levelIndex + 1].rounds.length));
    } else {
      setRoundIndex((value) => value + 1);
    }
    setLayoutSeed(Math.floor(Math.random() * 1000));
    setWaterArrived(false);(Array(CELL_COUNT).fill(null));
    setRoundStarted(false);
    setFlowStarted(false);
    setTimeLeft(FLOW_START_DELAY_SECONDS);
    setTimedOut(false);
  }

  function placePipe(cellIndex: number, piece: PipePiece): void {
    if (cellIndex === START_CELL || exitCells.includes(cellIndex)) return;
    setRoundStarted(true);
    setTimedOut(false);
    setPipes((current) => {
      const next = [...current];
      next[cellIndex] = piece;
      return next;
    });
  }

  function handleCellClick(cellIndex: number): void {
    if (cellIndex === START_CELL || exitCells.includes(cellIndex)) return;

    if (pipes[cellIndex]?.kind === selectedPipe.kind) {
      if (selectedPipe.kind !== 'cross') rotatePipe(cellIndex);
      return;
    }

    placePipe(cellIndex, selectedPipe);
  }

  function rotatePipe(cellIndex: number): void {
    setRoundStarted(true);
    setTimedOut(false);
    setPipes((current) => {
      const next = [...current];
      const pipe = next[cellIndex];
      if (!pipe || pipe.kind === 'cross') return current;
      next[cellIndex] = {
        ...pipe,
        rotation: (pipe.rotation + 1) % DIRECTIONS.length,
      };
      return next;
    });
  }

  function handleCellDrop(
    event: React.DragEvent<HTMLDivElement>,
    cellIndex: number,
  ): void {
    event.preventDefault();
    if (cellIndex === START_CELL || exitCells.includes(cellIndex)) return;

    const sourceText = event.dataTransfer.getData(PIPE_SOURCE_TYPE);
    const sourceIndex = Number(sourceText);
    if (sourceText && Number.isInteger(sourceIndex)) {
      setRoundStarted(true);
      setTimedOut(false);
      setPipes((current) => {
        if (!current[sourceIndex]) return current;
        const next = [...current];
        const movingPipe = next[sourceIndex];
        next[sourceIndex] = null;
        next[cellIndex] = movingPipe;
        return next;
      });
      return;
    }

    const droppedPipe = parseDraggedPipe(
      event.dataTransfer.getData(PIPE_DRAG_TYPE),
    );
    if (droppedPipe) placePipe(cellIndex, droppedPipe);
  }

  function clearBoard(): void {
    setPipes(Array(CELL_COUNT).fill(null));
  }

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
        <h1 className={styles.headerTitle}>Animal Pipes</h1>
        <span className={styles.lessonTag}>
          LEVEL {levelIndex + 1}/{ANIMAL_LEVELS.length}
        </span>
        <MusicToggle />
      </header>
      {lessonComplete && <UnlockToast nextLesson={5} />}

      <section className={styles.workspace} aria-label="Animal pipe game">
        <div className={styles.gameLayout}>
          <div className={styles.boardArea}>
            <ol
              className={styles.levels}
              aria-label={`Levels completed: ${completedLevels} of ${ANIMAL_LEVELS.length}`}
            >
              {ANIMAL_LEVELS.map((item, index) => {
                const done = index < completedLevels;
                const active = index === levelIndex && !done;
                return (
                  <li
                    key={item.title}
                    className={`${styles.level} ${done ? styles.levelDone : ''} ${active ? styles.levelCurrent : ''}`}
                    aria-current={active ? 'step' : undefined}
                  >
                    <span className={styles.levelNumber}>
                      {done ? '✓' : index + 1}
                    </span>
                    <span>
                      {item.title} ·{' '}
                      <span lang="th">{item.titleTh}</span>
                    </span>
                  </li>
                );
              })}
            </ol>

            <div className={styles.boardHeading}>
              <h2 className={styles.boardTitle}>
                Which word names this animal? ·{' '}
                <span lang="th">คำไหนคือชื่อสัตว์ตัวนี้</span>
              </h2>
              <p className={styles.status} aria-live="polite">
                {timedOut
                  ? 'Time is up! Try this animal again. · หมดเวลา ลองอีกครั้ง'
                  : routeComplete
                  ? `Correct! This is a ${current.animal}. · ใช่แล้ว!`
                  : wrongExit
                    ? 'That is not a match. Try another name. · ลองเลือกชื่ออื่น'
                    : ''}
              </p>
            </div>

            <div
              className={styles.grid}
              style={
                {
                  '--grid-size': gridSize,
                  '--grid-scale': gridSize / GRID_SIZE,
                } as React.CSSProperties
              }
              role="group"
              aria-label={`${gridSize} by ${gridSize} pipe board`}
            >
              {Array.from({ length: gridSize * gridSize }, (_, cellIndex) => {
                const isStart = cellIndex === START_CELL;
                const exit = exits.find((item) => item.cell === cellIndex);
                const isObstacle = obstacleCells.has(cellIndex);
                const pipe = pipes[cellIndex];
                const flowStep = flow.steps[cellIndex];
                const isConnected = flowStep >= 0;
                const row = Math.floor(cellIndex / gridSize) + 1;
                const column = (cellIndex % gridSize) + 1;

                if (isObstacle) {
                  return (
                    <div
                      className={`${styles.cell} ${styles.obstacleCell}`}
                      key={cellIndex}
                      role="img"
                      aria-label="Rock obstacle. Pipes cannot be placed here."
                    >
                      <span className={styles.obstacleEmoji} aria-hidden="true">
                        🪨
                      </span>
                    </div>
                  );
                }

                if (isStart || exit) {
                  return (
                    <div
                      className={`${styles.cell} ${styles.terminal} ${isStart ? styles.startTerminal : styles.endTerminal} ${exit && isConnected ? (exit.isTarget ? styles.exitRight : styles.exitWrong) : ''}`}
                      key={cellIndex}
                      role="img"
                      aria-label={
                        isStart
                          ? `Picture of a ${current.animal}`
                          : `Exit: ${exit?.round.animal}`
                      }
                    >
                      <PipeArtwork
                        terminal={isStart ? 'start' : 'end'}
                        connected={isConnected}
                        flowing={waterFlowing && isConnected}
                        flowDelaySeconds={flowStep * flowDurationSeconds}
                        flowDurationSeconds={flowDurationSeconds}
                        flowIncoming={flow.incoming[cellIndex]}
                        flowOutgoing={flow.outgoing[cellIndex]}
                      />
                      {isStart ? (
                        <span className={styles.terminalEmoji}>
                          {current.animalEmoji}
                        </span>
                      ) : (
                        <span className={styles.terminalLabel}>
                          {exit?.round.animal}
                        </span>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    className={styles.pipeCell}
                    key={cellIndex}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleCellDrop(event, cellIndex)}
                  >
                    <button
                      className={`${styles.cell} ${pipe ? styles.occupiedCell : styles.emptyCell} ${isConnected ? styles.connectedCell : ''}`}
                      data-grid-cell={cellIndex}
                      type="button"
                      draggable={Boolean(pipe)}
                      aria-label={`Row ${row}, column ${column}, ${pipe ? `${pipe.kind} pipe${pipe.kind === 'cross' ? '' : pipe.kind === selectedPipe.kind ? '. Click to rotate clockwise' : '. Click to replace with selected pipe'}` : 'empty cell'}${isConnected ? ', connected to start' : ''}`}
                      title={
                        pipe && pipe.kind !== selectedPipe.kind
                          ? 'Click to replace with selected pipe'
                          : undefined
                      }
                      onClick={() => handleCellClick(cellIndex)}
                      onDragStart={(event) => {
                        if (!pipe) return;
                        event.dataTransfer.setData(
                          PIPE_DRAG_TYPE,
                          `${pipe.kind}:${pipe.rotation}`,
                        );
                        event.dataTransfer.setData(
                          PIPE_SOURCE_TYPE,
                          String(cellIndex),
                        );
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                    >
                      {pipe ? (
                        <PipeArtwork
                          piece={pipe}
                          connected={isConnected}
                          flowing={waterFlowing && isConnected}
                          flowDelaySeconds={flowStep * flowDurationSeconds}
                          flowDurationSeconds={flowDurationSeconds}
                          flowIncoming={flow.incoming[cellIndex]}
                          flowOutgoing={flow.outgoing[cellIndex]}
                        />
                      ) : null}
                    </button>
                    {pipe && pipe.kind !== 'cross' ? (
                      <button
                        className={styles.rotateButton}
                        type="button"
                        draggable={false}
                        aria-label={`Rotate ${pipe.kind} pipe clockwise`}
                        title="Rotate pipe clockwise"
                        onClick={() => rotatePipe(cellIndex)}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <path
                            d="M20 7v5h-5M20 12a8 8 0 1 1-2.34-5.66L20 9"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                          />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <aside className={styles.toolPanel} aria-label="Pipe pieces">
            <div className={styles.toolGrid}>
              {PIPE_TOOLS.map((tool) => {
                const selected =
                  selectedPipe.kind === tool.piece.kind &&
                  selectedPipe.rotation === tool.piece.rotation;
                return (
                  <button
                    className={`${styles.toolButton} ${selected ? styles.selectedTool : ''}`}
                    key={tool.id}
                    type="button"
                    draggable
                    aria-pressed={selected}
                    aria-label={tool.description}
                    title={tool.description}
                    onClick={() => setSelectedPipe(tool.piece)}
                    onDragStart={(event) => {
                      setSelectedPipe(tool.piece);
                      event.dataTransfer.setData(
                        PIPE_DRAG_TYPE,
                        `${tool.piece.kind}:${tool.piece.rotation}`,
                      );
                      event.dataTransfer.effectAllowed = 'copy';
                    }}
                  >
                    <PipeArtwork piece={tool.piece} connected={false} />
                  </button>
                );
              })}
            </div>
            <button
              className={styles.clearButton}
              type="button"
              aria-label="Hear the animal's name"
              onClick={() => speak(current.animal)}
            >
              🔊 Hear the word · ฟังคำศัพท์
            </button>
            {waterArrived && !lessonComplete ? (
              <button
                className={styles.nextButton}
                type="button"
                onClick={nextRound}
              >
                {isLastRound ? 'Next level' : 'Next animal'} ·{' '}
                {isLastRound ? 'ด่านต่อไป' : 'สัตว์ตัวต่อไป'} →
              </button>
            ) : null}
            {lessonComplete ? (
              <Link href="/games/starter" className={styles.nextButton}>
                All done! · กลับไปหน้าบทเรียน
              </Link>
            ) : null}
            <button
              className={styles.clearButton}
              type="button"
              onClick={clearBoard}
            >
              Clear board
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function EmptyGrid() {
  return (
    <>
      <EmptyGridContent />
      <GameStatsFooter game="starter" totalLessons={7} />
    </>
  );
}
