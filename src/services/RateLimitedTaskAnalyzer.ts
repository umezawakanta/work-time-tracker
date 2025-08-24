// src/services/RateLimitedTaskAnalyzer.ts
// APIレート制限を回避するための分析制御サービス

import GeminiService, { TaskClassification, TaskDetailAnalysis } from './GeminiService';
import TaskPriorityService, { PriorityAnalysis } from './TaskPriorityService';
import { dataGenerator } from '../utils/idGenerator';

// レート制限の設定
const MIN_INTERVAL_BETWEEN_CALLS = 5000; // ミリ秒単位 (5秒)
const MIN_TEXT_LENGTH_FOR_ANALYSIS = 8; // 分析に必要な最小文字数
const MAX_CALLS_PER_MINUTE = 10; // 1分あたりの最大呼び出し回数

// 短いテキストから文脈を推測するためのマッピング
const SHORT_TEXT_MAPPINGS = {
  // 一般的な略語や短いテキスト
  mtg: { expanded: '会議', type: 'input', category: '仕事' },
  dev: { expanded: '開発作業', type: 'output', category: '仕事' },
  doc: { expanded: 'ドキュメント作成', type: 'output', category: '仕事' },
  study: { expanded: '勉強・学習', type: 'input', category: '学習' },
  review: { expanded: 'レビュー確認', type: 'input', category: '仕事' },
  fix: { expanded: 'バグ修正', type: 'output', category: '仕事' },
  test: { expanded: 'テスト実行', type: 'output', category: '仕事' },
  mail: { expanded: 'メール確認・返信', type: 'input', category: '仕事' },
  pr: { expanded: 'プルリクエスト作成', type: 'output', category: '仕事' },
  gym: { expanded: 'ジムでトレーニング', type: 'output', category: '健康' },
  run: { expanded: 'ランニング', type: 'output', category: '健康' },
  read: { expanded: '読書', type: 'input', category: '学習' },
  write: { expanded: '執筆作業', type: 'output', category: '仕事' },
  plan: { expanded: '計画立案', type: 'output', category: '仕事' },
  rest: { expanded: '休憩', type: 'input', category: 'その他' },
};

// 呼び出し履歴の追跡
const callHistory: number[] = [];
let lastTypeAnalysisTime = 0;
let lastPriorityAnalysisTime = 0;
const requestQueue: Array<() => Promise<void>> = []; // letからconstに変更
let isProcessingQueue = false;

// キャッシュに詳細分析用を追加
const detailCache: AnalysisCache<TaskDetailAnalysis> = {};
let lastDetailAnalysisTime = 0;

/**
 * API分析間の動的遅延時間を計算
 */
const calculateApiDelay = (): number => {
  const systemHealth = dataGenerator.generateSystemHealth();

  // 基本遅延時間（500ms-1500ms）
  let baseDelay = 1000;

  // システム状況による調整
  const uptimeFactor = systemHealth.uptime / 100; // 稼働率による調整
  const errorFactor = 1 + systemHealth.errorRate / 100; // エラー率による調整

  // 高負荷時は遅延を増やし、安定時は遅延を減らす
  baseDelay *= errorFactor / uptimeFactor;

  // 500ms-2000msの範囲に制限
  return Math.round(Math.max(500, Math.min(2000, baseDelay)));
};

