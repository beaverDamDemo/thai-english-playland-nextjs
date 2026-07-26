'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type Snap from 'snapsvg-cjs';
import { useThaiQuestion } from '@/app/games/maze/_components/useThaiQuestion';
import styles from './ColorsSvgViewer.module.css';

type SnapStatic = typeof Snap;

const GRAY = '#808080';

const ALL_QUESTIONS = [
  { q: 'What color is the sky on a sunny day?',  options: ['green', 'blue', 'red', 'purple'],    answer: 1 },
  { q: 'What color is grass?',                    options: ['brown', 'blue', 'green', 'red'],     answer: 2 },
  { q: 'What color is a banana?',            options: ['green', 'red', 'blue', 'yellow'],    answer: 3 },
  { q: 'What color is snow?',                     options: ['grey', 'black', 'white', 'yellow'],  answer: 2 },
  { q: 'What color is a fire truck?',             options: ['blue', 'red', 'green', 'orange'],    answer: 1 },
  { q: 'What color is coal?',                     options: ['white', 'black', 'orange', 'blue'],  answer: 1 },
  { q: 'What color is a strawberry?',             options: ['blue', 'yellow', 'red', 'green'],    answer: 2 },
  { q: 'What color is a grape?',                  options: ['orange', 'pink', 'green', 'purple'], answer: 3 },
  { q: 'What color are leaves in autumn?',        options: ['blue', 'purple', 'orange', 'white'], answer: 2 },
  { q: 'What color is milk?',                     options: ['yellow', 'white', 'grey', 'pink'],   answer: 1 },
  { q: 'What color is the sun?',                  options: ['white', 'red', 'blue', 'yellow'],    answer: 3 },
  { q: 'What color is chocolate?',                options: ['brown', 'green', 'blue', 'yellow'],  answer: 0 },
  { q: 'What color is a lemon?',                  options: ['red', 'blue', 'yellow', 'purple'],   answer: 2 },
  { q: 'What color are most tree trunks?',        options: ['blue', 'white', 'brown', 'pink'],    answer: 2 },
  { q: 'What color is a carrot?',                 options: ['green', 'orange', 'red', 'purple'],  answer: 1 },
    { q: 'What color is an orange fruit?', options: ['purple', 'orange', 'blue', 'green'], answer: 1 },
  { q: 'What color is the ocean?', options: ['blue', 'yellow', 'red', 'brown'], answer: 0 },
  { q: 'What color is a tomato?', options: ['red', 'purple', 'blue', 'orange'], answer: 0 },
  { q: 'What color is a cucumber?', options: ['green', 'brown', 'yellow', 'pink'], answer: 0 },
  { q: 'What color is a blueberry?', options: ['yellow', 'purple', 'blue', 'orange'], answer: 2 },
  { q: 'What color is a pumpkin?', options: ['orange', 'blue', 'green', 'purple'], answer: 0 },
  { q: 'What color is a cloud?', options: ['white', 'black', 'purple', 'green'], answer: 0 },
  { q: 'What color is a zebra?', options: ['black and white', 'red', 'blue', 'yellow'], answer: 0 },
  { q: 'What color is a school bus?', options: ['yellow', 'purple', 'green', 'brown'], answer: 0 },
  { q: 'What color is a watermelon on the outside?', options: ['green', 'blue', 'pink', 'orange'], answer: 0 },
  { q: 'What color is a watermelon on the inside?', options: ['red', 'purple', 'blue', 'brown'], answer: 0 },
  { q: 'What color is a polar bear?', options: ['white', 'brown', 'black', 'orange'], answer: 0 },
  { q: 'What color is a fox?', options: ['orange', 'blue', 'purple', 'yellow'], answer: 0 },
  { q: 'What color is a potato?', options: ['brown', 'blue', 'red', 'purple'], answer: 0 },
  { q: 'What color is a dolphin?', options: ['grey', 'yellow', 'green', 'purple'], answer: 0 },
  { q: 'What color is a sunflower?', options: ['yellow', 'blue', 'purple', 'pink'], answer: 0 },
  { q: 'What color is a rose?', options: ['red', 'brown', 'blue', 'orange'], answer: 0 },
  { q: 'What color is a panda?', options: ['black and white', 'green', 'purple', 'yellow'], answer: 0 },
  { q: 'What color is a peach?', options: ['pink', 'blue', 'purple', 'black'], answer: 0 },
  { q: 'What color is a kiwi on the outside?', options: ['brown', 'yellow', 'blue', 'purple'], answer: 0 },
  { q: 'What color is a kiwi on the inside?', options: ['green', 'red', 'purple', 'orange'], answer: 0 },
  { q: 'What color is a lime?', options: ['green', 'purple', 'blue', 'brown'], answer: 0 },
  { q: 'What color is a flamingo?', options: ['pink', 'blue', 'yellow', 'purple'], answer: 0 },
  { q: 'What color is a tiger?', options: ['orange and black', 'blue', 'purple', 'green'], answer: 0 },
  { q: 'What color is a camel?', options: ['brown', 'blue', 'red', 'purple'], answer: 0 },
  { q: 'What color is a cherry?', options: ['red', 'yellow', 'purple', 'blue'], answer: 0 },
  { q: 'What color is a plum?', options: ['purple', 'green', 'yellow', 'blue'], answer: 0 },
  { q: 'What color is a mushroom?', options: ['brown', 'blue', 'red', 'purple'], answer: 0 },
  { q: 'What color is a shark?', options: ['grey', 'yellow', 'pink', 'purple'], answer: 0 },
  { q: 'What color is a coconut on the outside?', options: ['brown', 'blue', 'green', 'purple'], answer: 0 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Gray out every shape in a group, saving the original fill in data-original-fill.
 * Normalises fill to inline style so CSS transitions work reliably later.
 */
function grayOutGroup(groupEl: SVGElement): void {
  groupEl.querySelectorAll<SVGElement>('path,rect,circle,ellipse,polygon,polyline').forEach((el) => {
    const style = el.getAttribute('style') ?? '';
    const fillInStyle = style.match(/fill:\s*([^;}\s]+)/);
    const fillAttr = el.getAttribute('fill');
    const original = fillInStyle ? fillInStyle[1].trim() : fillAttr;
    if (original) el.setAttribute('data-original-fill', original);

    let newStyle = style;
    if (fillInStyle) {
      newStyle = newStyle.replace(/fill:\s*[^;}\s]+/g, `fill:${GRAY}`);
    } else if (fillAttr) {
      // Move fill attribute into inline style so transitions can animate it
      el.removeAttribute('fill');
      newStyle = (newStyle ? newStyle + '; ' : '') + `fill:${GRAY}`;
    }
    el.setAttribute('style', newStyle);
  });
}

