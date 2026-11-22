'use client';

import { useEffect, useMemo, useState } from 'react';
import SiteHeader from '../_components/SiteHeader';
import SiteFooter from '../_components/SiteFooter';
import { curriculumZones, getLessonHref, type CurriculumLesson, type CurriculumZone } from '../_games/curriculum';
import { LESSON_CONTENT, type LessonContent, type TopicType } from '../_games/lessonContent';
import styles from './lessonContent.module.css';

type LessonStats = { learners: number; completed: number; correct: number; wrong: number; attempts: number };

type Row = {
  zone: CurriculumZone;
  lesson: CurriculumLesson;
  content: LessonContent | undefined;
  count: number;
  unit: 'questions' | 'words' | null;
  problems: string[];
};

const STATUS_LABEL = { done: 'Done', change: 'Needs change', blank: 'Blank' } as const;
const FEW_QUESTIONS = 15;
const FEW_WORDS = 8;
const LOW_ACCURACY = 60;
const MIN_ANSWERS_FOR_ACCURACY = 10;

const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim();
// Same wording AND same options = a real duplicate. (Many questions share a generic
// instruction like "Choose the correct sentence." but have different options.)
const questionKey = (q: { question: string; options: string[] }) =>
  `${normalize(q.question)} | ${q.options.map(normalize).sort().join(' / ')}`;

function accuracyOf(stats: LessonStats | undefined): number | null {
  if (!stats) return null;
  const answered = stats.correct + stats.wrong;
  return answered >= MIN_ANSWERS_FOR_ACCURACY ? Math.round((stats.correct / answered) * 100) : null;
}

/** Data mistakes inside one lesson's content (things the game would show wrongly). */
function contentProblems(content: LessonContent): string[] {
  const problems: string[] = [];
  const seen = new Map<string, number>();
  content.questions?.forEach((q, index) => {
    const label = `Q${index + 1}`;
    if (q.answer < 0 || q.answer >= q.options.length) problems.push(`${label}: correct answer #${q.answer + 1} doesn't exist (${q.options.length} options)`);
    const opts = q.options.map(normalize);
    if (new Set(opts).size !== opts.length) problems.push(`${label}: the same option appears twice`);
    const key = questionKey(q);
    if (seen.has(key)) problems.push(`${label}: same question and options as Q${(seen.get(key) ?? 0) + 1}`);
    else seen.set(key, index);
  });
  return problems;
}

