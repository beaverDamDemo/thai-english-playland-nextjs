'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import MusicToggle from '../../../_components/MusicToggle';
import UnlockToast from '../_components/UnlockToast';
import lessonHeaderStyles from '../lesson1/ColorsSvgViewer.module.css';
import { pingLessonOpen, recordAnswer, saveProgressDelta } from '@/app/_lib/client/progress';
import GameStatsFooter from '@/app/_components/GameStatsFooter';
import ClothingIcon from './ClothingIcon';
import styles from './DressUpBuddy.module.css';
import {
  CLOTHING_COLORS,
  CLOTHING_KINDS,
  COLOR_INFO,
  DRESS_UP_ROUNDS,
  KIND_THAI,
  LEVELS,
  SUITCASE_ITEMS,
  SUITCASE_ROUNDS,
  clothingId,
  parseClothingId,
  shuffled,
  type ClothingKind,
  type ClothingTarget,
} from './clothes';

type Zone = ClothingKind | 'suitcase';
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

function joinWords(words: string[]): string {
  if (words.length < 2) return words.join('');
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}

function describeTargets(targets: ClothingTarget[]): { en: string; th: string } {
  return {
    en: joinWords(targets.map((t) => `the ${t.color} ${t.kind}`)),
    th: targets
      .map((t) => `${KIND_THAI[t.kind]}สี${COLOR_INFO[t.color].thai}`)
      .join(' และ'),
  };
}

function getTrayIds(
  levelIndex: number,
  roundIndex: number,
  correctIds: string[],
): string[] {
  const distractors =
    levelIndex === 0
      ? DRESS_UP_ROUNDS[roundIndex].map((target) => {
          const colorIndex = CLOTHING_COLORS.indexOf(target.color);
          return clothingId(
            target.kind,
            CLOTHING_COLORS[(colorIndex + 1) % CLOTHING_COLORS.length],
          );
        })
      : SUITCASE_ROUNDS[roundIndex].distractors;
  return shuffled(
    [...correctIds, ...distractors],
    (levelIndex + 1) * 101 + (roundIndex + 1) * 17,
  );
}

