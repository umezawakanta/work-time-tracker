import { ENV } from '@/utils/env';
import AIHistoryService from './AIHistoryService';
import { GeminiGenerateContentResponse } from '@/types/ai';

export interface BlogAnalysisResult {
  improvedTitle?: string;
  suggestedTags: string[];
  contentSuggestions: string[];
  seoRecommendations: string[];
  readabilityScore: number;
  categoryRecommendation: string;
  confidence: number;
}

export interface BlogContentAnalysis {
  wordCount: number;
  readingTimeMinutes: number;
  keyTopics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  targetAudience: string;
}

export const BlogAiService = {
  // Narrower checker for sentiment field
  _isSentiment(value: unknown): value is BlogContentAnalysis['sentiment'] {
    return value === 'positive' || value === 'neutral' || value === 'negative';
  },

  /**
   * ブログ投稿の内容を分析してAI提案を生成
   */
  analyzeBlogPost: async (
    title: string,
    content: string,
    category?: string
  ): Promise<BlogAnalysisResult> => {
    try {
      const prompt = `
以下のブログ投稿を分析して、改善提案を行ってください。

タイトル: "${title}"
カテゴリ: "${category || '未指定'}"
内容: "${content}"

以下の項目について分析し、JSON形式で回答してください：

1. improvedTitle: より魅力的で検索されやすいタイトルの改善案（必要な場合のみ）
2. suggestedTags: 関連する適切なタグを5-10個
3. contentSuggestions: 内容の改善提案（文章構成、読みやすさ、情報の追加など）
4. seoRecommendations: SEO改善の具体的な提案
5. readabilityScore: 読みやすさスコア（0-100）
6. categoryRecommendation: 最適なカテゴリの推奨
7. confidence: 分析の確信度（0-1）

分析の観点：
- 文章の構成と論理性
- 読者にとっての価値
- SEO最適化の可能性
- タグの関連性と検索性
- ターゲット読者の明確性

JSON形式:
{
  "improvedTitle": "改善されたタイトル（必要な場合）",
  "suggestedTags": ["タグ1", "タグ2", "タグ3", ...],
  "contentSuggestions": [
    "見出しを追加して構造を明確にしましょう",
    "具体例を追加すると理解しやすくなります",
    ...
  ],
  "seoRecommendations": [
    "キーワード密度を調整しましょう",
    "メタディスクリプションを最適化しましょう",
    ...
  ],
  "readabilityScore": 85,
  "categoryRecommendation": "技術",
  "confidence": 0.9
}`;

      const startedAt = Date.now();
      const apiKey1 = ENV.GEMINI_API_KEY();
      if (!apiKey1) {
        console.warn('Gemini API key missing (VITE_GEMINI_API_KEY). Using fallback analysis.');
        return BlogAiService.fallbackAnalysis(title, content);
      }
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey1}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
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
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      const data: GeminiGenerateContentResponse = await response.json();
      if (!response.ok) {
        console.warn('Gemini analyzeBlogPost non-OK:', response.status, data);
        return BlogAiService.fallbackAnalysis(title, content);
      }
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      try {
        await AIHistoryService.saveInteraction({
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          request: { prompt },
          response: { text: generatedText, raw: data },
          createdAt: startedAt,
          durationMs: Date.now() - startedAt,
          context: { feature: 'BlogAiService.analyzeBlogPost' },
        });
      } catch (e) {
        console.debug('AI history save (gemini analyzeBlogPost) skipped:', (e as Error).message);
      }
      const jsonMatch = generatedText ? generatedText.match(/\{[\s\S]*\}/) : null;

      if (jsonMatch) {
        const analysisResult = JSON.parse(jsonMatch[0]) as Partial<BlogAnalysisResult> &
          Record<string, unknown>;
        return {
          improvedTitle:
            typeof analysisResult.improvedTitle === 'string'
              ? analysisResult.improvedTitle
              : undefined,
          suggestedTags: Array.isArray(analysisResult.suggestedTags)
            ? analysisResult.suggestedTags
            : [],
          contentSuggestions: Array.isArray(analysisResult.contentSuggestions)
            ? analysisResult.contentSuggestions
            : [],
          seoRecommendations: Array.isArray(analysisResult.seoRecommendations)
            ? analysisResult.seoRecommendations
            : [],
          readabilityScore:
            typeof analysisResult.readabilityScore === 'number'
              ? analysisResult.readabilityScore
              : 50,
          categoryRecommendation:
            typeof analysisResult.categoryRecommendation === 'string'
              ? analysisResult.categoryRecommendation
              : 'その他',
          confidence:
            typeof analysisResult.confidence === 'number' ? analysisResult.confidence : 0.5,
        };
      }

      return BlogAiService.fallbackAnalysis(title, content);
    } catch (error) {
      console.error('Blog AI analysis error:', error);
      return BlogAiService.fallbackAnalysis(title, content);
    }
  },

  /**
   * 基本的な内容分析を実行
   */
  analyzeContent: async (content: string): Promise<BlogContentAnalysis> => {
    const wordCount = content.split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200); // 1分間200語と仮定

    try {
      const prompt = `
以下のブログ内容を分析してください：

"${content}"

以下をJSON形式で回答してください：
{
  "keyTopics": ["主要トピック1", "主要トピック2", ...],
  "sentiment": "positive" | "neutral" | "negative",
  "targetAudience": "想定読者層の説明"
}`;

      const startedAt = Date.now();
      const apiKey2 = ENV.GEMINI_API_KEY();
      if (!apiKey2) {
        console.warn('Gemini API key missing (VITE_GEMINI_API_KEY). Using simple content stats.');
        return {
          wordCount,
          readingTimeMinutes,
          keyTopics: [],
          sentiment: 'neutral',
          targetAudience: '一般読者',
        } as BlogContentAnalysis;
      }
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey2}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
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
          }),
        }
      );

      const data: GeminiGenerateContentResponse = await response.json();
      if (!response.ok) {
        console.warn('Gemini analyzeContent non-OK:', response.status, data);
        return {
          wordCount,
          readingTimeMinutes,
          keyTopics: [],
          sentiment: 'neutral',
          targetAudience: '一般読者',
        } as BlogContentAnalysis;
      }
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      try {
        await AIHistoryService.saveInteraction({
          provider: 'gemini',
          model: 'gemini-2.0-flash',
          request: { prompt },
          response: { text: generatedText, raw: data },
          createdAt: startedAt,
          durationMs: Date.now() - startedAt,
          context: { feature: 'BlogAiService.analyzeContent' },
        });
      } catch (e) {
        console.debug('AI history save (gemini analyzeContent) skipped:', (e as Error).message);
      }
      const jsonMatch = generatedText ? generatedText.match(/\{[\s\S]*\}/) : null;

      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]) as Partial<BlogContentAnalysis> &
          Record<string, unknown>;
        return {
          wordCount,
          readingTimeMinutes,
          keyTopics: Array.isArray(result.keyTopics) ? (result.keyTopics as string[]) : [],
          sentiment: BlogAiService._isSentiment(result.sentiment) ? result.sentiment : 'neutral',
          targetAudience:
            typeof result.targetAudience === 'string' ? result.targetAudience : '一般読者',
        };
      }
    } catch (error) {
      console.error('Content analysis error:', error);
    }

    return {
      wordCount,
      readingTimeMinutes,
      keyTopics: [],
      sentiment: 'neutral',
      targetAudience: '一般読者',
    };
  },

  /**
   * フォールバック分析（AI APIが利用できない場合）
   */
  fallbackAnalysis: (title: string, content: string): BlogAnalysisResult => {
    const wordCount = content.split(/\s+/).length;
    const basicTags: string[] = [];

    // 基本的なキーワード抽出
    const techKeywords = ['React', 'TypeScript', 'JavaScript', 'AI', 'プログラミング', 'Web開発'];
    const businessKeywords = ['マーケティング', 'ビジネス', '戦略', '分析', '改善'];
    const personalKeywords = ['ライフハック', '習慣', '健康', '読書', '学習'];

    [...techKeywords, ...businessKeywords, ...personalKeywords].forEach((keyword) => {
      if (title.includes(keyword) || content.includes(keyword)) {
        basicTags.push(keyword);
      }
    });

    return {
      suggestedTags: basicTags.slice(0, 8),
      contentSuggestions: [
        '見出しを追加して構造を明確にしてみましょう',
        '具体例や体験談を追加すると魅力的になります',
      ],
      seoRecommendations: [
        'タイトルにキーワードを含めましょう',
        '適切な見出し構造を使用しましょう',
      ],
      readabilityScore: Math.min(95, Math.max(30, 100 - wordCount / 50)),
      categoryRecommendation: BlogAiService.estimateCategory(title, content),
      confidence: 0.3,
    };
  },

  /**
   * カテゴリを推定
   */
  estimateCategory: (title: string, content: string): string => {
    const text = (title + ' ' + content).toLowerCase();

    if (text.includes('技術') || text.includes('プログラミング') || text.includes('開発')) {
      return '技術';
    } else if (text.includes('ビジネス') || text.includes('マーケティング')) {
      return 'ビジネス';
    } else if (text.includes('ライフ') || text.includes('習慣') || text.includes('健康')) {
      return 'ライフスタイル';
    }

    return 'その他';
  },
};
