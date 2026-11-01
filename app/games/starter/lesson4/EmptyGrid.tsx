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
import { ANIMAL_LEVELS, EXIT_ROWS, ROUNDS_PER_LEVEL, type AnimalRound } from './animals';

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
const LEVEL_GRID_SIZES = [5, 6, 7, 8];
const FINISHED_LEVELS_KEY = 'playland.starter.lesson4.finishedLevelFlags';
// Building time before the water starts, and the time the water then has; more for two-animal levels.
const FLOW_START_DELAY_SECONDS = 5;
const FARM_BUILD_SECONDS = 10;
const ROUND_TIME_LIMIT_SECONDS = 10;
const DUAL_TIME_MULTIPLIER = 3;
// Two-animal levels flow at half speed.
const DUAL_FLOW_SLOWDOWN = 2;

function timeScale(levelIndex: number): number {
  return ANIMAL_LEVELS[levelIndex].dual ? DUAL_TIME_MULTIPLIER : 1;
}

function buildSeconds(levelIndex: number): number {
  return levelIndex === 0
    ? FARM_BUILD_SECONDS
    : FLOW_START_DELAY_SECONDS * timeScale(levelIndex);
}
const FLOW_DURATION_SECONDS = 3.575;
const COMPLETE_FLOW_SPEEDUP = 10;
const PIPE_DRAG_TYPE = 'application/x-playland-pipe';
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

type FlowResult = {
  steps: number[];
  incoming: Array<Direction | null>;
  outgoing: Direction[][];
};

function getFlowSteps(
  pipes: Array<PipePiece | null>,
  startCell: number,
  startCells: number[],
  exitCells: number[],
  obstacleCells: ReadonlySet<number>,
  gridSize: number,
  crossPassesStraight: boolean,
): FlowResult {
  const flowSteps = Array<number>(CELL_COUNT).fill(-1);
  const incoming = Array<Direction | null>(CELL_COUNT).fill(null);
  const outgoing: Direction[][] = Array.from(
    { length: CELL_COUNT },
    () => [],
  );
  const queue = [startCell];
  flowSteps[startCell] = 0;

  const openingsOf = (cell: number): Direction[] =>
    obstacleCells.has(cell)
      ? []
      : startCells.includes(cell)
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
    const entered = incoming[current];
    const leaving =
      crossPassesStraight && entered && pipes[current]?.kind === 'cross'
        ? [OPPOSITE[entered]]
        : openingsOf(current);

    for (const direction of leaving) {
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
        !startCells.includes(nextCell) &&
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
  startCells: number[],
  exitCells: number[],
  gridSize: number,
): boolean {
  // Exits only accept water from the west and are dead ends; starts only open east.
  const reachesAllExits = (start: number): boolean => {
    const reachable = new Set([start]);
    const queue = [start];

    for (let cursor = 0; cursor < queue.length; cursor++) {
      const cell = queue[cursor];
      const row = Math.floor(cell / gridSize);
      const column = cell % gridSize;

      for (const direction of cell === start ? ['east' as const] : DIRECTIONS) {
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
          obstacleCells.has(nextCell) ||
          reachable.has(nextCell) ||
          startCells.includes(nextCell)
        ) {
          continue;
        }
        if (exitCells.includes(nextCell)) {
          if (direction === 'east') reachable.add(nextCell);
          continue;
        }
        reachable.add(nextCell);
        queue.push(nextCell);
      }
    }

    return exitCells.every((cell) => reachable.has(cell));
  };

  return startCells.every(reachesAllExits);
}

type RoutedPath = { cells: number[]; headings: Direction[] };

