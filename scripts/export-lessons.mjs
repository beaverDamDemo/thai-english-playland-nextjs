#!/usr/bin/env node
/**
 * Exports all lesson quiz data to JSON and Markdown.
 *
 * Reads:
 *   - app/<game>/lessonN/Quiz.tsx           (casino, maze)
 *   - app/pattaya-games/lessonN/page.tsx    (data lives in page.tsx)
 *
 * Writes:
 *   - lessons-export.json
 *   - lessons-export.md
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const APP = path.join(ROOT, 'app');

const GAMES = ['maze', 'casino', 'pattaya-games'];

/** Find balanced bracketed expression starting at openIndex (which points at '['). */
function extractBracketed(src, openIndex) {
  if (src[openIndex] !== '[') return null;
  let depth = 0;
  let inStr = null; // " ' `
  let inLineComment = false;
  let inBlockComment = false;
  for (let i = openIndex; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inStr) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inStr = ch;
      continue;
    }
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) return src.slice(openIndex, i + 1);
    }
  }
  return null;
}

/** Extract a top-level array literal assigned to a given variable name. */
function extractArrayLiteral(src, varName) {
  // Match: const|let|var <varName>(<: Type>)? = [
  const re = new RegExp(
    `\\b(?:const|let|var)\\s+${varName}\\s*(?::[^=]+)?=\\s*\\[`,
    'm',
  );
  const m = re.exec(src);
  if (!m) return null;
  const openIdx = m.index + m[0].length - 1;
  return extractBracketed(src, openIdx);
}

/** Evaluate a JS array literal source string into a JS value. */
function evalLiteral(literalSrc) {
  return vm.runInNewContext(`(${literalSrc})`, {}, { timeout: 1000 });
}

function tryExtract(src, name) {
  const lit = extractArrayLiteral(src, name);
  if (!lit) return null;
  try {
    return evalLiteral(lit);
  } catch (err) {
    console.warn(`  ! failed to eval ${name}: ${err.message}`);
    return null;
  }
}

function readIfExists(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

function listLessonDirs(gameDir) {
  if (!fs.existsSync(gameDir)) return [];
  return fs
    .readdirSync(gameDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^lesson\d+$/i.test(d.name))
    .map((d) => ({
      name: d.name,
      number: parseInt(d.name.replace(/\D/g, ''), 10),
      path: path.join(gameDir, d.name),
    }))
    .sort((a, b) => a.number - b.number);
}

function processLesson(game, lesson) {
  const quizPath = path.join(lesson.path, 'Quiz.tsx');
  const pagePath = path.join(lesson.path, 'page.tsx');
  const quizSrc = readIfExists(quizPath);
  const pageSrc = readIfExists(pagePath);

  const out = {
    game,
    lesson: lesson.number,
    folder: lesson.name,
    sources: [],
    quizzes: {},
  };

  if (quizSrc) {
    out.sources.push(`app/${game}/${lesson.name}/Quiz.tsx`);
    const questions = tryExtract(quizSrc, 'questions');
    if (questions) out.quizzes.questions = questions;
  }

  if (pageSrc) {
    // Pattaya stores quiz arrays in page.tsx
    const practice = tryExtract(pageSrc, 'practiceChallenges');
    const apply = tryExtract(pageSrc, 'applyChallenges');
    const verbs = tryExtract(pageSrc, 'VERBS');
    if (practice || apply || verbs) {
      out.sources.push(`app/${game}/${lesson.name}/page.tsx`);
    }
    if (practice) out.quizzes.practiceChallenges = practice;
    if (apply) out.quizzes.applyChallenges = apply;
    if (verbs) out.quizzes.verbs = verbs;
  }

  return out;
}

function buildMarkdown(allLessons) {
  const lines = [];
  lines.push('# Lessons Export');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  for (const game of GAMES) {
    const gameLessons = allLessons.filter((l) => l.game === game);
    if (gameLessons.length === 0) continue;
    lines.push(`## ${game}`);
    lines.push('');

    for (const l of gameLessons) {
      lines.push(`### ${game} — ${l.folder}`);
      lines.push('');
      lines.push(`Sources: ${l.sources.map((s) => `\`${s}\``).join(', ')}`);
      lines.push('');

      const q = l.quizzes;

      if (q.questions) renderQuestions(lines, 'Questions', q.questions);
      if (q.practiceChallenges)
        renderQuestions(lines, 'Practice challenges', q.practiceChallenges);
      if (q.applyChallenges)
        renderQuestions(lines, 'Apply challenges', q.applyChallenges);
      if (q.verbs) renderVerbs(lines, q.verbs);

      if (Object.keys(q).length === 0) {
        lines.push('_No quiz data extracted._');
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

function renderQuestions(lines, title, items) {
  lines.push(`#### ${title} (${items.length})`);
  lines.push('');
  items.forEach((item, i) => {
    const prompt = item.q ?? item.prompt ?? '(no prompt)';
    lines.push(`${i + 1}. **${prompt}**`);
    if (Array.isArray(item.options)) {
      item.options.forEach((opt, idx) => {
        const correct = idx === item.answer ? ' ✅' : '';
        lines.push(`   - ${opt}${correct}`);
      });
    }
    lines.push('');
  });
}

function renderVerbs(lines, verbs) {
  lines.push(`#### Irregular verbs (${verbs.length})`);
  lines.push('');
  lines.push('| Base | Past Simple | Past Participle |');
  lines.push('| ---- | ----------- | --------------- |');
  for (const v of verbs) {
    lines.push(`| ${v.base} | ${v.past} | ${v.participle} |`);
  }
  lines.push('');
}

function main() {
  const allLessons = [];
  for (const game of GAMES) {
    const gameDir = path.join(APP, game);
    const lessons = listLessonDirs(gameDir);
    console.log(`\n=== ${game} (${lessons.length} lessons) ===`);
    for (const lesson of lessons) {
      console.log(`  • ${lesson.name}`);
      const data = processLesson(game, lesson);
      const counts = Object.entries(data.quizzes).map(
        ([k, v]) => `${k}=${Array.isArray(v) ? v.length : '?'}`,
      );
      console.log(`    extracted: ${counts.join(', ') || '(none)'}`);
      allLessons.push(data);
    }
  }

  const jsonPath = path.join(ROOT, 'lessons-export.json');
  const mdPath = path.join(ROOT, 'lessons-export.md');

  const json = {
    generatedAt: new Date().toISOString(),
    totalLessons: allLessons.length,
    lessons: allLessons,
  };
  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
  fs.writeFileSync(mdPath, buildMarkdown(allLessons), 'utf8');

  console.log(`\n✓ Wrote ${path.relative(ROOT, jsonPath)}`);
  console.log(`✓ Wrote ${path.relative(ROOT, mdPath)}`);
}

main();
