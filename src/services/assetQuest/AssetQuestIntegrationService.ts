import { EventEmitter } from '@/lib/EventEmitter';
import { store } from '@/store';
import { RootState } from '@/store';
import { fetchAssetEntries, addAssetEntry, updateAssetEntry } from '@/store/assetSlice';
import { fetchDebtEntries, addDebtEntry, updateDebtEntry } from '@/store/debtSlice';
import { AssetEntry, DebtEntry } from '@/types';
import { soundManager } from '@/utils/soundManager';

export interface AssetQuestIntegratedData {
  // 勇者ステータス
  hero: {
    level: number;
    experience: number;
    experienceToNext: number;
    title: string;
    avatar: string;
    totalAssets: number;
    totalDebts: number;
    netWorth: number;
  };
  // 現在月のデータ
  currentMonth: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
    target: number;
    daysRemaining: number;
    assetGrowth: number;
    debtReduction: number;
  };
  // クエストデータ
  questProgress: {
    monthlyQuestCompleted: boolean;
    streakDays: number;
    totalQuestsCompleted: number;
    currentReward: number;
    lastUpdateDate: string;
  };
  // 実績データ
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress: number;
    unlockedDate?: string;
  }>;
  // 統合データ
  integration: {
    lastSyncDate: string;
    totalTransactions: number;
    dataSource: 'integrated';
    autoSyncEnabled: boolean;
  };
}

interface ExpEvent {
  type: 'asset_increase' | 'debt_decrease' | 'goal_achieved' | 'streak_bonus' | 'transaction_added';
  amount: number;
  description: string;
  timestamp: Date;
  relatedData?: any;
}

