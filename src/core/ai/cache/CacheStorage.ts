/**
 * キャッシュストレージ
 * 永続化ストレージとの連携を管理
 */
import { ApiLogger } from '../logger/ApiLogger';
import { CacheEntry, CacheStats } from './types/CacheTypes';

/**
 * キャッシュストレージクラス
 */
export class CacheStorage {
    private logger: ApiLogger;
    private storageKey = 'ai-cache-data';
    private compressionEnabled = false;
    private compressionThreshold = 1024; // 1KB以上のデータは圧縮
    private version = '1.0';

    /**
     * コンストラクタ
     */
    constructor(logger: ApiLogger) {
        this.logger = logger;

        // 環境設定を読み込む
        if (typeof process !== 'undefined' && process.env) {
            this.compressionEnabled = process.env.NEXT_PUBLIC_CACHE_COMPRESSION === 'true';
            const threshold = process.env.NEXT_PUBLIC_CACHE_COMPRESSION_THRESHOLD;
            if (threshold) {
                const thresholdValue = parseInt(threshold, 10);
                if (!isNaN(thresholdValue) && thresholdValue > 0) {
                    this.compressionThreshold = thresholdValue;
                }
            }
        }
    }

    /**
     * キャッシュデータを保存
     */
    public async saveData(
        cache: Map<string, CacheEntry>,
        stats: CacheStats
    ): Promise<boolean> {
        try {
            if (typeof localStorage === 'undefined') {
                return false;
            }

            // キャッシュサイズが大きすぎる場合は保存しない
            if (cache.size > 100) {
                this.logger.warn('キャッシュサイズが大きすぎるため、永続化をスキップします');
                return false;
            }

            const saveData = {
                entries: Array.from(cache.entries()),
                hitCount: stats.hitCount,
                missCount: stats.missCount,
                lastCleanup: stats.lastCleanup,
                created: stats.created,
                updated: Date.now(),
                version: this.version
            };

            let saveString = JSON.stringify(saveData);

            // データサイズの確認
            const dataSize = new Blob([saveString]).size;

            // 圧縮実施の判断
            let compressed = false;
            if (this.compressionEnabled && dataSize > this.compressionThreshold) {
                try {
                    compressed = await this.compressData(saveString, saveData);
                } catch (compressionError) {
                    this.logger.error('データ圧縮に失敗しました', compressionError);
                    compressed = false;
                }
            }

            if (!compressed) {
                localStorage.setItem(this.storageKey, saveString);
            }

            return true;
        } catch (error) {
            this.logger.error('キャッシュデータの保存に失敗しました', error);
            return false;
        }
    }

    /**
     * データを圧縮して保存
     */
    private async compressData(
        dataString: string,
        originalData: Record<string, unknown>
    ): Promise<boolean> {
        // CompressionStreamが使用可能な場合
        if (typeof CompressionStream !== 'undefined') {
            try {
                const encoder = new TextEncoder();
                const dataBuffer = encoder.encode(dataString);

                // Streamを使用して圧縮
                const cs = new CompressionStream('gzip');
                const writer = cs.writable.getWriter();
                writer.write(dataBuffer);
                writer.close();

                // 圧縮結果を読み取り
                const reader = cs.readable.getReader();
                const chunks: Uint8Array[] = [];

                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    if (value) chunks.push(value);
                }

                // 圧縮データを結合
                const compressedLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
                const compressedData = new Uint8Array(compressedLength);
                let position = 0;

                for (const chunk of chunks) {
                    compressedData.set(chunk, position);
                    position += chunk.length;
                }

                // Base64エンコード
                const base64Data = this.arrayBufferToBase64(compressedData.buffer);

                // メタデータと共に保存
                localStorage.setItem(`${this.storageKey}_meta`, JSON.stringify({
                    compressed: true,
                    algorithm: 'gzip',
                    originalSize: dataString.length,
                    compressedSize: compressedData.length,
                    timestamp: Date.now(),
                    entries: originalData.entries ? (originalData.entries as []).length : 0,
                    version: this.version
                }));

                localStorage.setItem(this.storageKey, base64Data);
                return true;
            } catch (error) {
                this.logger.error('CompressionStreamによる圧縮に失敗しました', error);
                return false;
            }
        }

