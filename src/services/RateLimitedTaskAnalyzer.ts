// src/services/RateLimitedTaskAnalyzer.ts
// APIレート制限を回避するための分析制御サービス

import GeminiService, { TaskClassification } from "./GeminiService";
import TaskPriorityService, { PriorityAnalysis } from "./TaskPriorityService";

// レート制限の設定
const MIN_INTERVAL_BETWEEN_CALLS = 5000; // ミリ秒単位 (5秒)
const MIN_TEXT_LENGTH_FOR_ANALYSIS = 8; // 分析に必要な最小文字数
const MAX_CALLS_PER_MINUTE = 10; // 1分あたりの最大呼び出し回数

// 呼び出し履歴の追跡
const callHistory: number[] = [];
let lastTypeAnalysisTime = 0;
let lastPriorityAnalysisTime = 0;
const requestQueue: Array<() => Promise<void>> = []; // letからconstに変更
let isProcessingQueue = false;

// リクエストキューを処理する関数
const processQueue = async (): Promise<void> => {
    if (isProcessingQueue || requestQueue.length === 0) {
        return;
    }

    isProcessingQueue = true;

    try {
        // キューから最初のリクエストを取得して実行
        const request = requestQueue.shift();
        if (request) {
            await request();
        }
    } catch (error) {
        console.error('キュー処理中にエラーが発生しました:', error);
    } finally {
        isProcessingQueue = false;

        // キューにまだリクエストがあれば、次のリクエストを処理
        if (requestQueue.length > 0) {
            // 次のリクエストの前に少し待機して、レート制限を考慮
            setTimeout(processQueue, MIN_INTERVAL_BETWEEN_CALLS);
        }
    }
};

// リクエストをキューに追加する関数
const addToQueue = (request: () => Promise<void>): void => {
    requestQueue.push(request);

    // キューがまだ処理されていなければ、処理を開始
    if (!isProcessingQueue) {
        processQueue();
    }
};


// キャッシュ
interface AnalysisCache<T> {
    [key: string]: {
        result: T;
        timestamp: number;
    }
}

const typeCache: AnalysisCache<TaskClassification> = {};
const priorityCache: AnalysisCache<PriorityAnalysis> = {};
const CACHE_TTL = 1000 * 60 * 30; // 30分キャッシュを保持

/**
 * レート制限を考慮したタスク分析サービス
 */
