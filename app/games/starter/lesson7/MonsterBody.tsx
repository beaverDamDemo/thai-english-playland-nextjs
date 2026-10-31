'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import MusicToggle from '../../../_components/MusicToggle';
import lessonHeaderStyles from '../lesson1/ColorsSvgViewer.module.css';
import { pingLessonOpen, saveProgressDelta } from '@/app/_lib/client/progress';
import GameStatsFooter from '@/app/_components/GameStatsFooter';
import Monster from './Monster';
import styles from './MonsterBody.module.css';
import {
  BUILD_ROUNDS,
  COUNT_PARTS,
  FULL_MONSTER,
  LEVELS,
  MAX_COUNT,
  PART_INFO,
  PICK_ROUNDS,
  TOUCH_ROUNDS,
  configDescription,
  countToConfigKey,
  type CountPart,
  type MonsterConfig,
  type PartId,
} from './body';

type Message = { text: string; ok: boolean };

const EMPTY_BUILD: MonsterConfig = {
  eyes: 0,
  ears: 0,
  arms: 0,
  legs: 0,
  nose: true,
};

function speak(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

function MonsterBodyContent() {
  const hasSavedCompletionRef = useRef(false);
  const [levelIndex, setLevelIndex] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [built, setBuilt] = useState<MonsterConfig>(EMPTY_BUILD);
  const [picked, setPicked] = useState<number | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const touchRound = TOUCH_ROUNDS[roundIndex];
  const buildTarget = BUILD_ROUNDS[roundIndex];
  const pickRound = PICK_ROUNDS[roundIndex];

  let english = '';
  let thai = '';
  let roundComplete = false;
  if (levelIndex === 0) {
    const part = touchRound[Math.min(step, touchRound.length - 1)];
    english = `Touch the monster's ${PART_INFO[part].singular}.`;
    thai = `แตะ${PART_INFO[part].thai}ของมอนสเตอร์`;
    roundComplete = step >= touchRound.length;
  } else if (levelIndex === 1) {
    const description = configDescription(buildTarget, COUNT_PARTS);
    english = `${description.en} Build it!`;
    thai = description.th;
    roundComplete = COUNT_PARTS.every(
      (part) =>
        built[countToConfigKey(part)] === buildTarget[countToConfigKey(part)],
    );
  } else {
    const description = configDescription(
      pickRound.options[pickRound.answer],
      pickRound.mentioned,
    );
    english = `Which monster? ${description.en.replace('This monster has', 'It has')}`;
    thai = description.th;
    roundComplete = picked === pickRound.answer;
  }

  const level = LEVELS[levelIndex];
  const isLastRound = roundIndex === level.rounds - 1;
  const isLastLevel = levelIndex === LEVELS.length - 1;
  const lessonComplete = roundComplete && isLastRound && isLastLevel;
  const completedLevels = levelIndex + (roundComplete && isLastRound ? 1 : 0);

  useEffect(() => {
    pingLessonOpen('starter');
  }, []);

  useEffect(() => {
    speak(english);
    // Re-read when the round changes, and for each new touch command.
  }, [english]);

  useEffect(() => {
    if (!lessonComplete || hasSavedCompletionRef.current) return;
    hasSavedCompletionRef.current = true;
    void saveProgressDelta('starter', { unlocked_lessons: 7 });
  }, [lessonComplete]);

  useEffect(() => {
    if (!message || message.ok) return;
    const timeoutId = window.setTimeout(() => setMessage(null), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

  function handleTouch(part: PartId): void {
    if (roundComplete) return;
    if (part !== touchRound[step]) {
      setMessage({ text: 'Try again. · ลองอีกครั้ง', ok: false });
      return;
    }
    setMessage(null);
    if (step + 1 === touchRound.length) {
      setStep(step + 1);
      speak('Great job!');
    } else {
      setStep(step + 1);
    }
  }

  function changeCount(part: CountPart, delta: number): void {
    if (roundComplete) return;
    const key = countToConfigKey(part);
    const next = Math.min(
      MAX_COUNT[part],
      Math.max(0, (built[key] as number) + delta),
    );
    setBuilt({ ...built, [key]: next });
    setMessage(null);
  }

  function handlePick(index: number): void {
    if (roundComplete) return;
    if (index === pickRound.answer) {
      setPicked(index);
      setMessage(null);
      speak('Great job!');
    } else {
      setMessage({ text: 'Count again. · นับอีกครั้ง', ok: false });
    }
  }

  function nextRound(): void {
    if (isLastRound) {
      setLevelIndex((value) => value + 1);
      setRoundIndex(0);
    } else {
      setRoundIndex((value) => value + 1);
    }
    setStep(0);
    setBuilt(EMPTY_BUILD);
    setPicked(null);
    setMessage(null);
  }

  const status = message
    ? message.text
    : roundComplete
      ? 'Great job! · เก่งมาก!'
      : '';

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
        <h1 className={styles.headerTitle}>Monster Body</h1>
        <span className={styles.lessonTag}>
          LEVEL {levelIndex + 1}/{LEVELS.length}
        </span>
        <MusicToggle />
      </header>

      <section className={styles.workspace} aria-label="Monster body game">
        <div className={styles.gameLayout}>
          <div className={styles.stageArea}>
            <ol
              className={styles.levels}
              aria-label={`Levels completed: ${completedLevels} of ${LEVELS.length}`}
            >
              {LEVELS.map((item, index) => {
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

            <div className={styles.heading}>
              <h2 className={styles.instruction}>{english}</h2>
              <p className={styles.instructionThai} lang="th">
                {thai}
              </p>
              <p
                className={`${styles.status} ${message && !message.ok ? styles.statusError : ''}`}
                aria-live="polite"
              >
                {status}
              </p>
            </div>

            {levelIndex === 0 && (
              <Monster
                className={styles.monster}
                config={FULL_MONSTER}
                onPartClick={handleTouch}
              />
            )}
            {levelIndex === 1 && (
              <Monster className={styles.monster} config={built} />
            )}
            {levelIndex === 2 && (
              <div className={styles.options}>
                {pickRound.options.map((option, index) => (
                  <button
                    className={`${styles.option} ${picked === index ? styles.optionRight : ''}`}
                    key={index}
                    type="button"
                    aria-label={`Monster ${index + 1}`}
                    onClick={() => handlePick(index)}
                  >
                    <Monster className={styles.optionMonster} config={option} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className={styles.toolPanel} aria-label="Controls">
            {levelIndex === 1 ? (
              <>
                <h2 className={styles.panelTitle}>Parts · ส่วนต่างๆ</h2>
                <ul className={styles.steppers}>
                  {COUNT_PARTS.map((part) => (
                    <li className={styles.stepper} key={part}>
                      <span className={styles.stepperName}>
                        {PART_INFO[part].plural}
                        <span lang="th"> {PART_INFO[part].thai}</span>
                      </span>
                      <button
                        className={styles.stepButton}
                        type="button"
                        aria-label={`Fewer ${PART_INFO[part].plural}`}
                        onClick={() => changeCount(part, -1)}
                      >
                        −
                      </button>
                      <span className={styles.stepCount}>
                        {built[countToConfigKey(part)] as number}
                      </span>
                      <button
                        className={styles.stepButton}
                        type="button"
                        aria-label={`More ${PART_INFO[part].plural}`}
                        onClick={() => changeCount(part, 1)}
                      >
                        +
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <h2 className={styles.panelTitle}>
                {levelIndex === 0
                  ? 'Touch the body part · แตะส่วนของร่างกาย'
                  : 'Pick the monster · เลือกมอนสเตอร์'}
              </h2>
            )}
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => speak(english)}
            >
              🔊 Hear it again · ฟังอีกครั้ง
            </button>
            {roundComplete && !lessonComplete ? (
              <button
                className={styles.nextButton}
                type="button"
                onClick={nextRound}
              >
                {isLastRound ? 'Next level · ด่านต่อไป' : 'Next · ต่อไป'} →
              </button>
            ) : null}
            {lessonComplete ? (
              <Link href="/games/starter" className={styles.nextButton}>
                All done! · กลับไปหน้าบทเรียน
              </Link>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function MonsterBody() {
  return (
    <>
      <MonsterBodyContent />
      <GameStatsFooter game="starter" totalLessons={7} />
    </>
  );
}