export default function LessonContentPage() {
  const [stats, setStats] = useState<Record<string, LessonStats> | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TopicType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CurriculumLesson['status']>('all');
  const [openAll, setOpenAll] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/lesson-stats')
      .then((r) => r.json())
      .then((data: { ok?: boolean; lessons?: Record<string, LessonStats> }) => {
        if (!data.ok || !data.lessons) throw new Error('bad response');
        setStats(data.lessons);
      })
      .catch(() => setStatsError(true));
  }, []);

  const rows: Row[] = useMemo(
    () =>
      curriculumZones.flatMap((zone) =>
        zone.lessons.map((lesson) => {
          const content = LESSON_CONTENT[lesson.id];
          const count = content?.questions?.length ?? content?.words?.length ?? 0;
          const unit = content?.questions ? 'questions' : content?.words ? 'words' : null;
          return { zone, lesson, content, count, unit, problems: content ? contentProblems(content) : [] };
        }),
      ),
    [],
  );

  // Questions that appear (word for word) in more than one lesson.
  const crossDuplicates = useMemo(() => {
    const byKey = new Map<string, { question: string; lessons: Set<string> }>();
    rows.forEach(({ lesson, content }) =>
      content?.questions?.forEach((q) => {
        const key = questionKey(q);
        if (!byKey.has(key)) byKey.set(key, { question: q.question, lessons: new Set() });
        byKey.get(key)?.lessons.add(lesson.title);
      }),
    );
    return [...byKey.values()].filter(({ lessons }) => lessons.size > 1).map(({ question, lessons }) => [question, lessons] as const);
  }, [rows]);

  const issues = useMemo(() => {
    const list: Array<{ kind: string; text: string; lessonId?: string }> = [];
    rows.forEach(({ zone, lesson, content, count, unit, problems }) => {
      const where = `${zone.icon} ${lesson.number}. ${lesson.title}`;
      if (!content) list.push({ kind: 'Missing', text: `${where}: no entry in lessonContent.ts`, lessonId: lesson.id });
      if (lesson.status === 'blank') list.push({ kind: 'Blank', text: `${where}: no game and no content yet`, lessonId: lesson.id });
      if (lesson.status === 'change') list.push({ kind: 'Needs change', text: where, lessonId: lesson.id });
      if (unit === 'questions' && count < FEW_QUESTIONS) list.push({ kind: 'Few questions', text: `${where}: only ${count} questions`, lessonId: lesson.id });
      if (unit === 'words' && count < FEW_WORDS) list.push({ kind: 'Few words', text: `${where}: only ${count} words`, lessonId: lesson.id });
      problems.forEach((p) => list.push({ kind: 'Data mistake', text: `${where} — ${p}`, lessonId: lesson.id }));
      const accuracy = accuracyOf(stats?.[lesson.id]);
      if (accuracy !== null && accuracy < LOW_ACCURACY) list.push({ kind: 'Hard for learners', text: `${where}: ${accuracy}% correct`, lessonId: lesson.id });
    });
    crossDuplicates.forEach(([question, lessons]) =>
      list.push({ kind: 'Duplicate', text: `"${question}" appears in: ${[...lessons].join(', ')}` }),
    );
    return list;
  }, [rows, stats, crossDuplicates]);

  const q = normalize(query);
  const visible = (row: Row) => {
    if (typeFilter !== 'all' && row.content?.topicType !== typeFilter) return false;
    if (statusFilter !== 'all' && row.lesson.status !== statusFilter) return false;
    if (!q) return true;
    const haystack = [
      row.lesson.title,
      row.content?.focus ?? '',
      ...(row.content?.questions?.flatMap((item) => [item.question, ...item.options]) ?? []),
      ...(row.content?.words?.flatMap((word) => [word.en, word.th ?? '']) ?? []),
    ];
    return haystack.some((text) => normalize(text).includes(q));
  };

  const totals = {
    lessons: rows.length,
    playable: rows.filter((r) => r.lesson.href).length,
    grammar: rows.filter((r) => r.content?.topicType === 'grammar').length,
    vocabulary: rows.filter((r) => r.content?.topicType === 'vocabulary').length,
    questions: rows.reduce((sum, r) => sum + (r.content?.questions?.length ?? 0), 0),
    words: rows.reduce((sum, r) => sum + (r.content?.words?.length ?? 0), 0),
    done: rows.filter((r) => r.lesson.status === 'done').length,
    change: rows.filter((r) => r.lesson.status === 'change').length,
    blank: rows.filter((r) => r.lesson.status === 'blank').length,
  };
  const visibleCount = rows.filter(visible).length;

  return (
    <>
      <SiteHeader title="Lesson Content" subtitle="What English each lesson teaches" icon="📖" theme="content" width={1400} />
      <main className={styles.container}>
        <section className={styles.summary} aria-label="Summary">
          <div className={styles.kpi}>
            <span className={styles.kpiLabel}>Lessons</span>
            <span className={styles.kpiValue}>{totals.lessons}</span>
            <span className={styles.kpiHint}>{totals.playable} playable · {totals.lessons - totals.playable} blank</span>
          </div>
          <div className={styles.kpi}>
            <span className={styles.kpiLabel}>Topic type</span>
            <span className={styles.kpiValue}>
              {totals.grammar}
              <span className={styles.kpiSmall}> grammar</span>
            </span>
            <span className={styles.kpiHint}>{totals.vocabulary} vocabulary</span>
          </div>
          <div className={styles.kpi}>
            <span className={styles.kpiLabel}>Status</span>
            <span className={styles.kpiValue}>
              {totals.done}
              <span className={styles.kpiSmall}> done</span>
            </span>
            <span className={styles.kpiHint}>{totals.change} need change · {totals.blank} blank</span>
          </div>
          <div className={styles.kpi}>
            <span className={styles.kpiLabel}>English content</span>
            <span className={styles.kpiValue}>
              {totals.questions}
              <span className={styles.kpiSmall}> questions</span>
            </span>
            <span className={styles.kpiHint}>+ {totals.words} words in vocabulary games</span>
          </div>
        </section>

        <section className={styles.issues} aria-labelledby="issues-title">
          <h2 id="issues-title" className={styles.sectionTitle}>
            🔎 Things to look at <span className={styles.badge}>{issues.length}</span>
          </h2>
          {issues.length === 0 ? (
            <p className={styles.muted}>Nothing flagged.</p>
          ) : (
            <ul className={styles.issueList}>
              {issues.map((issue, index) => (
                <li key={index} className={styles.issue} data-kind={issue.kind}>
                  <span className={styles.issueKind}>{issue.kind}</span>
                  {issue.lessonId ? <a href={`#lesson-${issue.lessonId}`}>{issue.text}</a> : <span>{issue.text}</span>}
                </li>
              ))}
            </ul>
          )}
          <p className={styles.muted}>
            Flags: fewer than {FEW_QUESTIONS} questions or {FEW_WORDS} words · under {LOW_ACCURACY}% correct (once a lesson has{' '}
            {MIN_ANSWERS_FOR_ACCURACY}+ answers){statsError ? ' · learner stats unavailable' : ''}
          </p>
        </section>

        <div className={styles.toolbar} role="search">
          <input
            type="search"
            className={styles.search}
            placeholder="Search topics, questions and words…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search lessons"
          />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)} aria-label="Topic type">
            <option value="all">All types</option>
            <option value="grammar">Grammar</option>
            <option value="vocabulary">Vocabulary</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} aria-label="Status">
            <option value="all">All statuses</option>
            <option value="done">Done</option>
            <option value="change">Needs change</option>
            <option value="blank">Blank</option>
          </select>
          <button type="button" className={styles.toolbarButton} onClick={() => setOpenAll(true)}>
            Expand all
          </button>
          <button type="button" className={styles.toolbarButton} onClick={() => setOpenAll(false)}>
            Collapse all
          </button>
          <span className={styles.muted}>
            {visibleCount} of {rows.length} lessons
          </span>
        </div>

        {curriculumZones.map((zone) => {
          const zoneRows = rows.filter((row) => row.zone.id === zone.id && visible(row));
          if (zoneRows.length === 0) return null;
          return (
            <section key={zone.id} className={styles.zone} aria-labelledby={`zone-${zone.id}`}>
              <h2 id={`zone-${zone.id}`} className={styles.zoneTitle} data-game-zone={zone.id}>
                {zone.icon} {zone.title}
              </h2>
              <div className={styles.tableHead} aria-hidden="true">
                <span>#</span>
                <span>English topic</span>
                <span>Type</span>
                <span>Status</span>
                <span>Content</span>
                <span>Learners</span>
                <span>Correct</span>
                <span>Game</span>
              </div>
              {zoneRows.map((row) => (
                <LessonRow
                  key={row.lesson.id}
                  row={row}
                  stats={stats?.[row.lesson.id]}
                  statsLoading={stats === null && !statsError}
                  open={openAll ?? undefined}
                  highlight={q}
                />
              ))}
            </section>
          );
        })}
        {visibleCount === 0 ? <p className={styles.empty}>No lessons match.</p> : null}
      </main>
      <SiteFooter theme="content" width={1400} />
    </>
  );
}

