import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const TARGET_ROOT = path.join(ROOT_DIR, 'app');
const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

const violations = [];

function walk(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name);
    if (!CODE_EXTENSIONS.has(ext)) continue;

    scanFile(fullPath);
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(/^\s*(q|prompt):\s*'(.*)',\s*$/);
    if (!match) continue;

    const key = match[1];
    const body = match[2];
    const bodyWithoutEscaped = body.replace(/\\'/g, '');

    if (bodyWithoutEscaped.includes("'")) {
      violations.push({
        filePath,
        line: i + 1,
        key,
        text: line.trim(),
      });
    }
  }
}

if (!fs.existsSync(TARGET_ROOT)) {
  console.error('Target folder not found: app');
  process.exit(1);
}

walk(TARGET_ROOT);

if (violations.length > 0) {
  console.error(
    'Found potentially broken single-quoted strings with unescaped apostrophes:',
  );
  for (const violation of violations) {
    const relPath = path
      .relative(ROOT_DIR, violation.filePath)
      .replace(/\\/g, '/');
    console.error(`- ${relPath}:${violation.line} (${violation.key})`);
    console.error(`  ${violation.text}`);
  }
  console.error(
    "\nUse double quotes for these strings or escape apostrophes (\\').",
  );
  process.exit(1);
}

console.log('No unescaped apostrophe issues found in q/prompt strings.');
