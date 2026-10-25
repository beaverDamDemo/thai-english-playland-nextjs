'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import lessonHeaderStyles from '../lesson1/ColorsSvgViewer.module.css';
import { pingLessonOpen, saveProgressDelta } from '@/app/_lib/client/progress';
import styles from './EmptyGrid.module.css';

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
const START_CELL = 0;
const END_CELL = 3 * GRID_SIZE + GRID_SIZE - 1;
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

function getConnectedCells(pipes: Array<PipePiece | null>): boolean[] {
  const connected = Array<boolean>(CELL_COUNT).fill(false);
  const queue = [START_CELL];
  connected[START_CELL] = true;

  for (let cursor = 0; cursor < queue.length; cursor++) {
    const current = queue[cursor];
    const row = Math.floor(current / GRID_SIZE);
    const column = current % GRID_SIZE;
    const openings: Direction[] =
      current === START_CELL
        ? ['east']
        : current === END_CELL
          ? ['west']
          : pipes[current]
            ? getPipeConnections(pipes[current])
            : [];

    for (const direction of openings) {
      const movement = MOVEMENT[direction];
      const nextRow = row + movement.row;
      const nextColumn = column + movement.column;
      if (
        nextRow < 0 ||
        nextRow >= GRID_SIZE ||
        nextColumn < 0 ||
        nextColumn >= GRID_SIZE
      ) {
        continue;
      }

      const nextCell = nextRow * GRID_SIZE + nextColumn;
      const neighborOpenings: Direction[] =
        nextCell === START_CELL
          ? ['east']
          : nextCell === END_CELL
            ? ['west']
            : pipes[nextCell]
              ? getPipeConnections(pipes[nextCell])
              : [];

      if (
        neighborOpenings.includes(OPPOSITE[direction]) &&
        !connected[nextCell]
      ) {
        connected[nextCell] = true;
        queue.push(nextCell);
      }
    }
  }

  return connected;
}

function PipeArtwork({
  piece,
  terminal,
  connected,
}: {
  piece?: PipePiece;
  terminal?: 'start' | 'end';
  connected: boolean;
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

export default function EmptyGrid() {
  const hasSavedCompletionRef = useRef(false);
  const [pipes, setPipes] = useState<Array<PipePiece | null>>(() =>
    Array(CELL_COUNT).fill(null),
  );
  const [selectedPipe, setSelectedPipe] = useState<PipePiece>(
    PIPE_TOOLS[0].piece,
  );
  const connectedCells = getConnectedCells(pipes);
  const routeComplete = connectedCells[END_CELL];

  useEffect(() => {
    if (!routeComplete || hasSavedCompletionRef.current) return;
    hasSavedCompletionRef.current = true;

    void saveProgressDelta('starter', { unlocked_lessons: 5 });
  }, [routeComplete]);

  useEffect(() => {
    pingLessonOpen('starter');
  }, []);

  function placePipe(cellIndex: number, piece: PipePiece): void {
    if (cellIndex === START_CELL || cellIndex === END_CELL) return;
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
    if (cellIndex === START_CELL || cellIndex === END_CELL) return;

    const sourceText = event.dataTransfer.getData(PIPE_SOURCE_TYPE);
    const sourceIndex = Number(sourceText);
    if (sourceText && Number.isInteger(sourceIndex)) {
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
      <header className={lessonHeaderStyles.header}>
        <Link href="/games/starter" className={lessonHeaderStyles.back}>
          <Image
            src="/assets/tinified/back.png"
            alt="Back"
            width={34}
            height={34}
          />
        </Link>
        <h1 className={styles.headerTitle}>Pipe Connect</h1>
        <span className={styles.lessonTag}>LESSON 4</span>
      </header>

      <section className={styles.workspace} aria-label="Pipe connection game">
        <div className={styles.gameLayout}>
          <div className={styles.boardArea}>
            <div className={styles.boardHeading}>
              <h2 className={styles.boardTitle}>Connect the route</h2>
              <p className={styles.status} aria-live="polite">
                {routeComplete
                  ? 'The start now connects to the end.'
                  : 'Build a route from START to END.'}
              </p>
            </div>

            <div
              className={styles.grid}
              role="group"
              aria-label="8 by 8 pipe board"
            >
              {Array.from({ length: CELL_COUNT }, (_, cellIndex) => {
                const isStart = cellIndex === START_CELL;
                const isEnd = cellIndex === END_CELL;
                const pipe = pipes[cellIndex];
                const isConnected = connectedCells[cellIndex];
                const row = Math.floor(cellIndex / GRID_SIZE) + 1;
                const column = (cellIndex % GRID_SIZE) + 1;

                if (isStart || isEnd) {
                  return (
                    <div
                      className={`${styles.cell} ${styles.terminal} ${isStart ? styles.startTerminal : styles.endTerminal}`}
                      key={cellIndex}
                      role="img"
                      aria-label={
                        isStart ? 'Start, opens right' : 'End, opens left'
                      }
                    >
                      <PipeArtwork
                        terminal={isStart ? 'start' : 'end'}
                        connected={isConnected}
                      />
                      <span className={styles.terminalLabel}>
                        {isStart ? 'START' : 'END'}
                      </span>
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
                      <PipeArtwork piece={pipe} connected={isConnected} />
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
