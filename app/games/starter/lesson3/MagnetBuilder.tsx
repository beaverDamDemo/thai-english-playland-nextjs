'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import MusicToggle from '../../../_components/MusicToggle';
import GameStatsFooter from '@/app/_components/GameStatsFooter';
import { pingLessonOpen, saveProgressDelta } from '@/app/_lib/client/progress';
import UnlockToast from '../_components/UnlockToast';
import lessonHeaderStyles from '../lesson1/ColorsSvgViewer.module.css';
import { STAGES, type NumberEntry } from './stages';
import styles from './MagnetBuilder.module.css';

const OPTION_COUNT = 4;
const ADVANCE_DELAY_MS = 1100;

// Deterministic so server and client render the same options.
function questionIndex(stageIndex: number, round: number): number {
  return STAGES[stageIndex].askOrder?.[round] ?? round;
}
function buildOptions(stageIndex: number, round: number): NumberEntry[] {
  const { numbers } = STAGES[stageIndex];
  const askIndex = questionIndex(stageIndex, round);
  const options = [numbers[askIndex]];
  [3, 5, 7].forEach((offset) => {
    options.push(numbers[(askIndex + offset) % numbers.length]);
  });
  const correctSlot = (round * 3 + stageIndex) % OPTION_COUNT;
  const [correct, ...others] = options;
  others.splice(correctSlot, 0, correct);
  return others;
}

