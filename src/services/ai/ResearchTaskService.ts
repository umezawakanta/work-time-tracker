import { Task } from '@/types/implementation';
import { KnowledgeEntry } from '@/types/knowledge';
import AdvancedAIService from './AdvancedAIService';
import KnowledgeService from '../knowledge/KnowledgeService';

export interface ResearchExecutionResult {
  success: boolean;
  content: string;
  knowledgeEntries: KnowledgeEntry[];
  confidence: number;
  error?: string;
}

class ResearchTaskService {
  private aiService = AdvancedAIService;

  /**
   * タスクが調査系かどうかを判定
   */
  isResearchTask(task: Task): boolean {
    const researchPatterns = [
      /調査|リサーチ|研究/,
      /理解|学習|把握|とは何か/,
      /分析|検討|評価/,
      /まとめ|要約|整理/,
      /定義|説明/,
    ];

    const taskText = `${task.title} ${task.description}`.toLowerCase();
    const hasResearchTags = task.tags.some((tag) =>
      ['research', 'investigation', 'study', 'analysis'].includes(tag.toLowerCase())
    );

    return researchPatterns.some((pattern) => pattern.test(taskText)) || hasResearchTags;
  }

  /**
   * 調査タスクをAIで実行
   */
  async executeResearch(task: Task, userId: string): Promise<ResearchExecutionResult> {
    try {
      // 調査対象を抽出
      const searchTerm = this.extractSearchTerm(task);

      // AIプロンプトを構築
      const prompt = this.buildResearchPrompt(searchTerm, task);

      let aiResponse: string;

      try {
        if (!this.aiService.getCurrentProvider()) {
          aiResponse = this.generateLocalResearchResponse(searchTerm, task);
        } else {
          aiResponse = await this.callAIForResearch(prompt);
        }
      } catch (error) {
        console.error('AI調査エラー:', error);
        aiResponse = this.generateLocalResearchResponse(searchTerm, task);
      }

      // 調査結果をナレッジエントリーに変換
      const knowledgeEntries = this.parseResearchResponse(searchTerm, aiResponse, task.id);

      // ナレッジベースに保存
      await KnowledgeService.save(knowledgeEntries);

      return {
        success: true,
        content: aiResponse,
        knowledgeEntries,
        confidence: 0.85,
      };
    } catch (error) {
      console.error('調査実行エラー:', error);
      return {
        success: false,
        content: '',
        knowledgeEntries: [],
        confidence: 0,
        error: error instanceof Error ? error.message : '調査実行中にエラーが発生しました',
      };
    }
  }

  /**
   * 調査対象を抽出
   */
  private extractSearchTerm(task: Task): string {
    const title = task.title.toLowerCase();

    // 一般的なパターンから調査対象を抽出
    const patterns = [/(.+?)の調査/, /(.+?)について/, /(.+?)とは/, /(.+?)の理解/, /(.+?)の分析/];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // パターンマッチしない場合はタイトルを使用
    return task.title.replace(/調査|リサーチ|について|とは|分析|検討/g, '').trim();
  }

  /**
   * 調査用AIプロンプトを構築
   */
  private buildResearchPrompt(searchTerm: string, task: Task): string {
    return `
「${searchTerm}」について詳しく調査し、以下の形式で回答してください：

## 調査対象: ${searchTerm}
**タスクの詳細**: ${task.description}

### 1. 概要・定義
${searchTerm}の基本的な定義と概要を分かりやすく説明してください。

### 2. 主な特徴
${searchTerm}の重要な特徴や要素を箇条書きで説明してください。

### 3. 重要性・メリット
なぜ${searchTerm}が重要なのか、どのようなメリットがあるのかを説明してください。

### 4. 実践例・使用場面
${searchTerm}の具体的な実践例や使用される場面を説明してください。

### 5. 関連技術・用語
${searchTerm}に関連する重要な技術や用語を3-5個挙げて、簡潔に説明してください。

### 6. 注意点・制約事項
${searchTerm}を使用・実践する際の注意点や制約事項があれば説明してください。

---
この調査結果は、実装タスク「${task.title}」の参考資料として使用されます。
`;
  }

  /**
   * AIに調査を依頼
   */
  private async callAIForResearch(prompt: string): Promise<string> {
    try {
      // AdvancedAIServiceのメソッドを使用
      return await this.aiService.generateResponse(prompt);
    } catch (error) {
      throw new Error(`AI調査に失敗しました: ${error}`);
    }
  }

