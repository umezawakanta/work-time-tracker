/**
 * 🎮 ゲーミフィケーション連携ToDoフック
 * タスク完了時のXP付与、レベルアップ、バッジ解除などを処理
 */

import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateTodoItem } from '@/store/todoSlice';
import {
  integratedGamificationService,
  GamificationReward,
  TaskCompletionData,
} from '@/services/gamification/IntegratedGamificationService';
import { Todo } from '@/types/todo';
import { toast } from 'react-hot-toast';

export interface UseGamifiedTodoCompletionResult {
  completeTask: (todo: Todo, qualityData?: { score: number; timeSpent: number }) => Promise<void>;
  isProcessing: boolean;
  lastRewards: GamificationReward[];
  playerLevel: number;
  totalXP: number;
  streakDays: number;
}

export const useGamifiedTodoCompletion = (): UseGamifiedTodoCompletionResult => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastRewards, setLastRewards] = useState<GamificationReward[]>([]);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [totalXP, setTotalXP] = useState(0);
  const [streakDays, setStreakDays] = useState(0);

  /**
   * 🎯 ゲーミフィケーション統合タスク完了処理
   */
  const completeTask = useCallback(
    async (todo: Todo, qualityData?: { score: number; timeSpent: number }): Promise<void> => {
      if (isProcessing) return;

      setIsProcessing(true);

      try {
        // 1. ToDo状態を更新（Redux）
        await dispatch(
          updateTodoItem({
            _id: todo._id,
            updates: {
              completed: !todo.completed,
              completedDate: !todo.completed ? new Date().toISOString() : null,
            },
          })
        ).unwrap();

        // タスク完了の場合のみゲーミフィケーション処理
        if (!todo.completed) {
          // 2. タスク完了データを準備
          const completionData: TaskCompletionData = {
            taskId: todo._id,
            task: todo,
            completionTime: qualityData?.timeSpent || 0,
            qualityScore: qualityData?.score,
            contextualBonus: calculateContextualBonus(todo),
            streakContribution: true, // 連続日数に貢献
          };

          // 3. 統合ゲーミフィケーションサービスで報酬処理
          const rewards = await integratedGamificationService.processTaskCompletion(completionData);
          setLastRewards(rewards);

          // 4. 更新されたプレイヤー情報を取得
          const dashboardData = await integratedGamificationService.getDashboardData();
          setPlayerLevel(dashboardData.player.level);
          setTotalXP(dashboardData.player.totalXP);
          setStreakDays(dashboardData.player.streakDays);

          // 5. ユーザーに報酬を通知
          displayRewardNotifications(rewards, todo.task);

          console.log('🎮 Gamification rewards processed:', {
            taskTitle: todo.task,
            totalRewards: rewards.length,
            totalXP: rewards.reduce((sum, r) => sum + (r.type === 'xp' ? r.amount : 0), 0),
            newLevel: dashboardData.player.level,
            badges: rewards.filter((r) => r.type === 'badge').length,
          });
        } else {
          // タスクを未完了に戻す場合は簡単な通知のみ
          toast.success('タスクを未完了に戻しました');
        }
      } catch (error) {
        console.error('Gamified task completion failed:', error);
        toast.error('タスクの更新に失敗しました');

        // エラー時はToDo状態を元に戻す
        await dispatch(
          updateTodoItem({
            _id: todo._id,
            updates: {
              completed: todo.completed,
              completedDate: todo.completedDate,
            },
          })
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [dispatch, isProcessing]
  );

  return {
    completeTask,
    isProcessing,
    lastRewards,
    playerLevel,
    totalXP,
    streakDays,
  };
};

/**
 * 🎯 コンテキストボーナス計算
 */
function calculateContextualBonus(todo: Todo): number {
  let bonus = 0;
  const now = new Date();
  const hour = now.getHours();

  // 早朝完了ボーナス (6-9時)
  if (hour >= 6 && hour <= 9) {
    bonus += 5;
  }

  // 深夜完了ボーナス (22-24時)
  if (hour >= 22) {
    bonus += 3;
  }

  // 期限当日完了ボーナス
  if (todo.deadline) {
    const deadline = new Date(todo.deadline);
    const today = new Date();
    if (deadline.toDateString() === today.toDateString()) {
      bonus += 10;
    }
  }

  // 高優先度タスクボーナス
  if (todo.priority >= 4) {
    bonus += 8;
  }

  // AI生成タスクボーナス
  if (todo.tags?.includes('AI生成')) {
    bonus += 5;
  }

  return bonus;
}

/**
 * 🎉 報酬通知の表示
 */
function displayRewardNotifications(rewards: GamificationReward[], taskTitle: string): void {
  // XP獲得の通知
  const xpRewards = rewards.filter((r) => r.type === 'xp');
  const totalXP = xpRewards.reduce((sum, r) => sum + r.amount, 0);

  if (totalXP > 0) {
    toast.success(`🎉 「${taskTitle}」完了！+${totalXP} XP獲得`, {
      duration: 3000,
      style: {
        background: '#10B981',
        color: 'white',
      },
    });
  }

  // レベルアップ通知
  const levelUpRewards = rewards.filter((r) => r.type === 'level_up');
  levelUpRewards.forEach((reward) => {
    toast.success(`🎊 ${reward.description}`, {
      duration: 5000,
      style: {
        background: '#8B5CF6',
        color: 'white',
        fontWeight: 'bold',
      },
    });
  });

  // バッジ獲得通知
  const badgeRewards = rewards.filter((r) => r.type === 'badge');
  badgeRewards.forEach((reward) => {
    toast.success(`🏅 ${reward.description}`, {
      duration: 4000,
      style: {
        background: '#F59E0B',
        color: 'white',
      },
    });
  });

  // ストリークボーナス通知
  const streakRewards = rewards.filter((r) => r.type === 'streak_bonus');
  streakRewards.forEach((reward) => {
    toast.success(`🔥 ${reward.description}`, {
      duration: 4000,
      style: {
        background: '#EF4444',
        color: 'white',
      },
    });
  });

  // AI強化ボーナス通知
  const aiRewards = rewards.filter((r) => r.aiEnhanced);
  if (aiRewards.length > 0) {
    const aiBonus = aiRewards.reduce((sum, r) => sum + r.amount, 0);
    toast.success(`🤖 AI強化ボーナス +${aiBonus} XP！`, {
      duration: 3000,
      style: {
        background: '#3B82F6',
        color: 'white',
      },
    });
  }
}
