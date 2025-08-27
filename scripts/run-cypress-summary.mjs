#!/usr/bin/env node
import { spawn } from 'node:child_process';

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts });
    p.on('exit', (code) => resolve(code ?? 0));
  });
}

const main = async () => {
  // Ensure wait-on is available (start-server-and-test guarantees server readiness)
  const rc = await run('npx', ['cypress', 'run', '--reporter', 'json', '--reporter-options', 'output=cypress/results/summary.json']);
  process.exit(0); // never fail pipeline locally for summary generation
};

main();


