// src/services/GeminiService.ts
import axios from 'axios';

// 環境変数を安全に取得するユーティリティ関数
const getEnvVar = (key: string): string | undefined => {
  // Jest環境ではprocess.envを優先
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }

  // Vite環境でのimport.meta.env（安全にアクセス）
  try {
    if (typeof globalThis !== 'undefined' && (globalThis as any).import?.meta?.env) {
      return (globalThis as any).import.meta.env[key];
    }
  } catch (e) {
    // import.metaが利用できない場合は無視
  }

  return undefined;
};

// Gemini APIの最新エンドポイントとAPIキー
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_KEY = getEnvVar('VITE_GEMINI_API_KEY') || getEnvVar('GEMINI_API_KEY') || '';

// タスクのタイプを分類するためのインターフェース
export interface TaskClassification {
  type: 'input' | 'output';
  confidence: number;
  explanation: string;
}

// タスクの詳細分析結果のインターフェースを拡張
export interface TaskDetailAnalysis {
  description: string;
  category: string;
  tags: string[];
  estimatedDuration: number; // 分単位
  deadline?: string; // ISO日付形式
  confidence: number;
  // 新しく追加
  improvedTitle?: string; // より具体的なタスクタイトル
  subtasks?: SubTask[]; // 子タスクのリスト
  actionItems?: string[]; // 具体的なアクションアイテム
}

// 子タスクの定義
export interface SubTask {
  title: string;
  type: 'input' | 'output';
  estimatedDuration: number;
  description?: string;
}

/**
 * Gemini APIを使用してタスクのタイプを分類するサービス
 */
