import { EventEmitter } from 'events';
import { openDB, deleteDB, IDBPDatabase } from 'idb';
import CryptoJS from 'crypto-js';

// 認知評価プロファイル型（拡張版）
interface CognitiveProfile {
  id: string;
  userId: string;
  version: number;
  timestamp: Date;
  lastModified: Date;

  // 基本認知スコア
  verbalComprehension: number;
  perceptualReasoning: number;
  workingMemory: number;
  processingSpeed: number;
  executiveFunction: number;
  attentionalControl: number;
  sensoryProcessing: number;
  socialCognition: number;
  fullScaleIQ: number;
  adhdOptimizedScore: number;

  // 詳細サブテスト結果
  subtestResults: {
    [key: string]: {
      rawScore: number;
      scaledScore: number;
      percentile: number;
      confidence: number;
      attemptTime: number;
    };
  };

  // 個人設定
  personalizedSettings: {
    optimalTaskDuration: number;
    preferredBreakFrequency: number;
    visualComplexityLevel: 'low' | 'medium' | 'high';
    auditoryProcessingPreference: 'minimal' | 'moderate' | 'enhanced';
    multitaskingCapacity: 'single' | 'dual' | 'multiple';
    timeStructureNeed: 'rigid' | 'flexible' | 'adaptive';
    sensoryPreferences: {
      lighting: 'dim' | 'natural' | 'bright';
      sound: 'quiet' | 'ambient' | 'active';
      temperature: 'cool' | 'neutral' | 'warm';
      movement: 'static' | 'fidget' | 'active';
    };
  };

  // 分析結果
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  adaptiveStrategies: string[];

  // 進捗データ
  progressTracking: {
    assessmentDate: Date;
    retestRecommendation: Date;
    improvementAreas: string[];
    currentGoals: string[];
    achievedMilestones: string[];
  };

  // メタデータ
  metadata: {
    assessmentDuration: number; // minutes
    testEnvironment: 'quiet' | 'normal' | 'distracting';
    deviceType: 'desktop' | 'tablet' | 'mobile';
    completionRate: number; // 0-1
    reliability: number; // 0-1
    validationStatus: 'valid' | 'questionable' | 'invalid';
  };

  // 同期情報
  syncStatus: {
    lastSyncedAt?: Date;
    syncVersion: number;
    cloudBackupStatus: 'pending' | 'synced' | 'error';
    conflictStatus?: 'none' | 'resolved' | 'pending';
  };
}

// エネルギーパターンデータ型
interface EnergyPatternData {
  id: string;
  userId: string;
  timestamp: Date;
  patterns: {
    [hour: number]: {
      energyLevel: number;
      focusCapacity: number;
      creativityLevel: number;
      executiveFunction: number;
      socialEnergy: number;
      confidence: number; // データの信頼度
      sampleSize: number; // データポイント数
    };
  };
  weeklyTrends: {
    [day: string]: {
      morning: number;
      afternoon: number;
      evening: number;
    };
  };
  adaptiveLearning: {
    learningRate: number;
    adaptationCount: number;
    lastAdaptation: Date;
    accuracyScore: number;
  };
  environmentalFactors: {
    weather: { [condition: string]: number };
    season: { [season: string]: number };
    socialContext: { [context: string]: number };
    workload: { [level: string]: number };
  };
}

// データベース設定
interface DatabaseConfig {
  dbName: string;
  version: number;
  stores: {
    [storeName: string]: {
      keyPath: string;
      indexes?: { [indexName: string]: string };
    };
  };
}

// 同期設定
interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // minutes
  batchSize: number;
  retryAttempts: number;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  offlineStorageLimit: number; // MB
}

class CognitiveDataPersistenceService extends EventEmitter {
  private db: IDBPDatabase | null = null;
  private encryptionKey: string;
  private syncConfig: SyncConfig;
  private dbConfig: DatabaseConfig;
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    super();

    this.dbConfig = {
      dbName: 'ADHDLifeHub_CognitiveData',
      version: 1,
      stores: {
        cognitiveProfiles: {
          keyPath: 'id',
          indexes: {
            'by-user': 'userId',
            'by-timestamp': 'timestamp',
            'by-version': 'version',
          },
        },
        energyPatterns: {
          keyPath: 'id',
          indexes: {
            'by-user': 'userId',
            'by-timestamp': 'timestamp',
          },
        },
        syncQueue: {
          keyPath: 'id',
          indexes: {
            'by-priority': 'priority',
            'by-timestamp': 'timestamp',
          },
        },
        userSettings: {
          keyPath: 'userId',
        },
        backupHistory: {
          keyPath: 'id',
          indexes: {
            'by-date': 'backupDate',
          },
        },
      },
    };

