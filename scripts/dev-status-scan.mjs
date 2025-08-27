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
        // Skip node_modules, .git, dist, coverage
        if (/node_modules|\.git|dist|coverage|\.next|build|__mocks__|__tests__/i.test(p)) continue;
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
  const pushFinding = (idx, snippet, kind) => {
    findings.push({ file: path.relative(repoRoot, file), line: idx + 1, snippet: snippet.trim().slice(0, 200), kind });
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/TODO|FIXME|未実装|WIP|開発中/.test(line)) pushFinding(i, line, /WIP|開発中/.test(line) ? 'wip' : 'todo');
    if (/mock|dummy|モック|ダミー/.test(line)) pushFinding(i, line, 'mock');
    // Error hints: ignore ErrorBoundary import/usage lines to reduce noise
    if (/throw new Error\(|console\.error\(|error-report/i.test(line)) pushFinding(i, line, 'error');
    if (/@deprecated|HACK|WORKAROUND/.test(line)) pushFinding(i, line, 'note');
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
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});


