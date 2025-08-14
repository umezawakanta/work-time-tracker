import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './index';
import { todoApi } from '@/services/api/todoApi';
import { TodoItem } from '@/types';
import anthropicService from '@/services/ai/anthropicService';

// 分析サマリーの型定義
interface AnalysisSummary {
  completionRate?: number;
  averageTasksPerDay?: number;
  mostProductiveDay?: string;
  categoryStats?: {
    input: number;
    output: number;
  };
  categoryDistribution?: {
    input: number;
    output: number;
  };
  recommendations?: string[];
}

// DeadlineUtilsの追加
export const DeadlineUtils = {
  // Previous methods remain unchanged
  formatDate: (dateString: string | null) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    });
  },

  getDaysRemaining: (deadlineDate: string | null) => {
    if (!deadlineDate) return null;

    const deadline = new Date(deadlineDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 時間部分をリセット

    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  },

  // Fixed method - handle null case properly
  getDeadlineClassName: (daysRemaining: number | null) => {
    if (daysRemaining === null) return '';

    if (daysRemaining < 0) return 'deadline-expired';
    if (daysRemaining === 0) return 'deadline-today';
    if (daysRemaining === 1) return 'deadline-tomorrow';
    if (daysRemaining <= 3) return 'deadline-soon';

    return 'deadline-future';
  },

  // The rest of the object remains the same
  getDeadlineText: (deadlineDate: string | null) => {
    if (!deadlineDate) return '';

    const daysRemaining = DeadlineUtils.getDaysRemaining(deadlineDate);
    const formattedDate = DeadlineUtils.formatDate(deadlineDate);

    if (daysRemaining === null) return formattedDate || '';

    if (daysRemaining < 0) return `期限超過(${formattedDate})`;
    if (daysRemaining === 0) return `今日期限(${formattedDate})`;
    if (daysRemaining === 1) return `明日期限(${formattedDate})`;
    if (daysRemaining <= 3) return `残り${daysRemaining}日(${formattedDate})`;

    return formattedDate || '';
  },
};

interface TodoState {
  items: TodoItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  todoHistory: Record<string, number>;
  dailyHistory: Array<{ date: string; count: number }>;
  isPremium: boolean; // プレミアム状態を追加
  analysisSummary: AnalysisSummary | null; // 型を明示的に定義
}

const initialState: TodoState = {
  items: [],
  status: 'idle',
  error: null,
  todoHistory: {}, // 既存の履歴データ形式を維持
  dailyHistory: [], // 日別の履歴データを追加
  isPremium: false, // デフォルトは非プレミアム
  analysisSummary: null, // 初期値はnull
};

export const fetchTodoItems = createAsyncThunk('todo/fetchTodoItems', async () => {
  try {
    const response = await todoApi.getAll();

    // HTTPステータスコードチェック
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }

    // レスポンスの基本構造チェック
    if (!response.data) {
      throw new Error('APIからの空のレスポンスです');
    }

    // エラーレスポンスかどうかチェック（GET /todosはエラー時に{message, error}を返す）
    if (response.data.error || (response.data.message && !Array.isArray(response.data))) {
      const errorMsg = response.data.error || response.data.message || '不明なエラー';
      throw new Error(`API操作エラー: ${errorMsg}`);
    }

    // 成功レスポンスの検証（GET /todosは直接配列を返す）
    if (!Array.isArray(response.data)) {
      console.error('🔍 Unexpected response structure:', response.data);
      throw new Error('APIレスポンスが期待される配列形式ではありません');
    }

    console.log(`✅ Fetched ${response.data.length} todos successfully`);
    return response.data;
  } catch (apiError: any) {
    // ネットワークエラーやAxiosエラーの処理
    if (apiError.response) {
      // サーバーがエラーレスポンスを返した場合
      const errorData = apiError.response.data;
      const errorMsg = errorData?.message || errorData?.error || 'サーバーエラーが発生しました';
      throw new Error(`API呼び出しエラー: ${errorMsg}`);
    } else if (apiError.request) {
      // リクエストが送信されたが応答がない場合
      throw new Error('サーバーに接続できません。ネットワーク接続を確認してください。');
    } else {
      // その他のエラー（既に投げたエラー含む）
      throw apiError;
    }
  }
});

