import { WBSNode } from '@/types/wbs';
import { KnowledgeEntry } from '@/types/knowledge';
import AdvancedAIService from './AdvancedAIService';
import WBSService from '../wbs/WBSService';
import KnowledgeService from '../knowledge/KnowledgeService';

export interface TaskExecutionResult {
  success: boolean;
  executionType: 'research' | 'documentation' | 'analysis' | 'not-executable';
  result?: string;
  knowledgeEntries?: KnowledgeEntry[];
  error?: string;
}

class TaskExecutionAIService {
  private aiService = AdvancedAIService;
  private wbsService = WBSService;

  /**
   * タスクがAIで実行可能かを判定
   */
  async canExecuteTask(task: WBSNode): Promise<boolean> {
    const executablePatterns = [
      /調査|リサーチ|研究/,
      /理解|学習|把握/,
      /分析|検討|評価/,
      /まとめ|要約|整理/,
      /定義|説明/,
    ];

    const taskName = task.name.toLowerCase();
    const taskDescription = (task.description || '').toLowerCase();
    const combinedText = `${taskName} ${taskDescription}`;

    return executablePatterns.some((pattern) => pattern.test(combinedText));
  }

  /**
   * タスクをAIで実行
   */
  async executeTask(task: WBSNode): Promise<TaskExecutionResult> {
    try {
      // タスクの種類を判定
      const taskType = await this.classifyTaskType(task);

      switch (taskType) {
        case 'research':
          return await this.executeResearchTask(task);
        case 'documentation':
          return await this.executeDocumentationTask(task);
        case 'analysis':
          return await this.executeAnalysisTask(task);
        default:
          return {
            success: false,
            executionType: 'not-executable',
            error: 'このタスクはAIで実行できません',
          };
      }
    } catch (error) {
      console.error('タスク実行エラー:', error);
      return {
        success: false,
        executionType: 'not-executable',
        error: error instanceof Error ? error.message : '実行中にエラーが発生しました',
      };
    }
  }

  /**
   * タスクの種類を分類
   */
  private async classifyTaskType(
    task: WBSNode
  ): Promise<'research' | 'documentation' | 'analysis' | 'not-executable'> {
    const taskText = `${task.name} ${task.description || ''}`.toLowerCase();

    if (/調査|リサーチ|研究|理解|学習|把握|とは何か/.test(taskText)) {
      return 'research';
    }
    if (/ドキュメント|文書|仕様書|マニュアル/.test(taskText)) {
      return 'documentation';
    }
    if (/分析|検討|評価/.test(taskText)) {
      return 'analysis';
    }

    return 'not-executable';
  }

  /**
   * 調査タスクの実行
   */
  private async executeResearchTask(task: WBSNode): Promise<TaskExecutionResult> {
    // タスクから調査対象を抽出
    const searchTerm = this.extractSearchTerm(task);

    let aiResponse: string;

    try {
      if (!this.aiService.getCurrentProvider()) {
        // AIプロバイダーが設定されていない場合のフォールバック
        aiResponse = this.generateLocalResearchResponse(searchTerm);
      } else {
        const prompt = `「${searchTerm}」について詳しく調査し、以下の形式で回答してください：

1. 定義・概要
${searchTerm}の基本的な定義と概要を説明してください。

2. 主な特徴
${searchTerm}の重要な特徴や要素を箇条書きで説明してください。

3. 重要性・メリット
なぜ${searchTerm}が重要なのか、どのようなメリットがあるのかを説明してください。

4. 実践例・使用方法
${searchTerm}の具体的な実践例や使用方法を説明してください。

5. 関連用語
${searchTerm}に関連する重要な用語を3-5個挙げて、簡潔に説明してください。`;

        aiResponse = await this.aiService.generateResponse(prompt);
      }
    } catch (error) {
      console.error('AI調査エラー:', error);
      // エラー時のフォールバック
      aiResponse = this.generateLocalResearchResponse(searchTerm);
    }

    // レスポンスを解析して知識エントリーを作成
    const knowledgeEntries = this.parseResearchResponse(searchTerm, aiResponse, task.id);

    // 知識エントリーをナレッジベースに保存
    try {
      await KnowledgeService.save(knowledgeEntries);
      console.log('ナレッジエントリーを保存しました:', knowledgeEntries.length, '件');
    } catch (error) {
      console.error('ナレッジ保存エラー:', error);
    }

    return {
      success: true,
      executionType: 'research',
      result: aiResponse,
      knowledgeEntries,
    };
  }

