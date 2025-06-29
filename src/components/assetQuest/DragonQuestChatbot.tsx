import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { dragonQuestAIService } from '@/services/assetQuest/DragonQuestAIService';
import { developmentTaskService } from '@/services/assetQuest/DevelopmentTaskService';
import { soundManager } from '@/utils/soundManager';

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

interface DragonQuestChatbotProps {
  currentLevel: number;
  totalAssets: number;
  savingsRate: number;
  questCompleted: boolean;
  streakDays: number;
}

export const DragonQuestChatbot: React.FC<DragonQuestChatbotProps> = ({
  currentLevel,
  totalAssets,
  savingsRate,
  questCompleted,
  streakDays,
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
    const dashboardData = developmentTaskService.getDeveloperDashboardData();
    return {
      siteCompletion: dashboardData.metrics.overallCompletion,
      priorityTasksCount: dashboardData.priorityTasks.length,
      criticalIssuesCount: dashboardData.metrics.criticalTasksRemaining,
      testCoverage: dashboardData.metrics.categoryBreakdown.testing || 45,
      deploymentReady: dashboardData.metrics.categoryBreakdown.deployment >= 80,
      lastCommitDays: Math.floor(Math.random() * 5), // サンプルデータ
    };
  };

  const handleQuickAction = async (actionType: string) => {
    // ボタンクリック音を再生
    soundManager.playButtonSound();

    const userStatus = {
      level: currentLevel,
      totalAssets,
      savingsRate,
      questCompleted,
      streakDays,
    };

    const developerStatus = isDeveloperMode ? getDeveloperStatus() : undefined;
    const response = await dragonQuestAIService.handleQuickAction(
      actionType,
      userStatus,
      developerStatus
    );

    if (response) {
      addMessage(response);
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

  if (!isOpen) {
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
    <div className="fixed bottom-6 right-32 z-50 w-96 max-w-sm">
      <Card className="bg-gradient-to-b from-blue-50 to-indigo-100 border-4 border-blue-800 shadow-2xl">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <h3 className="font-bold text-lg">🏰 王国の案内</h3>
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
                onClick={() => {
                  soundManager.playButtonSound();
                  setIsOpen(false);
                }}
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
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleQuickAction('dev-status')}
                    variant="outline"
                    size="sm"
                    className="bg-white border-2 border-purple-300 hover:bg-purple-50 text-purple-800"
                  >
                    <PieChart className="w-4 h-4 mr-1" />
                    開発状況
                  </Button>
                  <Button
                    onClick={() => handleQuickAction('dev-tasks')}
                    variant="outline"
                    size="sm"
                    className="bg-white border-2 border-indigo-300 hover:bg-indigo-50 text-indigo-800"
                  >
                    <Bug className="w-4 h-4 mr-1" />
                    タスク確認
                  </Button>
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
