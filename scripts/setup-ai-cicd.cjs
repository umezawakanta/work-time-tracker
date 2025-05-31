#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * AI-CICD環境の初期セットアップスクリプト
 */
class AICICDSetup {
  constructor() {
    this.requiredDirs = [
      'scripts',
      '.github/workflows',
      'docs/specifications',
      'docs/design',
      'docs/test-cases',
      'docs/ci-cd-reports'
    ];

    this.configFiles = {
      '.env.example': `# AI-CICD Configuration
ANTHROPIC_API_KEY=your-claude-opus-4-api-key
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Optional: Enable AI review in pre-commit
ENABLE_AI_REVIEW=false

# Development
NODE_ENV=development
`,

      '.cursorrules': `# Work Time Tracker AI開発ガイドライン

## プロジェクト概要
React + TypeScript + Viteを使用した勤怠管理アプリケーション

## コーディング規約

### TypeScript
- strictモードを有効化
- 型推論に頼らず明示的な型定義
- anyの使用禁止
- インターフェースを優先（typeは必要な場合のみ）

### React
- 関数コンポーネントを使用
- カスタムフックでロジックを分離
- メモ化は必要な場合のみ
- エラーバウンダリーの実装

### スタイリング
- Tailwind CSS使用
- レスポンシブデザイン必須
- アクセシビリティ準拠（WCAG 2.1 AA）

## AIアシスタントへの指示

### コードレビュー時
1. パフォーマンスの問題を指摘
2. 型安全性の改善提案
3. React best practicesの遵守確認
4. セキュリティリスクの検出

### 実装支援時
1. テストファーストアプローチ
2. エッジケースの考慮
3. エラーハンドリングの実装
4. ドキュメントの同時更新

### リファクタリング時
1. 単一責任の原則
2. DRY原則の適用
3. 可読性の向上
4. パフォーマンスの最適化
`,

      '.prettierrc': JSON.stringify({
        "semi": true,
        "trailingComma": "es5",
        "singleQuote": true,
        "printWidth": 80,
        "tabWidth": 2,
        "useTabs": false,
        "arrowParens": "avoid",
        "endOfLine": "auto"
      }, null, 2),

      '.prettierignore': `node_modules
dist
build
coverage
.next
.cache
public
*.min.js
*.min.css
`,

      'jest.config.js': `export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
`,

      'src/test/setup.ts': `import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
`
    };
  }

  async run() {
    console.log('🚀 AI-CICD環境のセットアップを開始します...\n');

    try {
      // 1. ディレクトリ構造の作成
      await this.createDirectories();

      // 2. 設定ファイルの作成
      await this.createConfigFiles();

      // 3. スクリプトファイルの配置
      await this.createScripts();

      // 4. GitHub Actionsワークフローの作成
      await this.createGitHubActions();

      // 5. Huskyの設定
      await this.setupHusky();

      // 6. 初回のTypeScript修正実行
      await this.runInitialFixes();

      console.log('\n✅ AI-CICDセットアップが完了しました！');
      console.log('\n📋 次のステップ:');
      console.log('1. .env.exampleを.envにコピーして、APIキーを設定');
      console.log('2. Google Cloud サービスアカウントを作成');
      console.log('3. GitHub Secretsを設定');
      console.log('4. pnpm run ai:fix-errors でTypeScriptエラーを修正');

    } catch (error) {
      console.error('❌ セットアップ中にエラーが発生しました:', error);
      process.exit(1);
    }
  }

  async createDirectories() {
    console.log('📁 ディレクトリ構造を作成中...');

    for (const dir of this.requiredDirs) {
      await fs.ensureDir(dir);
      console.log(`  ✓ ${dir}`);
    }
  }

  async createConfigFiles() {
    console.log('\n⚙️  設定ファイルを作成中...');

    for (const [filename, content] of Object.entries(this.configFiles)) {
      const exists = await fs.pathExists(filename);
      if (!exists) {
        // ディレクトリが存在しない場合は作成
        const dir = path.dirname(filename);
        await fs.ensureDir(dir);

        await fs.writeFile(filename, content);
        console.log(`  ✓ ${filename}`);
      } else {
        console.log(`  ⏭️  ${filename} (既存)`);
      }
    }
  }

