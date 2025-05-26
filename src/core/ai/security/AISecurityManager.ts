/**
 * AIセキュリティマネージャー
 * AI機能利用時のセキュリティチェックを担当
 */
import { ApiLogger } from '../logger/ApiLogger';
import { AIFeatureOptions } from '../types/AITypes';

/**
 * セキュリティフィルタータイプ
 */
export type SecurityFilterType =
    | 'content-moderation'
    | 'pii-detection'
    | 'prompt-injection'
    | 'sensitive-topics'
    | 'custom';

/**
 * セキュリティフィルター設定
 */
interface SecurityFilterConfig {
    enabled: boolean;
    threshold: number;
    action: 'block' | 'warn' | 'log';
    customRules?: string[];
}

/**
 * セキュリティステータス情報
 */
interface SecurityStatus {
    enabled: boolean;
    filtersActive: boolean;
    moderationEnabled: boolean;
}

/**
 * AIセキュリティマネージャークラス
 */
export class AISecurityManager {
    private logger = ApiLogger.getInstance();
    private initialized = false;
    private enabled = true;
    private filters: Record<SecurityFilterType, SecurityFilterConfig> = {
        'content-moderation': {
            enabled: true,
            threshold: 0.8,
            action: 'block'
        },
        'pii-detection': {
            enabled: true,
            threshold: 0.9,
            action: 'warn'
        },
        'prompt-injection': {
            enabled: true,
            threshold: 0.7,
            action: 'block'
        },
        'sensitive-topics': {
            enabled: true,
            threshold: 0.8,
            action: 'warn'
        },
        'custom': {
            enabled: false,
            threshold: 0.5,
            action: 'log',
            customRules: []
        }
    };
    private allowedDomains: string[] = ['*'];
    private disallowedPhrases: string[] = [];
    private sensitiveTerms: string[] = [];
    private moderationApiUrl = 'https://api.openai.com/v1/moderations';
    private moderationApiKey = '';
    private moderationEnabled = true;

    /**
     * 初期化メソッド
     */
    public initialize(): void {
        if (this.initialized) return;

        this.logger.setContext('AISecurityManager');
        this.logger.info('AIセキュリティマネージャーを初期化しています');

        // 環境変数から設定を読み込む
        this.loadEnvironmentConfig();

        // フィルター設定を読み込む
        this.loadFilterConfig();

        this.initialized = true;
        this.logger.info('AIセキュリティマネージャーが初期化されました');
    }

    /**
     * 環境変数から設定を読み込む
     */
    private loadEnvironmentConfig(): void {
        if (typeof process !== 'undefined' && process.env) {
            const env = process.env;

            // セキュリティ機能の有効/無効
            if (env.NEXT_PUBLIC_AI_SECURITY_ENABLED === 'false') {
                this.enabled = false;
                this.logger.warn('AIセキュリティ機能が無効化されています');
            }

            // モデレーションAPIの設定
            if (env.NEXT_PUBLIC_AI_MODERATION_API_KEY) {
                this.moderationApiKey = env.NEXT_PUBLIC_AI_MODERATION_API_KEY;
            } else if (env.NEXT_PUBLIC_OPENAI_API_KEY) {
                this.moderationApiKey = env.NEXT_PUBLIC_OPENAI_API_KEY;
            }

            if (env.NEXT_PUBLIC_AI_MODERATION_API_URL) {
                this.moderationApiUrl = env.NEXT_PUBLIC_AI_MODERATION_API_URL;
            }

            if (env.NEXT_PUBLIC_AI_MODERATION_ENABLED === 'false') {
                this.moderationEnabled = false;
            }
        }
    }

