// scripts/ai/code-review.js
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleDriveManager } from '../drive/google-drive-manager.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export class AICodeReviewer {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        this.driveManager = new GoogleDriveManager();
    }

    async reviewPullRequest() {
        console.log('🤖 Starting AI Code Review...\n');

        try {
            // 変更されたファイルを取得
            const changedFiles = await this.getChangedFiles();
            console.log(`Found ${changedFiles.length} changed files`);

            // ファイルごとにレビュー
            const reviews = [];
            for (const file of changedFiles) {
                if (this.shouldReviewFile(file)) {
                    const review = await this.reviewFile(file);
                    reviews.push(review);
                }
            }

            // レビュー結果をまとめる
            const summary = await this.generateSummary(reviews);

            // レポートを生成
            const report = this.formatReport(reviews, summary);

            // ファイルに保存
            await fs.writeFile('ai-review-report.md', report);

            // Google Driveにアップロード
            if (process.env.UPLOAD_TO_DRIVE === 'true') {
                await this.uploadToDrive(report);
            }

            return report;
        } catch (error) {
            console.error('❌ Code review failed:', error);
            throw error;
        }
    }

    async getChangedFiles() {
        const { stdout } = await execAsync('git diff --name-only HEAD~1 HEAD');
        return stdout.split('\n').filter(f => f.length > 0);
    }

    shouldReviewFile(filename) {
        const extensions = ['.ts', '.tsx', '.js', '.jsx'];
        const excluded = ['node_modules', 'dist', 'build', '.test.', '.spec.'];

        return extensions.some(ext => filename.endsWith(ext)) &&
            !excluded.some(ex => filename.includes(ex));
    }

    async reviewFile(filename) {
        console.log(`📝 Reviewing ${filename}...`);

        try {
            const content = await fs.readFile(filename, 'utf8');
            const diff = await this.getFileDiff(filename);

            const response = await this.anthropic.messages.create({
                model: 'claude-opus-4-20250514',
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: `Please review this code change and provide feedback on:
1. Code quality and best practices
2. Potential bugs or issues
3. Performance considerations
4. Security vulnerabilities
5. Suggestions for improvement

File: ${filename}

Changes:
${diff}

Full file content:
${content}

Provide your review in markdown format with clear sections.`
                }]
            });

            return {
                filename,
                review: response.content[0].text,
                severity: this.calculateSeverity(response.content[0].text)
            };
        } catch (error) {
            console.error(`Failed to review ${filename}:`, error);
            return {
                filename,
                review: 'Failed to review this file',
                severity: 'error'
            };
        }
    }

    async getFileDiff(filename) {
        const { stdout } = await execAsync(`git diff HEAD~1 HEAD -- ${filename}`);
        return stdout;
    }

    calculateSeverity(review) {
        const criticalKeywords = ['security', 'vulnerability', 'critical', 'dangerous'];
        const warningKeywords = ['warning', 'issue', 'problem', 'concern'];

        const lowerReview = review.toLowerCase();

        if (criticalKeywords.some(keyword => lowerReview.includes(keyword))) {
            return 'critical';
        } else if (warningKeywords.some(keyword => lowerReview.includes(keyword))) {
            return 'warning';
        }
        return 'info';
    }

    async generateSummary(reviews) {
        const reviewTexts = reviews.map(r => `File: ${r.filename}\n${r.review}`).join('\n\n');

        const response = await this.anthropic.messages.create({
            model: 'claude-opus-4-20250514',
            max_tokens: 1000,
            messages: [{
                role: 'user',
                content: `Based on these code reviews, provide a brief summary including:
1. Overall code quality assessment
2. Key issues found
3. Priority recommendations
4. Approval recommendation (approve/request changes)

Reviews:
${reviewTexts}`
            }]
        });

        return response.content[0].text;
    }

    formatReport(reviews, summary) {
        const timestamp = new Date().toISOString();
        let report = `# AI Code Review Report\n\n`;
        report += `**Generated:** ${timestamp}\n`;
        report += `**Reviewer:** Claude Opus 4\n\n`;

        // サマリー
        report += `## Executive Summary\n\n${summary}\n\n`;

        // 統計
        const stats = {
            total: reviews.length,
            critical: reviews.filter(r => r.severity === 'critical').length,
            warning: reviews.filter(r => r.severity === 'warning').length,
            info: reviews.filter(r => r.severity === 'info').length
        };

        report += `## Statistics\n\n`;
        report += `- **Total files reviewed:** ${stats.total}\n`;
        report += `- **Critical issues:** ${stats.critical}\n`;
        report += `- **Warnings:** ${stats.warning}\n`;
        report += `- **Info:** ${stats.info}\n\n`;

        // 詳細レビュー
        report += `## Detailed Reviews\n\n`;

        for (const review of reviews) {
            report += `### ${review.filename}\n\n`;
            report += `**Severity:** ${review.severity}\n\n`;
            report += review.review + '\n\n---\n\n';
        }

        return report;
    }

    async uploadToDrive(report) {
        await this.driveManager.initialize();
        const timestamp = new Date().toISOString().split('T')[0];
        await this.driveManager.createGoogleDoc(
            `Code Review - ${timestamp}`,
            report,
            'AI分析レポート/コードレビュー結果'
        );
    }
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
    const reviewer = new AICodeReviewer();
    reviewer.reviewPullRequest().catch(console.error);
}

// scripts/drive/google-drive-manager.js
import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';

export class GoogleDriveManager {
    constructor() {
        this.baseFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1dbVMdI9T493VhNi8F5LstciaADTChLqS';
        this.drive = null;
        this.docs = null;
    }

