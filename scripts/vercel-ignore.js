// Skip Vercel build if only docs/tests changed
const { execSync } = require('node:child_process');

try {
    const base = process.env.VERCEL_GIT_PREVIOUS_SHA || 'HEAD~1';
    const head = process.env.VERCEL_GIT_COMMIT_SHA || 'HEAD';
    const diff = execSync(`git diff --name-only ${base} ${head}`, { encoding: 'utf8' })
        .split('\n')
        .filter(Boolean);

    const onlyTrivial = diff.every((f) =>
        [
            'docs/',
            'coverage/',
            'cypress/',
            'uploads/',
            'README',
            'ULTIMATE_',
            'FINAL_',
            '.md',
            '.spec.',
            '.test.',
        ].some((p) => f.startsWith(p) || f.includes(p))
    );

    if (onlyTrivial) {
        console.log('🔕 Skipping build: docs/tests/uploads-only changes');
        process.exit(0);
    }
    process.exit(1);
} catch (e) {
    // If git not available, do not skip
    process.exit(1);
}


