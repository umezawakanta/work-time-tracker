/**
 * キャッシュキー生成ユーティリティ
 */
import { AIEnhancementType, AIFeatureOptions } from '../types/AITypes';

/**
 * キャッシュキー生成クラス
 */
export class CacheKeyGenerator {
    /**
     * キャッシュキーを生成
     */
    public static generateKey(
        data: unknown,
        type: AIEnhancementType,
        options: AIFeatureOptions
    ): string {
        // カスタムキーが指定されている場合はそれを使用
        if (options.cacheKey) {
            return options.cacheKey;
        }

        // データをJSON文字列に変換
        let dataStr: string;
        try {
            if (typeof data === 'string') {
                dataStr = data;
            } else {
                dataStr = JSON.stringify(data);
            }
        } catch (error) {
            // JSON変換に失敗した場合はString()を使用
            dataStr = String(data);
        }

        // オプションから関連キャッシュ情報を抽出
        const modelId = options.model || 'default';
        const temperature = options.temperature !== undefined ?
            options.temperature.toString() : 'default';
        const maxTokens = options.maxTokens !== undefined ?
            options.maxTokens.toString() : 'default';

        // キャッシュキーを生成
        const keyParts = [
            type,
            modelId,
            temperature,
            maxTokens,
            // データのハッシュ値を使用
            this.hashString(dataStr)
        ];

        return keyParts.join(':');
    }

    /**
     * ユーザースコープ付きキャッシュキーを生成
     */
    public static generateScopedKey(
        data: unknown,
        type: AIEnhancementType,
        options: AIFeatureOptions,
        userId?: string
    ): string {
        const baseKey = this.generateKey(data, type, options);

        if (userId) {
            return `user:${userId}:${baseKey}`;
        }

        return baseKey;
    }

    /**
     * 文字列のハッシュ値を計算
     */
    private static hashString(str: string): string {
        // 長すぎる文字列の場合は切り詰める
        const truncatedStr = str.length > 2000 ? str.substring(0, 2000) : str;

        // 簡易的なハッシュ関数
        let hash = 0;
        for (let i = 0; i < truncatedStr.length; i++) {
            const char = truncatedStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bitに変換
        }

        return hash.toString(36);
    }

    /**
     * キーのログ出力用に安全に短縮する
     */
    public static getSafeKeyForLogging(key: string): string {
        if (!key) return '<空のキー>';

        // 長いキーを安全に切り詰める
        return key.length > 20 ? `${key.substring(0, 20)}...` : key;
    }
}