  async createScripts() {
    console.log('\n📝 スクリプトファイルを作成中...');

    // ここに前回作成したスクリプトの内容を配置
    const scripts = {
      'scripts/fix-typescript-errors.js': await this.getTypeScriptFixerScript(),
      'scripts/ai-review.js': await this.getAIReviewScript(),
      'scripts/upload-to-drive.js': await this.getUploadToDriveScript(),
      'scripts/sync-docs-to-drive.js': await this.getSyncDocsScript(),
    };

    for (const [filename, content] of Object.entries(scripts)) {
      await fs.writeFile(filename, content);
      await fs.chmod(filename, '755'); // 実行権限を付与
      console.log(`  ✓ ${filename}`);
    }
  }

  async createGitHubActions() {
    console.log('\n🔧 GitHub Actionsワークフローを作成中...');

    const workflowPath = '.github/workflows/ai-cicd.yml';
    const workflowContent = await this.getGitHubActionsWorkflow();

    await fs.writeFile(workflowPath, workflowContent);
    console.log(`  ✓ ${workflowPath}`);
  }

  async setupHusky() {
    console.log('\n🐶 Huskyをセットアップ中...');

    try {
      // Huskyのインストール
      await execPromise('npx husky install');

      // pre-commitフックの追加
      await execPromise('npx husky add .husky/pre-commit "npm run pre-commit"');

      // pre-pushフックの追加
      await execPromise('npx husky add .husky/pre-push "npm run type-check && npm run test:unit"');

      console.log('  ✓ Huskyのセットアップが完了しました');
    } catch (error) {
      console.log('  ⚠️  Huskyのセットアップをスキップ（手動で実行してください）');
    }
  }

  async runInitialFixes() {
    console.log('\n🔨 初回のTypeScript修正を実行中...');

    // 型定義ファイルの作成
    const typeFiles = {
      'src/types/user.ts': `export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}`,
      'src/components/ui/badge.tsx': `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }`,
      'src/lib/utils.ts': `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`
    };

    for (const [filePath, content] of Object.entries(typeFiles)) {
      const dir = path.dirname(filePath);
      await fs.ensureDir(dir);
      await fs.writeFile(filePath, content);
      console.log(`  ✓ ${filePath}`);
    }
  }

  // スクリプトの内容を返すメソッド（長いので簡略化）
  async getTypeScriptFixerScript() {
    return `#!/usr/bin/env node
// TypeScript Error Fixer Script
console.log('TypeScript Error Fixer - Placeholder');
// 実際のスクリプト内容は前回の回答を参照
`;
  }

  async getAIReviewScript() {
    return `#!/usr/bin/env node
// AI Code Review Script
console.log('AI Code Review - Placeholder');
// 実際のスクリプト内容は前回の回答を参照
`;
  }

  async getUploadToDriveScript() {
    return `#!/usr/bin/env node
const { google } = require('googleapis');
const fs = require('fs-extra');
const path = require('path');

async function uploadToDrive() {
  console.log('Uploading to Google Drive...');
  // TODO: Implement Google Drive upload
}

if (require.main === module) {
  uploadToDrive().catch(console.error);
}
`;
  }

  async getSyncDocsScript() {
    return `#!/usr/bin/env node
const { google } = require('googleapis');
const fs = require('fs-extra');
const path = require('path');

async function syncDocs() {
  console.log('Syncing docs to Google Drive...');
  // TODO: Implement docs sync
}

if (require.main === module) {
  syncDocs().catch(console.error);
}
`;
  }

  async getGitHubActionsWorkflow() {
    return `name: AI-Enhanced CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 9 * * 1' # 毎週月曜日9時

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:unit
`;
  }
}

// メイン実行
if (require.main === module) {
  const setup = new AICICDSetup();
  setup.run();
}

module.exports = AICICDSetup;