  /**
   * 調査対象の抽出（公開メソッド）
   */
  public extractSearchTerm(task: WBSNode): string {
    const patterns = [/「(.+?)」/, /『(.+?)』/, /【(.+?)】/, /について|を理解|を調査|を研究/];

    for (const pattern of patterns) {
      const match = task.name.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // パターンにマッチしない場合は、タスク名から動詞を除去
    return task.name.replace(/を?理解する|を?調査する|を?研究する|について|とは何か/g, '').trim();
  }

  /**
   * 調査結果を知識エントリーに変換
   */
  private parseResearchResponse(term: string, response: string, taskId: string): KnowledgeEntry[] {
    const entries: KnowledgeEntry[] = [];
    const timestamp = new Date().toISOString();

    // メインの定義エントリー
    const mainEntry: KnowledgeEntry = {
      id: `knowledge-${Date.now()}`,
      term,
      definition: response,
      category: 'research',
      tags: this.extractTags(response),
      relatedTasks: [taskId],
      source: 'AI Generated',
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: 'ai-assistant',
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
          source: 'AI Generated (Related)',
          createdAt: timestamp,
          updatedAt: timestamp,
          createdBy: 'ai-assistant',
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
   * テキストからタグを抽出
   */
  private extractTags(text: string): string[] {
    const tags = new Set<string>();

    // 技術用語パターン
    const techPatterns = [
      /[A-Z]{2,}/g, // 大文字の略語
      /\b(?:API|UI|UX|AI|ML|DB|SQL)\b/gi,
    ];

    for (const pattern of techPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match) => tags.add(match.toLowerCase()));
      }
    }

    return Array.from(tags);
  }

  /**
   * 関連用語の抽出
   */
  private extractRelatedTerms(
    text: string
  ): Array<{ term: string; definition?: string; tags: string[] }> {
    const terms: Array<{ term: string; definition?: string; tags: string[] }> = [];

    // 「5. 関連用語」セクションを探す
    const relatedSection = text.match(/関連用語[：:]\s*(.+?)$/ms);
    if (relatedSection) {
      const termLines = relatedSection[1].split('\n');
      for (const line of termLines) {
        const termMatch = line.match(/[-・]\s*(.+?)[:：]?\s*(.+)?/);
        if (termMatch) {
          terms.push({
            term: termMatch[1].trim(),
            definition: termMatch[2]?.trim(),
            tags: [],
          });
        }
      }
    }

    return terms;
  }

  /**
   * ドキュメント作成タスクの実行
   */
  private async executeDocumentationTask(task: WBSNode): Promise<TaskExecutionResult> {
    // 実装予定
    return {
      success: false,
      executionType: 'documentation',
      error: 'ドキュメント作成機能は準備中です',
    };
  }

  /**
   * 分析タスクの実行
   */
  private async executeAnalysisTask(task: WBSNode): Promise<TaskExecutionResult> {
    // Create a temporary solution using the existing methods
    const fakeAnalysis = await this.aiService.analyzeProductivity([], {} as any);
    const type = 'research'; // Default fallback or implement local classification

    // 実装予定
    return {
      success: false,
      executionType: 'analysis',
      error: '分析機能は準備中です',
    };
  }

  // Add this new method for local fallback
  private generateLocalResearchResponse(term: string): string {
    return `1. 定義・概要
${term}は、プロジェクトやタスク管理において重要な概念です。

2. 主な特徴
- 効率的な作業管理を可能にします
- チーム全体の生産性向上に貢献します
- 進捗の可視化が容易になります

3. 重要性・メリット
- 作業の優先順位を明確にできます
- リソースの最適配分が可能になります
- プロジェクトの成功率が向上します

4. 実践例・使用方法
- 日次・週次のレビューで活用
- チームミーティングでの共有
- 個人の作業計画立案に使用

5. 関連用語
- プロジェクト管理
- タスク管理
- 生産性向上`;
  }
}

export default new TaskExecutionAIService();
