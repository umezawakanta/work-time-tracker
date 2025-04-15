// src/services/TaskPriorityService.ts
import axios from 'axios';

// Gemini APIエンドポイントとAPIキー
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

// 優先度の分析結果インターフェース
export interface PriorityAnalysis {
    isPrioritized: boolean;      // 優先タスクかどうか
    importance: number;          // 重要度 (1-10)
    urgency: number;             // 緊急度 (1-10)
    explanation: string;         // 分析理由
    suggestedDeadline?: string;  // 提案される期限（任意）
}

/**
 * Gemini APIを使用してタスクの優先度を分析するサービス
 */
export const TaskPriorityService = {
    /**
     * タスクの内容から優先度を分析する
     * @param taskText タスク内容のテキスト
     * @returns 優先度の分析結果
     */
    analyzePriority: async (taskText: string): Promise<PriorityAnalysis> => {
        try {
            console.log('タスクの優先度分析を開始します');

            // APIキーがない場合はフォールバック
            if (!API_KEY) {
                console.warn('APIキーが設定されていません。ローカル分析を使用します。');
                return localPriorityAnalysis(taskText);
            }

            const prompt = 
                "あなたはタスク管理の専門家です。以下のタスクの重要度と緊急度を分析し、優先すべきかどうかを判断してください。\n\n" +
                `タスク: "${taskText}"\n\n` +
                "以下の点を考慮して分析してください：\n" +
                "1. 重要度：タスクの価値や影響度（1-10のスケール）\n" +
                "2. 緊急度：タスクの時間的制約（1-10のスケール）\n" +
                "3. このタスクを優先的に行うべきかどうか\n" +
                "4. 適切なデッドラインがあれば提案する\n\n" +
                "次の形式のJSONで回答してください：\n" +
                "{\n" +
                '  "isPrioritized": true または false,\n' +
                '  "importance": 重要度を表す1-10の数値,\n' +
                '  "urgency": 緊急度を表す1-10の数値,\n' +
                '  "explanation": "分析理由の簡潔な説明",\n' +
                '  "suggestedDeadline": "YYYY-MM-DD形式の提案される期限（任意）"\n' +
                "}\n\n" +
                "JSONのみを返してください。余分なテキストや説明は含めないでください。コードブロックも使用しないでください。";

            // Gemini APIリクエスト
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
                        temperature: 0.1, // より決定論的な応答
                        maxOutputTokens: 1024
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('優先度分析のAPI応答を受信');

            // Geminiからの応答を解析
            const generatedText = response.data.candidates[0].content.parts[0].text;

            // コードブロックとマークダウン記法に対応したJSON抽出処理
            try {
                // マークダウンコードブロックを取り除く
                let cleanedText = generatedText.trim();
                // ```json や ``` のコードブロック記法を削除
                cleanedText = cleanedText.replace(/^```(json)?\s*/, '');
                cleanedText = cleanedText.replace(/\s*```$/, '');
                
                // JSONをパース
                const jsonResponse = JSON.parse(cleanedText);
                return {
                    isPrioritized: !!jsonResponse.isPrioritized,
                    importance: Number(jsonResponse.importance) || 5,
                    urgency: Number(jsonResponse.urgency) || 5,
                    explanation: jsonResponse.explanation || '優先度を分析しました',
                    suggestedDeadline: jsonResponse.suggestedDeadline
                };
            } catch (error) {
                console.error('JSON解析エラー:', error);
                console.log('元のテキスト:', generatedText);
                
                // コードブロックのパターンに対応した正規表現
                const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
                const jsonMatch = generatedText.match(jsonBlockRegex);
                
                if (jsonMatch && jsonMatch[1]) {
                    try {
                        const extractedJson = jsonMatch[1];
                        const jsonResponse = JSON.parse(extractedJson);
                        return {
                            isPrioritized: !!jsonResponse.isPrioritized,
                            importance: Number(jsonResponse.importance) || 5,
                            urgency: Number(jsonResponse.urgency) || 5,
                            explanation: jsonResponse.explanation || '優先度を分析しました',
                            suggestedDeadline: jsonResponse.suggestedDeadline
                        };
                    } catch (nestedError) {
                        console.error('コードブロック抽出からのJSON解析に失敗:', nestedError);
                    }
                }
                
                // 従来の正規表現による抽出方法も維持
                const jsonRegex = /\{[\s\S]*\}/;
                const match = generatedText.match(jsonRegex);
                
                if (match) {
                    try {
                        const extractedJson = match[0];
                        const jsonResponse = JSON.parse(extractedJson);
                        return {
                            isPrioritized: !!jsonResponse.isPrioritized,
                            importance: Number(jsonResponse.importance) || 5,
                            urgency: Number(jsonResponse.urgency) || 5,
                            explanation: jsonResponse.explanation || '優先度を分析しました',
                            suggestedDeadline: jsonResponse.suggestedDeadline
                        };
                    } catch (nestedError) {
                        console.error('JSON抽出に失敗しました:', nestedError);
                        console.log('生のテキスト:', generatedText);
                    }
                }
                
                // 手動解析を試みる
                console.log('正規表現でのJSON抽出に失敗、手動解析を試みます');
                return manualJsonParsing(generatedText);
            }
        } catch (error) {
            console.error('タスク優先度分析中にエラーが発生しました:', error);

            // エラーの詳細をログ出力
            if (axios.isAxiosError(error)) {
                console.error('リクエスト詳細:', {
                    url: error.config?.url,
                    method: error.config?.method,
                    status: error.response?.status,
                    statusText: error.response?.statusText
                });
            }

            // エラー時はローカル分析を使用
            console.log('フォールバック分析を使用します');
            return localPriorityAnalysis(taskText);
        }
    },

    // TaskPriorityService オブジェクトにローカル分析メソッドを公開
    localPriorityAnalysis
};