function getGroupFills(groupEl: SVGElement): string[] {
  const fills = new Set<string>();
  groupEl.querySelectorAll<SVGElement>('path,rect,circle,ellipse,polygon,polyline').forEach((el) => {
    const style = el.getAttribute('style') ?? '';
    const fillInStyle = style.match(/fill:\s*([^;}\s]+)/);
    const fill = fillInStyle ? fillInStyle[1].trim() : el.getAttribute('fill');
    if (fill) fills.add(fill);
  });
  return [...fills];
}

function getGroupIssues({
  groupId,
  label,
  dataGroupColor,
  originalFills,
}: {
  groupId: string | null;
  label: string | null;
  dataGroupColor: string | null;
  originalFills: string[];
}): string[] {
  const issues: string[] = [];
  if (!groupId) issues.push('missing id');
  if (!label) issues.push('missing label');
  if (!dataGroupColor) issues.push('missing data-group-color');

  const isStatic = label === 'static';
  if (!isStatic && groupId && label && groupId !== label) {
    issues.push('id does not match label');
  }

  if (
    dataGroupColor &&
    originalFills.length > 0 &&
    !originalFills.some((fill) => fill.toLowerCase() === dataGroupColor.toLowerCase())
  ) {
    issues.push('data-group-color does not match a group fill');
  }

  return issues;
}

/** Restore a group's original per-element colours with a CSS fill transition. */
function revealGroup(groupEl: SVGElement): void {
  groupEl.querySelectorAll<SVGElement>('path,rect,circle,ellipse,polygon,polyline').forEach((el) => {
    const original = el.getAttribute('data-original-fill');
    if (!original) return;

    // Inject transition BEFORE changing fill so the browser can interpolate
    const style = el.getAttribute('style') ?? '';
    const withTransition = style.includes('transition:')
      ? style
      : (style ? style + '; ' : '') + 'transition: fill 0.8s ease';
    el.setAttribute('style', withTransition);

    // Change fill in next frame to actually trigger the transition
    requestAnimationFrame(() => {
      const s = el.getAttribute('style') ?? '';
      el.setAttribute('style', s.replace(/fill:\s*[^;}\s]+/g, `fill:${original}`));
    });
  });
}