function speak(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

function MagnetBuilderContent() {
  const [stageIndex, setStageIndex] = useState(0);
  const [placed, setPlaced] = useState(0);
  const [locked, setLocked] = useState(false);
  const [wrongValues, setWrongValues] = useState<number[]>([]);
  const [shaking, setShaking] = useState<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const savedRef = useRef(false);

  const stage = STAGES[stageIndex];
  const total = stage.numbers.length;
  const stageDone = placed >= total;
  const isLastStage = stageIndex === STAGES.length - 1;
  const target = stage.numbers[questionIndex(stageIndex, Math.min(placed, total - 1))];
  const options = stageDone ? [] : buildOptions(stageIndex, placed);

  useEffect(() => {
    pingLessonOpen('starter');
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!(stageDone && isLastStage) || savedRef.current) return;
    savedRef.current = true;
    void saveProgressDelta('starter', { unlocked_lessons: 4 });
  }, [stageDone, isLastStage]);

  function chooseNumber(value: number): void {
    if (locked || stageDone) return;

    if (value !== target.value) {
      setWrongValues((current) => [...current, value]);
      setShaking(value);
      window.setTimeout(() => setShaking(null), 400);
      return;
    }

    setLocked(true);
    setWrongValues([]);
    speak(target.en);
    setPlaced((current) => current + 1);
    timeoutRef.current = window.setTimeout(() => {
      setLocked(false);
    }, ADVANCE_DELAY_MS);
  }

  function nextStage(): void {
    setStageIndex((current) => current + 1);
    setPlaced(0);
    setWrongValues([]);
    setLocked(false);
  }

  const justPlaced =
    placed > 0 ? stage.numbers[questionIndex(stageIndex, placed - 1)] : null;

  return (
    <main className={styles.page}>
      <header
        className={lessonHeaderStyles.header}
        data-game="starter"
        style={
          {
            '--game-bg': '#0e7490',
            '--game-bg-dark': '#0b4a5e',
          } as React.CSSProperties
        }
      >
        <Link href="/games/starter" className={lessonHeaderStyles.back}>
          <Image
            src="/assets/tinified/back.png"
            alt="Back"
            width={34}
            height={34}
          />
        </Link>
        <h1 className={styles.headerTitle} id="magnet-builder-title">
          Number Magnets
        </h1>
        <span className={styles.stageTag}>
          LEVEL {stageIndex + 1}/{STAGES.length}
        </span>
        <MusicToggle />
      </header>
      {stageDone && isLastStage && <UnlockToast nextLesson={4} />}

      <section className={styles.game} aria-labelledby="magnet-builder-title">
        <ol
          className={styles.levels}
          aria-label={`Levels completed: ${stageIndex + (stageDone ? 1 : 0)} of ${STAGES.length}`}
        >
          {STAGES.map((levelStage, index) => {
            const done = index < stageIndex || (index === stageIndex && stageDone);
            const current = index === stageIndex && !stageDone;
            return (
              <li
                key={levelStage.object}
                className={`${styles.level} ${done ? styles.levelDone : ''} ${
                  current ? styles.levelCurrent : ''
                }`}
                aria-current={current ? 'step' : undefined}
              >
                <span className={styles.levelNumber}>{done ? '✓' : index + 1}</span>
                <span className={styles.levelRange}>{levelStage.range}</span>
              </li>
            );
          })}
        </ol>
        <p className={styles.kicker}>
          {stage.title} · <span lang="th">{stage.titleTh}</span>
        </p>

        <div className={styles.workshop}>
          <svg
            className={styles.canvas}
            viewBox="0 0 100 114"
            role="img"
            aria-label={`${stage.object}: ${placed} of ${total} magnet pieces placed`}
          >
            <g className={styles.ghost}>
              {stage.pieces.map((shapes, index) => (
                <g key={index}>{shapes}</g>
              ))}
            </g>
            {stage.pieces.slice(0, placed).map((shapes, index) => (
              <g
                key={index}
                className={
                  index === placed - 1 && !stageDone ? styles.snap : undefined
                }
              >
                {shapes}
              </g>
            ))}
          </svg>
          <div className={styles.progressBar} aria-hidden="true">
            <div
              className={styles.progressFill}
              style={{ width: `${(placed / total) * 100}%` }}
            />
          </div>
          <p className={styles.objectName}>
            Build the {stage.object.toLowerCase()} ·{' '}
            <span lang="th">สร้าง{stage.objectTh}</span> · {placed}/{total}
          </p>
        </div>

        {stageDone ? (
          <div className={styles.completion} role="status">
            <p>
              {isLastStage
                ? 'Amazing! You can count all the way to 1000!'
                : `The ${stage.object.toLowerCase()} is finished!`}
            </p>
            <p lang="th" className={styles.thai}>
              {isLastStage
                ? 'เยี่ยมมาก! นับถึง 1000 ได้แล้ว!'
                : `สร้าง${stage.objectTh}เสร็จแล้ว!`}
            </p>
            {isLastStage ? (
              <Link href="/games/starter" className={styles.nextButton}>
                Return to Starter Zone · กลับไปหน้าบทเรียน
              </Link>
            ) : (
              <button
                type="button"
                className={styles.nextButton}
                onClick={nextStage}
              >
                Next object · ชิ้นต่อไป <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.prompt} aria-live="polite">
              <p className={styles.promptLabel}>
                Find the magnet · หาแม่เหล็ก
              </p>
              <div className={styles.promptRow}>
                <p className={styles.promptNumber}>{target.value}</p>
                <button
                  type="button"
                  className={styles.listenButton}
                  onClick={() => speak(target.en)}
                  aria-label="Listen to the number"
                >
                  🔊
                </button>
              </div>
              {justPlaced && locked ? (
                <p className={styles.feedback}>
                  ✓ {justPlaced.value} = {justPlaced.en}
                </p>
              ) : wrongValues.length > 0 ? (
                <p className={styles.feedbackWrong}>
                  Try again · ลองอีกครั้ง
                </p>
              ) : (
                <p className={styles.feedback}>&nbsp;</p>
              )}
            </div>

            <div className={styles.magnets} role="group" aria-label="Number magnets">
              {options.map((entry) => (
                <button
                  key={entry.value}
                  type="button"
                  className={`${styles.magnet} ${
                    shaking === entry.value ? styles.shake : ''
                  }`}
                  disabled={locked || wrongValues.includes(entry.value)}
                  onClick={() => chooseNumber(entry.value)}
                >
                  <span className={styles.magnetWord}>{entry.en}</span>
                  <span lang="th" className={styles.magnetThai}>
                    {entry.th}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function MagnetBuilder() {
  return (
    <>
      <MagnetBuilderContent />
      <GameStatsFooter game="starter" totalLessons={7} />
    </>
  );
}