export const GeminiService = {
  /**
   * タスクテキストを分析し、インプットかアウトプットかを判断する
   * @param taskText タスク内容のテキスト
   * @returns タスクの分類結果
   */
  classifyTaskType: async (taskText: string): Promise<TaskClassification> => {
    try {
      console.log('Gemini APIを呼び出しています...');
      console.log('API_KEY:', API_KEY); // デバッグ用（本番では削除推奨）
      console.log('タスク内容:', taskText);

      // APIキーがない場合はフォールバック
      if (!API_KEY) {
        console.warn('APIキーが設定されていません。キーワードベースの分類を使用します。');
        return fallbackClassification(taskText);
      }

      const prompt = `
以下のタスクが「インプット」タイプか「アウトプット」タイプかを判断してください。

インプットタスクの例:
- 本を読む
- 動画を見る
- 記事を読む
- 講義を聴く
- 情報を収集する
- 勉強する

アウトプットタスクの例:
- 記事を書く
- 発表する
- プロジェクトを作成する
- コードを書く
- 教える
- 実践する

タスク: "${taskText}"

JSON形式で回答してください:
{
  "type": "input" または "output",
  "confidence": 0〜1の数値（確信度）,
  "explanation": "判断理由の簡潔な説明"
}`;

      // Gemini API v1に適合するリクエスト形式
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('API応答:', response.data);

      // Geminiからの応答を解析
      const generatedText = response.data.candidates[0].content.parts[0].text;

      // JSON部分を抽出して解析
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonResponse = JSON.parse(jsonMatch[0]);
        return {
          type: jsonResponse.type as 'input' | 'output',
          confidence: jsonResponse.confidence,
          explanation: jsonResponse.explanation,
        };
      }

      // JSONが見つからない場合のデフォルト値
      return {
        type: 'input',
        confidence: 0.5,
        explanation: 'タスク内容からタイプを判断できませんでした。',
      };
    } catch (error) {
      console.error('Gemini API呼び出し中にエラーが発生しました:', error);

      // エラーの詳細をログ出力
      if (axios.isAxiosError(error)) {
        console.error('リクエスト詳細:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
      }

      // エラー時はキーワードベースの分類を使用
      return fallbackClassification(taskText);
    }
  },

  /**
   * タスクテキストから詳細情報を分析する（拡張版）
   * @param taskText タスク内容のテキスト
   * @returns タスクの詳細分析結果
   */
  analyzeTaskDetails: async (taskText: string): Promise<TaskDetailAnalysis> => {
    try {
      console.log('Gemini APIで詳細分析を実行しています...');

      if (!API_KEY) {
        console.warn('APIキーが設定されていません。デフォルト値を使用します。');
        return fallbackDetailAnalysis(taskText);
      }

      const prompt = `
以下のタスクタイトルから、タスクの詳細情報を分析してください。
特に、タスクが抽象的な場合は、より具体的な内容に落とし込んでください。

タスク: "${taskText}"

以下の項目を推測して、JSON形式で回答してください：
1. description: タスクの詳細な説明（100文字以内）
2. category: タスクのカテゴリ（例: "仕事", "個人", "学習", "健康", "家事", "趣味", "その他"）
3. tags: 関連するタグの配列（最大5個）
4. estimatedDuration: 推定所要時間（分単位）
5. deadline: 期限が推測できる場合のみ、ISO日付形式
6. confidence: 分析の確信度（0〜1）
7. improvedTitle: タスクが抽象的な場合、より具体的で実行可能なタイトルに改善したもの
8. subtasks: タスクを分解した場合の子タスクリスト（必要な場合のみ）
   - 各子タスクには title, type ("input" or "output"), estimatedDuration, description を含む
9. actionItems: 具体的なアクションアイテムのリスト（最大5個）

特に重要な点：
- タスクが「プロジェクトを進める」のような抽象的なものの場合、具体的なステップに分解してください
- 「調査する」「検討する」のような曖昧な動詞は、より具体的な行動に置き換えてください
- 子タスクは実行可能で測定可能なものにしてください

JSON形式の例:
{
  "description": "ReactのTodoアプリにAI分析機能を実装し、タスクの自動分類を可能にする",
  "category": "仕事",
  "tags": ["プログラミング", "React", "AI", "開発"],
  "estimatedDuration": 240,
  "deadline": null,
  "confidence": 0.8,
  "improvedTitle": "TodoアプリにGemini APIを統合してタスク自動分類機能を実装する",
  "subtasks": [
    {
      "title": "Gemini APIのドキュメントを読んで理解する",
      "type": "input",
      "estimatedDuration": 30,
      "description": "API仕様とベストプラクティスを確認"
    },
    {
      "title": "API認証とサービスクラスを実装する",
      "type": "output",
      "estimatedDuration": 60,
      "description": "GeminiServiceクラスの作成"
    },
    {
      "title": "タスク分析UIコンポーネントを作成する",
      "type": "output",
      "estimatedDuration": 90,
      "description": "分析結果を表示するReactコンポーネント"
    },
    {
      "title": "統合テストを実行する",
      "type": "output",
      "estimatedDuration": 60,
      "description": "機能の動作確認とデバッグ"
    }
  ],
  "actionItems": [
    "Gemini APIキーを取得する",
    "axios で API クライアントをセットアップする",
    "タスク分析のプロンプトを設計する",
    "分析結果をReduxストアに保存する処理を追加",
    "エラーハンドリングとフォールバック処理を実装"
  ]
}`;

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048, // より長い応答を許可
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const generatedText = response.data.candidates[0].content.parts[0].text;
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonResponse = JSON.parse(jsonMatch[0]);
        return {
          description: jsonResponse.description || '',
          category: jsonResponse.category || 'その他',
          tags: Array.isArray(jsonResponse.tags) ? jsonResponse.tags : [],
          estimatedDuration: jsonResponse.estimatedDuration || 60,
          deadline: jsonResponse.deadline || undefined,
          confidence: jsonResponse.confidence || 0.5,
          improvedTitle: jsonResponse.improvedTitle,
          subtasks: Array.isArray(jsonResponse.subtasks) ? jsonResponse.subtasks : undefined,
          actionItems: Array.isArray(jsonResponse.actionItems)
            ? jsonResponse.actionItems
            : undefined,
        };
      }

      return fallbackDetailAnalysis(taskText);
    } catch (error) {
      console.error('Gemini API詳細分析中にエラーが発生しました:', error);
      return fallbackDetailAnalysis(taskText);
    }
  },
};