export default function ColorsSvgViewer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const svgElRef = useRef<SVGSVGElement | null>(null);
  const [groupOrder, setGroupOrder] = useState<string[]>([]);
  const [groupsFoundCount, setGroupsFoundCount] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [questions] = useState(() => shuffle(ALL_QUESTIONS));
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;
    let cancelled = false;
    const svgEl = svgRef.current;
    svgElRef.current = svgEl;

    import('snapsvg-cjs').then((mod) => {
      if (cancelled) return;
      const SnapLib = (mod.default ?? mod) as unknown as SnapStatic;
      const s = SnapLib(svgEl as unknown as string);

      SnapLib.load('/assets/tiger-output-1-grouped.svg', (fragment) => {
        if (cancelled) return;
        s.append(fragment);

        const order: string[] = [];
        svgEl.querySelectorAll<SVGGElement>('g').forEach((g) => {
          const groupId = g.getAttribute('id') ?? g.id;
          const id = groupId || '(no id)';
          const label = g.getAttribute('inkscape:label');
          const dataGroupColor = g.getAttribute('data-group-color');
          const originalFills = getGroupFills(g);
          const isStatic = label === 'static';
          const issues = getGroupIssues({
            groupId,
            label,
            dataGroupColor,
            originalFills,
          });

          if (process.env.NODE_ENV !== 'production' && issues.length > 0) {
            console.error('Invalid Lesson 1 SVG group metadata:', {
              id,
              label: label || '(no label)',
              dataGroupColor: dataGroupColor || '(missing)',
              originalFills,
              issues,
            });
          }

          if (isStatic || issues.length > 0) return;
          if (groupId) order.push(groupId);
          grayOutGroup(g);
        });

        if (!cancelled) {
          setGroupOrder(order);
          setGroupsFoundCount(svgEl.querySelectorAll('g').length);
        }
      });
    });

    return () => { cancelled = true; };
  }, []);

  const handleAnswer = (optionIndex: number) => {
    if (locked || !groupOrder.length) return;
    const q = questions[qIndex % questions.length];
    const isCorrect = optionIndex === q.answer;

    setSelectedOption(optionIndex);
    setLocked(true);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect && revealedCount < groupOrder.length && svgElRef.current) {
      const groupEl = svgElRef.current.querySelector<SVGGElement>(`#${groupOrder[revealedCount]}`);
      if (groupEl) revealGroup(groupEl);
      setRevealedCount((c) => c + 1);
    }

    setTimeout(() => {
      setFeedback(null);
      setLocked(false);
      setSelectedOption(null);
      if (isCorrect) setQIndex((i) => i + 1);
    }, isCorrect ? 1400 : 900);
  };

  const allRevealed = groupOrder.length > 0 && revealedCount >= groupOrder.length;
  const q = questions[qIndex % questions.length];
  const thaiQuestion = useThaiQuestion(q.q);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/games/starter" className={styles.back}>
          <Image src="/assets/tinified/back.png" alt="Back" width={34} height={34} />
        </Link>
        <h1 className={styles.title}>Colors</h1>
        <div className={styles.dots}>
          {groupOrder.map((id, i) => (
            <span key={id} className={`${styles.dot} ${i < revealedCount ? styles.dotDone : ''}`} />
          ))}
        </div>
      </header>

      <main className={styles.main}>
        <svg
          ref={svgRef}
          className={styles.svgCanvas}
          viewBox="0 0 1024 1536"
          xmlns="http://www.w3.org/2000/svg"
        />
        {process.env.NODE_ENV !== 'production' && (
          <aside className={styles.debugOverlay} aria-label="Lesson debug information">
            <strong>Debug</strong>
            <span>Groups found: {groupsFoundCount}</span>
            <span>Revealable: {groupOrder.length}</span>
            <span>Revealed: {revealedCount}</span>
            <span>Question: {qIndex + 1}</span>
            <span>Selected: {selectedOption ?? 'none'}</span>
            <span>Locked: {locked ? 'yes' : 'no'}</span>
          </aside>
        )}
      </main>

      <section className={styles.quiz}>
        {groupOrder.length === 0 ? (
          <p className={styles.hint}>Loading…</p>
        ) : allRevealed ? (
          <div className={styles.complete}>
            <p>🎉 You revealed all the colors!</p>
            <Link href="/games/starter" className={styles.doneBtn}>← Back to Starter Zone</Link>
          </div>
        ) : (
          <>
            <p className={styles.question}>{q.q}</p>
            {thaiQuestion && <p className={styles.questionThai}>{thaiQuestion}</p>}
            <div className={styles.options}>
              {q.options.map((opt, i) => {
                let cls = styles.option;
                if (feedback && i === q.answer) cls += ` ${styles.optionCorrect}`;
                else if (selectedOption === i && feedback === 'wrong') cls += ` ${styles.optionWrong}`;
                return (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={locked} className={cls}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