export const addTodoItem = createAsyncThunk(
  'todo/addTodoItem',
  async (todo: {
    task: string;
    priority: number;
    isPrioritized: boolean;
    type?: 'input' | 'output';
    deadline?: string;
    createdAt?: string; // createdAt プロパティを追加
  }) => {
    try {
      // todoApi.create 関数の引数を確認し、必要に応じて createdAt を追加
      const response = await todoApi.create(
        todo.task,
        todo.priority,
        todo.isPrioritized,
        todo.type || 'input',
        todo.deadline,
        todo.createdAt // API 関数が対応していない場合は修正が必要
      );

      // HTTPステータスコードチェック
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      // レスポンスの基本構造チェック
      if (!response.data) {
        throw new Error('APIからの空のレスポンスです');
      }

      // エラーレスポンスかどうかチェック（message+errorパターン）
      if (
        response.data.error ||
        (response.data.message && response.data.message.includes('Error'))
      ) {
        const errorMsg = response.data.error || response.data.message || '不明なエラー';
        throw new Error(`API操作エラー: ${errorMsg}`);
      }

      // レスポンス形式を判定: {message, todo} または 直接todoオブジェクト
      let todoData;
      if (response.data.todo) {
        // 標準形式: {message: "...", todo: {...}}
        todoData = response.data.todo;
        console.log('📋 Standard response format detected (create)');
      } else if (response.data._id && response.data.task) {
        // 直接形式: {...todoオブジェクト...}
        todoData = response.data;
        console.log('📋 Direct todo object format detected (create)');
      } else {
        console.error('🔍 Unexpected response structure:', response.data);
        throw new Error('APIレスポンスにtodoデータが含まれていません');
      }

      // todoデータの検証
      if (!todoData._id) {
        console.error('🔍 Todo missing _id:', todoData);
        throw new Error('作成されたタスクにIDが設定されていません');
      }

      console.log('✅ Todo created successfully:', todoData._id);
      return todoData;
    } catch (apiError: any) {
      // ネットワークエラーやAxiosエラーの処理
      if (apiError.response) {
        // サーバーがエラーレスポンスを返した場合
        const errorData = apiError.response.data;
        const errorMsg = errorData?.message || errorData?.error || 'サーバーエラーが発生しました';
        throw new Error(`API呼び出しエラー: ${errorMsg}`);
      } else if (apiError.request) {
        // リクエストが送信されたが応答がない場合
        throw new Error('サーバーに接続できません。ネットワーク接続を確認してください。');
      } else {
        // その他のエラー（既に投げたエラー含む）
        throw apiError;
      }
    }
  }
);

export const updateTodoItem = createAsyncThunk(
  'todo/updateTodoItem',
  async ({ _id, updates }: { _id: string; updates: Partial<TodoItem> }) => {
    try {
      const response = await todoApi.update(_id, updates);

      // HTTPステータスコードチェック
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      // レスポンスの基本構造チェック
      if (!response.data) {
        throw new Error('APIからの空のレスポンスです');
      }

      // エラーレスポンスかどうかチェック（message+errorパターン）
      if (
        response.data.error ||
        (response.data.message && response.data.message.includes('Error'))
      ) {
        const errorMsg = response.data.error || response.data.message || '不明なエラー';
        throw new Error(`API操作エラー: ${errorMsg}`);
      }

      // レスポンス形式を判定: {message, todo} または 直接todoオブジェクト
      let todoData;
      if (response.data.todo) {
        // 標準形式: {message: "...", todo: {...}}
        todoData = response.data.todo;
        console.log('📋 Standard response format detected');
      } else if (response.data._id && response.data.task) {
        // 直接形式: {...todoオブジェクト...}
        todoData = response.data;
        console.log('📋 Direct todo object format detected');
      } else {
        console.error('🔍 Unexpected response structure:', response.data);
        throw new Error('APIレスポンスにtodoデータが含まれていません');
      }

      // todoデータの検証
      if (!todoData._id) {
        console.error('🔍 Todo missing _id:', todoData);
        throw new Error('更新されたタスクにIDが設定されていません');
      }

      console.log('✅ Todo updated successfully:', todoData._id);
      return todoData;
    } catch (apiError: any) {
      // ネットワークエラーやAxiosエラーの処理
      if (apiError.response) {
        // サーバーがエラーレスポンスを返した場合
        const errorData = apiError.response.data;
        const errorMsg = errorData?.message || errorData?.error || 'サーバーエラーが発生しました';
        throw new Error(`API呼び出しエラー: ${errorMsg}`);
      } else if (apiError.request) {
        // リクエストが送信されたが応答がない場合
        throw new Error('サーバーに接続できません。ネットワーク接続を確認してください。');
      } else {
        // その他のエラー（既に投げたエラー含む）
        throw apiError;
      }
    }
  }
);

