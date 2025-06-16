import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  TaskAchievement,
  AchievementNotification,
  UserAchievementStats,
} from '@/types/achievements';

interface AchievementState {
  achievements: TaskAchievement[];
  notifications: AchievementNotification[];
  userStats: UserAchievementStats;
  showNotifications: boolean;
  lastChecked: string | null;
}

const initialState: AchievementState = {
  achievements: [],
  notifications: [],
  userStats: {
    totalUnlocked: 0,
    totalExperience: 0,
    completionRate: 0,
    currentLevel: 1,
    experienceToNextLevel: 1000,
    streakRecord: 0,
  },
  showNotifications: true,
  lastChecked: null,
};

const achievementSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    setAchievements: (state, action: PayloadAction<TaskAchievement[]>) => {
      state.achievements = action.payload;
    },

    unlockAchievement: (state, action: PayloadAction<string>) => {
      const achievement = state.achievements.find((a) => a.id === action.payload);
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        state.userStats.totalUnlocked++;
        state.userStats.totalExperience += achievement.experienceReward;
      }
    },

    addNotification: (state, action: PayloadAction<AchievementNotification>) => {
      state.notifications.unshift(action.payload);
      // 最新の50件のみ保持
      state.notifications = state.notifications.slice(0, 50);
    },

    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },

    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((n) => (n.read = true));
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    updateUserStats: (state, action: PayloadAction<UserAchievementStats>) => {
      state.userStats = action.payload;
    },

    toggleNotifications: (state) => {
      state.showNotifications = !state.showNotifications;
    },

    setLastChecked: (state, action: PayloadAction<string>) => {
      state.lastChecked = action.payload;
    },

    resetAchievements: (state) => {
      state.achievements = state.achievements.map((a) => ({
        ...a,
        unlocked: false,
        unlockedAt: undefined,
      }));
      state.userStats = initialState.userStats;
      state.notifications = [];
    },
  },
});

export const {
  setAchievements,
  unlockAchievement,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  updateUserStats,
  toggleNotifications,
  setLastChecked,
  resetAchievements,
} = achievementSlice.actions;

export default achievementSlice.reducer;
