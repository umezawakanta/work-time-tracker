import fs from 'fs';
import path from 'path';

function readJSON(p) {
    try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function writeJSON(p, data) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

const repoRoot = process.cwd();
const pkg = readJSON(path.join(repoRoot, 'package.json')) || {};

let commit = '';
try {
    const { execSync } = await import('child_process');
    commit = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim();
} catch { }

const versionInfo = {
    version: pkg.version || '0.0.1',
    commit,
    builtAt: new Date().toISOString(),
};
writeJSON(path.join(repoRoot, 'public', 'version.json'), versionInfo);

let changelog = '';
try { changelog = fs.readFileSync(path.join(repoRoot, 'CHANGELOG.md'), 'utf8'); } catch { }

function parseChangelog(md) {
    if (!md) return [];
    const lines = md.split(/\r?\n/);
    const entries = [];
    let current = null;
    for (const line of lines) {
        const m = /^##\s+\[?v?(\d+\.\d+\.\d+)\]?/.exec(line);
        if (m) {
            if (current) entries.push(current);
            current = { version: m[1], notes: [] };
            continue;
        }
        if (current) current.notes.push(line);
    }
    if (current) entries.push(current);
    return entries.map((e) => ({ version: e.version, notes: e.notes.join('\n').trim() })).slice(0, 20);
}

const changelogEntries = parseChangelog(changelog);
writeJSON(path.join(repoRoot, 'public', 'changelog.json'), { entries: changelogEntries });

console.log('[version] Generated public/version.json and public/changelog.json');


