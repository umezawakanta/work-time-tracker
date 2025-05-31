import React, { useState, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Lock,
  Sparkles,
  Calendar,
  Gift,
  Star,
  BarChart,
  Download,
  Zap,
  Shield,
  Loader2,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

// 切り出したコンポーネントのインポート
import { PremiumPlanSelector, PremiumPlanInfo } from './PremiumPlanSelector';
import { ReferralDialog } from './ReferralDialog';

// サブスクリプション関連のサービス
import { _extendTrialPeriod as extendTrialPeriod } from '@/services/userAccountService';
import { _fetchUsageStatistics as fetchUsageStatistics } from '@/services/userAccountService';
import { useAuth } from '@/hooks/useAuth';

// プレミアム機能の型定義
interface PremiumFeature {
  name: string;
  icon: React.ReactNode;
  description: string;
  isNew?: boolean;
}

// 使用統計情報の型定義
interface UsageStats {
  tasksCreated: number;
  tasksCompleted: number;
  storageUsed: number;
  storageLimit: number;
}

interface PremiumFeatureBannerProps {
  isPremium: boolean;
  expiresAt?: string;
  onUpgrade: () => void;
  premiumPlan?: 'monthly' | 'annual' | 'lifetime';
  usageStats?: UsageStats;
  onPlanSelected?: (planType: string, cycle: 'monthly' | 'annual' | 'lifetime') => void;
  referralCode?: string;
  appDomain?: string;
}

/**
 * プレミアム機能のバナーコンポーネント
 * 無料ユーザーにはアップグレード促進、プレミアムユーザーには利用期限を表示
 */
export const PremiumFeatureBanner: React.FC<PremiumFeatureBannerProps> = ({
  isPremium,
  expiresAt,
  onUpgrade,
  premiumPlan = 'monthly',
  usageStats: initialUsageStats,
  onPlanSelected,
  referralCode,
  appDomain = 'yourtaskapp.com',
}) => {
  // 状態管理
  const [showPlansDialog, setShowPlansDialog] = useState<boolean>(false);
  const [showReferralDialog, setShowReferralDialog] = useState<boolean>(false);
  const [isExtendingTrial, setIsExtendingTrial] = useState<boolean>(false);
  const [trialExtended, setTrialExtended] = useState<boolean>(false);
  const [usageStats, setUsageStats] = useState<UsageStats | undefined>(initialUsageStats);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { user } = useAuth();

  // 使用統計の取得
  const loadUsageStats = async () => {
    if (!user?.uid) return;

    try {
      const stats = await fetchUsageStatistics(user.uid);
      // Handle stats...
      setUsageStats({
        tasksCreated: stats.tasks.total,
        tasksCompleted: stats.tasks.completed,
        storageUsed: stats.storage.used,
        storageLimit: stats.storage.limit,
      });
    } catch (error) {
      console.error('Failed to load usage stats:', error);
    }
  };

  useEffect(() => {
    loadUsageStats();
  }, [user?.uid]);

  // プレミアム機能リスト
  const premiumFeatures: PremiumFeature[] = [
    {
      name: '高度な統計',
      icon: <BarChart className="h-3 w-3" />,
      description: 'タスク完了率や生産性のトレンドなど、詳細な分析と生産性インサイトを提供します。',
    },
    {
      name: 'データエクスポート',
      icon: <Download className="h-3 w-3" />,
      description: 'タスクデータをCSV、JSON、iCal形式でエクスポートし、他のツールと連携できます。',
    },
    {
      name: '自動優先度調整',
      icon: <Zap className="h-3 w-3" />,
      description: '期限に基づいてタスクの優先度を自動的に調整し、重要なタスクを見逃しません。',
      isNew: true,
    },
    {
      name: 'プライバシー保護',
      icon: <Shield className="h-3 w-3" />,
      description: 'エンドツーエンドの暗号化でデータを保護し、プライバシーを確保します。',
    },
  ];

  // プレミアムプラン情報
  const premiumPlans: PremiumPlanInfo[] = [
    {
      name: 'ベーシック',
      price: {
        monthly: 980,
        annual: 9800,
      },
      features: [
        'すべてのプレミアム機能',
        '最大100タスク',
        '基本的な統計分析',
        '30日間のデータ保存',
      ],
    },
    {
      name: 'プロフェッショナル',
      price: {
        monthly: 1980,
        annual: 19800,
      },
      features: [
        'すべてのプレミアム機能',
        '無制限のタスク',
        '高度な統計と予測',
        '1年間のデータ保存',
        '優先サポート',
      ],
      isPopular: true,
      discount: 20, // 年間プランの場合20%OFF
    },
    {
      name: 'エンタープライズ',
      price: {
        monthly: 4980,
        annual: 49800,
        lifetime: 99800,
      },
      features: [
        'すべてのプレミアム機能',
        'チーム共有機能',
        '詳細なレポート生成',
        '永続的なデータ保存',
        '専用サポート',
        'ホワイトラベル対応',
      ],
    },
  ];

  // 有効期限の表示形式を整形する
  const formatExpiryDate = (dateString?: string): string => {
    if (!dateString) return '無期限';

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (e) {
      console.error('日付形式エラー:', e);
      return '日付エラー';
    }
  };

  // 有効期限までの残り日数を計算
  const getDaysRemaining = (dateString?: string): number => {
    if (!dateString) return Infinity;

    try {
      const expiryDate = new Date(dateString);
      const today = new Date();

      // 時間部分をリセットして日付のみで比較
      expiryDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return Math.max(diffDays, 0); // 負の値にならないよう調整
    } catch (e) {
      console.error('日付計算エラー:', e);
      return 0;
    }
  };

  const daysRemaining = getDaysRemaining(expiresAt);
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining !== Infinity;
  const isTrialPeriod = daysRemaining <= 7 && !isPremium;

  // プレミアムプランの表示名を取得
  const getPlanDisplayName = (plan: 'monthly' | 'annual' | 'lifetime'): string => {
    switch (plan) {
      case 'monthly':
        return '月額プラン';
      case 'annual':
        return '年間プラン';
      case 'lifetime':
        return '永久ライセンス';
      default:
        return '月額プラン';
    }
  };

  // トライアル延長処理
  const handleExtendTrial = async () => {
    if (!user?.uid) return;

    setIsExtendingTrial(true);
    try {
      await extendTrialPeriod(user.uid, 7); // 7 days extension
      setSuccessMessage('Trial period extended successfully!');
      setTrialExtended(true);
    } catch (error) {
      console.error('Failed to extend trial:', error);
      setErrorMessage('Failed to extend trial period');
    } finally {
      setIsExtendingTrial(false);
    }
  };

  // プランの選択処理
  const handlePlanSelect = useCallback(
    (planType: string, cycle: 'monthly' | 'annual' | 'lifetime') => {
      // プラン選択ダイアログを閉じる
      setShowPlansDialog(false);

      // アップグレード処理を呼び出し
      onUpgrade();

      // 親コンポーネントにプラン選択を通知
      if (onPlanSelected) {
        onPlanSelected(planType, cycle);
      } else {
        // デフォルトの処理（リダイレクト）
        window.location.href = `/checkout?plan=${cycle}&type=${planType}`;
      }
    },
    [onUpgrade, onPlanSelected]
  );

  // ストレージ使用率の計算
  const calculateStorageUsage = (): number => {
    if (!usageStats) return 0;

    const { storageUsed, storageLimit } = usageStats;
    return Math.min(Math.round((storageUsed / storageLimit) * 100), 100);
  };

  return (
    <>
      <div
        className={`mb-4 rounded-md border overflow-hidden ${
          isPremium ? 'border-amber-200' : 'border-gray-200'
        }`}
      >
        {/* ヘッダー部分 */}
        <div
          className={`p-3 ${
            isPremium ? 'bg-gradient-to-r from-amber-100 to-yellow-100' : 'bg-gray-50'
          }`}
        >
          {isPremium ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center">
                <div className="bg-amber-500 rounded-full p-1 mr-2">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-medium">プレミアム機能が有効です</span>
                  <span className="text-xs text-gray-600 ml-2">
                    {getPlanDisplayName(premiumPlan)}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="ml-2 bg-amber-100 text-amber-800 border-amber-200"
                >
                  プレミアム
                </Badge>
              </div>

              <div className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 text-gray-500 mr-1" />
                        <span
                          className={`text-xs ${
                            isExpiringSoon ? 'text-red-600 font-medium' : 'text-gray-600'
                          }`}
                        >
                          {expiresAt
                            ? `有効期限: ${formatExpiryDate(expiresAt)}`
                            : '無期限サブスクリプション'}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isExpiringSoon
                        ? `あと${daysRemaining}日で有効期限が切れます。更新をお忘れなく。`
                        : '有効期限の詳細情報'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {isExpiringSoon && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2 text-xs h-7 bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                    onClick={() => setShowPlansDialog(true)}
                  >
                    更新する
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center">
                <div className="bg-gray-200 rounded-full p-1 mr-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <span className="text-sm">高度な機能はプレミアムプランでご利用いただけます</span>
                  <span className="text-xs text-gray-500 block sm:inline sm:ml-2">
                    月額¥980から
                  </span>
                </div>
              </div>

              <div className="flex items-center">
                {isTrialPeriod && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2 text-xs"
                    onClick={handleExtendTrial}
                    disabled={isExtendingTrial || trialExtended}
                  >
                    {isExtendingTrial ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        <span>処理中...</span>
                      </>
                    ) : trialExtended ? (
                      <span>延長しました！</span>
                    ) : (
                      <>
                        <Gift className="h-3 w-3 mr-1" />
                        <span>トライアルを延長</span>
                      </>
                    )}
                  </Button>
                )}

                <Button
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                  onClick={() => setShowPlansDialog(true)}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  <span className="text-xs">アップグレード</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 下部コンテンツ */}
        {isPremium ? (
          // プレミアムユーザー向け使用状況表示
          <div className="p-3 bg-white border-t border-gray-100">
            {isLoadingStats ? (
              <div className="flex justify-center items-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2" />
                <span className="text-xs text-gray-500">統計データを読み込み中...</span>
              </div>
            ) : usageStats ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-medium mb-1">ストレージ使用状況</h4>
                  <div className="flex items-center">
                    <Progress value={calculateStorageUsage()} className="h-2 w-32 mr-2" />
                    <span className="text-xs text-gray-600">
                      {usageStats.storageUsed.toLocaleString()} /{' '}
                      {usageStats.storageLimit.toLocaleString()} KB
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div>
                    <h4 className="text-xs font-medium mb-1">作成済みタスク</h4>
                    <span className="text-sm">{usageStats.tasksCreated.toLocaleString()}</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium mb-1">完了タスク</h4>
                    <span className="text-sm">{usageStats.tasksCompleted.toLocaleString()}</span>
                  </div>

                  {referralCode && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setShowReferralDialog(true)}
                    >
                      <Star className="h-3 w-3 mr-1 text-amber-500" />
                      <span>友達に紹介</span>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center py-2">
                <span className="text-xs text-gray-500">統計データを利用できません</span>
              </div>
            )}
          </div>
        ) : (
          // 非プレミアムユーザー向け機能紹介
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {premiumFeatures.map((feature, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-xs bg-gray-50 rounded-full px-2 py-1">
                        <div className="mr-1 text-amber-500">{feature.icon}</div>
                        <span>{feature.name}</span>
                        {feature.isNew && (
                          <Badge className="ml-1 text-[0.6rem] h-4 bg-green-100 text-green-800 border-0">
                            NEW
                          </Badge>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">{feature.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              <div className="flex items-center text-xs bg-amber-50 rounded-full px-2 py-1 text-amber-700">
                <Gift className="h-3 w-3 mr-1" />
                <span>7日間無料トライアル</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* プラン選択ダイアログ */}
      <PremiumPlanSelector
        isOpen={showPlansDialog}
        onClose={() => setShowPlansDialog(false)}
        onSelectPlan={handlePlanSelect}
        initialCycle={premiumPlan}
        plans={premiumPlans}
      />

      {/* リファラルダイアログ */}
      {referralCode && (
        <ReferralDialog
          isOpen={showReferralDialog}
          onClose={() => setShowReferralDialog(false)}
          referralCode={referralCode}
          appDomain={appDomain}
        />
      )}
    </>
  );
};
