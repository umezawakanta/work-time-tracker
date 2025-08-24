/**
 * 🚀 リアルタイム進捗追跡システム
 * ゲーミフィケーション・AI・タスク管理の統合リアルタイム追跡
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  integratedGamificationService,
  IntegratedDashboardData,
} from '@/services/gamification/IntegratedGamificationService';
import { Todo } from '@/types/todo';

export interface RealtimeTrackingData {
  // プレイヤー統計
  currentLevel: number;
  totalXP: number;
  todayXP: number;
  streakDays: number;

  // タスク統計
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  todayCompletedTasks: number;

  // パフォーマンス指標
  dailyCompletionRate: number;
  weeklyAverage: number;
  productivityScore: number;

  // AI分析
  motivationLevel: number;
  burnoutRisk: number;
  optimalTimeSlot: string;

  // リアルタイム活動
  currentSessionTime: number;
  activeTaskId: string | null;
  lastActivityTime: Date;

  // 進捗とマイルストーン
  nextLevelProgress: number;
  nextBadgeProgress: number;
  weeklyGoalProgress: number;
}

export interface UseRealtimeGamificationTrackingResult {
  trackingData: RealtimeTrackingData;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  updateProgress: (taskId: string, progressData?: any) => void;
  refreshData: () => Promise<void>;
  getSessionSummary: () => SessionSummary;
}

export interface SessionSummary {
  sessionDuration: number;
  tasksCompleted: number;
  xpEarned: number;
  badgesUnlocked: number;
  productivityRating: number;
  highlights: string[];
}

export const useRealtimeGamificationTracking = (): UseRealtimeGamificationTrackingResult => {
  // State
  const [trackingData, setTrackingData] = useState<RealtimeTrackingData>({
    currentLevel: 1,
    totalXP: 0,
    todayXP: 0,
    streakDays: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    todayCompletedTasks: 0,
    dailyCompletionRate: 0,
    weeklyAverage: 0,
    productivityScore: 0,
    motivationLevel: 50,
    burnoutRisk: 0,
    optimalTimeSlot: '',
    currentSessionTime: 0,
    activeTaskId: null,
    lastActivityTime: new Date(),
    nextLevelProgress: 0,
    nextBadgeProgress: 0,
    weeklyGoalProgress: 0,
  });

  const [isTracking, setIsTracking] = useState(false);
  const sessionStartTime = useRef<Date | null>(null);
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);
  const updateQueue = useRef<any[]>([]);

  // Redux Data
  const todos = useSelector((state: RootState) => state.todo.items);

  // Session tracking
  const startTracking = useCallback(() => {
    if (isTracking) return;

    sessionStartTime.current = new Date();
    setIsTracking(true);

    // Start interval for real-time updates
    trackingInterval.current = setInterval(() => {
      updateRealtimeData();
    }, 5000); // Update every 5 seconds

    console.log('🚀 Real-time gamification tracking started');
  }, [isTracking]);

  const stopTracking = useCallback(() => {
    if (!isTracking) return;

    setIsTracking(false);

    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
      trackingInterval.current = null;
    }

    // Process any pending updates
    processPendingUpdates();

    console.log('⏹️ Real-time gamification tracking stopped');
  }, [isTracking]);

  // Real-time data updates
  const updateRealtimeData = useCallback(async () => {
    try {
      // Calculate session time
      const sessionTime = sessionStartTime.current
        ? Math.floor((Date.now() - sessionStartTime.current.getTime()) / 1000)
        : 0;

      // Get dashboard data from integrated service
      const dashboardData = await integratedGamificationService.getDashboardData();

      // Calculate today's tasks
      const today = new Date().toDateString();
      const todayCompletedTasks = todos.filter(
        (todo) =>
          todo.completed &&
          todo.completedDate &&
          new Date(todo.completedDate).toDateString() === today
      ).length;

      const pendingTasks = todos.filter((todo) => !todo.completed).length;
      const totalTasks = todos.length;
      const completedTasks = todos.filter((todo) => todo.completed).length;

      // Calculate performance metrics
      const dailyCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const productivityScore = calculateProductivityScore(dashboardData, todayCompletedTasks);

      // Update tracking data
      setTrackingData((prev) => ({
        ...prev,
        currentLevel: dashboardData.player.level,
        totalXP: dashboardData.player.totalXP,
        todayXP: dashboardData.todayStats.xpEarned,
        streakDays: dashboardData.player.streakDays,
        totalTasks,
        completedTasks,
        pendingTasks,
        todayCompletedTasks,
        dailyCompletionRate,
        productivityScore,
        currentSessionTime: sessionTime,
        lastActivityTime: new Date(),
        nextLevelProgress:
          (dashboardData.player.currentXP / dashboardData.player.xpToNextLevel) * 100,
        nextBadgeProgress: calculateNextBadgeProgress(dashboardData),
        weeklyGoalProgress: calculateWeeklyProgress(dashboardData),
      }));
    } catch (error) {
      console.error('Real-time tracking update failed:', error);
    }
  }, [todos]);

  // Progress update for specific task
  const updateProgress = useCallback((taskId: string, progressData?: any) => {
    // Add to update queue for batch processing
    updateQueue.current.push({
      taskId,
      progressData,
      timestamp: new Date(),
    });

    // Update active task
    setTrackingData((prev) => ({
      ...prev,
      activeTaskId: taskId,
      lastActivityTime: new Date(),
    }));

    console.log(`📊 Progress updated for task: ${taskId}`);
  }, []);

  // Refresh data manually
  const refreshData = useCallback(async () => {
    await updateRealtimeData();
  }, [updateRealtimeData]);

  // Get session summary
  const getSessionSummary = useCallback((): SessionSummary => {
    const sessionDuration = trackingData.currentSessionTime;
    const tasksCompleted = trackingData.todayCompletedTasks;
    const xpEarned = trackingData.todayXP;

    return {
      sessionDuration,
      tasksCompleted,
      xpEarned,
      badgesUnlocked: 0, // TODO: Calculate from recent achievements
      productivityRating: trackingData.productivityScore,
      highlights: generateSessionHighlights(trackingData),
    };
  }, [trackingData]);

  // Process pending updates
  const processPendingUpdates = useCallback(async () => {
    if (updateQueue.current.length === 0) return;

    try {
      // Batch process updates
      const updates = [...updateQueue.current];
      updateQueue.current = [];

      console.log(`🔄 Processing ${updates.length} pending updates`);

      // Here you would send updates to server or process locally
      // For now, just log them
      updates.forEach((update) => {
        console.log('Processing update:', update);
      });
    } catch (error) {
      console.error('Failed to process pending updates:', error);
    }
  }, []);

  // Initialize tracking on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await refreshData();
      } catch (error) {
        console.error('Failed to initialize tracking:', error);
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      if (trackingInterval.current) {
        clearInterval(trackingInterval.current);
      }
    };
  }, []);

  // Auto-start tracking if user is active
  useEffect(() => {
    if (todos.length > 0 && !isTracking) {
      startTracking();
    }
  }, [todos.length, isTracking, startTracking]);

  return {
    trackingData,
    isTracking,
    startTracking,
    stopTracking,
    updateProgress,
    refreshData,
    getSessionSummary,
  };
};

// Helper functions
function calculateProductivityScore(
  dashboardData: IntegratedDashboardData,
  todayCompleted: number
): number {
  // Simple productivity score calculation
  const baseScore = Math.min(todayCompleted * 10, 100);
  const streakBonus = Math.min(dashboardData.player.streakDays * 2, 20);
  const levelBonus = Math.min(dashboardData.player.level, 10);

  return Math.min(baseScore + streakBonus + levelBonus, 100);
}

function calculateNextBadgeProgress(dashboardData: IntegratedDashboardData): number {
  // Mock implementation - calculate progress to next badge
  const completedAchievements = dashboardData.player.achievements.filter(
    (a) => a.isCompleted
  ).length;
  const totalAchievements = dashboardData.player.achievements.length;

  if (totalAchievements === 0) return 0;
  return (completedAchievements / totalAchievements) * 100;
}

function calculateWeeklyProgress(dashboardData: IntegratedDashboardData): number {
  // Mock implementation - calculate weekly goal progress
  const weeklyGoal = 35; // 5 tasks per day * 7 days
  const currentProgress = dashboardData.todayStats.tasksCompleted * 7; // Estimate based on today

  return Math.min((currentProgress / weeklyGoal) * 100, 100);
}

function generateSessionHighlights(trackingData: RealtimeTrackingData): string[] {
  const highlights: string[] = [];

  if (trackingData.todayCompletedTasks > 5) {
    highlights.push('🎯 素晴らしい！今日は5つ以上のタスクを完了');
  }

  if (trackingData.streakDays >= 7) {
    highlights.push('🔥 7日連続ストリーク継続中！');
  }

  if (trackingData.productivityScore >= 80) {
    highlights.push('⭐ 高い生産性スコアを達成');
  }

  if (trackingData.currentSessionTime >= 3600) {
    // 1 hour
    highlights.push('⏱️ 1時間以上の集中セッション');
  }

  return highlights;
}
