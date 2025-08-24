import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { TodoItem } from '@/types';
import achievementService from '@/services/achievementService';
import {
  setAchievements,
  addNotification,
  updateUserStats,
  setLastChecked,
} from '@/store/achievementSlice';
import { toast } from 'react-hot-toast';

export const useAchievements = () => {
  const dispatch = useDispatch();
  const achievements = useSelector((state: RootState) => state.achievements.achievements);
  const notifications = useSelector((state: RootState) => state.achievements.notifications);
  const userStats = useSelector((state: RootState) => state.achievements.userStats);
  const showNotifications = useSelector((state: RootState) => state.achievements.showNotifications);
  const tasks = useSelector((state: RootState) => state.todo.items);

  // 初期化時に実績データを読み込み
  useEffect(() => {
    achievementService.loadUserAchievements();
    const allAchievements = achievementService.getAllAchievements();
    const stats = achievementService.getUserStats();

    dispatch(setAchievements(allAchievements));
    dispatch(updateUserStats(stats));
  }, [dispatch]);

  // タスクが変更されたときに実績をチェック
  const checkAchievements = useCallback(
    (updatedTasks?: TodoItem[]) => {
      const tasksToCheck = updatedTasks || tasks;
      const newNotifications = achievementService.checkForNewAchievements(tasksToCheck);

      // 新しい実績通知を追加
      newNotifications.forEach((notification) => {
        dispatch(addNotification(notification));

        if (showNotifications) {
          toast.success(`🏆 ${notification.message}`, {
            duration: 5000,
            position: 'top-center',
          });
        }
      });

      // 更新された実績と統計を反映
      const updatedAchievements = achievementService.getAllAchievements();
      const updatedStats = achievementService.getUserStats();

      dispatch(setAchievements(updatedAchievements));
      dispatch(updateUserStats(updatedStats));
      dispatch(setLastChecked(new Date().toISOString()));
    },
    [dispatch, tasks, showNotifications]
  );

  // タスクの変更を監視
  useEffect(() => {
    if (tasks.length > 0) {
      // デバウンスを実装して、短時間での連続チェックを防ぐ
      const timeoutId = setTimeout(() => {
        checkAchievements();
      }, 1000); // 1秒のデバウンス

      return () => clearTimeout(timeoutId);
    }
  }, [tasks.length, checkAchievements]); // tasks全体ではなく、lengthのみ監視

  // 実績の進捗を計算
  const getAchievementProgress = useCallback(
    (achievementId: string) => {
      const achievement = achievements.find((a) => a.id === achievementId);
      if (!achievement) return null;

      return achievementService.calculateProgress(achievement, tasks);
    },
    [achievements, tasks]
  );

  // 未読通知の数を取得
  const getUnreadNotificationCount = useCallback(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // レベル表示用のユーティリティ
  const getLevelInfo = useCallback(() => {
    const currentExp = userStats.totalExperience;
    const currentLevel = userStats.currentLevel;
    const expForCurrentLevel = (currentLevel - 1) * 1000;
    const expForNextLevel = currentLevel * 1000;
    const progressToNextLevel = ((currentExp - expForCurrentLevel) / 1000) * 100;

    return {
      currentLevel,
      currentExp,
      expForNextLevel,
      progressToNextLevel: Math.min(progressToNextLevel, 100),
      expRemaining: expForNextLevel - currentExp,
    };
  }, [userStats]);

  return {
    achievements,
    notifications,
    userStats,
    checkAchievements,
    getAchievementProgress,
    getUnreadNotificationCount,
    getLevelInfo,
    unlockedAchievements: achievements.filter((a) => a.unlocked),
    lockedAchievements: achievements.filter((a) => !a.unlocked),
  };
};
