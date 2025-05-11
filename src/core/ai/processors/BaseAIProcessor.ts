/**
 * ベースAIプロセッサー
 * すべてのプロバイダー固有プロセッサーの基底クラス
 */
import { ApiLogger } from '../logger/ApiLogger';
import {
    AIModel,
    AIEnhancementType,
    AIFeatureOptions,
    AIProviderConfig,
    AIProcessingResult,
    AIProcessor
} from '../types/AITypes';

/**
 * ベースAIプロセッサークラス
 */
export abstract class BaseAIProcessor implements AIProcessor {
    protected logger: ApiLogger;

    /**
     * コンストラクタ
     */
    constructor() {
        this.logger = new ApiLogger();
        this.logger.setContext(this.constructor.name);
    }

    /**
     * AIモデルで処理を実行する抽象メソッド
     * サブクラスで実装する必要がある
     */
    public abstract process(
        data: unknown,
        model: AIModel,
        enhancementType: AIEnhancementType,
        options: AIFeatureOptions,
        providerConfig: AIProviderConfig
    ): Promise<AIProcessingResult>;

    /**
     * システムプロンプトの作成
     */
    protected buildSystemPrompt(
        enhancementType: AIEnhancementType,
        options: AIFeatureOptions
    ): string {
        // カスタムシステムプロンプトが提供されている場合はそれを使用
        if (options.systemPrompt) {
            return options.systemPrompt;
        }

        // 強化タイプに応じたデフォルトシステムプロンプト
        switch (enhancementType) {
            case 'query-optimization':
                return '与えられたクエリを最適化して、より効率的かつ正確な結果を返すようにしてください。';

            case 'content-generation':
                return '与えられた指示に基づいて、高品質なコンテンツを生成してください。内容は正確で、関連性が高く、読みやすいものにしてください。';

            case 'text-summarization':
                return '与えられたテキストを要約してください。重要なポイントを維持しながら、簡潔にまとめてください。';

            case 'sentiment-analysis':
                return '与えられたテキストの感情分析を行ってください。ポジティブ、ネガティブ、または中立的な感情を識別し、その理由を説明してください。';

            case 'entity-extraction':
                return '与えられたテキストから重要なエンティティ（人物、組織、場所、日付など）を抽出し、JSON形式で返してください。';

            case 'translation':
                return '与えられたテキストを指定された言語に翻訳してください。文脈やニュアンスを可能な限り保持してください。';

            case 'text-classification':
                return '与えられたテキストを分類してください。テキストがどのカテゴリに属するかを判断し、その理由を説明してください。';

            case 'code-generation':
                return '与えられた仕様に基づいて、クリーンで効率的なコードを生成してください。コードは読みやすく、ベストプラクティスに従ったものにしてください。';

            case 'code-explanation':
                return '与えられたコードを分析し、その機能を分かりやすく説明してください。コードの目的、構造、重要な部分を強調してください。';

            case 'data-analysis':
                return '与えられたデータを分析し、重要な傾向、パターン、インサイトを特定してください。データの背後にある意味を解釈してください。';

            case 'question-answering':
                return '与えられた質問に対して正確かつ有益な回答を提供してください。必要に応じて追加情報も提供してください。';

            case 'chat-completion':
                return 'ユーザーとの会話を自然に続けてください。質問に答え、情報を提供し、適切な応答を返してください。';

            case 'image-generation':
                return '与えられた説明に基づいて、視覚的に魅力的で要求を満たす画像を生成してください。';

            case 'vector-embedding':
                return 'テキストをベクトル空間に変換し、意味的な類似性に基づいて処理できるようにしてください。';

            default:
                return 'あなたは役立つAIアシスタントです。ユーザーの要求に応じて、正確で有用な情報を提供してください。';
        }
    }

    /**
     * ユーザープロンプトの作成
     */
    protected buildUserPrompt(
        data: unknown,
        enhancementType: AIEnhancementType,
        options: AIFeatureOptions
    ): string {
        // カスタムプロンプトが提供されている場合はそれを使用
        if (options.prompt) {
            return options.prompt;
        }

        // データを文字列に変換
        let dataStr: string;
        if (typeof data === 'string') {
            dataStr = data;
        } else if (data !== null && typeof data === 'object') {
            try {
                dataStr = JSON.stringify(data, null, 2);
            } catch (error) {
                dataStr = String(data);
            }
        } else {
            dataStr = String(data);
        }

        // 追加指示があれば追加
        let additionalInstructions = '';
        if (options.additionalInstructions) {
            additionalInstructions = `\n\n追加指示: ${options.additionalInstructions}`;
        }

        // 強化タイプに応じた指示を追加
        return `${this.getInstructionForType(enhancementType)}\n\n${dataStr}${additionalInstructions}`;
    }

    /**
     * 強化タイプに応じた指示文を取得
     */
    private getInstructionForType(enhancementType: AIEnhancementType): string {
        switch (enhancementType) {
            case 'query-optimization':
                return '以下のクエリを最適化してください。効率的で正確な結果を返せるように修正してください。';

            case 'content-generation':
                return '以下の指示に基づいて、高品質なコンテンツを生成してください。';

            case 'text-summarization':
                return '以下のテキストを要約してください。重要なポイントを維持しながら、簡潔にまとめてください。';

            case 'sentiment-analysis':
                return '以下のテキストの感情分析を行ってください。ポジティブ、ネガティブ、または中立的な感情を識別し、その理由を説明してください。';

            case 'entity-extraction':
                return '以下のテキストから重要なエンティティ（人物、組織、場所、日付など）を抽出してください。JSON形式で返してください。';

            case 'translation':
                return '以下のテキストを指定された言語に翻訳してください。';

            case 'text-classification':
                return '以下のテキストを分類してください。テキストがどのカテゴリに属するかを判断し、理由を説明してください。';

            case 'code-generation':
                return '以下の仕様に基づいて、クリーンで効率的なコードを生成してください。';

            case 'code-explanation':
                return '以下のコードを分析し、その機能を分かりやすく説明してください。';

            case 'data-analysis':
                return '以下のデータを分析し、重要な傾向、パターン、インサイトを特定してください。';

            case 'question-answering':
                return '以下の質問に対して正確かつ有益な回答を提供してください。';

            case 'chat-completion':
                return '以下の会話を続けてください。';

            case 'image-generation':
                return '以下の説明に基づいて画像を生成してください。';

            case 'vector-embedding':
                return '以下のテキストをベクトル埋め込みに変換してください。';

            default:
                return '以下の内容に適切に対応してください。';
        }
    }

    /**
     * トークン数の推定
     */
    protected estimateTokenCount(text: string): number {
        if (!text) return 0;

        // 簡易的な推定: 日本語は文字あたり0.8トークン、英語は単語あたり1.3トークン
        const jpRegex = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/g;
        const jpCount = (text.match(jpRegex) || []).length;
        const enText = text.replace(jpRegex, '');
        const enWords = enText.trim().split(/\s+/).length;

        return Math.ceil(jpCount * 0.8 + enWords * 1.3);
    }
}               