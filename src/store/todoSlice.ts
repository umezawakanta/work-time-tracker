import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { todoApi } from "@/services/api/todoApi";
import { TodoItem } from "@/types";

// DeadlineUtilsの追加
export const DeadlineUtils = {
  // Previous methods remain unchanged
  formatDate: (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short'
    });
  },

  getDaysRemaining: (deadlineDate) => {
    if (!deadlineDate) return null;

    const deadline = new Date(deadlineDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 時間部分をリセット

    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  },

  // Fixed method - handle null case properly
  getDeadlineClassName: (daysRemaining) => {
    if (daysRemaining === null) return '';

    if (daysRemaining < 0) return 'deadline-expired';
    if (daysRemaining === 0) return 'deadline-today';
    if (daysRemaining === 1) return 'deadline-tomorrow';
    if (daysRemaining <= 3) return 'deadline-soon';

    return 'deadline-future';
  },

  // The rest of the object remains the same
  getDeadlineText: (deadlineDate) => {
    if (!deadlineDate) return '';

    const daysRemaining = DeadlineUtils.getDaysRemaining(deadlineDate);
    const formattedDate = DeadlineUtils.formatDate(deadlineDate);

    if (daysRemaining === null) return formattedDate || '';

    if (daysRemaining < 0) return `期限超過(${formattedDate})`;
    if (daysRemaining === 0) return `今日期限(${formattedDate})`;
    if (daysRemaining === 1) return `明日期限(${formattedDate})`;
    if (daysRemaining <= 3) return `残り${daysRemaining}日(${formattedDate})`;

    return formattedDate;
  }
};

interface TodoState {
  items: TodoItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  todoHistory: Record<string, number>;
  dailyHistory: Array<{ date: string; count: number }>;
}

const initialState: TodoState = {
  items: [],
  status: "idle",
  error: null,
  todoHistory: {}, // 既存の履歴データ形式を維持
  dailyHistory: [], // 日別の履歴データを追加
};

export const fetchTodoItems = createAsyncThunk("todo/fetchTodoItems", async () => {
  const response = await todoApi.getAll();
  return response.data;
});

// タイプパラメータを追加
export const addTodoItem = createAsyncThunk(
  "todo/addTodoItem",
  async (todo: {
    task: string;
    priority: number;
    isPrioritized: boolean;
    type?: "input" | "output";
    deadline?: string; // deadline プロパティを追加
  }) => {
    const response = await todoApi.create(
      todo.task,
      todo.priority,
      todo.isPrioritized,
      todo.type || "input",
      todo.deadline // deadline を API に渡す
    );
    return response.data.todo;
  }
);

export const updateTodoItem = createAsyncThunk(
  "todo/updateTodoItem",
  async ({ _id, updates }: { _id: string; updates: Partial<TodoItem> }) => {
    const response = await todoApi.update(_id, updates);
    return response.data.todo;
  }
);

export const deleteTodoItem = createAsyncThunk(
  "todo/deleteTodoItem",
  async (id: string) => {
    await todoApi.delete(id);
    return id;
  }
);

export const resetTodoList = createAsyncThunk("todo/resetTodoList", async () => {
  const response = await todoApi.reset();
  return response.data;
});

// 履歴データ取得のためのアクションを追加
export const fetchTodoHistory = createAsyncThunk(
  "todo/fetchTodoHistory",
  async () => {
    const response = await todoApi.getHistory();
    return response.data;
  }
);

// 日別の履歴データを取得するアクションを追加
export const fetchDailyTodoHistory = createAsyncThunk(
  "todo/fetchDailyTodoHistory",
  async () => {
    const response = await todoApi.getDailyHistory();
    return response.data;
  }
);

export const reorderTodoItems = createAsyncThunk(
  "todo/reorderTodoItems",
  async (items: TodoItem[]) => {
    const response = await todoApi.reorder(items);
    return response.data.todos;
  }
);

export const toggleTodoPriority = createAsyncThunk(
  "todo/toggleTodoPriority",
  async (id: string) => {
    const response = await todoApi.togglePriority(id);
    return response.data.todo;
  }
);

const todoSlice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    // 引数を受け取る形に変更
    updateTodoHistory: (
      state,
      action: { payload: { date: string; count: number } }
    ) => {
      const { date, count } = action.payload;
      state.todoHistory[date] = count;
    },

    // 期限に基づいて優先度を調整するreducerを追加
    adjustDeadlinePriorities: (state) => {
      // 完了していないタスクのみを対象
      const activeTodos = state.items.filter(todo => !todo.completed);

      // 各タスクの期限に基づいて優先度スコアを計算
      const todosWithScore = activeTodos.map(todo => {
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
        isPrioritized: index < 3 || todo.isPrioritized // 上位3つのタスクと既に優先化されているタスクを優先マーク
      }));

      // 状態を更新（完了タスクは変更せず、アクティブなタスクのみ更新）
      state.items = [
        ...reorderedTodos,
        ...state.items.filter(todo => todo.completed)
      ];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodoItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTodoItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTodoItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(addTodoItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateTodoItem.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          // この行が重要です - 古いオブジェクトを新しいオブジェクトで完全に置き換える
          state.items[index] = action.payload;
          
          // デバッグ用にログを追加
          console.log("Todo updated in Redux store:", action.payload);
        }
      })
      .addCase(deleteTodoItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(resetTodoList.pending, (state) => {
        state.status = "loading";
      })
      .addCase(resetTodoList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        // 履歴データはそのまま保持
      })
      .addCase(fetchTodoHistory.fulfilled, (state, action) => {
        // 履歴データを適切な形式に変換
        const historyData = action.payload.reduce((acc, item) => {
          acc[item.date] = item.completedCount;
          return acc;
        }, {});
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
      });
  },
});

export const { updateTodoHistory, adjustDeadlinePriorities } = todoSlice.actions;

export const selectTodos = (state: RootState) => state.todo.items;
export const selectTodoStatus = (state: RootState) => state.todo.status;
export const selectTodoError = (state: RootState) => state.todo.error;
export const selectTodoHistory = (state: RootState) => state.todo.todoHistory;
export const selectDailyHistory = (state: RootState) => state.todo.dailyHistory;
export default todoSlice.reducer;