// キーワードベースの簡易分類（APIが利用できない場合のフォールバック）
function fallbackClassification(taskText: string): TaskClassification {
  console.log('フォールバック分類を使用します');

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
    if (taskText.includes(keyword)) inputScore++;
  });

  outputKeywords.forEach((keyword) => {
    if (taskText.includes(keyword)) outputScore++;
  });

  // スコアに基づいて分類
  if (inputScore > outputScore) {
    return {
      type: 'input',
      confidence: 0.7,
      explanation: 'インプット関連のキーワードが検出されました（ローカル分析）',
    };
  } else if (outputScore > inputScore) {
    return {
      type: 'output',
      confidence: 0.7,
      explanation: 'アウトプット関連のキーワードが検出されました（ローカル分析）',
    };
  } else {
    // スコアが同じ場合は単語の分析
    if (taskText.includes('AI') || taskText.includes('ビール')) {
      return {
        type: 'output',
        confidence: 0.6,
        explanation: 'アウトプット傾向のタスクと判断しました（ローカル分析）',
      };
    } else {
      return {
        type: 'input',
        confidence: 0.5,
        explanation: 'タスク種別を判別できないため、デフォルト設定しました（ローカル分析）',
      };
    }
  }
}

// フォールバック関数も更新
function fallbackDetailAnalysis(taskText: string): TaskDetailAnalysis {
  const lowerText = taskText.toLowerCase();

  // カテゴリの推測
  let category = 'その他';
  if (lowerText.includes('仕事') || lowerText.includes('会議') || lowerText.includes('開発')) {
    category = '仕事';
  } else if (
    lowerText.includes('勉強') ||
    lowerText.includes('学習') ||
    lowerText.includes('読書')
  ) {
    category = '学習';
  } else if (
    lowerText.includes('運動') ||
    lowerText.includes('ジム') ||
    lowerText.includes('ランニング')
  ) {
    category = '健康';
  }

  // タグの抽出
  const tags: string[] = [];
  if (lowerText.includes('プログラミング') || lowerText.includes('コーディング'))
    tags.push('プログラミング');
  if (lowerText.includes('react')) tags.push('React');
  if (lowerText.includes('ai') || lowerText.includes('人工知能')) tags.push('AI');

  // 推定時間
  let estimatedDuration = 60;
  if (lowerText.includes('簡単') || lowerText.includes('クイック')) {
    estimatedDuration = 30;
  } else if (lowerText.includes('大規模') || lowerText.includes('詳細')) {
    estimatedDuration = 180;
  }

  // 抽象的なタスクの判定と改善
  let improvedTitle: string | undefined;
  let subtasks: SubTask[] | undefined;
  let actionItems: string[] | undefined;

  // 抽象的なキーワードのチェック
  const abstractKeywords = ['進める', '検討', '調査', '確認', '対応', '処理', '改善', '最適化'];
  const isAbstract = abstractKeywords.some((keyword) => lowerText.includes(keyword));

  if (isAbstract) {
    // 簡単な改善を試みる
    if (lowerText.includes('プロジェクト') && lowerText.includes('進める')) {
      improvedTitle = taskText.replace('進める', 'の次のマイルストーンを完了する');
      subtasks = [
        {
          title: '現在の進捗状況を確認する',
          type: 'input',
          estimatedDuration: 15,
        },
        {
          title: '次のステップをリストアップする',
          type: 'output',
          estimatedDuration: 30,
        },
        {
          title: '必要なリソースを準備する',
          type: 'output',
          estimatedDuration: 45,
        },
      ];
    } else if (lowerText.includes('調査')) {
      improvedTitle = taskText.replace('調査', 'について情報収集し、レポートにまとめる');
      subtasks = [
        {
          title: '関連資料を収集する',
          type: 'input',
          estimatedDuration: 30,
        },
        {
          title: '重要なポイントをまとめる',
          type: 'output',
          estimatedDuration: 30,
        },
      ];
    }
  }

  return {
    description: `${taskText}を実行する`,
    category,
    tags,
    estimatedDuration,
    confidence: 0.3,
    improvedTitle,
    subtasks,
    actionItems,
  };
}

export default GeminiService;
