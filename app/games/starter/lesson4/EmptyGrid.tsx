'use client';

import Image from 'next/image';
import MusicToggle from '../../../_components/MusicToggle';
import UnlockToast from '../_components/UnlockToast';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import lessonHeaderStyles from '../lesson1/ColorsSvgViewer.module.css';
import { pingLessonOpen, saveProgressDelta } from '@/app/_lib/client/progress';
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
const ROUNDS_PER_LEVEL = 4;
const ROUND_TIME_LIMIT_SECONDS = 10;
const FLOW_STEP_DELAY_SECONDS = 0.55;
const FLOW_ANIMATION_DURATION_SECONDS = 0.65;
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
    id: 'vertical',
    label: 'Vertical',
    description: 'Vertical straight pipe',
    piece: { kind: 'straight', rotation: 1 },
  },
  {
    id: 'cross',
    label: 'Cross',
    description: 'Four-way cross pipe',
    piece: { kind: 'cross', rotation: 0 },
  },
  {
    id: 'corner-ne',
    label: 'Corner N-E',
    description: 'Corner pipe open north and east',
    piece: { kind: 'corner', rotation: 0 },
  },
  {
    id: 'corner-es',
    label: 'Corner E-S',
    description: 'Corner pipe open east and south',
    piece: { kind: 'corner', rotation: 1 },
  },
  {
    id: 'corner-sw',
    label: 'Corner S-W',
    description: 'Corner pipe open south and west',
    piece: { kind: 'corner', rotation: 2 },
  },
  {
    id: 'corner-wn',
    label: 'Corner W-N',
    description: 'Corner pipe open west and north',
    piece: { kind: 'corner', rotation: 3 },
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

  for (let cursor = 0; cursor < queue.length; cursor++) {
    const cell = queue[cursor];
    const row = Math.floor(cell / gridSize);
    const column = cell % gridSize;

    for (const direction of DIRECTIONS) {
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
      if (!obstacleCells.has(nextCell) && !reachable.has(nextCell)) {
        reachable.add(nextCell);
        queue.push(nextCell);
      }
    }
  }

  return exitCells.every((cell) => reachable.has(cell));
}

function getObstacleCells(
  levelIndex: number,
  roundIndex: number,
  gridSize: number,
  exitCells: number[],
): Set<number> {
  let seed = (levelIndex + 1) * 1009 + (roundIndex + 1) * 7919 + gridSize;
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

// Target animal plus two choices from the same level, at fixed exits.
function buildExits(
  levelIndex: number,
  roundIndex: number,
  gridSize: number,
): Exit[] {
  const { rounds } = ANIMAL_LEVELS[levelIndex];
  const rows = EXIT_ROWS[(roundIndex + levelIndex) % EXIT_ROWS.length].map(
    (row) => Math.round((row * (gridSize - 1)) / 7),
  );
  const targetSlot = (roundIndex * 2 + levelIndex) % rows.length;
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
  flowIncoming,
  flowOutgoing = [],
}: {
  piece?: PipePiece;
  terminal?: 'start' | 'end';
  connected: boolean;
  flowing?: boolean;
  flowDelaySeconds?: number;
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
  const gradientId = `pipe-gradient-${useId().replace(/:/g, '')}`;
  const colors = terminal
    ? { rim: '#79452f', top: '#f4c18d', middle: '#bd754b', bottom: '#874b31' }
    : connected
      ? { rim: '#164c3c', top: '#c1ebcd', middle: '#4eae76', bottom: '#176c4a' }
      : {
          rim: '#263f3c',
          top: '#d0dfd5',
          middle: '#829d8f',
          bottom: '#3d6255',
        };
  const path = connections
    .map((direction) => `M 50 50 L ${SVG_ENDPOINT[direction as Direction]}`)
    .join(' ');

  return (
    <svg
      className={styles.pipeArtwork}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.top} />
          <stop offset="48%" stopColor={colors.middle} />
          <stop offset="100%" stopColor={colors.bottom} />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={colors.rim}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="27"
      />
      <path
        d={path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="20"
      />
      <path
        d={path}
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
        opacity="0.48"
        transform="translate(-2 -2)"
      />
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
                  style={{ animationDelay: `${flowDelaySeconds}s` }}
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
                  style={{ animationDelay: `${flowDelaySeconds}s` }}
                />
              ))}
      {(piece || terminal) && (
        <g>
          <circle cx="50" cy="50" r="13" fill={colors.rim} />
          <circle cx="50" cy="50" r="9.5" fill={`url(#${gradientId})`} />
          <ellipse
            cx="46"
            cy="43"
            rx="4.5"
            ry="2.2"
            fill="#fff"
            opacity="0.5"
          />
        </g>
      )}
    </svg>
  );
}