    /**
     * フィルター設定を読み込む
     */
    private loadFilterConfig(): void {
        // ローカルストレージまたは設定ファイルからフィルター設定を読み込む
        try {
            if (typeof localStorage !== 'undefined') {
                const savedConfig = localStorage.getItem('ai-security-filters');
                if (savedConfig) {
                    const parsedConfig = JSON.parse(savedConfig) as Record<SecurityFilterType, SecurityFilterConfig>;

                    // 設定をマージ
                    Object.keys(parsedConfig).forEach(key => {
                        const filterType = key as SecurityFilterType;
                        if (this.filters[filterType]) {
                            this.filters[filterType] = {
                                ...this.filters[filterType],
                                ...parsedConfig[filterType]
                            };
                        }
                    });

                    this.logger.debug('カスタムセキュリティフィルター設定を読み込みました');
                }
            }
        } catch (error) {
            this.logger.error('セキュリティフィルター設定の読み込みに失敗しました', error);
        }
    }

    /**
     * リクエストの検証
     */
    public async validateRequest(
        data: unknown,
        options: AIFeatureOptions
    ): Promise<void> {
        if (!this.initialized) {
            this.initialize();
        }

        // セキュリティチェックが無効な場合は何もしない
        if (!this.enabled) {
            return;
        }

        // コンテンツチェック
        await this.validateContent(data, options);

        // プロンプトインジェクションチェック
        if (options.prompt) {
            await this.checkPromptInjection(options.prompt);
        }

        // システムプロンプトチェック
        if (options.systemPrompt) {
            await this.checkPromptInjection(options.systemPrompt);
        }

        this.logger.debug('セキュリティチェックが完了しました');
    }

    /**
     * コンテンツの検証
     */
    private async validateContent(
        data: unknown,
        options: AIFeatureOptions
    ): Promise<void> {
        // データが文字列の場合は直接チェック
        if (typeof data === 'string') {
            await this.checkContentSafety(data);
        }
        // データがオブジェクトの場合は文字列フィールドをチェック
        else if (data && typeof data === 'object') {
            await this.checkObjectContent(data);
        }
    }