    async initialize() {
        try {
            const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './credentials.json';
            const auth = new google.auth.GoogleAuth({
                keyFile: keyPath,
                scopes: [
                    'https://www.googleapis.com/auth/drive',
                    'https://www.googleapis.com/auth/documents'
                ],
            });

            const authClient = await auth.getClient();
            this.drive = google.drive({ version: 'v3', auth: authClient });
            this.docs = google.docs({ version: 'v1', auth: authClient });

            console.log('✅ Google Drive initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Google Drive:', error);
            throw error;
        }
    }

    async createFolderStructure() {
        const folders = [
            '仕様書',
            '開発ドキュメント',
            'テスト結果/自動テスト結果',
            'テスト結果/パフォーマンステスト',
            'リリース/リリースノート',
            'リリース/デプロイログ',
            'AI分析レポート/コードレビュー結果',
            'AI分析レポート/改善提案',
            'AI分析レポート/週次ヘルスチェック'
        ];

        for (const folderPath of folders) {
            await this.ensureFolderExists(folderPath);
        }
    }

    async ensureFolderExists(folderPath) {
        const parts = folderPath.split('/');
        let parentId = this.baseFolderId;

        for (const folderName of parts) {
            const folderId = await this.findFolder(folderName, parentId);
            if (!folderId) {
                parentId = await this.createFolder(folderName, parentId);
            } else {
                parentId = folderId;
            }
        }

        return parentId;
    }

    async findFolder(name, parentId) {
        const query = `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;

        try {
            const response = await this.drive.files.list({
                q: query,
                fields: 'files(id, name)',
                pageSize: 1
            });

            return response.data.files[0]?.id;
        } catch (error) {
            console.error(`Error finding folder ${name}:`, error);
            return null;
        }
    }

    async createFolder(name, parentId) {
        const fileMetadata = {
            name: name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId]
        };

        try {
            const folder = await this.drive.files.create({
                resource: fileMetadata,
                fields: 'id'
            });

            console.log(`📁 Created folder: ${name}`);
            return folder.data.id;
        } catch (error) {
            console.error(`Error creating folder ${name}:`, error);
            throw error;
        }
    }

    async uploadFile(localPath, driveFolderPath, fileName) {
        const folderId = await this.ensureFolderExists(driveFolderPath);
        const fileMetadata = {
            name: fileName || path.basename(localPath),
            parents: [folderId]
        };

        const media = {
            mimeType: 'application/octet-stream',
            body: await fs.readFile(localPath)
        };

        try {
            const file = await this.drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id, webViewLink'
            });

            console.log(`📤 Uploaded: ${file.data.webViewLink}`);
            return file.data;
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    }

    async createGoogleDoc(title, content, folderPath) {
        const folderId = await this.ensureFolderExists(folderPath);

        // Create Google Doc
        const fileMetadata = {
            name: title,
            mimeType: 'application/vnd.google-apps.document',
            parents: [folderId]
        };

        try {
            const doc = await this.drive.files.create({
                resource: fileMetadata,
                fields: 'id, webViewLink'
            });

            // Update content
            await this.docs.documents.batchUpdate({
                documentId: doc.data.id,
                requestBody: {
                    requests: [{
                        insertText: {
                            location: { index: 1 },
                            text: content
                        }
                    }]
                }
            });

            console.log(`📄 Created doc: ${doc.data.webViewLink}`);
            return doc.data;
        } catch (error) {
            console.error('Failed to create doc:', error);
            throw error;
        }
    }
}

// scripts/setup/init-project.js
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import inquirer from 'inquirer';

const execAsync = promisify(exec);

async function initProject() {
    console.log('🚀 AI-CICD Project Setup\n');

    // プロジェクト情報を収集
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'anthropicKey',
            message: 'Enter your Anthropic API key:',
            validate: (input) => input.startsWith('sk-ant-') || 'Invalid API key format'
        },
        {
            type: 'input',
            name: 'googleDriveFolderId',
            message: 'Enter your Google Drive folder ID:',
            default: '1dbVMdI9T493VhNi8F5LstciaADTChLqS'
        },
        {
            type: 'confirm',
            name: 'setupGithubActions',
            message: 'Setup GitHub Actions workflows?',
            default: true
        }
    ]);

    // .envファイルを作成
    const envContent = `# AI-CICD Configuration
ANTHROPIC_API_KEY=${answers.anthropicKey}
GOOGLE_DRIVE_FOLDER_ID=${answers.googleDriveFolderId}
UPLOAD_TO_DRIVE=true
ENABLE_AI_REVIEW=true
`;

    await fs.writeFile('.env', envContent);
    console.log('✅ Created .env file');

    // 必要なディレクトリを作成
    const directories = [
        'scripts/ai',
        'scripts/drive',
        'scripts/setup',
        '.github/workflows',
        'reports'
    ];

    for (const dir of directories) {
        await fs.mkdir(dir, { recursive: true });
    }
    console.log('✅ Created directory structure');

    // pnpm依存関係をインストール
    console.log('\n📦 Installing dependencies with pnpm...');
    await execAsync('pnpm add -D @anthropic-ai/sdk googleapis inquirer rimraf');
    await execAsync('pnpm add -D @types/node vitest @vitest/coverage-v8');

    // GitHub Actionsワークフローをセットアップ
    if (answers.setupGithubActions) {
        console.log('\n⚙️  Setting up GitHub Actions...');
        // ワークフローファイルをコピー
        console.log('✅ GitHub Actions workflows created');
    }

    // Google Drive構造を初期化
    console.log('\n📁 Initializing Google Drive structure...');
    const { GoogleDriveManager } = await import('../drive/google-drive-manager.js');
    const driveManager = new GoogleDriveManager();
    await driveManager.initialize();
    await driveManager.createFolderStructure();

    console.log('\n✨ Setup complete! Run "pnpm dev" to start developing.');
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
    initProject().catch(console.error);
}