import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  MessageCircle,
  X,
  Crown,
  Sparkles,
  TrendingUp,
  Target,
  Coins,
  ChevronDown,
  Volume2,
  VolumeX,
  Music,
  Headphones,
  Code,
  Settings,
  Bug,
  Lightbulb,
  PieChart,
  Wrench,
  BarChart3,
} from 'lucide-react';
import {
  dragonQuestAIService,
  DragonQuestAIService,
} from '@/services/assetQuest/DragonQuestAIService';
import { developmentTaskService } from '@/services/assetQuest/DevelopmentTaskService';
import { soundManager } from '@/utils/soundManager';
import { cn } from '@/lib/utils';
import { ErrorRecoveryService } from '@/services/ErrorRecoveryService';

interface ChatMessage {
  id: string;
  character: 'king' | 'sage' | 'merchant' | 'guard' | 'architect' | 'tester';
  message: string;
  timestamp: Date;
  type: 'advice' | 'mission' | 'celebration' | 'warning' | 'development' | 'technical';
  actions?: Array<{
    label: string;
    action: () => void;
    icon?: React.ReactNode;
  }>;
}

interface DeveloperStatus {
  siteCompletion: number;
  priorityTasksCount: number;
  criticalIssuesCount: number;
  testCoverage: number;
  deploymentReady: boolean;
  lastCommitDays: number;
  badgeProgress?: {
    enabled: boolean;
    overallBadgeProgress: number;
    totalBadges: number;
    completedBadges: number;
    relatedBadges: Array<{
      badgeId: string;
      badgeName: string;
      progress: number;
      category: string;
    }>;
  };
}

interface DragonQuestChatbotProps {
  currentLevel: number;
  totalAssets: number;
  savingsRate: number;
  questCompleted: boolean;
  streakDays: number;
  isGlobalMode?: boolean;
  isOpen?: boolean;
  triggeredAction?: string | null;
  onClose?: () => void;
}