export const RateLimitedTaskAnalyzer = {

    /**
     * キューベースのタスク分析リクエスト - レート制限に準拠
     * @param taskText タスク内容
     * @param onComplete 完了時のコールバック関数
     */
    queueAnalysis: (
        taskText: string,
        onComplete: (result: {
            typeAnalysis: TaskClassification;
            priorityAnalysis: PriorityAnalysis;
        }) => void
    ): void => {
        // キューに分析リクエストを追加
        addToQueue(async () => {
            try {
                const result = await RateLimitedTaskAnalyzer.analyzeBoth(taskText);
                onComplete(result);
            } catch (error) {
                console.error('キューでの分析中にエラーが発生しました:', error);
                // エラー時はローカル分析結果を返す
                onComplete({
                    typeAnalysis: localTypeAnalysis(taskText),
                    priorityAnalysis: TaskPriorityService.localPriorityAnalysis(taskText) // localPriorityAnalysisからTaskPriorityService.localPriorityAnalysisに修正
                });
            }
        });
    },

    /**
     * タスクタイプを分析する - レート制限あり
     * @param taskText タスク内容
     * @returns タスク分類結果
     */
    analyzeTaskType: async (taskText: string): Promise<TaskClassification> => {
        // 入力チェック
        if (!taskText || taskText.trim().length < MIN_TEXT_LENGTH_FOR_ANALYSIS) {
            console.log('テキストが短すぎるため、分析をスキップします');
            return {
                type: 'input',
                confidence: 0.5,
                explanation: 'テキストが短すぎるため、デフォルト値を使用します'
            };
        }

        // キャッシュをチェック
        const cacheKey = taskText.trim().toLowerCase();
        if (typeCache[cacheKey] && Date.now() - typeCache[cacheKey].timestamp < CACHE_TTL) {
            console.log('キャッシュから結果を返します (タイプ分析)');
            return typeCache[cacheKey].result;
        }

        // レート制限をチェック
        const now = Date.now();

        // 最近の呼び出し履歴を更新（1分以内の呼び出しのみ保持）
        const oneMinuteAgo = now - 60000;
        while (callHistory.length > 0 && callHistory[0] < oneMinuteAgo) {
            callHistory.shift();
        }

        // 1分あたりの最大呼び出し回数をチェック
        if (callHistory.length >= MAX_CALLS_PER_MINUTE) {
            console.log('1分あたりの最大呼び出し回数に達しました (タイプ分析)');
            // ローカル分析を使用
            const result = localTypeAnalysis(taskText);
            return result;
        }

        // 前回の分析からの経過時間をチェック
        if (now - lastTypeAnalysisTime < MIN_INTERVAL_BETWEEN_CALLS) {
            console.log('前回の分析からの間隔が短すぎます (タイプ分析)');
            // ローカル分析を使用
            const result = localTypeAnalysis(taskText);
            return result;
        }

        // APIを呼び出し
        try {
            lastTypeAnalysisTime = now;
            callHistory.push(now);

            const result = await GeminiService.classifyTaskType(taskText);

            // 結果をキャッシュ
            typeCache[cacheKey] = {
                result,
                timestamp: now
            };

            return result;
        } catch (error) {
            console.error('タイプ分析中にエラーが発生しました:', error);
            return localTypeAnalysis(taskText);
        }
    },

    /**
     * タスク優先度を分析する - レート制限あり
     * @param taskText タスク内容
     * @returns 優先度分析結果
     */
    analyzeTaskPriority: async (taskText: string): Promise<PriorityAnalysis> => {
        // 入力チェック
        if (!taskText || taskText.trim().length < MIN_TEXT_LENGTH_FOR_ANALYSIS) {
            console.log('テキストが短すぎるため、分析をスキップします');
            return {
                isPrioritized: false,
                importance: 5,
                urgency: 5,
                explanation: 'テキストが短すぎるため、デフォルト値を使用します'
            };
        }

        // キャッシュをチェック
        const cacheKey = taskText.trim().toLowerCase();
        if (priorityCache[cacheKey] && Date.now() - priorityCache[cacheKey].timestamp < CACHE_TTL) {
            console.log('キャッシュから結果を返します (優先度分析)');
            return priorityCache[cacheKey].result;
        }

        // レート制限をチェック
        const now = Date.now();

        // 最近の呼び出し履歴を更新（1分以内の呼び出しのみ保持）
        const oneMinuteAgo = now - 60000;
        while (callHistory.length > 0 && callHistory[0] < oneMinuteAgo) {
            callHistory.shift();
        }

        // 1分あたりの最大呼び出し回数をチェック
        if (callHistory.length >= MAX_CALLS_PER_MINUTE) {
            console.log('1分あたりの最大呼び出し回数に達しました (優先度分析)');
            // ローカル分析を使用
            return TaskPriorityService.localPriorityAnalysis(taskText);
        }

        // 前回の分析からの経過時間をチェック
        if (now - lastPriorityAnalysisTime < MIN_INTERVAL_BETWEEN_CALLS) {
            console.log('前回の分析からの間隔が短すぎます (優先度分析)');
            // ローカル分析を使用
            return TaskPriorityService.localPriorityAnalysis(taskText);
        }

        // APIを呼び出し
        try {
            lastPriorityAnalysisTime = now;
            callHistory.push(now);

            const result = await TaskPriorityService.analyzePriority(taskText);

            // 結果をキャッシュ
            priorityCache[cacheKey] = {
                result,
                timestamp: now
            };

            return result;
        } catch (error) {
            console.error('優先度分析中にエラーが発生しました:', error);
            return TaskPriorityService.localPriorityAnalysis(taskText);
        }
    },

    /**
     * 包括的なタスク分析を実行 - タイプと優先度の両方
     * @param taskText タスク内容
     * @returns タイプと優先度の分析結果
     */
    analyzeBoth: async (taskText: string): Promise<{
        typeAnalysis: TaskClassification;
        priorityAnalysis: PriorityAnalysis;
    }> => {
        // 手動実行用の包括的分析 - Enter キーやボタンクリックで明示的に実行する場合に適している
        try {
            const typeAnalysis = await RateLimitedTaskAnalyzer.analyzeTaskType(taskText);

            // タイプ分析後、少し遅延させてから優先度分析を実行
            await new Promise(resolve => setTimeout(resolve, 1000));

            const priorityAnalysis = await RateLimitedTaskAnalyzer.analyzeTaskPriority(taskText);

            return {
                typeAnalysis,
                priorityAnalysis
            };
        } catch (error) {
            console.error('包括的分析中にエラーが発生しました:', error);
            return {
                typeAnalysis: localTypeAnalysis(taskText),
                priorityAnalysis: TaskPriorityService.localPriorityAnalysis(taskText)
            };
        }
    }
};

// ローカルでのタイプ分析 (フォールバック用)
function localTypeAnalysis(taskText: string): TaskClassification {
    const lowerText = taskText.toLowerCase();

    // インプット関連のキーワード
    const inputKeywords = [
        '読む', '見る', '聴く', '学ぶ', '勉強', '情報収集', 'チェック',
        'インプット', '確認', 'リサーチ', '参考', '調査'
    ];

    // アウトプット関連のキーワード
    const outputKeywords = [
        '書く', '作る', '実践', '実行', '発表', '作成', '構築', '開発',
        'コーディング', 'アウトプット', '教える', 'シェア', '投稿'
    ];

    // キーワードマッチの数をカウント
    let inputScore = 0;
    let outputScore = 0;

    inputKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) inputScore++;
    });

    outputKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) outputScore++;
    });

    // スコアに基づいて分類
    if (inputScore > outputScore) {
        return {
            type: 'input',
            confidence: 0.7,
            explanation: 'インプット関連のキーワードが検出されました（ローカル分析）'
        };
    } else if (outputScore > inputScore) {
        return {
            type: 'output',
            confidence: 0.7,
            explanation: 'アウトプット関連のキーワードが検出されました（ローカル分析）'
        };
    } else {
        if (lowerText.includes('ai') || lowerText.includes('連携') || lowerText.includes('開発')) {
            return {
                type: 'output',
                confidence: 0.6,
                explanation: 'AI連携や開発はアウトプット活動と判断しました（ローカル分析）'
            };
        } else {
            return {
                type: 'input',
                confidence: 0.5,
                explanation: 'タスク種別を判別できないため、デフォルト設定しました（ローカル分析）'
            };
        }
    }
}

// タイプ分析のモック実装（完全オフライン用）
export const mockTaskTypeAnalysis = (taskText: string): TaskClassification => {
    return localTypeAnalysis(taskText);
};

// 優先度分析のモック実装（完全オフライン用）
export const mockTaskPriorityAnalysis = (taskText: string): PriorityAnalysis => {
    return TaskPriorityService.localPriorityAnalysis(taskText);
};

export default RateLimitedTaskAnalyzer;