// ユーザー関連の型定義
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isVerified: boolean;
  avatar?: string;
  preferences: any;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isVerified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// 時間記録関連の型定義
export interface TimeEntry {
  id: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  project?: string;
  category?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface ReportSummary {
  totalTime: number;
  totalEntries: number;
  averageSessionTime: number;
  todayTime: number;
  thisWeekTime: number;
  thisMonthTime: number;
  projectBreakdown: Array<{
    projectId: string;
    projectName: string;
    totalTime: number;
    entryCount: number;
  }>;
}

// 本の管理関連の型定義
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publishedYear: number;
  totalPages: number;
  readPages: number;
  category: string;
  rating: number;
  notes: string;
  lentTo: string;
  isPublic?: boolean;
  isFamilyOnly?: boolean;
  isAdminOnly?: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

// メモ関連の型定義
export interface Memo {
  id: string;
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  isFamilyOnly?: boolean;
  isAdminOnly?: boolean;
  userId: string;
  author?: string;
  postType?: 'update_request' | 'error_report' | 'general';
  status?: 'pending' | 'in_progress' | 'resolved' | 'closed';
  adminResponse?: string;
  adminResponseDate?: string;
  likes?: string[]; // いいねしたユーザーIDの配列
  createdAt: string;
  updatedAt: string;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  memoId: string;
  content: string;
  authorName: string;
  authorEmail: string;
  author?: string;
  createdAt: string;
}

// キャラクター関連の型定義
export interface Character {
  id: string;
  name: string;
  author: string;
  svg: string;
  description: string;
  likes: number;
  createdAt: string;
  isPublic: boolean;
  tags: string[];
}

// 収入・支出記録の型定義
export interface IncomeExpenseRecord {
  _id: string;
  userId: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  notes: string; // メモ
  createdAt: string;
  updatedAt: string;
}

// 日記の型定義
export interface WorkDiary {
  _id: string;
  userId: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  isPrivate: boolean;
  // 新しい項目
  workSummary: string; // 仕事の要約
  achievements: string[]; // 今日の成果
  challenges: string[]; // 課題・困難
  learnings: string[]; // 学んだこと
  nextGoals: string[]; // 明日の目標
  energyLevel: number; // エネルギーレベル (1-10)
  stressLevel: number; // ストレスレベル (1-10)
  workHours: number; // 作業時間
  breakTime: number; // 休憩時間
  productivity: number; // 生産性 (1-10)
  notes: string; // その他のメモ
  createdAt: string;
  updatedAt: string;
}

// 機能設定の型定義
export interface UserSettings {
  _id: string;
  userId: string;
  featureOrder: string[];
  hiddenFeatures: string[];
  createdAt: string;
  updatedAt: string;
}

// 機能定義
export interface Feature {
  id: string;
  name: string;
  description: string;
  component: React.ReactNode;
}

// 習慣関連の型定義
export interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetDays: number;
  completedDays: number;
  streak: number;
  bestStreak: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 気分ログ関連の型定義
export interface MoodLog {
  id: string;
  date: string;
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  stress: number; // 1-10 scale
  notes: string;
  activities: string[];
  weather: string;
  sleep: number; // hours
  createdAt: string;
}

// 目標関連の型定義
export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  startDate: string;
  targetDate: string;
  completedDate?: string;
  progress: number; // 0-100
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedDate?: string;
}

// 学習記録関連の型定義
export interface LearningRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'book' | 'course' | 'video' | 'article' | 'practice' | 'other';
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  startDate: string;
  completedDate?: string;
  rating: number; // 1-5
  notes: string;
  skills: string[];
  resources: string[];
  createdAt: string;
  updatedAt: string;
}

// 料理レシピ関連の型定義
export interface CookingPhase {
  name: string;
  duration: number;
  description: string;
}

export interface CookingRecipe {
  name: string;
  phases: CookingPhase[];
}

export interface CookingRecipes {
  [key: string]: CookingRecipe;
}

// じぶん図鑑関連の型定義
export interface EncyclopediaEntry {
  id: string;
  title: string;
  category: EncyclopediaCategory;
  description: string;
  content: string;
  tags: string[];
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  userId: string;
  views: number;
  likes: number;
}

export interface EncyclopediaCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

export interface EncyclopediaSection {
  id: string;
  title: string;
  content: string;
  order: number;
  entryId: string;
}

export interface EncyclopediaComment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  entryId: string;
  createdAt: Date;
  isApproved: boolean;
}