// 短いテキストを補完する関数
const expandShortText = (taskText: string): string => {
  const lowerText = taskText.toLowerCase().trim();

  // 短いテキストのマッピングをチェック
  if (lowerText in SHORT_TEXT_MAPPINGS) {
    return SHORT_TEXT_MAPPINGS[lowerText as keyof typeof SHORT_TEXT_MAPPINGS].expanded;
  }

  // その他の短いテキストの場合
  if (taskText.trim().length < MIN_TEXT_LENGTH_FOR_ANALYSIS) {
    // 動詞で終わる場合
    if (
      lowerText.endsWith('る') ||
      lowerText.endsWith('う') ||
      lowerText.endsWith('く') ||
      lowerText.endsWith('す') ||
      lowerText.endsWith('つ') ||
      lowerText.endsWith('ぬ') ||
      lowerText.endsWith('ぶ') ||
      lowerText.endsWith('む')
    ) {
      return `${taskText}作業を実施する`;
    }
    // 名詞の場合
    return `${taskText}に関する作業を行う`;
  }

  // すでに十分な長さがある場合はそのまま返す
  return taskText;
};

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
  };
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
          priorityAnalysis: TaskPriorityService.localPriorityAnalysis(taskText), // localPriorityAnalysisからTaskPriorityService.localPriorityAnalysisに修正
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
    if (!taskText || taskText.trim().length === 0) {
      return {
        type: 'input',
        confidence: 0.1,
        explanation: 'テキストが空のため、デフォルト値を使用します',
      };
    }

    const originalText = taskText.trim();
    const isShortText = originalText.length < MIN_TEXT_LENGTH_FOR_ANALYSIS;

    // 短いテキストの場合は補完する
    const analyzableText = isShortText ? expandShortText(originalText) : originalText;

    // キャッシュをチェック（元のテキストでキャッシュキーを作成）
    const cacheKey = originalText.toLowerCase();
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
      const result = localTypeAnalysis(originalText);
      return result;
    }

    // 前回の分析からの経過時間をチェック
    if (now - lastTypeAnalysisTime < MIN_INTERVAL_BETWEEN_CALLS) {
      console.log('前回の分析からの間隔が短すぎます (タイプ分析)');
      // ローカル分析を使用
      const result = localTypeAnalysis(originalText);
      return result;
    }

    // APIを呼び出し
    try {
      lastTypeAnalysisTime = now;
      callHistory.push(now);

      if (isShortText) {
        console.log(`短いテキスト "${originalText}" を "${analyzableText}" に補完して分析します`);
      }

      const result = await GeminiService.classifyTaskType(analyzableText);

      // 結果をキャッシュ（元のテキストでキャッシュ）
      typeCache[cacheKey] = {
        result,
        timestamp: now,
      };

      return result;
    } catch (error) {
      console.error('タイプ分析中にエラーが発生しました:', error);
      return localTypeAnalysis(originalText);
    }
  },

  /**
   * タスク優先度を分析する - レート制限あり
   * @param taskText タスク内容
   * @returns 優先度分析結果
   */
  analyzeTaskPriority: async (taskText: string): Promise<PriorityAnalysis> => {
    // 入力チェック
    if (!taskText || taskText.trim().length === 0) {
      return {
        isPrioritized: false,
        importance: 5,
        urgency: 5,
        explanation: 'テキストが空のため、デフォルト値を使用します',
      };
    }

    const originalText = taskText.trim();
    const isShortText = originalText.length < MIN_TEXT_LENGTH_FOR_ANALYSIS;

    // 短いテキストの場合は補完する
    const analyzableText = isShortText ? expandShortText(originalText) : originalText;

    // キャッシュをチェック（元のテキストでキャッシュキーを作成）
    const cacheKey = originalText.toLowerCase();
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
      return TaskPriorityService.localPriorityAnalysis(originalText);
    }

    // 前回の分析からの経過時間をチェック
    if (now - lastPriorityAnalysisTime < MIN_INTERVAL_BETWEEN_CALLS) {
      console.log('前回の分析からの間隔が短すぎます (優先度分析)');
      // ローカル分析を使用
      return TaskPriorityService.localPriorityAnalysis(originalText);
    }

    // APIを呼び出し
    try {
      lastPriorityAnalysisTime = now;
      callHistory.push(now);

      if (isShortText) {
        console.log(`短いテキスト "${originalText}" を "${analyzableText}" に補完して分析します`);
      }

      const result = await TaskPriorityService.analyzePriority(analyzableText);

      // 結果をキャッシュ（元のテキストでキャッシュ）
      priorityCache[cacheKey] = {
        result,
        timestamp: now,
      };

      return result;
    } catch (error) {
      console.error('優先度分析中にエラーが発生しました:', error);
      return TaskPriorityService.localPriorityAnalysis(originalText);
    }
  },

  /**
   * 包括的なタスク分析を実行 - タイプと優先度の両方
   * @param taskText タスク内容
   * @returns タイプと優先度の分析結果
   */
  analyzeBoth: async (
    taskText: string
  ): Promise<{
    typeAnalysis: TaskClassification;
    priorityAnalysis: PriorityAnalysis;
  }> => {
    // 手動実行用の包括的分析 - Enter キーやボタンクリックで明示的に実行する場合に適している
    try {
      const typeAnalysis = await RateLimitedTaskAnalyzer.analyzeTaskType(taskText);

      // タイプ分析後、動的遅延時間で優先度分析を実行
      const delay1 = calculateApiDelay();
      await new Promise((resolve) => setTimeout(resolve, delay1));

      const priorityAnalysis = await RateLimitedTaskAnalyzer.analyzeTaskPriority(taskText);

      return {
        typeAnalysis,
        priorityAnalysis,
      };
    } catch (error) {
      console.error('包括的分析中にエラーが発生しました:', error);
      return {
        typeAnalysis: localTypeAnalysis(taskText),
        priorityAnalysis: TaskPriorityService.localPriorityAnalysis(taskText),
      };
    }
  },

  /**
   * タスクの詳細情報を分析する - レート制限あり
   * @param taskText タスク内容
   * @returns 詳細分析結果
   */
  analyzeTaskDetails: async (taskText: string): Promise<TaskDetailAnalysis> => {
    // 入力チェック
    if (!taskText || taskText.trim().length === 0) {
      return {
        description: '',
        category: 'その他',
        tags: [],
        estimatedDuration: 60,
        confidence: 0.1,
      };
    }

    const originalText = taskText.trim();
    const isShortText = originalText.length < MIN_TEXT_LENGTH_FOR_ANALYSIS;

    // 短いテキストの場合は補完する
    const analyzableText = isShortText ? expandShortText(originalText) : originalText;

    // キャッシュをチェック（元のテキストでキャッシュキーを作成）
    const cacheKey = originalText.toLowerCase();
    if (detailCache[cacheKey] && Date.now() - detailCache[cacheKey].timestamp < CACHE_TTL) {
      console.log('キャッシュから結果を返します (詳細分析)');
      return detailCache[cacheKey].result;
    }

    // レート制限をチェック
    const now = Date.now();

    // 最近の呼び出し履歴を更新
    const oneMinuteAgo = now - 60000;
    while (callHistory.length > 0 && callHistory[0] < oneMinuteAgo) {
      callHistory.shift();
    }

    // 1分あたりの最大呼び出し回数をチェック
    if (callHistory.length >= MAX_CALLS_PER_MINUTE) {
      console.log('1分あたりの最大呼び出し回数に達しました (詳細分析)');
      return localDetailAnalysis(originalText);
    }

    // 前回の分析からの経過時間をチェック
    if (now - lastDetailAnalysisTime < MIN_INTERVAL_BETWEEN_CALLS) {
      console.log('前回の分析からの間隔が短すぎます (詳細分析)');
      return localDetailAnalysis(originalText);
    }

    // APIを呼び出し
    try {
      lastDetailAnalysisTime = now;
      callHistory.push(now);

      if (isShortText) {
        console.log(`短いテキスト "${originalText}" を "${analyzableText}" に補完して分析します`);
      }

      const result = await GeminiService.analyzeTaskDetails(analyzableText);

      // 結果をキャッシュ（元のテキストでキャッシュ）
      detailCache[cacheKey] = {
        result,
        timestamp: now,
      };

      return result;
    } catch (error) {
      console.error('詳細分析中にエラーが発生しました:', error);
      return localDetailAnalysis(originalText);
    }
  },

  /**
   * 包括的なタスク分析を実行 - タイプ、優先度、詳細情報すべて
   * @param taskText タスク内容
   * @returns すべての分析結果
   */
  analyzeComplete: async (
    taskText: string
  ): Promise<{
    typeAnalysis: TaskClassification;
    priorityAnalysis: PriorityAnalysis;
    detailAnalysis: TaskDetailAnalysis;
  }> => {
    try {
      const typeAnalysis = await RateLimitedTaskAnalyzer.analyzeTaskType(taskText);

      const delay1 = calculateApiDelay();
      await new Promise((resolve) => setTimeout(resolve, delay1));

      const priorityAnalysis = await RateLimitedTaskAnalyzer.analyzeTaskPriority(taskText);

      const delay2 = calculateApiDelay();
      await new Promise((resolve) => setTimeout(resolve, delay2));

      const detailAnalysis = await RateLimitedTaskAnalyzer.analyzeTaskDetails(taskText);

      return {
        typeAnalysis,
        priorityAnalysis,
        detailAnalysis,
      };
    } catch (error) {
      console.error('包括的分析中にエラーが発生しました:', error);
      return {
        typeAnalysis: localTypeAnalysis(taskText),
        priorityAnalysis: TaskPriorityService.localPriorityAnalysis(taskText),
        detailAnalysis: localDetailAnalysis(taskText),
      };
    }
  },
};

