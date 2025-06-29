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
} from 'lucide-react';
import { dragonQuestAIService } from '@/services/assetQuest/DragonQuestAIService';
import { soundManager } from '@/utils/soundManager';

interface ChatMessage {
  id: string;
  character: 'king' | 'sage' | 'merchant' | 'guard';
  message: string;
  timestamp: Date;
  type: 'advice' | 'mission' | 'celebration' | 'warning';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSoundTime = useRef<number>(0);

  useEffect(() => {
    initializeBot();
    // サウンドマネージャーを初期化
    soundManager.initialize();
  }, [currentLevel, questCompleted, streakDays]);

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
    const advice = await dragonQuestAIService.getNextAdvice({
      level: currentLevel,
      totalAssets,
      savingsRate,
      questCompleted,
      streakDays,
    });

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
      default:
        return 'from-blue-500 to-blue-700';
    }
  };

  const handleQuickAction = async (actionType: string) => {
    // ボタンクリック音を再生
    soundManager.playButtonSound();

    const response = await dragonQuestAIService.handleQuickAction(actionType, {
      level: currentLevel,
      totalAssets,
      savingsRate,
      questCompleted,
      streakDays,
    });

    if (response) {
      addMessage(response);
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
      </Card>
    </div>
  );
};