// 手動でJSONの値を抽出する関数
function manualJsonParsing(text: string): PriorityAnalysis {
    console.log('手動パース処理を開始します');
    let isPrioritized = false;
    let importance = 5;
    let urgency = 5;
    let explanation = 'タスク分析結果（手動抽出）';
    let suggestedDeadline: string | undefined = undefined;

    // ブール値の抽出
    if (/isPrioritized["']?\s*:\s*true/.test(text)) {
        isPrioritized = true;
    }

    // 数値の抽出
    const importanceMatch = text.match(/importance["']?\s*:\s*(\d+)/);
    if (importanceMatch) {
        importance = parseInt(importanceMatch[1], 10);
    }

    const urgencyMatch = text.match(/urgency["']?\s*:\s*(\d+)/);
    if (urgencyMatch) {
        urgency = parseInt(urgencyMatch[1], 10);
    }

    // 文字列の抽出
    const explanationMatch = text.match(/explanation["']?\s*:\s*["']([^"']+)["']/);
    if (explanationMatch) {
        explanation = explanationMatch[1];
    }

    const deadlineMatch = text.match(/suggestedDeadline["']?\s*:\s*["']([^"']+)["']/);
    if (deadlineMatch) {
        suggestedDeadline = deadlineMatch[1];
    }

    return {
        isPrioritized,
        importance,
        urgency,
        explanation,
        suggestedDeadline
    };
}

// ローカルでの優先度分析（APIが利用できない場合のフォールバック）
export function localPriorityAnalysis(taskText: string): PriorityAnalysis {
    const lowerText = taskText.toLowerCase();

    // 高優先度を示すキーワード
    const highPriorityKeywords = [
        '緊急', '重要', '期限', 'すぐに', '今日中', '明日まで', '今週中',
        'deadline', '締め切り', '提出', '納期', '急ぎ', 'asap', '重大', '必須',
        '会議', 'ミーティング', 'プレゼン', '発表', 'リリース', '公開', '納品'
    ];

    // 重要度を示すキーワード
    const importanceKeywords = [
        '重要', '必須', '主要', '不可欠', '優先', '中心的', '基幹', 'コア',
        '基本', '基礎', '戦略', '計画', '要', '大事', '肝心', '本質', '根本'
    ];

    // 緊急度を示すキーワード
    const urgencyKeywords = [
        '緊急', 'すぐに', '今日中', '明日まで', '今週中', '早急', '即時',
        '直ちに', '速やかに', '急ぎ', 'asap', '今すぐ', '期限', '締切'
    ];

    // スコア計算
    let priorityScore = 0;
    let importanceScore = 5; // デフォルト値
    let urgencyScore = 5;    // デフォルト値

    // 優先度スコア計算
    highPriorityKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) priorityScore += 2;
    });

    // 重要度スコア計算
    importanceKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) importanceScore += 1;
    });

    // 緊急度スコア計算
    urgencyKeywords.forEach(keyword => {
        if (lowerText.includes(keyword)) urgencyScore += 1;
    });

    // スコアの上限を10に制限
    importanceScore = Math.min(importanceScore, 10);
    urgencyScore = Math.min(urgencyScore, 10);

    // 特定のフレーズに基づく分析
    if (lowerText.includes('納期') || lowerText.includes('締め切り') || lowerText.includes('deadline')) {
        urgencyScore = Math.max(urgencyScore, 8);
    }

    if (lowerText.includes('発表') || lowerText.includes('プレゼン') || lowerText.includes('公開')) {
        importanceScore = Math.max(importanceScore, 8);
        urgencyScore = Math.max(urgencyScore, 7);
    }

    // AIやプログラミング関連のタスクは重要度高め
    if (lowerText.includes('ai') || lowerText.includes('連携') || lowerText.includes('開発') ||
        lowerText.includes('コード') || lowerText.includes('プログラム')) {
        importanceScore = Math.max(importanceScore, 7);
    }

    // 期限の推測（簡易版）
    let suggestedDeadline: string | undefined = undefined;

    const today = new Date();

    if (urgencyScore >= 9) {
        // 今日の日付を設定
        suggestedDeadline = today.toISOString().split('T')[0];
    } else if (urgencyScore >= 7) {
        // 明日の日付を設定
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        suggestedDeadline = tomorrow.toISOString().split('T')[0];
    } else if (urgencyScore >= 5) {
        // 3日後を設定
        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(today.getDate() + 3);
        suggestedDeadline = threeDaysLater.toISOString().split('T')[0];
    }

    // 総合判断
    const isPrioritized = (importanceScore + urgencyScore) > 14 || priorityScore >= 4;

    // 分析理由の生成
    let explanation = '';
    if (isPrioritized) {
        if (importanceScore > 7 && urgencyScore > 7) {
            explanation = '重要度と緊急度が共に高いため、優先的に取り組むべきタスクです（ローカル分析）';
        } else if (importanceScore > 7) {
            explanation = '重要度が高いタスクのため、優先的に取り組むことをお勧めします（ローカル分析）';
        } else if (urgencyScore > 7) {
            explanation = '緊急度が高いタスクのため、早めに取り組むことをお勧めします（ローカル分析）';
        } else {
            explanation = '優先すべき特徴が見つかったため、重点的に取り組むことをお勧めします（ローカル分析）';
        }
    } else {
        explanation = '優先度は標準的なタスクと判断しました（ローカル分析）';
    }

    return {
        isPrioritized,
        importance: importanceScore,
        urgency: urgencyScore,
        explanation,
        suggestedDeadline
    };
}

export default TaskPriorityService;