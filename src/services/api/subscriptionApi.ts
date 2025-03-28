import axios, { AxiosResponse } from "axios";
import { Subscription } from "@/types/subscription";
import { api, USE_MOCK_DATA } from "./apiConfig";

// モックデータの拡張と改善
const mockSubscriptionData: Subscription[] = [
  {
    _id: "1",
    name: "Netflix",
    billingDate: "2024/01/01",
    type: "エンターテイメント",
    amount: 1490,
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    billingCycle: "monthly",
    currency: "JPY",
    autoRenew: true,
    notificationEnabled: true,
    notificationDays: 3,
    category: "動画ストリーミング",
    notes: "プレミアムプラン",
    url: "https://netflix.com/",
    startDate: "2023/01/01"
  },
  {
    _id: "2",
    name: "Spotify",
    billingDate: "2024/01/15",
    type: "音楽",
    amount: 980,
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    billingCycle: "monthly",
    currency: "JPY",
    autoRenew: true,
    notificationEnabled: true,
    notificationDays: 3,
    category: "音楽ストリーミング",
    notes: "個人プラン",
    url: "https://spotify.com/",
    startDate: "2023/03/15"
  },
  {
    _id: "3",
    name: "Amazon Prime",
    billingDate: "2024/02/01",
    type: "ショッピング",
    amount: 4900,
    isActive: true,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    billingCycle: "yearly",
    currency: "JPY",
    autoRenew: true,
    notificationEnabled: true,
    notificationDays: 7,
    category: "オンラインショッピング",
    notes: "年間プラン",
    url: "https://amazon.co.jp/prime",
    startDate: "2022/02/01"
  },
  {
    _id: "4",
    name: "Google One",
    billingDate: "2024/01/20",
    type: "クラウドストレージ",
    amount: 250,
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    billingCycle: "monthly",
    currency: "JPY",
    autoRenew: true,
    notificationEnabled: false,
    category: "クラウドサービス",
    notes: "100GBプラン",
    url: "https://one.google.com/",
    startDate: "2023/05/20"
  },
];

// レスポンス型の定義
export interface SubscriptionApiResponse {
  message: string;
  subscription: Subscription;
}

export interface SubscriptionsListResponse {
  subscriptions: Subscription[];
  total: number;
  page: number;
  limit: number;
}

export interface SubscriptionStatistics {
  totalActive: number;
  totalAmount: number;
  monthlyCost: number;
  yearlyCost: number;
  byCategory: {
    category: string;
    count: number;
    totalAmount: number;
  }[];
  upcomingRenewals: Subscription[];
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}


