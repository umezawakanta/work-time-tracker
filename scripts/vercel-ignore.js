// Skip Vercel build if only docs/tests changed
const { execSync } = require('node:child_process');

try {
    const base = process.env.VERCEL_GIT_PREVIOUS_SHA || 'HEAD~1';
    const head = process.env.VERCEL_GIT_COMMIT_SHA || 'HEAD';
    // Validate SHAs exist in shallow clones; fallback to HEAD if invalid
    const safeRef = (ref) => {
        try {
            execSync(`git cat-file -e ${ref}^{commit}`, { stdio: 'ignore' });
            return ref;
        } catch {
            return 'HEAD';
        }
    };
    const b = safeRef(base);
    const h = safeRef(head);
    const diff = execSync(`git diff --name-only ${b} ${h}`, { encoding: 'utf8' })
        .split('\n')
        .filter(Boolean);

    // 強制ビルド対象（API/サーバ/設定変更）は常にビルド
    const forceBuild = diff.some((f) =>
        [
            'api/',
            'src/server/',
            'vercel.json',
        ].some((p) => f.startsWith(p) || f === p)
    );

    const onlyTrivial = !forceBuild && diff.every((f) =>
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


