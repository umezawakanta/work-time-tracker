/**
 * 📊 AI駆動ユーザーフィードバック分析サービス
 * ユーザー行動・フィードバックを自動分析し、改善提案を生成
 */

import { multiAIIntegrationService } from '../integrations/MultiAIIntegrationService';
import { continuousImprovementEngine } from './ContinuousImprovementEngine';
import { generateOperationId, dataGenerator } from '../../utils/idGenerator';

export interface UserBehaviorData {
  userId: string;
  sessionId: string;
  timestamp: string;
  action: string;
  page: string;
  duration: number;
  interactions: {
    clicks: number;
    scrolls: number;
    keystrokes: number;
  };
  errorEncountered?: {
    type: string;
    message: string;
    stackTrace?: string;
  };
  performance: {
    loadTime: number;
    responseTime: number;
    memoryUsage: number;
  };
}

export interface UserFeedback {
  id: string;
  userId: string;
  type: 'bug_report' | 'feature_request' | 'general_feedback' | 'rating';
  content: string;
  rating?: number; // 1-5
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt: string;
  status: 'new' | 'analyzing' | 'implemented' | 'closed';
}

export interface UserInsight {
  id: string;
  type: 'behavior_pattern' | 'pain_point' | 'feature_usage' | 'performance_issue';
  title: string;
  description: string;
  affectedUsers: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  recommendations: string[];
  dataPoints: number;
  detectedAt: string;
}

export interface FeedbackAnalysisReport {
  id: string;
  generatedAt: string;
  timeRange: {
    start: string;
    end: string;
  };
  insights: UserInsight[];
  userSatisfactionScore: number;
  keyMetrics: {
    totalUsers: number;
    activeUsers: number;
    bounceRate: number;
    averageSessionDuration: number;
    featureUsageRates: Record<string, number>;
  };
  aiRecommendations: string[];
  implementationPriority: UserInsight[];
}

class UserFeedbackAnalysisService {
  private static instance: UserFeedbackAnalysisService | null = null;
  private behaviorData: Map<string, UserBehaviorData[]> = new Map();
  private feedbackData: Map<string, UserFeedback> = new Map();
  private analysisHistory: Map<string, FeedbackAnalysisReport> = new Map();

  public static getInstance(): UserFeedbackAnalysisService {
    if (!UserFeedbackAnalysisService.instance) {
      UserFeedbackAnalysisService.instance = new UserFeedbackAnalysisService();
    }
    return UserFeedbackAnalysisService.instance;
  }

  /**
   * 📊 ユーザー行動データ記録
   */
  public recordUserBehavior(behaviorData: UserBehaviorData): void {
    const userId = behaviorData.userId;
    if (!this.behaviorData.has(userId)) {
      this.behaviorData.set(userId, []);
    }
    this.behaviorData.get(userId)!.push(behaviorData);

    // 直近1000件のデータのみ保持
    const userBehaviors = this.behaviorData.get(userId)!;
    if (userBehaviors.length > 1000) {
      userBehaviors.splice(0, userBehaviors.length - 1000);
    }
  }

  /**
   * 💬 ユーザーフィードバック記録
   */
  public async recordUserFeedback(
    feedback: Omit<UserFeedback, 'id' | 'submittedAt' | 'status'>
  ): Promise<string> {
    const feedbackId = generateOperationId('feedback');
    const newFeedback: UserFeedback = {
      ...feedback,
      id: feedbackId,
      submittedAt: new Date().toISOString(),
      status: 'new',
    };

    this.feedbackData.set(feedbackId, newFeedback);

    // 自動分析を開始
    await this.analyzeFeedbackWithAI(newFeedback);

    return feedbackId;
  }