    /**
     * オブジェクト内の文字列コンテンツをチェック
     */
    private async checkObjectContent(data: unknown): Promise<void> {
        if (!data || typeof data !== 'object') {
            return;
        }

        // オブジェクト内の文字列フィールドを再帰的にチェック
        const promises: Promise<void>[] = [];

        const checkField = async (value: unknown): Promise<void> => {
            if (typeof value === 'string') {
                await this.checkContentSafety(value);
            } else if (value && typeof value === 'object') {
                await this.checkObjectContent(value);
            }
        };

        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = (data as Record<string, unknown>)[key];
                promises.push(checkField(value));
            }
        }

        await Promise.all(promises);
    }

    /**
     * コンテンツの安全性チェック
     */
    private async checkContentSafety(content: string): Promise<void> {
        // 空または短すぎるコンテンツはスキップ
        if (!content || content.length < 4) {
            return;
        }

        // 禁止フレーズのチェック
        for (const phrase of this.disallowedPhrases) {
            if (content.toLowerCase().includes(phrase.toLowerCase())) {
                throw new Error(`禁止されたフレーズが含まれています: ${phrase}`);
            }
        }

        // センシティブな用語のチェック
        const sensitiveMatches = this.sensitiveTerms.filter(term =>
            content.toLowerCase().includes(term.toLowerCase())
        );

        if (sensitiveMatches.length > 0 && this.filters['sensitive-topics'].enabled) {
            const action = this.filters['sensitive-topics'].action;

            if (action === 'block') {
                throw new Error('センシティブなコンテンツが含まれています');
            } else if (action === 'warn') {
                this.logger.warn('センシティブなコンテンツが検出されました', { terms: sensitiveMatches });
            } else {
                this.logger.info('センシティブなコンテンツが検出されました', { terms: sensitiveMatches });
            }
        }

        // モデレーションAPIを使用したコンテンツチェック
        if (this.moderationEnabled && this.moderationApiKey && this.filters['content-moderation'].enabled) {
            await this.checkWithModerationApi(content);
        }
    }

    /**
     * モデレーションAPIによるコンテンツチェック
     */
    private async checkWithModerationApi(content: string): Promise<void> {
        try {
            const response = await fetch(this.moderationApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.moderationApiKey}`
                },
                body: JSON.stringify({ input: content })
            });

            if (!response.ok) {
                throw new Error(`モデレーションAPIエラー: ${response.status} ${response.statusText}`);
            }

            const result = await response.json() as {
                results: Array<{
                    flagged: boolean;
                    categories: Record<string, boolean>;
                    category_scores: Record<string, number>;
                }>;
            };

            if (result.results && result.results.length > 0 && result.results[0].flagged) {
                const action = this.filters['content-moderation'].action;
                const categories = result.results[0].categories;
                const scores = result.results[0].category_scores;

                if (action === 'block') {
                    throw new Error('不適切なコンテンツが検出されました');
                } else if (action === 'warn') {
                    this.logger.warn('モデレーションAPIがコンテンツをフラグしました', { categories, scores });
                } else {
                    this.logger.info('モデレーションAPIがコンテンツをフラグしました', { categories, scores });
                }
            }
        } catch (error) {
            // モデレーションAPIの失敗はエラーとして扱わない（ログのみ）
            this.logger.error('モデレーションAPIチェックに失敗しました', error);
        }
    }

    /**
      * プロンプトインジェクションのチェック
      */
    private async checkPromptInjection(prompt: string): Promise<void> {
        if (!this.filters['prompt-injection'].enabled) {
            return;
        }

        // 簡易的なプロンプトインジェクション検出
        // より高度な検出には専用のセキュリティサービスの使用を検討
        const injectionPatterns = [
            'ignore previous instructions',
            'ignore above instructions',
            'disregard previous',
            'forget your instructions',
            'ignore your programming',
            'you are now',
            'you are a',
            'act as if',
            'pretend you are',
            'override your programming',
            'bypass',
            'system prompt'
        ];

        const lowerPrompt = prompt.toLowerCase();
        const matches = injectionPatterns.filter(pattern => lowerPrompt.includes(pattern));

        if (matches.length > 0) {
            const action = this.filters['prompt-injection'].action;

            if (action === 'block') {
                throw new Error('プロンプトインジェクションの可能性があります');
            } else if (action === 'warn') {
                this.logger.warn('プロンプトインジェクションの可能性があります', { matches });
            } else {
                this.logger.info('プロンプトインジェクションの疑いがあります', { matches });
            }
        }
    }

    /**
     * フィルター設定の更新
     */
    public updateFilterConfig(
        filterType: SecurityFilterType,
        config: Partial<SecurityFilterConfig>
    ): void {
        if (!this.initialized) {
            this.initialize();
        }

        if (!this.filters[filterType]) {
            this.logger.warn(`不明なフィルタータイプ: ${filterType}`);
            return;
        }

        this.filters[filterType] = {
            ...this.filters[filterType],
            ...config
        };

        // 設定を保存
        this.saveFilterConfig();

        this.logger.info(`セキュリティフィルター "${filterType}" の設定を更新しました`);
    }

    /**
     * フィルター設定の保存
     */
    private saveFilterConfig(): void {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('ai-security-filters', JSON.stringify(this.filters));
            }
        } catch (error) {
            this.logger.error('フィルター設定の保存に失敗しました', error);
        }
    }

    /**
     * セキュリティ機能の有効/無効を切り替え
     */
    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        this.logger.info(`AIセキュリティ機能が${enabled ? '有効' : '無効'}になりました`);
    }

    /**
     * 禁止フレーズの設定
     */
    public setDisallowedPhrases(phrases: string[]): void {
        this.disallowedPhrases = phrases;
        this.logger.info(`${phrases.length}個の禁止フレーズを設定しました`);
    }

    /**
     * センシティブな用語の設定
     */
    public setSensitiveTerms(terms: string[]): void {
        this.sensitiveTerms = terms;
        this.logger.info(`${terms.length}個のセンシティブな用語を設定しました`);
    }

    /**
     * ステータス情報の取得
     */
    public getStatus(): SecurityStatus {
        if (!this.initialized) {
            this.initialize();
        }

        const filtersActive = Object.values(this.filters).some(filter => filter.enabled);

        return {
            enabled: this.enabled,
            filtersActive,
            moderationEnabled: this.moderationEnabled && !!this.moderationApiKey
        };
    }
}