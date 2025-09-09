#!/usr/bin/env node

/**
 * PR準備スクリプト
 * コミット差分からPRテンプレートを自動生成
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const PR_TEMPLATE = `## 概要
- 目的: <自動生成>
- 関連Issue: #<issue番号>

## 変更点
- [ ] UI/UX
- [ ] API/DB
- [ ] テレメトリ/ログ

## 動作確認
- [ ] ユニット OK
- [ ] E2E OK
- [ ] iPhone SE 表示 OK
- プレビュー: <自動URL>

## リスク & ロールバック
- リスク: <自動生成>
- ロールバック手順: <自動生成>

## スクショ
(任意)
`;

function getChangedFiles() {
    try {
        const output = execSync('git diff --name-only HEAD~1', { encoding: 'utf8' });
        return output.trim().split('\n').filter(Boolean);
    } catch (error) {
        console.log('No previous commit found, using staged files');
        const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
        return output.trim().split('\n').filter(Boolean);
    }
}

function analyzeChanges(files) {
    const changes = {
        ui: files.some(f => f.includes('components/') || f.includes('pages/')),
        api: files.some(f => f.includes('api/') || f.includes('hooks/')),
        config: files.some(f => f.includes('config/') || f.includes('.json')),
        tests: files.some(f => f.includes('test/') || f.includes('.test.')),
    };

    return changes;
}

function generatePurpose(files, changes) {
    if (files.some(f => f.includes('guard/'))) {
        return 'Impulse Control機能の実装';
    }
    if (changes.ui) {
        return 'UI/UX改善';
    }
    if (changes.api) {
        return 'API/バックエンド機能追加';
    }
    if (changes.tests) {
        return 'テスト追加・改善';
    }
    return 'コード改善・リファクタリング';
}

function generateRisks(files, changes) {
    const risks = [];

    if (changes.ui) {
        risks.push('モバイル表示の崩れ');
    }
    if (changes.api) {
        risks.push('APIレスポンスの変更');
    }
    if (files.some(f => f.includes('main.tsx') || f.includes('App.tsx'))) {
        risks.push('アプリ全体への影響');
    }
    if (files.some(f => f.includes('guard/'))) {
        risks.push('Route Guardの誤動作');
    }

    return risks.length > 0 ? risks.join(', ') : '特に大きなリスクなし';
}

function main() {
    const files = getChangedFiles();
    const changes = analyzeChanges(files);
    const purpose = generatePurpose(files, changes);
    const risks = generateRisks(files, changes);

    const prContent = PR_TEMPLATE
        .replace('<自動生成>', purpose)
        .replace('<自動生成>', risks)
        .replace('<自動生成>', 'git revert <commit-hash> または前のデプロイに戻す');

    const outputPath = join(process.cwd(), 'PR_DRAFT.md');
    writeFileSync(outputPath, prContent);

    console.log('✅ PR draft generated:', outputPath);
    console.log('📝 Changed files:', files.length);
    console.log('🔍 Changes detected:', Object.entries(changes)
        .filter(([_, v]) => v)
        .map(([k, _]) => k)
        .join(', '));
}

main();