// BFS for one animal's route. Cells in `crossings` (the other route's straight
// cells) may only be crossed straight and perpendicular, where a cross pipe goes.
function findRoute(
  from: number,
  to: number,
  obstacleCells: ReadonlySet<number>,
  startCells: number[],
  exitCells: number[],
  gridSize: number,
  directionOrder: Direction[],
  crossings: ReadonlyMap<number, 'horizontal' | 'vertical'>,
): RoutedPath | null {
  const key = (cell: number, heading: Direction) =>
    cell * 4 + DIRECTIONS.indexOf(heading);
  const parent = new Map<number, number>();
  const queue: Array<{ cell: number; heading: Direction }> = [
    { cell: from, heading: 'east' },
  ];
  parent.set(key(from, 'east'), -1);

  for (let cursor = 0; cursor < queue.length; cursor++) {
    const { cell, heading } = queue[cursor];
    const row = Math.floor(cell / gridSize);
    const column = cell % gridSize;
    const options: Direction[] =
      cell === from ? ['east'] : crossings.has(cell) ? [heading] : directionOrder;

    for (const direction of options) {
      const nextRow = row + MOVEMENT[direction].row;
      const nextColumn = column + MOVEMENT[direction].column;
      if (
        nextRow < 0 ||
        nextRow >= gridSize ||
        nextColumn < 0 ||
        nextColumn >= gridSize
      ) {
        continue;
      }
      const next = nextRow * gridSize + nextColumn;
      const stateKey = key(next, direction);
      if (parent.has(stateKey) || obstacleCells.has(next)) continue;

      if (next === to) {
        if (direction !== 'east') continue;
      } else if (startCells.includes(next) || exitCells.includes(next)) {
        continue;
      }
      const crossing = crossings.get(next);
      if (crossing) {
        const horizontal = direction === 'east' || direction === 'west';
        if (horizontal === (crossing === 'horizontal')) continue;
      }

      parent.set(stateKey, key(cell, heading));
      if (next === to) {
        const cells = [to];
        const headings: Direction[] = [direction];
        let walker = key(cell, heading);
        while (walker !== -1) {
          cells.unshift(Math.floor(walker / 4));
          headings.unshift(DIRECTIONS[walker % 4]);
          walker = parent.get(walker) ?? -1;
        }
        return { cells, headings };
      }
      queue.push({ cell: next, heading: direction });
    }
  }

  return null;
}