  /**
   * ローカル調査レスポンスを生成（フォールバック）
   */
  private generateLocalResearchResponse(searchTerm: string, task: Task): string {
    return `
## 調査対象: ${searchTerm}

### 1. 概要・定義
${searchTerm}は、${task.description || '指定されたタスク'}に関連する重要な概念です。

### 2. 主な特徴
- 基本的な機能と特性
- 実装における重要な要素
- 他の技術との関連性

### 3. 重要性・メリット
このタスクは以下の理由で重要です：
- プロジェクトの目標達成に必要
- 効率的な実装に寄与
- 品質向上に貢献

### 4. 実践例・使用場面
具体的な実装場面や使用方法について、さらなる調査が必要です。

### 5. 関連技術・用語
- 関連技術1
- 関連技術2
- 関連技術3

### 6. 注意点・制約事項
実装時には以下の点に注意が必要です：
- 技術的制約の確認
- パフォーマンスへの影響
- セキュリティ考慮事項

---
注意: この調査結果はローカル生成されました。より詳細な情報が必要な場合は、AIプロバイダーを設定してください。
`;
  }

  /**
   * 調査結果をナレッジエントリーに変換
   */
  private parseResearchResponse(term: string, response: string, taskId: string): KnowledgeEntry[] {
    const entries: KnowledgeEntry[] = [];
    const timestamp = new Date().toISOString();

    // メインの調査エントリー
    const mainEntry: KnowledgeEntry = {
      id: `knowledge-${Date.now()}`,
      term,
      definition: response,
      category: 'research',
      tags: this.extractTags(response, term),
      relatedTasks: [taskId],
      source: 'AI Research Task',
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: 'ai-research-service',
      metadata: {
        aiGenerated: true,
        confidence: 0.85,
      },
    };

    entries.push(mainEntry);

    // 関連用語を抽出して追加エントリーを作成
    const relatedTerms = this.extractRelatedTerms(response);
    for (const relatedTerm of relatedTerms) {
      if (relatedTerm.definition) {
        entries.push({
          id: `knowledge-${Date.now()}-${entries.length}`,
          term: relatedTerm.term,
          definition: relatedTerm.definition,
          category: 'research',
          tags: [term, ...relatedTerm.tags],
          relatedTasks: [taskId],
          source: 'AI Research Task (Related)',
          createdAt: timestamp,
          updatedAt: timestamp,
          createdBy: 'ai-research-service',
          metadata: {
            aiGenerated: true,
            confidence: 0.7,
            references: [mainEntry.id],
          },
        });
      }
    }

    return entries;
  }

  /**
   * レスポンスからタグを抽出
   */
  private extractTags(response: string, mainTerm: string): string[] {
    const tags = [mainTerm];

    // 技術系タグの抽出
    const techTerms = response.match(
      /React|Vue|Angular|JavaScript|TypeScript|Node\.js|Python|API|Database|UI|UX/gi
    );
    if (techTerms) {
      tags.push(...techTerms.map((term) => term.toLowerCase()));
    }

    // カテゴリータグの追加
    if (response.includes('フロントエンド') || response.includes('frontend')) tags.push('frontend');
    if (response.includes('バックエンド') || response.includes('backend')) tags.push('backend');
    if (response.includes('デザイン') || response.includes('design')) tags.push('design');
    if (response.includes('パフォーマンス') || response.includes('performance'))
      tags.push('performance');

    return Array.from(new Set(tags)).slice(0, 10); // 重複削除して上限10個
  }

  /**
   * 関連用語を抽出
   */
  private extractRelatedTerms(
    response: string
  ): Array<{ term: string; definition: string; tags: string[] }> {
    const relatedTerms: Array<{ term: string; definition: string; tags: string[] }> = [];

    // 関連技術・用語セクションから抽出
    const relatedSection = response.match(/### 5\. 関連技術・用語[\s\S]*?(?=###|$)/);
    if (relatedSection) {
      const lines = relatedSection[0].split('\n').filter((line) => line.trim().startsWith('-'));

      for (const line of lines) {
        const termMatch = line.match(/-\s*([^:：]+)[：:](.+)/);
        if (termMatch) {
          const term = termMatch[1].trim();
          const definition = termMatch[2].trim();
          relatedTerms.push({
            term,
            definition,
            tags: [term.toLowerCase(), 'related-term'],
          });
        }
      }
    }

    return relatedTerms.slice(0, 5); // 上限5個
  }
}

export default new ResearchTaskService();