        // CompressionStreamが利用できない場合は非圧縮で保存
        return false;
    }

    /**
     * ArrayBufferをBase64に変換
     */
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;

        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        return typeof btoa === 'function' ? btoa(binary) : binary;
    }

    /**
     * キャッシュデータを読み込む
     */
    public async loadData(): Promise<{
        cache: Map<string, CacheEntry>;
        stats: CacheStats;
    }> {
        const defaultStats: CacheStats = {
            hitCount: 0,
            missCount: 0,
            lastCleanup: Date.now(),
            created: Date.now()
        };

        try {
            if (typeof localStorage === 'undefined') {
                return {
                    cache: new Map<string, CacheEntry>(),
                    stats: defaultStats
                };
            }

            // メタデータを先に読み込み
            const metaStr = localStorage.getItem(`${this.storageKey}_meta`);
            let isCompressed = false;

            if (metaStr) {
                try {
                    const meta = JSON.parse(metaStr) as { compressed: boolean; algorithm: string };
                    isCompressed = meta.compressed === true;
                } catch (metaError) {
                    this.logger.error('メタデータの解析に失敗しました', metaError);
                }
            }

            // キャッシュデータを読み込み
            const cachedData = localStorage.getItem(this.storageKey);
            if (!cachedData) {
                return {
                    cache: new Map<string, CacheEntry>(),
                    stats: defaultStats
                };
            }

            let parsedJson: string;

            // 圧縮データの場合は解凍
            if (isCompressed) {
                try {
                    parsedJson = await this.decompressData(cachedData);
                } catch (decompressError) {
                    this.logger.error('データ解凍に失敗しました', decompressError);
                    return {
                        cache: new Map<string, CacheEntry>(),
                        stats: defaultStats
                    };
                }
            } else {
                parsedJson = cachedData;
            }

            // JSONデータをパース
            const parsedData = JSON.parse(parsedJson) as {
                entries: Array<[string, CacheEntry]>;
                hitCount: number;
                missCount: number;
                lastCleanup?: number;
                created?: number;
                updated?: number;
                version?: string;
            };

            // バージョンチェック
            if (parsedData.version && parsedData.version !== this.version) {
                this.logger.warn(`キャッシュバージョンが異なります (保存: ${parsedData.version}, 現在: ${this.version})`);
                // バージョン互換性ロジックをここに実装できます
            }

            return {
                cache: new Map(parsedData.entries),
                stats: {
                    hitCount: parsedData.hitCount,
                    missCount: parsedData.missCount,
                    lastCleanup: parsedData.lastCleanup || Date.now(),
                    created: parsedData.created || Date.now(),
                    updated: parsedData.updated
                }
            };
        } catch (error) {
            this.logger.error('キャッシュデータの読み込みに失敗しました', error);
            return {
                cache: new Map<string, CacheEntry>(),
                stats: defaultStats
            };
        }
    }

    /**
     * データを解凍
     */
    private async decompressData(compressedData: string): Promise<string> {
        // DecompressionStreamが使用可能な場合
        if (typeof DecompressionStream !== 'undefined') {
            try {
                // Base64デコード
                const binaryString = typeof atob === 'function' ? atob(compressedData) : compressedData;
                const compressedBytes = new Uint8Array(binaryString.length);

                for (let i = 0; i < binaryString.length; i++) {
                    compressedBytes[i] = binaryString.charCodeAt(i);
                }

                // Streamを使用して解凍
                const ds = new DecompressionStream('gzip');
                const writer = ds.writable.getWriter();
                writer.write(compressedBytes);
                writer.close();

                // 解凍結果を読み取り
                const reader = ds.readable.getReader();
                const chunks: Uint8Array[] = [];

                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    if (value) chunks.push(value);
                }

                // 解凍データを結合
                const decompressedLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
                const decompressedData = new Uint8Array(decompressedLength);
                let position = 0;

                for (const chunk of chunks) {
                    decompressedData.set(chunk, position);
                    position += chunk.length;
                }

                // デコードして文字列に変換
                const decoder = new TextDecoder();
                return decoder.decode(decompressedData);
            } catch (error) {
                this.logger.error('DecompressionStreamによる解凍に失敗しました', error);
                throw error;
            }
        }

        throw new Error('DecompressionStreamが利用できません');
    }

    /**
     * キャッシュデータを削除
     */
    public clearData(): void {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(this.storageKey);
                localStorage.removeItem(`${this.storageKey}_meta`);
            }
        } catch (error) {
            this.logger.error('キャッシュデータの削除に失敗しました', error);
        }
    }

    /**
     * 分散キャッシュを同期（複数タブ間の同期用）
     */
    public syncCacheAcrossTabs(): void {
        if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
            return;
        }

        // 現在のタブが既に同期済みかチェック
        const isInitialized = sessionStorage.getItem('cache-sync-initialized');
        if (isInitialized) {
            return;
        }

        // ストレージイベントリスナーを設定（他タブからの更新を取得）
        window.addEventListener('storage', (event) => {
            if (event.key === this.storageKey && event.newValue) {
                // 他のタブでキャッシュが更新された場合の処理
                this.logger.debug('他のタブからキャッシュの更新を検出しました');
                // イベントハンドラーで処理するためのカスタムイベントを発火
                window.dispatchEvent(new CustomEvent('ai-cache-updated', {
                    detail: { source: 'external' }
                }));
            }
        });

        // 初期化フラグを設定
        sessionStorage.setItem('cache-sync-initialized', 'true');
    }
}