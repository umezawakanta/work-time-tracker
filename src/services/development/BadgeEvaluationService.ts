import { DevelopmentBadge, DEVELOPMENT_BADGES } from '@/types/development-badges';
import { githubProgressService } from './GitHubProgressService';

interface EvaluationContext {
  progress: {
    commitCount: number;
    testCoverage: number;
    performanceScore: number;
  };
  fileStructure: string[];
  uiComponents: any;
}

class BadgeEvaluationService {
  async evaluateAllBadges(): Promise<DevelopmentBadge[]> {
    const progress = await githubProgressService.analyzeRepositoryProgress();
    const fileStructure = await this.analyzeFileStructure();
    const uiComponents = await this.analyzeUIComponents();

    return DEVELOPMENT_BADGES.map((badge) => {
      return this.evaluateBadge(badge, {
        progress,
        fileStructure,
        uiComponents,
      });
    });
  }

  private evaluateBadge(badge: DevelopmentBadge, context: EvaluationContext): DevelopmentBadge {
    const updatedBadge = { ...badge };

    // 各要件の達成状況を評価
    badge.requirements.forEach((requirement) => {
      switch (requirement.type) {
        case 'commit_count':
          requirement.current = context.progress.commitCount;
          break;

        case 'feature_complete':
          requirement.current = this.checkFeatureCompletion(requirement.target as string, context);
          break;

        case 'test_coverage':
          requirement.current = context.progress.testCoverage;
          break;

        case 'performance_score':
          requirement.current = context.progress.performanceScore;
          break;
      }
    });

    // 進捗率計算
    const completedRequirements = badge.requirements.filter((req) =>
      this.isRequirementMet(req)
    ).length;

    updatedBadge.progress = Math.round((completedRequirements / badge.requirements.length) * 100);

    updatedBadge.isUnlocked = updatedBadge.progress === 100;

    if (updatedBadge.isUnlocked && !badge.isUnlocked) {
      // 新しくバッジを獲得した場合の通知
      this.triggerBadgeUnlockedNotification(updatedBadge);
    }

    return updatedBadge;
  }

  private checkFeatureCompletion(
    featureId: string,
    context: EvaluationContext
  ): 'completed' | 'partial' | 'pending' {
    switch (featureId) {
      case 'todo_crud':
        return this.evaluateTodoFeature(context);
      case 'responsive_design':
        return this.evaluateResponsiveDesign(context);
      case 'workflow_engine':
        return this.evaluateWorkflowEngine(context);
      default:
        return 'pending';
    }
  }

  private evaluateTodoFeature(context: EvaluationContext): 'completed' | 'partial' | 'pending' {
    const requiredFiles = [
      'src/components/todo/',
      'src/store/todoSlice.ts',
      'src/services/TodoService.ts',
    ];

    const existingFiles = requiredFiles.filter((file) => context.fileStructure.includes(file));

    if (existingFiles.length === requiredFiles.length) {
      return 'completed';
    } else if (existingFiles.length > 0) {
      return 'partial';
    }
    return 'pending';
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

  private isRequirementMet(req: any): boolean {
    return false;
  }

  private evaluateResponsiveDesign(
    context: EvaluationContext
  ): 'completed' | 'partial' | 'pending' {
    return 'pending';
  }

  private evaluateWorkflowEngine(context: EvaluationContext): 'completed' | 'partial' | 'pending' {
    return 'pending';
  }
}

export const badgeEvaluationService = new BadgeEvaluationService();
