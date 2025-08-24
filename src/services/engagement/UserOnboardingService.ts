import { db } from '@/lib/firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  completedAt?: string;
  required: boolean;
  category: 'profile' | 'features' | 'preferences' | 'engagement';
  estimatedTime: number; // in minutes
  actionType: 'navigation' | 'form' | 'tutorial' | 'interaction';
  actionData?: Record<string, any>;
}

export interface OnboardingProgress {
  userId: string;
  totalSteps: number;
  completedSteps: number;
  currentStep: string;
  progressPercentage: number;
  startedAt: string;
  lastActiveAt: string;
  completedAt?: string;
  steps: OnboardingStep[];
  personalizedTips: string[];
  userProfile: {
    experience: 'beginner' | 'intermediate' | 'advanced';
    interests: string[];
    goals: string[];
    timezone: string;
  };
}

export interface OnboardingAnalytics {
  totalUsers: number;
  completionRate: number;
  averageTimeToComplete: number;
  dropOffPoints: { stepId: string; dropOffRate: number }[];
  mostHelpfulSteps: { stepId: string; helpfulRating: number }[];
  userFeedback: { stepId: string; feedback: string; rating: number }[];
}

class UserOnboardingService {
  private readonly ONBOARDING_STEPS: Omit<OnboardingStep, 'completed' | 'completedAt'>[] = [
    {
      id: 'welcome',
      title: 'ようこそ！',
      description: 'Work Time Trackerへようこそ。まずは基本的な設定から始めましょう。',
      icon: '👋',
      required: true,
      category: 'profile',
      estimatedTime: 2,
      actionType: 'tutorial',
      actionData: { showWelcomeModal: true },
    },
    {
      id: 'profile-setup',
      title: 'プロフィール設定',
      description: '名前、アバター、タイムゾーンを設定して個人化しましょう。',
      icon: '👤',
      required: true,
      category: 'profile',
      estimatedTime: 3,
      actionType: 'form',
      actionData: { formPath: '/profile' },
    },
    {
      id: 'first-todo',
      title: '初回TODO作成',
      description: '最初のタスクを作成してアプリの使い方を覚えましょう。',
      icon: '✅',
      required: true,
      category: 'features',
      estimatedTime: 5,
      actionType: 'navigation',
      actionData: { path: '/todo' },
    },
    {
      id: 'calendar-intro',
      title: 'カレンダーの使い方',
      description: 'カレンダー機能でスケジュール管理を始めましょう。',
      icon: '📅',
      required: false,
      category: 'features',
      estimatedTime: 4,
      actionType: 'tutorial',
      actionData: { tutorialId: 'calendar-basic' },
    },
    {
      id: 'notifications-setup',
      title: '通知設定',
      description: 'リマインダーや重要な通知を設定しましょう。',
      icon: '🔔',
      required: false,
      category: 'preferences',
      estimatedTime: 3,
      actionType: 'form',
      actionData: { formPath: '/settings/notifications' },
    },
    {
      id: 'habit-tracking',
      title: '習慣トラッキング',
      description: '日々の習慣を記録して継続的な改善を目指しましょう。',
      icon: '🎯',
      required: false,
      category: 'features',
      estimatedTime: 5,
      actionType: 'navigation',
      actionData: { path: '/habits' },
    },
    {
      id: 'dashboard-tour',
      title: 'ダッシュボードツアー',
      description: 'メインダッシュボードの各機能を確認しましょう。',
      icon: '📊',
      required: true,
      category: 'features',
      estimatedTime: 6,
      actionType: 'tutorial',
      actionData: { tutorialId: 'dashboard-tour' },
    },
    {
      id: 'mobile-setup',
      title: 'モバイル最適化',
      description: 'スマートフォンでの使用に最適化された設定を確認しましょう。',
      icon: '📱',
      required: false,
      category: 'preferences',
      estimatedTime: 4,
      actionType: 'tutorial',
      actionData: { tutorialId: 'mobile-optimization' },
    },
    {
      id: 'first-goal',
      title: '初回目標設定',
      description: '最初の目標を設定して達成を目指しましょう。',
      icon: '🎯',
      required: true,
      category: 'engagement',
      estimatedTime: 7,
      actionType: 'form',
      actionData: { formPath: '/goals/new' },
    },
    {
      id: 'completion-celebration',
      title: 'オンボーディング完了！',
      description: 'おめでとうございます！すべての基本設定が完了しました。',
      icon: '🎉',
      required: true,
      category: 'engagement',
      estimatedTime: 2,
      actionType: 'tutorial',
      actionData: { showCompletionModal: true },
    },
  ];

