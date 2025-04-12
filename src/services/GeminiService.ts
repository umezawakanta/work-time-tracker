// src/services/GeminiService.ts
import axios from 'axios';

// Gemini APIのエンドポイントとAPIキー
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const API_KEY = 'YOUR_GEMINI_API_KEY'; // 実際のAPIキーに置き換えてください

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
        }
      );

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
      // エラー時のデフォルト値
      return {
        type: 'input',
        confidence: 0.5,
        explanation: 'APIエラーが発生しました。手動で選択してください。'
      };
    }
  }
};

export default GeminiService;