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
  { q: 'What color is a ripe banana?',            options: ['green', 'red', 'blue', 'yellow'],    answer: 3 },
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
        svgEl.querySelectorAll<SVGGElement>('g[data-group-color]').forEach((g) => {
          if (g.getAttribute('inkscape:label') === 'static') return;
          const id = g.getAttribute('id') ?? g.id;
          if (id) order.push(id);
          grayOutGroup(g);
        });

        if (!cancelled) setGroupOrder(order);
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
            <span>Groups: {groupOrder.length}</span>
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