  /**
   * 🧠 AI駆動フィードバック分析
   */
  private async analyzeFeedbackWithAI(feedback: UserFeedback): Promise<void> {
    console.log(`🧠 AI分析開始: ${feedback.type} - ${feedback.id}`);

    feedback.status = 'analyzing';

    try {
      const aiAnalysis = await multiAIIntegrationService.processTask({
        prompt: `Work Time Trackerアプリケーションのユーザーフィードバックを分析してください：

フィードバック種類: ${feedback.type}
内容: ${feedback.content}
評価: ${feedback.rating || 'N/A'}
カテゴリ: ${feedback.category || 'N/A'}

以下の観点で分析し、具体的な改善提案を行ってください：
1. フィードバックの重要度評価（1-10）
2. 関連する機能・システム
3. 他のユーザーにも影響する可能性
4. 具体的な改善方法
5. 実装優先度

また、このフィードバックが示す根本的な問題と、それを解決するための技術的アプローチを提案してください。`,
        taskType: 'analysis',
        priority: 'high',
      });

      // 優先度を自動判定
      const urgencyKeywords = ['バグ', 'エラー', '動かない', '壊れて', 'クラッシュ'];
      const isUrgent = urgencyKeywords.some((keyword) => feedback.content.includes(keyword));

      feedback.priority = isUrgent
        ? 'urgent'
        : feedback.rating && feedback.rating <= 2
          ? 'high'
          : feedback.type === 'bug_report'
            ? 'medium'
            : 'low';

      console.log(`✅ AI分析完了: ${feedback.id} (優先度: ${feedback.priority})`);

      // 高優先度の場合は自動で改善エンジンに送信
      if (feedback.priority === 'urgent' || feedback.priority === 'high') {
        await this.forwardToImprovementEngine(feedback, aiAnalysis.content);
      }
    } catch (error) {
      console.error(`❌ フィードバック分析エラー: ${feedback.id}`, error);
      feedback.status = 'new'; // 分析失敗時は元に戻す
    }
  }

  /**
   * 📈 包括的ユーザー分析実行
   */
  public async runComprehensiveAnalysis(daysPeriod: number = 7): Promise<FeedbackAnalysisReport> {
    console.log(`📈 過去${daysPeriod}日間の包括的ユーザー分析を開始...`);

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - daysPeriod * 24 * 60 * 60 * 1000);

    const report: FeedbackAnalysisReport = {
      id: generateOperationId('report'),
      generatedAt: new Date().toISOString(),
      timeRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      insights: [],
      userSatisfactionScore: 0,
      keyMetrics: await this.calculateKeyMetrics(startDate, endDate),
      aiRecommendations: [],
      implementationPriority: [],
    };

    // 1. 行動パターン分析
    report.insights.push(...(await this.analyzeBehaviorPatterns(startDate, endDate)));

    // 2. フィードバック傾向分析
    report.insights.push(...(await this.analyzeFeedbackTrends(startDate, endDate)));

    // 3. パフォーマンス問題検出
    report.insights.push(...(await this.analyzePerformanceIssues(startDate, endDate)));

    // 4. AI総合推奨事項生成
    report.aiRecommendations = await this.generateAIRecommendations(report.insights);

    // 5. 実装優先度ソート
    report.implementationPriority = this.prioritizeInsights(report.insights);

    // 6. ユーザー満足度計算
    report.userSatisfactionScore = this.calculateUserSatisfaction();

    this.analysisHistory.set(report.id, report);
    console.log(`✅ 包括的分析完了: ${report.insights.length}件のインサイトを生成`);