function DressUpBuddyContent() {
  const hasSavedCompletionRef = useRef(false);
  const [levelIndex, setLevelIndex] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const isDressUp = levelIndex === 0;
  const dressTargets = DRESS_UP_ROUNDS[roundIndex] ?? [];
  const suitcaseRound = SUITCASE_ROUNDS[roundIndex];
  const correctIds = isDressUp
    ? dressTargets.map((t) => clothingId(t.kind, t.color))
    : suitcaseRound.correct;
  const trayIds = getTrayIds(levelIndex, roundIndex, correctIds).filter(
    (id) => !placed.includes(id),
  );
  const instruction = isDressUp
    ? describeTargets(dressTargets)
    : { en: suitcaseRound.prompt, th: suitcaseRound.thai };
  const spokenInstruction = isDressUp
    ? `Put on ${instruction.en}.`
    : instruction.en;

  const roundComplete = placed.length === correctIds.length;
  const isLastRound = roundIndex === LEVELS[levelIndex].rounds - 1;
  const isLastLevel = levelIndex === LEVELS.length - 1;
  const lessonComplete = roundComplete && isLastRound && isLastLevel;
  const completedLevels = levelIndex + (roundComplete && isLastRound ? 1 : 0);

  useEffect(() => {
    pingLessonOpen('starter');
  }, []);

  useEffect(() => {
    speak(spokenInstruction);
  }, [spokenInstruction]);

  useEffect(() => {
    if (!lessonComplete || hasSavedCompletionRef.current) return;
    hasSavedCompletionRef.current = true;
    void saveProgressDelta('starter', { unlocked_lessons: 6, completed: true });
  }, [lessonComplete]);

  useEffect(() => {
    if (!message || message.ok) return;
    const timeoutId = window.setTimeout(() => setMessage(null), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

  function spokenName(id: string): string {
    if (!isDressUp) return SUITCASE_ITEMS[id].name;
    const { kind, color } = parseClothingId(id);
    return `${color} ${kind}`;
  }

  function attempt(zone: Zone, id: string): void {
    if (placed.includes(id)) return;

    if (isDressUp) {
      if (parseClothingId(id).kind !== zone) {
        recordAnswer('starter', false);
        setMessage({
          text: 'That goes somewhere else. · ใส่ผิดที่',
          ok: false,
        });
        return;
      }
    } else if (zone !== 'suitcase') {
      return;
    }

    if (!correctIds.includes(id)) {
      recordAnswer('starter', false);
      setMessage({
        text: isDressUp
          ? 'Listen again. · ลองฟังอีกครั้ง'
          : `Not for this trip. · ไม่ใช่ของสำหรับทริปนี้`,
        ok: false,
      });
      return;
    }

    const done = placed.length + 1 === correctIds.length;
    recordAnswer('starter', true);
    setPlaced([...placed, id]);
    setSelectedId(null);
    setMessage(
      done ? { text: 'Great job! · เก่งมาก!', ok: true } : null,
    );
    speak(done ? `${spokenName(id)}. Great job!` : spokenName(id));
  }

  function handleDrop(event: React.DragEvent<HTMLElement>, zone: Zone): void {
    event.preventDefault();
    const id = event.dataTransfer.getData(DRAG_TYPE);
    if (id) attempt(zone, id);
  }

  function nextRound(): void {
    if (isLastRound) {
      setLevelIndex((value) => value + 1);
      setRoundIndex(0);
    } else {
      setRoundIndex((value) => value + 1);
    }
    setPlaced([]);
    setSelectedId(null);
    setMessage(null);
  }

  function renderTrayItem(id: string) {
    const selected = selectedId === id;
    const common = {
      type: 'button' as const,
      draggable: true,
      'aria-pressed': selected,
      onClick: () => setSelectedId(selected ? null : id),
      onDragStart: (event: React.DragEvent<HTMLButtonElement>) => {
        setSelectedId(id);
        event.dataTransfer.setData(DRAG_TYPE, id);
        event.dataTransfer.effectAllowed = 'move';
      },
    };
    const className = `${styles.trayItem} ${selected ? styles.trayItemSelected : ''}`;

    if (isDressUp) {
      const { kind, color } = parseClothingId(id);
      return (
        <button
          {...common}
          className={className}
          key={id}
          aria-label={`${color} ${kind}`}
        >
          <ClothingIcon
            kind={kind}
            color={COLOR_INFO[color].hex}
            className={styles.trayIcon}
          />
        </button>
      );
    }

    const item = SUITCASE_ITEMS[id];
    return (
      <button {...common} className={className} key={id} aria-label={item.name}>
        <span className={styles.trayEmoji} aria-hidden="true">
          {item.emoji}
        </span>
        <span className={styles.trayLabel}>{item.name}</span>
        <span className={styles.trayThai} lang="th">
          {item.thai}
        </span>
      </button>
    );
  }

  const status = message
    ? message.text
    : roundComplete
      ? 'Great job! · เก่งมาก!'
      : '';

  return (
    <main className={styles.page}>
      <header className={lessonHeaderStyles.header} data-game="starter">
        <Link href="/games/everyday-vocabulary" className={lessonHeaderStyles.back}>
          <Image
            src="/assets/tinified/back.png"
            alt="Back"
            width={34}
            height={34}
          />
        </Link>
        <h1 className={styles.headerTitle}>Dress-Up Buddy</h1>
        <span className={styles.lessonTag}>
          LEVEL {levelIndex + 1}/{LEVELS.length}
        </span>
        <MusicToggle />
      </header>
      {lessonComplete && <UnlockToast nextLesson={6} />}

      <section className={styles.workspace} aria-label="Clothes game">
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
              <h2 className={styles.instruction}>
                {isDressUp ? `Put on ${instruction.en}.` : instruction.en}
              </h2>
              <p className={styles.instructionThai} lang="th">
                {isDressUp ? `ใส่${instruction.th}` : instruction.th}
              </p>
              <p className={styles.status} aria-live="polite">
                {status}
              </p>
            </div>

            {isDressUp ? (
              <div className={styles.buddy}>
                <svg
                  className={styles.buddyBody}
                  viewBox="0 0 200 360"
                  aria-hidden="true"
                >
                  <g stroke="#3f4448" strokeWidth="3" fill="#cfd8dc">
                    <rect x="38" y="122" width="22" height="98" rx="11" />
                    <rect x="140" y="122" width="22" height="98" rx="11" />
                    <rect x="72" y="214" width="26" height="110" rx="12" />
                    <rect x="102" y="214" width="26" height="110" rx="12" />
                    <rect x="68" y="116" width="64" height="104" rx="12" />
                    <rect x="92" y="104" width="16" height="16" />
                    <ellipse cx="85" cy="330" rx="20" ry="10" />
                    <ellipse cx="115" cy="330" rx="20" ry="10" />
                  </g>
                  <g stroke="#3f4448" strokeWidth="3" fill="#f6d3b0">
                    <circle cx="100" cy="70" r="40" />
                    <circle cx="49" cy="226" r="11" />
                    <circle cx="151" cy="226" r="11" />
                  </g>
                  <circle cx="86" cy="66" r="4" fill="#3f4448" />
                  <circle cx="114" cy="66" r="4" fill="#3f4448" />
                  <path
                    d="M84 86 Q100 100 116 86"
                    fill="none"
                    stroke="#3f4448"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                {CLOTHING_KINDS.map((kind) => {
                  const wornId = placed.find(
                    (id) => parseClothingId(id).kind === kind,
                  );
                  return (
                    <button
                      className={`${styles.slot} ${styles[`slot_${kind}`]} ${selectedId && !wornId ? styles.slotReady : ''}`}
                      key={kind}
                      type="button"
                      aria-label={`Put it on the ${kind}`}
                      onClick={() => selectedId && attempt(kind, selectedId)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => handleDrop(event, kind)}
                    >
                      {wornId ? (
                        <ClothingIcon
                          kind={kind}
                          color={COLOR_INFO[parseClothingId(wornId).color].hex}
                          className={styles.slotIcon}
                        />
                      ) : (
                        <ClothingIcon
                          kind={kind}
                          color="#ffffff"
                          className={`${styles.slotIcon} ${styles.slotHint}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <button
                className={`${styles.suitcase} ${selectedId ? styles.slotReady : ''}`}
                type="button"
                aria-label="Suitcase"
                onClick={() => selectedId && attempt('suitcase', selectedId)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(event, 'suitcase')}
              >
                <span className={styles.suitcaseHandle} aria-hidden="true" />
                <span className={styles.suitcaseBody}>
                  {correctIds.map((_, index) => {
                    const id = placed[index];
                    return (
                      <span className={styles.suitcaseSlot} key={index}>
                        {id ? SUITCASE_ITEMS[id].emoji : ''}
                      </span>
                    );
                  })}
                </span>
              </button>
            )}
          </div>

          <aside className={styles.toolPanel} aria-label="Clothes">
            <h2 className={styles.panelTitle}>Clothes · เสื้อผ้า</h2>
            <div className={styles.trayGrid}>{trayIds.map(renderTrayItem)}</div>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => speak(spokenInstruction)}
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
              <Link href="/games/everyday-vocabulary" className={styles.nextButton}>
                All done! · กลับไปหน้าบทเรียน
              </Link>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function DressUpBuddy() {
  return (
    <>
      <DressUpBuddyContent />
      <GameStatsFooter game="starter" totalLessons={7} />
    </>
  );
}
