// src/services/GeminiService.ts
import axios from 'axios';

// Gemini APIの最新エンドポイントとAPIキー
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

// タスクのタイプを分類するためのインターフェース
export interface TaskClassification {
  type: 'input' | 'output';
  confidence: number;
  explanation: string;
}

// タスクの詳細分析結果のインターフェース
export interface TaskDetailAnalysis {
  description: string;
  category: string;
  tags: string[];
  estimatedDuration: number; // 分単位
  deadline?: string; // ISO日付形式
  confidence: number;
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
   * タスクテキストから詳細情報を分析する
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

タスク: "${taskText}"

以下の項目を推測して、JSON形式で回答してください：
1. description: タスクの詳細な説明（100文字以内）
2. category: タスクのカテゴリ（例: "仕事", "個人", "学習", "健康", "家事", "趣味", "その他"）
3. tags: 関連するタグの配列（最大5個、例: ["プログラミング", "React", "開発"]）
4. estimatedDuration: 推定所要時間（分単位、例: 60）
5. deadline: 期限が推測できる場合のみ、ISO日付形式（例: "2024-12-31T23:59:59"）。推測できない場合はnull
6. confidence: 分析の確信度（0〜1）

JSON形式の例:
{
  "description": "ReactのTodoアプリにAI分析機能を実装し、タスクの自動分類を可能にする",
  "category": "仕事",
  "tags": ["プログラミング", "React", "AI", "開発"],
  "estimatedDuration": 120,
  "deadline": null,
  "confidence": 0.8
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
            maxOutputTokens: 1024,
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

// 詳細分析のフォールバック実装
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

  return {
    description: `${taskText}を実行する`,
    category,
    tags,
    estimatedDuration,
    confidence: 0.3,
  };
}

export default GeminiService;
