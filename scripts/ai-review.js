#!/usr/bin/env node

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs-extra');
const path = require('path');

/**
 * Claude Opus 4を使用したAIコードレビュー
 */
class AICodeReviewer {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });

        this.reviewPrompt = `あなたはエキスパートのコードレビュアーです。以下のコードをレビューして、改善点を指摘してください。

レビューの観点：
1. **コード品質**
   - 可読性と保守性
   - ベストプラクティスの遵守
   - コードの重複や冗長性

2. **パフォーマンス**
   - 非効率なアルゴリズム
   - 不要な再レンダリング（React）
   - メモリリーク

3. **セキュリティ**
   - SQLインジェクション
   - XSS脆弱性
   - 認証・認可の問題

4. **型安全性**（TypeScript）
   - any型の使用
   - 型定義の不足
   - 型の不整合

5. **エラーハンドリング**
   - 例外処理の不足
   - エラーメッセージの適切性

形式：
- 各問題について重要度（🔴高、🟡中、🔵低）を付ける
- 具体的な修正案を提示
- コード例を含める

ファイル: {filename}
言語: {language}

コード:
\`\`\`{language}
{code}
\`\`\``;
    }

    async reviewFile(filePath) {
        try {
            const code = await fs.readFile(filePath, 'utf8');
            const ext = path.extname(filePath);
            const language = this.getLanguageFromExt(ext);
            const filename = path.basename(filePath);

            console.log(`\n📋 レビュー中: ${filePath}`);

            const prompt = this.reviewPrompt
                .replace('{filename}', filename)
                .replace(/{language}/g, language)
                .replace('{code}', code);

            const message = await this.anthropic.messages.create({
                model: 'claude-opus-4-20250514',
                max_tokens: 4096,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            const review = message.content[0].text;

            // レビュー結果の構造化
            const structuredReview = this.structureReview(filePath, review);

            return structuredReview;

        } catch (error) {
            console.error(`❌ レビューエラー (${filePath}):`, error.message);
            return {
                file: filePath,
                error: error.message,
                issues: []
            };
        }
    }

    structureReview(filePath, reviewText) {
        const issues = [];
        const lines = reviewText.split('\n');

        let currentIssue = null;
        let severity = 'info';

        for (const line of lines) {
            // 重要度の判定
            if (line.includes('🔴')) {
                severity = 'error';
            } else if (line.includes('🟡')) {
                severity = 'warning';
            } else if (line.includes('🔵')) {
                severity = 'info';
            }

            // 新しい問題の開始
            if (line.match(/^\d+\.|^-|^•/) && !line.startsWith('```')) {
                if (currentIssue) {
                    issues.push(currentIssue);
                }
                currentIssue = {
                    severity,
                    title: line.replace(/^[\d+\.\-•]\s*/, '').replace(/[🔴🟡🔵]/g, '').trim(),
                    description: '',
                    suggestion: '',
                    codeExample: ''
                };
            } else if (currentIssue) {
                // コード例の抽出
                if (line.startsWith('```')) {
                    let codeBlock = '';
                    let i = lines.indexOf(line) + 1;
                    while (i < lines.length && !lines[i].startsWith('```')) {
                        codeBlock += lines[i] + '\n';
                        i++;
                    }
                    currentIssue.codeExample = codeBlock.trim();
                } else if (line.includes('修正案') || line.includes('改善案')) {
                    currentIssue.suggestion = line;
                } else {
                    currentIssue.description += line + '\n';
                }
            }
        }

        if (currentIssue) {
            issues.push(currentIssue);
        }

        return {
            file: filePath,
            reviewedAt: new Date().toISOString(),
            issues,
            summary: {
                total: issues.length,
                errors: issues.filter(i => i.severity === 'error').length,
                warnings: issues.filter(i => i.severity === 'warning').length,
                info: issues.filter(i => i.severity === 'info').length
            }
        };
    }

    getLanguageFromExt(ext) {
        const langMap = {
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.py': 'python',
            '.java': 'java',
            '.go': 'go',
            '.rs': 'rust',
            '.cpp': 'cpp',
            '.c': 'c'
        };

        return langMap[ext] || 'text';
    }

    async generateMarkdownReport(reviews) {
        let report = '# 🤖 AI コードレビューレポート\n\n';
        report += `**レビュー日時**: ${new Date().toLocaleString('ja-JP')}\n`;
        report += `**レビュー対象**: ${reviews.length}ファイル\n\n`;

        // サマリー
        const totalIssues = reviews.reduce((sum, r) => sum + r.issues.length, 0);
        const totalErrors = reviews.reduce((sum, r) => sum + r.summary.errors, 0);
        const totalWarnings = reviews.reduce((sum, r) => sum + r.summary.warnings, 0);

        report += '## 📊 サマリー\n\n';
        report += `- **総問題数**: ${totalIssues}\n`;
        report += `- 🔴 **エラー**: ${totalErrors}\n`;
        report += `- 🟡 **警告**: ${totalWarnings}\n`;
        report += `- 🔵 **情報**: ${totalIssues - totalErrors - totalWarnings}\n\n`;

        // 各ファイルの詳細
        report += '## 📁 ファイル別レビュー\n\n';

        for (const review of reviews) {
            if (review.error) {
                report += `### ❌ ${review.file}\n`;
                report += `エラー: ${review.error}\n\n`;
                continue;
            }

            report += `### 📄 ${review.file}\n`;
            report += `問題数: ${review.issues.length} `;
            report += `(🔴 ${review.summary.errors} / 🟡 ${review.summary.warnings} / 🔵 ${review.summary.info})\n\n`;

            for (const issue of review.issues) {
                const icon = issue.severity === 'error' ? '🔴' :
                    issue.severity === 'warning' ? '🟡' : '🔵';

                report += `#### ${icon} ${issue.title}\n\n`;

                if (issue.description) {
                    report += `${issue.description.trim()}\n\n`;
                }

                if (issue.suggestion) {
                    report += `**${issue.suggestion}**\n\n`;
                }

                if (issue.codeExample) {
                    report += '```typescript\n';
                    report += issue.codeExample;
                    report += '\n```\n\n';
                }
            }
        }

        // 推奨アクション
        report += '## 🎯 推奨アクション\n\n';

        if (totalErrors > 0) {
            report += '1. **エラーレベルの問題を優先的に修正**\n';
            report += '   - セキュリティ脆弱性\n';
            report += '   - 型エラー\n';
            report += '   - ランタイムエラーの可能性\n\n';
        }

        if (totalWarnings > 0) {
            report += '2. **警告レベルの問題に対処**\n';
            report += '   - パフォーマンスの改善\n';
            report += '   - コード品質の向上\n';
            report += '   - ベストプラクティスの適用\n\n';
        }

        report += '3. **継続的な改善**\n';
        report += '   - テストカバレッジの向上\n';
        report += '   - ドキュメントの充実\n';
        report += '   - リファクタリングの実施\n\n';

        return report;
    }

    async generateGitHubComment(reviews) {
        const totalIssues = reviews.reduce((sum, r) => sum + r.issues.length, 0);
        const totalErrors = reviews.reduce((sum, r) => sum + r.summary.errors, 0);
        const totalWarnings = reviews.reduce((sum, r) => sum + r.summary.warnings, 0);

        let comment = '## 🤖 AI Code Review Results\n\n';

        // 結果のサマリー
        if (totalErrors === 0 && totalWarnings === 0) {
            comment += '✅ **素晴らしい！** 重大な問題は見つかりませんでした。\n\n';
        } else {
            comment += `⚠️ **${totalIssues}個の問題が見つかりました**\n\n`;
            comment += '| 重要度 | 件数 |\n';
            comment += '|--------|------|\n';
            comment += `| 🔴 エラー | ${totalErrors} |\n`;
            comment += `| 🟡 警告 | ${totalWarnings} |\n`;
            comment += `| 🔵 情報 | ${totalIssues - totalErrors - totalWarnings} |\n\n`;
        }

        // 重要な問題のハイライト
        if (totalErrors > 0) {
            comment += '### 🔴 重要な問題\n\n';

            for (const review of reviews) {
                const errors = review.issues.filter(i => i.severity === 'error');
                if (errors.length > 0) {
                    comment += `**${review.file}**\n`;
                    for (const error of errors) {
                        comment += `- ${error.title}\n`;
                    }
                    comment += '\n';
                }
            }
        }

        comment += '\n詳細なレビュー結果は `review-report.md` をご確認ください。';

        return comment;
    }
}

// メイン処理
async function main() {
    const reviewer = new AICodeReviewer();
    const filesToReview = process.argv.slice(2);

    if (filesToReview.length === 0) {
        console.error('❌ レビュー対象のファイルを指定してください');
        process.exit(1);
    }

    const reviews = [];

    for (const file of filesToReview) {
        const review = await reviewer.reviewFile(file);
        reviews.push(review);
    }

    // レポートの生成
    const markdownReport = await reviewer.generateMarkdownReport(reviews);
    await fs.writeFile('review-report.md', markdownReport);

    // GitHub PR用のコメント生成
    const githubComment = await reviewer.generateGitHubComment(reviews);
    console.log('\n' + githubComment);

    // エラーがある場合は非ゼロで終了
    const hasErrors = reviews.some(r => r.summary.errors > 0);
    process.exit(hasErrors ? 1 : 0);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = AICodeReviewer;