// Two animals must reach their own names at the same time. Routes may only share
// cells where one goes straight across the other (a cross pipe).
function areRoutesSolvable(
  obstacleCells: ReadonlySet<number>,
  startCells: number[],
  targets: number[],
  exitCells: number[],
  gridSize: number,
): boolean {
  for (const [first, second] of [
    [0, 1],
    [1, 0],
  ]) {
    for (let shift = 0; shift < DIRECTIONS.length; shift++) {
      const order = [...DIRECTIONS.slice(shift), ...DIRECTIONS.slice(0, shift)];
      const firstRoute = findRoute(
        startCells[first],
        targets[first],
        obstacleCells,
        startCells,
        exitCells,
        gridSize,
        order,
        new Map(),
      );
      if (!firstRoute) continue;

      const straightCells = new Map<number, 'horizontal' | 'vertical'>();
      const usedCells = new Set<number>();
      firstRoute.cells.forEach((cell, index) => {
        usedCells.add(cell);
        const heading = firstRoute.headings[index];
        if (
          index > 0 &&
          index < firstRoute.cells.length - 1 &&
          heading === firstRoute.headings[index + 1]
        ) {
          straightCells.set(
            cell,
            heading === 'east' || heading === 'west' ? 'horizontal' : 'vertical',
          );
        }
      });
      // Cells where the first route turns are off limits to the second.
      const blocked = new Set(obstacleCells);
      usedCells.forEach((cell) => {
        if (
          !straightCells.has(cell) &&
          cell !== startCells[first] &&
          cell !== targets[first]
        ) {
          blocked.add(cell);
        }
      });

      for (let secondShift = 0; secondShift < DIRECTIONS.length; secondShift++) {
        const secondOrder = [
          ...DIRECTIONS.slice(secondShift),
          ...DIRECTIONS.slice(0, secondShift),
        ];
        if (
          findRoute(
            startCells[second],
            targets[second],
            blocked,
            startCells,
            exitCells,
            gridSize,
            secondOrder,
            straightCells,
          )
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

function getObstacleCells(
  levelIndex: number,
  roundIndex: number,
  gridSize: number,
  startCells: number[],
  exitCells: number[],
  layoutSeed: number,
  targets?: number[],
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
  ).filter(
    (cell) => !startCells.includes(cell) && !exitCells.includes(cell),
  );

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
    if (
      !areExitsReachable(obstacles, startCells, exitCells, gridSize) ||
      (targets &&
        !areRoutesSolvable(obstacles, startCells, targets, exitCells, gridSize))
    ) {
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

// `owner` is the index of the start whose animal this name matches (null = decoy).
type Exit = { cell: number; round: AnimalRound; owner: number | null };
type Start = { cell: number; round: AnimalRound };

function randomLayoutSeed(): number {
  return Math.floor(Math.random() * 1000);
}

function shuffledIndices(length: number): number[] {
  const order = Array.from({ length }, (_, index) => index);
  for (let index = length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }
  return order;
}

const SLOT_ORDERS = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
];

// Animals on the left: one normally, two on dual levels (the second is the next in the list).
function buildStarts(
  levelIndex: number,
  animalIndex: number,
  gridSize: number,
): Start[] {
  const { rounds, dual } = ANIMAL_LEVELS[levelIndex];
  const starts: Start[] = [{ cell: 0, round: rounds[animalIndex] }];
  if (dual) {
    starts.push({
      cell: (gridSize - 1) * gridSize,
      round: rounds[(animalIndex + 1) % rounds.length],
    });
  }
  return starts;
}

// Names on the right at fixed rows: each start's own name plus a decoy.
function buildExits(
  levelIndex: number,
  roundIndex: number,
  gridSize: number,
  layoutSeed: number,
): Exit[] {
  const { rounds, dual } = ANIMAL_LEVELS[levelIndex];
  const rows = EXIT_ROWS[
    (roundIndex + levelIndex + layoutSeed) % EXIT_ROWS.length
  ].map((row) => Math.round((row * (gridSize - 1)) / 7));

  if (dual) {
    const slots: Array<{ round: AnimalRound; owner: number | null }> = [
      { round: rounds[roundIndex], owner: 0 },
      { round: rounds[(roundIndex + 1) % rounds.length], owner: 1 },
      { round: rounds[(roundIndex + 2) % rounds.length], owner: null },
    ];
    const order = SLOT_ORDERS[layoutSeed % SLOT_ORDERS.length];
    return rows.map((row, slot) => ({
      cell: row * gridSize + gridSize - 1,
      ...slots[order[slot]],
    }));
  }

  const targetSlot = (roundIndex * 2 + levelIndex + layoutSeed) % rows.length;
  let distractor = 1;
  return rows.map((row, slot) => {
    const isTarget = slot === targetSlot;
    const source = isTarget
      ? rounds[roundIndex]
      : rounds[(roundIndex + distractor++) % rounds.length];
    return {
      cell: row * gridSize + gridSize - 1,
      round: source,
      owner: isTarget ? 0 : null,
    };
  });
}

type CellFlow = {
  incoming: Direction | null;
  outgoing: Direction[];
  delaySeconds: number;
};

function PipeArtwork({
  piece,
  terminal,
  connected,
  flowing = false,
  flowDurationSeconds = 1.625,
  flows = [],
}: {
  piece?: PipePiece;
  terminal?: 'start' | 'end';
  connected: boolean;
  flowing?: boolean;
  flowDurationSeconds?: number;
  flows?: CellFlow[];
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
        flows.flatMap((flow, flowIndex) => {
          const style = {
            animationDelay: `${flow.delaySeconds}s`,
            animationDuration: `${flowDurationSeconds}s`,
          };
          if (flow.outgoing.length > 0) {
            return flow.outgoing.map((direction) => {
              const flowPath = flow.incoming
                ? `M ${SVG_ENDPOINT[flow.incoming]} L 50 50 L ${SVG_ENDPOINT[direction]}`
                : `M 50 50 L ${SVG_ENDPOINT[direction]}`;
              return (
                <path
                  className={styles.flowingWater}
                  d={flowPath}
                  fill="none"
                  key={`${flowIndex}-${direction}`}
                  pathLength="100"
                  stroke="#9cf6ff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="9"
                  style={style}
                />
              );
            });
          }
          if (terminal === 'end' && flow.incoming) {
            return [
              <path
                className={styles.flowingWater}
                d={`M ${SVG_ENDPOINT[flow.incoming]} L 50 50`}
                fill="none"
                key={`${flowIndex}-end`}
                pathLength="100"
                stroke="#9cf6ff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="9"
                style={style}
              />,
            ];
          }
          return [];
        })}
    </svg>
  );
}

function EmptyGridContent() {
  const hasSavedCompletionRef = useRef(false);
  // True right after a tool is picked, so the next click on a different pipe replaces it.
  const toolJustChosenRef = useRef(false);
  // Last rotation the user gave each pipe kind; new pipes of that kind start with it.
  const lastRotationRef = useRef<Partial<Record<PipeKind, number>>>({});
  const waterStartedAtRef = useRef(0);
  const waterEndSecondsRef = useRef(0);
  const [tabVisible, setTabVisible] = useState(true);
  const [levelIndex, setLevelIndex] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  // The countdown starts at the first pipe placed or rotated.
  const [roundStarted, setRoundStarted] = useState(false);
  const [flowStarted, setFlowStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(buildSeconds(0));
  const [timedOut, setTimedOut] = useState(false);
  const [layoutSeed, setLayoutSeed] = useState(0);
  const [animalOrder, setAnimalOrder] = useState(() =>
    Array.from({ length: ANIMAL_LEVELS[0].rounds.length }, (_, index) => index),
  );
  const [waterArrived, setWaterArrived] = useState(false);
  const [debugOpen, setDebugOpen] = useState(true);
  const [finishedLevels, setFinishedLevels] = useState<boolean[]>(() =>
    ANIMAL_LEVELS.map(() => false),
  );
  const progressLoadedRef = useRef(false);
  const [pipes, setPipes] = useState<Array<PipePiece | null>>(() =>
    Array(CELL_COUNT).fill(null),
  );
  const [selectedPipe, setSelectedPipe] = useState<PipePiece>(
    PIPE_TOOLS[0].piece,
  );
  const level = ANIMAL_LEVELS[levelIndex];
  const animalIndex = animalOrder[roundIndex];
  const gridSize = LEVEL_GRID_SIZES[levelIndex];
  const starts = buildStarts(levelIndex, animalIndex, gridSize);
  const startCells = starts.map((start) => start.cell);
  const animalNames = starts.map((start) => start.round.animal).join(' and ');
  const exits = buildExits(levelIndex, animalIndex, gridSize, layoutSeed);
  const exitCells = exits.map((exit) => exit.cell);
  const obstacleCells = getObstacleCells(
    levelIndex,
    roundIndex,
    gridSize,
    startCells,
    exitCells,
    layoutSeed,
    level.dual
      ? starts.map(
          (_, startIndex) =>
            exits.find((exit) => exit.owner === startIndex)?.cell ?? exitCells[0],
        )
      : undefined,
  );
  const flows = starts.map((start) =>
    getFlowSteps(
      pipes,
      start.cell,
      startCells,
      exitCells,
      obstacleCells,
      gridSize,
      Boolean(level.dual),
    ),
  );
  const routeComplete = starts.every((_, startIndex) =>
    exits.some(
      (exit) =>
        exit.owner === startIndex && flows[startIndex].steps[exit.cell] >= 0,
    ),
  );
  const wrongExit = exits.find((exit) =>
    flows.some(
      (flow, startIndex) =>
        exit.owner !== startIndex && flow.steps[exit.cell] >= 0,
    ),
  );
  const flowDurationSeconds = routeComplete
    ? FLOW_DURATION_SECONDS / COMPLETE_FLOW_SPEEDUP
    : FLOW_DURATION_SECONDS * (level.dual ? DUAL_FLOW_SLOWDOWN : 1);
  const waterFlowing = flowStarted || routeComplete;
  const targetStep = Math.max(
    0,
    ...exits.map((exit) =>
      exit.owner === null ? 0 : flows[exit.owner].steps[exit.cell],
    ),
  );

  function cellFlows(cell: number): CellFlow[] {
    return flows.flatMap((flow) =>
      flow.steps[cell] >= 0
        ? [
            {
              incoming: flow.incoming[cell],
              outgoing: flow.outgoing[cell],
              delaySeconds: flow.steps[cell] * flowDurationSeconds,
            },
          ]
        : [],
    );
  }
  const isLastRound = roundIndex === ROUNDS_PER_LEVEL - 1;
  const lessonComplete =
    waterArrived && isLastRound && finishedLevels.every(Boolean);
  const completedLevels = finishedLevels.filter(Boolean).length;

  useEffect(() => {
    if (!routeComplete) return;

    const timeoutId = window.setTimeout(() => {
      setWaterArrived(true);
      if (isLastRound) {
        setFinishedLevels((value) =>
          value.map((done, index) => done || index === levelIndex),
        );
      }
    }, targetStep * flowDurationSeconds * 1000);
    return () => {
      window.clearTimeout(timeoutId);
      setWaterArrived(false);
    };
  }, [routeComplete, targetStep, flowDurationSeconds, isLastRound, levelIndex]);

  useEffect(() => {
    if (!progressLoadedRef.current) return;
    try {
      window.localStorage.setItem(
        FINISHED_LEVELS_KEY,
        JSON.stringify(finishedLevels),
      );
    } catch {
      // Storage can be unavailable (private mode); progress just won't persist.
    }
  }, [finishedLevels]);

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
    waterEndSecondsRef.current =
      Math.max(0, ...flows.flatMap((flow) => flow.steps)) * flowDurationSeconds;
  });

  // The countdown pauses while the tab is hidden.
  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (!roundStarted || routeComplete) return;

    const timeoutId = window.setTimeout(() => {
      if (!tabVisible) return;
      if (timeLeft <= 1) {
        if (!flowStarted) {
          waterStartedAtRef.current = Date.now();
          setFlowStarted(true);
          setTimeLeft(ROUND_TIME_LIMIT_SECONDS * timeScale(levelIndex));
        } else if (
          (Date.now() - waterStartedAtRef.current) / 1000 <
          waterEndSecondsRef.current
        ) {
          // Water is still advancing along the pipes, so don't reset yet.
          setTimeLeft(1);
        } else {
          recordAnswer('starter', false);
          // Keep the board visible for a moment; the reset effect below clears it.
          setTimedOut(true);
          setRoundStarted(false);
        }
        return;
      }

      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [flowStarted, roundStarted, routeComplete, timeLeft, levelIndex, tabVisible]);

  function startFreshBoard(): void {
    setTimedOut(false);
    setLayoutSeed(randomLayoutSeed());
    setPipes(Array(CELL_COUNT).fill(null));
    setFlowStarted(false);
    setTimeLeft(buildSeconds(levelIndex));
  }

  // The child gets time to look at the board; it resets on the button or after a pause.
  useEffect(() => {
    if (!timedOut) return;

    const timeoutId = window.setTimeout(startFreshBoard, 10000);
    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timedOut]);

  useEffect(() => {
    if (waterArrived) speak(animalNames);
  }, [waterArrived, animalNames]);

  useEffect(() => {
    pingLessonOpen('starter');
    // Saved progress and random layout are read after mount to avoid a hydration mismatch.
    const timeoutId = window.setTimeout(() => {
      let saved: unknown = null;
      try {
        saved = JSON.parse(
          window.localStorage.getItem(FINISHED_LEVELS_KEY) ?? 'null',
        );
      } catch {
        saved = null;
      }
      progressLoadedRef.current = true;
      if (Array.isArray(saved)) {
        setFinishedLevels(ANIMAL_LEVELS.map((_, index) => saved[index] === true));
      }
      setLayoutSeed(randomLayoutSeed());
      setAnimalOrder(shuffledIndices(ANIMAL_LEVELS[0].rounds.length));
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  function startLevel(index: number): void {
    setLevelIndex(index);
    setRoundIndex(0);
    setAnimalOrder(shuffledIndices(ANIMAL_LEVELS[index].rounds.length));
    setLayoutSeed(randomLayoutSeed());
    setWaterArrived(false);
    setPipes(Array(CELL_COUNT).fill(null));
    setRoundStarted(false);
    setFlowStarted(false);
    setTimeLeft(buildSeconds(index));
    setTimedOut(false);
  }

  function nextRound(): void {
    if (isLastRound) {
      startLevel((levelIndex + 1) % ANIMAL_LEVELS.length);
      return;
    }
    setRoundIndex((value) => value + 1);
    setLayoutSeed(randomLayoutSeed());
    setWaterArrived(false);
    setPipes(Array(CELL_COUNT).fill(null));
    setRoundStarted(false);
    setFlowStarted(false);
    setTimeLeft(buildSeconds(levelIndex));
    setTimedOut(false);
  }

  function placePipe(cellIndex: number, piece: PipePiece): void {
    if (timedOut) return;
    if (startCells.includes(cellIndex) || exitCells.includes(cellIndex)) return;
    toolJustChosenRef.current = false;
    setRoundStarted(true);
    setTimedOut(false);
    const rotation = lastRotationRef.current[piece.kind] ?? piece.rotation;
    setPipes((current) => {
      const next = [...current];
      next[cellIndex] = { ...piece, rotation };
      return next;
    });
  }

  function handleCellClick(cellIndex: number): void {
    if (startCells.includes(cellIndex) || exitCells.includes(cellIndex)) return;

    const existing = pipes[cellIndex];
    const replaceRequested =
      toolJustChosenRef.current && existing?.kind !== selectedPipe.kind;
    if (existing && !replaceRequested) {
      rotatePipe(cellIndex);
      return;
    }

    placePipe(cellIndex, selectedPipe);
  }

  function rotatePipe(cellIndex: number): void {
    if (timedOut) return;
    toolJustChosenRef.current = false;
    setRoundStarted(true);
    setTimedOut(false);
    setPipes((current) => {
      const next = [...current];
      const pipe = next[cellIndex];
      if (!pipe || pipe.kind === 'cross') return current;
      const rotation = (pipe.rotation + 1) % DIRECTIONS.length;
      lastRotationRef.current[pipe.kind] = rotation;
      next[cellIndex] = { ...pipe, rotation };
      return next;
    });
  }

  function handleCellDrop(
    event: React.DragEvent<HTMLDivElement>,
    cellIndex: number,
  ): void {
    event.preventDefault();
    if (startCells.includes(cellIndex) || exitCells.includes(cellIndex)) return;

    const droppedPipe = parseDraggedPipe(
      event.dataTransfer.getData(PIPE_DRAG_TYPE),
    );
    if (droppedPipe) placePipe(cellIndex, droppedPipe);
  }

  function clearBoard(): void {
    setPipes(Array(CELL_COUNT).fill(null));
    setRoundStarted(false);
    setFlowStarted(false);
    setTimeLeft(buildSeconds(levelIndex));
  }

  return (
    <main
      className={`${styles.page} ${levelIndex === 0 ? styles.farmTheme : ''} ${levelIndex === 1 ? styles.petsTheme : ''} ${level.dual ? styles.wildTheme : ''}`}
    >
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
                const done = finishedLevels[index];
                const active = index === levelIndex;
                const label = (
                  <>
                    <span className={styles.levelNumber}>
                      {done ? '✓' : index + 1}
                    </span>
                    <span>
                      {item.title} ·{' '}
                      <span lang="th">{item.titleTh}</span>
                    </span>
                  </>
                );
                return (
                  <li
                    key={item.title}
                    className={`${styles.level} ${[styles.tabFarm, styles.tabPets, styles.tabWild, styles.tabSea][index]} ${active ? styles.levelCurrent : done ? styles.levelDone : ''}`}
                    aria-current={active ? 'step' : undefined}
                  >
                    {active ? (
                      label
                    ) : (
                      <button
                        className={styles.levelButton}
                        type="button"
                        onClick={() => startLevel(index)}
                      >
                        {label}
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>

            <div className={styles.boardHeading}>
              <p className={styles.status} aria-live="polite">
                {timedOut
                  ? 'Time is up! Do not worry, try again. · หมดเวลาแล้ว ไม่เป็นไร ลองอีกครั้งนะ'
                  : routeComplete
                  ? `Correct! ${starts.length > 1 ? `These are a ${starts[0].round.animal} and a ${starts[1].round.animal}` : `This is a ${animalNames}`}. · ใช่แล้ว!`
                  : wrongExit
                    ? 'That is not a match. Try another name. · ลองเลือกชื่ออื่น'
                    : level.dual
                      ? 'Connect each animal to its own name. · ต่อสัตว์แต่ละตัวไปที่ชื่อของมัน'
                      : ''}
              </p>
              {timedOut ? (
                <button
                  type="button"
                  className={styles.tryAgain}
                  onClick={startFreshBoard}
                >
                  🔄 Try again · ลองอีกครั้ง
                </button>
              ) : null}
              {!routeComplete && !flowStarted ? (
                <p className={styles.countdown} aria-live="off">
                  ⏳ Water starts in{' '}
                  <span className={timeLeft < 7 ? styles.countdownUrgent : undefined}>
                    {timeLeft}s
                  </span>{' '}
                  · น้ำจะไหลใน{' '}
                  <span className={timeLeft < 7 ? styles.countdownUrgent : undefined}>
                    {timeLeft}
                  </span>{' '}
                  วินาที
                </p>
              ) : null}
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
                const start = starts.find((item) => item.cell === cellIndex);
                const isStart = Boolean(start);
                const exit = exits.find((item) => item.cell === cellIndex);
                const isObstacle = obstacleCells.has(cellIndex);
                const pipe = pipes[cellIndex];
                const cellFlowList = cellFlows(cellIndex);
                const isConnected = cellFlowList.length > 0;
                const exitMatched =
                  exit !== undefined &&
                  exit.owner !== null &&
                  flows[exit.owner].steps[cellIndex] >= 0;
                const row = Math.floor(cellIndex / gridSize) + 1;
                const column = (cellIndex % gridSize) + 1;

                if (isObstacle) {
                  return (
                    <div
                      className={`${styles.cell} ${styles.obstacleCell}`}
                      key={cellIndex}
                      role="img"
                      aria-label={`${level.obstacle.name} obstacle. Pipes cannot be placed here.`}
                    >
                      <span className={styles.obstacleEmoji} aria-hidden="true">
                        {level.obstacle.emoji}
                      </span>
                    </div>
                  );
                }

                if (isStart || exit) {
                  return (
                    <div
                      className={`${styles.cell} ${styles.terminal} ${isStart ? styles.startTerminal : styles.endTerminal}                       ${exit && isConnected ? (exitMatched ? styles.exitRight : styles.exitWrong) : ''}`}
                                            key={cellIndex}
                                            role="img"
                                            aria-label={
                                              start
                                                ? `Picture of a ${start.round.animal}`
                                                : `Exit: ${exit?.round.animal}`
                                            }
                                          >
                                            <PipeArtwork
                                              terminal={isStart ? 'start' : 'end'}
                                              connected={isConnected}
                                              flowing={waterFlowing && isConnected}
                                              flowDurationSeconds={flowDurationSeconds}
                                              flows={cellFlowList}
                                            />
                                            {start ? (
                                              <span className={styles.terminalEmoji}>
                                                {start.round.animalEmoji}
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
                      draggable={false}
                      aria-label={`Row ${row}, column ${column}, ${pipe ? `${pipe.kind} pipe${pipe.kind === 'cross' ? '' : '. Click to rotate clockwise'}` : 'empty cell'}${isConnected ? ', connected to start' : ''}`}
                      title={
                        pipe && pipe.kind !== 'cross'
                          ? 'Click to rotate clockwise'
                          : undefined
                      }
                      onClick={() => handleCellClick(cellIndex)}
                    >
                      {pipe ? (
                        <PipeArtwork
                          piece={pipe}
                          connected={isConnected}
                          flowing={waterFlowing && isConnected}
                          flowDurationSeconds={flowDurationSeconds}
                          flows={cellFlowList}
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
                    onClick={() => {
                      toolJustChosenRef.current = true;
                      setSelectedPipe(tool.piece);
                    }}
                    onDragStart={(event) => {
                      toolJustChosenRef.current = true;
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
              onClick={() => speak(animalNames)}
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
      <aside className={styles.debugOverlay} aria-label="Debug overlay">
        <button
          className={styles.debugToggle}
          type="button"
          onClick={() => setDebugOpen((value) => !value)}
        >
          🐞 Debug {debugOpen ? '–' : '+'}
        </button>
        {debugOpen ? (
          <pre className={styles.debugText}>
            {[
              `pipes: ${pipes.filter(Boolean).length}`,
              `started: ${roundStarted}  flowStarted: ${flowStarted}`,
              `timeLeft: ${timeLeft}s  (${flowStarted ? 'water phase' : 'build phase'})`,
              `flow/cell: ${flowDurationSeconds.toFixed(3)}s`,
              ...flows.map(
                (flow, i) =>
                  `water ${i} (${starts[i].round.animal}): ${flow.steps.filter((s) => s >= 0).length} cells, reaches: ${exits.filter((e) => flow.steps[e.cell] >= 0).map((e) => e.round.animal).join(', ') || '-'}`,
              ),
              `routeComplete: ${routeComplete}  wrongExit: ${wrongExit?.round.animal ?? '-'}`,
              `waterArrived: ${waterArrived}  timedOut: ${timedOut}`,
              `finished: ${finishedLevels.map((d) => (d ? '✓' : '·')).join(' ')}`,
            ].join('\n')}
          </pre>
        ) : null}
      </aside>
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
