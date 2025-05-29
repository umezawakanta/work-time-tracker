// scripts/cleanup-dependencies.js
import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import fs from 'fs/promises';

const execAsync = promisify(exec);

async function cleanupDependencies() {
    console.log(chalk.blue('🧹 Cleaning up dependencies...\n'));

    // 1. 不要な型定義を削除
    await removeUnnecessaryTypes();

    // 2. 脆弱性のあるパッケージをアップデート
    await updateVulnerablePackages();

    // 3. 依存関係の最適化
    await optimizeDependencies();

    console.log(chalk.green('\n✅ Dependencies cleanup completed!'));
}

async function removeUnnecessaryTypes() {
    console.log(chalk.yellow('📝 Removing unnecessary @types packages...'));

    const unnecessaryTypes = [
        '@types/bcryptjs',
        '@types/mongoose',
        '@types/react-chartjs-2',
        '@types/express-rate-limit',
        '@types/react-circular-progressbar',
        '@types/helmet'
    ];

    for (const pkg of unnecessaryTypes) {
        try {
            console.log(`  Removing ${pkg}...`);
            await execAsync(`pnpm remove ${pkg}`);
            console.log(chalk.green(`  ✅ ${pkg} removed`));
        } catch (error) {
            console.log(chalk.gray(`  ⏭️  ${pkg} not found, skipping`));
        }
    }
}

async function updateVulnerablePackages() {
    console.log(chalk.yellow('\n📝 Updating vulnerable packages...'));

    // multerを最新版にアップデート
    try {
        console.log('  Updating multer to v2...');
        await execAsync('pnpm add multer@latest');
        console.log(chalk.green('  ✅ multer updated'));
    } catch (error) {
        console.error(chalk.red('  ❌ Failed to update multer:'), error.message);
    }

    // 脆弱性チェックと自動修正
    try {
        console.log('\n  Running security audit...');
        const { stdout } = await execAsync('pnpm audit --fix');
        console.log(chalk.green('  ✅ Security audit completed'));

        // 深刻な脆弱性がある場合は警告
        if (stdout.includes('high') || stdout.includes('critical')) {
            console.log(chalk.yellow('\n  ⚠️  High or critical vulnerabilities found. Manual review recommended.'));
        }
    } catch (error) {
        console.log(chalk.yellow('  ⚠️  Some vulnerabilities could not be automatically fixed'));
    }
}

async function optimizeDependencies() {
    console.log(chalk.yellow('\n📝 Optimizing dependencies...'));

    // package.jsonを読み込み
    const packageJsonPath = './package.json';
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

    // 推奨される依存関係の整理
    const recommendations = {
        // 本番環境で不要なものをdevDependenciesに移動
        moveToDevDependencies: [
            '@types/node',
            '@types/react',
            '@types/react-dom',
            'eslint',
            'typescript',
            'vite',
            '@vitejs/plugin-react'
        ],

        // アップデートが推奨されるパッケージ
        updateRecommended: {
            'react': '^18.3.1',
            'react-dom': '^18.3.1',
            'next': '^14.2.0',
            'mongodb': '^6.5.0'
        }
    };

    // devDependenciesへの移動提案
    console.log('\n  Checking dependency placement...');
    let movedCount = 0;

    for (const pkg of recommendations.moveToDevDependencies) {
        if (packageJson.dependencies && packageJson.dependencies[pkg]) {
            console.log(chalk.yellow(`  ℹ️  Consider moving ${pkg} to devDependencies`));
            movedCount++;
        }
    }

    if (movedCount === 0) {
        console.log(chalk.green('  ✅ All dependencies are correctly placed'));
    }

    // アップデート推奨
    console.log('\n  Checking for recommended updates...');
    for (const [pkg, recommendedVersion] of Object.entries(recommendations.updateRecommended)) {
        const currentVersion = packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg];
        if (currentVersion && currentVersion !== recommendedVersion) {
            console.log(chalk.yellow(`  ℹ️  Consider updating ${pkg} from ${currentVersion} to ${recommendedVersion}`));
        }
    }

    // 未使用の依存関係をチェック
    console.log('\n  Checking for unused dependencies...');
    try {
        // depcheckを使用して未使用の依存関係を検出（インストールされている場合）
        await execAsync('npx depcheck --json');
        console.log(chalk.green('  ✅ Dependency check completed'));
    } catch (error) {
        console.log(chalk.gray('  ⏭️  Skipping unused dependency check (depcheck not available)'));
    }
}

// メイン実行
cleanupDependencies().catch(console.error);