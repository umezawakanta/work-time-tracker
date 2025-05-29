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
        console.log('､・Starting AI Code Review...\n');

        try {
            // 螟画峩縺輔ｌ縺溘ヵ繧｡繧､繝ｫ繧貞叙蠕・
            const changedFiles = await this.getChangedFiles();
            console.log(`Found ${changedFiles.length} changed files`);

            // 繝輔ぃ繧､繝ｫ縺斐→縺ｫ繝ｬ繝薙Η繝ｼ
            const reviews = [];
            for (const file of changedFiles) {
                if (this.shouldReviewFile(file)) {
                    const review = await this.reviewFile(file);
                    reviews.push(review);
                }
            }

            // 繝ｬ繝薙Η繝ｼ邨先棡繧偵∪縺ｨ繧√ｋ
            const summary = await this.generateSummary(reviews);

            // 繝ｬ繝昴・繝医ｒ逕滓・
            const report = this.formatReport(reviews, summary);

            // 繝輔ぃ繧､繝ｫ縺ｫ菫晏ｭ・
            await fs.writeFile('ai-review-report.md', report);

            // Google Drive縺ｫ繧｢繝・・繝ｭ繝ｼ繝・
            if (process.env.UPLOAD_TO_DRIVE === 'true') {
                await this.uploadToDrive(report);
            }

            return report;
        } catch (error) {
            console.error('笶・Code review failed:', error);
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
        console.log(`統 Reviewing ${filename}...`);

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

        // 繧ｵ繝槭Μ繝ｼ
        report += `## Executive Summary\n\n${summary}\n\n`;

        // 邨ｱ險・
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

        // 隧ｳ邏ｰ繝ｬ繝薙Η繝ｼ
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
            'AI蛻・梵繝ｬ繝昴・繝・繧ｳ繝ｼ繝峨Ξ繝薙Η繝ｼ邨先棡'
        );
    }
}

// 繝｡繧､繝ｳ螳溯｡・
if (import.meta.url === `file://${process.argv[1]}`) {
    const reviewer = new AICodeReviewer();
    reviewer.reviewPullRequest().catch(console.error);
}
