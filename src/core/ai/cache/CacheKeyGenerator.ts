/**
 * キャッシュキー生成ユーティリティ
 * データと設定からキャッシュキーを生成する
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
        const temperature = options.temperature !== undefined ? options.temperature.toString() : 'default';
        const maxTokens = options.maxTokens !== undefined ? options.maxTokens.toString() : 'default';

        // キャッシュキーを生成
        const keyParts = [
            type,
            modelId,
            temperature,
            maxTokens,
            // データのハッシュ値を使用
            this.hashString(dataStr)
        ];

        const key = keyParts.join(':');

        // キーが長すぎる場合は切り詰め
        return key.length > 100 ? key.substring(0, 100) : key;
    }

    /**
     * 文字列のハッシュ値を計算
     */
    private static hashString(str: string): string {
        // 簡易的なハッシュ関数
        let hash = 0;
        const maxLength = Math.min(str.length, 1000); // 長すぎる文字列は切り詰める

        for (let i = 0; i < maxLength; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bitに変換
        }

        return hash.toString(36);
    }

    /**
     * 高度なハッシュ算出（SHA-256）
     * Webブラウザ環境で利用可能な場合
     */
    public static async generateSecureHash(data: string): Promise<string> {
        // Web Crypto APIが利用可能な場合
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            try {
                const encoder = new TextEncoder();
                const dataBuffer = encoder.encode(data);
                const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

                // ArrayBufferを16進数文字列に変換
                return Array.from(new Uint8Array(hashBuffer))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
            } catch (error) {
                // Crypto APIが失敗した場合は簡易ハッシュを使用
                return this.hashString(data);
            }
        }

        // Crypto APIが利用できない場合は簡易ハッシュを使用
        return this.hashString(data);
    }

    /**
     * データの複雑なハッシュ生成
     * 特に大容量または複雑なデータに対して効率的
     */
    public static generateComplexKey(
        data: unknown,
        type: string,
        additionalFactors: Record<string, unknown> = {}
    ): string {
        let baseString = '';

        try {
            // データタイプに基づいて基本文字列を生成
            if (typeof data === 'string') {
                baseString = data;
            } else if (typeof data === 'number' || typeof data === 'boolean') {
                baseString = String(data);
            } else if (Array.isArray(data)) {
                // 配列の場合は最初の数項目のみ使用
                baseString = JSON.stringify(data.slice(0, 5));
            } else if (data === null) {
                baseString = 'null';
            } else if (data === undefined) {
                baseString = 'undefined';
            } else if (typeof data === 'object') {
                // オブジェクトの場合はキーの一部を使用
                const obj = data as Record<string, unknown>;
                const keys = Object.keys(obj).slice(0, 5);
                const shortObj: Record<string, unknown> = {};

                keys.forEach(key => {
                    shortObj[key] = obj[key];
                });

                baseString = JSON.stringify(shortObj);
            } else {
                baseString = String(data);
            }
        } catch (error) {
            baseString = 'error_serializing_data';
        }

        // 追加要素を文字列に含める
        const additionalString = Object.entries(additionalFactors)
            .map(([key, value]) => `${key}:${String(value)}`)
            .join(',');

        // 型情報とその他の要素を組み合わせる
        const combined = `${type}|${baseString}|${additionalString}`;

        // 直接ハッシュを計算して返す
        return this.hashString(combined);
    }

    /**
     * キーログ用に安全に切り詰めたキーを取得
     */
    public static getSafeKeyForLogging(key: string): string {
        if (!key) return '<空のキー>';

        // キーが20文字より長い場合は切り詰める
        return key.length > 20 ? `${key.substring(0, 20)}...` : key;
    }
}