function EmptyGridContent() {
  const hasSavedCompletionRef = useRef(false);
  const [levelIndex, setLevelIndex] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundStarted, setRoundStarted] = useState(false);
  const [flowStarted, setFlowStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_LIMIT_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const [pipes, setPipes] = useState<Array<PipePiece | null>>(() =>
    Array(CELL_COUNT).fill(null),
  );
  const [selectedPipe, setSelectedPipe] = useState<PipePiece>(
    PIPE_TOOLS[0].piece,
  );
  const level = ANIMAL_LEVELS[levelIndex];
  const current = level.rounds[roundIndex];
  const gridSize = LEVEL_GRID_SIZES[levelIndex];
  const exits = buildExits(levelIndex, roundIndex, gridSize);
  const exitCells = exits.map((exit) => exit.cell);
  const obstacleCells = getObstacleCells(
    levelIndex,
    roundIndex,
    gridSize,
    exitCells,
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
  const maxFlowStep = Math.max(0, ...flow.steps);
  const flowStepDelaySeconds = Math.min(
    FLOW_STEP_DELAY_SECONDS,
    (ROUND_TIME_LIMIT_SECONDS - FLOW_ANIMATION_DURATION_SECONDS) /
      (maxFlowStep + 1),
  );
  const isLastRound = roundIndex === ROUNDS_PER_LEVEL - 1;
  const isLastLevel = levelIndex === ANIMAL_LEVELS.length - 1;
  const lessonComplete = routeComplete && isLastRound && isLastLevel;
  const completedLevels =
    levelIndex + (routeComplete && isLastRound ? 1 : 0);

  useEffect(() => {
    if (!lessonComplete || hasSavedCompletionRef.current) return;
    hasSavedCompletionRef.current = true;

    void saveProgressDelta('starter', { unlocked_lessons: 5 });
  }, [lessonComplete]);

  useEffect(() => {
    if (!roundStarted || (flowStarted && routeComplete)) return;

    const timeoutId = window.setTimeout(() => {
      if (timeLeft <= 1) {
        if (!flowStarted) {
          setFlowStarted(true);
          setTimeLeft(ROUND_TIME_LIMIT_SECONDS);
        } else {
          setPipes(Array(CELL_COUNT).fill(null));
          setRoundStarted(false);
          setFlowStarted(false);
          setTimeLeft(ROUND_TIME_LIMIT_SECONDS);
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
    if (routeComplete) speak(current.animal);
  }, [routeComplete, current.animal]);

  useEffect(() => {
    pingLessonOpen('starter');
  }, []);

  function nextRound(): void {
    if (isLastRound) {
      setLevelIndex((value) => value + 1);
      setRoundIndex(0);
    } else {
      setRoundIndex((value) => value + 1);
    }
    setPipes(Array(CELL_COUNT).fill(null));
    setRoundStarted(false);
    setFlowStarted(false);
    setTimeLeft(ROUND_TIME_LIMIT_SECONDS);
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
    placePipe(cellIndex, selectedPipe);
  }

  function handleCellDrop(
    event: React.DragEvent<HTMLButtonElement>,
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
                    <span>{item.title}</span>
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
                    : `Round ${roundIndex + 1} of ${ROUNDS_PER_LEVEL}: connect the picture to its name. Avoid the rocks; pipes cannot go there. · อย่าวางท่อตรงหิน`}
              </p>
              <div className={styles.timer} aria-live="off">
                <span>⏱</span>
                <span>
                  {!roundStarted
                    ? `${ROUND_TIME_LIMIT_SECONDS}s to connect`
                    : !flowStarted
                      ? `Water starts in ${timeLeft}s`
                      : routeComplete
                      ? 'Route complete!'
                      : `${timeLeft}s remaining`}
                </span>
                <progress
                  className={styles.timerProgress}
                  max={ROUND_TIME_LIMIT_SECONDS}
                  value={roundStarted && !routeComplete ? timeLeft : ROUND_TIME_LIMIT_SECONDS}
                  aria-label={`${roundStarted && !routeComplete ? timeLeft : ROUND_TIME_LIMIT_SECONDS} seconds`}
                />
              </div>
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
                        flowing={flowStarted && isConnected}
                        flowDelaySeconds={flowStep * flowStepDelaySeconds}
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
                  <button
                    className={`${styles.cell} ${pipe ? styles.occupiedCell : styles.emptyCell} ${isConnected ? styles.connectedCell : ''}`}
                    data-grid-cell={cellIndex}
                    key={cellIndex}
                    type="button"
                    draggable={Boolean(pipe)}
                    aria-label={`Row ${row}, column ${column}, ${pipe ? `${pipe.kind} pipe` : 'empty cell'}${isConnected ? ', connected to start' : ''}`}
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
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleCellDrop(event, cellIndex)}
                  >
                    {pipe ? (
                      <PipeArtwork
                        piece={pipe}
                        connected={isConnected}
                        flowing={flowStarted && isConnected}
                        flowDelaySeconds={flowStep * flowStepDelaySeconds}
                        flowIncoming={flow.incoming[cellIndex]}
                        flowOutgoing={flow.outgoing[cellIndex]}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className={styles.toolPanel} aria-label="Pipe pieces">
            <h2 className={styles.panelTitle}>Pipe pieces</h2>
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
                    <span>{tool.label}</span>
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
            {routeComplete && !lessonComplete ? (
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
