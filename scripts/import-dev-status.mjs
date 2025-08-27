#!/usr/bin/env node
// Import a remote dev-status JSON and optional flags.json, snapshot into repo, generate backlog MD and CSV,
// and merge flags with public/flags.json (union).

import fs from 'node:fs';
import path from 'node:path';

function parseArgs() {
  const args = process.argv.slice(2);
  /** @type {Record<string,string|boolean>} */
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
      out[key] = val;
    }
  }
  return out;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function readJsonSafe(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

function toCsv(rows) {
  return rows
    .map((r) => r.map((c) => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(','))
    .join('\n');
}

function nowTs() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    '-' +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

function main() {
  const args = parseArgs();
  const inputPath = String(args.input || 'remote-dev-status.json');
  const flagsPath = String(args.flags || 'remote-flags.json');
  const remoteUrl = String(args['remote-url'] || '');

  const repoRoot = process.cwd();
  const destDir = path.join(repoRoot, 'backlog', 'dev-status', 'work-time-tracker-five');
  ensureDir(destDir);
  const ts = nowTs();

  // Load dev-status JSON
  const devStatus = readJsonSafe(inputPath, null);
  if (!devStatus || !devStatus.findings) {
    console.error('No valid dev-status JSON at', inputPath);
    process.exit(2);
  }

  // Snapshot JSON
  const snapJson = path.join(destDir, `dev-status-${ts}.json`);
  fs.copyFileSync(inputPath, snapJson);

  // Generate CSV
  const rows = [
    ['kind', 'file', 'line', 'snippet'],
    ...devStatus.findings.map((f) => [f.kind, f.file, String(f.line), String(f.snippet || '').replace(/\n/g, ' ')]),
  ];
  const csv = toCsv(rows);
  const snapCsv = path.join(destDir, `dev-status-${ts}.csv`);
  fs.writeFileSync(snapCsv, csv, 'utf8');

  // Snapshot flags if provided
  let remoteFlags = null;
  if (fs.existsSync(flagsPath)) {
    remoteFlags = readJsonSafe(flagsPath, null);
    const snapFlags = path.join(destDir, `flags-${ts}.json`);
    try {
      fs.copyFileSync(flagsPath, snapFlags);
    } catch {}
  }

  // Merge flags into public/flags.json (union)
  try {
    const localFlagsPath = path.join(repoRoot, 'public', 'flags.json');
    if (remoteFlags && fs.existsSync(localFlagsPath)) {
      const localFlags = readJsonSafe(localFlagsPath, { wipRoutes: [], mockRoutes: [] });
      const u = (a, b) => Array.from(new Set([...(a || []), ...(b || [])]));
      const merged = {
        wipRoutes: u(localFlags.wipRoutes, remoteFlags.wipRoutes),
        mockRoutes: u(localFlags.mockRoutes, remoteFlags.mockRoutes),
      };
      fs.writeFileSync(localFlagsPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
      console.log('Merged flags into public/flags.json');
    }
  } catch (e) {
    console.warn('Flags merge skipped:', e?.message || e);
  }

  // Write backlog markdown
  const md = [];
  md.push('# Dev Status Backlog Snapshot');
  if (remoteUrl) md.push(`Source: ${remoteUrl}`);
  md.push('');
  md.push(`Snapshot: backlog/dev-status/work-time-tracker-five/dev-status-${ts}.json`);
  md.push(`CSV: backlog/dev-status/work-time-tracker-five/dev-status-${ts}.csv`);
  md.push('');
  const kindCounts = devStatus.findings.reduce((acc, f) => ((acc[f.kind] = (acc[f.kind] || 0) + 1), acc), {});
  md.push('## Totals');
  md.push(`- Files scanned: ${devStatus.totals?.filesScanned ?? 'n/a'}`);
  md.push(`- Findings: ${devStatus.findings.length}`);
  for (const k of ['todo', 'mock', 'wip', 'error', 'note']) {
    if (k in kindCounts) md.push(`- ${k.toUpperCase()}: ${kindCounts[k]}`);
  }
  md.push('');
  md.push('## Next steps');
  md.push('- Triage findings by kind and file.');
  md.push('- Convert actionable TODO/WIP into implementation tickets.');
  md.push('- Update public/flags.json for WIP/Mock routes as needed.');
  md.push('');

  fs.writeFileSync(path.join(repoRoot, 'DEV_STATUS_BACKLOG.md'), md.join('\n'), 'utf8');
  console.log('Backlog written to DEV_STATUS_BACKLOG.md');
  console.log('Snapshot JSON:', path.relative(repoRoot, snapJson));
  console.log('Snapshot CSV :', path.relative(repoRoot, snapCsv));
}

main();