// ローカルでのタイプ分析 (フォールバック用と短いテキスト用)
function localTypeAnalysis(taskText: string): TaskClassification {
  const lowerText = taskText.toLowerCase().trim();

  // インプット関連のキーワード
  const inputKeywords = [
    '読む',
    '見る',
    '聴く',
    '学ぶ',
    '勉強',
    '情報収集',
    'チェック',
    'インプット',
    '確認',
    'リサーチ',
    '参考',
    '調査',
  ];

  // アウトプット関連のキーワード
  const outputKeywords = [
    '書く',
    '作る',
    '実践',
    '実行',
    '発表',
    '作成',
    '構築',
    '開発',
    'コーディング',
    'アウトプット',
    '教える',
    'シェア',
    '投稿',
  ];

  // キーワードマッチの数をカウント
  let inputScore = 0;
  let outputScore = 0;

  inputKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) inputScore++;
  });

  outputKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) outputScore++;
  });

  // スコアに基づいて分類
  if (inputScore > outputScore) {
    return {
      type: 'input' as const,
      confidence: 0.7,
      explanation: 'インプット関連のキーワードが検出されました（ローカル分析）',
    };
  } else if (outputScore > inputScore) {
    return {
      type: 'output' as const,
      confidence: 0.7,
      explanation: 'アウトプット関連のキーワードが検出されました（ローカル分析）',
    };
  } else {
    // スコアが同じ場合は単語の分析
    if (lowerText.includes('AI') || lowerText.includes('ビール')) {
      return {
        type: 'output' as const,
        confidence: 0.6,
        explanation: 'アウトプット傾向のタスクと判断しました（ローカル分析）',
      };
    } else {
      return {
        type: 'input' as const,
        confidence: 0.5,
        explanation: 'タスク種別を判別できないため、デフォルト設定しました（ローカル分析）',
      };
    }
  }
}

