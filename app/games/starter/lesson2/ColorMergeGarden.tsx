'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import styles from './ColorMergeGarden.module.css';
import lessonHeaderStyles from '../lesson1/ColorsSvgViewer.module.css';

type ColorName =
  | 'red'
  | 'blue'
  | 'yellow'
  | 'green'
  | 'orange'
  | 'purple'
  | 'pink'
  | 'brown'
  | 'black'
  | 'white'
  | 'gray'
  | 'cyan';
type Tile =
  | { id: number; color: ColorName; representation: 'word'; word: string }
  | { id: number; color: ColorName; representation: 'swatch' };

const COLORS: ColorName[] = [
  'red',
  'blue',
  'yellow',
  'green',
  'orange',
  'purple',
  'pink',
  'brown',
  'black',
  'white',
  'gray',
  'cyan',
];
function activeColorsForLevel(level: number): ColorName[] {
  return COLORS.slice(0, Math.min(6 + (level - 1) * 2, COLORS.length));
}

function createBoard(level: number, deterministic = false): (Tile | null)[] {
  const board: (Tile | null)[] = Array(36).fill(null);
  const availableSlots = Array.from({ length: 36 }, (_, index) => index);

  activeColorsForLevel(level).forEach((color, colorIndex) => {
    const wordTile: Tile = {
      id: colorIndex * 2,
      color,
      representation: 'word',
      word: color[0].toUpperCase() + color.slice(1).toLowerCase(),
    };
    const swatchTile: Tile = {
      id: colorIndex * 2 + 1,
      color,
      representation: 'swatch',
    };

    [wordTile, swatchTile].forEach((tile) => {
      const slot = deterministic
        ? (tile.id * 13 + 5) % 36
        : availableSlots.splice(
            Math.floor(Math.random() * availableSlots.length),
            1,
          )[0];
      board[slot] = tile;
    });
  });

  return board;
}

export default function ColorMergeGarden() {
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState(() => createBoard(1, true));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [matchedColors, setMatchedColors] = useState<ColorName[]>([]);
  const [lastMatchedColor, setLastMatchedColor] = useState<ColorName | null>(
    null,
  );
  const [message, setMessage] = useState('');
  const [levelComplete, setLevelComplete] = useState(false);

  const activeColors = activeColorsForLevel(level);
  const levelGoal = activeColors.length;
  const selectedTile = board.find((tile) => tile?.id === selectedId);

  function selectTile(tile: Tile): void {
    if (levelComplete) return;
    setLastMatchedColor(null);

    if (matchedColors.includes(tile.color)) return;

    if (selectedId === tile.id) {
      setSelectedId(null);
      setMessage('Selection cleared. Choose a pair to match.');
      return;
    }

    if (selectedId === null || !selectedTile) {
      setSelectedId(tile.id);
      setMessage('Tile selected. Find its match.');
      return;
    }

    if (
      selectedTile.color === tile.color &&
      selectedTile.representation !== tile.representation
    ) {
      const nextMatchedColors = [...matchedColors, tile.color];
      setMatchedColors(nextMatchedColors);
      setLastMatchedColor(tile.color);
      setSelectedId(null);
      if (nextMatchedColors.length === activeColors.length) {
        setLevelComplete(true);
        setMessage('All color pairs matched!');
      } else {
        setMessage(
          `Pair matched! ${activeColors.length - nextMatchedColors.length} to go.`,
        );
      }
    } else {
      setSelectedId(tile.id);
      setMessage('Not a match. No penalty; try another pair.');
    }
  }

  function growGarden(): void {
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setBoard(createBoard(nextLevel));
    setSelectedId(null);
    setMatchedColors([]);
    setLastMatchedColor(null);
    setMessage('Match each color word with its solid color tile.');
    setLevelComplete(false);
  }

  function resetBoard(): void {
    setBoard(createBoard(level));
    setSelectedId(null);
    setMatchedColors([]);
    setLastMatchedColor(null);
    setMessage('');
    setLevelComplete(false);
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
        <h1 className={styles.headerTitle} id="game-title">
          Color Merge Garden
        </h1>
      </header>

      <section className={styles.game} aria-labelledby="game-title">
        <div className={styles.heading}></div>

        <div className={styles.scoreRow}>
          <div className={styles.levelLabel}>
            <span className={styles.levelNumber}>
              {String(level).padStart(2, '0')}
            </span>
            <span>GARDEN LEVEL</span>
          </div>
          <div className={styles.scoreLabel}>
            <span>MATCHED PAIRS</span>
            <strong>
              {matchedColors.length}
              <span> / {levelGoal}</span>
            </strong>
          </div>
        </div>

        <p className={styles.selectionHint} aria-live="polite">
          {message || `Find all ${levelGoal} color pairs to grow the garden.`}
        </p>

        <div
          className={styles.board}
          role="group"
          aria-label="6 by 6 color game board"
        >
          {board.map((tile, index) => {
            if (!tile) {
              return (
                <div
                  key={index}
                  className={`${styles.cell} ${styles.emptyCell}`}
                  aria-hidden="true"
                />
              );
            }

            if (matchedColors.includes(tile.color)) {
              return (
                <div
                  key={index}
                  className={`${styles.cell} ${styles.emptyCell} ${lastMatchedColor === tile.color ? styles.matchedCell : ''}`}
                  aria-hidden="true"
                />
              );
            }

            const isSelected = selectedId === tile.id;
            const cellLabel =
              tile.representation === 'swatch'
                ? `${tile.color} color tile`
                : `${tile.word} color word`;

            return (
              <button
                key={index}
                type="button"
                className={`${styles.cell} ${tile.representation === 'swatch' ? styles.swatchCell : styles.wordCell} ${isSelected ? styles.selected : ''}`}
                data-color={tile.color}
                aria-label={`${cellLabel}${isSelected ? ', selected' : ''}`}
                aria-pressed={isSelected}
                onClick={() => selectTile(tile)}
              >
                {tile.representation === 'word' && (
                  <span className={styles.word}>{tile.word}</span>
                )}
              </button>
            );
          })}
        </div>

        {levelComplete ? (
          <div className={styles.completion} role="status">
            <p>Garden grown. You matched every color.</p>
            <button
              className={styles.mergeButton}
              type="button"
              onClick={growGarden}
            >
              Grow the garden <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : (
          <div className={styles.actions}>
            <button
              className={styles.resetButton}
              type="button"
              onClick={resetBoard}
            >
              New board
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
