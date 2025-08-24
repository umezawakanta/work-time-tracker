import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  Target,
  Lightbulb,
  X,
  PlayCircle,
  SkipForward,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  userOnboardingService,
  OnboardingProgress,
  OnboardingStep,
} from '@/services/engagement/UserOnboardingService';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface UserOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  forceStep?: string;
}

const categoryColors = {
  profile: 'bg-blue-100 text-blue-800 border-blue-200',
  features: 'bg-green-100 text-green-800 border-green-200',
  preferences: 'bg-purple-100 text-purple-800 border-purple-200',
  engagement: 'bg-orange-100 text-orange-800 border-orange-200',
};

const categoryLabels = {
  profile: 'プロフィール',
  features: '機能',
  preferences: '設定',
  engagement: 'エンゲージメント',
};

export const UserOnboardingModal: React.FC<UserOnboardingModalProps> = ({
  isOpen,
  onClose,
  forceStep,
}) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stepFeedback, setStepFeedback] = useState<{ rating: number; comment: string }>({
    rating: 5,
    comment: '',
  });
  const [showFeedback, setShowFeedback] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState<{
    experience: 'beginner' | 'intermediate' | 'advanced' | '';
    interests: string[];
    goals: string[];
    timezone: string;
  }>({
    experience: '',
    interests: [],
    goals: [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  useEffect(() => {
    if (isOpen && user) {
      initializeOnboarding();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (progress && forceStep) {
      const step = progress.steps.find((s) => s.id === forceStep);
      if (step) {
        setCurrentStep(step);
      }
    } else if (progress) {
      const step = progress.steps.find((s) => s.id === progress.currentStep);
      setCurrentStep(step || null);
    }
  }, [progress, forceStep]);

  const initializeOnboarding = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      let onboardingProgress = await userOnboardingService.getOnboardingProgress(user.uid);

      if (!onboardingProgress) {
        onboardingProgress = await userOnboardingService.initializeOnboarding(user.uid);
      }

      setProgress(onboardingProgress);

      // Set profile form with existing data
      setProfileForm({
        experience: onboardingProgress.userProfile.experience,
        interests: onboardingProgress.userProfile.interests,
        goals: onboardingProgress.userProfile.goals,
        timezone: onboardingProgress.userProfile.timezone,
      });
    } catch (error) {
      console.error('Error initializing onboarding:', error);
      toast.error('オンボーディングの初期化に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteStep = async () => {
    if (!user?.uid || !currentStep || !progress) return;

    setIsLoading(true);
    try {
      let shouldShowFeedback = false;

      // Handle specific step actions
      if (currentStep.id === 'profile-setup') {
        const profileData = {
          ...profileForm,
          experience: profileForm.experience as 'beginner' | 'intermediate' | 'advanced',
        };
        await userOnboardingService.updateUserProfile(user.uid, profileData);
        shouldShowFeedback = true;
      }

      const feedback = showFeedback ? stepFeedback : undefined;
      const updatedProgress = await userOnboardingService.completeStep(
        user.uid,
        currentStep.id,
        feedback
      );

      setProgress(updatedProgress);
      setShowFeedback(false);
      setStepFeedback({ rating: 5, comment: '' });

      // Show completion celebration
      if (updatedProgress.completedAt) {
        toast.success('🎉 オンボーディング完了！おめでとうございます！');
        setTimeout(() => onClose(), 2000);
      } else {
        toast.success(`✅ ${currentStep.title} 完了！`);
        if (shouldShowFeedback) {
          setShowFeedback(true);
        }
      }
    } catch (error) {
      console.error('Error completing step:', error);
      toast.error('ステップの完了に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipStep = async () => {
    if (!user?.uid || !currentStep || !progress || currentStep.required) return;

    setIsLoading(true);
    try {
      const updatedProgress = await userOnboardingService.skipStep(
        user.uid,
        currentStep.id,
        'user_choice'
      );
      setProgress(updatedProgress);
      toast.success(`⏭️ ${currentStep.title} をスキップしました`);
    } catch (error) {
      console.error('Error skipping step:', error);
      toast.error('ステップのスキップに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousStep = () => {
    if (!progress || !currentStep) return;

    const currentIndex = progress.steps.findIndex((s) => s.id === currentStep.id);
    if (currentIndex > 0) {
      setCurrentStep(progress.steps[currentIndex - 1]);
    }
  };

  const handleNextStep = () => {
    if (!progress || !currentStep) return;

    const currentIndex = progress.steps.findIndex((s) => s.id === currentStep.id);
    if (currentIndex < progress.steps.length - 1) {
      setCurrentStep(progress.steps[currentIndex + 1]);
    }
  };

  const renderStepContent = () => {
    if (!currentStep) return null;

    switch (currentStep.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">👋</div>
            <h3 className="text-2xl font-bold">Work Time Tracker へようこそ！</h3>
            <p className="text-gray-600 text-lg">
              生産性向上と時間管理を支援するアプリケーションです。
              まずは基本的な設定から始めて、あなたに最適な使い方を見つけましょう。
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 このオンボーディングは約{' '}
                {progress?.steps.reduce((sum, s) => sum + s.estimatedTime, 0)} 分で完了します
              </p>
            </div>
          </div>
        );

      case 'profile-setup':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">👤</div>
              <h3 className="text-xl font-bold">プロフィールをセットアップ</h3>
              <p className="text-gray-600">
                あなたに合わせたエクスペリエンスを提供するための基本情報です
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="experience">開発・管理経験レベル</Label>
                <Select
                  value={profileForm.experience}
                  onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
                    setProfileForm((prev) => ({ ...prev, experience: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="経験レベルを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">初心者</SelectItem>
                    <SelectItem value="intermediate">中級者</SelectItem>
                    <SelectItem value="advanced">上級者</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>興味のある分野（複数選択可）</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['productivity', 'health', 'learning', 'finance', 'creative', 'technology'].map(
                    (interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <Checkbox
                          id={interest}
                          checked={profileForm.interests.includes(interest)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setProfileForm((prev) => ({
                                ...prev,
                                interests: [...prev.interests, interest],
                              }));
                            } else {
                              setProfileForm((prev) => ({
                                ...prev,
                                interests: prev.interests.filter((i) => i !== interest),
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={interest} className="text-sm">
                          {interest === 'productivity'
                            ? '生産性'
                            : interest === 'health'
                              ? '健康'
                              : interest === 'learning'
                                ? '学習'
                                : interest === 'finance'
                                  ? '家計'
                                  : interest === 'creative'
                                    ? 'クリエイティブ'
                                    : 'テクノロジー'}
                        </Label>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="timezone">タイムゾーン</Label>
                <Input
                  id="timezone"
                  value={profileForm.timezone}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, timezone: e.target.value }))
                  }
                  placeholder="Asia/Tokyo"
                />
              </div>
            </div>
          </div>
        );

      case 'first-todo':
        return (
          <div className="text-center space-y-6">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold">最初のTODOを作成しましょう</h3>
            <p className="text-gray-600">
              タスク管理の第一歩として、最初のTODOアイテムを作成してみましょう。
            </p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                💡 「完了」をクリックするとTODOページに移動します
              </p>
            </div>
          </div>
        );

      case 'completion-celebration':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-green-600">おめでとうございます！</h3>
            <p className="text-gray-600 text-lg">
              オンボーディングが完了しました。
              <br />
              これでWork Time Trackerのすべての機能をお使いいただけます。
            </p>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-2">次のステップ:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>📊 ダッシュボードで進捗を確認</li>
                <li>✅ TODOでタスクを管理</li>
                <li>📅 カレンダーでスケジュール調整</li>
                <li>🎯 習慣トラッキングで継続的改善</li>
              </ul>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center space-y-6">
            <div className="text-4xl mb-4">{currentStep.icon}</div>
            <h3 className="text-xl font-bold">{currentStep.title}</h3>
            <p className="text-gray-600">{currentStep.description}</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <Clock className="inline w-4 h-4 mr-1" />
                推定時間: {currentStep.estimatedTime}分
              </p>
            </div>
          </div>
        );
    }
  };

  const renderFeedbackForm = () => {
    if (!showFeedback) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">フィードバックをお聞かせください</CardTitle>
          <CardDescription>このステップはいかがでしたか？</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>評価 (1-5)</Label>
            <div className="flex space-x-2 mt-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={stepFeedback.rating === rating ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStepFeedback((prev) => ({ ...prev, rating }))}
                >
                  {rating}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="feedback-comment">コメント（任意）</Label>
            <Textarea
              id="feedback-comment"
              value={stepFeedback.comment}
              onChange={(e) => setStepFeedback((prev) => ({ ...prev, comment: e.target.value }))}
              placeholder="このステップについてのご意見をお聞かせください"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isOpen || !progress || !currentStep) return null;

  const currentStepIndex = progress.steps.findIndex((s) => s.id === currentStep.id);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === progress.steps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <span>オンボーディング</span>
              <Badge className={categoryColors[currentStep.category]}>
                {categoryLabels[currentStep.category]}
              </Badge>
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription>
            ステップ {currentStepIndex + 1} / {progress.totalSteps}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>進捗</span>
              <span>{progress.progressPercentage}%</span>
            </div>
            <Progress value={progress.progressPercentage} className="h-2" />
          </div>

          {/* Step content */}
          <div className="min-h-[300px]">{renderStepContent()}</div>

          {/* Feedback form */}
          {renderFeedbackForm()}

          {/* Personalized tips */}
          {progress.personalizedTips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                  あなたへのヒント
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {progress.personalizedTips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex space-x-2">
              {!isFirstStep && (
                <Button variant="outline" onClick={handlePreviousStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  前へ
                </Button>
              )}
              {!currentStep.required && (
                <Button variant="ghost" onClick={handleSkipStep} disabled={isLoading}>
                  <SkipForward className="w-4 h-4 mr-2" />
                  スキップ
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              {!isLastStep && !showFeedback && (
                <Button variant="outline" onClick={handleNextStep}>
                  次へ
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              <Button
                onClick={handleCompleteStep}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  '処理中...'
                ) : currentStep.completed ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    完了済み
                  </>
                ) : showFeedback ? (
                  'フィードバック送信'
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {currentStep.actionType === 'navigation' ? '開始' : '完了'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Step counter */}
          <div className="flex justify-center space-x-2">
            {progress.steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full ${
                  step.completed
                    ? 'bg-green-500'
                    : index === currentStepIndex
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