export const deleteTodoItem = createAsyncThunk('todo/deleteTodoItem', async (id: string) => {
  if (!id || typeof id !== 'string') {
    throw new Error('削除するタスクIDが無効です');
  }

  await todoApi.delete(id);
  return id;
});

export const resetTodoList = createAsyncThunk('todo/resetTodoList', async () => {
  const response = await todoApi.reset();
  return response.data;
});

// 履歴データ取得のためのアクションを追加
export const fetchTodoHistory = createAsyncThunk('todo/fetchTodoHistory', async () => {
  const response = await todoApi.getHistory();
  return response.data;
});

// 日別の履歴データを取得するアクションを追加
export const fetchDailyTodoHistory = createAsyncThunk('todo/fetchDailyTodoHistory', async () => {
  const response = await todoApi.getDailyHistory();
  return response.data;
});

export const reorderTodoItems = createAsyncThunk(
  'todo/reorderTodoItems',
  async (items: TodoItem[]) => {
    const response = await todoApi.reorder(items);
    return response.data.todos;
  }
);

export const toggleTodoPriority = createAsyncThunk(
  'todo/toggleTodoPriority',
  async (id: string) => {
    const response = await todoApi.togglePriority(id);
    return response.data.todo;
  }
);

// プレミアム状態をチェックするアクションを追加
export const checkPremiumStatus = createAsyncThunk('todo/checkPremiumStatus', async () => {
  // 直接サービスAPIを使用せず、todoApiのサポートメソッドがない場合はモック実装
  // 実際には適切なAPIエンドポイントを使用する必要があります
  // モックデータを返す例（実装時には適切なAPI呼び出しに置き換えてください）
  return { isPremium: true };
});

// タスク分析サマリーを取得するアクションを追加
export const fetchAnalysisSummary = createAsyncThunk('todo/fetchAnalysisSummary', async () => {
  // 直接サービスAPIを使用せず、todoApiのサポートメソッドがない場合はモック実装
  // 実際には適切なAPIエンドポイントを使用する必要があります
  // モックデータを返す例（実装時には適切なAPI呼び出しに置き換えてください）
  return {
    completionRate: 75,
    averageTasksPerDay: 5.2,
    mostProductiveDay: '水曜日',
    categoryStats: {
      input: 120,
      output: 85,
    },
    categoryDistribution: {
      input: 0.6,
      output: 0.4,
    },
    recommendations: [
      'アウトプットタスクの比率を増やすことでバランス改善が見込めます。',
      '午前中の集中タスクを増やして生産性向上を目指しましょう。',
    ],
  };
});

// AIによる自動タスク並び替え
export const autoSortTodos = createAsyncThunk('todo/autoSort', async (_, { getState }) => {
  const state = getState() as RootState;
  const todos = state.todo.items;

  if (todos.length === 0) {
    return { sortedTasks: [], reasoning: '', recommendations: [] };
  }

  try {
    const result = await anthropicService.optimizeTaskOrder(todos);
    return result;
  } catch (error) {
    console.error('Failed to auto-sort todos:', error);
    // エラー時は現在の並び順を維持
    return {
      sortedTasks: todos,
      reasoning: '並び替えに失敗しました。現在の順序を維持します。',
      recommendations: [],
    };
  }
});

