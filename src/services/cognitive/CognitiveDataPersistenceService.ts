/**
 * 🧠 認知データ永続化サービス
 * ADHD/ASD認知特性データの安全な保存・復元システム
 */

import { EventEmitter } from 'eventemitter3';

// タスク管理データ型
export interface ADHDTask {
  id: string;
  title: string;
  description?: string;
  status: 'ideas' | 'today' | 'doing' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  energyRequired: 'low' | 'medium' | 'high';
  estimatedMinutes: number;
  actualMinutes?: number;
  breakdownSteps: string[];
  completedSteps: number;
  category: 'work' | 'personal' | 'health' | 'creative' | 'admin';
  dueDate?: Date;
  timeBox?: {
    start: Date;
    duration: number;
    isActive: boolean;
  };
  sensoryLoad: 'low' | 'medium' | 'high';
  dopamineReward: number;
  executiveDifficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  completedAt?: Date;
  isHyperfocusRisk: boolean;
  userId?: string;
}

// 認知プロファイルデータ
export interface CognitiveProfile {
  id: string;
  userId: string;
  date: Date;
  verbalComprehension: number;
  perceptualReasoning: number;
  workingMemory: number;
  processingSpeed: number;
  executiveFunction: number;
  attentionalControl: number;
  sensoryProcessing: number;
  socialCognition: number;
  personalizedSettings: {
    optimalTaskDuration: number;
    preferredBreakFrequency: number;
    visualComplexityLevel: 'low' | 'medium' | 'high';
    auditoryProcessingPreference: 'minimal' | 'moderate' | 'enhanced';
    multitaskingCapacity: 'single' | 'dual' | 'multiple';
    timeStructureNeed: 'rigid' | 'flexible' | 'adaptive';
    cognitiveLoadThreshold: number;
    distractionSensitivity: 'low' | 'medium' | 'high';
  };
  strengths: string[];
  challenges: string[];
  recommendations: string[];
}

// 学習データ
export interface LearningData {
  id: string;
  userId: string;
  taskId: string;
  completionTime: number;
  energyBefore: number;
  energyAfter: number;
  difficultyRating: number;
  satisfactionRating: number;
  cognitiveLoad: number;
  distractionEvents: number;
  breaksTaken: number;
  timestamp: Date;
}

// エネルギー状態
export interface EnergyState {
  current: number;
  optimal: number;
  trend: 'rising' | 'stable' | 'falling';
  timestamp: Date;
}

// 永続化オプション
export interface PersistenceOptions {
  storage: 'localStorage' | 'indexedDB' | 'api';
  encryption: boolean;
  syncInterval: number; // minutes
  backupEnabled: boolean;
}

export class CognitiveDataPersistenceService extends EventEmitter {
  private dbName = 'CognitiveDataDB';
  private version = 1;
  private db: IDBDatabase | null = null;
  private userId: string;
  private options: PersistenceOptions;

  constructor(userId: string, options: Partial<PersistenceOptions> = {}) {
    super();
    this.userId = userId;
    this.options = {
      storage: 'indexedDB',
      encryption: false,
      syncInterval: 5,
      backupEnabled: true,
      ...options,
    };

    this.initializeStorage();
  }

  /**
   * ストレージの初期化
   */
  private async initializeStorage(): Promise<void> {
    try {
      if (this.options.storage === 'indexedDB') {
        await this.initializeIndexedDB();
      }
      console.log('🧠 認知データ永続化サービス初期化完了');
      this.emit('initialized');
    } catch (error) {
      console.error('認知データストレージ初期化エラー:', error);
      this.emit('error', error);
    }
  }

  /**
   * IndexedDBの初期化
   */
  private initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // タスクストア
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('userId', 'userId', { unique: false });
          taskStore.createIndex('status', 'status', { unique: false });
          taskStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // 認知プロファイルストア
        if (!db.objectStoreNames.contains('profiles')) {
          const profileStore = db.createObjectStore('profiles', { keyPath: 'id' });
          profileStore.createIndex('userId', 'userId', { unique: false });
          profileStore.createIndex('date', 'date', { unique: false });
        }

