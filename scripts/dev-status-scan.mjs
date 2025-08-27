#!/usr/bin/env node
// Simple repo scanner to surface WIP/Mock/Unimplemented indicators into public/dev-status.json
// - Scans src/**/*.tsx? and api/**/*.ts for markers and TODOs
// - Merges with public/flags.json for route-level status

import { promises as fs } from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());
const srcDir = path.join(repoRoot, 'src');
const apiDir = path.join(repoRoot, 'api');
const publicDir = path.join(repoRoot, 'public');
const flagsPath = path.join(publicDir, 'flags.json');
const outPath = path.join(publicDir, 'dev-status.json');

/** @typedef {{file:string,line:number,snippet:string,kind:'todo'|'mock'|'wip'|'error'|'note'}} Finding */

/** @param {string} dir */
async function listFilesRecursively(dir) {
  /** @type {string[]} */
  const results = [];
  async function walk(current) {
    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = path.join(current, e.name);
      if (e.isDirectory()) {
        // Skip node_modules, .git, dist, coverage, local dev server sources
        if (/node_modules|\.git|dist|coverage|\.next|build|__mocks__|__tests__/i.test(p)) continue;
        // Ignore development-only express server files (not deployed to prod)
        if (/\bsrc[\/\\]server\b/i.test(p)) continue;
        await walk(p);
      } else if (/\.(tsx?|jsx?|mjs|ts)$/.test(e.name)) {
        results.push(p);
      }
    }
  }
  await walk(dir);
  return results;
}

/** @param {string} file */
async function scanFile(file) {
  /** @type {Finding[]} */
  const findings = [];
  let content = '';
  try {
    content = await fs.readFile(file, 'utf8');
  } catch {
    return findings;
  }
  const lines = content.split(/\r?\n/);
  const relative = path.relative(repoRoot, file).replace(/\\/g, '/');
  const pushFinding = (idx, snippet, kind) => {
    findings.push({ file: relative, line: idx + 1, snippet: snippet.trim().slice(0, 200), kind });
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // TODO-like markers (broad)
    if (/(TODO|FIXME|未実装)/.test(line)) {
      pushFinding(i, line, 'todo');
    }

    // WIP markers: count only when present in code comments, not in user-facing UI strings
    // - Ignore StatusBanners.tsx (the banner text includes "開発中です")
    // - Require the marker to be in a comment line (starts with // or contains /* ... */)
    const isCommentLine = /^\/\//.test(trimmed) || /\/\*/.test(trimmed);
    const isWipToken = /\bWIP\b/.test(line) || /開発中/.test(line);
    const isBannerFile = /src\/components\/layout\/StatusBanners\.tsx$/.test(relative);
    if (!isBannerFile && isCommentLine && isWipToken) {
      pushFinding(i, line, 'wip');
    }

    // Mock/Dummy markers (keep broad)
    if (/(^|[^a-zA-Z])(mock|dummy|モック|ダミー)([^a-zA-Z]|$)/i.test(line)) {
      pushFinding(i, line, 'mock');
    }

    // Error hints: focus on explicit thrown errors, not generic console.error handlers
    // - Exclude unifiedErrorHandler usage
    // - Exclude ErrorBoundary and logging lines
    const isThrownError = /throw new Error\(/i.test(line);
    const mentionsUnifiedHandler = /unifiedErrorHandler\.handleError/i.test(line);
    if (isThrownError && !mentionsUnifiedHandler) {
      pushFinding(i, line, 'error');
    }

    // Notes and tech-debt tags
    if (/@deprecated|HACK|WORKAROUND/.test(line)) {
      pushFinding(i, line, 'note');
    }
  }
  return findings;
}

async function readJsonSafe(p, fallback) {
  try {
    const raw = await fs.readFile(p, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function main() {
  const [srcFiles, apiFiles] = await Promise.all([
    listFilesRecursively(srcDir).catch(() => []),
    listFilesRecursively(apiDir).catch(() => []),
  ]);
  const files = [...srcFiles, ...apiFiles];

  const chunks = await Promise.all(files.map((f) => scanFile(f)));
  const findings = chunks.flat();

  const flags = await readJsonSafe(flagsPath, { wipRoutes: [], mockRoutes: [] });
  const summary = {
    generatedAt: new Date().toISOString(),
    totals: {
      filesScanned: files.length,
      findings: findings.length,
      todo: findings.filter((f) => f.kind === 'todo').length,
      mock: findings.filter((f) => f.kind === 'mock').length,
      wip: findings.filter((f) => f.kind === 'wip').length,
      errorHints: findings.filter((f) => f.kind === 'error').length,
    },
    flags,
    findings,
  };

  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(summary, null, 2), 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Wrote dev status to ${path.relative(repoRoot, outPath)} (findings=${findings.length})`);

  // --- Optional: publish local test artifacts for /dev-status ---
  try {
    const covSrc = path.join(repoRoot, 'coverage', 'coverage-summary.json');
    const covDest = path.join(publicDir, 'coverage-summary.json');
    const cov = await fs.readFile(covSrc, 'utf8').catch(() => null);
    if (cov) {
      await fs.writeFile(covDest, cov, 'utf8');
      console.log(`Published coverage to ${path.relative(repoRoot, covDest)}`);
    }
  } catch { }

  try {
    // Try to read Cypress summary JSON if exists
    const e2eSummaryPath = path.join(repoRoot, 'cypress', 'results', 'summary.json');
    const e2eRaw = await fs.readFile(e2eSummaryPath, 'utf8').catch(() => null);
    /** @type {{stats?:{tests?:number,passes?:number,failures?:number,pending?:number,skipped?:number}}|null} */
    let e2eParsed = null;
    if (e2eRaw) {
      try { e2eParsed = JSON.parse(e2eRaw); } catch { }
    }
    let e2e = { available: false };
    if (e2eParsed && e2eParsed.stats) {
      const s = e2eParsed.stats;
      const total = Number(s.tests || 0);
      const passes = Number(s.passes || 0);
      const failures = Number(s.failures || 0);
      const pending = Number(s.pending || 0);
      const skipped = Number(s.skipped || 0);
      const considered = Math.max(1, total || passes + failures + pending + skipped);
      const passPct = Math.min(100, Math.max(0, (passes / considered) * 100));
      e2e = { available: true, total, passes, failures, passPct: Math.round(passPct * 10) / 10 };
      const pub = path.join(publicDir, 'e2e-summary.json');
      await fs.writeFile(pub, JSON.stringify({ total, passes, failures, pending, skipped, passPct }, null, 2), 'utf8');
      console.log(`Published e2e summary to ${path.relative(repoRoot, pub)}`);
    }

    const testSummary = {
      generatedAt: new Date().toISOString(),
      unit: {
        hasCoverage: await fs
          .stat(path.join(repoRoot, 'coverage', 'coverage-summary.json'))
          .then(() => true)
          .catch(() => false),
      },
      e2e,
    };
    const testSummaryPath = path.join(publicDir, 'test-summary.json');
    await fs.writeFile(testSummaryPath, JSON.stringify(testSummary, null, 2), 'utf8');
    console.log(`Published test summary to ${path.relative(repoRoot, testSummaryPath)}`);
  } catch { }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});