    this.syncConfig = {
      autoSync: true,
      syncInterval: 30, // 30分
      batchSize: 10,
      retryAttempts: 3,
      encryptionEnabled: true,
      compressionEnabled: true,
      offlineStorageLimit: 50, // 50MB
    };

    this.encryptionKey = this.getOrCreateEncryptionKey();
    this.initializeService();
  }

  /**
   * サービス初期化
   */
  private async initializeService(): Promise<void> {
    try {
      await this.initializeDatabase();
      this.setupNetworkListeners();

      if (this.syncConfig.autoSync) {
        this.startAutoSync();
      }

      console.log('🧠 認知データ永続化サービス初期化完了');
      this.emit('service-initialized');
    } catch (error) {
      console.error('認知データサービス初期化エラー:', error);
      this.emit('initialization-error', error);
    }
  }

  /**
   * データベース初期化
   */
  private async initializeDatabase(): Promise<void> {
    const dbConfig = this.dbConfig; // ローカル変数にコピー

    this.db = await openDB(dbConfig.dbName, dbConfig.version, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`データベースアップグレード: ${oldVersion} → ${newVersion}`);

        // 各ストアの作成
        Object.entries(dbConfig.stores).forEach(([storeName, config]) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: config.keyPath });

            // インデックス作成
            if (config.indexes) {
              Object.entries(config.indexes).forEach(([indexName, keyPath]) => {
                store.createIndex(indexName, keyPath);
              });
            }
          }
        });
      },
    });
  }

  /**
   * ネットワーク監視設定
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
      this.emit('network-status-changed', { online: true });
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('network-status-changed', { online: false });
    });
  }

  /**
   * 暗号化キー生成/取得
   */
  private getOrCreateEncryptionKey(): string {
    let key = localStorage.getItem('cognitive-encryption-key');
    if (!key) {
      key = CryptoJS.lib.WordArray.random(256 / 8).toString();
      localStorage.setItem('cognitive-encryption-key', key);
    }
    return key;
  }

  /**
   * データ暗号化
   */
  private encryptData(data: any): string {
    if (!this.syncConfig.encryptionEnabled) return JSON.stringify(data);

    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, this.encryptionKey).toString();
  }

  /**
   * データ復号化
   */
  private decryptData(encryptedData: string): any {
    if (!this.syncConfig.encryptionEnabled) return JSON.parse(encryptedData);

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('データ復号化エラー:', error);
      throw new Error('データの復号化に失敗しました');
    }
  }

  /**
   * 認知プロファイル保存
   */
  public async saveCognitiveProfile(
    profile: Partial<CognitiveProfile>,
    userId: string
  ): Promise<string> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    try {
      const now = new Date();
      const profileId = profile.id || `cognitive_${userId}_${now.getTime()}`;

      const fullProfile: CognitiveProfile = {
        id: profileId,
        userId,
        version: 1,
        timestamp: now,
        lastModified: now,
        verbalComprehension: 100,
        perceptualReasoning: 100,
        workingMemory: 100,
        processingSpeed: 100,
        executiveFunction: 100,
        attentionalControl: 100,
        sensoryProcessing: 100,
        socialCognition: 100,
        fullScaleIQ: 100,
        adhdOptimizedScore: 100,
        subtestResults: {},
        personalizedSettings: {
          optimalTaskDuration: 25,
          preferredBreakFrequency: 15,
          visualComplexityLevel: 'medium',
          auditoryProcessingPreference: 'moderate',
          multitaskingCapacity: 'dual',
          timeStructureNeed: 'flexible',
          sensoryPreferences: {
            lighting: 'natural',
            sound: 'ambient',
            temperature: 'neutral',
            movement: 'fidget',
          },
        },
        strengths: [],
        challenges: [],
        recommendations: [],
        adaptiveStrategies: [],
        progressTracking: {
          assessmentDate: now,
          retestRecommendation: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000), // 6ヶ月後
          improvementAreas: [],
          currentGoals: [],
          achievedMilestones: [],
        },
        metadata: {
          assessmentDuration: 0,
          testEnvironment: 'normal',
          deviceType: 'desktop',
          completionRate: 1,
          reliability: 1,
          validationStatus: 'valid',
        },
        syncStatus: {
          syncVersion: 1,
          cloudBackupStatus: 'pending',
        },
        ...profile,
      };

      // ローカル保存
      await this.db.put('cognitiveProfiles', fullProfile);

      // 同期キューに追加
      await this.addToSyncQueue('cognitive-profile', fullProfile);

      console.log('認知プロファイル保存完了:', profileId);
      this.emit('profile-saved', { profileId, profile: fullProfile });

      return profileId;
    } catch (error) {
      console.error('認知プロファイル保存エラー:', error);
      throw error;
    }
  }

  /**
   * 認知プロファイル取得
   */
  public async getCognitiveProfile(userId: string): Promise<CognitiveProfile | null> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    try {
      const profiles = await this.db.getAllFromIndex('cognitiveProfiles', 'by-user', userId);

      if (profiles.length === 0) return null;

      // 最新のプロファイルを返す
      const latestProfile = profiles.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];

      console.log('認知プロファイル取得:', latestProfile.id);
      return latestProfile;
    } catch (error) {
      console.error('認知プロファイル取得エラー:', error);
      return null;
    }
  }

  /**
   * エネルギーパターン保存
   */
  public async saveEnergyPattern(
    pattern: Partial<EnergyPatternData>,
    userId: string
  ): Promise<string> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    try {
      const now = new Date();
      const patternId = pattern.id || `energy_${userId}_${now.getTime()}`;

      const fullPattern: EnergyPatternData = {
        id: patternId,
        userId,
        timestamp: now,
        patterns: {},
        weeklyTrends: {},
        adaptiveLearning: {
          learningRate: 0.1,
          adaptationCount: 0,
          lastAdaptation: now,
          accuracyScore: 0.5,
        },
        environmentalFactors: {
          weather: {},
          season: {},
          socialContext: {},
          workload: {},
        },
        ...pattern,
      };

      await this.db.put('energyPatterns', fullPattern);
      await this.addToSyncQueue('energy-pattern', fullPattern);

      console.log('エネルギーパターン保存完了:', patternId);
      this.emit('energy-pattern-saved', { patternId, pattern: fullPattern });

      return patternId;
    } catch (error) {
      console.error('エネルギーパターン保存エラー:', error);
      throw error;
    }
  }

  /**
   * エネルギーパターン取得
   */
  public async getEnergyPattern(userId: string): Promise<EnergyPatternData | null> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    try {
      const patterns = await this.db.getAllFromIndex('energyPatterns', 'by-user', userId);

      if (patterns.length === 0) return null;

      // 最新のパターンを返す
      const latestPattern = patterns.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];

      console.log('エネルギーパターン取得:', latestPattern.id);
      return latestPattern;
    } catch (error) {
      console.error('エネルギーパターン取得エラー:', error);
      return null;
    }
  }

  /**
   * 同期キューに追加
   */
  private async addToSyncQueue(type: string, data: any): Promise<void> {
    if (!this.db) return;

    const queueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data: this.encryptData(data),
      timestamp: new Date(),
      priority: type === 'cognitive-profile' ? 'high' : 'normal',
      attempts: 0,
      status: 'pending',
    };

    await this.db.put('syncQueue', queueItem);

    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  /**
   * 同期キュー処理
   */
  private async processSyncQueue(): Promise<void> {
    if (!this.db || !this.isOnline) return;

    try {
      const queueItems = await this.db.getAllFromIndex('syncQueue', 'by-priority');
      const pendingItems = queueItems.filter((item) => item.status === 'pending');

      for (const item of pendingItems.slice(0, this.syncConfig.batchSize)) {
        try {
          await this.syncItemToCloud(item);

          // 成功したアイテムを削除
          await this.db.delete('syncQueue', item.id);

          this.emit('sync-success', { itemId: item.id, type: item.type });
        } catch (error) {
          console.error('同期エラー:', error);

          // リトライ回数を増やす
          item.attempts++;

          if (item.attempts >= this.syncConfig.retryAttempts) {
            item.status = 'failed';
            this.emit('sync-failed', { itemId: item.id, error });
          }

          await this.db.put('syncQueue', item);
        }
      }
    } catch (error) {
      console.error('同期キュー処理エラー:', error);
    }
  }

  /**
   * クラウド同期（Firebase連携）
   */
  private async syncItemToCloud(item: any): Promise<void> {
    // Firebase Firestoreとの同期実装
    // 実際の実装では、Firebase SDKを使用してデータを同期します

    console.log('クラウド同期中:', item.type, item.id);

    // 模擬的な同期処理
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 実際の実装例:
    /*
    const firestore = getFirestore();
    const decryptedData = this.decryptData(item.data);
    
    await setDoc(doc(firestore, 'users', decryptedData.userId, item.type, decryptedData.id), {
      ...decryptedData,
      serverTimestamp: serverTimestamp(),
    });
    */
  }

  /**
   * 自動同期開始
   */
  private startAutoSync(): void {
    this.syncInterval = setInterval(
      () => {
        if (this.isOnline) {
          this.processSyncQueue();
        }
      },
      this.syncConfig.syncInterval * 60 * 1000
    );
  }

  /**
   * バックアップ作成
   */
  public async createBackup(userId: string): Promise<string> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    try {
      const cognitive = await this.getCognitiveProfile(userId);
      const energy = await this.getEnergyPattern(userId);

      const backupData = {
        userId,
        timestamp: new Date(),
        version: '1.0',
        data: {
          cognitiveProfile: cognitive,
          energyPattern: energy,
        },
      };

      const backupId = `backup_${userId}_${Date.now()}`;
      const encryptedBackup = this.encryptData(backupData);

      await this.db.put('backupHistory', {
        id: backupId,
        userId,
        backupDate: new Date(),
        size: encryptedBackup.length,
        encrypted: this.syncConfig.encryptionEnabled,
        data: encryptedBackup,
      });

      console.log('バックアップ作成完了:', backupId);
      this.emit('backup-created', { backupId, size: encryptedBackup.length });

      return backupId;
    } catch (error) {
      console.error('バックアップ作成エラー:', error);
      throw error;
    }
  }

  /**
   * バックアップから復元
   */
  public async restoreFromBackup(backupId: string): Promise<void> {
    if (!this.db) throw new Error('データベースが初期化されていません');

    try {
      const backup = await this.db.get('backupHistory', backupId);
      if (!backup) throw new Error('バックアップが見つかりません');

      const backupData = this.decryptData(backup.data);

      if (backupData.data.cognitiveProfile) {
        await this.saveCognitiveProfile(backupData.data.cognitiveProfile, backupData.userId);
      }

      if (backupData.data.energyPattern) {
        await this.saveEnergyPattern(backupData.data.energyPattern, backupData.userId);
      }

      console.log('バックアップ復元完了:', backupId);
      this.emit('backup-restored', { backupId });
    } catch (error) {
      console.error('バックアップ復元エラー:', error);
      throw error;
    }
  }

  /**
   * データエクスポート
   */
  public async exportUserData(userId: string): Promise<string> {
    const cognitive = await this.getCognitiveProfile(userId);
    const energy = await this.getEnergyPattern(userId);

    const exportData = {
      exportDate: new Date(),
      userId,
      cognitiveProfile: cognitive,
      energyPattern: energy,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * ストレージ使用量取得
   */
  public async getStorageUsage(): Promise<{ used: number; total: number; percentage: number }> {
    if (!this.db) return { used: 0, total: 0, percentage: 0 };

    try {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const total = estimate.quota || 0;
      const percentage = total > 0 ? (used / total) * 100 : 0;

      return { used, total, percentage };
    } catch (error) {
      console.error('ストレージ使用量取得エラー:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }

  /**
   * データクリーンアップ
   */
  public async cleanupOldData(retentionDays: number = 90): Promise<void> {
    if (!this.db) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      // 古いバックアップを削除
      const oldBackups = await this.db.getAllFromIndex('backupHistory', 'by-date');
      const backupsToDelete = oldBackups.filter(
        (backup) => new Date(backup.backupDate) < cutoffDate
      );

      for (const backup of backupsToDelete) {
        await this.db.delete('backupHistory', backup.id);
      }

      console.log(`${backupsToDelete.length}個の古いバックアップを削除しました`);
      this.emit('cleanup-completed', { deletedBackups: backupsToDelete.length });
    } catch (error) {
      console.error('データクリーンアップエラー:', error);
    }
  }

  /**
   * サービス停止
   */
  public stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.db) {
      this.db.close();
      this.db = null;
    }

    this.removeAllListeners();
    console.log('🛑 認知データ永続化サービス停止');
  }
}

// シングルトンインスタンス
const cognitiveDataPersistenceService = new CognitiveDataPersistenceService();

export default cognitiveDataPersistenceService;
export { CognitiveDataPersistenceService };
export type { CognitiveProfile, EnergyPatternData, DatabaseConfig, SyncConfig };