        // 学習データストア
        if (!db.objectStoreNames.contains('learning')) {
          const learningStore = db.createObjectStore('learning', { keyPath: 'id' });
          learningStore.createIndex('userId', 'userId', { unique: false });
          learningStore.createIndex('taskId', 'taskId', { unique: false });
          learningStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // エネルギー状態ストア
        if (!db.objectStoreNames.contains('energy')) {
          const energyStore = db.createObjectStore('energy', { keyPath: 'timestamp' });
          energyStore.createIndex('userId', 'userId', { unique: false });
        }
      };
    });
  }

  /**
   * タスクの保存
   */
  async saveTasks(tasks: ADHDTask[]): Promise<void> {
    try {
      if (this.options.storage === 'localStorage') {
        const tasksWithUserId = tasks.map((task) => ({ ...task, userId: this.userId }));
        localStorage.setItem(`cognitive_tasks_${this.userId}`, JSON.stringify(tasksWithUserId));
      } else if (this.options.storage === 'indexedDB' && this.db) {
        const transaction = this.db.transaction(['tasks'], 'readwrite');
        const store = transaction.objectStore('tasks');

        for (const task of tasks) {
          const taskWithUserId = { ...task, userId: this.userId };
          await store.put(taskWithUserId);
        }
      }

      console.log(`💾 ${tasks.length}個のタスクを保存しました`);
      this.emit('tasksSaved', tasks);
    } catch (error) {
      console.error('タスク保存エラー:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * タスクの読み込み
   */
  async loadTasks(): Promise<ADHDTask[]> {
    try {
      let tasks: ADHDTask[] = [];

      if (this.options.storage === 'localStorage') {
        const stored = localStorage.getItem(`cognitive_tasks_${this.userId}`);
        if (stored) {
          tasks = JSON.parse(stored);
        }
      } else if (this.options.storage === 'indexedDB' && this.db) {
        tasks = await this.getTasksFromIndexedDB();
      }

      // Date オブジェクトの復元
      tasks = tasks.map((task) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        timeBox: task.timeBox
          ? {
              ...task.timeBox,
              start: new Date(task.timeBox.start),
            }
          : undefined,
      }));

      console.log(`📖 ${tasks.length}個のタスクを読み込みました`);
      this.emit('tasksLoaded', tasks);

      return tasks;
    } catch (error) {
      console.error('タスク読み込みエラー:', error);
      this.emit('error', error);
      return [];
    }
  }

  /**
   * IndexedDBからタスクを取得
   */
  private getTasksFromIndexedDB(): Promise<ADHDTask[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      const index = store.index('userId');
      const request = index.getAll(this.userId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 単一タスクの保存
   */
  async saveTask(task: ADHDTask): Promise<void> {
    const currentTasks = await this.loadTasks();
    const existingIndex = currentTasks.findIndex((t) => t.id === task.id);

    if (existingIndex >= 0) {
      currentTasks[existingIndex] = { ...task, userId: this.userId };
    } else {
      currentTasks.push({ ...task, userId: this.userId });
    }

    await this.saveTasks(currentTasks);
  }

  /**
   * タスクの削除
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      const currentTasks = await this.loadTasks();
      const filteredTasks = currentTasks.filter((task) => task.id !== taskId);
      await this.saveTasks(filteredTasks);

      console.log(`🗑️ タスク ${taskId} を削除しました`);
      this.emit('taskDeleted', taskId);
    } catch (error) {
      console.error('タスク削除エラー:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 認知プロファイルの保存
   */
  async saveCognitiveProfile(profile: CognitiveProfile): Promise<void> {
    try {
      const profileWithUserId = { ...profile, userId: this.userId };

      if (this.options.storage === 'localStorage') {
        localStorage.setItem(`cognitive_profile_${this.userId}`, JSON.stringify(profileWithUserId));
      } else if (this.options.storage === 'indexedDB' && this.db) {
        const transaction = this.db.transaction(['profiles'], 'readwrite');
        const store = transaction.objectStore('profiles');
        await store.put(profileWithUserId);
      }

      console.log('🧠 認知プロファイルを保存しました');
      this.emit('profileSaved', profile);
    } catch (error) {
      console.error('認知プロファイル保存エラー:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 学習データの記録
   */
  async recordLearningData(data: Omit<LearningData, 'id' | 'userId'>): Promise<void> {
    try {
      const learningData: LearningData = {
        ...data,
        id: `learning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: this.userId,
      };

      if (this.options.storage === 'localStorage') {
        const existing = localStorage.getItem(`learning_data_${this.userId}`);
        const allData = existing ? JSON.parse(existing) : [];
        allData.push(learningData);
        localStorage.setItem(`learning_data_${this.userId}`, JSON.stringify(allData));
      } else if (this.options.storage === 'indexedDB' && this.db) {
        const transaction = this.db.transaction(['learning'], 'readwrite');
        const store = transaction.objectStore('learning');
        await store.put(learningData);
      }

      console.log('📊 学習データを記録しました');
      this.emit('learningDataRecorded', learningData);
    } catch (error) {
      console.error('学習データ記録エラー:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * エネルギー状態の保存
   */
  async saveEnergyState(energy: Omit<EnergyState, 'timestamp'>): Promise<void> {
    try {
      const energyData: EnergyState = {
        ...energy,
        timestamp: new Date(),
      };

      if (this.options.storage === 'localStorage') {
        localStorage.setItem(`energy_state_${this.userId}`, JSON.stringify(energyData));
      } else if (this.options.storage === 'indexedDB' && this.db) {
        const transaction = this.db.transaction(['energy'], 'readwrite');
        const store = transaction.objectStore('energy');
        await store.put({ ...energyData, userId: this.userId });
      }

      console.log('⚡ エネルギー状態を保存しました');
      this.emit('energySaved', energyData);
    } catch (error) {
      console.error('エネルギー状態保存エラー:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 全データのバックアップ作成
   */
  async createBackup(): Promise<string> {
    try {
      const tasks = await this.loadTasks();
      const profileData = localStorage.getItem(`cognitive_profile_${this.userId}`);
      const learningData = localStorage.getItem(`learning_data_${this.userId}`);
      const energyData = localStorage.getItem(`energy_state_${this.userId}`);

      const backup = {
        timestamp: new Date().toISOString(),
        userId: this.userId,
        tasks,
        profile: profileData ? JSON.parse(profileData) : null,
        learning: learningData ? JSON.parse(learningData) : [],
        energy: energyData ? JSON.parse(energyData) : null,
      };

      const backupString = JSON.stringify(backup, null, 2);
      console.log('💾 データバックアップを作成しました');
      this.emit('backupCreated', backup);

      return backupString;
    } catch (error) {
      console.error('バックアップ作成エラー:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * バックアップからの復元
   */
  async restoreFromBackup(backupString: string): Promise<void> {
    try {
      const backup = JSON.parse(backupString);

      if (backup.tasks) {
        await this.saveTasks(backup.tasks);
      }

      if (backup.profile) {
        await this.saveCognitiveProfile(backup.profile);
      }

      console.log('🔄 バックアップからデータを復元しました');
      this.emit('backupRestored', backup);
    } catch (error) {
      console.error('バックアップ復元エラー:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * データのクリア
   */
  async clearAllData(): Promise<void> {
    try {
      if (this.options.storage === 'localStorage') {
        localStorage.removeItem(`cognitive_tasks_${this.userId}`);
        localStorage.removeItem(`cognitive_profile_${this.userId}`);
        localStorage.removeItem(`learning_data_${this.userId}`);
        localStorage.removeItem(`energy_state_${this.userId}`);
      } else if (this.options.storage === 'indexedDB' && this.db) {
        const stores = ['tasks', 'profiles', 'learning', 'energy'];
        for (const storeName of stores) {
          const transaction = this.db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore('tasks');
          await store.clear();
        }
      }

      console.log('🗑️ 全認知データをクリアしました');
      this.emit('dataCleared');
    } catch (error) {
      console.error('データクリアエラー:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * サービスの破棄
   */
  dispose(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.removeAllListeners();
  }
}

// シングルトンインスタンスの作成
export const createCognitiveDataService = (
  userId: string,
  options?: Partial<PersistenceOptions>
) => {
  return new CognitiveDataPersistenceService(userId, options);
};
