// src/services/GeminiService.ts
import axios from 'axios';

// Gemini APIの最新エンドポイントとAPIキー
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

// タスクのタイプを分類するためのインターフェース
export interface TaskClassification {
  type: 'input' | 'output';
  confidence: number;
  explanation: string;
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
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
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
          explanation: jsonResponse.explanation
        };
      }

      // JSONが見つからない場合のデフォルト値
      return {
        type: 'input',
        confidence: 0.5,
        explanation: 'タスク内容からタイプを判断できませんでした。'
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
          data: error.response?.data
        });
      }
      
      // エラー時はキーワードベースの分類を使用
      return fallbackClassification(taskText);
    }
  }
};

// キーワードベースの簡易分類（APIが利用できない場合のフォールバック）
function fallbackClassification(taskText: string): TaskClassification {
  console.log('フォールバック分類を使用します');
  
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
    if (taskText.includes(keyword)) inputScore++;
  });
  
  outputKeywords.forEach(keyword => {
    if (taskText.includes(keyword)) outputScore++;
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
    // スコアが同じ場合は単語の分析
    if (taskText.includes('AI') || taskText.includes('ビール')) {
      return {
        type: 'output',
        confidence: 0.6,
        explanation: 'アウトプット傾向のタスクと判断しました（ローカル分析）'
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

export default GeminiService;