class AssetQuestIntegrationService extends EventEmitter {
  private questData: AssetQuestIntegratedData | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private lastAssetTotal: number = 0;
  private lastDebtTotal: number = 0;
  private lastSyncDate: Date = new Date();
  private experienceMultiplier: number = 1.0;
  private autoSyncEnabled: boolean = true;
  private syncTimeout: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeIntegration();
  }

  /**
   * 🚀 統合システム初期化
   */
  private async initializeIntegration(): Promise<void> {
    try {
      // 既存データを読み込み
      await this.loadExistingData();

      // Redux store変更の監視を開始
      this.startStoreMonitoring();

      // 定期同期を開始
      this.startPeriodicSync();

      console.log('🎮 資産形成クエスト統合システム初期化完了');
      this.emit('integration-initialized');
    } catch (error) {
      console.error('統合システム初期化エラー:', error);
    }
  }

  /**
   * 📊 既存データの読み込み
   */
  private async loadExistingData(): Promise<void> {
    const state = store.getState() as RootState;

    // 必要に応じてRedux storeからデータを取得
    if (state.asset.entries.length === 0) {
      store.dispatch(fetchAssetEntries());
    }
    if (state.debt.entries.length === 0) {
      store.dispatch(fetchDebtEntries());
    }

    // 現在のデータで初期化
    await this.syncQuestDataFromStore();
  }

  /**
   * 🔄 Redux storeからクエストデータを同期
   */
  private async syncQuestDataFromStore(): Promise<void> {
    const state = store.getState() as RootState;
    const assetEntries = state.asset.entries;
    const debtEntries = state.debt.entries;

    // 合計計算
    const totalAssets = this.calculateTotalAssets(assetEntries);
    const totalDebts = this.calculateTotalDebts(debtEntries);
    const netWorth = totalAssets - totalDebts;

    // 前回との差分計算
    const assetGrowth = totalAssets - this.lastAssetTotal;
    const debtReduction = this.lastDebtTotal - totalDebts;

    // レベル計算（純資産1万円 = 1レベル）
    const level = Math.max(1, Math.floor(netWorth / 10000));
    const experience = netWorth % 10000;
    const experienceToNext = 10000;

    // 今月のデータ（簡略化 - 実際はより詳細な計算が必要）
    const currentMonth = this.calculateCurrentMonthData(assetEntries, debtEntries);

    // クエスト進捗計算
    const questProgress = this.calculateQuestProgress(assetGrowth, debtReduction);

    // 実績計算
    const achievements = this.calculateAchievements(totalAssets, totalDebts, netWorth, level);

    this.questData = {
      hero: {
        level,
        experience,
        experienceToNext,
        title: this.getHeroTitle(level),
        avatar: this.getHeroAvatar(level),
        totalAssets,
        totalDebts,
        netWorth,
      },
      currentMonth,
      questProgress,
      achievements,
      integration: {
        lastSyncDate: new Date().toISOString(),
        totalTransactions: assetEntries.length + debtEntries.length,
        dataSource: 'integrated',
        autoSyncEnabled: this.autoSyncEnabled,
      },
    };

    // 変更があった場合の経験値イベント発火
    if (assetGrowth > 0) {
      this.triggerExpEvent({
        type: 'asset_increase',
        amount: Math.floor(assetGrowth / 1000), // 1000円につき1EXP
        description: `資産が${assetGrowth.toLocaleString()}円増加しました！`,
        timestamp: new Date(),
        relatedData: { previousTotal: this.lastAssetTotal, newTotal: totalAssets },
      });
    }

    if (debtReduction > 0) {
      this.triggerExpEvent({
        type: 'debt_decrease',
        amount: Math.floor(debtReduction / 1000), // 1000円につき1EXP
        description: `負債を${debtReduction.toLocaleString()}円減らしました！`,
        timestamp: new Date(),
        relatedData: { reduction: debtReduction },
      });
    }

    // 前回値を更新
    this.lastAssetTotal = totalAssets;
    this.lastDebtTotal = totalDebts;
    this.lastSyncDate = new Date();

    this.emit('quest-data-synced', this.questData);
  }

  /**
   * 📱 Redux store変更監視
   */
  private startStoreMonitoring(): void {
    // Redux storeの変更を監視
    store.subscribe(() => {
      if (this.autoSyncEnabled) {
        // デバウンス処理（500ms後に実行）
        if (this.syncTimeout) {
          clearTimeout(this.syncTimeout);
        }
        this.syncTimeout = setTimeout(() => {
          this.syncQuestDataFromStore();
        }, 500);
      }
    });
  }

  /**
   * ⏰ 定期同期開始
   */
  private startPeriodicSync(): void {
    // 5分ごとに同期
    this.syncInterval = setInterval(
      () => {
        this.syncQuestDataFromStore();
      },
      5 * 60 * 1000
    );
  }

  /**
   * 💰 総資産計算
   */
  private calculateTotalAssets(assetEntries: AssetEntry[]): number {
    return assetEntries.reduce((total, entry) => total + entry.value, 0);
  }

  /**
   * 💸 総負債計算
   */
  private calculateTotalDebts(debtEntries: DebtEntry[]): number {
    return debtEntries.reduce((total, entry) => total + entry.value, 0);
  }

  /**
   * 📅 今月データ計算
   */
  private calculateCurrentMonthData(assetEntries: AssetEntry[], debtEntries: DebtEntry[]) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 今月のエントリーをフィルタ
    const thisMonthAssets = assetEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    const thisMonthDebts = debtEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    // 推定収入（資産増加分）
    const income = thisMonthAssets.reduce((sum, entry) => sum + Math.max(0, entry.value), 0);

    // 推定支出（負債増加分）
    const expenses = thisMonthDebts.reduce((sum, entry) => sum + entry.value, 0);

    // 貯蓄
    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    // 月末までの残り日数
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysRemaining = lastDay - now.getDate();

    // 目標（月収の20%を貯蓄目標とする）
    const target = income * 0.2;

    return {
      income,
      expenses,
      savings,
      savingsRate,
      target,
      daysRemaining: Math.max(0, daysRemaining),
      assetGrowth: income,
      debtReduction: 0, // 簡略化
    };
  }

  /**
   * 🎯 クエスト進捗計算
   */
  private calculateQuestProgress(assetGrowth: number, debtReduction: number) {
    const savedData = this.getStoredQuestProgress();

    const monthlyGoalAchieved = assetGrowth > 0 || debtReduction > 0;
    const newStreak = monthlyGoalAchieved ? savedData.streakDays + 1 : 0;
    const totalCompleted = monthlyGoalAchieved
      ? savedData.totalQuestsCompleted + 1
      : savedData.totalQuestsCompleted;

    // 報酬計算（基本100EXP + ストリークボーナス）
    const baseReward = 100;
    const streakBonus = Math.floor(newStreak / 7) * 50; // 7日ごとに50EXPボーナス
    const currentReward = baseReward + streakBonus;

    const questProgress = {
      monthlyQuestCompleted: monthlyGoalAchieved,
      streakDays: newStreak,
      totalQuestsCompleted: totalCompleted,
      currentReward,
      lastUpdateDate: new Date().toISOString(),
    };

    // ローカルストレージに保存
    this.saveQuestProgress(questProgress);

    return questProgress;
  }

  /**
   * 🏆 実績計算
   */
  private calculateAchievements(
    totalAssets: number,
    totalDebts: number,
    netWorth: number,
    level: number
  ) {
    const achievements = [
      {
        id: 'first_entry',
        name: '記録開始',
        description: '初回の資産データを記録',
        icon: '📝',
        unlocked: totalAssets > 0 || totalDebts > 0,
        progress: totalAssets > 0 || totalDebts > 0 ? 100 : 0,
      },
      {
        id: 'net_worth_positive',
        name: 'プラス収支',
        description: '純資産がプラスになる',
        icon: '📈',
        unlocked: netWorth > 0,
        progress:
          netWorth > 0
            ? 100
            : Math.max(0, ((netWorth + Math.abs(netWorth)) / Math.abs(netWorth)) * 100),
      },
      {
        id: 'millionaire',
        name: '百万円達成',
        description: '純資産100万円達成',
        icon: '💰',
        unlocked: netWorth >= 1000000,
        progress: Math.min(100, (netWorth / 1000000) * 100),
      },
      {
        id: 'ten_millionaire',
        name: '資産家',
        description: '純資産1000万円達成',
        icon: '🏰',
        unlocked: netWorth >= 10000000,
        progress: Math.min(100, (netWorth / 10000000) * 100),
      },
      {
        id: 'debt_free',
        name: '無借金生活',
        description: '全ての負債を完済',
        icon: '🗽',
        unlocked: totalDebts === 0 && totalAssets > 0,
        progress:
          totalDebts === 0 && totalAssets > 0
            ? 100
            : Math.max(0, 100 - (totalDebts / totalAssets) * 100),
      },
      {
        id: 'level_10',
        name: '勇者見習い',
        description: 'レベル10達成',
        icon: '⚔️',
        unlocked: level >= 10,
        progress: Math.min(100, (level / 10) * 100),
      },
      {
        id: 'level_50',
        name: '熟練勇者',
        description: 'レベル50達成',
        icon: '🛡️',
        unlocked: level >= 50,
        progress: Math.min(100, (level / 50) * 100),
      },
    ];

    return achievements;
  }

  /**
   * 🎭 勇者タイトル取得
   */
  private getHeroTitle(level: number): string {
    if (level >= 100) return '伝説の資産王';
    if (level >= 50) return '資産形成の達人';
    if (level >= 30) return '投資の賢者';
    if (level >= 20) return '貯蓄の戦士';
    if (level >= 10) return '資産勇者';
    if (level >= 5) return '見習い冒険者';
    return '新米勇者';
  }

  /**
   * 🖼️ 勇者アバター取得
   */
  private getHeroAvatar(level: number): string {
    if (level >= 100) return '👑';
    if (level >= 50) return '🦸‍♂️';
    if (level >= 30) return '🧙‍♂️';
    if (level >= 20) return '⚔️';
    if (level >= 10) return '🛡️';
    if (level >= 5) return '🗡️';
    return '🌱';
  }

  /**
   * ⚡ 経験値イベント発火
   */
  private triggerExpEvent(event: ExpEvent): void {
    console.log(`🎮 EXP Event: ${event.type} - ${event.amount} EXP - ${event.description}`);

    // サウンド再生
    if (event.amount > 0) {
      if (event.type === 'asset_increase' || event.type === 'debt_decrease') {
        soundManager.playMessageCompleteSound();
      } else if (event.type === 'goal_achieved') {
        soundManager.playLevelUpSound();
      }
    }

    this.emit('exp-gained', event);
  }

  /**
   * 💾 クエスト進捗の保存/読み込み
   */
  private getStoredQuestProgress() {
    const saved = localStorage.getItem('asset-quest-progress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.warn('クエスト進捗データの読み込みに失敗:', error);
      }
    }

    return {
      streakDays: 0,
      totalQuestsCompleted: 0,
      lastUpdateDate: new Date().toISOString(),
    };
  }

  private saveQuestProgress(progress: any): void {
    localStorage.setItem('asset-quest-progress', JSON.stringify(progress));
  }

  // 公開メソッド

  /**
   * 📊 統合データ取得
   */
  public async getIntegratedQuestData(): Promise<AssetQuestIntegratedData> {
    if (!this.questData) {
      await this.syncQuestDataFromStore();
    }
    return this.questData!;
  }

  /**
   * 💰 新しい資産エントリー追加
   */
  public async addAsset(assetData: Omit<AssetEntry, '_id'>): Promise<void> {
    try {
      await store.dispatch(addAssetEntry(assetData));

      // 経験値イベント発火
      this.triggerExpEvent({
        type: 'transaction_added',
        amount: 10, // 取引追加で10EXP
        description: `新しい資産「${assetData.account}」を追加しました！`,
        timestamp: new Date(),
        relatedData: assetData,
      });

      this.emit('asset-added', assetData);
    } catch (error) {
      console.error('資産追加エラー:', error);
      throw error;
    }
  }

  /**
   * 💸 新しい負債エントリー追加
   */
  public async addDebt(debtData: Omit<DebtEntry, '_id'>): Promise<void> {
    try {
      await store.dispatch(addDebtEntry(debtData));

      this.triggerExpEvent({
        type: 'transaction_added',
        amount: 5, // 負債追加で5EXP（資産より少なめ）
        description: `負債「${debtData.account}」を記録しました`,
        timestamp: new Date(),
        relatedData: debtData,
      });

      this.emit('debt-added', debtData);
    } catch (error) {
      console.error('負債追加エラー:', error);
      throw error;
    }
  }

  /**
   * 🔄 手動同期実行
   */
  public async forceSync(): Promise<void> {
    await this.syncQuestDataFromStore();
  }

  /**
   * ⚙️ 自動同期設定
   */
  public setAutoSync(enabled: boolean): void {
    this.autoSyncEnabled = enabled;
    if (enabled) {
      this.startStoreMonitoring();
      this.startPeriodicSync();
    } else {
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }
    }
  }

  /**
   * 📈 統計情報取得
   */
  public getIntegrationStats() {
    const state = store.getState() as RootState;
    return {
      totalAssetEntries: state.asset.entries.length,
      totalDebtEntries: state.debt.entries.length,
      lastSyncDate: this.lastSyncDate.toISOString(),
      autoSyncEnabled: this.autoSyncEnabled,
      questDataLoaded: this.questData !== null,
    };
  }

  /**
   * 🧹 リソース解放
   */
  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.removeAllListeners();
  }
}

// シングルトンインスタンス
export const assetQuestIntegrationService = new AssetQuestIntegrationService();