const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    // 引数を受け取る形に変更
    updateTodoHistory: (state, action: { payload: { date: string; count: number } }) => {
      const { date, count } = action.payload;
      state.todoHistory[date] = count;
    },

    // 期限に基づいて優先度を調整するreducerを追加
    adjustDeadlinePriorities: (state) => {
      // 完了していないタスクのみを対象
      const activeTodos = state.items.filter((todo) => !todo.completed);

      // 各タスクの期限に基づいて優先度スコアを計算
      const todosWithScore = activeTodos.map((todo) => {
        let priorityScore = todo.priority || 0;

        // 既に優先化されているタスクには基本点を追加
        if (todo.isPrioritized) {
          priorityScore += 50;
        }

        // 期限がある場合は残り日数に基づいて優先度を調整
        if (todo.deadline) {
          const daysRemaining = DeadlineUtils.getDaysRemaining(todo.deadline);

          // daysRemainingがnullでない場合のみ比較を行う
          if (daysRemaining !== null) {
            // 期限切れ: 最高優先度
            if (daysRemaining < 0) {
              priorityScore += 100;
            }
            // 今日が期限: 非常に高い優先度
            else if (daysRemaining === 0) {
              priorityScore += 80;
            }
            // 明日が期限: 高い優先度
            else if (daysRemaining === 1) {
              priorityScore += 60;
            }
            // 3日以内: 中程度の優先度
            else if (daysRemaining <= 3) {
              priorityScore += 40;
            }
            // 1週間以内: 若干優先度アップ
            else if (daysRemaining <= 7) {
              priorityScore += 20;
            }
          }
        }

        return { ...todo, priorityScore };
      });

      // スコアに基づいてソート（高いスコア順）
      todosWithScore.sort((a, b) => b.priorityScore - a.priorityScore);

      // 並び替えた結果に基づいて優先度を再設定
      const reorderedTodos = todosWithScore.map((todo, index) => ({
        ...todo,
        priority: todosWithScore.length - index, // インデックスの逆順で優先度を設定
        isPrioritized: index < 3 || todo.isPrioritized, // 上位3つのタスクと既に優先化されているタスクを優先マーク
      }));

      // 状態を更新（完了タスクは変更せず、アクティブなタスクのみ更新）
      state.items = [...reorderedTodos, ...state.items.filter((todo) => todo.completed)];
    },

    // タスクリストを並び替え
    reorderTodos: (state, action: PayloadAction<TodoItem[]>) => {
      state.items = action.payload;
    },

    // 完了済みタスクをクリア
    clearCompletedTodos: (state) => {
      state.items = state.items.filter((todo) => !todo.completed);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodoItems.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTodoItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null; // エラーをクリア

        // 安全性チェック: payloadが配列かどうか確認
        if (!Array.isArray(action.payload)) {
          console.error('❌ Invalid payload in fetchTodoItems.fulfilled:', action.payload);
          state.error = 'APIレスポンスが無効な形式です';
          return;
        }

        // 重複IDを排除し、無効なアイテムをフィルタリング
        const validItems = action.payload.filter(
          (item: any) => item && item._id && typeof item._id === 'string'
        );

        // 重複IDを排除（最初に見つかったアイテムを保持）
        const uniqueItems = validItems.filter(
          (item: any, index: number, self: any[]) =>
            index === self.findIndex((t: any) => t._id === item._id)
        );

        state.items = uniqueItems;

        console.log(
          `📋 Todo items loaded: ${uniqueItems.length} valid items (filtered from ${action.payload.length})`
        );
      })
      .addCase(fetchTodoItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(addTodoItem.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addTodoItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null; // エラーをクリア

        // 安全性チェック: payloadが有効かどうか確認
        if (!action.payload || !action.payload._id) {
          console.error('❌ Invalid payload in addTodoItem.fulfilled:', action.payload);
          state.error = '作成されたタスクデータが無効です';
          return;
        }

        // 重複チェック: 同じIDのアイテムが既に存在するかチェック
        const existingIndex = state.items.findIndex((item) => item._id === action.payload._id);
        if (existingIndex !== -1) {
          // 既存のアイテムを更新
          state.items[existingIndex] = action.payload;
          console.log(`📝 Todo item updated: ${action.payload._id}`);
        } else {
          // 新しいアイテムを追加
          state.items.push(action.payload);
          console.log(`➕ Todo item added: ${action.payload._id}`);
        }
      })
      .addCase(addTodoItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'タスクの追加に失敗しました';
        console.error('❌ addTodoItem failed:', action.error);
      })
      .addCase(updateTodoItem.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateTodoItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null; // エラーをクリア

        // 安全性チェック: payloadが有効かどうか確認
        if (!action.payload || !action.payload._id) {
          console.error('❌ Invalid payload in updateTodoItem.fulfilled:', action.payload);
          state.error = '更新されたタスクデータが無効です';
          return;
        }

        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          // この行が重要です - 古いオブジェクトを新しいオブジェクトで完全に置き換える
          state.items[index] = action.payload;

          // デバッグ用にログを追加
          console.log('✅ Todo updated in Redux store:', action.payload._id);
        } else {
          console.warn('⚠️ Updated todo not found in store:', action.payload._id);
        }
      })
      .addCase(updateTodoItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'タスクの更新に失敗しました';
        console.error('❌ updateTodoItem failed:', action.error);
      })
      .addCase(deleteTodoItem.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteTodoItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null; // エラーをクリア

        // 安全性チェック: payloadが有効なIDかどうか確認
        if (!action.payload || typeof action.payload !== 'string') {
          console.error('❌ Invalid payload in deleteTodoItem.fulfilled:', action.payload);
          state.error = '削除されたタスクIDが無効です';
          return;
        }

        const beforeCount = state.items.length;
        state.items = state.items.filter((item) => item._id !== action.payload);
        const afterCount = state.items.length;

        if (beforeCount === afterCount) {
          console.warn('⚠️ Todo not found for deletion:', action.payload);
        } else {
          console.log(`🗑️ Todo item deleted: ${action.payload}`);
        }
      })
      .addCase(deleteTodoItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'タスクの削除に失敗しました';
        console.error('❌ deleteTodoItem failed:', action.error);
      })
      .addCase(resetTodoList.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(resetTodoList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = []; // リセット後は空の配列
        state.error = null; // エラーをクリア
        // 履歴データはそのまま保持
        console.log('🗑️ Todo list reset completed');
      })
      .addCase(fetchTodoHistory.fulfilled, (state, action) => {
        // 履歴データを適切な形式に変換
        const historyData = action.payload.reduce(
          (acc: Record<string, number>, item: { date: string; completedCount: number }) => {
            acc[item.date] = item.completedCount;
            return acc;
          },
          {}
        );
        state.todoHistory = historyData;
      })
      .addCase(fetchDailyTodoHistory.fulfilled, (state, action) => {
        state.dailyHistory = action.payload;
      })
      .addCase(reorderTodoItems.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(toggleTodoPriority.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // 新しく追加したアクションのリデューサー
      .addCase(checkPremiumStatus.fulfilled, (state, action) => {
        state.isPremium = action.payload.isPremium;
      })
      .addCase(fetchAnalysisSummary.fulfilled, (state, action) => {
        state.analysisSummary = action.payload;
      })
      // 自動並び替えのハンドリング
      .addCase(autoSortTodos.pending, (state) => {
        // 並び替え中の状態を表示可能にする
        state.status = 'loading';
      })
      .addCase(autoSortTodos.fulfilled, (state, action) => {
        state.items = action.payload.sortedTasks;
        state.status = 'succeeded';
        // 並び替えの理由と推奨事項をログに出力（UI表示用に保存することも可能）
        console.log('タスク並び替え完了:', action.payload.reasoning);
        if (action.payload.recommendations.length > 0) {
          console.log('推奨事項:', action.payload.recommendations);
        }
      })
      .addCase(autoSortTodos.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { updateTodoHistory, adjustDeadlinePriorities, reorderTodos, clearCompletedTodos } =
  todoSlice.actions;

export const selectTodos = (state: RootState) => state.todo.items;
export const selectTodoStatus = (state: RootState) => state.todo.status;
export const selectTodoError = (state: RootState) => state.todo.error;
export const selectTodoHistory = (state: RootState) => state.todo.todoHistory;
export const selectDailyHistory = (state: RootState) => state.todo.dailyHistory;
// 新しく追加したセレクター
export const selectIsPremium = (state: RootState) => state.todo.isPremium;
export const selectAnalysisSummary = (state: RootState) => state.todo.analysisSummary;

export default todoSlice.reducer;