function LessonRow({
  row,
  stats,
  statsLoading,
  open,
  highlight,
}: {
  row: Row;
  stats: LessonStats | undefined;
  statsLoading: boolean;
  open: boolean | undefined;
  highlight: string;
}) {
  const { zone, lesson, content, count, unit, problems } = row;
  const accuracy = accuracyOf(stats);
  const few = (unit === 'questions' && count < FEW_QUESTIONS) || (unit === 'words' && count < FEW_WORDS);
  const marks = (text: string) => (highlight && normalize(text).includes(highlight) ? styles.match : undefined);

  return (
    <details id={`lesson-${lesson.id}`} className={styles.row} open={open}>
      <summary className={styles.rowSummary}>
        <span className={styles.number}>{lesson.number}</span>
        <span className={styles.topic}>
          <strong>{lesson.title}</strong>
          {content?.focus ? <span className={styles.focus}>{content.focus}</span> : null}
        </span>
        <span>
          {content ? <span className={styles.typeTag} data-type={content.topicType}>{content.topicType}</span> : '—'}
        </span>
        <span>
          <span className={styles.statusTag} data-status={lesson.status}>
            {STATUS_LABEL[lesson.status]}
          </span>
        </span>
        <span className={few || count === 0 ? styles.warn : undefined}>
          {unit ? `${count} ${unit}` : 'no content'}
          {problems.length ? <span className={styles.problemCount}> · ⚠ {problems.length}</span> : null}
        </span>
        <span>{statsLoading ? '…' : stats ? `${stats.learners} · ${stats.completed} done` : lesson.href ? '0' : '—'}</span>
        <span className={accuracy !== null && accuracy < LOW_ACCURACY ? styles.warn : undefined}>
          {statsLoading ? '…' : accuracy !== null ? `${accuracy}%` : '—'}
        </span>
        <span className={styles.game}>
          {lesson.icon} {lesson.activity}
        </span>
      </summary>

      <div className={styles.rowBody}>
        <p className={styles.meta}>
          {lesson.href ? (
            <a href={getLessonHref(zone, lesson)}>{getLessonHref(zone, lesson)}</a>
          ) : (
            <span>{getLessonHref(zone, lesson)} (coming soon page)</span>
          )}
          {content?.sources.length ? <> · source: {content.sources.map((s) => `app/_games/${s}`).join(', ')}</> : null}
          {stats ? <> · answers: {stats.correct} correct, {stats.wrong} wrong</> : null}
        </p>

        {problems.length ? (
          <ul className={styles.problems}>
            {problems.map((problem) => (
              <li key={problem}>⚠ {problem}</li>
            ))}
          </ul>
        ) : null}

        {content?.questions ? (
          <ol className={styles.questions}>
            {content.questions.map((item, index) => (
              <li key={index} className={marks(item.question)}>
                <span className={styles.questionText}>{item.question}</span>
                <span className={styles.options}>
                  {item.options.map((option, optionIndex) => (
                    <span key={optionIndex} className={optionIndex === item.answer ? styles.correct : styles.option}>
                      {optionIndex === item.answer ? '✓ ' : ''}
                      {option}
                    </span>
                  ))}
                </span>
                {item.thai ? <span className={styles.thai}>{item.thai}</span> : null}
              </li>
            ))}
          </ol>
        ) : null}

        {content?.words ? (
          <ul className={styles.words}>
            {content.words.map((word, index) => (
              <li key={index} className={`${styles.word} ${marks(word.en) ?? ''}`}>
                {word.emoji ? <span aria-hidden="true">{word.emoji}</span> : null}
                <strong>{word.en}</strong>
                {word.th ? <span className={styles.thai}>{word.th}</span> : null}
                {word.note ? <span className={styles.note}>{word.note}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}

        {!content?.questions && !content?.words ? (
          <p className={styles.empty}>No English content yet. {lesson.description}</p>
        ) : null}
      </div>
    </details>
  );
}
