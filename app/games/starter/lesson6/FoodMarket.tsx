'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import MusicToggle from '../../../_components/MusicToggle';
import UnlockToast from '../_components/UnlockToast';
import lessonHeaderStyles from '../lesson1/ColorsSvgViewer.module.css';
import { pingLessonOpen, saveProgressDelta } from '@/app/_lib/client/progress';
import GameStatsFooter from '@/app/_components/GameStatsFooter';
import styles from './FoodMarket.module.css';
import {
  FOODS,
  MARKET_LEVELS,
  lineEnglish,
  orderEnglish,
  orderThai,
  shuffled,
} from './market';

type Message = { text: string; ok: boolean };

const DRAG_TYPE = 'text/plain';

function speak(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

function FoodMarketContent() {
  const hasSavedCompletionRef = useRef(false);
  const [levelIndex, setLevelIndex] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [basket, setBasket] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const level = MARKET_LEVELS[levelIndex];
  const round = level.rounds[roundIndex];
  const english = orderEnglish(round.order);
  const totalWanted = round.order.reduce((sum, line) => sum + line.qty, 0);
  const shelf = shuffled(
    [...round.order.map((line) => line.food), ...round.distractors],
    (levelIndex + 1) * 131 + (roundIndex + 1) * 29,
  );
  const countOf = (food: string): number =>
    basket.filter((id) => id === food).length;

  const roundComplete = basket.length === totalWanted;
  const isLastRound = roundIndex === level.rounds.length - 1;
  const isLastLevel = levelIndex === MARKET_LEVELS.length - 1;
  const lessonComplete = roundComplete && isLastRound && isLastLevel;
  const completedLevels = levelIndex + (roundComplete && isLastRound ? 1 : 0);

  useEffect(() => {
    pingLessonOpen('starter');
  }, []);

  useEffect(() => {
    speak(english);
  }, [english]);

  useEffect(() => {
    if (!lessonComplete || hasSavedCompletionRef.current) return;
    hasSavedCompletionRef.current = true;
    void saveProgressDelta('starter', { unlocked_lessons: 7 });
  }, [lessonComplete]);

  useEffect(() => {
    if (!message || message.ok) return;
    const timeoutId = window.setTimeout(() => setMessage(null), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

  function addToBasket(food: string): void {
    if (roundComplete) return;
    const line = round.order.find((item) => item.food === food);
    if (!line) {
      setMessage({ text: 'Not in the order. · ไม่ได้สั่ง', ok: false });
      return;
    }
    if (countOf(food) >= line.qty) {
      setMessage({ text: 'That is enough! · พอแล้ว', ok: false });
      return;
    }

    const item = FOODS[food];
    const done = basket.length + 1 === totalWanted;
    setBasket([...basket, food]);
    setSelected(null);
    setMessage(done ? { text: 'Great job! · เก่งมาก!', ok: true } : null);
    speak(done ? `${item.name}. Great job!` : item.name);
  }

  function nextRound(): void {
    if (isLastRound) {
      setLevelIndex((value) => value + 1);
      setRoundIndex(0);
    } else {
      setRoundIndex((value) => value + 1);
    }
    setBasket([]);
    setSelected(null);
    setMessage(null);
  }

  const status = message ? message.text : '';

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
        <h1 className={styles.headerTitle}>Food Market</h1>
        <span className={styles.lessonTag}>
          LEVEL {levelIndex + 1}/{MARKET_LEVELS.length}
        </span>
        <MusicToggle />
      </header>
      {lessonComplete && <UnlockToast nextLesson={7} />}

      <section className={styles.workspace} aria-label="Food market game">
        <div className={styles.gameLayout}>
          <div className={styles.stageArea}>
            <ol
              className={styles.levels}
              aria-label={`Levels completed: ${completedLevels} of ${MARKET_LEVELS.length}`}
            >
              {MARKET_LEVELS.map((item, index) => {
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
              <h2 className={styles.instruction}>🛒 “{english}”</h2>
              <p className={styles.instructionThai} lang="th">
                {orderThai(round.order)}
              </p>
              <p
                className={`${styles.status} ${message && !message.ok ? styles.statusError : ''}`}
                aria-live="polite"
              >
                {status}
              </p>
            </div>

            <button
              className={`${styles.basket} ${selected ? styles.basketReady : ''}`}
              type="button"
              aria-label="Shopping basket"
              onClick={() => selected && addToBasket(selected)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const food = event.dataTransfer.getData(DRAG_TYPE);
                if (food) addToBasket(food);
              }}
            >
              <span className={styles.basketHandle} aria-hidden="true" />
              <span className={styles.basketBody}>
                {Array.from({ length: totalWanted }, (_, index) => (
                  <span className={styles.basketSlot} key={index}>
                    {basket[index] ? FOODS[basket[index]].emoji : ''}
                  </span>
                ))}
              </span>
            </button>

            <ul className={styles.orderList} aria-label="Order">
              {round.order.map((line) => (
                <li
                  key={line.food}
                  className={
                    countOf(line.food) >= line.qty ? styles.orderDone : ''
                  }
                >
                  {FOODS[line.food].emoji} {lineEnglish(line)}{' '}
                  <span>
                    {countOf(line.food)}/{line.qty}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <aside className={styles.toolPanel} aria-label="Shelf">
            <h2 className={styles.panelTitle}>Shelf · ชั้นวางของ</h2>
            <div className={styles.shelfGrid}>
              {shelf.map((food) => {
                const item = FOODS[food];
                const isSelected = selected === food;
                return (
                  <button
                    className={`${styles.shelfItem} ${isSelected ? styles.shelfItemSelected : ''}`}
                    key={food}
                    type="button"
                    draggable
                    aria-pressed={isSelected}
                    aria-label={item.name}
                    onClick={() => setSelected(isSelected ? null : food)}
                    onDragStart={(event) => {
                      setSelected(food);
                      event.dataTransfer.setData(DRAG_TYPE, food);
                      event.dataTransfer.effectAllowed = 'copy';
                    }}
                  >
                    <span className={styles.shelfEmoji} aria-hidden="true">
                      {item.emoji}
                    </span>
                    <span className={styles.shelfLabel}>{item.name}</span>
                    <span className={styles.shelfThai} lang="th">
                      {item.thai}
                    </span>
                  </button>
                );
              })}
            </div>
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
                {isLastRound ? 'Next level · ด่านต่อไป' : 'Next order · ออเดอร์ต่อไป'}{' '}
                →
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

export default function FoodMarket() {
  return (
    <>
      <FoodMarketContent />
      <GameStatsFooter game="starter" totalLessons={7} />
    </>
  );
}
