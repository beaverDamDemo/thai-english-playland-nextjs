'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import styles from './ColorMergeGarden.module.css';
import lessonHeaderStyles from '../lesson1/ColorsSvgViewer.module.css';

type ColorName = 'red' | 'blue' | 'yellow' | 'green' | 'orange' | 'purple';
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
];
function createBoard(deterministic = false): (Tile | null)[] {
  const board: (Tile | null)[] = Array(36).fill(null);
  const availableSlots = Array.from({ length: 36 }, (_, index) => index);

  COLORS.forEach((color, colorIndex) => {
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

function promptForTile(tile: Tile): string {
  return tile.representation === 'word'
    ? `Find the solid ${tile.color} tile.`
    : `Find the word "${tile.color}".`;
}

export default function ColorMergeGarden() {
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState(() => createBoard(true));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [matchedColors, setMatchedColors] = useState<ColorName[]>([]);
  const [message, setMessage] = useState('');
  const [levelComplete, setLevelComplete] = useState(false);

  const levelGoal = COLORS.length;
  const score = matchedColors.length;
  const selectedTile = board.find((tile) => tile?.id === selectedId);

  function selectTile(tile: Tile): void {
    if (levelComplete) return;

    if (matchedColors.includes(tile.color)) return;

    if (selectedId === tile.id) {
      setSelectedId(null);
      setMessage('Selection cleared. Choose a color word or tile.');
      return;
    }

    if (selectedId === null || !selectedTile) {
      setSelectedId(tile.id);
      setMessage(promptForTile(tile));
      return;
    }

    if (
      selectedTile.color === tile.color &&
      selectedTile.representation !== tile.representation
    ) {
      const nextMatchedColors = [...matchedColors, tile.color];
      setMatchedColors(nextMatchedColors);
      setSelectedId(null);
      if (nextMatchedColors.length === COLORS.length) {
        setLevelComplete(true);
        setMessage('All six color pairs matched!');
      } else {
        setMessage(`Matched ${tile.color}! Find another color pair.`);
      }
    } else {
      setSelectedId(tile.id);
      setMessage(`Not a match. ${promptForTile(tile)}`);
    }
  }

  function growGarden(): void {
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setBoard(createBoard());
    setSelectedId(null);
    setMatchedColors([]);
    setMessage('Match each color word with its solid color tile.');
    setLevelComplete(false);
  }

  function resetBoard(): void {
    setBoard(createBoard());
    setSelectedId(null);
    setMatchedColors([]);
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
        <h1 className={styles.headerTitle}>Color Merge Garden</h1>
        <div className={lessonHeaderStyles.dots} aria-label="Level progress">
          {Array.from({ length: 6 }, (_, index) => (
            <span
              key={index}
              className={`${lessonHeaderStyles.dot} ${score >= Math.ceil(((index + 1) * levelGoal) / 6) ? lessonHeaderStyles.dotDone : ''}`}
            />
          ))}
        </div>
      </header>

      <section className={styles.game} aria-labelledby="game-title">
        <div className={styles.heading}>
          <p className={styles.eyebrow}>GROW YOUR COLOR GARDEN</p>
          <h1 id="game-title">Color Merge Garden</h1>
          <p className={styles.instructions}>
            Tap a color word, then tap its blank color tile.
          </p>
        </div>

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
              <span> / {COLORS.length}</span>
            </strong>
          </div>
        </div>

        <progress
          className={styles.progress}
          value={Math.min(score, levelGoal)}
          max={levelGoal}
          aria-label="Garden level progress"
        />

        <p className={styles.selectionHint} aria-live="polite">
          {message || 'Find all six color pairs to grow the garden.'}
        </p>

        <div
          className={styles.board}
          role="group"
          aria-label="6 by 6 color game board"
        >
          {board.map((tile, index) => {
            if (!tile || matchedColors.includes(tile.color)) {
              return (
                <div
                  key={index}
                  className={`${styles.cell} ${styles.emptyCell}`}
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
            <p>Garden grown. You matched all six colors.</p>
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

        <p className={styles.learningNote}>
          Each written color matches one solid, unlabeled color tile.
        </p>
      </section>
    </main>
  );
}
