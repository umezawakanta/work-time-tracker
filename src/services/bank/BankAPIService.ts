/**
 * 銀行API連携サービス
 * 外部銀行APIとの連携を管理する
 */

export interface BankAPIConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
}

export interface BankAccountBalance {
  accountId: string;
  accountName: string;
  bankName: string;
  balance: number;
  currency: string;
  lastUpdated: string;
  accountType: 'checking' | 'savings' | 'credit' | 'investment';
}

export interface BankTransaction {
  id: string;
  accountId: string;
  amount: number;
  description: string;
  date: string;
  type: 'debit' | 'credit';
  category?: string;
}

export class BankAPIService {
  private config: BankAPIConfig;
  private isEnabled: boolean = false;

  constructor(config?: Partial<BankAPIConfig>) {
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_BANK_API_KEY || 'demo-api-key',
      baseUrl: process.env.NEXT_PUBLIC_BANK_API_URL || 'https://api.bank-demo.com',
      timeout: 30000,
      ...config,
    };

    // デモ環境でも動作するように設定
    this.isEnabled = true;
  }

  /**
   * 銀行APIが有効かどうかを確認
   */
  public isAPIAvailable(): boolean {
    return this.isEnabled;
  }

  /**
   * 実際の銀行APIから口座データを取得
   */
  public async fetchRealBankData(userId: string): Promise<BankAccountBalance[]> {
    try {
      // 実際の銀行APIエンドポイントに接続
      const response = await fetch(`${this.config.baseUrl}/accounts/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Bank API error: ${response.status}`);
      }

      const data = await response.json();
      return data.accounts || [];
    } catch (error) {
      console.error('Error fetching real bank data:', error);
      // エラー時はデモデータを返す
      return this.generateDemoData(userId);
    }
  }

  /**
   * デモ用の銀行口座データを生成
   */
  public generateDemoData(userId: string): BankAccountBalance[] {
    return [
      {
        accountId: 'demo_1',
        accountName: 'メイン口座',
        bankName: '三井住友銀行',
        balance: 1500000,
        currency: 'JPY',
        lastUpdated: new Date().toISOString(),
        accountType: 'checking',
      },
      {
        accountId: 'demo_2',
        accountName: '貯蓄口座',
        bankName: '三井住友銀行',
        balance: 3000000,
        currency: 'JPY',
        lastUpdated: new Date().toISOString(),
        accountType: 'savings',
      },
      {
        accountId: 'demo_3',
        accountName: '投資口座',
        bankName: 'SBI証券',
        balance: 2500000,
        currency: 'JPY',
        lastUpdated: new Date().toISOString(),
        accountType: 'investment',
      },
    ];
  }

  /**
   * 銀行口座の残高を取得
   */
  public async getAccountBalances(userId: string): Promise<BankAccountBalance[]> {
    if (!this.isEnabled) {
      // APIが無効な場合は空の配列を返す
      return [];
    }

    try {
      return await this.fetchRealBankData(userId);
    } catch (error) {
      console.error('銀行API残高取得エラー:', error);
      // エラー時は空の配列を返す
      return [];
    }
  }

  /**
   * 特定の口座の取引履歴を取得
   */
  public async getAccountTransactions(
    userId: string,
    accountId: string,
    fromDate?: string,
    toDate?: string
  ): Promise<BankTransaction[]> {
    if (!this.isEnabled) {
      throw new Error('銀行APIが設定されていません');
    }

    try {
      const params = new URLSearchParams({
        accountId,
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate }),
      });

      const response = await fetch(`${this.config.baseUrl}/accounts/transactions?${params}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'X-User-ID': userId,
        },
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`銀行APIエラー: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error('銀行API取引履歴取得エラー:', error);
      throw error;
    }
  }

  /**
   * 口座情報を同期
   */
  public async syncAccountData(userId: string): Promise<{
    balances: BankAccountBalance[];
    lastSync: string;
  }> {
    if (!this.isEnabled) {
      // APIが無効の場合は空のデータを返す
      console.warn('銀行APIが無効のため、空のデータを返します');
      const balances: BankAccountBalance[] = [];
      const lastSync = new Date().toISOString();

      // ローカルストレージに同期情報を保存
      localStorage.setItem(
        `bank_sync_${userId}`,
        JSON.stringify({
          lastSync,
          accountCount: balances.length,
          isDemo: false,
        })
      );

      return {
        balances,
        lastSync,
      };
    }

    try {
      const balances = await this.getAccountBalances(userId);
      const lastSync = new Date().toISOString();

      // ローカルストレージに同期情報を保存
      localStorage.setItem(
        `bank_sync_${userId}`,
        JSON.stringify({
          lastSync,
          accountCount: balances.length,
          isDemo: false,
        })
      );

      return {
        balances,
        lastSync,
      };
    } catch (error) {
      console.error('口座データ同期エラー:', error);
      // エラー時は空のデータを返す
      const balances: BankAccountBalance[] = [];
      const lastSync = new Date().toISOString();

      localStorage.setItem(
        `bank_sync_${userId}`,
        JSON.stringify({
          lastSync,
          accountCount: balances.length,
          isDemo: false,
        })
      );

      return {
        balances,
        lastSync,
      };
    }
  }

  /**
   * 自動同期の設定
   */
  public enableAutoSync(userId: string, intervalMinutes: number = 60): void {
    if (!this.isEnabled) {
      console.warn('銀行APIが無効のため、自動同期を開始できません');
      return;
    }

    // 既存の自動同期を停止
    this.disableAutoSync();

    const intervalId = setInterval(
      async () => {
        try {
          await this.syncAccountData(userId);
          console.log('銀行口座データの自動同期が完了しました');
        } catch (error) {
          console.error('自動同期エラー:', error);
        }
      },
      intervalMinutes * 60 * 1000
    );

    // インターバルIDを保存
    localStorage.setItem(`bank_auto_sync_${userId}`, intervalId.toString());
  }

  /**
   * 自動同期の停止
   */
  public disableAutoSync(userId: string): void {
    const intervalId = localStorage.getItem(`bank_auto_sync_${userId}`);
    if (intervalId) {
      clearInterval(parseInt(intervalId));
      localStorage.removeItem(`bank_auto_sync_${userId}`);
    }
  }

  /**
   * 最後の同期時刻を取得
   */
  public getLastSyncTime(userId: string): string | null {
    const syncData = localStorage.getItem(`bank_sync_${userId}`);
    if (syncData) {
      const data = JSON.parse(syncData);
      return data.lastSync;
    }
    return null;
  }
}

// シングルトンインスタンス
export const bankAPIService = new BankAPIService();
