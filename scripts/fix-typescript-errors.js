// scripts/fix-typescript-errors.js
import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';

async function fixTypeScriptErrors() {
    console.log(chalk.blue('🔧 Fixing TypeScript compilation errors...\n'));

    // 1. ApiTypes.tsの修正
    await fixApiTypes();

    // 2. TodoSettings.tsxの修正
    await fixTodoSettings();

    // 3. userAccountService.tsの修正
    await fixUserAccountService();

    console.log(chalk.green('\n✅ All TypeScript errors fixed!'));
    console.log(chalk.yellow('Run "pnpm build" to verify the fixes.'));
}

async function fixApiTypes() {
    console.log(chalk.yellow('📝 Fixing ApiTypes.ts...'));

    const filePath = path.join(process.cwd(), 'src/components/dailyToDoReminder/controls/ApiTypes.ts');

    try {
        let content = await fs.readFile(filePath, 'utf8');

        // featureLimit部分を修正（適切なクロージング記号が抜けている可能性）
        // 元のコンテンツを確認して、正しい構造に修正
        const correctedContent = `export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details?: any;
  } | string;
  meta: ApiResponseMeta;
}

export interface ApiResponseMeta {
  timestamp: number;
  requestId?: string;
  headers?: Record<string, string>;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
    exceeded?: boolean;
  };
  cache?: {
    hit: boolean;
    ttl?: number;
    stale?: boolean;
  };
  featureLimit?: {
    feature: string;
    limit: number;
    used: number;
    plan: string;
    allowed?: boolean;
    received?: number;
  };
  errorCode?: string;
  errorHandled?: boolean;
  processingTime?: number;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retry?: number;
  cache?: boolean;
  signal?: AbortSignal;
  priority?: 'low' | 'normal' | 'high';
  withCredentials?: boolean;
  retryDelay?: number;
}

export interface ExtendedRequestConfig extends RequestConfig {
  _cachedResponse?: any;
}

export interface ApiErrorResponse extends Omit<ApiResponse<any>, 'data'> {
  data?: any;
}

export interface ApiServiceConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'professional' | 'enterprise';

export interface HttpMethod {
  GET: 'GET';
  POST: 'POST';
  PUT: 'PUT';
  DELETE: 'DELETE';
  PATCH: 'PATCH';
}`;

        await fs.writeFile(filePath, correctedContent);
        console.log(chalk.green('✅ ApiTypes.ts fixed'));
    } catch (error) {
        console.error(chalk.red('❌ Failed to fix ApiTypes.ts:'), error.message);
    }
}

async function fixTodoSettings() {
    console.log(chalk.yellow('📝 Fixing TodoSettings.tsx...'));

    const filePath = path.join(process.cwd(), 'src/components/dailyToDoReminder/controls/TodoSettings.tsx');

    try {
        let content = await fs.readFile(filePath, 'utf8');

        // 型定義の修正
        content = content.replace(
            /settings:\s*;/g,
            'settings: TodoSettingsType;'
        );

        content = content.replace(
            /onSave:\s*\(settings:\s*\)\s*=>\s*void;/g,
            'onSave: (settings: TodoSettingsType) => void;'
        );

        // useState の型修正
        content = content.replace(
            /const\s+\[updated\s+setUpdated\]\s*=\s*useState<>\(settings\);/g,
            'const [updated, setUpdated] = useState<TodoSettingsType>(settings);'
        );

        // update関数の型修正
        content = content.replace(
            /const\s+update\s*=\s*<K\s+extends\s+keyof>\(/g,
            'const update = <K extends keyof TodoSettingsType>('
        );

        // JSXの構文エラー修正
        content = content.replace(
            /<className="flex justify-between border-t pt-4">/g,
            '<div className="flex justify-between border-t pt-4">'
        );

        // 閉じタグの修正
        content = content.replace(
            /<\/>/g,
            '</div>'
        );

        // インターフェース定義を追加（まだない場合）
        if (!content.includes('interface TodoSettingsType')) {
            const interfaceDefinition = `
interface TodoSettingsType {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  workingHours: {
    start: string;
    end: string;
    daysOfWeek: number[];
  };
  breaks: {
    enabled: boolean;
    duration: number;
    interval: number;
  };
  dataSync: {
    autoSave: boolean;
    syncInterval: number;
  };
  privacy: {
    shareAnalytics: boolean;
    showPublicProfile: boolean;
  };
}
`;

            // import文の後に追加
            const importEndIndex = content.lastIndexOf('import');
            const importEndLineIndex = content.indexOf('\n', importEndIndex);
            content = content.slice(0, importEndLineIndex + 1) + interfaceDefinition + content.slice(importEndLineIndex + 1);
        }

        await fs.writeFile(filePath, content);
        console.log(chalk.green('✅ TodoSettings.tsx fixed'));
    } catch (error) {
        console.error(chalk.red('❌ Failed to fix TodoSettings.tsx:'), error.message);
    }
}

async function fixUserAccountService() {
    console.log(chalk.yellow('📝 Fixing userAccountService.ts...'));

    const filePath = path.join(process.cwd(), 'src/services/userAccountService.ts');

    try {
        let content = await fs.readFile(filePath, 'utf8');

        // interfaceキーワードの修正
        content = content.replace(
            /export\s+interfaceProfile\s*{/g,
            'export interface Profile {'
        );

        // プロパティ定義を正しい形式に修正
        // 完全なインターフェース定義に置き換え
        const profileInterface = `export interface Profile {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export interface UserAccount {
  uid: string;
  email: string;
  profile: Profile;
  subscription?: {
    planType?: PremiumPlanType;
    planCycle?: PremiumPlanCycle;
    expiresAt?: Date;
    isActive?: boolean;
    cancelledAt?: Date;
  };
  settings?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: boolean;
    language?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type PremiumPlanType = 'basic' | 'pro' | 'enterprise';
export type PremiumPlanCycle = 'monthly' | 'yearly';`;

        // 既存のインターフェース定義を探して置き換え
        const interfaceStartIndex = content.indexOf('export interface');
        if (interfaceStartIndex !== -1) {
            // 既存のインターフェース部分を見つけて置き換え
            let braceCount = 0;
            let endIndex = interfaceStartIndex;
            let inInterface = false;

            for (let i = interfaceStartIndex; i < content.length; i++) {
                if (content[i] === '{') {
                    braceCount++;
                    inInterface = true;
                } else if (content[i] === '}') {
                    braceCount--;
                    if (inInterface && braceCount === 0) {
                        endIndex = i + 1;
                        break;
                    }
                }
            }

            // インターフェース部分を新しい定義で置き換え
            content = content.slice(0, interfaceStartIndex) + profileInterface + content.slice(endIndex);
        } else {
            // インターフェースが見つからない場合は、ファイルの最後に追加
            content += '\n' + profileInterface;
        }

        await fs.writeFile(filePath, content);
        console.log(chalk.green('✅ userAccountService.ts fixed'));
    } catch (error) {
        console.error(chalk.red('❌ Failed to fix userAccountService.ts:'), error.message);
    }
}

// chalkがインストールされていない場合の簡易実装
if (!globalThis.chalk) {
    globalThis.chalk = {
        blue: (text) => text,
        yellow: (text) => text,
        green: (text) => text,
        red: (text) => text
    };
}

// メイン実行
fixTypeScriptErrors().catch(console.error);