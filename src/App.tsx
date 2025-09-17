import React, { useState, useEffect } from "react";
import "./App.css";
import CharacterHome from "./components/CharacterHome";
import CustomTimer from "./components/CustomTimer";
import { startCookingTimer } from "./utils/cookingTimer";
import { availableThemes } from "./constants/themes";

import type {
  User,
  TimeEntry,
  Project,
  ReportSummary,
  AdminUser,
  Book,
  Memo,
  Reply,
  Character,
  SalaryRecord,
  WorkDiary,
  UserSettings,
  Feature,
  Habit,
  MoodLog,
  Goal,
  Milestone,
  LearningRecord
} from './types';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // 各機能のローディング状態
  const [memosLoading, setMemosLoading] = useState(false);
  const [publicMemosLoading, setPublicMemosLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);
  const [workRecordsLoading, setWorkRecordsLoading] = useState(false);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [diaryLoading, setDiaryLoading] = useState(false);
  
  // 時間記録関連の状態
  const [currentTimeEntry, setCurrentTimeEntry] = useState<TimeEntry | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState("");

  // ゆでたまごタイマーの状態
  const [eggTimerActive, setEggTimerActive] = useState(false);
  const [eggTimerPaused, setEggTimerPaused] = useState(false);
  const [eggTimerTime, setEggTimerTime] = useState(0); // 残り時間（秒）
  const [eggTimerInterval, setEggTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [eggTimerType, setEggTimerType] = useState<'soft' | 'medium' | 'hard'>('medium');
  const [eggTimerSound, setEggTimerSound] = useState<'bell' | 'chime' | 'beep' | 'alarm'>('bell');
  const [eggTimerOriginalTime, setEggTimerOriginalTime] = useState(0); // 元の時間を保存
  const [eggTimerPhase, setEggTimerPhase] = useState<'heating' | 'boiling' | 'cooking'>('heating'); // 現在の段階
  const [eggTimerPhaseTime, setEggTimerPhaseTime] = useState(0); // 現在の段階の残り時間
  const [eggTimerPhaseName, setEggTimerPhaseName] = useState(''); // 現在の段階名
  
  // カスタムタイマーの状態
  const [customTimerActive, setCustomTimerActive] = useState(false);
  const [customTimerPaused, setCustomTimerPaused] = useState(false);
  const [customTimerTime, setCustomTimerTime] = useState(0); // 残り時間（秒）
  const [customTimerInterval, setCustomTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [customTimerMinutes, setCustomTimerMinutes] = useState(5);
  const [customTimerSeconds, setCustomTimerSeconds] = useState(0);
  const [customTimerName, setCustomTimerName] = useState('');
  const [customTimerSound, setCustomTimerSound] = useState<'bell' | 'chime' | 'beep' | 'alarm'>('bell');
  const [customTimerOriginalTime, setCustomTimerOriginalTime] = useState(0); // 元の時間を保存
  
  // タイマーセクションの表示状態
  const [showTimers, setShowTimers] = useState(true);
  
  // タイマープリセットの状態
  const [timerPresets, setTimerPresets] = useState([
    { id: 1, name: 'ポモドーロ', minutes: 25, seconds: 0, color: '#ef4444' },
    { id: 2, name: '短い休憩', minutes: 5, seconds: 0, color: '#10b981' },
    { id: 3, name: '長い休憩', minutes: 15, seconds: 0, color: '#3b82f6' },
    { id: 4, name: '料理タイマー', minutes: 10, seconds: 0, color: '#f59e0b' },
    { id: 5, name: '運動タイマー', minutes: 30, seconds: 0, color: '#8b5cf6' },
  ]);
  
  // タイマー履歴の状態
  const [timerHistory, setTimerHistory] = useState<Array<{
    id: string;
    name: string;
    duration: number;
    completedAt: Date;
    type: 'custom' | 'egg' | 'preset';
  }>>([]);

  // 料理レシピの定義
  const cookingRecipes = {
    'egg': {
      name: 'ゆでたまご',
      phases: [
        { name: '水を沸騰させる', duration: 8 * 60, description: '中火で水を沸騰させます' },
        { name: '半熟ゆで', duration: 6 * 60, description: '沸騰したお湯に卵を入れ、半熟にゆでます' },
        { name: '中半熟ゆで', duration: 8 * 60, description: '沸騰したお湯に卵を入れ、中半熟にゆでます' },
        { name: '固ゆで', duration: 10 * 60, description: '沸騰したお湯に卵を入れ、固ゆでにゆでます' }
      ]
    },
    'potato-salad': {
      name: 'ポテトサラダ用じゃがいも',
      phases: [
        { name: '水を沸騰させる', duration: 8 * 60, description: '中火で水を沸騰させます' },
        { name: 'じゃがいもをゆでる', duration: 15 * 60, description: '沸騰したお湯にじゃがいもを入れ、柔らかくなるまでゆでます' }
      ]
    },
    'ramen': {
      name: 'ラーメン用麺',
      phases: [
        { name: '水を沸騰させる', duration: 8 * 60, description: '強火で水を沸騰させます' },
        { name: '麺をゆでる', duration: 3 * 60, description: '沸騰したお湯に麺を入れ、アルデンテにゆでます' }
      ]
    },
    'pasta': {
      name: 'パスタ',
      phases: [
        { name: '水を沸騰させる', duration: 8 * 60, description: '強火で水を沸騰させます' },
        { name: 'パスタをゆでる', duration: 8 * 60, description: '沸騰したお湯にパスタを入れ、アルデンテにゆでます' }
      ]
    },
    'vegetables': {
      name: '野菜の下茹で',
      phases: [
        { name: '水を沸騰させる', duration: 8 * 60, description: '中火で水を沸騰させます' },
        { name: '野菜をゆでる', duration: 5 * 60, description: '沸騰したお湯に野菜を入れ、適度な硬さにゆでます' }
      ]
    }
  };

  // 選択された料理レシピ
  const [selectedRecipe, setSelectedRecipe] = useState<keyof typeof cookingRecipes>('egg');
  const [selectedEggType, setSelectedEggType] = useState<'soft' | 'medium' | 'hard'>('medium');

  // タイマー設定の状態
  const [timerSettings, setTimerSettings] = useState({
    eggTimerSound: 'bell' as 'bell' | 'chime' | 'beep' | 'alarm',
    customTimerSound: 'bell' as 'bell' | 'chime' | 'beep' | 'alarm',
    enableNotifications: true,
    enableSounds: true,
    defaultCustomMinutes: 5,
    defaultCustomSeconds: 0,
    theme: 'default' as 'default' | 'dark' | 'colorful' | 'minimal',
    customColors: {
      primary: '#3b82f6',
      secondary: '#10b981',
      accent: '#f59e0b',
      background: '#ffffff'
    }
  });

  // 音声ループ再生の状態
  const [soundLoopInterval, setSoundLoopInterval] = useState<NodeJS.Timeout | null>(null);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  
  // プロジェクト関連の状態
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectColor, setProjectColor] = useState("#3b82f6");
  
  // レポート関連の状態
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [showReports, setShowReports] = useState(false);
  
  // 管理者関連の状態
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // 本棚関連の状態
  const [books, setBooks] = useState<Book[]>([]);
  const [showBookshelf, setShowBookshelf] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookIsbn, setBookIsbn] = useState("");
  const [bookPublishedYear, setBookPublishedYear] = useState(new Date().getFullYear());
  const [bookTotalPages, setBookTotalPages] = useState(0);
  const [bookCategory, setBookCategory] = useState("");
  const [bookNotes, setBookNotes] = useState("");
  const [selectedBookCategory, setSelectedBookCategory] = useState("all");

  // メモ関連の状態
  const [memos, setMemos] = useState<Memo[]>([]);
  const [showMemos, setShowMemos] = useState(false);
  const [showMemoForm, setShowMemoForm] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [memoTitle, setMemoTitle] = useState("");

  // キャラクター関連の状態
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [showCharacterHome, setShowCharacterHome] = useState(false);

  // セクション表示状態（既存の状態変数を使用）
  const [showTimeTracking, setShowTimeTracking] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showCustomTimer, setShowCustomTimer] = useState(true);
  const [showPresetTimers, setShowPresetTimers] = useState(true);
  const [showTimerStats, setShowTimerStats] = useState(true);
  const [showTimerHistory, setShowTimerHistory] = useState(true);
  const [memoContent, setMemoContent] = useState("");
  const [memoCategory, setMemoCategory] = useState("");
  const [memoTags, setMemoTags] = useState("");
  const [memoIsPublic, setMemoIsPublic] = useState(false);
  const [memoIsFamilyOnly, setMemoIsFamilyOnly] = useState(false);
  const [memoIsAdminOnly, setMemoIsAdminOnly] = useState(false);
  const [memoSearchTerm, setMemoSearchTerm] = useState("");
  const [selectedMemoCategory, setSelectedMemoCategory] = useState("all");

  // 公開メモ関連の状態
  const [publicMemos, setPublicMemos] = useState<Memo[]>([]);
  const [showPublicMemos, setShowPublicMemos] = useState(false);
  const [publicMemoSearchTerm, setPublicMemoSearchTerm] = useState("");
  const [selectedPublicMemoCategory, setSelectedPublicMemoCategory] = useState("all");
  const [publicMemoViewMode, setPublicMemoViewMode] = useState<'list' | 'calendar'>('list');
  const [publicMemoCurrentDate, setPublicMemoCurrentDate] = useState(new Date());
  const [publicMemoSelectedDate, setPublicMemoSelectedDate] = useState<Date | null>(null);

  // フォント設定関連の状態
  const [selectedFont, setSelectedFont] = useState("system");
  const [showFontSettings, setShowFontSettings] = useState(false);

  // テーマ設定関連の状態
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [showThemeSettings, setShowThemeSettings] = useState(false);

  // カスタムジャンル管理の状態
  const [customGenres, setCustomGenres] = useState<string[]>([]);
  const [showGenreManager, setShowGenreManager] = useState(false);
  const [newGenreName, setNewGenreName] = useState("");

  // 返信機能の状態
  const [replyingToMemo, setReplyingToMemo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");

  // お仕事記録の状態
  const [showWorkRecords, setShowWorkRecords] = useState(false);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [workDiaries, setWorkDiaries] = useState<WorkDiary[]>([]);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [editingSalaryRecord, setEditingSalaryRecord] = useState<SalaryRecord | null>(null);
  const [editingDiary, setEditingDiary] = useState<WorkDiary | null>(null);
  
  // 給料記録フォームの状態
  const [salaryDate, setSalaryDate] = useState("");
  const [salary, setSalary] = useState("");
  const [transportation, setTransportation] = useState("");
  const [overtime, setOvertime] = useState("");
  const [bonus, setBonus] = useState("");
  const [salaryNotes, setSalaryNotes] = useState("");
  const [recordType, setRecordType] = useState<'income' | 'expense'>('income');
  
  // 日記フォームの状態
  const [diaryDate, setDiaryDate] = useState("");
  const [diaryTitle, setDiaryTitle] = useState("");
  const [diaryContent, setDiaryContent] = useState("");
  const [diaryMood, setDiaryMood] = useState("😊");
  const [diaryTags, setDiaryTags] = useState("");
  const [diaryIsPrivate, setDiaryIsPrivate] = useState(true);

  // 機能設定の状態
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [showFeatureSettings, setShowFeatureSettings] = useState(false);
  const [draggedFeature, setDraggedFeature] = useState<string | null>(null);

  // カレンダーの状態
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showRecordDetail, setShowRecordDetail] = useState(false);

  // じぶん図鑑関連の状態
  const [showSelfAnalysis, setShowSelfAnalysis] = useState(false);
  const [selfAnalysisTab, setSelfAnalysisTab] = useState('dashboard');
  const [personalProfile, setPersonalProfile] = useState({
    values: [] as string[],
    goals: [] as string[],
    skills: [] as string[],
    interests: [] as string[],
    strengths: [] as string[],
    weaknesses: [] as string[],
    personality: '',
    lifestyle: '',
    workStyle: '',
    learningStyle: '',
    motivation: '',
    challenges: [] as string[],
    achievements: [] as string[],
    futureVision: '',
    notes: ''
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');
  const [newChallenge, setNewChallenge] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  // 習慣トラッカー関連の状態
  const [newHabit, setNewHabit] = useState('');
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [habitStreak, setHabitStreak] = useState<{[key: string]: number}>({});
  const [habitHistory, setHabitHistory] = useState<{[key: string]: string[]}>({});

  // 感情ログ関連の状態
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [editingMoodLog, setEditingMoodLog] = useState<string | null>(null);
  const [moodForm, setMoodForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: 5,
    energy: 5,
    stress: 5,
    notes: '',
    activities: [] as string[],
    weather: 'sunny',
    sleep: 8
  });
  const [newActivity, setNewActivity] = useState('');

  // 目標管理関連の状態
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'not-started' as 'not-started' | 'in-progress' | 'completed' | 'paused',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    progress: 0,
    milestones: [] as { id: string; title: string; description: string; completed: boolean }[]
  });
  const [newMilestone, setNewMilestone] = useState('');

  // プロフィール管理関数
  const addToProfile = (field: keyof typeof personalProfile, value: string) => {
    if (!value.trim()) return;
    
    setPersonalProfile(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value.trim()]
    }));
  };

  const removeFromProfile = (field: keyof typeof personalProfile, index: number) => {
    setPersonalProfile(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const updateProfileField = (field: keyof typeof personalProfile, value: string) => {
    setPersonalProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 習慣トラッカー管理関数
  const addHabit = () => {
    if (!newHabit.trim()) return;
    
    const habitId = Date.now().toString();
    const newHabitObj: Habit = {
      id: habitId,
      name: newHabit.trim(),
      description: '',
      frequency: 'daily',
      targetDays: 7,
      completedDays: 0,
      streak: 0,
      bestStreak: 0,
      category: 'personal',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setHabits(prev => [...prev, newHabitObj]);
    setHabitStreak(prev => ({ ...prev, [habitId]: 0 }));
    setHabitHistory(prev => ({ ...prev, [habitId]: [] }));
    setNewHabit('');
  };

  const updateHabit = (habitId: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
        : habit
    ));
  };

  const deleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== habitId));
    setHabitStreak(prev => {
      const newStreak = { ...prev };
      delete newStreak[habitId];
      return newStreak;
    });
    setHabitHistory(prev => {
      const newHistory = { ...prev };
      delete newHistory[habitId];
      return newHistory;
    });
  };

  const toggleHabitToday = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const history = habitHistory[habitId] || [];
    const isCompletedToday = history.includes(today);

    if (isCompletedToday) {
      // 今日の記録を削除
      setHabitHistory(prev => ({
        ...prev,
        [habitId]: history.filter(date => date !== today)
      }));
      setHabitStreak(prev => ({
        ...prev,
        [habitId]: Math.max(0, (prev[habitId] || 0) - 1)
      }));
    } else {
      // 今日の記録を追加
      setHabitHistory(prev => ({
        ...prev,
        [habitId]: [...history, today]
      }));
      setHabitStreak(prev => ({
        ...prev,
        [habitId]: (prev[habitId] || 0) + 1
      }));
    }
  };

  const getHabitCompletionRate = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;
    
    const history = habitHistory[habitId] || [];
    const daysSinceStart = Math.ceil((Date.now() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceStart > 0 ? (history.length / daysSinceStart) * 100 : 0;
  };

  // 感情ログ管理関数
  const addMoodLog = () => {
    if (!moodForm.date) return;
    
    const moodLogId = Date.now().toString();
    const newMoodLog: MoodLog = {
      id: moodLogId,
      date: moodForm.date,
      mood: moodForm.mood,
      energy: moodForm.energy,
      stress: moodForm.stress,
      notes: moodForm.notes,
      activities: moodForm.activities,
      weather: moodForm.weather,
      sleep: moodForm.sleep,
      createdAt: new Date().toISOString()
    };
    
    setMoodLogs(prev => [...prev, newMoodLog]);
    resetMoodForm();
  };

  const updateMoodLog = (moodLogId: string, updates: Partial<MoodLog>) => {
    setMoodLogs(prev => prev.map(log => 
      log.id === moodLogId 
        ? { ...log, ...updates }
        : log
    ));
  };

  const deleteMoodLog = (moodLogId: string) => {
    setMoodLogs(prev => prev.filter(log => log.id !== moodLogId));
  };

  const resetMoodForm = () => {
    setMoodForm({
      date: new Date().toISOString().split('T')[0],
      mood: 5,
      energy: 5,
      stress: 5,
      notes: '',
      activities: [],
      weather: 'sunny',
      sleep: 8
    });
    setNewActivity('');
    setShowMoodForm(false);
    setEditingMoodLog(null);
  };

  const addActivity = () => {
    if (!newActivity.trim()) return;
    setMoodForm(prev => ({
      ...prev,
      activities: [...prev.activities, newActivity.trim()]
    }));
    setNewActivity('');
  };

  const removeActivity = (index: number) => {
    setMoodForm(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }));
  };

  const editMoodLog = (log: MoodLog) => {
    setMoodForm({
      date: log.date,
      mood: log.mood,
      energy: log.energy,
      stress: log.stress,
      notes: log.notes,
      activities: log.activities,
      weather: log.weather,
      sleep: log.sleep
    });
    setEditingMoodLog(log.id);
    setShowMoodForm(true);
  };

  const saveMoodLog = () => {
    if (editingMoodLog) {
      updateMoodLog(editingMoodLog, {
        date: moodForm.date,
        mood: moodForm.mood,
        energy: moodForm.energy,
        stress: moodForm.stress,
        notes: moodForm.notes,
        activities: moodForm.activities,
        weather: moodForm.weather,
        sleep: moodForm.sleep
      });
    } else {
      addMoodLog();
    }
  };

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return '😢';
    if (mood <= 4) return '😔';
    if (mood <= 6) return '😐';
    if (mood <= 8) return '😊';
    return '😄';
  };

  const getAverageMood = () => {
    if (moodLogs.length === 0) return 0;
    return moodLogs.reduce((sum, log) => sum + log.mood, 0) / moodLogs.length;
  };

  // 目標管理関数
  const addGoal = () => {
    if (!goalForm.title.trim()) return;
    
    const goalId = Date.now().toString();
    const newGoal: Goal = {
      id: goalId,
      title: goalForm.title.trim(),
      description: goalForm.description,
      category: goalForm.category,
      priority: goalForm.priority,
      status: goalForm.status,
      startDate: goalForm.startDate,
      targetDate: goalForm.targetDate,
      progress: goalForm.progress,
      milestones: goalForm.milestones.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        completed: m.completed,
        completedDate: m.completed ? new Date().toISOString() : undefined
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setGoals(prev => [...prev, newGoal]);
    resetGoalForm();
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
        : goal
    ));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const resetGoalForm = () => {
    setGoalForm({
      title: '',
      description: '',
      category: 'personal',
      priority: 'medium',
      status: 'not-started',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: '',
      progress: 0,
      milestones: []
    });
    setNewMilestone('');
    setShowGoalForm(false);
    setEditingGoal(null);
  };

  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    
    const milestoneId = Date.now().toString();
    setGoalForm(prev => ({
      ...prev,
      milestones: [...prev.milestones, {
        id: milestoneId,
        title: newMilestone.trim(),
        description: '',
        completed: false
      }]
    }));
    setNewMilestone('');
  };

  const removeMilestone = (milestoneId: string) => {
    setGoalForm(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== milestoneId)
    }));
  };

  const toggleMilestone = (milestoneId: string) => {
    setGoalForm(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => 
        m.id === milestoneId 
          ? { ...m, completed: !m.completed }
          : m
      )
    }));
  };

  const editGoal = (goal: Goal) => {
    setGoalForm({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      priority: goal.priority,
      status: goal.status,
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      progress: goal.progress,
      milestones: goal.milestones.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        completed: m.completed
      }))
    });
    setEditingGoal(goal.id);
    setShowGoalForm(true);
  };

  const saveGoal = () => {
    if (editingGoal) {
      updateGoal(editingGoal, {
        title: goalForm.title,
        description: goalForm.description,
        category: goalForm.category,
        priority: goalForm.priority,
        status: goalForm.status,
        startDate: goalForm.startDate,
        targetDate: goalForm.targetDate,
        progress: goalForm.progress,
        milestones: goalForm.milestones.map(m => ({
          id: m.id,
          title: m.title,
          description: m.description,
          completed: m.completed,
          completedDate: m.completed ? new Date().toISOString() : undefined
        }))
      });
    } else {
      addGoal();
    }
  };

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return '#666';
      case 'in-progress': return '#ff9800';
      case 'completed': return '#4caf50';
      case 'paused': return '#f44336';
      default: return '#666';
    }
  };

  const getGoalStatusText = (status: string) => {
    switch (status) {
      case 'not-started': return '未開始';
      case 'in-progress': return '進行中';
      case 'completed': return '完了';
      case 'paused': return '一時停止';
      default: return '不明';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'high': return '#f44336';
      default: return '#666';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return '低';
      case 'medium': return '中';
      case 'high': return '高';
      default: return '不明';
    }
  };

  const [habits, setHabits] = useState<Habit[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedRecordType, setSelectedRecordType] = useState<'salary' | 'diary' | null>(null);


  // 利用可能なフォント一覧（小学生向けかわいいフォント中心）
  const availableFonts = [
    { value: "system", label: "🌟 システムデフォルト" },
    // かわいい日本語フォント
    { value: "Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🍡 Kosugi Maru (丸文字) - おすすめ！" },
    { value: "M PLUS Rounded 1c, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🎀 M PLUS Rounded (丸文字) - かわいい！" },
    { value: "Hiragino Maru Gothic ProN, ヒラギノ丸ゴ ProN W4, Meiryo, メイリオ, Osaka, MS PGothic, sans-serif", label: "💕 ヒラギノ丸ゴ (丸文字) - やわらかい" },
    { value: "Nico Moji, Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "✨ Nico Moji (手書き風) - かわいい！" },
    { value: "Hachi Maru Pop, Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🌸 Hachi Maru Pop (丸文字) - ポップ！" },
    { value: "Yomogi, Kosugi Maru, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🌺 Yomogi (手書き風) - やさしい" },
    { value: "Shippori Mincho, ヒラギノ明朝 ProN W3, Hiragino Mincho ProN, 游明朝, Yu Mincho, serif", label: "🎨 Shippori Mincho (手書き風) - アート" },
    { value: "Noto Sans CJK JP, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🌈 Noto Sans (丸文字風) - カラフル" },
    { value: "Sawarabi Mincho, ヒラギノ明朝 ProN W3, Hiragino Mincho ProN, 游明朝, Yu Mincho, serif", label: "🌿 Sawarabi Mincho (手書き風) - 自然" },
    { value: "Sawarabi Gothic, ヒラギノ角ゴ ProN W3, Hiragino Kaku Gothic ProN, メイリオ, Meiryo, sans-serif", label: "🌱 Sawarabi Gothic (やわらか) - やさしい" },
    // かわいい英語フォント
    { value: "Comic Sans MS, cursive", label: "🎪 Comic Sans MS (かわいい) - 楽しい！" },
    { value: "Chalkduster, cursive", label: "🖍️ Chalkduster (チョーク風) - 学校みたい！" },
    { value: "Marker Felt, fantasy", label: "🖊️ Marker Felt (マーカー風) - カラフル！" },
    { value: "Bradley Hand, cursive", label: "✏️ Bradley Hand (手書き風) - やさしい" },
    { value: "Snell Roundhand, cursive", label: "💌 Snell Roundhand (手書き風) - エレガント" },
    { value: "Brush Script MT, cursive", label: "🖌️ Brush Script MT (ブラシ風) - アート" },
    { value: "Lucida Handwriting, cursive", label: "📝 Lucida Handwriting (手書き風) - きれい" },
    { value: "Papyrus, fantasy", label: "📜 Papyrus (古代風) - おもしろい！" },
    { value: "Chalkboard, fantasy", label: "🖼️ Chalkboard (黒板風) - 学校！" },
    { value: "Herculanum, fantasy", label: "🏛️ Herculanum (古代風) - かっこいい！" },
    // その他のフォント
    { value: "serif", label: "📚 Serif (明朝体) - 本みたい" },
    { value: "sans-serif", label: "📖 Sans-serif (ゴシック体) - 読みやすい" },
    { value: "monospace", label: "💻 Monospace (等幅) - プログラマー" },
    { value: "cursive", label: "✍️ Cursive (筆記体) - 手書き風" },
    { value: "fantasy", label: "🎭 Fantasy (装飾体) - おもしろい" }
  ];

  // 機能定義
  const features: Feature[] = [
    {
      id: 'time-tracking',
      name: '時間管理',
      icon: '⏰',
      description: '作業時間の記録と管理',
      component: null // 既存の時間管理セクション
    },
    {
      id: 'projects',
      name: 'プロジェクト',
      icon: '📁',
      description: 'プロジェクトの管理',
      component: null // 既存のプロジェクトセクション
    },
    {
      id: 'reports',
      name: 'レポート',
      icon: '📊',
      description: '作業時間のレポート表示',
      component: null // 既存のレポートセクション
    },
    {
      id: 'admin-panel',
      name: '管理者パネル',
      icon: '👑',
      description: 'ユーザー管理とシステム設定',
      component: null // 既存の管理者パネルセクション
    },
    {
      id: 'bookshelf',
      name: '本棚',
      icon: '📚',
      description: '本の管理と記録',
      component: null // 既存の本棚セクション
    },
    {
      id: 'memos',
      name: 'メモ',
      icon: '📝',
      description: '個人メモの管理',
      component: null // 既存のメモセクション
    },
    {
      id: 'public-memos',
      name: '公開メモ',
      icon: '🌐',
      description: '公開メモの閲覧と投稿',
      component: null // 既存の公開メモセクション
    },
    {
      id: 'work-records',
      name: 'お仕事記録',
      icon: '💼',
      description: '給料記録と日記',
      component: null // 既存のお仕事記録セクション
    },
    {
      id: 'timers',
      name: 'タイマー',
      icon: '⏱️',
      description: 'カスタムタイマーとプリセットタイマー',
      component: null // タイマーセクション
    },
    {
      id: 'self-analysis',
      name: 'じぶん図鑑',
      icon: '🔍',
      description: '自分自身を深く理解するための分析ツール',
      component: null // 自己分析セクション
    }
  ];

  // 機能の表示順序を取得
  const getFeatureOrder = () => {
    if (!userSettings) return features.map(f => f.id);
    
    let order = userSettings.featureOrder.filter(id => 
      features.some(f => f.id === id)
    );
    
    // 「じぶん図鑑」が含まれていない場合は追加
    if (!order.includes('self-analysis')) {
      order.push('self-analysis');
    }
    
    return order;
  };

  // 表示する機能を取得
  // ユーティリティ関数
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // PWA Badge機能
  const updateAppBadge = (count: number) => {
    if ('serviceWorker' in navigator && 'setAppBadge' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          registration.active.postMessage({
            type: 'SET_BADGE',
            count: count
          });
        }
      }).catch((error) => {
        console.error('Failed to update app badge:', error);
      });
    }
  };

  // 通知件数を計算する関数
  const calculateNotificationCount = () => {
    let count = 0;
    
    // 未読の返信数をカウント（例：自分のメモへの返信）
    if (memos) {
      memos.forEach(memo => {
        if (memo.replies && memo.replies.length > 0) {
          // 今日の返信数をカウント
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const todayReplies = memo.replies.filter(reply => {
            const replyDate = new Date(reply.createdAt);
            replyDate.setHours(0, 0, 0, 0);
            return replyDate.getTime() === today.getTime();
          });
          
          count += todayReplies.length;
        }
      });
    }
    
    // 公開メモの新しい返信もカウント
    if (publicMemos) {
      publicMemos.forEach(memo => {
        if (memo.replies && memo.replies.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const todayReplies = memo.replies.filter(reply => {
            const replyDate = new Date(reply.createdAt);
            replyDate.setHours(0, 0, 0, 0);
            return replyDate.getTime() === today.getTime();
          });
          
          count += todayReplies.length;
        }
      });
    }
    
    return count;
  };

  const getVisibleFeatures = () => {
    const order = getFeatureOrder();
    let hiddenFeatures = userSettings?.hiddenFeatures || [];
    
    // 「じぶん図鑑」が隠されている場合は表示に戻す
    if (hiddenFeatures.includes('self-analysis')) {
      hiddenFeatures = hiddenFeatures.filter(id => id !== 'self-analysis');
    }
    
    const visibleFeatures = order
      .filter(id => !hiddenFeatures.includes(id))
      .map(id => features.find(f => f.id === id))
      .filter(Boolean) as Feature[];
    
    
    return visibleFeatures;
  };

  // フォント設定の読み込みと適用
  useEffect(() => {
    const savedFont = localStorage.getItem("selectedFont");
    if (savedFont) {
      setSelectedFont(savedFont);
      // 少し遅延してからフォントを適用（DOMが完全に読み込まれてから）
      setTimeout(() => {
        applyFont(savedFont);
      }, 100);
    }
  }, []);

  // カスタムジャンルの読み込み
  useEffect(() => {
    const savedGenres = localStorage.getItem("customGenres");
    if (savedGenres) {
      try {
        setCustomGenres(JSON.parse(savedGenres));
      } catch (error) {
        console.error("Failed to load custom genres:", error);
      }
    }
  }, []);

  // テーマ設定の読み込みと適用
  useEffect(() => {
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  // フォント適用関数
  const applyFont = (fontValue: string) => {
    const root = document.documentElement;
    const body = document.body;
    
    if (fontValue === "system") {
      root.style.setProperty("--app-font-family", "");
      body.style.fontFamily = "";
      // すべての要素にフォントをリセット
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        (el as HTMLElement).style.fontFamily = "";
      });
    } else {
      root.style.setProperty("--app-font-family", fontValue);
      body.style.fontFamily = fontValue;
      // すべての要素に直接フォントを適用
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        (el as HTMLElement).style.fontFamily = fontValue;
      });
    }
    
    // より強力なフォント適用 - 特定の要素を明示的に更新
    const specificSelectors = [
      '.dashboard-header h1',
      '.dashboard-header',
      '.user-info',
      '.time-tracking-section h2',
      '.projects-section h2',
      '.reports-section h2',
      '.admin-section h2',
      '.bookshelf-section h2',
      '.memos-section h2',
      '.public-memos-section h2',
      '.work-records-section h2',
      'button',
      'input',
      'textarea',
      'select',
      'label',
      'p',
      'span',
      'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    ];
    
    specificSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        (el as HTMLElement).style.fontFamily = fontValue === "system" ? "" : fontValue;
      });
    });
    
  };

  // フォント変更ハンドラー
  const handleFontChange = (fontValue: string) => {
    setSelectedFont(fontValue);
    applyFont(fontValue);
    localStorage.setItem("selectedFont", fontValue);
    
    // より強力なフォント適用 - 少し遅延して再適用
    setTimeout(() => {
      applyFont(fontValue);
    }, 100);
    
    // さらに遅延して最終確認
    setTimeout(() => {
      applyFont(fontValue);
    }, 500);
  };

  // テーマ適用関数
  const applyTheme = (themeValue: string) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", themeValue);
    
    
    // 強制的にCSS変数を適用
    if (themeValue === "dark") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #68d391 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #4a5568 0%, #68d391 100%)");
      root.style.setProperty("--accent-color", "#68d391");
      root.style.setProperty("--text-color", "#e2e8f0");
      root.style.setProperty("--bg-color", "#1a202c");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #2d3748 0%, #4a5568 100%)");
    } else if (themeValue === "ocean") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #06b6d4 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #0284c7 0%, #06b6d4 100%)");
      root.style.setProperty("--accent-color", "#06b6d4");
      root.style.setProperty("--text-color", "#0f172a");
      root.style.setProperty("--bg-color", "#f0f9ff");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #e0f2fe 0%, #bae6fd 100%)");
    } else if (themeValue === "forest") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #16a34a 0%, #15803d 50%, #22c55e 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #15803d 0%, #22c55e 100%)");
      root.style.setProperty("--accent-color", "#22c55e");
      root.style.setProperty("--text-color", "#14532d");
      root.style.setProperty("--bg-color", "#f0fdf4");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #dcfce7 0%, #bbf7d0 100%)");
    } else if (themeValue === "sunset") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #fb923c 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #ea580c 0%, #fb923c 100%)");
      root.style.setProperty("--accent-color", "#fb923c");
      root.style.setProperty("--text-color", "#9a3412");
      root.style.setProperty("--bg-color", "#fff7ed");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #fed7aa 0%, #fdba74 100%)");
    } else if (themeValue === "rainbow") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #a78bfa 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #7c3aed 0%, #a78bfa 100%)");
      root.style.setProperty("--accent-color", "#a78bfa");
      root.style.setProperty("--text-color", "#581c87");
      root.style.setProperty("--bg-color", "#faf5ff");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #e9d5ff 0%, #ddd6fe 100%)");
    } else if (themeValue === "space") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #1e293b 0%, #334155 50%, #6366f1 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #334155 0%, #6366f1 100%)");
      root.style.setProperty("--accent-color", "#6366f1");
      root.style.setProperty("--text-color", "#e2e8f0");
      root.style.setProperty("--bg-color", "#0f172a");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #1e293b 0%, #334155 100%)");
    } else if (themeValue === "candy") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #ec4899 0%, #db2777 50%, #f472b6 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #db2777 0%, #f472b6 100%)");
      root.style.setProperty("--accent-color", "#f472b6");
      root.style.setProperty("--text-color", "#831843");
      root.style.setProperty("--bg-color", "#fdf2f8");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #fce7f3 0%, #fbcfe8 100%)");
    } else if (themeValue === "pastel") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #c4b5fd 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #8b5cf6 0%, #c4b5fd 100%)");
      root.style.setProperty("--accent-color", "#c4b5fd");
      root.style.setProperty("--text-color", "#6b21a8");
      root.style.setProperty("--bg-color", "#faf5ff");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #f3e8ff 0%, #ede9fe 100%)");
    } else if (themeValue === "neon") {
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #10b981 0%, #059669 50%, #34d399 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #059669 0%, #34d399 100%)");
      root.style.setProperty("--accent-color", "#34d399");
      root.style.setProperty("--text-color", "#064e3b");
      root.style.setProperty("--bg-color", "#ecfdf5");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #d1fae5 0%, #a7f3d0 100%)");
    } else {
      // デフォルトテーマ（ピンク）
      root.style.setProperty("--primary-color", "linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 50%, #ffa8a8 100%)");
      root.style.setProperty("--secondary-color", "linear-gradient(145deg, #fef3c7 0%, #fde68a 100%)");
      root.style.setProperty("--accent-color", "#ffb6c1");
      root.style.setProperty("--text-color", "#333");
      root.style.setProperty("--bg-color", "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)");
      root.style.setProperty("--card-bg", "linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)");
    }
  };

  // テーマ変更ハンドラー
  const handleThemeChange = (themeValue: string) => {
    setSelectedTheme(themeValue);
    applyTheme(themeValue);
    localStorage.setItem("selectedTheme", themeValue);
    
    // 強制的にスタイルを再適用
    setTimeout(() => {
      applyTheme(themeValue);
      // さらに強制的にDOM要素のスタイルを更新
      const body = document.body;
      const dashboard = document.querySelector('.dashboard');
      const header = document.querySelector('.dashboard-header');
      const timeSection = document.querySelector('.time-tracking-section');
      
      if (body) {
        body.style.background = getComputedStyle(document.documentElement).getPropertyValue('--bg-color') || 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)';
        body.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text-color') || '#333';
      }
      
      if (dashboard) {
        (dashboard as HTMLElement).style.background = getComputedStyle(document.documentElement).getPropertyValue('--card-bg') || 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)';
      }
      
      if (header) {
        (header as HTMLElement).style.background = getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 50%, #ffa8a8 100%)';
        (header as HTMLElement).style.color = getComputedStyle(document.documentElement).getPropertyValue('--text-color') || 'white';
      }
      
      if (timeSection) {
        (timeSection as HTMLElement).style.background = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color') || 'linear-gradient(145deg, #fef3c7 0%, #fde68a 100%)';
      }
    }, 100);
  };

  // お仕事記録の関数
  const loadSalaryRecords = async () => {
    setSalaryLoading(true);
    try {
      if (!user?.id) {
        return;
      }
      const response = await fetch(`/api/work-records/salary?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setSalaryRecords(data.records);
      } else {
        console.error('Failed to load salary records:', data.message);
        setMessage(`給料記録の読み込みに失敗しました: ${data.message}`);
      }
    } catch (error) {
      console.error('Failed to load salary records:', error);
      setMessage(`給料記録の読み込みに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSalaryLoading(false);
    }
  };

  const loadWorkDiaries = async () => {
    setDiaryLoading(true);
    try {
      if (!user?.id) {
        return;
      }
      const response = await fetch(`/api/work-records/diary?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setWorkDiaries(data.diaries);
      } else {
        console.error('Failed to load work diaries:', data.message);
        setMessage(`日記の読み込みに失敗しました: ${data.message}`);
      }
    } catch (error) {
      console.error('Failed to load work diaries:', error);
      setMessage(`日記の読み込みに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDiaryLoading(false);
    }
  };

  // ユーザーIDを直接受け取る関数
  const loadSalaryRecordsWithUserId = async (userId: string) => {
    try {
      const response = await fetch(`/api/work-records/salary?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setSalaryRecords(data.records);
      }
    } catch (error) {
      console.error('Failed to load salary records:', error);
    }
  };

  const loadWorkDiariesWithUserId = async (userId: string) => {
    try {
      const response = await fetch(`/api/work-records/diary?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setWorkDiaries(data.diaries);
      }
    } catch (error) {
      console.error('Failed to load work diaries:', error);
    }
  };

  const handleCreateSalaryRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      // 記録タイプに基づいて金額を正負に変換
      const salaryAmount = recordType === 'expense' ? -Math.abs(Number(salary)) : Math.abs(Number(salary));
      
      const response = await fetch('/api/work-records/salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          date: salaryDate,
          salary: salaryAmount,
          transportation: Number(transportation) || 0,
          overtime: Number(overtime) || 0,
          bonus: Number(bonus) || 0,
          notes: salaryNotes
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('収入・支出記録が作成されました！');
        setSalaryDate('');
        setSalary('');
        setTransportation('');
        setOvertime('');
        setBonus('');
        setSalaryNotes('');
        setRecordType('income');
        setShowSalaryForm(false);
        loadSalaryRecords();
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateSalaryRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !editingSalaryRecord) return;

    try {
      // 記録タイプに基づいて金額を正負に変換
      const salaryAmount = recordType === 'expense' ? -Math.abs(Number(salary)) : Math.abs(Number(salary));
      
      const response = await fetch(`/api/work-records/salary/${editingSalaryRecord._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          date: salaryDate,
          salary: salaryAmount,
          transportation: Number(transportation) || 0,
          overtime: Number(overtime) || 0,
          bonus: Number(bonus) || 0,
          notes: salaryNotes
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('収入・支出記録を更新しました！');
        setSalaryDate('');
        setSalary('');
        setTransportation('');
        setOvertime('');
        setBonus('');
        setSalaryNotes('');
        setRecordType('income');
        setEditingSalaryRecord(null);
        setShowSalaryForm(false);
        loadSalaryRecords();
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCreateDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const response = await fetch('/api/work-records/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          date: diaryDate,
          title: diaryTitle,
          content: diaryContent,
          mood: diaryMood,
          tags: diaryTags.split(',').map(tag => tag.trim()).filter(tag => tag),
          isPrivate: diaryIsPrivate
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('日記が作成されました！');
        setDiaryDate('');
        setDiaryTitle('');
        setDiaryContent('');
        setDiaryMood('😊');
        setDiaryTags('');
        setDiaryIsPrivate(true);
        setShowDiaryForm(false);
        loadWorkDiaries();
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !editingDiary) return;

    try {
      const response = await fetch(`/api/work-records/diary/${editingDiary._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          date: diaryDate,
          title: diaryTitle,
          content: diaryContent,
          mood: diaryMood,
          tags: diaryTags.split(',').map(tag => tag.trim()).filter(tag => tag),
          isPrivate: diaryIsPrivate
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('日記を更新しました！');
        setDiaryDate('');
        setDiaryTitle('');
        setDiaryContent('');
        setDiaryMood('😊');
        setDiaryTags('');
        setDiaryIsPrivate(true);
        setEditingDiary(null);
        setShowDiaryForm(false);
        loadWorkDiaries();
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteSalaryRecord = async (id: string) => {
    try {
      const response = await fetch(`/api/work-records/salary?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        setMessage('給料記録が削除されました！');
        loadSalaryRecords();
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteDiary = async (id: string) => {
    try {
      const response = await fetch(`/api/work-records/diary?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        setMessage('日記が削除されました！');
        loadWorkDiaries();
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // 機能設定の関数
  const loadUserSettings = async () => {
    if (!user?.id) {
      return;
    }
    
    try {
      const response = await fetch(`/api/user-settings?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setUserSettings(data.settings);
      } else {
        console.error('Failed to load settings:', data.message);
      }
    } catch (error) {
      console.error('Failed to load user settings:', error);
    }
  };

  // キャラクター関連の関数
  const loadCharacters = () => {
    const savedCharacters = localStorage.getItem('characters');
    if (savedCharacters) {
      setCharacters(JSON.parse(savedCharacters));
    }
  };

  const handleSelectCharacter = (character: Character) => {
    setCurrentCharacter(character);
    localStorage.setItem('currentCharacter', JSON.stringify(character));
  };

  const handleCharacterHomeToggle = () => {
    if (!showCharacterHome) {
      // 開く場合は他の機能を閉じる
      closeOtherFeatures('character');
    }
    
    setShowCharacterHome(!showCharacterHome);
  };

  const updateUserSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/user-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...newSettings
        })
      });

      const data = await response.json();
      if (data.success) {
        setUserSettings(data.settings);
        setMessage('設定が保存されました！');
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFeatureReorder = (newOrder: string[]) => {
    updateUserSettings({ featureOrder: newOrder });
  };

  // デフォルトのユーザー設定を作成
  const getDefaultUserSettings = (): UserSettings => ({
    _id: '',
    userId: user?.id || '',
    featureOrder: features.map(f => f.id),
    hiddenFeatures: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const handleFeatureToggle = (featureId: string) => {
    const currentSettings = userSettings || getDefaultUserSettings();
    
    const isHidden = currentSettings.hiddenFeatures.includes(featureId);
    const newHiddenFeatures = isHidden
      ? currentSettings.hiddenFeatures.filter(id => id !== featureId)
      : [...currentSettings.hiddenFeatures, featureId];
    
    updateUserSettings({ hiddenFeatures: newHiddenFeatures });
  };

  // 他の機能を閉じる関数
  const closeOtherFeatures = (activeFeature: string) => {
    // 時間記録関連
    if (activeFeature !== 'time-tracking') {
      setShowTimeTracking(false);
    }
    if (activeFeature !== 'projects') {
      setShowProjects(false);
    }
    if (activeFeature !== 'custom-timer') {
      setShowCustomTimer(false);
    }
    if (activeFeature !== 'preset-timers') {
      setShowPresetTimers(false);
    }
    if (activeFeature !== 'timer-stats') {
      setShowTimerStats(false);
    }
    if (activeFeature !== 'timer-history') {
      setShowTimerHistory(false);
    }
    
    // メモ関連
    if (activeFeature !== 'memos') {
      setShowMemos(false);
      setShowMemoForm(false);
    }
    
    // 本棚関連
    if (activeFeature !== 'bookshelf') {
      setShowBookshelf(false);
      setShowBookForm(false);
    }
    
    // レポート関連
    if (activeFeature !== 'reports') {
      setShowReports(false);
    }
    
    // 管理者関連
    if (activeFeature !== 'admin') {
      setShowAdminPanel(false);
    }
    
    // キャラクター関連
    if (activeFeature !== 'character') {
      setShowCharacterHome(false);
    }
    
    // お仕事記録関連
    if (activeFeature !== 'work-records') {
      setShowWorkRecords(false);
    }
    
    // その他の機能
    if (activeFeature !== 'public-memos') {
      setShowPublicMemos(false);
    }
    if (activeFeature !== 'font-settings') {
      setShowFontSettings(false);
    }
    if (activeFeature !== 'theme-settings') {
      setShowThemeSettings(false);
    }
    if (activeFeature !== 'genre-manager') {
      setShowGenreManager(false);
    }
    if (activeFeature !== 'feature-settings') {
      setShowFeatureSettings(false);
    }
    if (activeFeature !== 'calendar') {
      setShowCalendar(false);
    }
    if (activeFeature !== 'record-detail') {
      setShowRecordDetail(false);
    }
    if (activeFeature !== 'self-analysis') {
      setShowSelfAnalysis(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, featureId: string) => {
    setDraggedFeature(featureId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // タッチイベント用のハンドラー
  const handleTouchStart = (e: React.TouchEvent, featureId: string) => {
    setDraggedFeature(featureId);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedFeature) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent, targetFeatureId: string) => {
    if (!draggedFeature || draggedFeature === targetFeatureId) {
      setDraggedFeature(null);
      return;
    }

    const currentSettings = userSettings || getDefaultUserSettings();
    const currentOrder = [...currentSettings.featureOrder];
    const draggedIndex = currentOrder.indexOf(draggedFeature);
    const targetIndex = currentOrder.indexOf(targetFeatureId);

    // 要素を移動
    const [movedFeature] = currentOrder.splice(draggedIndex, 1);
    currentOrder.splice(targetIndex, 0, movedFeature);

    handleFeatureReorder(currentOrder);
    setDraggedFeature(null);
  };

  // ボタンによる並び順変更
  const moveFeatureUp = (featureId: string) => {
    const currentSettings = userSettings || getDefaultUserSettings();
    const currentOrder = [...currentSettings.featureOrder];
    const currentIndex = currentOrder.indexOf(featureId);
    
    if (currentIndex > 0) {
      const newOrder = [...currentOrder];
      [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
      handleFeatureReorder(newOrder);
    }
  };

  const moveFeatureDown = (featureId: string) => {
    const currentSettings = userSettings || getDefaultUserSettings();
    const currentOrder = [...currentSettings.featureOrder];
    const currentIndex = currentOrder.indexOf(featureId);
    
    if (currentIndex < currentOrder.length - 1) {
      const newOrder = [...currentOrder];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      handleFeatureReorder(newOrder);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetFeatureId: string) => {
    e.preventDefault();
    
    if (!draggedFeature || draggedFeature === targetFeatureId) {
      setDraggedFeature(null);
      return;
    }

    const currentSettings = userSettings || getDefaultUserSettings();
    const currentOrder = [...currentSettings.featureOrder];
    const draggedIndex = currentOrder.indexOf(draggedFeature);
    const targetIndex = currentOrder.indexOf(targetFeatureId);

    // 要素を移動
    const [movedFeature] = currentOrder.splice(draggedIndex, 1);
    currentOrder.splice(targetIndex, 0, movedFeature);

    handleFeatureReorder(currentOrder);
    setDraggedFeature(null);
  };

  // カレンダー関連の関数
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0=日曜日, 1=月曜日, ..., 6=土曜日
    
    const days = [];
    
    // 前月の日付を追加（カレンダーグリッドの最初の週を埋める）
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    // 前月の最後の日から逆算して必要な日数分を追加
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(prevYear, prevMonth, prevMonthLastDay - i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // 当月の日付を追加
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // 次月の日付を追加（6週分のグリッドを埋めるため、42日分確保）
    const totalDays = days.length;
    const remainingDays = 42 - totalDays;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const getRecordsForDate = (date: Date) => {
    // 日本時間での日付文字列を取得
    const jstDateStr = new Date(date.getTime() + (9 * 60 * 60 * 1000)).toISOString().split('T')[0];
    
    const filteredSalaryRecords = salaryRecords.filter(record => {
      // データベースの日付を日本時間に変換して比較
      const recordDate = new Date(record.date);
      const recordJstDateStr = new Date(recordDate.getTime() + (9 * 60 * 60 * 1000)).toISOString().split('T')[0];
      
      
      return recordJstDateStr === jstDateStr;
    });
    
    const filteredDiaries = workDiaries.filter(diary => {
      // データベースの日付を日本時間に変換して比較
      const diaryDate = new Date(diary.date);
      const diaryJstDateStr = new Date(diaryDate.getTime() + (9 * 60 * 60 * 1000)).toISOString().split('T')[0];
      
      
      return diaryJstDateStr === jstDateStr;
    });
    
    return { salaryRecords: filteredSalaryRecords, diaries: filteredDiaries };
  };

  // 月間収支を計算する関数
  const getMonthlySummary = (year: number, month: number) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    let totalIncome = 0;
    let totalExpense = 0;
    
    salaryRecords.forEach(record => {
      const recordDate = new Date(record.date);
      if (recordDate >= startDate && recordDate <= endDate) {
        if (record.salary > 0) {
          totalIncome += record.salary;
        } else {
          totalExpense += Math.abs(record.salary);
        }
        
        // 交通費、残業代、ボーナスも収入として計算
        if (record.transportation > 0) totalIncome += record.transportation;
        if (record.overtime > 0) totalIncome += record.overtime;
        if (record.bonus > 0) totalIncome += record.bonus;
      }
    });
    
    const netIncome = totalIncome - totalExpense;
    
    return {
      totalIncome,
      totalExpense,
      netIncome,
      recordCount: salaryRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      }).length
    };
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // 日本時間での日付文字列を取得
    const jstDateStr = new Date(date.getTime() + (9 * 60 * 60 * 1000)).toISOString().split('T')[0];
    setSalaryDate(jstDateStr);
    setDiaryDate(jstDateStr);
  };

  const handleRecordClick = (type: 'salary' | 'diary', date: Date) => {
    // 日本時間での日付文字列を取得
    const jstDateStr = new Date(date.getTime() + (9 * 60 * 60 * 1000)).toISOString().split('T')[0];
    setSelectedDate(date);
    
    // その日の記録を取得
    const dayRecords = getRecordsForDate(date);
    
    if (type === 'salary' && dayRecords.salaryRecords.length > 0) {
      setSelectedRecord(dayRecords.salaryRecords[0]);
      setSelectedRecordType('salary');
      setShowRecordDetail(true);
      setShowSalaryForm(false);
      setShowDiaryForm(false);
      setShowCalendar(false);
    } else if (type === 'diary' && dayRecords.diaries.length > 0) {
      setSelectedRecord(dayRecords.diaries[0]);
      setSelectedRecordType('diary');
      setShowRecordDetail(true);
      setShowSalaryForm(false);
      setShowDiaryForm(false);
      setShowCalendar(false);
    }
  };

  const handleSpecificRecordClick = (record: any, type: 'salary' | 'diary') => {
    setSelectedRecord(record);
    setSelectedRecordType(type);
    setShowRecordDetail(true);
    setShowSalaryForm(false);
    setShowDiaryForm(false);
    setShowCalendar(false);
  };

  const viewSalaryRecord = (record: any) => {
    setSelectedRecord(record);
    setSelectedRecordType('salary');
    setShowRecordDetail(true);
    setShowSalaryForm(false);
    setShowDiaryForm(false);
    setShowCalendar(false);
  };

  const viewDiary = (diary: any) => {
    setSelectedRecord(diary);
    setSelectedRecordType('diary');
    setShowRecordDetail(true);
    setShowSalaryForm(false);
    setShowDiaryForm(false);
    setShowCalendar(false);
  };

  const editSalaryRecord = (record: any) => {
    setSalaryDate(record.date.split('T')[0]);
    setSalary(Math.abs(record.salary).toString()); // 絶対値で表示
    setTransportation(record.transportation.toString());
    setOvertime(record.overtime.toString());
    setBonus(record.bonus.toString());
    setSalaryNotes(record.notes || '');
    setRecordType(record.salary >= 0 ? 'income' : 'expense'); // 正負に基づいてタイプを設定
    setEditingSalaryRecord(record);
    setShowSalaryForm(true);
    setShowDiaryForm(false);
    setShowCalendar(false);
  };

  const editDiary = (diary: any) => {
    setDiaryDate(diary.date.split('T')[0]);
    setDiaryTitle(diary.title);
    setDiaryContent(diary.content);
    setDiaryMood(diary.mood);
    setDiaryTags(diary.tags ? diary.tags.join(', ') : '');
    setDiaryIsPrivate(diary.isPrivate);
    setEditingDiary(diary);
    setShowDiaryForm(true);
    setShowSalaryForm(false);
    setShowCalendar(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // カスタムジャンル管理関数
  const handleAddGenre = () => {
    if (newGenreName.trim() && !customGenres.includes(newGenreName.trim())) {
      const updatedGenres = [...customGenres, newGenreName.trim()];
      setCustomGenres(updatedGenres);
      localStorage.setItem("customGenres", JSON.stringify(updatedGenres));
      setNewGenreName("");
    }
  };

  const handleDeleteGenre = (genreToDelete: string) => {
    const updatedGenres = customGenres.filter(genre => genre !== genreToDelete);
    setCustomGenres(updatedGenres);
    localStorage.setItem("customGenres", JSON.stringify(updatedGenres));
  };

  // 利用可能なジャンル一覧を取得（デフォルト + カスタム）
  const getAllGenres = () => {
    const defaultGenres = [
      "仕事", "学習", "趣味", "健康", "家族", "旅行", "読書", "映画", "音楽", "スポーツ", "料理", "要望、リクエスト", "その他"
    ];
    return [...defaultGenres, ...customGenres];
  };

  // 返信機能の関数
  const handleReplySubmit = async (memoId: string) => {
    if (!replyContent.trim()) {
      setMessage("返信内容を入力してください");
      return;
    }

    if (!isLoggedIn || !user) {
      setMessage("ログインが必要です");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch('/api/memos/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          memoId,
          content: replyContent.trim(),
          authorName: user?.displayName || 'Unknown',
          authorEmail: user?.email || 'unknown@example.com',
          userId: user?.id || ''
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage("返信を投稿しました！");
        setReplyContent("");
        setReplyingToMemo(null);
        
        // 即座にローカル状態を更新（UX向上）
        const newReply = {
          id: data.reply.id,
          memoId: memoId,
          content: replyContent.trim(),
          authorName: user?.displayName || 'Unknown',
          authorEmail: user?.email || 'unknown@example.com',
          createdAt: data.reply.createdAt
        };
        
        // メモの返信を即座に更新
        setMemos(prevMemos => 
          prevMemos.map(memo => 
            memo.id === memoId 
              ? { ...memo, replies: [...(memo.replies || []), newReply] }
              : memo
          )
        );
        
        // 公開メモの返信を即座に更新
        setPublicMemos(prevMemos => 
          prevMemos.map(memo => 
            memo.id === memoId 
              ? { ...memo, replies: [...(memo.replies || []), newReply] }
              : memo
          )
        );
        
        // バックグラウンドでデータを再読み込み（整合性確保）
        Promise.all([loadMemos(), loadPublicMemos()]).catch(error => {
          console.error('Background reload failed:', error);
        });
      } else {
        setMessage(data.message || "返信の投稿に失敗しました");
      }
    } catch (error) {
      console.error("Reply submission error:", error);
      setMessage("返信の投稿中にエラーが発生しました");
    }
  };

  // 返信編集の開始
  const handleEditReply = (replyId: string, currentContent: string) => {
    setEditingReply(replyId);
    setEditReplyContent(currentContent);
  };

  // 返信編集のキャンセル
  const handleCancelEditReply = () => {
    setEditingReply(null);
    setEditReplyContent("");
  };

  // 返信編集の保存
  const handleSaveEditReply = async (replyId: string) => {
    if (!editReplyContent.trim()) {
      setMessage("返信内容を入力してください");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/memos/reply/${replyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editReplyContent.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage("返信を更新しました！");
        setEditingReply(null);
        setEditReplyContent("");
        loadMemos();
        loadPublicMemos();
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // 返信削除
  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("この返信を削除しますか？")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/memos/reply/${replyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      const data = await response.json();

      if (data.success) {
        setMessage("返信を削除しました！");
        loadMemos();
        loadPublicMemos();
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleReplyCancel = () => {
    setReplyingToMemo(null);
    setReplyContent("");
  };

  // ログイン状態をチェック
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      
      if (token) {
        // トークンの有効性を検証
        await verifyToken(token);
      } else {
        // トークンがない場合は未ログイン状態に設定
        setIsLoggedIn(false);
        setUser(null);
      }
      setIsCheckingAuth(false);
    };
    
    checkAuth();

    // Service Workerの登録
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          // Service Worker registered successfully
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // バッジの更新
  useEffect(() => {
    if (isLoggedIn && (memos || publicMemos)) {
      const count = calculateNotificationCount();
      updateAppBadge(count);
    }
  }, [memos, publicMemos, isLoggedIn]);

  // ログイン状態が変更された時にデータを読み込み
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      loadProjects();
      loadReportSummary();
      loadSalaryRecords();
      loadWorkDiaries();
      loadUserSettings();
    }
  }, [isLoggedIn, user?.id]);

  const verifyToken = async (token: string) => {
    try {
      // トークンの有効性を検証
      const userResponse = await fetch("/api/auth/verify", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        
        if (userData.success && userData.user) {
          setUser(userData.user);
          setIsLoggedIn(true);
        } else {
          // トークンが無効な場合は削除
          localStorage.removeItem("access_token");
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        // トークンが無効な場合は削除
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("access_token");
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  // 経過時間の更新
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && currentTimeEntry) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - currentTimeEntry.startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, currentTimeEntry]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("ログイン成功！");
        setUser(data.user);
        setIsLoggedIn(true);
        if (data.token) {
          localStorage.setItem("access_token", data.token);
        }
        
        // ユーザー情報を設定してからデータを読み込み
        const userId = data.user.id;
        loadProjects(); // プロジェクトを読み込み
        loadReportSummary(); // レポートを読み込み
        loadSalaryRecordsWithUserId(userId); // 給料記録を読み込み
        loadWorkDiariesWithUserId(userId); // 日記を読み込み
        loadUserSettings(); // ユーザー設定を読み込み
      } else {
        setMessage(`ログイン失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, displayName }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("アカウントが作成されました！ログインしてください。");
        setIsRegisterMode(false);
        setEmail("");
        setPassword("");
        setDisplayName("");
      } else {
        setMessage(`登録失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name: projectName, 
          description: projectDescription,
          color: projectColor 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("プロジェクトが作成されました！");
        setProjectName("");
        setProjectDescription("");
        setProjectColor("#3b82f6");
        setShowProjectForm(false);
        loadProjects();
      } else {
        setMessage(`プロジェクト作成失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    setProjectsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/projects/list", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const loadReportSummary = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/reports/summary", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setReportSummary(data.summary);
      }
    } catch (error) {
      console.error("Failed to load report summary:", error);
    }
  };

  const loadAdminUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setAdminUsers(data.users || []);
      } else {
        setMessage(`ユーザー一覧取得失敗: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to load admin users:", error);
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleEditUser = async (user: AdminUser) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async (updatedUser: AdminUser) => {
    try {
      const token = localStorage.getItem("access_token");
      
      // APIが期待する形式にデータを変換
      const requestData = {
        userId: updatedUser.id,  // idをuserIdに変換
        displayName: updatedUser.displayName,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        status: updatedUser.status
      };

      const response = await fetch("/api/admin/user-edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("ユーザー情報を更新しました");
        loadAdminUsers();
        setEditingUser(null);
      } else {
        setMessage(`ユーザー更新失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`${userName}を削除してもよろしいですか？この操作は取り消せません。`)) {
      return;
    }

    // 削除中の状態を設定
    setDeletingUserId(userId);
    
    // 楽観的更新：即座にUIから削除
    const originalUsers = [...adminUsers];
    setAdminUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    setMessage("ユーザーを削除中...");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        // トークンがない場合は元に戻す
        setAdminUsers(originalUsers);
        setMessage("認証エラーが発生しました");
        return;
      }

      const response = await fetch("/api/admin/user-delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("ユーザーを削除しました");
        // 成功時は楽観的更新のまま維持
      } else {
        // 失敗時は元に戻す
        setAdminUsers(originalUsers);
        setMessage(`ユーザー削除失敗: ${data.message}`);
      }
    } catch (error) {
      // エラー時は元に戻す
      setAdminUsers(originalUsers);
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      // 削除中の状態をクリア
      setDeletingUserId(null);
    }
  };

  // 本棚関連の関数
  const loadBooks = async () => {
    setBooksLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/books", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        let filteredBooks = data.books || [];
        
        // ジャンルフィルターを適用
        if (selectedBookCategory !== 'all') {
          filteredBooks = filteredBooks.filter((book: any) => book.category === selectedBookCategory);
        }
        
        setBooks(filteredBooks);
      } else {
        setMessage(`本の一覧取得失敗: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to load books:", error);
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setBooksLoading(false);
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookTitle || !bookAuthor || !bookIsbn || !bookCategory) {
      setMessage("必須フィールドを入力してください");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: bookTitle,
          author: bookAuthor,
          isbn: bookIsbn,
          publishedYear: bookPublishedYear,
          totalPages: bookTotalPages,
          category: bookCategory,
          notes: bookNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("本を追加しました！");
        setBookTitle("");
        setBookAuthor("");
        setBookIsbn("");
        setBookPublishedYear(new Date().getFullYear());
        setBookTotalPages(0);
        setBookCategory("");
        setBookNotes("");
        setShowBookForm(false);
        loadBooks();
      } else {
        setMessage(`本の追加失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookIsbn(book.isbn);
    setBookPublishedYear(book.publishedYear);
    setBookTotalPages(book.totalPages);
    setBookCategory(book.category);
    setBookNotes(book.notes);
    setShowBookForm(true);
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingBook) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/books/${editingBook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: bookTitle,
          author: bookAuthor,
          isbn: bookIsbn,
          publishedYear: bookPublishedYear,
          totalPages: bookTotalPages,
          category: bookCategory,
          notes: bookNotes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("本を更新しました！");
        setEditingBook(null);
        setShowBookForm(false);
        loadBooks();
      } else {
        setMessage(`本の更新失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    if (!window.confirm(`「${bookTitle}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage("本を削除しました");
        loadBooks();
      } else {
        setMessage(`本の削除失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const getReadingProgress = (book: Book) => {
    if (book.totalPages === 0) return 0;
    return Math.round((book.readPages / book.totalPages) * 100);
  };

  const handleBookCategoryChange = (category: string) => {
    setSelectedBookCategory(category);
    loadBooks();
  };

  const getBookCategories = () => {
    const bookCategories = new Set(books.map(book => book.category));
    return Array.from(bookCategories).sort();
  };

  // メモ関連の関数
  const loadMemos = async () => {
    setMemosLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const params = new URLSearchParams();
      if (selectedMemoCategory !== 'all') {
        params.append('category', selectedMemoCategory);
      }
      if (memoSearchTerm) {
        params.append('search', memoSearchTerm);
      }

      const response = await fetch(`/api/memos?${params.toString()}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMemos(data.memos || []);
      } else {
        setMessage(`メモの一覧取得失敗: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to load memos:", error);
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setMemosLoading(false);
    }
  };

  const handleCreateMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memoContent || !memoCategory) {
      setMessage("内容、カテゴリは必須です");
      return;
    }

    // タイトルがない場合は内容の一行目をタイトルとして使用
    const finalTitle = memoTitle.trim() || memoContent.split('\n')[0].trim() || '無題';

    try {
      const token = localStorage.getItem("access_token");
      const tags = memoTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      const response = await fetch("/api/memos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: finalTitle,
          content: memoContent,
          category: memoCategory,
          tags,
          isPublic: memoIsPublic,
          isFamilyOnly: memoIsFamilyOnly,
          isAdminOnly: memoIsAdminOnly,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("メモを追加しました！");
        setMemoTitle("");
        setMemoContent("");
        setMemoCategory("");
        setMemoTags("");
        setMemoIsPublic(false);
        setMemoIsFamilyOnly(false);
        setMemoIsAdminOnly(false);
        setShowMemoForm(false);
        loadMemos();
      } else {
        setMessage(`メモの追加失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // メモのタイトルを取得するヘルパー関数
  const getMemoTitle = (memo: Memo): string => {
    if (memo.title && memo.title.trim()) {
      return memo.title;
    }
    // タイトルが空の場合は内容の一行目を返す
    const firstLine = memo.content.split('\n')[0].trim();
    return firstLine || '無題';
  };

  // 公開メモ用のカレンダー関数
  const getPublicMemosForDate = (date: Date) => {
    const dateString = date.toDateString();
    return publicMemos.filter(memo => {
      const memoDate = new Date(memo.createdAt).toDateString();
      return memoDate === dateString;
    });
  };

  const navigatePublicMemoMonth = (direction: 'prev' | 'next') => {
    setPublicMemoCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handlePublicMemoDateClick = (date: Date) => {
    setPublicMemoSelectedDate(date);
  };

  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo);
    setMemoTitle(memo.title);
    setMemoContent(memo.content);
    setMemoCategory(memo.category);
    setMemoTags(memo.tags.join(', '));
    setMemoIsPublic(memo.isPublic);
    setMemoIsFamilyOnly(memo.isFamilyOnly || false);
    setMemoIsAdminOnly(memo.isAdminOnly || false);
    setShowMemoForm(true);
  };

  const handleUpdateMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingMemo) return;

    // タイトルがない場合は内容の一行目をタイトルとして使用
    const finalTitle = memoTitle.trim() || memoContent.split('\n')[0].trim() || '無題';

    try {
      const token = localStorage.getItem("access_token");
      const tags = memoTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      const response = await fetch(`/api/memos/${editingMemo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: finalTitle,
          content: memoContent,
          category: memoCategory,
          tags,
          isPublic: memoIsPublic,
          isFamilyOnly: memoIsFamilyOnly,
          isAdminOnly: memoIsAdminOnly,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("メモを更新しました！");
        setEditingMemo(null);
        setShowMemoForm(false);
        loadMemos();
      } else {
        setMessage(`メモの更新失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDeleteMemo = async (memoId: string, memoTitle: string) => {
    if (!window.confirm(`「${memoTitle}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/memos/${memoId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage("メモを削除しました");
        loadMemos();
      } else {
        setMessage(`メモの削除失敗: ${data.message}`);
      }
    } catch (error) {
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleMemoSearch = () => {
    loadMemos();
  };

  const handleMemoCategoryChange = (category: string) => {
    setSelectedMemoCategory(category);
    loadMemos();
  };

  const getMemoCategories = () => {
    const memoCategories = new Set(memos.map(memo => memo.category));
    const allCategories = [...memoCategories, ...getAllGenres()];
    return Array.from(new Set(allCategories)).sort();
  };

  // 公開メモ関連の関数
  const loadPublicMemos = async () => {
    setPublicMemosLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPublicMemoCategory !== 'all') {
        params.append('category', selectedPublicMemoCategory);
      }
      if (publicMemoSearchTerm) {
        params.append('search', publicMemoSearchTerm);
      }

      const response = await fetch(`/api/memos/public?${params.toString()}`);

      const data = await response.json();

      if (data.success) {
        setPublicMemos(data.memos || []);
      } else {
        setMessage(`公開メモの一覧取得失敗: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to load public memos:", error);
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setPublicMemosLoading(false);
    }
  };

  const handlePublicMemoSearch = () => {
    loadPublicMemos();
  };

  const handlePublicMemoCategoryChange = (category: string) => {
    setSelectedPublicMemoCategory(category);
    loadPublicMemos();
  };

  const getPublicMemoCategories = () => {
    const memoCategories = new Set(publicMemos.map(memo => memo.category));
    const allCategories = [...memoCategories, ...getAllGenres()];
    return Array.from(new Set(allCategories)).sort();
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    setUser(null);
    setMessage("");
    setCurrentTimeEntry(null);
    setIsTracking(false);
    setElapsedTime(0);
    setDescription("");
    setProjects([]);
    setSelectedProject("");
    // その他の状態もリセット
    setSalaryRecords([]);
    setWorkDiaries([]);
    setReportSummary(null);
    setUserSettings(null);
    setBooks([]);
    setMemos([]);
    setPublicMemos([]);
    setAdminUsers([]);
  };

  const handleStartTracking = async () => {
    if (!description.trim()) {
      setMessage("作業内容を入力してください");
      return;
    }

    try {
      const response = await fetch("/api/time/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      if (data.success) {
        const newEntry: TimeEntry = {
          id: data.entry.id,
          description,
          startTime: new Date(data.entry.startTime),
        };
        setCurrentTimeEntry(newEntry);
        setIsTracking(true);
        setElapsedTime(0);
        setMessage("時間記録を開始しました");
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      console.error('❌ 時間記録開始エラー:', error);
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleStopTracking = async () => {
    
    if (!currentTimeEntry) {
      setMessage('エラー: 記録中の時間記録が見つかりません');
      return;
    }

    try {
      const response = await fetch("/api/time/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ entryId: currentTimeEntry.id }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentTimeEntry(null);
        setIsTracking(false);
        setElapsedTime(0);
        setDescription("");
        setMessage(`時間記録を停止しました。記録時間: ${formatTime(data.entry.duration)}`);
      } else {
        setMessage(`エラー: ${data.message}`);
      }
    } catch (error) {
      console.error('❌ 時間記録停止エラー:', error);
      setMessage(`エラー: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // 時間記録を強制的にリセットする関数
  const handleResetTracking = () => {
    console.log('🔄 時間記録を強制リセットします');
    setCurrentTimeEntry(null);
    setIsTracking(false);
    setElapsedTime(0);
    setDescription("");
    setMessage("時間記録をリセットしました");
  };

  // ゆでたまごタイマーの関数
  const getEggTimerDuration = (type: 'soft' | 'medium' | 'hard') => {
    switch (type) {
      case 'soft': return 6 * 60; // 6分
      case 'medium': return 8 * 60; // 8分
      case 'hard': return 10 * 60; // 10分
      default: return 8 * 60;
    }
  };

  // 料理レシピの段階を取得
  const getRecipePhases = (recipeKey: keyof typeof cookingRecipes, eggType?: 'soft' | 'medium' | 'hard') => {
    const recipe = cookingRecipes[recipeKey];
    if (recipeKey === 'egg' && eggType) {
      // ゆでたまごの場合は段階を動的に生成
      return [
        { name: '水を沸騰させる', duration: 8 * 60, description: '中火で水を沸騰させます' },
        { 
          name: eggType === 'soft' ? '半熟ゆで' : eggType === 'medium' ? '中半熟ゆで' : '固ゆで', 
          duration: getEggTimerDuration(eggType), 
          description: `沸騰したお湯に卵を入れ、${eggType === 'soft' ? '半熟' : eggType === 'medium' ? '中半熟' : '固ゆで'}にゆでます` 
        }
      ];
    }
    return recipe.phases;
  };

  // 料理タイマーの総時間を計算
  const getTotalCookingTime = (recipeKey: keyof typeof cookingRecipes, eggType?: 'soft' | 'medium' | 'hard') => {
    const phases = getRecipePhases(recipeKey, eggType);
    return phases.reduce((total, phase) => total + phase.duration, 0);
  };

  const handleStartCookingTimer = () => {
    const state = {
      eggTimerActive,
      eggTimerPaused,
      eggTimerTime,
      eggTimerOriginalTime,
      eggTimerPhase,
      eggTimerPhaseTime,
      eggTimerPhaseName,
      eggTimerSound,
      selectedRecipe,
      selectedEggType
    };

    const setters = {
      setEggTimerTime,
      setEggTimerOriginalTime,
      setEggTimerActive,
      setEggTimerPaused,
      setEggTimerPhase,
      setEggTimerPhaseTime,
      setEggTimerPhaseName,
      setEggTimerInterval,
      setMessage,
      sendNotification,
      startSoundLoop,
      addToTimerHistory
    };

    startCookingTimer(state, setters, cookingRecipes, getRecipePhases, getTotalCookingTime);
  };

  const pauseEggTimer = () => {
    if (eggTimerInterval) {
      clearInterval(eggTimerInterval);
      setEggTimerInterval(null);
    }
    setEggTimerPaused(true);
  };

  const stopEggTimer = () => {
    if (eggTimerInterval) {
      clearInterval(eggTimerInterval);
      setEggTimerInterval(null);
    }
    setEggTimerActive(false);
    setEggTimerPaused(false);
    setEggTimerTime(0);
  };

  const resetEggTimer = () => {
    stopEggTimer();
    setEggTimerTime(getEggTimerDuration(eggTimerType));
  };

  const playEggTimerSound = async () => {
    if (!timerSettings.enableSounds) return;
    
    console.log('🔊 ゆでたまごタイマー音声再生開始:', eggTimerSound);
    try {
      // まずAudioContextを再開する（必要に応じて）
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('AudioContext状態:', audioContext.state);
      
      if (audioContext.state === 'suspended') {
        console.log('AudioContextを再開中...');
        await audioContext.resume();
        console.log('AudioContext再開後状態:', audioContext.state);
      }
      
      // 音声再生を確実にするため、少し遅延を入れる
      setTimeout(() => {
        try {
          console.log('音声再生実行:', eggTimerSound);
          switch (eggTimerSound) {
            case 'bell':
              playBellSound(audioContext);
              break;
            case 'chime':
              playChimeSound(audioContext);
              break;
            case 'beep':
              playBeepSound(audioContext);
              break;
            case 'alarm':
              playAlarmSound(audioContext);
              break;
            default:
              playBellSound(audioContext);
          }
          console.log('音声再生完了');
        } catch (innerError) {
          console.error('音声再生エラー:', innerError);
          playFallbackSound();
        }
      }, 100);
      
    } catch (error) {
      console.error('AudioContext作成エラー:', error);
      playFallbackSound();
    }
  };

  const playFallbackSound = () => {
    try {
      // より確実なフォールバック音声
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU4k9n1unEiBS13yO/eizEIHWq+8+OWT');
      audio.volume = 0.5;
      audio.play().catch(playbackError => {
        console.error('フォールバック音声再生エラー:', playbackError);
        // 最後の手段: システム音を鳴らす
        playSystemSound();
      });
    } catch (fallbackError) {
      console.error('フォールバック音声作成エラー:', fallbackError);
      playSystemSound();
    }
  };

  const playSystemSound = () => {
    try {
      // システム音を鳴らす（ブラウザの制限を回避）
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU4k9n1unEiBS13yO/eizEIHWq+8+OWT';
      audio.play().catch(() => {
        console.warn('音声再生ができませんでした。ブラウザの設定を確認してください。');
      });
    } catch (error) {
      console.error('システム音再生エラー:', error);
    }
  };

  const playBellSound = (audioContext: AudioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 鐘の音: 低い音から高い音へ
    oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1.0);
  };

  const playChimeSound = (audioContext: AudioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // チャイム音: 上昇する音階
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    oscillator.frequency.setValueAtTime(554, audioContext.currentTime + 0.15); // C#5
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.3); // E5
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.45); // A5
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.8);
  };

  const playBeepSound = (audioContext: AudioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // ビープ音: 短い連続音
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.25);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.4);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + 0.45);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.6);
  };

  const playAlarmSound = (audioContext: AudioContext) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // アラーム音: 高音の連続音
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.3);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.4);
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.0);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1.0);
  };

  const formatEggTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // カスタムタイマーの関数
  const startCustomTimer = () => {
    if (customTimerActive && !customTimerPaused) return;
    
    if (customTimerPaused) {
      // 一時停止から再開
      setCustomTimerPaused(false);
      const interval = setInterval(() => {
        setCustomTimerTime(prev => {
          if (prev <= 1) {
            setCustomTimerActive(false);
            setCustomTimerPaused(false);
            clearInterval(interval);
            setCustomTimerInterval(null);
            // タイマー終了時の通知
            const timerName = customTimerName || 'カスタムタイマー';
            setMessage(`⏰ ${timerName}終了！音を停止するには「音を停止」ボタンを押してください。`);
            
            // ブラウザ通知を送信
            sendNotification(
              '⏰ タイマー終了！',
              `${timerName}が終了しました！音を停止するには「音を停止」ボタンを押してください。`,
              '⏰'
            );
            
            // ループ音声を開始
            startSoundLoop(customTimerSound);
            
            // 履歴に追加
            addToTimerHistory(timerName, customTimerOriginalTime, 'custom');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setCustomTimerInterval(interval);
    } else {
      // 新規開始
      const totalSeconds = customTimerMinutes * 60 + customTimerSeconds;
      if (totalSeconds <= 0) {
        setMessage('タイマー時間を設定してください');
        return;
      }
      
      setCustomTimerTime(totalSeconds);
      setCustomTimerOriginalTime(totalSeconds);
      setCustomTimerActive(true);
      setCustomTimerPaused(false);
      
      const interval = setInterval(() => {
        setCustomTimerTime(prev => {
          if (prev <= 1) {
            setCustomTimerActive(false);
            setCustomTimerPaused(false);
            clearInterval(interval);
            setCustomTimerInterval(null);
            // タイマー終了時の通知
            const timerName = customTimerName || 'カスタムタイマー';
            setMessage(`⏰ ${timerName}終了！音を停止するには「音を停止」ボタンを押してください。`);
            
            // ブラウザ通知を送信
            sendNotification(
              '⏰ タイマー終了！',
              `${timerName}が終了しました！音を停止するには「音を停止」ボタンを押してください。`,
              '⏰'
            );
            
            // ループ音声を開始
            startSoundLoop(customTimerSound);
            
            // 履歴に追加
            addToTimerHistory(timerName, totalSeconds, 'custom');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setCustomTimerInterval(interval);
    }
  };

  const pauseCustomTimer = () => {
    if (customTimerInterval) {
      clearInterval(customTimerInterval);
      setCustomTimerInterval(null);
    }
    setCustomTimerPaused(true);
  };

  const stopCustomTimer = () => {
    if (customTimerInterval) {
      clearInterval(customTimerInterval);
      setCustomTimerInterval(null);
    }
    setCustomTimerActive(false);
    setCustomTimerPaused(false);
    setCustomTimerTime(0);
  };

  const resetCustomTimer = () => {
    stopCustomTimer();
    setCustomTimerTime(customTimerMinutes * 60 + customTimerSeconds);
  };

  const playCustomTimerSound = async () => {
    if (!timerSettings.enableSounds) return;
    
    try {
      // まずAudioContextを再開する（必要に応じて）
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // 音声再生を確実にするため、少し遅延を入れる
      setTimeout(() => {
        try {
          switch (customTimerSound) {
            case 'bell':
              playBellSound(audioContext);
              break;
            case 'chime':
              playChimeSound(audioContext);
              break;
            case 'beep':
              playBeepSound(audioContext);
              break;
            case 'alarm':
              playAlarmSound(audioContext);
              break;
            default:
              playBellSound(audioContext);
          }
        } catch (innerError) {
          console.error('音声再生エラー:', innerError);
          playFallbackSound();
        }
      }, 100);
      
    } catch (error) {
      console.error('AudioContext作成エラー:', error);
      playFallbackSound();
    }
  };

  // プリセットタイマーの関数
  const startPresetTimer = (preset: typeof timerPresets[0]) => {
    if (customTimerActive) return;
    
    const totalSeconds = preset.minutes * 60 + 0;
    setCustomTimerTime(totalSeconds);
    setCustomTimerActive(true);
    setCustomTimerName(preset.name);
    
    const interval = setInterval(() => {
      setCustomTimerTime(prev => {
        if (prev <= 1) {
          setCustomTimerActive(false);
          clearInterval(interval);
          setCustomTimerInterval(null);
               setMessage(`⏰ ${preset.name}終了！音を停止するには「音を停止」ボタンを押してください。`);
               
               // ブラウザ通知を送信
               sendNotification(
                 '⏰ プリセットタイマー終了！',
                 `${preset.name}が終了しました！音を停止するには「音を停止」ボタンを押してください。`,
                 '⏰'
               );
               
               // ループ音声を開始
               startSoundLoop(customTimerSound);
               
               addToTimerHistory(preset.name, totalSeconds, 'preset');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setCustomTimerInterval(interval);
  };

  // タイマー履歴に追加
  const addToTimerHistory = (name: string, duration: number, type: 'custom' | 'egg' | 'preset') => {
    const newEntry = {
      id: Date.now().toString(),
      name,
      duration,
      completedAt: new Date(),
      type
    };
    const newHistory = [newEntry, ...timerHistory.slice(0, 49)]; // 最新50件まで保持
    setTimerHistory(newHistory);
    saveTimerHistory(newHistory);
  };


  // 音声再生の初期化
  const initializeAudio = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        // ユーザーの操作でAudioContextを再開
        document.addEventListener('click', () => {
          audioContext.resume();
        }, { once: true });
      }
    } catch (error) {
      console.warn('AudioContext初期化エラー:', error);
    }
  };

  // ブラウザ通知の初期化
  const initializeNotifications = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  };

  // ブラウザ通知を送信
  const sendNotification = (title: string, body: string, icon?: string) => {
    if (timerSettings.enableNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '🥚',
        badge: '⏰',
        tag: 'timer-notification',
        requireInteraction: true
      });
    }
  };

  // 音声のループ再生を開始
  const startSoundLoop = (soundType: 'bell' | 'chime' | 'beep' | 'alarm') => {
    if (!timerSettings.enableSounds || isSoundPlaying) return;
    
    setIsSoundPlaying(true);
    
    const playSound = async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        switch (soundType) {
          case 'bell':
            playBellSound(audioContext);
            break;
          case 'chime':
            playChimeSound(audioContext);
            break;
          case 'beep':
            playBeepSound(audioContext);
            break;
          case 'alarm':
            playAlarmSound(audioContext);
            break;
          default:
            playBellSound(audioContext);
        }
      } catch (error) {
        console.error('音声ループ再生エラー:', error);
        playFallbackSound();
      }
    };
    
    // 即座に1回再生
    playSound();
    
    // 3秒間隔でループ再生
    const interval = setInterval(playSound, 3000);
    setSoundLoopInterval(interval);
  };

  // 音声のループ再生を停止
  const stopSoundLoop = () => {
    if (soundLoopInterval) {
      clearInterval(soundLoopInterval);
      setSoundLoopInterval(null);
    }
    setIsSoundPlaying(false);
  };

  // タイマー設定の保存
  const saveTimerSettings = (newSettings: typeof timerSettings) => {
    setTimerSettings(newSettings);
    localStorage.setItem('timerSettings', JSON.stringify(newSettings));
  };

  // タイマー設定の読み込み
  const loadTimerSettings = () => {
    try {
      const saved = localStorage.getItem('timerSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setTimerSettings(parsed);
        // 設定を反映
        setEggTimerSound(parsed.eggTimerSound || 'bell');
        setCustomTimerSound(parsed.customTimerSound || 'bell');
        setCustomTimerMinutes(parsed.defaultCustomMinutes || 5);
        setCustomTimerSeconds(parsed.defaultCustomSeconds || 0);
        // テーマを適用
        applyTimerTheme(parsed.theme || 'default', parsed.customColors);
      }
    } catch (error) {
      console.error('タイマー設定の読み込みエラー:', error);
    }
  };

  // タイマーテーマの適用
  const applyTimerTheme = (theme: string, customColors?: any) => {
    const root = document.documentElement;
    
    switch (theme) {
      case 'dark':
        root.style.setProperty('--timer-primary', '#60a5fa');
        root.style.setProperty('--timer-secondary', '#34d399');
        root.style.setProperty('--timer-accent', '#fbbf24');
        root.style.setProperty('--timer-background', '#1f2937');
        root.style.setProperty('--timer-text', '#f9fafb');
        break;
      case 'colorful':
        root.style.setProperty('--timer-primary', '#ec4899');
        root.style.setProperty('--timer-secondary', '#8b5cf6');
        root.style.setProperty('--timer-accent', '#f59e0b');
        root.style.setProperty('--timer-background', '#fef3c7');
        root.style.setProperty('--timer-text', '#1f2937');
        break;
      case 'minimal':
        root.style.setProperty('--timer-primary', '#6b7280');
        root.style.setProperty('--timer-secondary', '#9ca3af');
        root.style.setProperty('--timer-accent', '#d1d5db');
        root.style.setProperty('--timer-background', '#ffffff');
        root.style.setProperty('--timer-text', '#374151');
        break;
      default:
        if (customColors) {
          root.style.setProperty('--timer-primary', customColors.primary);
          root.style.setProperty('--timer-secondary', customColors.secondary);
          root.style.setProperty('--timer-accent', customColors.accent);
          root.style.setProperty('--timer-background', customColors.background);
        } else {
          root.style.setProperty('--timer-primary', '#3b82f6');
          root.style.setProperty('--timer-secondary', '#10b981');
          root.style.setProperty('--timer-accent', '#f59e0b');
          root.style.setProperty('--timer-background', '#ffffff');
        }
        root.style.setProperty('--timer-text', '#1f2937');
        break;
    }
  };

  // タイマー履歴の保存
  const saveTimerHistory = (history: typeof timerHistory) => {
    localStorage.setItem('timerHistory', JSON.stringify(history));
  };

  // タイマー履歴の読み込み
  const loadTimerHistory = () => {
    try {
      const saved = localStorage.getItem('timerHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        setTimerHistory(parsed.map((item: any) => ({
          ...item,
          completedAt: new Date(item.completedAt)
        })));
      }
    } catch (error) {
      console.error('タイマー履歴の読み込みエラー:', error);
    }
  };

  // コンポーネントマウント時に音声と通知を初期化
  React.useEffect(() => {
    initializeAudio();
    initializeNotifications();
    loadTimerSettings();
    loadTimerHistory();
    loadCharacters();
    
    // 現在のキャラクターを読み込み
    const savedCharacter = localStorage.getItem('currentCharacter');
    if (savedCharacter) {
      setCurrentCharacter(JSON.parse(savedCharacter));
    }
  }, []);

  // コンポーネントアンマウント時に音声ループを停止
  React.useEffect(() => {
    return () => {
      stopSoundLoop();
    };
  }, []);

  // 認証チェック中はローディング画面を表示
  if (isCheckingAuth) {
    return (
      <div className="app">
        <div className="login-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>認証を確認中...</p>
          </div>
        </div>
      </div>
    );
  }

  // ログインしていない場合はログイン画面を表示
  if (!isLoggedIn || !user || !user.id) {
    return (
      <div className="app">
        <div className="login-container">
          <h1>Work Time Tracker</h1>
          
          {isRegisterMode ? (
            <form onSubmit={handleRegister} className="login-form">
              <div className="form-group">
                <label htmlFor="displayName">表示名</label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">メールアドレス</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">パスワード</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" disabled={loading} className="login-button">
                {loading ? "登録中..." : "アカウント作成"}
              </button>
              <button 
                type="button" 
                onClick={() => setIsRegisterMode(false)}
                className="switch-button"
              >
                ログインに戻る
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email">メールアドレス</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">パスワード</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" disabled={loading} className="login-button">
                {loading ? "ログイン中..." : "ログイン"}
              </button>
              <button 
                type="button" 
                onClick={() => setIsRegisterMode(true)}
                className="switch-button"
              >
                アカウント作成
              </button>
            </form>
          )}
          
          {message && (
            <div className={`message ${message.includes("成功") || message.includes("作成") ? "success" : "error"}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="app">
        <div className="dashboard">
          <header className="dashboard-header">
            <div className="header-left">
              <div className="character-container">
                <div className="character">
                  <div className="character-halo"></div>
                  <div className="character-wings">
                    <div className="wing left-wing"></div>
                    <div className="wing right-wing"></div>
                  </div>
                  <div className="character-face">
                    <div className="character-eyes">
                      <div className="eye left-eye"></div>
                      <div className="eye right-eye"></div>
                    </div>
                    <div className="character-mouth"></div>
                  </div>
                  <div className="character-body"></div>
                  <div className="character-arms">
                    <div className="arm left-arm"></div>
                    <div className="arm right-arm"></div>
                  </div>
                  <div className="sparkles">
                    <div className="sparkle sparkle-1"></div>
                    <div className="sparkle sparkle-2"></div>
                    <div className="sparkle sparkle-3"></div>
                    <div className="sparkle sparkle-4"></div>
                    <div className="sparkle sparkle-5"></div>
                    <div className="sparkle sparkle-6"></div>
                  </div>
                </div>
              </div>
              <h1>⏰ Work Time Tracker 📚</h1>
            </div>
            <div className="user-info">
              <div className="user-greeting">
                <div className="header-character">
                  {currentCharacter ? (
                    <div 
                      className="current-character-svg"
                      dangerouslySetInnerHTML={{ __html: currentCharacter.svg }}
                    />
                  ) : (
                    <div className="default-character">👋</div>
                  )}
                </div>
                <span>こんにちは、{user?.displayName || user?.email || 'User'}さん！</span>
              </div>
              <div className="header-buttons">
                <button 
                  onClick={handleCharacterHomeToggle}
                  className="character-home-button"
                  title="キャラクター達のお家"
                >
                  🏠 キャラクター
                </button>
                <button 
                  onClick={() => {
                    if (!showThemeSettings) {
                      closeOtherFeatures('theme-settings');
                    }
                    setShowThemeSettings(!showThemeSettings);
                  }} 
                  className="theme-settings-button"
                  title="テーマ設定"
                >
                  🎨 テーマ
                </button>
                <button 
                  onClick={() => {
                    if (!showFontSettings) {
                      closeOtherFeatures('font-settings');
                    }
                    setShowFontSettings(!showFontSettings);
                  }} 
                  className="font-settings-button"
                  title="フォント設定"
                >
                  🔤 フォント
                </button>
              </div>
              <button 
                onClick={() => {
                  closeOtherFeatures('feature-settings');
                  setShowFeatureSettings(true);
                  loadUserSettings();
                }} 
                className="feature-settings-button"
                title="機能設定"
              >
                ⚙️ 機能設定
              </button>
            </div>
            
            {/* 右上のログアウトボタン */}
            <div className="logout-container">
              <button onClick={handleLogout} className="logout-button">
                🚪 ログアウト
              </button>
            </div>
            
            {/* 右下のヘタウマキャラクター */}
            <div className="bottom-right-character">
              <div className="hetama-character">
                <div className="hetama-halo"></div>
                <div className="hetama-wings">
                  <div className="hetama-wing left-hetama-wing"></div>
                  <div className="hetama-wing right-hetama-wing"></div>
                </div>
                <div className="hetama-face">
                  <div className="hetama-eyes">
                    <div className="hetama-eye left-hetama-eye"></div>
                    <div className="hetama-eye right-hetama-eye"></div>
                  </div>
                  <div className="hetama-mouth"></div>
                </div>
                <div className="hetama-body"></div>
                <div className="hetama-arms">
                  <div className="hetama-arm left-hetama-arm"></div>
                  <div className="hetama-arm right-hetama-arm"></div>
                </div>
                <div className="hetama-legs">
                  <div className="hetama-leg left-hetama-leg"></div>
                  <div className="hetama-leg right-hetama-leg"></div>
                </div>
                <div className="hetama-sparkles">
                  <div className="hetama-sparkle sparkle-1">✨</div>
                  <div className="hetama-sparkle sparkle-2">⭐</div>
                  <div className="hetama-sparkle sparkle-3">💫</div>
                </div>
              </div>
            </div>
          </header>
          
          <main className="dashboard-main">
            {getVisibleFeatures().map((feature) => {
              console.log('Rendering feature:', feature.name, feature.id);
              if (feature.id === 'time-tracking') {
                return (
            <div key={feature.id} className="time-tracking-section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">
                    <div className="mini-character">
                      <div className="mini-character-face">
                        <div className="mini-character-eyes">
                          <div className="mini-eye left-mini-eye"></div>
                          <div className="mini-eye right-mini-eye"></div>
                        </div>
                        <div className="mini-character-mouth"></div>
                      </div>  {/* mini-character-face */}
                      <div className="mini-character-body"></div>
                    </div>  {/* mini-character */}
                  </span>
                  時間記録
                </h2>
                <div className="section-controls">
                  {showTimeTracking ? (
                    <button 
                      onClick={() => setShowTimeTracking(false)}
                      className="close-section-button"
                      title="セクションを閉じる"
                    >
                      ✕
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        closeOtherFeatures('time-tracking');
                        setShowTimeTracking(true);
                      }}
                      className="show-section-button"
                      title="セクションを表示"
                    >
                      ▶️
                    </button>
                  )}
                </div>
              </div>
              
              {showTimeTracking && (
                <div className="section-content">
              
              {!isTracking ? (
                <div className="start-tracking">
                  <div className="form-group">
                    <label htmlFor="description">作業内容</label>
                    <input
                      type="text"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="作業内容を入力してください"
                    />
                  </div>
                  <button onClick={handleStartTracking} className="start-button">
                    ▶️ 記録開始
                  </button>
                </div>
              ) : (
                <div className="tracking-active">
                  <div className="current-entry">
                    <h3>記録中: {currentTimeEntry?.description}</h3>
                    <div className="elapsed-time">
                      {formatTime(elapsedTime)}
                    </div>
                    <div className="tracking-buttons">
                      <button onClick={handleStopTracking} className="stop-button">
                        ⏹️ 記録停止
                      </button>
                      <button onClick={handleResetTracking} className="reset-button">
                        🔄 強制リセット
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 料理タイマー */}
              <div className="cooking-timer-section">
                <h3>🍳 料理タイマー</h3>
                
                <div className="recipe-selector">
                  <h4>📋 料理を選択</h4>
                  <div className="recipe-options">
                    {Object.entries(cookingRecipes).map(([key, recipe]) => (
                      <label key={key} className="recipe-option">
                        <input
                          type="radio"
                          name="recipe"
                          value={key}
                          checked={selectedRecipe === key}
                          onChange={(e) => setSelectedRecipe(e.target.value as keyof typeof cookingRecipes)}
                          disabled={eggTimerActive}
                        />
                        <span className="recipe-name">{recipe.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedRecipe === 'egg' && (
                  <div className="egg-type-selector">
                    <h4>🥚 ゆで加減を選択</h4>
                    <div className="egg-type-options">
                      <label>
                        <input
                          type="radio"
                          name="eggType"
                          value="soft"
                          checked={selectedEggType === 'soft'}
                          onChange={(e) => setSelectedEggType(e.target.value as 'soft' | 'medium' | 'hard')}
                          disabled={eggTimerActive}
                        />
                        <span>🥚 半熟</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="eggType"
                          value="medium"
                          checked={selectedEggType === 'medium'}
                          onChange={(e) => setSelectedEggType(e.target.value as 'soft' | 'medium' | 'hard')}
                          disabled={eggTimerActive}
                        />
                        <span>🥚 中半熟</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="eggType"
                          value="hard"
                          checked={selectedEggType === 'hard'}
                          onChange={(e) => setSelectedEggType(e.target.value as 'soft' | 'medium' | 'hard')}
                          disabled={eggTimerActive}
                        />
                        <span>🥚 固ゆで</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="cooking-phases">
                  <h4>📝 調理手順</h4>
                  <div className="phases-list">
                    {getRecipePhases(selectedRecipe, selectedRecipe === 'egg' ? selectedEggType : undefined).map((phase, index) => (
                      <div key={index} className={`phase-item ${eggTimerPhase === (index === 0 ? 'heating' : index === getRecipePhases(selectedRecipe, selectedRecipe === 'egg' ? selectedEggType : undefined).length - 1 ? 'cooking' : 'boiling') ? 'active' : ''}`}>
                        <div className="phase-number">{index + 1}</div>
                        <div className="phase-content">
                          <div className="phase-name">{phase.name}</div>
                          <div className="phase-duration">{formatTime(phase.duration)}</div>
                          <div className="phase-description">{phase.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                  
                  <div className="egg-timer-sound-selector">
                    <label>🔊 通知音:</label>
                    <div className="sound-options">
                      <label>
                        <input
                          type="radio"
                          name="eggTimerSound"
                          value="bell"
                          checked={eggTimerSound === 'bell'}
                          onChange={(e) => setEggTimerSound(e.target.value as 'bell' | 'chime' | 'beep' | 'alarm')}
                        />
                        🔔 鐘
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="eggTimerSound"
                          value="chime"
                          checked={eggTimerSound === 'chime'}
                          onChange={(e) => setEggTimerSound(e.target.value as 'bell' | 'chime' | 'beep' | 'alarm')}
                        />
                        🎵 チャイム
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="eggTimerSound"
                          value="beep"
                          checked={eggTimerSound === 'beep'}
                          onChange={(e) => setEggTimerSound(e.target.value as 'bell' | 'chime' | 'beep' | 'alarm')}
                        />
                        📢 ビープ
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="eggTimerSound"
                          value="alarm"
                          checked={eggTimerSound === 'alarm'}
                          onChange={(e) => setEggTimerSound(e.target.value as 'bell' | 'chime' | 'beep' | 'alarm')}
                        />
                        🚨 アラーム
                      </label>
                    </div>
                        <button 
                          onClick={async () => {
                            try {
                              await playEggTimerSound();
                            } catch (error) {
                              console.error('音声テストエラー:', error);
                              setMessage('音声の再生に失敗しました。ブラウザの設定を確認してください。');
                            }
                          }} 
                          className="test-sound-btn"
                          disabled={eggTimerActive}
                        >
                          🔊 音を試す
                        </button>
                  </div>
                  
                  <div className="cooking-timer-display">
                    <div className="timer-time">
                      {formatTime(eggTimerTime)}
                    </div>
                    <div className="timer-status">
                      {eggTimerActive ? `🍳 ${eggTimerPhaseName}中...` : '🍳 待機中'}
                    </div>
                    {eggTimerActive && (
                      <div className="phase-progress">
                        <div className="current-phase">
                          現在の段階: {eggTimerPhaseName}
                        </div>
                        <div className="phase-time">
                          残り時間: {formatTime(eggTimerPhaseTime)}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="cooking-timer-buttons">
                    {!eggTimerActive ? (
                      <button onClick={handleStartCookingTimer} className="cooking-timer-start-btn">
                        ▶️ 料理タイマー開始
                      </button>
                    ) : eggTimerPaused ? (
                      <>
                        <button onClick={handleStartCookingTimer} className="cooking-timer-start-btn">
                          ▶️ 再開
                        </button>
                        <button onClick={stopEggTimer} className="cooking-timer-stop-btn">
                          ⏹️ ストップ
                        </button>
                        <button onClick={resetEggTimer} className="cooking-timer-reset-btn">
                          🔄 リセット
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={pauseEggTimer} className="cooking-timer-pause-btn">
                          ⏸️ 一時停止
                        </button>
                        <button onClick={stopEggTimer} className="cooking-timer-stop-btn">
                          ⏹️ ストップ
                        </button>
                        <button onClick={resetEggTimer} className="cooking-timer-reset-btn">
                          🔄 リセット
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
                )}
            </div>
              );
          } else if (feature.id === 'projects') {
            return (
              <div key={feature.id} className="projects-section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">
                    <div className="mini-character">
                      <div className="mini-character-halo"></div>
                      <div className="mini-character-wings">
                        <div className="mini-wing left-mini-wing"></div>
                        <div className="mini-wing right-mini-wing"></div>
                      </div>
                      <div className="mini-character-face">
                        <div className="mini-character-eyes">
                          <div className="mini-eye left-mini-eye"></div>
                          <div className="mini-eye right-mini-eye"></div>
                        </div>
                        <div className="mini-character-mouth"></div>
                      </div>
                      <div className="mini-character-body"></div>
                      <div className="mini-sparkles">
                        <div className="mini-sparkle mini-sparkle-1"></div>
                        <div className="mini-sparkle mini-sparkle-2"></div>
                      </div>
                    </div>
                  </span>
                  プロジェクト
                </h2>
                <div className="section-controls">
                  {showProjects ? (
                    <button 
                      onClick={() => setShowProjects(false)}
                      className="close-section-button"
                      title="セクションを閉じる"
                    >
                      ✕
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        closeOtherFeatures('projects');
                        setShowProjects(true);
                      }}
                      className="show-section-button"
                      title="セクションを表示"
                    >
                      ▶️
                    </button>
                  )}
                </div>
              </div>
              
              {showProjects && (
                <div className="section-content">
                  <div className="projects-header">
                    <button 
                      onClick={() => setShowProjectForm(!showProjectForm)}
                      className="add-project-button"
                    >
                      {showProjectForm ? "❌ キャンセル" : "➕ プロジェクト追加"}
                    </button>
                    <button 
                      onClick={loadProjects}
                      className="refresh-button"
                      title="プロジェクトを更新"
                    >
                      🔄
                    </button>
                  </div>

              {showProjectForm && (
                <form onSubmit={handleCreateProject} className="project-form">
                  <div className="form-group">
                    <label htmlFor="projectName">プロジェクト名</label>
                    <input
                      type="text"
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="projectDescription">説明（任意）</label>
                    <input
                      type="text"
                      id="projectDescription"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="projectColor">色</label>
                    <input
                      type="color"
                      id="projectColor"
                      value={projectColor}
                      onChange={(e) => setProjectColor(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <button type="submit" disabled={loading} className="submit-button">
                    {loading ? "作成中..." : "プロジェクト作成"}
                  </button>
                </form>
              )}

              <div className="projects-list">
                {projectsLoading ? (
                  <div className="data-loading">
                    <div className="spinner"></div>
                    <p>プロジェクトを読み込み中...</p>
                  </div>
                ) : projects.length === 0 ? (
                  <p className="no-projects">プロジェクトが登録されていません</p>
                ) : (
                  projects.map((project) => (
                  <div 
                    key={project.id} 
                    className={`project-item ${selectedProject === project.id ? 'selected' : ''}`}
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <div className="project-icon">
                      <div className="mini-character">
                        <div className="mini-character-halo"></div>
                        <div className="mini-character-wings">
                          <div className="mini-wing left-mini-wing"></div>
                          <div className="mini-wing right-mini-wing"></div>
                        </div>
                        <div className="mini-character-face">
                          <div className="mini-character-eyes">
                            <div className="mini-eye left-mini-eye"></div>
                            <div className="mini-eye right-mini-eye"></div>
                          </div>
                          <div className="mini-character-mouth"></div>
                        </div>
                        <div className="mini-character-body"></div>
                        <div className="mini-sparkles">
                          <div className="mini-sparkle mini-sparkle-1"></div>
                          <div className="mini-sparkle mini-sparkle-2"></div>
                          <div className="mini-sparkle mini-sparkle-3"></div>
                        </div>
                      </div>
                    </div>
                    <div className="project-info">
                      <h3>{project.name}</h3>
                      {project.description && <p>{project.description}</p>}
                    </div>
                  </div>
                ))
                )}
              </div>
            </div>
            );
          } else if (feature.id === 'reports') {
            return (
              <div key={feature.id} className="reports-section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">
                    <div className="mini-character">
                      <div className="mini-character-halo"></div>
                      <div className="mini-character-wings">
                        <div className="mini-wing left-mini-wing"></div>
                        <div className="mini-wing right-mini-wing"></div>
                      </div>
                      <div className="mini-character-face">
                        <div className="mini-character-eyes">
                          <div className="mini-eye left-mini-eye"></div>
                          <div className="mini-eye right-mini-eye"></div>
                        </div>
                        <div className="mini-character-mouth"></div>
                      </div>
                      <div className="mini-character-body"></div>
                      <div className="mini-sparkles">
                        <div className="mini-sparkle mini-sparkle-1"></div>
                        <div className="mini-sparkle mini-sparkle-2"></div>
                      </div>
                    </div>
                  </span>
                  レポート
                </h2>
                <div className="section-controls">
                  {showReports ? (
                    <button 
                      onClick={() => {
                        setShowReports(false);
                      }}
                      className="close-section-button"
                      title="セクションを閉じる"
                    >
                      ✕
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        closeOtherFeatures('reports');
                        setShowReports(true);
                        if (!reportSummary) {
                          loadReportSummary();
                        }
                      }}
                      className="show-section-button"
                      title="セクションを表示"
                    >
                      ▶️
                    </button>
                  )}
                </div>
              </div>

              {showReports && reportSummary && (
                <div className="report-content">
                  <div className="report-stats">
                    <div className="stat-card">
                      <h3>総作業時間</h3>
                      <p className="stat-value">{formatTime(reportSummary.totalTime)}</p>
                    </div>
                    <div className="stat-card">
                      <h3>今日の作業時間</h3>
                      <p className="stat-value">{formatTime(reportSummary.todayTime)}</p>
                    </div>
                    <div className="stat-card">
                      <h3>今週の作業時間</h3>
                      <p className="stat-value">{formatTime(reportSummary.thisWeekTime)}</p>
                    </div>
                    <div className="stat-card">
                      <h3>今月の作業時間</h3>
                      <p className="stat-value">{formatTime(reportSummary.thisMonthTime)}</p>
                    </div>
                  </div>
                  
                  <div className="report-details">
                    <div className="detail-section">
                      <h3>セッション統計</h3>
                      <p>総セッション数: {reportSummary.totalEntries}回</p>
                      <p>平均セッション時間: {formatTime(reportSummary.averageSessionTime)}</p>
                    </div>
                    
                    {reportSummary.projectBreakdown.length > 0 && (
                      <div className="detail-section">
                        <h3>プロジェクト別時間</h3>
                        <div className="project-breakdown">
                          {reportSummary.projectBreakdown.map((project) => (
                            <div key={project.projectId} className="breakdown-item">
                              <span className="project-name">{project.projectName}</span>
                              <span className="project-time">{formatTime(project.totalTime)}</span>
                              <span className="project-count">({project.entryCount}回)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            );
          } else if (feature.id === 'admin-panel' && user?.role === 'admin') {
            return (
              <div key={feature.id} className="admin-section">
                <div className="section-header">
                  <h2>
                  <span className="section-icon">
                    <div className="mini-character">
                      <div className="mini-character-halo"></div>
                      <div className="mini-character-wings">
                        <div className="mini-wing left-mini-wing"></div>
                        <div className="mini-wing right-mini-wing"></div>
                      </div>
                      <div className="mini-character-face">
                        <div className="mini-character-eyes">
                          <div className="mini-eye left-mini-eye"></div>
                          <div className="mini-eye right-mini-eye"></div>
                        </div>
                        <div className="mini-character-mouth"></div>
                      </div>
                      <div className="mini-character-body"></div>
                      <div className="mini-sparkles">
                        <div className="mini-sparkle mini-sparkle-1"></div>
                        <div className="mini-sparkle mini-sparkle-2"></div>
                      </div>
                    </div>
                  </span>
                  管理者パネル
                </h2>
                  <div className="section-controls">
                    {showAdminPanel ? (
                      <button 
                        onClick={() => {
                          setShowAdminPanel(false);
                        }}
                        className="close-section-button"
                        title="セクションを閉じる"
                      >
                        ✕
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          closeOtherFeatures('admin');
                          setShowAdminPanel(true);
                          if (adminUsers.length === 0) {
                            loadAdminUsers();
                          }
                        }}
                        className="show-section-button"
                        title="セクションを表示"
                      >
                        ▶️
                      </button>
                    )}
                  </div>
                </div>

                {showAdminPanel && (
                  <div className="admin-content">
                  <div className="admin-header">
                    <button 
                      onClick={loadAdminUsers}
                      className="refresh-button"
                      title="管理者データを更新"
                    >
                      🔄
                    </button>
                    <button 
                      onClick={() => {
                        const count = calculateNotificationCount();
                        updateAppBadge(count);
                        setMessage(`バッジを更新しました: ${count}件`);
                      }}
                      className="refresh-button"
                      title="バッジを更新"
                    >
                      🔔
                    </button>
                  </div>
                    <div className="admin-stats">
                      <div className="stat-card">
                        <h3>総ユーザー数</h3>
                        <p className="stat-value">{adminUsers.length}</p>
                      </div>
                      <div className="stat-card">
                        <h3>アクティブユーザー</h3>
                        <p className="stat-value">{adminUsers.filter(u => u.status === 'active').length}</p>
                      </div>
                      <div className="stat-card">
                        <h3>管理者数</h3>
                        <p className="stat-value">{adminUsers.filter(u => u.role === 'admin').length}</p>
                      </div>
                    </div>

                    <div className="users-table">
                      <h3>ユーザー一覧</h3>
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>表示名</th>
                              <th>メール</th>
                              <th>役割</th>
                              <th>状態</th>
                              <th>登録日</th>
                              <th>操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adminUsers.map((user) => (
                              <tr key={user.id}>
                                <td>{user.displayName}</td>
                                <td>{user.email}</td>
                                <td>
                                  <span className={`role-badge ${user.role}`}>
                                    {user.role === 'admin' ? '管理者' : 'ユーザー'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`status-badge ${user.status}`}>
                                    {user.status === 'active' ? 'アクティブ' : 
                                     user.status === 'inactive' ? '非アクティブ' : '停止中'}
                                  </span>
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                  <button 
                                    onClick={() => handleEditUser(user)}
                                    className="edit-button"
                                  >
                                    編集
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteUser(user.id, user.displayName)}
                                    className="delete-button"
                                    style={{ 
                                      marginLeft: '8px', 
                                      backgroundColor: deletingUserId === user.id ? '#6c757d' : '#dc3545',
                                      opacity: deletingUserId === user.id ? 0.7 : 1
                                    }}
                                    disabled={deletingUserId === user.id}
                                  >
                                    {deletingUserId === user.id ? '削除中...' : '削除'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* ユーザー編集フォーム */}
                    {editingUser && (
                      <div className="edit-user-form">
                        <h3>ユーザー編集</h3>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          handleUpdateUser(editingUser);
                        }}>
                          <div className="form-group">
                            <label>表示名</label>
                            <input
                              type="text"
                              value={editingUser.displayName}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                displayName: e.target.value
                              })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>メールアドレス</label>
                            <input
                              type="email"
                              value={editingUser.email}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                email: e.target.value
                              })}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>役割</label>
                            <select
                              value={editingUser.role}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                role: e.target.value
                              })}
                            >
                              <option value="user">ユーザー</option>
                              <option value="admin">管理者</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>状態</label>
                            <select
                              value={editingUser.status}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                status: e.target.value
                              })}
                            >
                              <option value="active">アクティブ</option>
                              <option value="inactive">非アクティブ</option>
                              <option value="suspended">停止</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>
                              <input
                                type="checkbox"
                                checked={editingUser.isVerified}
                                onChange={(e) => setEditingUser({
                                  ...editingUser,
                                  isVerified: e.target.checked
                                })}
                              />
                              認証済み
                            </label>
                          </div>
                          <div className="form-actions">
                            <button type="submit" className="save-button">
                              保存
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setEditingUser(null)}
                              className="cancel-button"
                            >
                              キャンセル
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </div>
              );
            } else if (feature.id === 'bookshelf') {
            return (
              <div key={feature.id} className="bookshelf-section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">
                    <div className="mini-character">
                      <div className="mini-character-halo"></div>
                      <div className="mini-character-wings">
                        <div className="mini-wing left-mini-wing"></div>
                        <div className="mini-wing right-mini-wing"></div>
                      </div>
                      <div className="mini-character-face">
                        <div className="mini-character-eyes">
                          <div className="mini-eye left-mini-eye"></div>
                          <div className="mini-eye right-mini-eye"></div>
                        </div>
                        <div className="mini-character-mouth"></div>
                      </div>
                      <div className="mini-character-body"></div>
                      <div className="mini-sparkles">
                        <div className="mini-sparkle mini-sparkle-1"></div>
                        <div className="mini-sparkle mini-sparkle-2"></div>
                      </div>
                    </div>
                  </span>
                  本棚
                </h2>
                <div className="section-controls">
                  {showBookshelf ? (
                    <button 
                      onClick={() => {
                        setShowBookshelf(false);
                      }}
                      className="close-section-button"
                      title="セクションを閉じる"
                    >
                      ✕
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        closeOtherFeatures('bookshelf');
                        setShowBookshelf(true);
                        if (books.length === 0) {
                          loadBooks();
                        }
                      }}
                      className="show-section-button"
                      title="セクションを表示"
                    >
                      ▶️
                    </button>
                  )}
                </div>
              </div>

              {showBookshelf && (
                <div className="bookshelf-content">
                  <div className="bookshelf-header">
                    <div className="bookshelf-controls">
                      <div className="category-controls">
                        <label htmlFor="bookCategoryFilter">カテゴリ:</label>
                        <select
                          id="bookCategoryFilter"
                          value={selectedBookCategory}
                          onChange={(e) => handleBookCategoryChange(e.target.value)}
                        >
                          <option value="all">すべて</option>
                          {getBookCategories().map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      <button 
                        onClick={loadBooks}
                        className="refresh-button"
                        title="本棚を更新"
                      >
                        🔄
                      </button>
                      {selectedBookCategory !== 'all' && (
                        <button 
                          onClick={() => {
                            setSelectedBookCategory('all');
                            loadBooks();
                          }}
                          className="reset-button"
                          title="フィルターをリセット"
                        >
                          🔄 リセット
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="bookshelf-stats">
                    <div className="stat-card">
                      <h3>総冊数</h3>
                      <p className="stat-value">{books.length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>読了済み</h3>
                      <p className="stat-value">{books.filter(book => book.readPages >= book.totalPages && book.totalPages > 0).length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>読書中</h3>
                      <p className="stat-value">{books.filter(book => book.readPages > 0 && book.readPages < book.totalPages).length}</p>
                    </div>
                  </div>

                  <div className="bookshelf-actions">
                    <button 
                      onClick={() => {
                        setEditingBook(null);
                        setShowBookForm(!showBookForm);
                        if (!showBookForm) {
                          setBookTitle("");
                          setBookAuthor("");
                          setBookIsbn("");
                          setBookPublishedYear(new Date().getFullYear());
                          setBookTotalPages(0);
                          setBookCategory("");
                          setBookNotes("");
                        }
                      }}
                      className="add-book-button"
                    >
                      {showBookForm ? "キャンセル" : "本を追加"}
                    </button>
                  </div>

                  {showBookForm && (
                    <form onSubmit={editingBook ? handleUpdateBook : handleCreateBook} className="book-form">
                      <h3>{editingBook ? "本を編集" : "本を追加"}</h3>
                      <div className="form-group">
                        <label htmlFor="bookTitle">タイトル *</label>
                        <input
                          type="text"
                          id="bookTitle"
                          value={bookTitle}
                          onChange={(e) => setBookTitle(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="bookAuthor">著者 *</label>
                        <input
                          type="text"
                          id="bookAuthor"
                          value={bookAuthor}
                          onChange={(e) => setBookAuthor(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="bookIsbn">ISBN *</label>
                        <input
                          type="text"
                          id="bookIsbn"
                          value={bookIsbn}
                          onChange={(e) => setBookIsbn(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="bookPublishedYear">出版年 *</label>
                        <input
                          type="number"
                          id="bookPublishedYear"
                          value={bookPublishedYear}
                          onChange={(e) => setBookPublishedYear(parseInt(e.target.value) || new Date().getFullYear())}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="bookTotalPages">総ページ数 *</label>
                        <input
                          type="number"
                          id="bookTotalPages"
                          value={bookTotalPages}
                          onChange={(e) => setBookTotalPages(parseInt(e.target.value) || 0)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="bookCategory">カテゴリ *</label>
                        <select
                          id="bookCategory"
                          value={bookCategory}
                          onChange={(e) => setBookCategory(e.target.value)}
                          required
                          disabled={loading}
                        >
                          <option value="">選択してください</option>
                          <option value="小説">小説</option>
                          <option value="ノンフィクション">ノンフィクション</option>
                          <option value="技術書">技術書</option>
                          <option value="ビジネス">ビジネス</option>
                          <option value="自己啓発">自己啓発</option>
                          <option value="その他">その他</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="bookNotes">メモ</label>
                        <textarea
                          id="bookNotes"
                          value={bookNotes}
                          onChange={(e) => setBookNotes(e.target.value)}
                          disabled={loading}
                          rows={3}
                        />
                      </div>
                      <button type="submit" disabled={loading} className="submit-button">
                        {loading ? "処理中..." : (editingBook ? "更新" : "追加")}
                      </button>
                    </form>
                  )}

                  <div className="books-list">
                    {booksLoading ? (
                      <div className="data-loading">
                        <div className="spinner"></div>
                        <p>本を読み込み中...</p>
                      </div>
                    ) : books.length === 0 ? (
                      <p className="no-books">本が登録されていません</p>
                    ) : (
                      books.map((book) => (
                        <div key={book.id} className="book-item">
                          <div className="book-info">
                            <h3>{book.title}</h3>
                            <p className="book-author">{book.author}</p>
                            <p className="book-meta">
                              {book.publishedYear}年 | <span 
                                className="book-category clickable" 
                                onClick={() => handleBookCategoryChange(book.category)}
                                title={`${book.category}でフィルター`}
                              >
                                {book.category}
                              </span> | {book.totalPages}ページ
                            </p>
                            {book.notes && (
                              <p className="book-notes">{book.notes}</p>
                            )}
                            <div className="reading-progress">
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill" 
                                  style={{ width: `${getReadingProgress(book)}%` }}
                                ></div>
                              </div>
                              <span className="progress-text">
                                {book.readPages} / {book.totalPages} ページ ({getReadingProgress(book)}%)
                              </span>
                            </div>
                          </div>
                          <div className="book-actions">
                            <button 
                              onClick={() => handleEditBook(book)}
                              className="edit-button"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.id, book.title)}
                              className="delete-button"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
              );
            } else if (feature.id === 'memos') {
            return (
              <div key={feature.id} className="memos-section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">
                    <div className="mini-character">
                      <div className="mini-character-halo"></div>
                      <div className="mini-character-wings">
                        <div className="mini-wing left-mini-wing"></div>
                        <div className="mini-wing right-mini-wing"></div>
                      </div>
                      <div className="mini-character-face">
                        <div className="mini-character-eyes">
                          <div className="mini-eye left-mini-eye"></div>
                          <div className="mini-eye right-mini-eye"></div>
                        </div>
                        <div className="mini-character-mouth"></div>
                      </div>
                      <div className="mini-character-body"></div>
                      <div className="mini-sparkles">
                        <div className="mini-sparkle mini-sparkle-1"></div>
                        <div className="mini-sparkle mini-sparkle-2"></div>
                      </div>
                    </div>
                  </span>
                  メモ
                </h2>
                <div className="section-controls">
                  {showMemos ? (
                    <button 
                      onClick={() => {
                        setShowMemos(false);
                      }}
                      className="close-section-button"
                      title="セクションを閉じる"
                    >
                      ✕
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        closeOtherFeatures('memos');
                        setShowMemos(true);
                        if (memos.length === 0) {
                          loadMemos();
                        }
                      }}
                      className="show-section-button"
                      title="セクションを表示"
                    >
                      ▶️
                    </button>
                  )}
                </div>
              </div>

              {showMemos && (
                <div className="memos-content">
                  <div className="memos-stats">
                    <div className="stat-card">
                      <h3>総メモ数</h3>
                      <p className="stat-value">{memos.length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>カテゴリ数</h3>
                      <p className="stat-value">{getMemoCategories().length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>公開メモ</h3>
                      <p className="stat-value">{memos.filter(memo => memo.isPublic).length}</p>
                    </div>
                  </div>

                  {showMemoForm && (
                    <form onSubmit={editingMemo ? handleUpdateMemo : handleCreateMemo} className="memo-form">
                      <h3>{editingMemo ? "メモを編集" : "メモを追加"}</h3>
                      <div className="form-group">
                        <label htmlFor="memoTitle">タイトル（空欄の場合は内容の一行目が使用されます）</label>
                        <input
                          type="text"
                          id="memoTitle"
                          value={memoTitle}
                          onChange={(e) => setMemoTitle(e.target.value)}
                          disabled={loading}
                          placeholder="タイトルを入力（省略可）"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="memoCategory">カテゴリ *</label>
                        <select
                          id="memoCategory"
                          value={memoCategory}
                          onChange={(e) => setMemoCategory(e.target.value)}
                          required
                          disabled={loading}
                        >
                          <option value="">選択してください</option>
                          {getAllGenres().map(genre => (
                            <option key={genre} value={genre}>{genre}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="memoContent">内容 *</label>
                        <textarea
                          id="memoContent"
                          value={memoContent}
                          onChange={(e) => setMemoContent(e.target.value)}
                          required
                          disabled={loading}
                          rows={6}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="memoTags">タグ（カンマ区切り）</label>
                        <input
                          type="text"
                          id="memoTags"
                          value={memoTags}
                          onChange={(e) => setMemoTags(e.target.value)}
                          disabled={loading}
                          placeholder="例: 重要, 会議, プロジェクト"
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={memoIsPublic}
                            onChange={(e) => setMemoIsPublic(e.target.checked)}
                            disabled={loading}
                          />
                          公開メモにする
                        </label>
                      </div>
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={memoIsFamilyOnly}
                            onChange={(e) => setMemoIsFamilyOnly(e.target.checked)}
                            disabled={loading}
                          />
                          家族のみ共有
                        </label>
                      </div>
                      {user?.role === 'admin' && (
                        <div className="form-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={memoIsAdminOnly}
                              onChange={(e) => setMemoIsAdminOnly(e.target.checked)}
                              disabled={loading}
                            />
                            管理者のみ投稿可能
                          </label>
                        </div>
                      )}
                      <button type="submit" disabled={loading} className="submit-button">
                        {loading ? "処理中..." : (editingMemo ? "更新" : "追加")}
                      </button>
                    </form>
                  )}

                  <div className="memos-controls">
                    <div className="search-controls">
                      <input
                        type="text"
                        placeholder="メモを検索..."
                        value={memoSearchTerm}
                        onChange={(e) => setMemoSearchTerm(e.target.value)}
                        className="search-input"
                      />
                      <button onClick={handleMemoSearch} className="search-button">
                        検索
                      </button>
                      <button 
                        onClick={loadMemos}
                        className="refresh-button"
                        title="メモを更新"
                      >
                        🔄
                      </button>
                      {(selectedMemoCategory !== 'all' || memoSearchTerm) && (
                        <button 
                          onClick={() => {
                            setSelectedMemoCategory('all');
                            setMemoSearchTerm('');
                            loadMemos();
                          }}
                          className="reset-button"
                          title="フィルターをリセット"
                        >
                          🔄 リセット
                        </button>
                      )}
                    </div>
                    <div className="category-controls">
                      <select
                        value={selectedMemoCategory}
                        onChange={(e) => handleMemoCategoryChange(e.target.value)}
                        className="category-select"
                      >
                        <option value="all">すべてのカテゴリ</option>
                        {getMemoCategories().map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={() => {
                        if (!showGenreManager) {
                          closeOtherFeatures('genre-manager');
                        }
                        setShowGenreManager(!showGenreManager);
                      }}
                      className="genre-manager-button"
                    >
                      🏷️ ジャンル管理
                    </button>
                    <button 
                      onClick={() => {
                        setEditingMemo(null);
                        setShowMemoForm(!showMemoForm);
                        if (!showMemoForm) {
                          setMemoTitle("");
                          setMemoContent("");
                          setMemoCategory("");
                          setMemoTags("");
                          setMemoIsPublic(false);
        setMemoIsFamilyOnly(false);
        setMemoIsAdminOnly(false);
                        }
                      }}
                      className="add-memo-button"
                    >
                      {showMemoForm ? "キャンセル" : "メモを追加"}
                    </button>
                  </div>

                  <div className="memos-list">
                    {memosLoading ? (
                      <div className="data-loading">
                        <div className="spinner"></div>
                        <p>メモを読み込み中...</p>
                      </div>
                    ) : memos.length === 0 ? (
                      <p className="no-memos">メモが登録されていません</p>
                    ) : (
                      memos.map((memo) => (
                        <div key={memo.id} className="memo-item">
                          <div className="memo-header">
                            <h3>{getMemoTitle(memo)}</h3>
                            <div className="memo-meta">
                              <span 
                                className="memo-category clickable" 
                                onClick={() => handleMemoCategoryChange(memo.category)}
                                title={`${memo.category}でフィルター`}
                              >
                                {memo.category}
                              </span>
                              {memo.isPublic && <span className="public-badge">公開</span>}
                              {memo.isFamilyOnly && <span className="family-badge">家族のみ</span>}
                              {memo.isAdminOnly && <span className="admin-badge">管理者専用</span>}
                            </div>
                          </div>
                          <div className="memo-content">
                            <p>{memo.content}</p>
                          </div>
                          {memo.tags && memo.tags.length > 0 && (
                            <div className="memo-tags">
                              {memo.tags.map((tag, index) => (
                                <span 
                                  key={index} 
                                  className="tag clickable" 
                                  onClick={() => {
                                    setMemoSearchTerm(tag);
                                    loadMemos();
                                  }}
                                  title={`${tag}で検索`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* 返信セクション */}
                          {memo.replies && memo.replies.length > 0 && (
                            <div className="memo-replies">
                              <h4>💬 返信 ({memo.replies.length})</h4>
                              {memo.replies.map((reply) => (
                                <div key={reply.id} className="reply-item">
                                  <div className="reply-header">
                                    <span className="reply-author">{reply.authorName}</span>
                                    <span className="reply-date">
                                      {formatDateTime(reply.createdAt)}
                                    </span>
                                  </div>
                                  <div className="reply-content">
                                    {reply.content}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {/* デバッグ用：返信データの確認 */}
                          {process.env.NODE_ENV === 'development' && (
                            <div style={{fontSize: '10px', color: '#666', marginTop: '5px'}}>
                              Debug: replies={memo.replies ? memo.replies.length : 'undefined'}
                            </div>
                          )}

                          <div className="memo-footer">
                            <span className="memo-date">
                              {formatDateTime(memo.updatedAt)}
                            </span>
                            <div className="memo-actions">
                              <button 
                                onClick={() => handleEditMemo(memo)}
                                className="edit-button"
                              >
                                編集
                              </button>
                              <button
                                onClick={() => handleDeleteMemo(memo.id, getMemoTitle(memo))}
                                className="delete-button"
                              >
                                削除
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ジャンル管理モーダル */}
              {showGenreManager && (
                <div className="genre-manager-modal">
                  <div className="genre-manager-content">
                    <div className="genre-manager-header">
                      <h3>ジャンル管理</h3>
                      <button 
                        onClick={() => setShowGenreManager(false)}
                        className="close-button"
                      >
                        ×
                      </button>
                    </div>
                    <div className="genre-manager-body">
                      <div className="add-genre-section">
                        <h4>新しいジャンルを追加</h4>
                        <div className="add-genre-form">
                          <input
                            type="text"
                            value={newGenreName}
                            onChange={(e) => setNewGenreName(e.target.value)}
                            placeholder="ジャンル名を入力"
                            className="genre-input"
                          />
                          <button 
                            onClick={handleAddGenre}
                            className="add-genre-button"
                            disabled={!newGenreName.trim() || customGenres.includes(newGenreName.trim())}
                          >
                            追加
                          </button>
                        </div>
                      </div>
                      
                      <div className="custom-genres-section">
                        <h4>カスタムジャンル一覧</h4>
                        {customGenres.length === 0 ? (
                          <p className="no-genres">カスタムジャンルはありません</p>
                        ) : (
                          <div className="genres-list">
                            {customGenres.map((genre, index) => (
                              <div key={index} className="genre-item">
                                <span className="genre-name">{genre}</span>
                                <button 
                                  onClick={() => handleDeleteGenre(genre)}
                                  className="delete-genre-button"
                                >
                                  削除
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
              );
            } else if (feature.id === 'public-memos') {
            return (
              <div key={feature.id} className="public-memos-section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">
                    <div className="mini-character">
                      <div className="mini-character-halo"></div>
                      <div className="mini-character-wings">
                        <div className="mini-wing left-mini-wing"></div>
                        <div className="mini-wing right-mini-wing"></div>
                      </div>
                      <div className="mini-character-face">
                        <div className="mini-character-eyes">
                          <div className="mini-eye left-mini-eye"></div>
                          <div className="mini-eye right-mini-eye"></div>
                        </div>
                        <div className="mini-character-mouth"></div>
                      </div>
                      <div className="mini-character-body"></div>
                      <div className="mini-sparkles">
                        <div className="mini-sparkle mini-sparkle-1"></div>
                        <div className="mini-sparkle mini-sparkle-2"></div>
                      </div>
                    </div>
                  </span>
                  公開メモ
                </h2>
                <div className="section-controls">
                  {showPublicMemos ? (
                    <button 
                      onClick={() => {
                        setShowPublicMemos(false);
                      }}
                      className="close-section-button"
                      title="セクションを閉じる"
                    >
                      ✕
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        closeOtherFeatures('public-memos');
                        setShowPublicMemos(true);
                        if (publicMemos.length === 0) {
                          loadPublicMemos();
                        }
                      }}
                      className="show-section-button"
                      title="セクションを表示"
                    >
                      ▶️
                    </button>
                  )}
                </div>
              </div>

              {showPublicMemos && (
                <div className="public-memos-content">
                  <div className="public-memos-stats">
                    <div className="stat-card">
                      <h3>公開メモ数</h3>
                      <p className="stat-value">{publicMemos.length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>カテゴリ数</h3>
                      <p className="stat-value">{getPublicMemoCategories().length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>最新更新</h3>
                      <p className="stat-value">
                        {publicMemos.length > 0 
                          ? formatDateTime(new Date(Math.max(...publicMemos.map(memo => new Date(memo.updatedAt).getTime()))).toISOString())
                          : '-'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="public-memos-controls">
                    <div className="search-controls">
                      <input
                        type="text"
                        placeholder="公開メモを検索..."
                        value={publicMemoSearchTerm}
                        onChange={(e) => setPublicMemoSearchTerm(e.target.value)}
                        className="search-input"
                      />
                      <button onClick={handlePublicMemoSearch} className="search-button">
                        検索
                      </button>
                      <button 
                        onClick={loadPublicMemos}
                        className="refresh-button"
                        title="公開メモを更新"
                      >
                        🔄
                      </button>
                      {(selectedPublicMemoCategory !== 'all' || publicMemoSearchTerm) && (
                        <button 
                          onClick={() => {
                            setSelectedPublicMemoCategory('all');
                            setPublicMemoSearchTerm('');
                            loadPublicMemos();
                          }}
                          className="reset-button"
                          title="フィルターをリセット"
                        >
                          🔄 リセット
                        </button>
                      )}
                    </div>
                    <div className="category-controls">
                      <select
                        value={selectedPublicMemoCategory}
                        onChange={(e) => handlePublicMemoCategoryChange(e.target.value)}
                        className="category-select"
                      >
                        <option value="all">すべてのカテゴリ</option>
                        {getPublicMemoCategories().map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div className="view-controls">
                      <button 
                        onClick={() => setPublicMemoViewMode('list')}
                        className={`view-button ${publicMemoViewMode === 'list' ? 'active' : ''}`}
                      >
                        📋 リスト
                      </button>
                      <button 
                        onClick={() => setPublicMemoViewMode('calendar')}
                        className={`view-button ${publicMemoViewMode === 'calendar' ? 'active' : ''}`}
                      >
                        📅 カレンダー
                      </button>
                    </div>
                  </div>

                  {publicMemoViewMode === 'list' ? (
                    <div className="public-memos-list">
                      {publicMemosLoading ? (
                        <div className="data-loading">
                          <div className="spinner"></div>
                          <p>公開メモを読み込み中...</p>
                        </div>
                      ) : publicMemos.length === 0 ? (
                        <p className="no-public-memos">公開メモがありません</p>
                      ) : (
                        publicMemos.map((memo) => (
                        <div key={memo.id} className="public-memo-item">
                          <div className="memo-header">
                            <h3>{getMemoTitle(memo)}</h3>
                            <div className="memo-meta">
                              <span 
                                className="memo-category clickable" 
                                onClick={() => handlePublicMemoCategoryChange(memo.category)}
                                title={`${memo.category}でフィルター`}
                              >
                                {memo.category}
                              </span>
                              <span className="public-badge">公開</span>
                              {memo.isFamilyOnly && <span className="family-badge">家族のみ</span>}
                              {memo.isAdminOnly && <span className="admin-badge">管理者専用</span>}
                            </div>
                          </div>
                          <div className="memo-content">
                            <p>{memo.content}</p>
                          </div>
                          {memo.tags && memo.tags.length > 0 && (
                            <div className="memo-tags">
                              {memo.tags.map((tag, index) => (
                                <span 
                                  key={index} 
                                  className="tag clickable" 
                                  onClick={() => {
                                    setPublicMemoSearchTerm(tag);
                                    loadPublicMemos();
                                  }}
                                  title={`${tag}で検索`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="memo-footer">
                            <span className="memo-date">
                              {formatDateTime(memo.updatedAt)}
                            </span>
                          </div>
                          
                          {/* 返信表示 */}
                          {memo.replies && memo.replies.length > 0 && (
                            <div className="replies-section">
                              <h5>💬 返信 ({memo.replies.length})</h5>
                              {memo.replies.map((reply) => (
                                <div key={reply.id} className="reply-item">
                                  {editingReply === reply.id ? (
                                    <div className="reply-edit-form">
                                      <textarea
                                        value={editReplyContent}
                                        onChange={(e) => setEditReplyContent(e.target.value)}
                                        className="reply-edit-textarea"
                                        rows={3}
                                      />
                                      <div className="reply-edit-actions">
                                        <button
                                          onClick={() => handleSaveEditReply(reply.id)}
                                          className="save-reply-button"
                                          disabled={!editReplyContent.trim()}
                                        >
                                          💾 保存
                                        </button>
                                        <button
                                          onClick={handleCancelEditReply}
                                          className="cancel-reply-button"
                                        >
                                          ❌ キャンセル
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="reply-content">{reply.content}</div>
                                      <div className="reply-meta">
                                        <span className="reply-author">👤 {reply.authorName}</span>
                                        <span className="reply-date">
                                          {formatDateTime(reply.createdAt)}
                                        </span>
                                        {user && (user.email === reply.authorEmail || user.id === reply.authorEmail) && (
                                          <div className="reply-actions">
                                            <button
                                              onClick={() => handleEditReply(reply.id, reply.content)}
                                              className="edit-reply-button"
                                              title="編集"
                                            >
                                              ✏️
                                            </button>
                                            <button
                                              onClick={() => handleDeleteReply(reply.id)}
                                              className="delete-reply-button"
                                              title="削除"
                                            >
                                              🗑️
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* 返信フォーム */}
                          <div className="reply-form-section">
                            <button 
                              onClick={() => setReplyingToMemo(replyingToMemo === memo.id ? null : memo.id)}
                              className="reply-button"
                            >
                              💬 返信する
                            </button>
                            
                            {replyingToMemo === memo.id && (
                              <div className="reply-form">
                                <h5>💬 返信を投稿</h5>
                                <div className="reply-author-info">
                                  <p>👤 投稿者: {user?.displayName || user?.email}</p>
                                </div>
                                <div className="form-group">
                                  <label htmlFor="replyContent">返信内容 *</label>
                                  <textarea
                                    id="replyContent"
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="返信内容を入力してください"
                                    rows={3}
                                    required
                                  />
                                </div>
                                <div className="reply-form-actions">
                                  <button 
                                    onClick={() => handleReplySubmit(memo.id)}
                                    className="submit-reply-button"
                                    disabled={!replyContent.trim()}
                                  >
                                    📤 返信を投稿
                                  </button>
                                  <button 
                                    onClick={handleReplyCancel}
                                    className="cancel-reply-button"
                                  >
                                    ❌ キャンセル
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    </div>
                  ) : (
                    <div className="calendar-container">
                      <div className="calendar-header">
                        <button 
                          onClick={() => navigatePublicMemoMonth('prev')}
                          className="calendar-nav-button"
                        >
                          ←
                        </button>
                        <h3>
                          {publicMemoCurrentDate.getFullYear()}年{publicMemoCurrentDate.getMonth() + 1}月
                        </h3>
                        <button 
                          onClick={() => navigatePublicMemoMonth('next')}
                          className="calendar-nav-button"
                        >
                          →
                        </button>
                      </div>
                      
                      <div className="calendar-weekdays">
                        <div className="weekday">日</div>
                        <div className="weekday">月</div>
                        <div className="weekday">火</div>
                        <div className="weekday">水</div>
                        <div className="weekday">木</div>
                        <div className="weekday">金</div>
                        <div className="weekday">土</div>
                      </div>
                      
                      <div className="calendar-days">
                        {getDaysInMonth(publicMemoCurrentDate).map((dayItem, index) => {
                          const dayMemos = getPublicMemosForDate(dayItem.date);
                          const isToday = dayItem.date.toDateString() === new Date().toDateString();
                          const isSelected = publicMemoSelectedDate && dayItem.date.toDateString() === publicMemoSelectedDate.toDateString();
                          
                          return (
                            <div
                              key={index}
                              className={`calendar-day ${!dayItem.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                              onClick={() => handlePublicMemoDateClick(dayItem.date)}
                            >
                              <div className="day-number">{dayItem.date.getDate()}</div>
                              <div className="day-records">
                                {dayMemos.map((memo, memoIndex) => (
                                  <div key={memoIndex} className="record-indicator clickable">
                                    <div className="record-content">{getMemoTitle(memo)}</div>
                                    <div className="record-amount">{memo.category}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {publicMemoSelectedDate && (
                        <div className="selected-date-info">
                          <h4>
                            📅 {publicMemoSelectedDate.getFullYear()}年{publicMemoSelectedDate.getMonth() + 1}月{publicMemoSelectedDate.getDate()}日の公開メモ
                          </h4>
                          <div className="date-records">
                            {getPublicMemosForDate(publicMemoSelectedDate).length === 0 ? (
                              <p>この日の公開メモはありません</p>
                            ) : (
                              getPublicMemosForDate(publicMemoSelectedDate).map((memo) => (
                                <div key={memo.id} className="date-record-item">
                                  <div className="record-icon">📝</div>
                                  <div className="record-content">
                                    <h5>{getMemoTitle(memo)}</h5>
                                    <p>{memo.content}</p>
                                    <div className="record-meta">
                                      <span className="memo-category">{memo.category}</span>
                                      {memo.tags && memo.tags.length > 0 && (
                                        <div className="memo-tags">
                                          {memo.tags.map((tag, index) => (
                                            <span key={index} className="tag">{tag}</span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
              );
            } else if (feature.id === 'work-records') {
            return (
              <div key={feature.id} className="work-records-section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">
                    <div className="mini-character">
                      <div className="mini-character-halo"></div>
                      <div className="mini-character-wings">
                        <div className="mini-wing left-mini-wing"></div>
                        <div className="mini-wing right-mini-wing"></div>
                      </div>
                      <div className="mini-character-face">
                        <div className="mini-character-eyes">
                          <div className="mini-eye left-mini-eye"></div>
                          <div className="mini-eye right-mini-eye"></div>
                        </div>
                        <div className="mini-character-mouth"></div>
                      </div>
                      <div className="mini-character-body"></div>
                      <div className="mini-sparkles">
                        <div className="mini-sparkle mini-sparkle-1"></div>
                        <div className="mini-sparkle mini-sparkle-2"></div>
                      </div>
                    </div>
                  </span>
                  お仕事記録
                </h2>
                <div className="section-controls">
                  {showWorkRecords ? (
                    <button 
                      onClick={() => setShowWorkRecords(false)}
                      className="close-section-button"
                      title="セクションを閉じる"
                    >
                      ✕
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        closeOtherFeatures('work-records');
                        setShowWorkRecords(true);
                      }}
                      className="show-section-button"
                      title="セクションを表示"
                    >
                      ▶️
                    </button>
                  )}
                </div>
              </div>

              {showWorkRecords && (
                <div className="work-records-content">
                  <div className="work-records-header">
                    <button 
                      onClick={() => {
                        loadSalaryRecords();
                        loadWorkDiaries();
                      }}
                      className="refresh-button"
                      title="勤務記録を更新"
                    >
                      🔄
                    </button>
                  </div>
                  <div className="work-records-tabs">
                    <button 
                      className={`tab-button ${!showSalaryForm && !showDiaryForm && !showCalendar ? 'active' : ''}`}
                      onClick={() => {
                        setShowSalaryForm(false);
                        setShowDiaryForm(false);
                        setShowCalendar(false);
                      }}
                    >
                      📊 記録一覧
                    </button>
                    <button 
                      className={`tab-button ${showCalendar ? 'active' : ''}`}
                      onClick={() => {
                        setShowSalaryForm(false);
                        setShowDiaryForm(false);
                        setShowCalendar(true);
                      }}
                    >
                      📅 カレンダー
                    </button>
                    <button 
                      className={`tab-button ${showSalaryForm ? 'active' : ''}`}
                      onClick={() => {
                        setShowSalaryForm(true);
                        setShowDiaryForm(false);
                        setShowCalendar(false);
                      }}
                    >
                      💰 収入・支出
                    </button>
                    <button 
                      className={`tab-button ${showDiaryForm ? 'active' : ''}`}
                      onClick={() => {
                        setShowSalaryForm(false);
                        setShowDiaryForm(true);
                        setShowCalendar(false);
                      }}
                    >
                      📝 日記
                    </button>
                  </div>

                  {/* 給料記録フォーム */}
                  {showSalaryForm && (
                    <form onSubmit={editingSalaryRecord ? handleUpdateSalaryRecord : handleCreateSalaryRecord} className="salary-form">
                      <h3>💰 {editingSalaryRecord ? '収入・支出記録を編集' : '収入・支出記録'}</h3>
                      <div className="form-group">
                        <label htmlFor="salaryDate">日付</label>
                        <input
                          type="date"
                          id="salaryDate"
                          value={salaryDate}
                          onChange={(e) => setSalaryDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="recordType">記録タイプ</label>
                        <select
                          id="recordType"
                          value={recordType}
                          onChange={(e) => {
                            setRecordType(e.target.value as 'income' | 'expense');
                            // タイプ変更時に金額をクリア
                            setSalary('');
                          }}
                        >
                          <option value="income">収入</option>
                          <option value="expense">支出</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="salary">金額 (円)</label>
                        <input
                          type="number"
                          id="salary"
                          value={salary}
                          onChange={(e) => setSalary(e.target.value)}
                          placeholder="例: 250000"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="transportation">交通費 (円)</label>
                        <input
                          type="number"
                          id="transportation"
                          value={transportation}
                          onChange={(e) => setTransportation(e.target.value)}
                          placeholder="例: 15000"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="overtime">残業代 (円)</label>
                        <input
                          type="number"
                          id="overtime"
                          value={overtime}
                          onChange={(e) => setOvertime(e.target.value)}
                          placeholder="例: 30000"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="bonus">ボーナス (円)</label>
                        <input
                          type="number"
                          id="bonus"
                          value={bonus}
                          onChange={(e) => setBonus(e.target.value)}
                          placeholder="例: 100000"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="salaryNotes">メモ</label>
                        <textarea
                          id="salaryNotes"
                          value={salaryNotes}
                          onChange={(e) => setSalaryNotes(e.target.value)}
                          placeholder="給料についてのメモ"
                          rows={3}
                        />
                      </div>
                      <button type="submit" className="submit-button">
                        💰 {editingSalaryRecord ? '収入・支出記録を更新' : '収入・支出記録を保存'}
                      </button>
                    </form>
                  )}

                  {/* 日記フォーム */}
                  {showDiaryForm && (
                    <form onSubmit={editingDiary ? handleUpdateDiary : handleCreateDiary} className="diary-form">
                      <h3>📝 {editingDiary ? '日記を編集' : 'お仕事日記'}</h3>
                      <div className="form-group">
                        <label htmlFor="diaryDate">日付</label>
                        <input
                          type="date"
                          id="diaryDate"
                          value={diaryDate}
                          onChange={(e) => setDiaryDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="diaryTitle">タイトル</label>
                        <input
                          type="text"
                          id="diaryTitle"
                          value={diaryTitle}
                          onChange={(e) => setDiaryTitle(e.target.value)}
                          placeholder="例: 今日のプロジェクト会議"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="diaryMood">気分</label>
                        <select
                          id="diaryMood"
                          value={diaryMood}
                          onChange={(e) => setDiaryMood(e.target.value)}
                        >
                          <option value="😊">😊 楽しい</option>
                          <option value="😐">😐 普通</option>
                          <option value="😔">😔 疲れた</option>
                          <option value="😤">😤 イライラ</option>
                          <option value="😴">😴 眠い</option>
                          <option value="🤔">🤔 悩み中</option>
                          <option value="😍">😍 最高</option>
                          <option value="😢">😢 悲しい</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="diaryContent">内容</label>
                        <textarea
                          id="diaryContent"
                          value={diaryContent}
                          onChange={(e) => setDiaryContent(e.target.value)}
                          placeholder="今日の仕事の内容や感想を書いてください"
                          rows={5}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="diaryTags">タグ (カンマ区切り)</label>
                        <input
                          type="text"
                          id="diaryTags"
                          value={diaryTags}
                          onChange={(e) => setDiaryTags(e.target.value)}
                          placeholder="例: 会議, プロジェクト, 残業"
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={diaryIsPrivate}
                            onChange={(e) => setDiaryIsPrivate(e.target.checked)}
                          />
                          プライベートにする
                        </label>
                      </div>
                      <button type="submit" className="submit-button">
                        📝 {editingDiary ? '日記を更新' : '日記を保存'}
                      </button>
                    </form>
                  )}

                  {/* カレンダー */}
                  {showCalendar && (
                    <div className="calendar-container">
                      <div className="calendar-header">
                        <button 
                          onClick={() => navigateMonth('prev')}
                          className="calendar-nav-button"
                        >
                          ←
                        </button>
                        <h3>
                          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
                        </h3>
                        <button 
                          onClick={() => navigateMonth('next')}
                          className="calendar-nav-button"
                        >
                          →
                        </button>
                      </div>
                      
                      <div className="calendar-weekdays">
                        <div className="weekday">日</div>
                        <div className="weekday">月</div>
                        <div className="weekday">火</div>
                        <div className="weekday">水</div>
                        <div className="weekday">木</div>
                        <div className="weekday">金</div>
                        <div className="weekday">土</div>
                      </div>
                      
                      <div className="calendar-days">
                        {getDaysInMonth(currentDate).map((dayItem, index) => {
                          const dayRecords = getRecordsForDate(dayItem.date);
                          const isToday = dayItem.date.toDateString() === new Date().toDateString();
                          const isSelected = selectedDate && dayItem.date.toDateString() === selectedDate.toDateString();
                          
                          // デバッグ用ログ
                          if (dayRecords.salaryRecords.length > 0 || dayRecords.diaries.length > 0) {
                            console.log(`Date: ${dayItem.date.toISOString().split('T')[0]}, Salary: ${dayRecords.salaryRecords.length}, Diaries: ${dayRecords.diaries.length}`);
                          }
                          
                          return (
                            <div
                              key={index}
                              className={`calendar-day ${!dayItem.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleDateClick(dayItem.date)}
                            >
                              <div className="day-number">{dayItem.date.getDate()}</div>
                              <div className="day-records">
                                {dayRecords.salaryRecords.length > 0 && dayRecords.diaries.length > 0 ? (
                                  // 両方の記録がある場合は、それぞれを表示
                                  <>
                                    <div 
                                      className="record-indicator salary-indicator clickable" 
                                      title="収入・支出記録を表示"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRecordClick('salary', dayItem.date);
                                      }}
                                    >
                                      <div className="record-icon">💰</div>
                                      <div className="record-amount">
                                        {dayRecords.salaryRecords.length === 1 ? (
                                          `${dayRecords.salaryRecords[0].salary >= 0 ? '収入' : '支出'}: ¥${Math.abs(dayRecords.salaryRecords[0].salary).toLocaleString()}`
                                        ) : (
                                          `${dayRecords.salaryRecords.length}件`
                                        )}
                                      </div>
                                    </div>
                                    <div 
                                      className="record-indicator diary-indicator clickable" 
                                      title="日記を表示"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRecordClick('diary', dayItem.date);
                                      }}
                                    >
                                      <div className="record-icon">📝</div>
                                      <div className="record-content">
                                        {dayRecords.diaries.length === 1 ? (
                                          dayRecords.diaries[0].title.length > 6 
                                            ? dayRecords.diaries[0].title.substring(0, 6) + '...'
                                            : dayRecords.diaries[0].title
                                        ) : (
                                          `${dayRecords.diaries.length}件`
                                        )}
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  // 片方の記録のみの場合
                                  <>
                                    {dayRecords.salaryRecords.length > 0 && (
                                      <div 
                                        className="record-indicator salary-indicator clickable" 
                                        title="収入・支出記録を表示"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRecordClick('salary', dayItem.date);
                                        }}
                                      >
                                        <div className="record-icon">💰</div>
                                        <div className="record-amount">
                                          {dayRecords.salaryRecords.length === 1 ? (
                                            `${dayRecords.salaryRecords[0].salary >= 0 ? '収入' : '支出'}: ¥${Math.abs(dayRecords.salaryRecords[0].salary).toLocaleString()}`
                                          ) : (
                                            `${dayRecords.salaryRecords.length}件の記録`
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    {dayRecords.diaries.length > 0 && (
                                      <div 
                                        className="record-indicator diary-indicator clickable" 
                                        title="日記を表示"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRecordClick('diary', dayItem.date);
                                        }}
                                      >
                                        <div className="record-icon">📝</div>
                                        <div className="record-content">
                                          {dayRecords.diaries.length === 1 ? (
                                            dayRecords.diaries[0].title.length > 8 
                                              ? dayRecords.diaries[0].title.substring(0, 8) + '...'
                                              : dayRecords.diaries[0].title
                                          ) : (
                                            `${dayRecords.diaries.length}件の日記`
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {selectedDate && (() => {
                        const selectedDateRecords = getRecordsForDate(selectedDate);
                        return (
                          <div className="selected-date-info">
                            <h4>
                              {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
                            </h4>
                            <div className="date-records">
                              {selectedDateRecords.salaryRecords.map((record) => (
                                <div 
                                  key={record._id} 
                                  className="date-record-item salary-record clickable"
                                  onClick={() => handleSpecificRecordClick(record, 'salary')}
                                  title="収入・支出記録を表示"
                                >
                                  <span className="record-icon">💰</span>
                                  <span className="record-content">
                                    {record.salary >= 0 ? '収入' : '支出'}: ¥{Math.abs(record.salary).toLocaleString()}
                                    {record.transportation > 0 && ` + 交通費: ¥${record.transportation.toLocaleString()}`}
                                  </span>
                                </div>
                              ))}
                              {selectedDateRecords.diaries.map((diary) => (
                                <div 
                                  key={diary._id} 
                                  className="date-record-item diary-record clickable"
                                  onClick={() => handleSpecificRecordClick(diary, 'diary')}
                                  title="日記を表示"
                                >
                                  <span className="record-icon">📝</span>
                                  <span className="record-content">
                                    {diary.mood} {diary.title}
                                  </span>
                                </div>
                              ))}
                              {selectedDateRecords.salaryRecords.length === 0 && 
                               selectedDateRecords.diaries.length === 0 && (
                                <p className="no-records">この日は記録がありません</p>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                      
                      {/* 月間収支サマリー */}
                      <div className="monthly-summary">
                        <h3>📊 {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月の収支</h3>
                        {(() => {
                          const summary = getMonthlySummary(currentDate.getFullYear(), currentDate.getMonth());
                          return (
                            <div className="summary-cards">
                              <div className="summary-card income">
                                <div className="summary-icon">💰</div>
                                <div className="summary-content">
                                  <div className="summary-label">収入</div>
                                  <div className="summary-amount">¥{summary.totalIncome.toLocaleString()}</div>
                                </div>
                              </div>
                              <div className="summary-card expense">
                                <div className="summary-icon">💸</div>
                                <div className="summary-content">
                                  <div className="summary-label">支出</div>
                                  <div className="summary-amount">¥{summary.totalExpense.toLocaleString()}</div>
                                </div>
                              </div>
                              <div className={`summary-card net ${summary.netIncome >= 0 ? 'positive' : 'negative'}`}>
                                <div className="summary-icon">{summary.netIncome >= 0 ? '📈' : '📉'}</div>
                                <div className="summary-content">
                                  <div className="summary-label">差額</div>
                                  <div className="summary-amount">¥{summary.netIncome.toLocaleString()}</div>
                                </div>
                              </div>
                              <div className="summary-card count">
                                <div className="summary-icon">📝</div>
                                <div className="summary-content">
                                  <div className="summary-label">記録数</div>
                                  <div className="summary-amount">{summary.recordCount}件</div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* 記録一覧 */}
                  {!showSalaryForm && !showDiaryForm && !showCalendar && !showRecordDetail && (
                    <div className="records-list">
                      <div className="salary-records">
                        <h3>💰 収入・支出記録 ({salaryRecords.length}件)</h3>
                        {salaryLoading ? (
                          <div className="section-loading">
                            <div className="spinner"></div>
                            <p>収入・支出記録を読み込み中...</p>
                          </div>
                        ) : salaryRecords.length > 0 ? (
                          <div className="records-grid">
                            {salaryRecords.map((record) => (
                              <div key={record._id} className="salary-record-item">
                                <div className="record-header">
                                  <h4>{new Date(record.date).toLocaleDateString('ja-JP')}</h4>
                                  <div className="record-actions">
                                    <button 
                                      onClick={() => viewSalaryRecord(record)}
                                      className="view-button"
                                    >
                                      👁️
                                    </button>
                                    <button 
                                      onClick={() => editSalaryRecord(record)}
                                      className="edit-button"
                                    >
                                      ✏️
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteSalaryRecord(record._id)}
                                      className="delete-button"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                                <div className="record-details">
                                  <p><strong>{record.salary >= 0 ? '収入:' : '支出:'}</strong> ¥{Math.abs(record.salary).toLocaleString()}</p>
                                  {record.transportation > 0 && <p><strong>交通費:</strong> ¥{record.transportation.toLocaleString()}</p>}
                                  {record.overtime > 0 && <p><strong>残業代:</strong> ¥{record.overtime.toLocaleString()}</p>}
                                  {record.bonus > 0 && <p><strong>ボーナス:</strong> ¥{record.bonus.toLocaleString()}</p>}
                                  {record.notes && <p><strong>メモ:</strong> {record.notes}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="no-records-card">
                            <p>収入・支出記録がありません</p>
                            <button 
                              onClick={() => setShowSalaryForm(true)}
                              className="add-record-btn"
                            >
                              収入・支出記録を追加
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="work-diaries">
                        <h3>📝 日記 ({workDiaries.length}件)</h3>
                        {diaryLoading ? (
                          <div className="section-loading">
                            <div className="spinner"></div>
                            <p>日記を読み込み中...</p>
                          </div>
                        ) : workDiaries.length > 0 ? (
                          <div className="diaries-list">
                            {workDiaries.map((diary) => (
                              <div key={diary._id} className="diary-item">
                                <div className="diary-header">
                                  <h4>{diary.title}</h4>
                                  <div className="diary-meta">
                                    <span className="diary-mood">{diary.mood}</span>
                                    <span className="diary-date">{new Date(diary.date).toLocaleDateString('ja-JP')}</span>
                                    <div className="diary-actions">
                                      <button 
                                        onClick={() => viewDiary(diary)}
                                        className="view-button"
                                      >
                                        👁️
                                      </button>
                                      <button 
                                        onClick={() => editDiary(diary)}
                                        className="edit-button"
                                      >
                                        ✏️
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteDiary(diary._id)}
                                        className="delete-button"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="diary-content">
                                  <p>{diary.content}</p>
                                  {diary.tags && diary.tags.length > 0 && (
                                    <div className="diary-tags">
                                      {diary.tags.map((tag, index) => (
                                        <span key={index} className="tag">#{tag}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="no-records-card">
                            <p>日記がありません</p>
                            <button 
                              onClick={() => setShowDiaryForm(true)}
                              className="add-record-btn"
                            >
                              日記を追加
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 記録詳細表示 */}
                  {showRecordDetail && selectedRecord && (
                    <div className="record-detail-view">
                      <div className="detail-header">
                        <button 
                          onClick={() => setShowRecordDetail(false)}
                          className="back-button"
                        >
                          ← 戻る
                        </button>
                        <h3>
                          {selectedRecordType === 'salary' ? '💰 収入・支出記録詳細' : '📝 日記詳細'}
                        </h3>
                      </div>
                      
                      <div className="detail-content">
                        {selectedRecordType === 'salary' ? (
                          <div className="salary-detail">
                            <div className="detail-section">
                              <h4>📅 日付</h4>
                              <p>{new Date(selectedRecord.date).toLocaleDateString('ja-JP')}</p>
                            </div>
                            
                            <div className="detail-section">
                              <h4>💰 {selectedRecord.salary >= 0 ? '収入' : '支出'}</h4>
                              <p className="amount">¥{Math.abs(selectedRecord.salary).toLocaleString()}</p>
                            </div>
                            
                            {selectedRecord.transportation > 0 && (
                              <div className="detail-section">
                                <h4>🚌 交通費</h4>
                                <p className="amount">¥{selectedRecord.transportation.toLocaleString()}</p>
                              </div>
                            )}
                            
                            {selectedRecord.overtime > 0 && (
                              <div className="detail-section">
                                <h4>⏰ 残業代</h4>
                                <p className="amount">¥{selectedRecord.overtime.toLocaleString()}</p>
                              </div>
                            )}
                            
                            {selectedRecord.bonus > 0 && (
                              <div className="detail-section">
                                <h4>🎁 ボーナス</h4>
                                <p className="amount">¥{selectedRecord.bonus.toLocaleString()}</p>
                              </div>
                            )}
                            
                            {selectedRecord.notes && (
                              <div className="detail-section">
                                <h4>📝 メモ</h4>
                                <p>{selectedRecord.notes}</p>
                              </div>
                            )}
                            
                            <div className="detail-actions">
                              <button 
                                onClick={() => {
                                  editSalaryRecord(selectedRecord);
                                  setShowRecordDetail(false);
                                }}
                                className="edit-btn"
                              >
                                ✏️ 編集
                              </button>
                              <button 
                                onClick={() => {
                                  handleDeleteSalaryRecord(selectedRecord._id);
                                  setShowRecordDetail(false);
                                }}
                                className="delete-btn"
                              >
                                🗑️ 削除
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="diary-detail">
                            <div className="detail-section">
                              <h4>📅 日付</h4>
                              <p>{new Date(selectedRecord.date).toLocaleDateString('ja-JP')}</p>
                            </div>
                            
                            <div className="detail-section">
                              <h4>😊 気分</h4>
                              <p className="mood">{selectedRecord.mood}</p>
                            </div>
                            
                            <div className="detail-section">
                              <h4>📝 タイトル</h4>
                              <p className="title">{selectedRecord.title}</p>
                            </div>
                            
                            <div className="detail-section">
                              <h4>📄 内容</h4>
                              <div className="content">
                                {selectedRecord.content.split('\n').map((line: string, index: number) => (
                                  <p key={index}>{line}</p>
                                ))}
                              </div>
                            </div>
                            
                            {selectedRecord.tags && selectedRecord.tags.length > 0 && (
                              <div className="detail-section">
                                <h4>🏷️ タグ</h4>
                                <div className="tags">
                                  {selectedRecord.tags.map((tag: string, index: number) => (
                                    <span key={index} className="tag">#{tag}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {selectedRecord.isPrivate && (
                              <div className="detail-section">
                                <h4>🔒 プライバシー</h4>
                                <p>非公開</p>
                              </div>
                            )}
                            
                            <div className="detail-actions">
                              <button 
                                onClick={() => {
                                  editDiary(selectedRecord);
                                  setShowRecordDetail(false);
                                }}
                                className="edit-btn"
                              >
                                ✏️ 編集
                              </button>
                              <button 
                                onClick={() => {
                                  handleDeleteDiary(selectedRecord._id);
                                  setShowRecordDetail(false);
                                }}
                                className="delete-btn"
                              >
                                🗑️ 削除
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
              );
            } else if (feature.id === 'timers') {
            return (
              <div key={feature.id} className="timers-section">
              <div className="section-header">
                <h2>
                  <span className="section-icon">
                    <div className="mini-character">
                      <div className="mini-character-face">
                        <div className="mini-character-eyes">
                          <div className="mini-eye left-mini-eye"></div>
                          <div className="mini-eye right-mini-eye"></div>
                        </div>
                        <div className="mini-character-mouth"></div>
                      </div>
                      <div className="mini-character-body"></div>
                    </div>
                  </span>
                  ⏱️ タイマー
                </h2>
                <div className="section-controls">
                  {showTimers ? (
                    <button 
                      onClick={() => setShowTimers(false)}
                      className="close-section-button"
                      title="セクションを閉じる"
                    >
                      ✕
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowTimers(true)}
                      className="show-section-button"
                      title="セクションを表示"
                    >
                      ▶️
                    </button>
                  )}
                </div>
              </div>
              
              {showTimers && (
                <div className="section-content">

                 <div className="timers-content">
                   {/* 音声停止ボタン */}
                   {isSoundPlaying && (
                     <div className="sound-stop-section">
                       <div className="sound-stop-alert">
                         <h3>🔊 通知音が再生中です</h3>
                         <p>タイマーが終了しました。音を停止するには下のボタンを押してください。</p>
                         <button 
                           onClick={stopSoundLoop} 
                           className="sound-stop-btn"
                         >
                           🔇 音を停止
                         </button>
                       </div>
                     </div>
                   )}

                   {/* タイマー設定 */}
                   <div className="timer-settings-section">
                     <h3>⚙️ タイマー設定</h3>
                     <div className="settings-grid">
                       <div className="setting-group">
                         <label>
                           <input
                             type="checkbox"
                             checked={timerSettings.enableSounds}
                             onChange={(e) => saveTimerSettings({
                               ...timerSettings,
                               enableSounds: e.target.checked
                             })}
                           />
                           🔊 音声を有効にする
                         </label>
                       </div>
                       <div className="setting-group">
                         <label>
                           <input
                             type="checkbox"
                             checked={timerSettings.enableNotifications}
                             onChange={(e) => saveTimerSettings({
                               ...timerSettings,
                               enableNotifications: e.target.checked
                             })}
                           />
                           🔔 ブラウザ通知を有効にする
                         </label>
                       </div>
                       <div className="setting-group">
                         <label>デフォルトのカスタムタイマー時間</label>
                         <div className="time-inputs">
                           <input
                             type="number"
                             value={timerSettings.defaultCustomMinutes}
                             onChange={(e) => saveTimerSettings({
                               ...timerSettings,
                               defaultCustomMinutes: Math.max(0, parseInt(e.target.value) || 0)
                             })}
                             min="0"
                             max="999"
                           />
                           <span>分</span>
                           <input
                             type="number"
                             value={timerSettings.defaultCustomSeconds}
                             onChange={(e) => saveTimerSettings({
                               ...timerSettings,
                               defaultCustomSeconds: Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                             })}
                             min="0"
                             max="59"
                           />
                           <span>秒</span>
                         </div>
                       </div>
                       <div className="setting-group">
                         <label>タイマーテーマ</label>
                         <select
                           value={timerSettings.theme}
                           onChange={(e) => {
                             const newSettings = {
                               ...timerSettings,
                               theme: e.target.value as 'default' | 'dark' | 'colorful' | 'minimal'
                             };
                             saveTimerSettings(newSettings);
                             applyTimerTheme(e.target.value, timerSettings.customColors);
                           }}
                           className="theme-selector"
                         >
                           <option value="default">🎨 デフォルト</option>
                           <option value="dark">🌙 ダーク</option>
                           <option value="colorful">🌈 カラフル</option>
                           <option value="minimal">⚪ ミニマル</option>
                         </select>
                       </div>
                       <div className="setting-group">
                         <label>カスタムカラー</label>
                         <div className="color-inputs">
                           <div className="color-input">
                             <label>プライマリ</label>
                             <input
                               type="color"
                               value={timerSettings.customColors.primary}
                               onChange={(e) => {
                                 const newSettings = {
                                   ...timerSettings,
                                   customColors: {
                                     ...timerSettings.customColors,
                                     primary: e.target.value
                                   }
                                 };
                                 saveTimerSettings(newSettings);
                                 applyTimerTheme('default', newSettings.customColors);
                               }}
                             />
                           </div>
                           <div className="color-input">
                             <label>セカンダリ</label>
                             <input
                               type="color"
                               value={timerSettings.customColors.secondary}
                               onChange={(e) => {
                                 const newSettings = {
                                   ...timerSettings,
                                   customColors: {
                                     ...timerSettings.customColors,
                                     secondary: e.target.value
                                   }
                                 };
                                 saveTimerSettings(newSettings);
                                 applyTimerTheme('default', newSettings.customColors);
                               }}
                             />
                           </div>
                           <div className="color-input">
                             <label>アクセント</label>
                             <input
                               type="color"
                               value={timerSettings.customColors.accent}
                               onChange={(e) => {
                                 const newSettings = {
                                   ...timerSettings,
                                   customColors: {
                                     ...timerSettings.customColors,
                                     accent: e.target.value
                                   }
                                 };
                                 saveTimerSettings(newSettings);
                                 applyTimerTheme('default', newSettings.customColors);
                               }}
                             />
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* カスタムタイマー */}
                   <CustomTimer
                     showCustomTimer={showCustomTimer}
                     setShowCustomTimer={setShowCustomTimer}
                     closeOtherFeatures={closeOtherFeatures}
                     setMessage={setMessage}
                   />

                {/* プリセットタイマー */}
                <div className="preset-timers-section">
                  <div className="subsection-header">
                    <h3>⚡ プリセットタイマー</h3>
                    <div className="subsection-controls">
                      {showPresetTimers ? (
                        <button 
                          onClick={() => setShowPresetTimers(false)}
                          className="close-section-button"
                          title="セクションを閉じる"
                        >
                          ✕
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            closeOtherFeatures('preset-timers');
                            setShowPresetTimers(true);
                          }}
                          className="show-section-button"
                          title="セクションを表示"
                        >
                          ▶️
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {showPresetTimers && (
                    <div className="subsection-content">
                  <div className="preset-grid">
                    {timerPresets.map((preset) => (
                      <div key={preset.id} className="preset-item" style={{ borderColor: preset.color }}>
                        <div className="preset-header">
                          <h4 style={{ color: preset.color }}>{preset.name}</h4>
                          <span className="preset-time">{preset.minutes}:{preset.seconds.toString().padStart(2, '0')}</span>
                        </div>
                        <button 
                          onClick={() => startPresetTimer(preset)}
                          disabled={customTimerActive}
                          className="preset-start-btn"
                          style={{ backgroundColor: preset.color }}
                        >
                          ▶️ スタート
                        </button>
                      </div>
                    ))}
                  </div>
                    </div>
                  )}
                </div>

                   {/* タイマー統計 */}
                   <div className="timer-stats-section">
                     <div className="subsection-header">
                       <h3>📈 タイマー統計</h3>
                       <div className="subsection-controls">
                         {showTimerStats ? (
                           <button 
                             onClick={() => setShowTimerStats(false)}
                             className="close-section-button"
                             title="セクションを閉じる"
                           >
                             ✕
                           </button>
                         ) : (
                           <button 
                             onClick={() => {
                               closeOtherFeatures('timer-stats');
                               setShowTimerStats(true);
                             }}
                             className="show-section-button"
                             title="セクションを表示"
                           >
                             ▶️
                           </button>
                         )}
                       </div>
                     </div>
                     
                     {showTimerStats && (
                       <div className="subsection-content">
                     <div className="stats-grid">
                       <div className="stat-card">
                         <div className="stat-value">{timerHistory.length}</div>
                         <div className="stat-label">総実行回数</div>
                       </div>
                       <div className="stat-card">
                         <div className="stat-value">
                           {formatTime(timerHistory.reduce((total, entry) => total + entry.duration, 0))}
                         </div>
                         <div className="stat-label">総実行時間</div>
                       </div>
                       <div className="stat-card">
                         <div className="stat-value">
                           {timerHistory.filter(entry => entry.type === 'custom').length}
                         </div>
                         <div className="stat-label">カスタムタイマー</div>
                       </div>
                       <div className="stat-card">
                         <div className="stat-value">
                           {timerHistory.filter(entry => entry.type === 'preset').length}
                         </div>
                         <div className="stat-label">プリセットタイマー</div>
                       </div>
                       <div className="stat-card">
                         <div className="stat-value">
                           {timerHistory.filter(entry => entry.type === 'egg').length}
                         </div>
                         <div className="stat-label">ゆでたまごタイマー</div>
                       </div>
                       <div className="stat-card">
                         <div className="stat-value">
                           {timerHistory.length > 0 ? 
                             formatTime(Math.round(timerHistory.reduce((total, entry) => total + entry.duration, 0) / timerHistory.length)) : 
                             '00:00:00'
                           }
                         </div>
                         <div className="stat-label">平均実行時間</div>
                       </div>
                     </div>
                       </div>
                     )}
                   </div>

                   {/* タイマー履歴 */}
                   <div className="timer-history-section">
                     <div className="subsection-header">
                       <h3>📊 タイマー履歴</h3>
                       <div className="subsection-controls">
                         {showTimerHistory ? (
                           <button 
                             onClick={() => setShowTimerHistory(false)}
                             className="close-section-button"
                             title="セクションを閉じる"
                           >
                             ✕
                           </button>
                         ) : (
                           <button 
                             onClick={() => {
                               closeOtherFeatures('timer-history');
                               setShowTimerHistory(true);
                             }}
                             className="show-section-button"
                             title="セクションを表示"
                           >
                             ▶️
                           </button>
                         )}
                       </div>
                     </div>
                     
                     {showTimerHistory && (
                       <div className="subsection-content">
                     {timerHistory.length > 0 ? (
                       <div className="history-list">
                         {timerHistory.slice(0, 10).map((entry) => (
                           <div key={entry.id} className="history-item">
                             <div className="history-info">
                               <span className="history-name">{entry.name}</span>
                               <span className="history-duration">{formatTime(entry.duration)}</span>
                             </div>
                             <div className="history-meta">
                               <span className="history-type">
                                 {entry.type === 'custom' ? '🎯' : entry.type === 'preset' ? '⚡' : '🥚'}
                               </span>
                               <span className="history-date">
                                 {new Date(entry.completedAt).toLocaleDateString('ja-JP')}
                               </span>
                             </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <p className="no-history">まだタイマーの履歴がありません</p>
                     )}
                       </div>
                     )}
                   </div>
                </div>
              </div>
                )}
            </div>
              );
            } else if (feature.id === 'self-analysis') {
              console.log('Rendering self-analysis feature');
              return (
                <div key={feature.id} className="self-analysis-section">
                  <div className="section-header">
                    <h2>
                      <span className="section-icon">🔍</span>
                      じぶん図鑑
                    </h2>
                    <div className="section-controls">
                      {showSelfAnalysis ? (
                        <button 
                          onClick={() => setShowSelfAnalysis(false)}
                          className="close-section-button"
                          title="セクションを閉じる"
                        >
                          ✕
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            closeOtherFeatures('self-analysis');
                            setShowSelfAnalysis(true);
                          }}
                          className="show-section-button"
                          title="セクションを表示"
                        >
                          ▶️
                        </button>
                      )}
                    </div>
                  </div>

                  {showSelfAnalysis && (
                    <div className="self-analysis-content">
                      <div className="self-analysis-header">
                        <button 
                          onClick={() => {
                            // じぶん図鑑のデータは主にローカルストレージに保存されているため、
                            // ページをリロードしてデータを再読み込み
                            window.location.reload();
                          }}
                          className="refresh-button"
                          title="じぶん図鑑を更新"
                        >
                          🔄
                        </button>
                      </div>
                      <div className="analysis-tabs">
                        <button 
                          className={`tab-button ${selfAnalysisTab === 'dashboard' ? 'active' : ''}`}
                          onClick={() => setSelfAnalysisTab('dashboard')}
                        >
                          📊 分析ダッシュボード
                        </button>
                        <button 
                          className={`tab-button ${selfAnalysisTab === 'profile' ? 'active' : ''}`}
                          onClick={() => setSelfAnalysisTab('profile')}
                        >
                          👤 プロフィール
                        </button>
                        <button 
                          className={`tab-button ${selfAnalysisTab === 'habits' ? 'active' : ''}`}
                          onClick={() => setSelfAnalysisTab('habits')}
                        >
                          📈 習慣トラッカー
                        </button>
                        <button 
                          className={`tab-button ${selfAnalysisTab === 'mood' ? 'active' : ''}`}
                          onClick={() => setSelfAnalysisTab('mood')}
                        >
                          😊 感情ログ
                        </button>
                        <button 
                          className={`tab-button ${selfAnalysisTab === 'goals' ? 'active' : ''}`}
                          onClick={() => setSelfAnalysisTab('goals')}
                        >
                          🎯 目標管理
                        </button>
                        <button 
                          className={`tab-button ${selfAnalysisTab === 'learning' ? 'active' : ''}`}
                          onClick={() => setSelfAnalysisTab('learning')}
                        >
                          📚 学習記録
                        </button>
                      </div>

                      {selfAnalysisTab === 'dashboard' && (
                        <div className="analysis-dashboard">
                          <div className="dashboard-grid">
                          <div className="analysis-card">
                            <h3>📊 時間の使い方分析</h3>
                            <div className="analysis-content">
                              <div className="time-breakdown">
                                <div className="time-category">
                                  <span className="category-label">仕事</span>
                                  <div className="progress-bar">
                                    <div className="progress-fill" style={{width: '60%'}}></div>
                                  </div>
                                  <span className="time-value">6.0h</span>
                                </div>
                                <div className="time-category">
                                  <span className="category-label">学習</span>
                                  <div className="progress-bar">
                                    <div className="progress-fill" style={{width: '20%'}}></div>
                                  </div>
                                  <span className="time-value">2.0h</span>
                                </div>
                                <div className="time-category">
                                  <span className="category-label">休憩</span>
                                  <div className="progress-bar">
                                    <div className="progress-fill" style={{width: '20%'}}></div>
                                  </div>
                                  <span className="time-value">2.0h</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="analysis-card">
                            <h3>📈 生産性トレンド</h3>
                            <div className="analysis-content">
                              <div className="productivity-chart">
                                <div className="chart-placeholder">
                                  📈 過去7日間の生産性グラフ
                                </div>
                                <div className="productivity-stats">
                                  <div className="stat">
                                    <span className="stat-label">平均集中時間</span>
                                    <span className="stat-value">2.5h</span>
                                  </div>
                                  <div className="stat">
                                    <span className="stat-label">最高記録</span>
                                    <span className="stat-value">4.2h</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="analysis-card">
                            <h3>🎯 目標達成率</h3>
                            <div className="analysis-content">
                              <div className="goals-overview">
                                <div className="goal-progress">
                                  <span className="goal-label">今月の目標</span>
                                  <div className="circular-progress">
                                    <div className="progress-circle">
                                      <span className="progress-text">75%</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="goals-list">
                                  <div className="goal-item completed">
                                    ✅ 毎日読書する
                                  </div>
                                  <div className="goal-item in-progress">
                                    🔄 新しいスキルを学ぶ
                                  </div>
                                  <div className="goal-item pending">
                                    ⏳ 運動習慣をつける
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="analysis-card">
                            <h3>😊 感情・体調分析</h3>
                            <div className="analysis-content">
                              <div className="mood-overview">
                                <div className="mood-average">
                                  <span className="mood-label">平均気分</span>
                                  <div className="mood-scale">
                                    <div className="mood-indicator" style={{left: '70%'}}>😊</div>
                                    <div className="scale-line"></div>
                                  </div>
                                  <span className="mood-value">7.2/10</span>
                                </div>
                                <div className="mood-factors">
                                  <div className="factor">
                                    <span className="factor-label">睡眠</span>
                                    <span className="factor-value">7.5h</span>
                                  </div>
                                  <div className="factor">
                                    <span className="factor-label">ストレス</span>
                                    <span className="factor-value">3.2/10</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="analysis-card">
                            <h3>📚 学習・成長記録</h3>
                            <div className="analysis-content">
                              <div className="learning-stats">
                                <div className="learning-summary">
                                  <div className="summary-item">
                                    <span className="summary-label">今月の学習時間</span>
                                    <span className="summary-value">24.5h</span>
                                  </div>
                                  <div className="summary-item">
                                    <span className="summary-label">完了したコース</span>
                                    <span className="summary-value">3</span>
                                  </div>
                                  <div className="summary-item">
                                    <span className="summary-label">読んだ本</span>
                                    <span className="summary-value">2冊</span>
                                  </div>
                                </div>
                                <div className="recent-learning">
                                  <h4>最近の学習</h4>
                                  <div className="learning-item">
                                    📖 React開発の基礎
                                  </div>
                                  <div className="learning-item">
                                    🎥 TypeScript入門
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="analysis-card">
                            <h3>💡 おすすめアクション</h3>
                            <div className="analysis-content">
                              <div className="recommendations">
                                <div className="recommendation-item">
                                  <div className="recommendation-icon">⏰</div>
                                  <div className="recommendation-text">
                                    <strong>集中時間を増やしましょう</strong>
                                    <p>午前中の集中力が高い傾向があります。重要なタスクを午前に配置することをお勧めします。</p>
                                  </div>
                                </div>
                                <div className="recommendation-item">
                                  <div className="recommendation-icon">😴</div>
                                  <div className="recommendation-text">
                                    <strong>睡眠パターンを改善</strong>
                                    <p>睡眠時間が少ない日は生産性が下がる傾向があります。7-8時間の睡眠を心がけましょう。</p>
                                  </div>
                                </div>
                                <div className="recommendation-item">
                                  <div className="recommendation-icon">🎯</div>
                                  <div className="recommendation-text">
                                    <strong>小さな目標を設定</strong>
                                    <p>大きな目標を小さなステップに分けることで、達成感を得やすくなります。</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selfAnalysisTab === 'profile' && (
                      <div className="profile-content">
                        <div className="profile-header">
                          <h3>👤 パーソナルプロフィール</h3>
                          <button 
                            className="edit-profile-button"
                            onClick={() => setEditingProfile(!editingProfile)}
                          >
                            {editingProfile ? '保存' : '編集'}
                          </button>
                        </div>

                        <div className="profile-sections">
                          {/* 価値観 */}
                          <div className="profile-section">
                            <h4>💎 価値観</h4>
                            <div className="profile-items">
                              {personalProfile.values.map((value, index) => (
                                <div key={index} className="profile-item">
                                  <span>{value}</span>
                                  {editingProfile && (
                                    <button 
                                      className="remove-item-button"
                                      onClick={() => removeFromProfile('values', index)}
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                              {editingProfile && (
                                <div className="add-item-form">
                                  <input
                                    type="text"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    placeholder="価値観を追加..."
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        addToProfile('values', newValue);
                                        setNewValue('');
                                      }
                                    }}
                                  />
                                  <button 
                                    onClick={() => {
                                      addToProfile('values', newValue);
                                      setNewValue('');
                                    }}
                                    className="add-item-button"
                                  >
                                    追加
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 目標 */}
                          <div className="profile-section">
                            <h4>🎯 目標</h4>
                            <div className="profile-items">
                              {personalProfile.goals.map((goal, index) => (
                                <div key={index} className="profile-item">
                                  <span>{goal}</span>
                                  {editingProfile && (
                                    <button 
                                      className="remove-item-button"
                                      onClick={() => removeFromProfile('goals', index)}
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                              {editingProfile && (
                                <div className="add-item-form">
                                  <input
                                    type="text"
                                    value={newGoal}
                                    onChange={(e) => setNewGoal(e.target.value)}
                                    placeholder="目標を追加..."
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        addToProfile('goals', newGoal);
                                        setNewGoal('');
                                      }
                                    }}
                                  />
                                  <button 
                                    onClick={() => {
                                      addToProfile('goals', newGoal);
                                      setNewGoal('');
                                    }}
                                    className="add-item-button"
                                  >
                                    追加
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* スキル */}
                          <div className="profile-section">
                            <h4>🛠️ スキル</h4>
                            <div className="profile-items">
                              {personalProfile.skills.map((skill, index) => (
                                <div key={index} className="profile-item">
                                  <span>{skill}</span>
                                  {editingProfile && (
                                    <button 
                                      className="remove-item-button"
                                      onClick={() => removeFromProfile('skills', index)}
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                              {editingProfile && (
                                <div className="add-item-form">
                                  <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    placeholder="スキルを追加..."
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        addToProfile('skills', newSkill);
                                        setNewSkill('');
                                      }
                                    }}
                                  />
                                  <button 
                                    onClick={() => {
                                      addToProfile('skills', newSkill);
                                      setNewSkill('');
                                    }}
                                    className="add-item-button"
                                  >
                                    追加
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 興味・関心 */}
                          <div className="profile-section">
                            <h4>🌟 興味・関心</h4>
                            <div className="profile-items">
                              {personalProfile.interests.map((interest, index) => (
                                <div key={index} className="profile-item">
                                  <span>{interest}</span>
                                  {editingProfile && (
                                    <button 
                                      className="remove-item-button"
                                      onClick={() => removeFromProfile('interests', index)}
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                              {editingProfile && (
                                <div className="add-item-form">
                                  <input
                                    type="text"
                                    value={newInterest}
                                    onChange={(e) => setNewInterest(e.target.value)}
                                    placeholder="興味・関心を追加..."
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        addToProfile('interests', newInterest);
                                        setNewInterest('');
                                      }
                                    }}
                                  />
                                  <button 
                                    onClick={() => {
                                      addToProfile('interests', newInterest);
                                      setNewInterest('');
                                    }}
                                    className="add-item-button"
                                  >
                                    追加
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 強み */}
                          <div className="profile-section">
                            <h4>💪 強み</h4>
                            <div className="profile-items">
                              {personalProfile.strengths.map((strength, index) => (
                                <div key={index} className="profile-item">
                                  <span>{strength}</span>
                                  {editingProfile && (
                                    <button 
                                      className="remove-item-button"
                                      onClick={() => removeFromProfile('strengths', index)}
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                              {editingProfile && (
                                <div className="add-item-form">
                                  <input
                                    type="text"
                                    value={newStrength}
                                    onChange={(e) => setNewStrength(e.target.value)}
                                    placeholder="強みを追加..."
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        addToProfile('strengths', newStrength);
                                        setNewStrength('');
                                      }
                                    }}
                                  />
                                  <button 
                                    onClick={() => {
                                      addToProfile('strengths', newStrength);
                                      setNewStrength('');
                                    }}
                                    className="add-item-button"
                                  >
                                    追加
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 改善点 */}
                          <div className="profile-section">
                            <h4>🔧 改善点</h4>
                            <div className="profile-items">
                              {personalProfile.weaknesses.map((weakness, index) => (
                                <div key={index} className="profile-item">
                                  <span>{weakness}</span>
                                  {editingProfile && (
                                    <button 
                                      className="remove-item-button"
                                      onClick={() => removeFromProfile('weaknesses', index)}
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                              {editingProfile && (
                                <div className="add-item-form">
                                  <input
                                    type="text"
                                    value={newWeakness}
                                    onChange={(e) => setNewWeakness(e.target.value)}
                                    placeholder="改善点を追加..."
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        addToProfile('weaknesses', newWeakness);
                                        setNewWeakness('');
                                      }
                                    }}
                                  />
                                  <button 
                                    onClick={() => {
                                      addToProfile('weaknesses', newWeakness);
                                      setNewWeakness('');
                                    }}
                                    className="add-item-button"
                                  >
                                    追加
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* テキストフィールド */}
                          <div className="profile-section">
                            <h4>📝 詳細情報</h4>
                            <div className="profile-text-fields">
                              <div className="text-field">
                                <label>性格・特徴</label>
                                <textarea
                                  value={personalProfile.personality}
                                  onChange={(e) => updateProfileField('personality', e.target.value)}
                                  placeholder="あなたの性格や特徴を記述してください..."
                                  disabled={!editingProfile}
                                />
                              </div>
                              <div className="text-field">
                                <label>ライフスタイル</label>
                                <textarea
                                  value={personalProfile.lifestyle}
                                  onChange={(e) => updateProfileField('lifestyle', e.target.value)}
                                  placeholder="あなたのライフスタイルを記述してください..."
                                  disabled={!editingProfile}
                                />
                              </div>
                              <div className="text-field">
                                <label>仕事スタイル</label>
                                <textarea
                                  value={personalProfile.workStyle}
                                  onChange={(e) => updateProfileField('workStyle', e.target.value)}
                                  placeholder="あなたの仕事スタイルを記述してください..."
                                  disabled={!editingProfile}
                                />
                              </div>
                              <div className="text-field">
                                <label>学習スタイル</label>
                                <textarea
                                  value={personalProfile.learningStyle}
                                  onChange={(e) => updateProfileField('learningStyle', e.target.value)}
                                  placeholder="あなたの学習スタイルを記述してください..."
                                  disabled={!editingProfile}
                                />
                              </div>
                              <div className="text-field">
                                <label>モチベーション</label>
                                <textarea
                                  value={personalProfile.motivation}
                                  onChange={(e) => updateProfileField('motivation', e.target.value)}
                                  placeholder="あなたのモチベーションの源泉を記述してください..."
                                  disabled={!editingProfile}
                                />
                              </div>
                              <div className="text-field">
                                <label>将来のビジョン</label>
                                <textarea
                                  value={personalProfile.futureVision}
                                  onChange={(e) => updateProfileField('futureVision', e.target.value)}
                                  placeholder="将来のビジョンや夢を記述してください..."
                                  disabled={!editingProfile}
                                />
                              </div>
                              <div className="text-field">
                                <label>メモ・その他</label>
                                <textarea
                                  value={personalProfile.notes}
                                  onChange={(e) => updateProfileField('notes', e.target.value)}
                                  placeholder="その他のメモや気づきを記述してください..."
                                  disabled={!editingProfile}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selfAnalysisTab === 'habits' && (
                      <div className="habits-content">
                        <div className="habits-header">
                          <h3>📈 習慣トラッカー</h3>
                          <button 
                            className="add-habit-button"
                            onClick={() => setEditingHabit('new')}
                          >
                            + 新しい習慣
                          </button>
                        </div>

                        {/* 習慣追加フォーム */}
                        {editingHabit === 'new' && (
                          <div className="habit-form">
                            <div className="form-group">
                              <label>習慣名</label>
                              <input
                                type="text"
                                value={newHabit}
                                onChange={(e) => setNewHabit(e.target.value)}
                                placeholder="例: 毎日読書する"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    addHabit();
                                    setEditingHabit(null);
                                  }
                                }}
                              />
                            </div>
                            <div className="form-actions">
                              <button 
                                onClick={() => {
                                  addHabit();
                                  setEditingHabit(null);
                                }}
                                className="save-button"
                              >
                                追加
                              </button>
                              <button 
                                onClick={() => {
                                  setEditingHabit(null);
                                  setNewHabit('');
                                }}
                                className="cancel-button"
                              >
                                キャンセル
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 習慣一覧 */}
                        <div className="habits-list">
                          {habits.length === 0 ? (
                            <div className="empty-state">
                              <p>まだ習慣が登録されていません</p>
                              <p>「+ 新しい習慣」ボタンから習慣を追加してください</p>
                            </div>
                          ) : (
                            habits.map(habit => {
                              const today = new Date().toISOString().split('T')[0];
                              const isCompletedToday = habitHistory[habit.id]?.includes(today) || false;
                              const streak = habitStreak[habit.id] || 0;
                              const completionRate = getHabitCompletionRate(habit.id);

                              return (
                                <div key={habit.id} className="habit-card">
                                  <div className="habit-header">
                                    <div className="habit-info">
                                      <h4>{habit.name}</h4>
                                      <div className="habit-stats">
                                        <span className="streak">🔥 {streak}日連続</span>
                                        <span className="rate">📊 {completionRate.toFixed(1)}%</span>
                                      </div>
                                    </div>
                                    <div className="habit-actions">
                                      <button
                                        className={`toggle-button ${isCompletedToday ? 'completed' : ''}`}
                                        onClick={() => toggleHabitToday(habit.id)}
                                      >
                                        {isCompletedToday ? '✅' : '⭕'}
                                      </button>
                                      <button
                                        className="edit-button"
                                        onClick={() => setEditingHabit(habit.id)}
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        className="delete-button"
                                        onClick={() => deleteHabit(habit.id)}
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div className="habit-progress">
                                    <div className="progress-bar">
                                      <div 
                                        className="progress-fill" 
                                        style={{width: `${completionRate}%`}}
                                      ></div>
                                    </div>
                                    <span className="progress-text">{completionRate.toFixed(1)}%</span>
                                  </div>

                                  {/* 習慣編集フォーム */}
                                  {editingHabit === habit.id && (
                                    <div className="habit-edit-form">
                                      <div className="form-group">
                                        <label>習慣名</label>
                                        <input
                                          type="text"
                                          value={habit.name}
                                          onChange={(e) => updateHabit(habit.id, { name: e.target.value })}
                                        />
                                      </div>
                                      <div className="form-group">
                                        <label>説明</label>
                                        <textarea
                                          value={habit.description}
                                          onChange={(e) => updateHabit(habit.id, { description: e.target.value })}
                                          placeholder="習慣の詳細を記述..."
                                        />
                                      </div>
                                      <div className="form-group">
                                        <label>頻度</label>
                                        <select
                                          value={habit.frequency}
                                          onChange={(e) => updateHabit(habit.id, { frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                                        >
                                          <option value="daily">毎日</option>
                                          <option value="weekly">毎週</option>
                                          <option value="monthly">毎月</option>
                                        </select>
                                      </div>
                                      <div className="form-group">
                                        <label>カテゴリ</label>
                                        <select
                                          value={habit.category}
                                          onChange={(e) => updateHabit(habit.id, { category: e.target.value as 'personal' | 'health' | 'work' | 'learning' | 'social' })}
                                        >
                                          <option value="personal">個人</option>
                                          <option value="health">健康</option>
                                          <option value="work">仕事</option>
                                          <option value="learning">学習</option>
                                          <option value="social">社交</option>
                                        </select>
                                      </div>
                                      <div className="form-actions">
                                        <button 
                                          onClick={() => setEditingHabit(null)}
                                          className="save-button"
                                        >
                                          保存
                                        </button>
                                        <button 
                                          onClick={() => setEditingHabit(null)}
                                          className="cancel-button"
                                        >
                                          キャンセル
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* 習慣統計 */}
                        {habits.length > 0 && (
                          <div className="habits-stats">
                            <h4>📊 習慣統計</h4>
                            <div className="stats-grid">
                              <div className="stat-card">
                                <div className="stat-value">{habits.length}</div>
                                <div className="stat-label">登録済み習慣</div>
                              </div>
                              <div className="stat-card">
                                <div className="stat-value">
                                  {Object.values(habitStreak).reduce((sum, streak) => sum + streak, 0)}
                                </div>
                                <div className="stat-label">総達成回数</div>
                              </div>
                              <div className="stat-card">
                                <div className="stat-value">
                                  {habits.length > 0 ? (Object.values(habitStreak).reduce((sum, streak) => sum + streak, 0) / habits.length).toFixed(1) : 0}
                                </div>
                                <div className="stat-label">平均達成回数</div>
                              </div>
                              <div className="stat-card">
                                <div className="stat-value">
                                  {Math.max(...Object.values(habitStreak), 0)}
                                </div>
                                <div className="stat-label">最高連続記録</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selfAnalysisTab === 'mood' && (
                      <div className="mood-content">
                        <h3>😊 感情ログ</h3>
                        <p>感情ログ機能は準備中です...</p>
                      </div>
                    )}

                    {selfAnalysisTab === 'goals' && (
                      <div className="goals-content">
                        <div className="goals-header">
                          <h3>🎯 目標・夢の管理</h3>
                          <button 
                            className="add-goal-button"
                            onClick={() => setShowGoalForm(true)}
                          >
                            + 新しい目標
                          </button>
                        </div>

                        {/* 目標フォーム */}
                        {showGoalForm && (
                          <div className="goal-form">
                            <div className="form-group">
                              <label>目標タイトル</label>
                              <input
                                type="text"
                                value={goalForm.title}
                                onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="例: 英語を話せるようになる"
                              />
                            </div>

                            <div className="form-group">
                              <label>説明</label>
                              <textarea
                                value={goalForm.description}
                                onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="目標の詳細を記述..."
                                rows={3}
                              />
                            </div>

                            <div className="form-row">
                              <div className="form-group">
                                <label>カテゴリ</label>
                                <select
                                  value={goalForm.category}
                                  onChange={(e) => setGoalForm(prev => ({ ...prev, category: e.target.value }))}
                                >
                                  <option value="personal">個人</option>
                                  <option value="career">キャリア</option>
                                  <option value="health">健康</option>
                                  <option value="learning">学習</option>
                                  <option value="relationship">人間関係</option>
                                  <option value="financial">財務</option>
                                  <option value="hobby">趣味</option>
                                </select>
                              </div>

                              <div className="form-group">
                                <label>優先度</label>
                                <select
                                  value={goalForm.priority}
                                  onChange={(e) => setGoalForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                                >
                                  <option value="low">低</option>
                                  <option value="medium">中</option>
                                  <option value="high">高</option>
                                </select>
                              </div>

                              <div className="form-group">
                                <label>ステータス</label>
                                <select
                                  value={goalForm.status}
                                  onChange={(e) => setGoalForm(prev => ({ ...prev, status: e.target.value as 'not-started' | 'in-progress' | 'completed' | 'paused' }))}
                                >
                                  <option value="not-started">未開始</option>
                                  <option value="in-progress">進行中</option>
                                  <option value="completed">完了</option>
                                  <option value="paused">一時停止</option>
                                </select>
                              </div>
                            </div>

                            <div className="form-row">
                              <div className="form-group">
                                <label>開始日</label>
                                <input
                                  type="date"
                                  value={goalForm.startDate}
                                  onChange={(e) => setGoalForm(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                              </div>

                              <div className="form-group">
                                <label>目標日</label>
                                <input
                                  type="date"
                                  value={goalForm.targetDate}
                                  onChange={(e) => setGoalForm(prev => ({ ...prev, targetDate: e.target.value }))}
                                />
                              </div>

                              <div className="form-group">
                                <label>進捗率 (%)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={goalForm.progress}
                                  onChange={(e) => setGoalForm(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                                />
                              </div>
                            </div>

                            <div className="form-actions">
                              <button 
                                onClick={saveGoal}
                                className="save-button"
                              >
                                {editingGoal ? '更新' : '保存'}
                              </button>
                              <button 
                                onClick={resetGoalForm}
                                className="cancel-button"
                              >
                                キャンセル
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 目標一覧 */}
                        <div className="goals-list">
                          {goals.length === 0 ? (
                            <div className="empty-state">
                              <p>まだ目標が設定されていません</p>
                              <p>「+ 新しい目標」ボタンから目標を設定してください</p>
                            </div>
                          ) : (
                            <div className="goals-grid">
                              {goals.map(goal => (
                                <div key={goal.id} className="goal-card">
                                  <div className="goal-header">
                                    <h4 className="goal-title">{goal.title}</h4>
                                    <div className="goal-actions">
                                      <button
                                        onClick={() => editGoal(goal)}
                                        className="edit-button"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={() => deleteGoal(goal.id)}
                                        className="delete-button"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>

                                  {goal.description && (
                                    <div className="goal-description">
                                      <p>{goal.description}</p>
                                    </div>
                                  )}

                                  <div className="goal-progress">
                                    <div className="progress-header">
                                      <span className="progress-label">進捗率</span>
                                      <span className="progress-value">{goal.progress}%</span>
                                    </div>
                                    <div className="progress-bar">
                                      <div 
                                        className="progress-fill" 
                                        style={{width: `${goal.progress}%`}}
                                      ></div>
                                    </div>
                                  </div>

                                  <div className="goal-dates">
                                    <div className="date-item">
                                      <span className="date-label">開始日:</span>
                                      <span className="date-value">{goal.startDate}</span>
                                    </div>
                                    {goal.targetDate && (
                                      <div className="date-item">
                                        <span className="date-label">目標日:</span>
                                        <span className="date-value">{goal.targetDate}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selfAnalysisTab === 'learning' && (
                      <div className="learning-content">
                        <div className="learning-header">
                          <h3>📚 学習記録</h3>
                          <button 
                            className="add-learning-button"
                            onClick={() => {/* 学習記録追加機能 */}}
                          >
                            + 新しい学習記録
                          </button>
                        </div>

                        <div className="learning-stats">
                          <div className="stats-grid">
                            <div className="stat-card">
                              <div className="stat-value">{learningRecords.length}</div>
                              <div className="stat-label">総学習記録数</div>
                            </div>
                            <div className="stat-card">
                              <div className="stat-value">
                                {learningRecords.filter(r => r.status === 'completed').length}
                              </div>
                              <div className="stat-label">完了済み</div>
                            </div>
                            <div className="stat-card">
                              <div className="stat-value">
                                {learningRecords.filter(r => r.status === 'in-progress').length}
                              </div>
                              <div className="stat-label">進行中</div>
                            </div>
                            <div className="stat-card">
                              <div className="stat-value">
                                {learningRecords.length > 0 
                                  ? Math.round(learningRecords.reduce((sum, r) => sum + r.rating, 0) / learningRecords.length * 10) / 10
                                  : 0
                                }
                              </div>
                              <div className="stat-label">平均評価</div>
                            </div>
                          </div>
                        </div>

                        <div className="learning-list">
                          {learningRecords.length === 0 ? (
                            <div className="empty-state">
                              <p>まだ学習記録がありません</p>
                              <p>「+ 新しい学習記録」ボタンから学習内容を記録してください</p>
                            </div>
                          ) : (
                            <div className="learning-grid">
                              {learningRecords.map(record => (
                                <div key={record.id} className="learning-card">
                                  <div className="learning-header">
                                    <h4 className="learning-title">{record.title}</h4>
                                    <div className="learning-type">
                                      {record.type === 'book' && '📖'}
                                      {record.type === 'course' && '🎓'}
                                      {record.type === 'video' && '🎥'}
                                      {record.type === 'article' && '📄'}
                                      {record.type === 'practice' && '💪'}
                                      {record.type === 'other' && '📝'}
                                    </div>
                                  </div>

                                  <div className="learning-description">
                                    <p>{record.description}</p>
                                  </div>

                                  <div className="learning-meta">
                                    <div className="learning-category">
                                      <span className="category-label">カテゴリ:</span>
                                      <span className="category-value">{record.category}</span>
                                    </div>
                                    <div className="learning-rating">
                                      <span className="rating-label">評価:</span>
                                      <span className="rating-value">
                                        {'★'.repeat(record.rating)}{'☆'.repeat(5 - record.rating)}
                                      </span>
                                    </div>
                                    <div className="learning-status">
                                      <span className={`status-badge ${record.status}`}>
                                        {record.status === 'not-started' && '未開始'}
                                        {record.status === 'in-progress' && '進行中'}
                                        {record.status === 'completed' && '完了'}
                                        {record.status === 'paused' && '一時停止'}
                                      </span>
                                    </div>
                                  </div>

                                  {record.skills.length > 0 && (
                                    <div className="learning-skills">
                                      <h5>習得スキル</h5>
                                      <div className="skills-tags">
                                        {record.skills.map((skill, index) => (
                                          <span key={index} className="skill-tag">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="learning-dates">
                                    <div className="date-item">
                                      <span className="date-label">開始日:</span>
                                      <span className="date-value">{record.startDate}</span>
                                    </div>
                                    {record.completedDate && (
                                      <div className="date-item">
                                        <span className="date-label">完了日:</span>
                                        <span className="date-value">{record.completedDate}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    </div>
                  )}
                </div>
              );
            } else {
              console.log('Unknown feature:', feature.name, feature.id);
              return null;
            }
          })}
          </main>
        </div>
        
        {/* キャラクター達のお家モーダル */}
        {showCharacterHome && (
          <div className="character-home-modal">
            <div className="modal-overlay" onClick={handleCharacterHomeToggle}></div>
            <div className="character-home-modal-content">
              <div className="character-home-modal-header">
                <h2>🏠 キャラクター達のお家</h2>
                <button 
                  onClick={handleCharacterHomeToggle}
                  className="close-button"
                >
                  ✕
                </button>
              </div>
              <CharacterHome 
                onSelectCharacter={handleSelectCharacter}
                currentCharacter={currentCharacter}
              />
            </div>
          </div>
        )}
        
        {/* テーマ設定モーダル */}
        {showThemeSettings && (
          <div className="theme-settings-modal">
            <div className="theme-settings-content">
              <div className="theme-settings-header">
                <h3>🎨 テーマ設定</h3>
                <button 
                  onClick={() => setShowThemeSettings(false)}
                  className="close-button"
                >
                  ×
                </button>
              </div>
              <div className="theme-settings-body">
                <div className="theme-preview">
                  <p>現在のテーマ: {availableThemes.find(t => t.value === selectedTheme)?.preview} {availableThemes.find(t => t.value === selectedTheme)?.label}</p>
                </div>
                <div className="theme-options">
                  {availableThemes.map((theme) => (
                    <label key={theme.value} className="theme-option">
                      <input
                        type="radio"
                        name="theme"
                        value={theme.value}
                        checked={selectedTheme === theme.value}
                        onChange={(e) => handleThemeChange(e.target.value)}
                      />
                      <span className="theme-preview-icon">{theme.preview}</span>
                      <span className="theme-label">{theme.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* フォント設定モーダル */}
        {showFontSettings && (
          <div className="font-settings-modal">
            <div className="font-settings-content">
              <div className="font-settings-header">
                <h3>フォント設定</h3>
                <button 
                  onClick={() => setShowFontSettings(false)}
                  className="close-button"
                >
                  ×
                </button>
              </div>
              <div className="font-settings-body">
                <div className="font-preview">
                  <p style={{ fontFamily: selectedFont === "system" ? "" : selectedFont }}>
                    フォントプレビュー: {selectedFont}
                  </p>
                  <p style={{ fontFamily: selectedFont === "system" ? "" : selectedFont }}>
                    ⏰ Work Time Tracker 📚
                  </p>
                  <p style={{ fontFamily: selectedFont === "system" ? "" : selectedFont }}>
                    👋 こんにちは、梅澤寛太さん！
                  </p>
                  <p style={{ fontFamily: selectedFont === "system" ? "" : selectedFont }}>
                    🎨 テーマ 🔤 フォント ⚙️ 機能設定 🚪 ログアウト
                  </p>
                  <p style={{ fontFamily: selectedFont === "system" ? "" : selectedFont }}>
                    時間記録 | プロジェクト | レポート | 管理者パネル
                  </p>
                  <p style={{ fontFamily: selectedFont === "system" ? "" : selectedFont }}>
                    本棚 | メモ | 公開メモ | お仕事記録
                  </p>
                  <p style={{ fontFamily: selectedFont === "system" ? "" : selectedFont }}>
                    作業内容を入力してください | ▶️ 記録開始
                  </p>
                </div>
                <div className="font-options">
                  {availableFonts.map((font) => (
                    <label key={font.value} className="font-option">
                      <input
                        type="radio"
                        name="font"
                        value={font.value}
                        checked={selectedFont === font.value}
                        onChange={(e) => handleFontChange(e.target.value)}
                      />
                      <span style={{ fontFamily: font.value === "system" ? "" : font.value }}>
                        {font.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 機能設定モーダル */}
        {showFeatureSettings && (
          <div className="feature-settings-modal">
            <div className="feature-settings-content">
              <div className="feature-settings-header">
                <h3>⚙️ 機能設定</h3>
                <button 
                  onClick={() => setShowFeatureSettings(false)}
                  className="close-button"
                >
                  ×
                </button>
              </div>
              <div className="feature-settings-body">
                <div className="feature-settings-section">
                  <h4>📋 機能の並び順</h4>
                  <p>ドラッグ&ドロップまたは↑↓ボタンで機能の順序を変更できます</p>
                  <div className="mobile-hint">
                    <span className="hint-icon">👆</span>
                    <span className="hint-text">モバイルでは長押ししてドラッグできます</span>
                  </div>
                  <div className="feature-list">
                    {getFeatureOrder().map((featureId) => {
                      const feature = features.find(f => f.id === featureId);
                      if (!feature) return null;
                      return (
                      <div
                        key={feature.id}
                        className={`feature-item ${draggedFeature === feature.id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, feature.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, feature.id)}
                        onTouchStart={(e) => handleTouchStart(e, feature.id)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={(e) => handleTouchEnd(e, feature.id)}
                      >
                        <div className="feature-drag-handle">⋮⋮</div>
                        <div className="feature-item-content">
                          <div className="feature-icon">{feature.icon}</div>
                          <div className="feature-info">
                            <div className="feature-name">{feature.name}</div>
                            <div className="feature-description">{feature.description}</div>
                          </div>
                        </div>
                        <div className="feature-controls">
                          <div className="feature-order-controls">
                            <button 
                              className="order-button up-button"
                              onClick={() => moveFeatureUp(feature.id)}
                              disabled={userSettings?.featureOrder.indexOf(feature.id) === 0}
                              title="上に移動"
                            >
                              ↑
                            </button>
                            <button 
                              className="order-button down-button"
                              onClick={() => moveFeatureDown(feature.id)}
                              disabled={userSettings?.featureOrder.indexOf(feature.id) === (userSettings?.featureOrder.length || 0) - 1}
                              title="下に移動"
                            >
                              ↓
                            </button>
                          </div>
                          <div className="feature-toggle">
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                checked={!userSettings?.hiddenFeatures.includes(feature.id)}
                                onChange={() => handleFeatureToggle(feature.id)}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
                <div className="feature-settings-actions">
                  <button 
                    onClick={() => setShowFeatureSettings(false)}
                    className="save-button"
                  >
                    💾 設定を保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <div className="login-container">
        <h1>Work Time Tracker</h1>
        
        {isRegisterMode ? (
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label htmlFor="displayName">表示名</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">メールアドレス</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">パスワード</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            <button type="submit" disabled={loading} className="login-button">
              {loading ? "登録中..." : "アカウント作成"}
            </button>
            <button 
              type="button" 
              onClick={() => setIsRegisterMode(false)}
              className="switch-button"
            >
              ログインに戻る
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">メールアドレス</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">パスワード</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading} className="login-button">
              {loading ? "ログイン中..." : "ログイン"}
            </button>
            <button 
              type="button" 
              onClick={() => setIsRegisterMode(true)}
              className="switch-button"
            >
              アカウント作成
            </button>
          </form>
        )}
        
        {message && (
          <div className={`message ${message.includes("成功") || message.includes("作成") ? "success" : "error"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;