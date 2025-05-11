/**
 * Anthropicプロセッサー
 * Anthropic Claude APIを利用した処理を実装
 */
import { BaseAIProcessor } from './BaseAIProcessor';
import {
    AIModel,
    AIEnhancementType,
    AIFeatureOptions,
    AIProviderConfig,
    AIProcessingResult
} from '../types/AITypes';

/**
 * Anthropicプロセッサークラス
 */
export class AnthropicProcessor extends BaseAIProcessor {
    /**
     * コンストラクタ
     */
    constructor() {
        super();
        this.logger.setContext('AnthropicProcessor');
    }

    /**
     * Anthropic APIを使用して処理を実行
     */
    public async process(
        data: unknown,
        model: AIModel,
        enhancementType: AIEnhancementType,
        options: AIFeatureOptions,
        providerConfig: AIProviderConfig
    ): Promise<AIProcessingResult> {
        try {
            this.logger.debug(`Anthropic処理開始: ${model.id}, ${enhancementType}`);

            // システムプロンプトとユーザープロンプトを作成
            const systemPrompt = this.buildSystemPrompt(enhancementType, options);
            const userPrompt = this.buildUserPrompt(data, enhancementType, options);

            // 入力トークン数を推定
            const inputTokens = this.estimateTokenCount(systemPrompt + userPrompt);

            // APIパラメータを構築
            const apiParams = this.buildApiParams(model, options, systemPrompt, userPrompt);

            // Anthropic APIリクエストを実行
            const response = await this.callAnthropicApi(apiParams, providerConfig);

            // レスポンスを処理
            const result = this.processResponse(response);

            // 出力トークン数を推定
            const outputString = typeof result === 'string' ?
                result : JSON.stringify(result);
            const outputTokens = this.estimateTokenCount(outputString);

            this.logger.debug(`Anthropic処理完了: ${inputTokens}入力トークン, ${outputTokens}出力トークン`);

            // 結果を返す
            return {
                data: result,
                inputTokens,
                outputTokens,
                metadata: {
                    model: model.id,
                    provider: 'anthropic'
                }
            };
        } catch (error) {
            this.logger.error(`Anthropic処理エラー: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * API呼び出しパラメータを構築
     */
    private buildApiParams(
        model: AIModel,
        options: AIFeatureOptions,
        systemPrompt: string,
        userPrompt: string
    ): Record<string, unknown> {
        // 温度パラメータ（デフォルトはモデルのデフォルト値、またはオプションで上書き）
        const temperature = options.temperature !== undefined ?
            options.temperature : model.defaultTemperature;

        // 最大トークン数（デフォルトはモデルの最大値の80%、またはオプションで上書き）
        const maxTokens = options.maxTokens !== undefined ?
            options.maxTokens : Math.floor(model.maxTokens * 0.8);

        // APIパラメータを構築（Anthropic APIの形式に合わせる）
        return {
            model: model.id,
            messages: [
                { role: 'user', content: userPrompt }
            ],
            system: systemPrompt,
            max_tokens: maxTokens,
            temperature,
            stream: options.stream === true
        };
    }

    /**
     * Anthropic APIを呼び出す
     */
    private async callAnthropicApi(
        params: Record<string, unknown>,
        providerConfig: AIProviderConfig
    ): Promise<any> {
        // APIのベースURLを取得
        const baseUrl = providerConfig.baseUrl || 'https://api.anthropic.com';
        const url = `${baseUrl}/v1/messages`;

        // APIヘッダーを構築
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'x-api-key': providerConfig.apiKey || '',
            'anthropic-version': (providerConfig.options?.version as string) || '2023-06-01'
        };

        try {
            // APIリクエストを実行
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(params),
            });

            // エラー応答をチェック
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Anthropic API エラー: ${errorData.error?.message || response.statusText}`);
            }

            // ストリーミングの場合
            if (params.stream === true) {
                return response; // ストリームを直接返す
            }

            // 通常のレスポンスの場合はJSONとして解析
            return await response.json();
        } catch (error) {
            this.logger.error(`Anthropic API呼び出しエラー: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
       * APIレスポンスを処理
       */
    private processResponse(response: any): unknown {
        // レスポンスが存在しない場合
        if (!response) {
            throw new Error('Anthropic APIからレスポンスがありません');
        }

        // エラーチェック
        if (response.error) {
            throw new Error(`Anthropic API エラー: ${response.error.message || 'Unknown error'}`);
        }

        // 通常のレスポンス処理
        if (response.content && Array.isArray(response.content)) {
            // テキストコンテンツを結合
            const textContent = response.content
                .filter((item: any) => item.type === 'text')
                .map((item: any) => item.text)
                .join('');

            // JSON形式の場合はパースを試みる
            try {
                return JSON.parse(textContent);
            } catch (error) {
                // パースに失敗した場合はテキストのまま返す
                return textContent;
            }
        }

        // 単純なテキストレスポンスの場合
        if (response.completion) {
            return response.completion;
        }

        // その他の形式のレスポンス
        return response;
    }
}