    return report;
  }

  /**
   * 🔍 行動パターン分析
   */
  private async analyzeBehaviorPatterns(startDate: Date, endDate: Date): Promise<UserInsight[]> {
    const insights: UserInsight[] = [];

    // 全ユーザーの行動データを分析
    const recentBehaviors = Array.from(this.behaviorData.values())
      .flat()
      .filter((behavior) => {
        const behaviorDate = new Date(behavior.timestamp);
        return behaviorDate >= startDate && behaviorDate <= endDate;
      });

    // 離脱率の高いページを検出
    const pageExitRates = this.calculatePageExitRates(recentBehaviors);
    const highExitPages = Object.entries(pageExitRates)
      .filter(([_, rate]) => rate > 0.7)
      .map(([page, rate]) => ({ page, rate }));

    if (highExitPages.length > 0) {
      insights.push({
        id: generateOperationId('insight'),
        type: 'behavior_pattern',
        title: '高離脱率ページの検出',
        description: `${highExitPages.length}個のページで異常に高い離脱率を検出しました`,
        affectedUsers: this.getUniqueUserCount(recentBehaviors),
        impact: 'high',
        confidence: 85,
        recommendations: [
          '該当ページのUIを改善する',
          'ページ読み込み速度を最適化する',
          'ユーザビリティテストを実施する',
        ],
        dataPoints: recentBehaviors.length,
        detectedAt: new Date().toISOString(),
      });
    }

    // 機能使用率の低い機能を検出
    const featureUsage = this.calculateFeatureUsage(recentBehaviors);
    const underusedFeatures = Object.entries(featureUsage)
      .filter(([_, usage]) => usage < 0.1)
      .map(([feature, usage]) => ({ feature, usage }));

    if (underusedFeatures.length > 0) {
      insights.push({
        id: generateOperationId('insight'),
        type: 'feature_usage',
        title: '低使用率機能の検出',
        description: `${underusedFeatures.length}個の機能の使用率が10%を下回っています`,
        affectedUsers: this.getUniqueUserCount(recentBehaviors),
        impact: 'medium',
        confidence: 75,
        recommendations: [
          '機能の説明・ガイドを改善する',
          'より分かりやすい場所に配置する',
          'オンボーディングで紹介する',
        ],
        dataPoints: recentBehaviors.length,
        detectedAt: new Date().toISOString(),
      });
    }

    return insights;
  }

  /**
   * 📝 フィードバック傾向分析
   */
  private async analyzeFeedbackTrends(startDate: Date, endDate: Date): Promise<UserInsight[]> {
    const insights: UserInsight[] = [];

    const recentFeedback = Array.from(this.feedbackData.values()).filter((feedback) => {
      const feedbackDate = new Date(feedback.submittedAt);
      return feedbackDate >= startDate && feedbackDate <= endDate;
    });

    // バグレポートの急増を検出
    const bugReports = recentFeedback.filter((f) => f.type === 'bug_report');
    if (bugReports.length > 10) {
      insights.push({
        id: generateOperationId('insight'),
        type: 'pain_point',
        title: 'バグレポート急増',
        description: `過去${this.getDaysDifference(startDate, endDate)}日間で${bugReports.length}件のバグレポートを受信`,
        affectedUsers: new Set(bugReports.map((b) => b.userId)).size,
        impact: 'critical',
        confidence: 95,
        recommendations: [
          '緊急バグ修正スプリントを実施する',
          'QAプロセスを強化する',
          '自動テストカバレッジを拡大する',
        ],
        dataPoints: bugReports.length,
        detectedAt: new Date().toISOString(),
      });
    }

    // 機能要求の傾向分析
    const featureRequests = recentFeedback.filter((f) => f.type === 'feature_request');
    if (featureRequests.length > 0) {
      const topRequests = this.analyzeFeatureRequestTrends(featureRequests);

      insights.push({
        id: generateOperationId('insight'),
        type: 'feature_usage',
        title: '頻出機能要求',
        description: `最も要求の多い機能: ${topRequests.slice(0, 3).join(', ')}`,
        affectedUsers: new Set(featureRequests.map((f) => f.userId)).size,
        impact: 'high',
        confidence: 80,
        recommendations: [
          '人気機能の開発を優先する',
          'ロードマップに追加を検討する',
          'ユーザー投票機能を実装する',
        ],
        dataPoints: featureRequests.length,
        detectedAt: new Date().toISOString(),
      });
    }

    return insights;
  }

  /**
   * ⚡ パフォーマンス問題分析
   */
  private async analyzePerformanceIssues(startDate: Date, endDate: Date): Promise<UserInsight[]> {
    const insights: UserInsight[] = [];

    const recentBehaviors = Array.from(this.behaviorData.values())
      .flat()
      .filter((behavior) => {
        const behaviorDate = new Date(behavior.timestamp);
        return behaviorDate >= startDate && behaviorDate <= endDate;
      });

    // 読み込み時間の分析
    const avgLoadTime =
      recentBehaviors.reduce((sum, b) => sum + b.performance.loadTime, 0) / recentBehaviors.length;
    if (avgLoadTime > 3000) {
      // 3秒以上
      insights.push({
        id: generateOperationId('insight'),
        type: 'performance_issue',
        title: 'ページ読み込み速度低下',
        description: `平均読み込み時間が${Math.round(avgLoadTime)}msに増加`,
        affectedUsers: this.getUniqueUserCount(recentBehaviors),
        impact: 'high',
        confidence: 90,
        recommendations: ['バンドルサイズを最適化する', '画像を最適化する', 'CDNを活用する'],
        dataPoints: recentBehaviors.length,
        detectedAt: new Date().toISOString(),
      });
    }

    return insights;
  }

  /**
   * 🤖 AI総合推奨事項生成
   */
  private async generateAIRecommendations(insights: UserInsight[]): Promise<string[]> {
    if (insights.length === 0) return ['現在、特に改善が必要な項目は検出されていません。'];

    const aiAnalysis = await multiAIIntegrationService.processTask({
      prompt: `Work Time Trackerアプリケーションのユーザー分析結果を総合的に評価し、戦略的改善提案を行ってください：

検出されたインサイト:
${insights
  .map(
    (insight, i) => `${i + 1}. ${insight.title} (${insight.type}, ${insight.impact}影響)
   説明: ${insight.description}
   影響ユーザー数: ${insight.affectedUsers}
   信頼度: ${insight.confidence}%`
  )
  .join('\n\n')}

以下の観点で戦略的推奨事項を提案してください：
1. 最優先で対処すべき問題
2. 長期的なユーザー体験向上策
3. 技術的改善アプローチ
4. ビジネス価値の最大化方法
5. リスク軽減策

具体的で実行可能な推奨事項を提案してください。`,
      taskType: 'analysis',
      priority: 'high',
    });

    return aiAnalysis.content.split('\n').filter((line) => line.trim().length > 0);
  }

  /**
   * 🔄 改善エンジンへの転送
   */
  private async forwardToImprovementEngine(
    feedback: UserFeedback,
    aiAnalysis: string
  ): Promise<void> {
    console.log(`🔄 高優先度フィードバックを改善エンジンに転送: ${feedback.id}`);

    // 継続的改善エンジンで自動実装サイクルをトリガー
    const improvementEngine = continuousImprovementEngine;
    const currentCycle = improvementEngine.getCurrentCycle();

    if (!currentCycle) {
      // 新しいサイクルを開始
      await improvementEngine.startContinuousImprovement(1); // 1時間後に再実行
    }
  }

  // ヘルパーメソッド
  private calculatePageExitRates(behaviors: UserBehaviorData[]): Record<string, number> {
    const pageStats: Record<string, { enters: number; exits: number }> = {};

    behaviors.forEach((behavior) => {
      if (!pageStats[behavior.page]) {
        pageStats[behavior.page] = { enters: 0, exits: 0 };
      }
      pageStats[behavior.page].enters++;
      if (behavior.duration < 1000) {
        // 1秒未満で離脱
        pageStats[behavior.page].exits++;
      }
    });

    const exitRates: Record<string, number> = {};
    Object.entries(pageStats).forEach(([page, stats]) => {
      exitRates[page] = stats.exits / stats.enters;
    });

    return exitRates;
  }

  private calculateFeatureUsage(behaviors: UserBehaviorData[]): Record<string, number> {
    const totalUsers = this.getUniqueUserCount(behaviors);
    const featureUsage: Record<string, Set<string>> = {};

    behaviors.forEach((behavior) => {
      const feature = this.extractFeatureFromAction(behavior.action);
      if (feature) {
        if (!featureUsage[feature]) {
          featureUsage[feature] = new Set();
        }
        featureUsage[feature].add(behavior.userId);
      }
    });

    const usageRates: Record<string, number> = {};
    Object.entries(featureUsage).forEach(([feature, userSet]) => {
      usageRates[feature] = userSet.size / totalUsers;
    });

    return usageRates;
  }

  private extractFeatureFromAction(action: string): string | null {
    const featureMap: Record<string, string> = {
      todo_create: 'TODO作成',
      todo_complete: 'TODO完了',
      calendar_view: 'カレンダー表示',
      analytics_view: '分析表示',
      export_data: 'データエクスポート',
    };
    return featureMap[action] || null;
  }

  private getUniqueUserCount(behaviors: UserBehaviorData[]): number {
    return new Set(behaviors.map((b) => b.userId)).size;
  }

  private async calculateKeyMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<FeedbackAnalysisReport['keyMetrics']> {
    const recentBehaviors = Array.from(this.behaviorData.values())
      .flat()
      .filter((behavior) => {
        const behaviorDate = new Date(behavior.timestamp);
        return behaviorDate >= startDate && behaviorDate <= endDate;
      });

    const uniqueUsers = this.getUniqueUserCount(recentBehaviors);
    const sessions = new Set(recentBehaviors.map((b) => b.sessionId)).size;
    const avgSessionDuration = recentBehaviors.reduce((sum, b) => sum + b.duration, 0) / sessions;

    return {
      totalUsers: uniqueUsers,
      activeUsers: Math.round(uniqueUsers * 0.8), // アクティブユーザー推定
      bounceRate: 0.25, // 離脱率
      averageSessionDuration: Math.round(avgSessionDuration),
      featureUsageRates: this.calculateFeatureUsage(recentBehaviors),
    };
  }

  private analyzeFeatureRequestTrends(requests: UserFeedback[]): string[] {
    const keywords: Record<string, number> = {};

    requests.forEach((request: UserFeedback) => {
      const words = request.content.toLowerCase().match(/\w+/g) || [];
      words.forEach((word: string) => {
        if (word.length > 3) {
          // 3文字以上の単語のみ
          keywords[word] = (keywords[word] || 0) + 1;
        }
      });
    });

    return Object.entries(keywords)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private prioritizeInsights(insights: UserInsight[]): UserInsight[] {
    return insights.sort((a, b) => {
      const impactWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const aScore = impactWeight[a.impact] * (a.confidence / 100) * Math.log(a.affectedUsers + 1);
      const bScore = impactWeight[b.impact] * (b.confidence / 100) * Math.log(b.affectedUsers + 1);
      return bScore - aScore;
    });
  }

  private calculateUserSatisfaction(): number {
    const ratings = Array.from(this.feedbackData.values())
      .filter((f) => f.rating !== undefined)
      .map((f) => f.rating!);

    if (ratings.length === 0) return 75; // デフォルト値

    const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return Math.round((avgRating / 5) * 100);
  }

  private getDaysDifference(startDate: Date, endDate: Date): number {
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  // 外部API
  public getLatestReport(): FeedbackAnalysisReport | null {
    const reports = Array.from(this.analysisHistory.values());
    return reports.length > 0 ? reports[reports.length - 1] : null;
  }

  public getAllFeedback(): UserFeedback[] {
    return Array.from(this.feedbackData.values());
  }

  public getUserBehaviorSummary(userId: string): UserBehaviorData[] {
    return this.behaviorData.get(userId) || [];
  }
}

export const userFeedbackAnalysisService = UserFeedbackAnalysisService.getInstance();
