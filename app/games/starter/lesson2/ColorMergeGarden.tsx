'use client';

import Link from 'next/link';
import Image from 'next/image';
import MusicToggle from '../../../_components/MusicToggle';
import UnlockToast from '../_components/UnlockToast';
import { getMusicEnabled } from '@/app/_lib/client/music';
import { useEffect, useRef, useState } from 'react';
import styles from './ColorMergeGarden.module.css';
import lessonHeaderStyles from '../lesson1/ColorsSvgViewer.module.css';
import { pingLessonOpen, recordAnswer, saveProgressDelta } from '@/app/_lib/client/progress';
import GameStatsFooter from '@/app/_components/GameStatsFooter';

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
const MAX_LEVEL = 4;
// Red is only taught on level 1; later levels draw from this order instead.
const LEVEL_ONE_COLORS: ColorName[] = ['red', 'blue', 'yellow', 'green'];
const LATER_LEVEL_COLORS: ColorName[] = [
  'blue',
  'yellow',
  'green',
  'orange',
  'purple',
  'gray',
  'pink',
  'brown',
  'black',
  'white',
  'cyan',
];

type SavedProgress = {
  level: number;
  matchedColors: ColorName[];
};

type Message = { en: string; th: string };

const MSG_RESTORED: Message = {
  en: 'Progress restored. Keep matching.',
  th: 'กู้คืนความคืบหน้าแล้ว จับคู่ต่อได้เลย',
};
const MSG_NEW_LEVEL: Message = {
  en: 'Match each color word with its solid color tile.',
  th: 'จับคู่คำศัพท์สีกับช่องสีที่ตรงกัน',
};

function activeColorsForLevel(level: number): ColorName[] {
  if (level === 1) return LEVEL_ONE_COLORS;
  return LATER_LEVEL_COLORS.slice(0, 4 + (level - 1) * 2);
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
      level > MAX_LEVEL ||
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

    return { level, matchedColors };
  } catch {
    return null;
  }
}

function playMatchSound(levelComplete: boolean): void {
  if (!getMusicEnabled() ||  typeof window === 'undefined') return;

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

function ColorMergeGardenContent() {
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
  const [message, setMessage] = useState<Message | null>(null);
  const [levelComplete, setLevelComplete] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);

  const activeColors = activeColorsForLevel(level);
  const levelGoal = activeColors.length;
  const isLastLevel = level === MAX_LEVEL;
  const completedLevels = level - 1 + (levelComplete ? 1 : 0);
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
        setMessage(MSG_RESTORED);
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
        JSON.stringify({ level, matchedColors }),
      );
    } catch {
      // Progress saving is best-effort when browser storage is unavailable.
    }
  }, [level, matchedColors, progressLoaded]);

  useEffect(() => {
    // Completing the last level finishes lesson 2 and unlocks lesson 3.
    if (!levelComplete || !isLastLevel || hasSavedCompletionRef.current) return;
    hasSavedCompletionRef.current = true;

    void saveProgressDelta('starter', { unlocked_lessons: 3, completed: true });
  }, [isLastLevel, levelComplete]);

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
      recordAnswer('starter', true);
      setMatchedColors(nextMatchedColors);
      setLastMatchedColor(tile.color);
      setSelectedId(null);
      playMatchSound(isLevelComplete);
      if (isLevelComplete) {
        setLevelComplete(true);
        // setMessage('All color pairs matched!');
      } else {
        // setMessage(
        //   `Pair matched! ${activeColors.length - nextMatchedColors.length} to go.`,
        // );
      }
    } else {
      recordAnswer('starter', false);
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
    setMessage(MSG_NEW_LEVEL);
    setLevelComplete(false);
  }

  function resetBoard(): void {
    setBoard(createBoard(level));
    setSelectedId(null);
    setMatchedColors([]);
    setLastMatchedColor(null);
    setMessage(null);
    setLevelComplete(false);
  }

  return (
    <main className={styles.page} data-level={level}>
      <header className={lessonHeaderStyles.header} data-game="starter">
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
        <MusicToggle />
      </header>
      {levelComplete && isLastLevel && <UnlockToast nextLesson={3} />}

      <section className={styles.game} aria-labelledby="game-title">
        <div className={styles.heading}>
          <p className={styles.instructions}>
            Match each color word to its solid color tile. No penalty for a
            miss.
          </p>
          <p className={styles.instructions} lang="th">
            จับคู่คำศัพท์สีกับช่องสีที่ตรงกัน ถ้าจับผิดไม่เสียคะแนน
          </p>
        </div>

        <div className={styles.scoreRow}>
          <div className={styles.levelLabel}>
            <span className={styles.levelNumber}>
              {String(level).padStart(2, '0')}
            </span>
            <span>
              GARDEN LEVEL
              <br />
              <span lang="th">ระดับสวน</span>
            </span>
          </div>
          <div
            className={styles.levelDots}
            role="img"
            aria-label={`Levels completed: ${completedLevels} of ${MAX_LEVEL}`}
          >
            {Array.from({ length: MAX_LEVEL }, (_, index) => (
              <span
                key={index}
                className={`${styles.levelDot} ${index < completedLevels ? styles.levelDotDone : ''} ${index === level - 1 ? styles.levelDotCurrent : ''}`}
              />
            ))}
          </div>
        </div>

        <p className={styles.selectionHint} aria-live="polite">
          {message?.en ??
            `Find all ${levelGoal} color pairs to grow the garden.`}
          <br />
          <span lang="th">
            {message?.th ?? `หาคู่สีให้ครบทั้ง ${levelGoal} คู่เพื่อทำให้สวนเติบโต`}
          </span>
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
                  data-level={level}
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
            {isLastLevel ? (
              <>
                <p>
                  Lesson complete! You matched every color.
                  <br />
                  <span lang="th">จบบทเรียนแล้ว! คุณจับคู่ครบทุกสี</span>
                </p>
                <Link href="/games/starter" className={styles.mergeButton}>
                  Back to lessons / <span lang="th">กลับไปหน้าบทเรียน</span>
                </Link>
              </>
            ) : (
              <>
                <p>
                  Garden grown. You matched every color.
                  <br />
                  <span lang="th">สวนเติบโตแล้ว คุณจับคู่ครบทุกสี</span>
                </p>
                <button
                  className={styles.mergeButton}
                  type="button"
                  onClick={growGarden}
                >
                  Grow the garden / <span lang="th">ทำให้สวนเติบโต</span>{' '}
                  <span aria-hidden="true">→</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={styles.actions}>
            <button
              className={styles.resetButton}
              type="button"
              onClick={resetBoard}
            >
              New board / <span lang="th">เริ่มกระดานใหม่</span>
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default function ColorMergeGarden() {
  return (
    <>
      <ColorMergeGardenContent />
      <GameStatsFooter game="starter" totalLessons={7} />
    </>
  );
}