export const DragonQuestChatbot: React.FC<DragonQuestChatbotProps> = ({
  currentLevel,
  totalAssets,
  savingsRate,
  questCompleted,
  streakDays,
  isGlobalMode = false,
  isOpen: externalIsOpen,
  triggeredAction,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(externalIsOpen ?? false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<ChatMessage | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(soundManager.isSoundMuted());
  const [isBgmMuted, setIsBgmMuted] = useState(soundManager.isBgmSoundMuted());
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [showDevActions, setShowDevActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSoundTime = useRef<number>(0);
  const [loading, setLoading] = useState(false);

  // グローバルモード時の外部制御
  useEffect(() => {
    if (isGlobalMode && externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);

      // 特定のアクションが指定されている場合、そのアクションを実行
      if (externalIsOpen && triggeredAction) {
        handleLifeSupportAction(triggeredAction);
      }
    }
  }, [externalIsOpen, triggeredAction, isGlobalMode]);

  useEffect(() => {
    initializeBot();
    // サウンドマネージャーを初期化
    soundManager.initialize();
  }, [currentLevel, questCompleted, streakDays, isDeveloperMode]);

  useEffect(() => {
    if (currentMessage && isTyping) {
      const timer = setTimeout(() => {
        if (textIndex < currentMessage.message.length) {
          setTextIndex(textIndex + 1);

          // DQ風テキスト表示音を再生（3文字に1回）
          const now = Date.now();
          if (textIndex % 3 === 0 && now - lastSoundTime.current > 100) {
            soundManager.playTextSound();
            lastSoundTime.current = now;
          }
        } else {
          setIsTyping(false);
          // メッセージ完了音を再生
          soundManager.playMessageCompleteSound();
        }
      }, 50); // タイピング速度
      return () => clearTimeout(timer);
    }
  }, [currentMessage, isTyping, textIndex]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeBot = async () => {
    // 開発者モードを設定
    dragonQuestAIService.setDeveloperMode(isDeveloperMode);

    const userStatus = {
      level: currentLevel,
      totalAssets,
      savingsRate,
      questCompleted,
      streakDays,
    };

    const developerStatus = isDeveloperMode ? getDeveloperStatus() : undefined;
    const advice = await dragonQuestAIService.getNextAdvice(userStatus, developerStatus);

    if (advice) {
      addMessage(advice);
    }
  };

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
    setCurrentMessage(message);
    setTextIndex(0);
    setIsTyping(true);

    // メッセージタイプに応じて特別なサウンドを再生
    if (message.type === 'celebration') {
      // 少し遅れてレベルアップ音を再生
      setTimeout(() => {
        soundManager.playLevelUpSound();
      }, 500);
    } else if (message.type === 'warning') {
      soundManager.playWarningSound();
    }
  };

  const getCharacterEmoji = (character: ChatMessage['character']): string => {
    switch (character) {
      case 'king':
        return '👑';
      case 'sage':
        return '🧙‍♂️';
      case 'merchant':
        return '👨‍💼';
      case 'guard':
        return '🛡️';
      case 'architect':
        return '🏗️';
      case 'tester':
        return '🧪';
      default:
        return '👑';
    }
  };

  const getCharacterName = (character: ChatMessage['character']): string => {
    switch (character) {
      case 'king':
        return '王様';
      case 'sage':
        return '賢者';
      case 'merchant':
        return '商人';
      case 'guard':
        return '衛兵';
      case 'architect':
        return 'アーキテクト';
      case 'tester':
        return 'テスター';
      default:
        return '王様';
    }
  };

  const getMessageBoxColor = (type: ChatMessage['type']): string => {
    switch (type) {
      case 'advice':
        return 'from-blue-500 to-blue-700';
      case 'mission':
        return 'from-green-500 to-green-700';
      case 'celebration':
        return 'from-yellow-500 to-yellow-700';
      case 'warning':
        return 'from-red-500 to-red-700';
      case 'development':
        return 'from-purple-500 to-purple-700';
      case 'technical':
        return 'from-indigo-500 to-indigo-700';
      default:
        return 'from-blue-500 to-blue-700';
    }
  };

  const getDeveloperStatus = () => {
    try {
      console.log('🔍 開発者ステータス取得開始...');

      // 緊急回避：バッジ統合が原因の場合はスキップ
      const emergencyMode = localStorage.getItem('dev-emergency-mode') === 'true';
      if (emergencyMode) {
        console.log('🚨 緊急モード: バッジ統合なしで動作');
        return {
          siteCompletion: 75,
          priorityTasksCount: 3,
          criticalIssuesCount: 1,
          testCoverage: 60,
          deploymentReady: false,
          lastCommitDays: 2,
          badgeProgress: undefined,
        };
      }

      console.log('📊 DevelopmentTaskService呼び出し中...');
      const dashboardData = developmentTaskService.getDeveloperDashboardData();
      console.log('📊 ダッシュボードデータ:', dashboardData);

      const badgeData = dashboardData.badgeProgress;
      console.log('🏆 バッジデータ:', badgeData);

      // バッジデータを適切な型に変換
      let badgeProgress: DeveloperStatus['badgeProgress'] = undefined;
      if (
        badgeData &&
        badgeData.enabled &&
        'totalBadges' in badgeData &&
        'completedBadges' in badgeData &&
        typeof (badgeData as any).totalBadges === 'number' &&
        typeof (badgeData as any).completedBadges === 'number'
      ) {
        const typedBadgeData = badgeData as any;
        badgeProgress = {
          enabled: badgeData.enabled,
          overallBadgeProgress: badgeData.overallBadgeProgress,
          totalBadges: typedBadgeData.totalBadges,
          completedBadges: typedBadgeData.completedBadges,
          relatedBadges: (badgeData.relatedBadges || []).map((badge: any) => ({
            badgeId: badge.badgeId,
            badgeName: badge.badgeName,
            progress: badge.progress,
            category: badge.category,
          })),
        };
        console.log('✅ バッジ進捗データ変換成功:', badgeProgress);
      } else {
        console.log('⚠️ バッジデータが無効または不完全:', {
          badgeData,
          enabled: badgeData?.enabled,
          hasTotalBadges: 'totalBadges' in (badgeData || {}),
          totalBadgesType: typeof (badgeData as any)?.totalBadges,
          completedBadgesType: typeof (badgeData as any)?.completedBadges,
        });
      }

      const result = {
        siteCompletion: dashboardData.metrics.overallCompletion,
        priorityTasksCount: dashboardData.priorityTasks.length,
        criticalIssuesCount: dashboardData.metrics.criticalTasksRemaining,
        testCoverage:
          (dashboardData.metrics.categoryBreakdown as Record<string, number>)?.testing || 45,
        deploymentReady:
          ((dashboardData.metrics.categoryBreakdown as Record<string, number>)?.deployment || 0) >=
          80,
        lastCommitDays: Math.floor(Math.random() * 5), // サンプルデータ
        badgeProgress,
      };

      console.log('✅ 開発者ステータス生成完了:', result);
      return result;
    } catch (error) {
      console.error('❌ 開発者ステータス取得エラー:', error);
      // エラー時はデフォルト値を返す
      return {
        siteCompletion: 50,
        priorityTasksCount: 0,
        criticalIssuesCount: 0,
        testCoverage: 45,
        deploymentReady: false,
        lastCommitDays: 1,
        badgeProgress: undefined,
      };
    }
  };

  const handleQuickAction = async (actionType: string) => {
    try {
      console.log(`🎮 クイックアクション実行: ${actionType}`);

      // ボタンクリック音を再生
      soundManager.playButtonSound();

      const userStatus = {
        level: currentLevel,
        totalAssets,
        savingsRate,
        questCompleted,
        streakDays,
      };
      console.log('👤 ユーザーステータス:', userStatus);

      const developerStatus = isDeveloperMode ? getDeveloperStatus() : undefined;
      console.log('🔧 開発者ステータス:', developerStatus);
      console.log('🎯 開発者モード:', isDeveloperMode);

      console.log('📞 AIサービスを呼び出し中...');
      const response = await dragonQuestAIService.handleQuickAction(
        actionType,
        userStatus,
        developerStatus
      );

      console.log('💬 AIレスポンス:', response);

      if (response) {
        addMessage(response);
        console.log('✅ メッセージ追加完了');
      } else {
        console.warn('⚠️ AIサービスからレスポンスがありません');

        // デバッグ用の緊急メッセージを表示
        const debugMessage: ChatMessage = {
          id: Date.now().toString(),
          character: 'sage',
          message: `デバッグ: ${actionType} アクションが実行されましたが、AIからの応答がありませんでした。\n\n開発者コンソールを確認してください。\n\n問題が続く場合は、以下をコンソールで実行してください：\nlocalStorage.setItem('dev-disable-badges', 'true'); location.reload();`,
          timestamp: new Date(),
          type: 'warning',
          actions: [
            {
              label: '緊急モード有効化',
              action: () => {
                localStorage.setItem('dev-emergency-mode', 'true');
                console.log('🚨 緊急モードを有効化しました。ページをリロードします...');
                window.location.reload();
              },
            },
            {
              label: 'バッジ統合を無効化',
              action: () => {
                localStorage.setItem('dev-disable-badges', 'true');
                window.location.reload();
              },
            },
            {
              label: 'コンソールログを表示',
              action: () => {
                console.log('=== 現在のデバッグ状況 ===');
                console.log('開発者モード:', isDeveloperMode);
                console.log('バッジ統合状態:', localStorage.getItem('dev-disable-badges'));
                console.log('緊急モード状態:', localStorage.getItem('dev-emergency-mode'));
                console.log('現在時刻:', new Date().toISOString());
              },
            },
          ],
        };
        addMessage(debugMessage);
      }
    } catch (error) {
      console.error('❌ クイックアクション実行エラー:', error);

      // エラーメッセージを表示
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        character: 'sage',
        message: `申し訳ない！「${actionType}」の実行中にエラーが発生したようじゃ。\n\nエラー: ${error instanceof Error ? error.message : 'Unknown error'}\n\n開発者コンソールで詳細を確認できるぞ。`,
        timestamp: new Date(),
        type: 'warning',
        actions: [
          {
            label: '再試行',
            action: () => handleQuickAction(actionType),
          },
        ],
      };
      addMessage(errorMessage);
    }
  };

  const toggleDeveloperMode = () => {
    setIsDeveloperMode(!isDeveloperMode);
    dragonQuestAIService.setDeveloperMode(!isDeveloperMode);
    soundManager.playButtonSound();

    // 開発者モード切り替え時のメッセージ
    if (!isDeveloperMode) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        character: 'architect',
        message:
          '開発者モードが有効になりました！\n\nサイト完成に向けたタスクやアドバイスをお手伝いします。\n\n開発の進捗を一緒に管理していきましょう！',
        timestamp: new Date(),
        type: 'development',
        actions: [
          {
            label: '開発状況を確認',
            action: () => handleQuickAction('dev-status'),
          },
        ],
      };
      setTimeout(() => addMessage(welcomeMessage), 500);
    }
  };

  const toggleSound = () => {
    const newMuteState = soundManager.toggleMute();
    setIsMuted(newMuteState);

    // サウンドテスト
    if (!newMuteState) {
      soundManager.playButtonSound();
    }
  };

  const toggleBgm = () => {
    const newBgmMuteState = soundManager.toggleBgmMute();
    setIsBgmMuted(newBgmMuteState);

    if (!newBgmMuteState) {
      // BGMを再開
      soundManager.startQuestPageBgm();
      soundManager.playButtonSound();
    } else {
      // BGMを停止
      soundManager.stopQuestPageBgm();
    }
  };

  // ライフサポートボタンのクリック処理
  const handleLifeSupportAction = async (actionType: string) => {
    setLoading(true);
    try {
      console.log(`🎯 ライフサポートアクション: ${actionType}`);

      // 新しいAI統合を使用
      const aiResponse = await DragonQuestAIService.generateResponse(actionType, {
        userStatus: {
          level: 1,
          totalAssets: 0,
          savingsRate: 0,
          questCompleted: false,
          streakDays: 0,
        },
        lifeStatus: {
          bankBalance: undefined,
          hasJob: undefined,
          hasHome: undefined,
          healthStatus: 'unknown',
          hasHealthInsurance: undefined,
          anxietyLevel: 'medium',
          depressionLevel: 'low',
          socialSupport: 'moderate',
        },
      });

      // DragonQuestResponseをChatMessageに変換
      const chatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        character: aiResponse.character,
        message: aiResponse.message,
        timestamp: new Date(),
        type: aiResponse.type,
        actions:
          aiResponse.actions?.map((action: { label: string; actionType: string }) => ({
            label: action.label,
            action: () => handleLifeSupportAction(action.actionType),
            icon: undefined,
          })) || [],
      };

      setMessages((prev) => [...prev, chatMessage]);

      // メッセージエリアを最下部にスクロール
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error('❌ AI応答生成エラー:', error);

      // エラー時のフォールバックメッセージ
      const errorMessage = {
        id: `error_${Date.now()}`,
        character: 'sage' as const,
        message: `申し訳ありません！AI応答の生成中にエラーが発生しました。\n\nエラー内容: ${error instanceof Error ? error.message : 'Unknown error'}\n\n通常の応答に戻ります。もう一度お試しください。`,
        timestamp: new Date(),
        type: 'warning' as const,
        actions: [
          {
            label: '再試行',
            action: () => handleLifeSupportAction(actionType),
            icon: undefined,
          },
        ],
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (isGlobalMode && onClose) {
      onClose();
    }
  }, [isGlobalMode, onClose]);

  if (!isOpen) {
    // グローバルモードでは非表示時はnullを返す
    if (isGlobalMode) {
      return null;
    }

    // 通常モード（Asset Quest専用）では元の浮動ボタンを表示
    return (
      <div className="fixed bottom-6 right-32 z-50">
        <Button
          onClick={() => {
            soundManager.playButtonSound();
            setIsOpen(true);
          }}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
        >
          <MessageCircle className="w-8 h-8 text-white" />
        </Button>
        {/* 新しいメッセージがある場合の通知 */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
          <span className="text-white text-xs font-bold">!</span>
        </div>
        {/* 開発者モードインジケーター */}
        {isDeveloperMode && (
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
            <Code className="w-3 h-3 text-white" />
          </div>
        )}
        {/* BGM状態インジケーター */}
        <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-blue-600">
          {isBgmMuted ? (
            <VolumeX className="w-3 h-3 text-gray-400" />
          ) : (
            <Music className="w-3 h-3 text-blue-500" />
          )}
        </div>
        {/* サウンド状態インジケーター */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-green-600">
          {isMuted ? (
            <VolumeX className="w-3 h-3 text-gray-400" />
          ) : (
            <Volume2 className="w-3 h-3 text-green-500" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fixed z-50 w-96 max-w-sm',
        isGlobalMode ? 'bottom-6 right-6' : 'bottom-6 right-32'
      )}
    >
      <Card className="bg-gradient-to-b from-blue-50 to-indigo-100 border-4 border-blue-800 shadow-2xl">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <h3 className="font-bold text-lg">
                {isGlobalMode ? '🤗 人生サポート案内' : '🏰 王国の案内'}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              {/* 開発者モード切り替えボタン */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDeveloperMode}
                className={`text-white hover:bg-blue-600 p-1 ${isDeveloperMode ? 'bg-purple-600' : ''}`}
                title={isDeveloperMode ? '開発者モードを無効にする' : '開発者モードを有効にする'}
              >
                <Code className="w-4 h-4" />
              </Button>
              {/* BGM切り替えボタン */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleBgm}
                className="text-white hover:bg-blue-600 p-1"
                title={isBgmMuted ? 'BGMを有効にする' : 'BGMを無効にする'}
              >
                {isBgmMuted ? <VolumeX className="w-4 h-4" /> : <Music className="w-4 h-4" />}
              </Button>
              {/* サウンド切り替えボタン */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSound}
                className="text-white hover:bg-blue-600 p-1"
                title={isMuted ? 'サウンドを有効にする' : 'サウンドを無効にする'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-white hover:bg-blue-600 p-1"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* メッセージエリア */}
        <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-blue-50 to-white">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              {/* キャラクター情報 */}
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCharacterEmoji(msg.character)}</span>
                <span className="font-bold text-blue-900">{getCharacterName(msg.character)}</span>
              </div>

              {/* DQ風メッセージボックス */}
              <div
                className={`bg-gradient-to-r ${getMessageBoxColor(msg.type)} p-4 rounded-lg border-4 border-white shadow-lg`}
              >
                <div className="bg-white bg-opacity-90 p-3 rounded border-2 border-gray-800">
                  <p className="text-gray-900 font-medium leading-relaxed">
                    {msg === currentMessage && isTyping
                      ? msg.message.slice(0, textIndex)
                      : msg.message}
                    {msg === currentMessage && isTyping && <span className="animate-pulse">▌</span>}
                  </p>
                </div>
              </div>

              {/* アクションボタン */}
              {msg.actions && !isTyping && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.actions.map((action, index) => (
                    <Button
                      key={index}
                      onClick={() => {
                        soundManager.playButtonSound();
                        action.action();
                      }}
                      variant="outline"
                      size="sm"
                      className="bg-white border-2 border-blue-300 hover:bg-blue-50 text-blue-800 font-medium"
                    >
                      {action.icon && <span className="mr-1">{action.icon}</span>}
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* クイックアクション */}
        <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 border-t-4 border-blue-800">
          {!isDeveloperMode ? (
            // 通常モードのアクション
            <div className="space-y-3">
              {/* ライフサポート機能 */}
              <div className="bg-gradient-to-r from-pink-100 to-yellow-100 p-3 rounded-lg border-2 border-pink-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🤗</span>
                  <span className="text-sm font-bold text-pink-800">人生サポート</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleLifeSupportAction('life-support')}
                    variant="outline"
                    size="sm"
                    className="bg-white border-2 border-pink-300 hover:bg-pink-50 text-pink-800"
                  >
                    🤗 何をすべき？
                  </Button>
                  <Button
                    onClick={() => handleLifeSupportAction('daily-plan')}
                    variant="outline"
                    size="sm"
                    className="bg-white border-2 border-orange-300 hover:bg-orange-50 text-orange-800"
                  >
                    🌅 今日の計画
                  </Button>
                  <Button
                    onClick={() => handleLifeSupportAction('emergency-help')}
                    variant="outline"
                    size="sm"
                    className="bg-white border-2 border-red-300 hover:bg-red-50 text-red-800"
                  >
                    🚨 緊急時対応
                  </Button>
                  <Button
                    onClick={() => handleLifeSupportAction('basic-needs')}
                    variant="outline"
                    size="sm"
                    className="bg-white border-2 border-green-300 hover:bg-green-50 text-green-800"
                  >
                    🏠 基本確認
                  </Button>
                  <Button
                    onClick={() => handleLifeSupportAction('mental-health')}
                    variant="outline"
                    size="sm"
                    className="bg-white border-2 border-purple-300 hover:bg-purple-50 text-purple-800"
                  >
                    🧠 心のケア
                  </Button>
                  <Button
                    onClick={() => handleLifeSupportAction('skill-building')}
                    variant="outline"
                    size="sm"
                    className="bg-white border-2 border-blue-300 hover:bg-blue-50 text-blue-800"
                  >
                    🎯 スキル習得
                  </Button>
                </div>
              </div>

              {/* 資産形成機能 */}
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-lg border-2 border-blue-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">👑</span>
                  <span className="text-sm font-bold text-blue-800">資産形成クエスト</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleQuickAction('advice')}
                    variant="outline"
                    size="sm"
                    className="bg-white border-2 border-blue-300 hover:bg-blue-50 text-blue-800"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    助言を求む
                  </Button>
                  <Button
                    onClick={() => handleQuickAction('status')}
                    variant="outline"
                    size="sm"
                    className="bg-white border-2 border-green-300 hover:bg-green-50 text-green-800"
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    現状確認
                  </Button>
                  <Button
                    onClick={() => handleQuickAction('mission')}
                    variant="outline"
                    size="sm"
                    className="bg-white border-2 border-purple-300 hover:bg-purple-50 text-purple-800"
                  >
                    <Target className="w-4 h-4 mr-1" />
                    新たな使命
                  </Button>
                  <Button
                    onClick={() => handleQuickAction('reward')}
                    variant="outline"
                    size="sm"
                    className="bg-white border-2 border-yellow-300 hover:bg-yellow-50 text-yellow-800"
                  >
                    <Coins className="w-4 h-4 mr-1" />
                    報酬確認
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // 開発者モードのアクション
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">開発者コマンド</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDevActions(!showDevActions)}
                  className="ml-auto p-1"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showDevActions ? 'rotate-180' : ''}`}
                  />
                </Button>
              </div>

              {showDevActions && (
                <div className="space-y-2">
                  {/* 第1行: 開発関連 */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={async () => {
                        console.log('🔧 開発状況ボタンがクリックされました');
                        try {
                          await handleQuickAction('dev-status');
                        } catch (error) {
                          console.error('🚨 開発状況ボタンクリックエラー:', error);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="bg-white border-2 border-purple-300 hover:bg-purple-50 text-purple-800"
                    >
                      <PieChart className="w-4 h-4 mr-1" />
                      開発状況
                    </Button>
                    <Button
                      onClick={async () => {
                        console.log('🔧 タスク確認ボタンがクリックされました');
                        try {
                          await handleQuickAction('dev-tasks');
                        } catch (error) {
                          console.error('🚨 タスク確認ボタンクリックエラー:', error);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="bg-white border-2 border-indigo-300 hover:bg-indigo-50 text-indigo-800"
                    >
                      <Bug className="w-4 h-4 mr-1" />
                      タスク確認
                    </Button>
                  </div>

                  {/* 第2行: バッジ関連 */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleQuickAction('badge-status')}
                      variant="outline"
                      size="sm"
                      className="bg-white border-2 border-yellow-300 hover:bg-yellow-50 text-yellow-800"
                    >
                      <Crown className="w-4 h-4 mr-1" />
                      バッジ状況
                    </Button>
                    <Button
                      onClick={() => handleQuickAction('badge-recommendations')}
                      variant="outline"
                      size="sm"
                      className="bg-white border-2 border-orange-300 hover:bg-orange-50 text-orange-800"
                    >
                      <Target className="w-4 h-4 mr-1" />
                      推奨バッジ
                    </Button>
                  </div>

                  {/* 第3行: その他 */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleQuickAction('dev-tips')}
                      variant="outline"
                      size="sm"
                      className="bg-white border-2 border-cyan-300 hover:bg-cyan-50 text-cyan-800"
                    >
                      <Lightbulb className="w-4 h-4 mr-1" />
                      開発のコツ
                    </Button>
                    <Button
                      onClick={() => handleQuickAction('site-completion')}
                      variant="outline"
                      size="sm"
                      className="bg-white border-2 border-teal-300 hover:bg-teal-50 text-teal-800"
                    >
                      <Wrench className="w-4 h-4 mr-1" />
                      完成度確認
                    </Button>
                  </div>
                </div>
              )}

              {/* 通常アクションも表示（縮小版） */}
              <div className="border-t pt-2 mt-2">
                <div className="grid grid-cols-4 gap-1">
                  <Button
                    onClick={() => handleQuickAction('advice')}
                    variant="outline"
                    size="sm"
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs p-1"
                  >
                    <Sparkles className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => handleQuickAction('status')}
                    variant="outline"
                    size="sm"
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs p-1"
                  >
                    <TrendingUp className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => handleQuickAction('mission')}
                    variant="outline"
                    size="sm"
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs p-1"
                  >
                    <Target className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => handleQuickAction('reward')}
                    variant="outline"
                    size="sm"
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs p-1"
                  >
                    <Coins className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
