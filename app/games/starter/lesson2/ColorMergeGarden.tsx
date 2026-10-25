'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from './ColorMergeGarden.module.css';
import lessonHeaderStyles from '../lesson1/ColorsSvgViewer.module.css';
import { pingLessonOpen, saveProgressDelta } from '@/app/_lib/client/progress';

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
const STORAGE_KEY = 'color-merge-garden-progress';

type SavedProgress = {
  level: number;
  matchedColors: ColorName[];
  soundEnabled: boolean;
};

function activeColorsForLevel(level: number): ColorName[] {
  return COLORS.slice(0, Math.min(4 + (level - 1) * 2, COLORS.length));
}

function isColorName(value: unknown): value is ColorName {
  return typeof value === 'string' && COLORS.some((color) => color === value);
}

function readSavedProgress(): SavedProgress | null {
  try {
    const storedValue: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? 'null',
    );
    if (typeof storedValue !== 'object' || storedValue === null) return null;

    const saved = storedValue as Record<string, unknown>;
    const level = saved.level;
    const matchedColors = saved.matchedColors;
    if (
      typeof level !== 'number' ||
      !Number.isInteger(level) ||
      level < 1 ||
      level > 10000 ||
      !Array.isArray(matchedColors) ||
      !matchedColors.every(isColorName)
    ) {
      return null;
    }

    const activeColors = activeColorsForLevel(level);
    if (
      matchedColors.some((color) => !activeColors.includes(color)) ||
      new Set(matchedColors).size !== matchedColors.length
    ) {
      return null;
    }

    return {
      level,
      matchedColors,
      soundEnabled: saved.soundEnabled === true,
    };
  } catch {
    return null;
  }
}

function playMatchSound(soundEnabled: boolean, levelComplete: boolean): void {
  if (!soundEnabled || typeof window === 'undefined') return;

  try {
    const audioContext = new window.AudioContext();
    const now = audioContext.currentTime;
    const notes = levelComplete ? [523, 659, 784] : [523, 659];

    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const startAt = now + index * 0.14;

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startAt);
      gain.gain.setValueAtTime(0.001, startAt);
      gain.gain.linearRampToValueAtTime(0.055, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.2);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + 0.21);

      if (index === notes.length - 1) {
        oscillator.onended = () => void audioContext.close();
      }
    });
    void audioContext.resume();
  } catch {
    // Audio is optional; continue silently if the browser does not support it.
  }
}

function createBoard(level: number, deterministic = false): (Tile | null)[] {
  const tiles = activeColorsForLevel(level).flatMap((color, colorIndex) => [
    {
      id: colorIndex * 2,
      color,
      representation: 'word' as const,
      word: color[0].toUpperCase() + color.slice(1).toLowerCase(),
    },
    {
      id: colorIndex * 2 + 1,
      color,
      representation: 'swatch' as const,
    },
  ]);

  if (deterministic) {
    tiles.sort((first, second) => {
      const tileCount = tiles.length;
      return ((first.id * 5) % tileCount) - ((second.id * 5) % tileCount);
    });
  } else {
    for (let index = tiles.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [tiles[index], tiles[swapIndex]] = [tiles[swapIndex], tiles[index]];
    }
  }

  if (level === 1) {
    return [...tiles.slice(0, 4), null, ...tiles.slice(4)];
  }

  return tiles;
}

export default function ColorMergeGarden() {
  const hasSavedCompletionRef = useRef(false);
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState<(Tile | null)[]>(() =>
    createBoard(1, true),
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [matchedColors, setMatchedColors] = useState<ColorName[]>([]);
  const [lastMatchedColor, setLastMatchedColor] = useState<ColorName | null>(
    null,
  );
  const [message, setMessage] = useState('');
  const [levelComplete, setLevelComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);

  const activeColors = activeColorsForLevel(level);
  const levelGoal = activeColors.length;
  const selectedTile = board.find((tile) => tile?.id === selectedId);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const saved = readSavedProgress();
      if (saved) {
        const isComplete =
          saved.matchedColors.length ===
          activeColorsForLevel(saved.level).length;
        setLevel(saved.level);
        setBoard(createBoard(saved.level));
        setMatchedColors(saved.matchedColors);
        setLevelComplete(isComplete);
        setSoundEnabled(saved.soundEnabled);
        setMessage('Progress restored. Keep matching.');
      }
      setProgressLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!progressLoaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ level, matchedColors, soundEnabled }),
      );
    } catch {
      // Progress saving is best-effort when browser storage is unavailable.
    }
  }, [level, matchedColors, progressLoaded, soundEnabled]);

  useEffect(() => {
    // Treat completing level 1 as finishing lesson 2 and unlock lesson 3.
    if (!levelComplete || level !== 1 || hasSavedCompletionRef.current) return;
    hasSavedCompletionRef.current = true;

    void saveProgressDelta('starter', { unlocked_lessons: 3 });
  }, [level, levelComplete]);

  useEffect(() => {
    pingLessonOpen('starter');
  }, []);

  function selectTile(tile: Tile): void {
    if (levelComplete) return;
    setLastMatchedColor(null);

    if (matchedColors.includes(tile.color)) return;

    if (selectedId === tile.id) {
      setSelectedId(null);
      // setMessage('Selection cleared. Choose a pair to match.');
      return;
    }

    if (selectedId === null || !selectedTile) {
      setSelectedId(tile.id);
      // setMessage('Tile selected. Find its match.');
      return;
    }

    if (
      selectedTile.color === tile.color &&
      selectedTile.representation !== tile.representation
    ) {
      const nextMatchedColors = [...matchedColors, tile.color];
      const isLevelComplete = nextMatchedColors.length === activeColors.length;
      setMatchedColors(nextMatchedColors);
      setLastMatchedColor(tile.color);
      setSelectedId(null);
      playMatchSound(soundEnabled, isLevelComplete);
      if (isLevelComplete) {
        setLevelComplete(true);
        // setMessage('All color pairs matched!');
      } else {
        // setMessage(
        //   `Pair matched! ${activeColors.length - nextMatchedColors.length} to go.`,
        // );
      }
    } else {
      setSelectedId(tile.id);
      // setMessage('Not a match. No penalty; try another pair.');
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
        <button
          className={styles.soundToggle}
          type="button"
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? 'Mute game sounds' : 'Enable game sounds'}
          onClick={() => setSoundEnabled((enabled) => !enabled)}
        >
          Sound {soundEnabled ? 'on' : 'off'}
        </button>
      </header>

      <section className={styles.game} aria-labelledby="game-title">
        <div className={styles.heading}>
          <p className={styles.instructions}>
            Match each color word to its solid color tile. No penalty for a
            miss.
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
              <span> / {levelGoal}</span>
            </strong>
          </div>
        </div>

        <p className={styles.selectionHint} aria-live="polite">
          {message || `Find all ${levelGoal} color pairs to grow the garden.`}
        </p>

        <div
          className={`${styles.board} ${level === 1 ? styles.openingBoard : ''}`}
          role="group"
          aria-label={`Color matching board, ${board.length} cells`}
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
                  className={`${styles.cell} ${styles.emptyCell} ${styles.gardenCell} ${lastMatchedColor === tile.color ? styles.matchedCell : ''}`}
                  data-color={tile.color}
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