export const subscriptionApi = {
  /**
   * サブスクリプションの一覧を取得
   * @param params 検索条件・ページネーション情報
   */
  getAll: (params?: {
    search?: string;
    category?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<SubscriptionsListResponse>> => {
    console.log("Fetching subscription entries with params:", params);

    if (USE_MOCK_DATA) {
      // モックデータで検索とフィルタリングを擬似的に実装
      let filtered = [...mockSubscriptionData];

      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        filtered = filtered.filter(sub =>
          sub.name.toLowerCase().includes(searchLower) ||
          sub.notes?.toLowerCase().includes(searchLower)
        );
      }

      if (params?.category) {
        filtered = filtered.filter(sub => sub.category === params.category);
      }

      if (params?.isActive !== undefined) {
        filtered = filtered.filter(sub => sub.isActive === params.isActive);
      }

      // ソート処理
      if (params?.sortBy) {
        const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
        filtered = filtered.sort((a, b) => {
          const fieldA = a[params.sortBy as keyof Subscription];
          const fieldB = b[params.sortBy as keyof Subscription];

          // nullまたはundefinedの場合の処理
          if (fieldA === null || fieldA === undefined) {
            return sortOrder; // nullは常に後ろに表示
          }
          if (fieldB === null || fieldB === undefined) {
            return -1 * sortOrder; // nullは常に後ろに表示
          }

          // 数値の場合
          if (typeof fieldA === 'number' && typeof fieldB === 'number') {
            return (fieldA - fieldB) * sortOrder;
          }

          // 日付の場合
          if (
            typeof fieldA === 'string' &&
            typeof fieldB === 'string' &&
            !isNaN(Date.parse(fieldA)) &&
            !isNaN(Date.parse(fieldB))
          ) {
            return (Date.parse(fieldA) - Date.parse(fieldB)) * sortOrder;
          }

          // 文字列の場合
          const valueA = String(fieldA);
          const valueB = String(fieldB);

          return valueA.localeCompare(valueB) * sortOrder;
        });
      }

      // ページネーション
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const startIndex = (page - 1) * limit;
      const paginatedData = filtered.slice(startIndex, startIndex + limit);

      return Promise.resolve({
        data: {
          subscriptions: paginatedData,
          total: filtered.length,
          page: page,
          limit: limit
        }
      } as AxiosResponse<SubscriptionsListResponse>);
    }

    // 実際のAPI呼び出し
    return api.get<SubscriptionsListResponse>("/subscriptions", { params })
      .then((response) => {
        console.log("Received subscription entries:", response.data);
        return response;
      })
      .catch((error) => {
        console.error("Error fetching subscriptions:", error);
        throw error;
      });
  },

  /**
   * サブスクリプション統計データの取得
   */
  getStatistics: (): Promise<AxiosResponse<SubscriptionStatistics>> => {
    console.log("Fetching subscription statistics");

    if (USE_MOCK_DATA) {
      // モックデータで統計情報を生成
      const activeSubscriptions = mockSubscriptionData.filter(sub => sub.isActive);
      const totalAmount = activeSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);

      // 月額・年額コスト計算
      let monthlyCost = 0;
      let yearlyCost = 0;

      activeSubscriptions.forEach(sub => {
        if (sub.billingCycle === 'monthly') {
          monthlyCost += sub.amount;
          yearlyCost += sub.amount * 12;
        } else if (sub.billingCycle === 'yearly') {
          yearlyCost += sub.amount;
          monthlyCost += sub.amount / 12;
        }
      });

      // カテゴリ別統計
      const categoryMap = new Map<string, { count: number; totalAmount: number }>();

      activeSubscriptions.forEach(sub => {
        const category = sub.category || '未分類';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { count: 0, totalAmount: 0 });
        }

        const categoryData = categoryMap.get(category)!;
        categoryData.count += 1;
        categoryData.totalAmount += sub.amount;
      });

      const byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        count: data.count,
        totalAmount: data.totalAmount
      }));

      // 30日以内に更新予定のサブスクリプション
      const now = new Date();
      const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const upcomingRenewals = activeSubscriptions
        .filter(sub => new Date(sub.expiresAt) <= thirtyDaysLater)
        .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());

      return Promise.resolve({
        data: {
          totalActive: activeSubscriptions.length,
          totalAmount,
          monthlyCost,
          yearlyCost,
          byCategory,
          upcomingRenewals
        }
      } as AxiosResponse<SubscriptionStatistics>);
    }

    return api.get<SubscriptionStatistics>("/subscriptions/statistics")
      .then((response) => {
        console.log("Received subscription statistics:", response.data);
        return response;
      })
      .catch((error) => {
        console.error("Error fetching subscription statistics:", error);
        throw error;
      });
  },

  /**
   * ユーザーのサブスクリプション状態を取得
   * @param userId ユーザーID
   */
  getUserSubscription: (userId: string): Promise<AxiosResponse<UserSubscription | null>> => {
    console.log("Fetching user subscription info:", userId);

    if (USE_MOCK_DATA) {
      // モックデータでユーザーのサブスクリプション情報を生成
      // 80%の確率でプレミアムユーザー、20%の確率で無料ユーザーとする
      const isPremium = Math.random() > 0.2;

      if (isPremium) {
        const mockSubscription: UserSubscription = {
          id: `sub_${Math.floor(Math.random() * 100000)}`,
          userId: userId,
          planId: Math.random() > 0.5 ? 'premium' : 'basic',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: Math.random() > 0.8,
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        };

        return Promise.resolve({
          data: mockSubscription
        } as AxiosResponse<UserSubscription>);
      } else {
        return Promise.resolve({
          data: null
        } as AxiosResponse<null>);
      }
    }

    return api.get<UserSubscription | null>(`/subscriptions/user/${userId}`)
      .then((response) => {
        console.log("Received user subscription:", response.data);
        return response;
      })
      .catch((error) => {
        // 404の場合はサブスクリプションなしとして扱う
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return { data: null } as AxiosResponse<null>;
        }
        console.error(`Error fetching user subscription:`, error);
        throw error;
      });
  },

  /**
   * サブスクリプションの詳細を取得
   * @param id サブスクリプションID
   */
  getById: (id: string): Promise<AxiosResponse<{ subscription: Subscription }>> => {
    console.log("Fetching subscription by ID:", id);

    if (USE_MOCK_DATA) {
      const subscription = mockSubscriptionData.find(sub => sub._id === id);

      if (!subscription) {
        return Promise.reject(new Error(`Subscription with ID ${id} not found`));
      }

      return Promise.resolve({
        data: { subscription }
      } as AxiosResponse<{ subscription: Subscription }>);
    }

    return api.get<{ subscription: Subscription }>(`/subscriptions/${id}`)
      .then((response) => {
        console.log("Received subscription:", response.data);
        return response;
      })
      .catch((error) => {
        console.error(`Error fetching subscription ${id}:`, error);
        throw error;
      });
  },

  /**
   * 新しいサブスクリプションを作成
   * @param entry サブスクリプション情報
   */
  create: (entry: Omit<Subscription, "_id">): Promise<AxiosResponse<SubscriptionApiResponse>> => {
    console.log("Creating new subscription entry:", entry);

    if (USE_MOCK_DATA) {
      // 新しいIDの生成
      const newId = String(Math.max(...mockSubscriptionData.map(s => parseInt(s._id))) + 1);

      const newSubscription: Subscription = {
        ...entry,
        _id: newId
      };

      // モックデータに追加（実際には永続化されない）
      mockSubscriptionData.push(newSubscription);

      return Promise.resolve({
        data: {
          message: "サブスクリプション情報が正常に記録されました",
          subscription: newSubscription
        }
      } as AxiosResponse<SubscriptionApiResponse>);
    }

    return api.post<SubscriptionApiResponse>("/subscriptions", entry)
      .then((response) => {
        console.log("Created subscription entry:", response.data);
        return response;
      })
      .catch((error) => {
        console.error("Error creating subscription:", error);
        throw error;
      });
  },

  /**
   * サブスクリプション情報を更新
   * @param id サブスクリプションID
   * @param entry 更新内容
   */
  update: (id: string, entry: Partial<Subscription>): Promise<AxiosResponse<SubscriptionApiResponse>> => {
    console.log("Updating subscription entry:", id, entry);

    if (USE_MOCK_DATA) {
      const index = mockSubscriptionData.findIndex(sub => sub._id === id);

      if (index === -1) {
        return Promise.reject(new Error(`Subscription with ID ${id} not found`));
      }

      // 既存データと更新内容をマージ
      const updatedSubscription: Subscription = {
        ...mockSubscriptionData[index],
        ...entry,
        _id: id
      };

      // モックデータを更新（実際には永続化されない）
      mockSubscriptionData[index] = updatedSubscription;

      return Promise.resolve({
        data: {
          message: "サブスクリプション情報が正常に更新されました",
          subscription: updatedSubscription
        }
      } as AxiosResponse<SubscriptionApiResponse>);
    }

    return api.put<SubscriptionApiResponse>(`/subscriptions/${id}`, entry)
      .then((response) => {
        console.log("Updated subscription entry:", response.data);
        return response;
      })
      .catch((error) => {
        console.error(`Error updating subscription ${id}:`, error);
        throw error;
      });
  },

  /**
   * サブスクリプションを削除
   * @param id サブスクリプションID
   */
  delete: (id: string): Promise<AxiosResponse<{ message: string }>> => {
    console.log("Deleting subscription entry:", id);

    if (USE_MOCK_DATA) {
      const index = mockSubscriptionData.findIndex(sub => sub._id === id);

      if (index === -1) {
        return Promise.reject(new Error(`Subscription with ID ${id} not found`));
      }

      // モックデータから削除（実際には永続化されない）
      mockSubscriptionData.splice(index, 1);

      return Promise.resolve({
        data: { message: "サブスクリプション情報が正常に削除されました" }
      } as AxiosResponse<{ message: string }>);
    }

    return api.delete<{ message: string }>(`/subscriptions/${id}`)
      .then((response) => {
        console.log("Deleted subscription entry:", id, response.data);
        return response;
      })
      .catch((error) => {
        console.error(`Error deleting subscription ${id}:`, error);
        throw error;
      });
  },

  /**
   * サブスクリプションの有効/無効を切り替え
   * @param id サブスクリプションID
   * @param isActive 有効状態
   */
  toggleActive: (id: string, isActive: boolean): Promise<AxiosResponse<SubscriptionApiResponse>> => {
    console.log(`${isActive ? 'Activating' : 'Deactivating'} subscription:`, id);

    if (USE_MOCK_DATA) {
      const index = mockSubscriptionData.findIndex(sub => sub._id === id);

      if (index === -1) {
        return Promise.reject(new Error(`Subscription with ID ${id} not found`));
      }

      // 有効状態を更新
      mockSubscriptionData[index].isActive = isActive;

      return Promise.resolve({
        data: {
          message: `サブスクリプションが${isActive ? '有効' : '無効'}になりました`,
          subscription: mockSubscriptionData[index]
        }
      } as AxiosResponse<SubscriptionApiResponse>);
    }

    return api.patch<SubscriptionApiResponse>(`/subscriptions/${id}/status`, { isActive })
      .then((response) => {
        console.log(`Subscription ${id} status updated:`, response.data);
        return response;
      })
      .catch((error) => {
        console.error(`Error updating subscription ${id} status:`, error);
        throw error;
      });
  },

  /**
   * カテゴリ一覧を取得
   */
  getCategories: (): Promise<AxiosResponse<{ categories: string[] }>> => {
    console.log("Fetching subscription categories");

    if (USE_MOCK_DATA) {
      // ユニークなカテゴリを抽出
      const categories = Array.from(
        new Set(
          mockSubscriptionData
            .map(sub => sub.category)
            .filter(Boolean) as string[]
        )
      ).sort();

      return Promise.resolve({
        data: { categories }
      } as AxiosResponse<{ categories: string[] }>);
    }

    return api.get<{ categories: string[] }>("/subscriptions/categories")
      .then((response) => {
        console.log("Received subscription categories:", response.data);
        return response;
      })
      .catch((error) => {
        console.error("Error fetching subscription categories:", error);
        throw error;
      });
  },

  /**
   * サブスクリプションの更新日が近づいているものを取得
   * @param days 何日以内に更新予定か（デフォルト7日）
   */
  getUpcomingRenewals: (days: number = 7): Promise<AxiosResponse<{ subscriptions: Subscription[] }>> => {
    console.log(`Fetching subscriptions renewing in the next ${days} days`);

    if (USE_MOCK_DATA) {
      const now = new Date();
      const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      const upcomingSubscriptions = mockSubscriptionData
        .filter(sub => sub.isActive && new Date(sub.expiresAt) <= cutoff)
        .sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());

      return Promise.resolve({
        data: { subscriptions: upcomingSubscriptions }
      } as AxiosResponse<{ subscriptions: Subscription[] }>);
    }

    return api.get<{ subscriptions: Subscription[] }>("/subscriptions/upcoming", { params: { days } })
      .then((response) => {
        console.log("Received upcoming renewals:", response.data);
        return response;
      })
      .catch((error) => {
        console.error(`Error fetching upcoming renewals:`, error);
        throw error;
      });
  },

  /**
   * サブスクリプションを一括インポート
   * @param subscriptions インポートするサブスクリプション配列
   */
  bulkImport: (subscriptions: Omit<Subscription, "_id">[]): Promise<AxiosResponse<{
    message: string;
    imported: number;
    failed: number;
  }>> => {
    console.log("Bulk importing subscriptions:", subscriptions.length);

    if (USE_MOCK_DATA) {
      // 新しいIDを生成してインポート
      const maxId = Math.max(...mockSubscriptionData.map(s => parseInt(s._id)));

      let importCount = 0;
      subscriptions.forEach((sub, index) => {
        const newId = String(maxId + index + 1);
        mockSubscriptionData.push({ ...sub, _id: newId });
        importCount++;
      });

      return Promise.resolve({
        data: {
          message: `${importCount}件のサブスクリプションが正常にインポートされました`,
          imported: importCount,
          failed: 0
        }
      } as AxiosResponse<{ message: string; imported: number; failed: number }>);
    }

    return api.post<{ message: string; imported: number; failed: number }>("/subscriptions/import", { subscriptions })
      .then((response) => {
        console.log("Import result:", response.data);
        return response;
      })
      .catch((error) => {
        console.error("Error importing subscriptions:", error);
        throw error;
      });
  },

  /**
   * サブスクリプションデータをエクスポート
   * @param format エクスポート形式 ('json' または 'csv')
   */
  export: (format: 'json' | 'csv' = 'json'): Promise<Blob> => {
    console.log(`Exporting subscriptions as ${format}`);

    if (USE_MOCK_DATA) {
      let exportData: string;

      if (format === 'json') {
        exportData = JSON.stringify(mockSubscriptionData, null, 2);
        const blob = new Blob([exportData], { type: 'application/json' });
        return Promise.resolve(blob);
      } else {
        // CSVフォーマットに変換
        const headers = "ID,名前,課金日,タイプ,金額,有効,課金サイクル,カテゴリ,メモ\n";
        const rows = mockSubscriptionData.map(sub =>
          `${sub._id},"${sub.name}",${sub.billingDate},${sub.type},${sub.amount},${sub.isActive},${sub.billingCycle || '月額'},${sub.category || ''},${sub.notes || ''}`
        ).join('\n');

        exportData = headers + rows;
        const blob = new Blob([exportData], { type: 'text/csv' });
        return Promise.resolve(blob);
      }
    }

    return api.get(`/subscriptions/export`, {
      params: { format },
      responseType: 'blob'
    })
      .then(response => response.data)
      .catch((error) => {
        console.error(`Error exporting subscriptions:`, error);
        throw error;
      });
  }
};