  async initializeOnboarding(
    userId: string,
    userProfile?: Partial<OnboardingProgress['userProfile']>
  ): Promise<OnboardingProgress> {
    try {
      const onboardingRef = doc(db, 'onboarding', userId);
      const existingDoc = await getDoc(onboardingRef);

      if (existingDoc.exists()) {
        return existingDoc.data() as OnboardingProgress;
      }

      const defaultProfile: OnboardingProgress['userProfile'] = {
        experience: 'beginner',
        interests: [],
        goals: [],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...userProfile,
      };

      const steps: OnboardingStep[] = this.ONBOARDING_STEPS.map((step) => ({
        ...step,
        completed: false,
      }));

      const progress: OnboardingProgress = {
        userId,
        totalSteps: steps.length,
        completedSteps: 0,
        currentStep: steps[0].id,
        progressPercentage: 0,
        startedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        steps,
        personalizedTips: this.generatePersonalizedTips(defaultProfile),
        userProfile: defaultProfile,
      };

      await setDoc(onboardingRef, {
        ...progress,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      this.trackOnboardingStart(userId);
      return progress;
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      throw error;
    }
  }

  async getOnboardingProgress(userId: string): Promise<OnboardingProgress | null> {
    try {
      const onboardingRef = doc(db, 'onboarding', userId);
      const docSnapshot = await getDoc(onboardingRef);

      if (!docSnapshot.exists()) {
        return null;
      }

      return docSnapshot.data() as OnboardingProgress;
    } catch (error) {
      console.error('Error fetching onboarding progress:', error);
      return null;
    }
  }

  async completeStep(
    userId: string,
    stepId: string,
    feedback?: { rating: number; comment?: string }
  ): Promise<OnboardingProgress> {
    try {
      const progress = await this.getOnboardingProgress(userId);
      if (!progress) {
        throw new Error('Onboarding progress not found');
      }

      const stepIndex = progress.steps.findIndex((s) => s.id === stepId);
      if (stepIndex === -1) {
        throw new Error(`Step ${stepId} not found`);
      }

      // Update the specific step
      progress.steps[stepIndex].completed = true;
      progress.steps[stepIndex].completedAt = new Date().toISOString();

      // Update overall progress
      progress.completedSteps = progress.steps.filter((s) => s.completed).length;
      progress.progressPercentage = Math.round(
        (progress.completedSteps / progress.totalSteps) * 100
      );
      progress.lastActiveAt = new Date().toISOString();

      // Find next incomplete step
      const nextStep = progress.steps.find((s) => !s.completed);
      if (nextStep) {
        progress.currentStep = nextStep.id;
      } else {
        progress.completedAt = new Date().toISOString();
        progress.currentStep = 'completed';
      }

      // Update personalized tips based on progress
      progress.personalizedTips = this.generatePersonalizedTips(progress.userProfile, progress);

      // Save to database
      const onboardingRef = doc(db, 'onboarding', userId);
      await updateDoc(onboardingRef, {
        ...progress,
        updatedAt: serverTimestamp(),
      });

      // Track completion
      this.trackStepCompletion(userId, stepId, feedback);

      // Check if onboarding is complete
      if (progress.completedAt) {
        this.trackOnboardingCompletion(userId, progress);
      }

      return progress;
    } catch (error) {
      console.error('Error completing onboarding step:', error);
      throw error;
    }
  }

  async skipStep(userId: string, stepId: string, reason?: string): Promise<OnboardingProgress> {
    try {
      const progress = await this.getOnboardingProgress(userId);
      if (!progress) {
        throw new Error('Onboarding progress not found');
      }

      const stepIndex = progress.steps.findIndex((s) => s.id === stepId);
      if (stepIndex === -1) {
        throw new Error(`Step ${stepId} not found`);
      }

      // Only allow skipping non-required steps
      if (progress.steps[stepIndex].required) {
        throw new Error('Cannot skip required step');
      }

      // Mark as completed with skip flag
      progress.steps[stepIndex].completed = true;
      progress.steps[stepIndex].completedAt = new Date().toISOString();

      // Update overall progress
      progress.completedSteps = progress.steps.filter((s) => s.completed).length;
      progress.progressPercentage = Math.round(
        (progress.completedSteps / progress.totalSteps) * 100
      );
      progress.lastActiveAt = new Date().toISOString();

      // Find next incomplete step
      const nextStep = progress.steps.find((s) => !s.completed);
      if (nextStep) {
        progress.currentStep = nextStep.id;
      } else {
        progress.completedAt = new Date().toISOString();
        progress.currentStep = 'completed';
      }

      // Save to database
      const onboardingRef = doc(db, 'onboarding', userId);
      await updateDoc(onboardingRef, {
        ...progress,
        updatedAt: serverTimestamp(),
      });

      // Track skip
      this.trackStepSkip(userId, stepId, reason);

      return progress;
    } catch (error) {
      console.error('Error skipping onboarding step:', error);
      throw error;
    }
  }

  async updateUserProfile(
    userId: string,
    profileUpdates: Partial<OnboardingProgress['userProfile']>
  ): Promise<void> {
    try {
      const progress = await this.getOnboardingProgress(userId);
      if (!progress) {
        throw new Error('Onboarding progress not found');
      }

      progress.userProfile = { ...progress.userProfile, ...profileUpdates };
      progress.personalizedTips = this.generatePersonalizedTips(progress.userProfile, progress);
      progress.lastActiveAt = new Date().toISOString();

      const onboardingRef = doc(db, 'onboarding', userId);
      await updateDoc(onboardingRef, {
        userProfile: progress.userProfile,
        personalizedTips: progress.personalizedTips,
        lastActiveAt: progress.lastActiveAt,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async getOnboardingAnalytics(): Promise<OnboardingAnalytics> {
    try {
      const onboardingCollection = collection(db, 'onboarding');
      const snapshot = await getDocs(onboardingCollection);

      const allProgress = snapshot.docs.map((doc) => doc.data() as OnboardingProgress);
      const totalUsers = allProgress.length;
      const completedUsers = allProgress.filter((p) => p.completedAt).length;

      if (totalUsers === 0) {
        return {
          totalUsers: 0,
          completionRate: 0,
          averageTimeToComplete: 0,
          dropOffPoints: [],
          mostHelpfulSteps: [],
          userFeedback: [],
        };
      }

      const completionRate = (completedUsers / totalUsers) * 100;

      // Calculate average time to complete
      const completedProgresses = allProgress.filter((p) => p.completedAt && p.startedAt);
      const totalCompletionTime = completedProgresses.reduce((sum, p) => {
        const startTime = new Date(p.startedAt).getTime();
        const endTime = new Date(p.completedAt!).getTime();
        return sum + (endTime - startTime);
      }, 0);
      const averageTimeToComplete =
        completedProgresses.length > 0 ? totalCompletionTime / completedProgresses.length : 0;

      // Calculate drop-off points
      const stepCompletions = new Map<string, number>();
      allProgress.forEach((p) => {
        p.steps.forEach((step) => {
          if (step.completed) {
            stepCompletions.set(step.id, (stepCompletions.get(step.id) || 0) + 1);
          }
        });
      });

      const dropOffPoints = this.ONBOARDING_STEPS.map((step) => ({
        stepId: step.id,
        dropOffRate: 100 - ((stepCompletions.get(step.id) || 0) / totalUsers) * 100,
      })).sort((a, b) => b.dropOffRate - a.dropOffRate);

      return {
        totalUsers,
        completionRate,
        averageTimeToComplete,
        dropOffPoints,
        mostHelpfulSteps: [], // Would be populated from user feedback
        userFeedback: [], // Would be populated from feedback collection
      };
    } catch (error) {
      console.error('Error getting onboarding analytics:', error);
      throw error;
    }
  }

  private generatePersonalizedTips(
    userProfile: OnboardingProgress['userProfile'],
    progress?: OnboardingProgress
  ): string[] {
    const tips: string[] = [];

    // Experience-based tips
    if (userProfile.experience === 'beginner') {
      tips.push('💡 初心者の方は、まず基本的なTODO機能から始めることをお勧めします。');
      tips.push('📚 ヘルプセクションで詳細なガイドを確認できます。');
    } else if (userProfile.experience === 'advanced') {
      tips.push('⚡ 上級者向けのショートカットキーを活用して効率を上げましょう。');
      tips.push('🔧 カスタマイズ機能で自分好みにアプリを調整してください。');
    }

    // Interest-based tips
    if (userProfile.interests.includes('productivity')) {
      tips.push('📈 生産性向上のためのアナリティクス機能をぜひお試しください。');
    }
    if (userProfile.interests.includes('health')) {
      tips.push('🏃‍♂️ 習慣トラッキング機能で健康目標を管理しましょう。');
    }

    // Progress-based tips
    if (progress) {
      const completionRate = progress.progressPercentage;
      if (completionRate < 30) {
        tips.push('🚀 オンボーディングの完了で特別な機能がアンロックされます！');
      } else if (completionRate > 70) {
        tips.push('🎉 もう少しでオンボーディング完了です！頑張ってください。');
      }
    }

    return tips.slice(0, 3); // 最大3つのtipを返す
  }

  private trackOnboardingStart(userId: string): void {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_start', {
        event_category: 'engagement',
        event_label: 'user_onboarding',
        user_id: userId,
      });
    }
  }

  private trackStepCompletion(
    userId: string,
    stepId: string,
    feedback?: { rating: number; comment?: string }
  ): void {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_step_complete', {
        event_category: 'engagement',
        event_label: stepId,
        user_id: userId,
        custom_parameters: {
          step_id: stepId,
          feedback_rating: feedback?.rating || null,
        },
      });
    }
  }

  private trackStepSkip(userId: string, stepId: string, reason?: string): void {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_step_skip', {
        event_category: 'engagement',
        event_label: stepId,
        user_id: userId,
        custom_parameters: {
          step_id: stepId,
          skip_reason: reason || 'user_choice',
        },
      });
    }
  }

  private trackOnboardingCompletion(userId: string, progress: OnboardingProgress): void {
    const completionTime =
      progress.completedAt && progress.startedAt
        ? new Date(progress.completedAt).getTime() - new Date(progress.startedAt).getTime()
        : 0;

    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'onboarding_complete', {
        event_category: 'engagement',
        event_label: 'user_onboarding',
        user_id: userId,
        custom_parameters: {
          completion_time_ms: completionTime,
          total_steps: progress.totalSteps,
          completion_rate: progress.progressPercentage,
        },
      });
    }
  }
}

export const userOnboardingService = new UserOnboardingService();
