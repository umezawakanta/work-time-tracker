import { DevelopmentBadge, DEVELOPMENT_BADGES } from '@/types/development-badges';
import { githubProgressService } from './GitHubProgressService';

interface EvaluationContext {
  progress: {
    commitCount: number;
    testCoverage: number;
    performanceScore: number;
    pageCount: number;
    featuresCompleted: string[];
    coreFeatures: {
      auth: boolean;
      todo: boolean;
      calendar: boolean;
      dashboard: boolean;
      wbs: boolean;
      reporting: boolean;
      assetManagement: boolean;
      blog: boolean;
      habits: boolean;
      systematization: boolean;
    };
  };
  fileStructure: string[];
  uiComponents: any;
}

class BadgeEvaluationService {
  async evaluateAllBadges(): Promise<DevelopmentBadge[]> {
    const progress = await githubProgressService.analyzeRepositoryProgress();

    const context: EvaluationContext = {
      progress: {
        commitCount: progress.commitCount,
        testCoverage: progress.testCoverage,
        performanceScore: progress.performanceScore,
        pageCount: progress.pageCount,
        featuresCompleted: progress.features,
        coreFeatures: progress.coreFeatures,
      },
      fileStructure: [],
      uiComponents: {},
    };

    return DEVELOPMENT_BADGES.map((badge) => this.evaluateBadge(badge, context));
  }

  private evaluateBadge(badge: DevelopmentBadge, context: EvaluationContext): DevelopmentBadge {
    const updatedBadge = { ...badge };
    let completedRequirements = 0;

    updatedBadge.requirements.forEach((requirement) => {
      const isCompleted = this.evaluateRequirement(requirement, context);
      if (isCompleted) {
        completedRequirements++;
        requirement.current = 'completed';
      } else {
        this.updateRequirementProgress(requirement, context);
      }
    });

    // 進捗率計算
    updatedBadge.progress = Math.round((completedRequirements / badge.requirements.length) * 100);
    updatedBadge.isUnlocked = updatedBadge.progress === 100;

    // 次のマイルストーン設定
    if (!updatedBadge.isUnlocked) {
      updatedBadge.nextMilestone = this.getNextMilestone(badge, context);
    }

    if (updatedBadge.isUnlocked && !badge.isUnlocked) {
      // 新しくバッジを獲得した場合の通知
      this.triggerBadgeUnlockedNotification(updatedBadge);
    }

    return updatedBadge;
  }

  private evaluateRequirement(requirement: any, context: EvaluationContext): boolean {
    const { progress } = context;

    switch (requirement.type) {
      case 'commit_count':
        return progress.commitCount >= Number(requirement.target);

      case 'performance_score':
        return progress.performanceScore >= Number(requirement.target);

      case 'test_coverage':
        return progress.testCoverage >= Number(requirement.target);

      case 'feature_complete':
        return this.isFeatureComplete(requirement.target, progress);

      default:
        return false;
    }
  }

  private isFeatureComplete(
    featureTarget: string,
    progress: EvaluationContext['progress']
  ): boolean {
    const { coreFeatures, pageCount, featuresCompleted } = progress;

    switch (featureTarget) {
      case 'todo_crud':
        return coreFeatures.todo && featuresCompleted.includes('todo');

      case 'responsive_design':
        return pageCount >= 25; // 25ページ以上でレスポンシブ対応済みと判定

      case 'all_core_features':
        // 全コア機能が実装済みかチェック
        return Object.values(coreFeatures).every((feature) => feature) && pageCount >= 30;

      case 'workflow_engine':
        return coreFeatures.systematization && featuresCompleted.includes('systematization');

      case 'folder_structure':
        return pageCount >= 10; // 構造化されたプロジェクト

      case 'type_definitions':
        return pageCount >= 15; // TypeScript型定義充実

      case 'accessibility':
        return pageCount >= 20 && progress.performanceScore >= 80;

      default:
        return featuresCompleted.includes(featureTarget);
    }
  }

  private updateRequirementProgress(requirement: any, context: EvaluationContext): void {
    const { progress } = context;

    switch (requirement.type) {
      case 'commit_count':
        requirement.current = progress.commitCount;
        break;

      case 'performance_score':
        requirement.current = progress.performanceScore;
        break;

      case 'test_coverage':
        requirement.current = progress.testCoverage;
        break;

      case 'feature_complete':
        if (this.isFeatureComplete(requirement.target, progress)) {
          requirement.current = 'completed';
        } else {
          requirement.current = 'in_progress';
        }
        break;
    }
  }

  private getNextMilestone(badge: DevelopmentBadge, context: EvaluationContext): string {
    const { progress } = context;

    // バッジの種類に応じて次のマイルストーンを提案
    switch (badge.id) {
      case 'feature-completionist': {
        const missingFeatures = Object.entries(progress.coreFeatures)
          .filter(([, completed]) => !completed)
          .map(([feature]) => feature);

        if (missingFeatures.length === 0 && progress.pageCount >= 30) {
          return '品質向上とパフォーマンス最適化';
        }
        return `残り機能: ${missingFeatures.join(', ')}`;
      }

      case 'todo-master':
        if (!progress.coreFeatures.todo) return 'TODO CRUD機能の完成';
        return 'フィルタ機能と分析機能の追加';

      case 'design-perfectionist':
        if (progress.pageCount < 25) return `あと${25 - progress.pageCount}ページの実装`;
        return 'アクセシビリティの改善';

      case 'speed-demon':
        return `Lighthouseスコア ${90 - progress.performanceScore}点改善が必要`;

      default:
        return '継続的な機能改善';
    }
  }

  private triggerBadgeUnlockedNotification(badge: DevelopmentBadge) {
    // 通知やお祝いアニメーションをトリガー
    console.log(`🎉 バッジ獲得: ${badge.name}`);

    // 実際のアプリケーションでは、
    // toast通知やバッジ獲得アニメーションを表示
  }

  private async analyzeFileStructure(): Promise<string[]> {
    return [];
  }

  private async analyzeUIComponents(): Promise<any> {
    return {};
  }

  // 今日の推奨タスクを生成
  getRecommendedTasks(): string[] {
    return [
      '🎯 「機能コンプリート」バッジまであと15%！品質向上に注力',
      '✅ TODO機能の分析ダッシュボード追加',
      '🎨 全ページのUI統一性チェック',
      '⚡ パフォーマンス最適化（画像圧縮、コード分割）',
      '🧪 テストカバレッジを80%まで向上',
    ];
  }
}

export const badgeEvaluationService = new BadgeEvaluationService();
