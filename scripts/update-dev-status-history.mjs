#!/usr/bin/env node
// Update public/dev-status-history.json with the latest counts for the current commit.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const publicDir = path.join(repoRoot, 'public');
const historyPath = path.join(publicDir, 'dev-status-history.json');
const statusPath = path.join(publicDir, 'dev-status.json');

function run(cmd) {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
}

function readJsonSafe(p, fallback) {
    try {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch {
        return fallback;
    }
}

function main() {
    // Ensure latest dev-status.json exists
    try {
        run('node scripts/dev-status-scan.mjs');
    } catch (e) {
        // best-effort; continue if present
    }

    const current = readJsonSafe(statusPath, null);
    if (!current || !current.totals) {
        console.error('dev-status not found at', statusPath);
        process.exit(2);
    }

    const commitSha = run('git rev-parse HEAD');
    const commitShort = run('git rev-parse --short HEAD');
    const commitTimeSec = Number(run('git show -s --format=%ct HEAD'));
    const commitMessage = run('git show -s --format=%s HEAD');

    // Optional coverage summary
    const coveragePath = path.join(publicDir, 'coverage-summary.json');
    const cov = readJsonSafe(coveragePath, null);
    const e2ePath = path.join(publicDir, 'e2e-summary.json');
    const e2e = readJsonSafe(e2ePath, null);

    const entry = {
        sha: commitSha,
        short: commitShort,
        message: commitMessage,
        timestamp: new Date(commitTimeSec * 1000).toISOString(),
        totals: {
            findings: Number(current.totals.findings || (current.findings ? current.findings.length : 0) || 0),
            todo: Number(current.totals.todo || 0),
            mock: Number(current.totals.mock || 0),
            wip: Number(current.totals.wip || 0),
            error: Number(current.totals.errorHints || 0),
        },
        tests: (cov && cov.total) || e2e ? {
            coverage: cov && cov.total ? {
                lines: Number(cov.total?.lines?.pct ?? 0),
                statements: Number(cov.total?.statements?.pct ?? 0),
                functions: Number(cov.total?.functions?.pct ?? 0),
                branches: Number(cov.total?.branches?.pct ?? 0),
            } : undefined,
            e2e: e2e ? {
                passPct: Number(e2e.passPct ?? 0),
                passes: Number(e2e.passes ?? 0),
                failures: Number(e2e.failures ?? 0),
                total: Number(e2e.total ?? 0),
            } : undefined,
        } : undefined,
    };

    const history = readJsonSafe(historyPath, []);
    const exists = history.some((h) => h.sha === entry.sha);
    const next = exists ? history.map((h) => (h.sha === entry.sha ? entry : h)) : [...history, entry];
    next.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(historyPath, JSON.stringify(next, null, 2) + '\n', 'utf8');
    console.log('Updated', path.relative(repoRoot, historyPath), 'entries=', next.length);
}

main();