// ローカルでの詳細分析 (フォールバック用と短いテキスト用)
function localDetailAnalysis(taskText: string): TaskDetailAnalysis {
  const lowerText = taskText.toLowerCase().trim();

  // 短いテキストのマッピングをチェック
  const shortMapping =
    lowerText in SHORT_TEXT_MAPPINGS
      ? SHORT_TEXT_MAPPINGS[lowerText as keyof typeof SHORT_TEXT_MAPPINGS]
      : undefined;
  let expandedText = taskText;
  let baseCategory = 'その他';

  if (shortMapping) {
    expandedText = shortMapping.expanded;
    baseCategory = shortMapping.category;
  }

  // カテゴリの推測
  let category = baseCategory;
  if (
    lowerText.includes('仕事') ||
    lowerText.includes('会議') ||
    lowerText.includes('開発') ||
    lowerText.includes('work') ||
    lowerText.includes('job') ||
    lowerText.includes('task')
  ) {
    category = '仕事';
  } else if (
    lowerText.includes('勉強') ||
    lowerText.includes('学習') ||
    lowerText.includes('読書') ||
    lowerText.includes('study') ||
    lowerText.includes('learn') ||
    lowerText.includes('book')
  ) {
    category = '学習';
  } else if (
    lowerText.includes('運動') ||
    lowerText.includes('ジム') ||
    lowerText.includes('ランニング') ||
    lowerText.includes('gym') ||
    lowerText.includes('run') ||
    lowerText.includes('exercise')
  ) {
    category = '健康';
  }

  // タグの抽出（短いテキストからも推測）
  const tags: string[] = [];

  // プログラミング関連
  if (
    lowerText.includes('プログラミング') ||
    lowerText.includes('コーディング') ||
    lowerText.includes('code') ||
    lowerText.includes('dev') ||
    lowerText.includes('開発')
  ) {
    tags.push('プログラミング');
  }

  // 技術スタック
  if (lowerText.includes('react')) tags.push('React');
  if (lowerText.includes('vue')) tags.push('Vue');
  if (lowerText.includes('node') || lowerText.includes('nodejs')) tags.push('Node.js');
  if (lowerText.includes('python') || lowerText.includes('py')) tags.push('Python');
  if (lowerText.includes('js') || lowerText.includes('javascript')) tags.push('JavaScript');
  if (lowerText.includes('ts') || lowerText.includes('typescript')) tags.push('TypeScript');

  // AI関連
  if (lowerText.includes('ai') || lowerText.includes('人工知能') || lowerText.includes('ml')) {
    tags.push('AI');
  }

  // 短いキーワードから推測
  if (lowerText === 'mtg' || lowerText.includes('会議')) tags.push('ミーティング');
  if (lowerText === 'doc' || lowerText.includes('文書')) tags.push('ドキュメント');
  if (lowerText === 'pr' || lowerText.includes('pull')) tags.push('レビュー');

  // 推定時間（短いテキストでも文脈から推測）
  let estimatedDuration = 60;

  if (
    lowerText.includes('簡単') ||
    lowerText.includes('クイック') ||
    lowerText.includes('quick') ||
    lowerText.includes('simple') ||
    lowerText.length < 5
  ) {
    estimatedDuration = 30;
  } else if (
    lowerText.includes('大規模') ||
    lowerText.includes('詳細') ||
    lowerText.includes('complex') ||
    lowerText.includes('detailed')
  ) {
    estimatedDuration = 180;
  } else if (
    lowerText.includes('mtg') ||
    lowerText.includes('会議') ||
    lowerText.includes('meeting')
  ) {
    estimatedDuration = 60;
  } else if (
    lowerText.includes('dev') ||
    lowerText.includes('開発') ||
    lowerText.includes('実装')
  ) {
    estimatedDuration = 120;
  }

  // 説明文の生成
  let description = expandedText;
  if (shortMapping) {
    description = `${expandedText}を行う`;
  } else if (lowerText.length < 8) {
    // 短いテキストの場合は補完
    if (lowerText.endsWith('る') || lowerText.endsWith('う')) {
      description = `${taskText}タスクを実行する`;
    } else {
      description = `${taskText}に関する作業を行う`;
    }
  } else {
    description = `${taskText}を実行する`;
  }

  return {
    description,
    category,
    tags,
    estimatedDuration,
    confidence: lowerText.length < 8 ? 0.5 : 0.3,
  };
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
