import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import axios from 'axios';

// ギター練習のタイプ定義
export interface GuitarPractice {
  _id: string;
  date: string; // ISOフォーマットの日付文字列
  duration: number; // 練習時間（分単位）
  technique: string; // 練習した技術（コード、スケール、アルペジオなど）
  song?: string; // 練習した曲名（任意）
  bpm?: number; // 練習時のテンポ（任意）
  difficulty: number; // 難易度 1-5
  notes?: string; // メモ（任意）
  satisfaction: number; // 満足度 1-5
  isMilestone: boolean; // マイルストーン（重要な進歩）かどうか
  createdAt: string;
}

// 新規追加時のギター練習のタイプ（_idとcreatedAtは自動生成）
export type NewGuitarPractice = Omit<GuitarPractice, '_id' | 'createdAt'>;

// ストアの状態タイプ定義
interface GuitarPracticeState {
  practices: GuitarPractice[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// 初期状態
const initialState: GuitarPracticeState = {
  practices: [],
  status: 'idle',
  error: null,
};

// ギター練習データを取得する非同期アクション
export const fetchGuitarPractices = createAsyncThunk<
  GuitarPractice[],
  void,
  { rejectValue: string }
>('guitarPractice/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/guitar-practices');

    // データ検証
    const data = response.data;
    if (!Array.isArray(data)) {
      console.warn('Guitar practice API returned non-array data:', data);

      // オブジェクトの中に配列が含まれている場合
      if (data && typeof data === 'object') {
        if (Array.isArray(data.practices)) {
          return data.practices;
        }
        if (Array.isArray(data.data)) {
          return data.data;
        }
      }

      return [];
    }

    return data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '練習記録の取得に失敗しました。';
    return rejectWithValue(errorMessage);
  }
});

// ギター練習を追加する非同期アクション
export const addGuitarPractice = createAsyncThunk<
  GuitarPractice,
  NewGuitarPractice,
  { rejectValue: string }
>('guitarPractice/add', async (practice, { rejectWithValue }) => {
  try {
    const response = await axios.post('/api/guitar-practices', practice);
    return response.data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '練習記録の追加に失敗しました。';
    return rejectWithValue(errorMessage);
  }
});

// ギター練習を更新する非同期アクション
export const updateGuitarPractice = createAsyncThunk<
  GuitarPractice,
  GuitarPractice,
  { rejectValue: string }
>('guitarPractice/update', async (practice, { rejectWithValue }) => {
  try {
    const response = await axios.put(`/api/guitar-practices/${practice._id}`, practice);
    return response.data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '練習記録の更新に失敗しました。';
    return rejectWithValue(errorMessage);
  }
});

// ギター練習を削除する非同期アクション
export const deleteGuitarPractice = createAsyncThunk<string, string, { rejectValue: string }>(
  'guitarPractice/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/guitar-practices/${id}`);
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '練習記録の削除に失敗しました。';
      return rejectWithValue(errorMessage);
    }
  }
);

// モック用テストデータを追加するアクション（開発用）
export const addMockGuitarPractices = createAsyncThunk<
  GuitarPractice[],
  void,
  { rejectValue: string }
>('guitarPractice/addMock', async (_, { rejectWithValue }) => {
  try {
    // 実際のAPIが未実装の場合のモックデータ
    const mockPractices: GuitarPractice[] = [
      {
        _id: '1',
        date: '2024-02-01T15:00:00.000Z',
        duration: 45,
        technique: 'コード',
        song: 'Wonderwall',
        bpm: 90,
        difficulty: 3,
        satisfaction: 4,
        notes: '基本的なコード進行の練習。Am, C, G, Fのコード切り替えがスムーズになってきた。',
        isMilestone: false,
        createdAt: '2024-02-01T15:45:00.000Z',
      },
      {
        _id: '2',
        date: '2024-02-03T16:30:00.000Z',
        duration: 60,
        technique: 'スケール',
        song: '',
        bpm: 60,
        difficulty: 4,
        satisfaction: 3,
        notes: 'ペンタトニックスケールの練習。まだ速く弾けないが少しずつ上達している。',
        isMilestone: false,
        createdAt: '2024-02-03T17:30:00.000Z',
      },
      {
        _id: '3',
        date: '2024-02-05T19:00:00.000Z',
        duration: 30,
        technique: 'ピッキング',
        song: '',
        bpm: 80,
        difficulty: 4,
        satisfaction: 2,
        notes: 'オルタネイトピッキングの練習。まだリズムが安定しない。',
        isMilestone: false,
        createdAt: '2024-02-05T19:30:00.000Z',
      },
      {
        _id: '4',
        date: '2024-02-08T20:15:00.000Z',
        duration: 75,
        technique: '曲の練習',
        song: 'ブルースの即興',
        bpm: 100,
        difficulty: 3,
        satisfaction: 5,
        notes: 'ブルース進行での即興練習。思い通りのフレーズが弾けるようになってきた！',
        isMilestone: true,
        createdAt: '2024-02-08T21:30:00.000Z',
      },
      {
        _id: '5',
        date: '2024-02-10T14:00:00.000Z',
        duration: 40,
        technique: 'コード',
        song: 'Hotel California',
        bpm: 75,
        difficulty: 5,
        satisfaction: 3,
        notes: 'バレーコードの練習。手が疲れるが少しずつ綺麗に鳴るようになってきた。',
        isMilestone: false,
        createdAt: '2024-02-10T14:40:00.000Z',
      },
      {
        _id: '6',
        date: '2024-02-12T18:30:00.000Z',
        duration: 90,
        technique: 'アルペジオ',
        song: '',
        bpm: 70,
        difficulty: 4,
        satisfaction: 4,
        notes: 'メジャー・マイナーアルペジオの練習。指の独立性が良くなってきた。',
        isMilestone: false,
        createdAt: '2024-02-12T20:00:00.000Z',
      },
      {
        _id: '7',
        date: new Date().toISOString(),
        duration: 60,
        technique: 'ソロ',
        song: 'Stairway to Heaven',
        bpm: 85,
        difficulty: 5,
        satisfaction: 5,
        notes: 'ソロの練習。ついに最後まで弾けるようになった！長い道のりだった。',
        isMilestone: true,
        createdAt: new Date().toISOString(),
      },
    ];

    return mockPractices;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'モックデータの追加に失敗しました。';
    return rejectWithValue(errorMessage);
  }
});

// Reduxスライス
const guitarPracticeSlice = createSlice({
  name: 'guitarPractice',
  initialState,
  reducers: {
    // ローカルアクションがあれば追加
  },
  extraReducers: (builder) => {
    builder
      // ギター練習の取得
      .addCase(fetchGuitarPractices.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGuitarPractices.fulfilled, (state, action: PayloadAction<GuitarPractice[]>) => {
        state.status = 'succeeded';

        // 安全な配列処理
        const practices = Array.isArray(action.payload) ? action.payload : [];

        // 不正な日付データをフィルタリング
        state.practices = practices.filter((practice) => {
          if (!practice || typeof practice !== 'object') {
            console.warn('Invalid practice object:', practice);
            return false;
          }

          const isValidDate = practice.date && !isNaN(new Date(practice.date).getTime());
          if (!isValidDate) {
            console.warn('Invalid practice date detected and filtered:', practice);
          }
          return isValidDate;
        });

        state.error = null;
      })
      .addCase(fetchGuitarPractices.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // ギター練習の追加
      .addCase(addGuitarPractice.fulfilled, (state, action: PayloadAction<GuitarPractice>) => {
        state.practices.push(action.payload);
        state.error = null;
      })
      .addCase(addGuitarPractice.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // ギター練習の更新
      .addCase(updateGuitarPractice.fulfilled, (state, action: PayloadAction<GuitarPractice>) => {
        const index = state.practices.findIndex((practice) => practice._id === action.payload._id);
        if (index !== -1) {
          state.practices[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateGuitarPractice.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // ギター練習の削除
      .addCase(deleteGuitarPractice.fulfilled, (state, action: PayloadAction<string>) => {
        state.practices = state.practices.filter((practice) => practice._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteGuitarPractice.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // モックデータの追加（開発用）
      .addCase(
        addMockGuitarPractices.fulfilled,
        (state, action: PayloadAction<GuitarPractice[]>) => {
          state.practices = action.payload;
          state.status = 'succeeded';
          state.error = null;
        }
      );
  },
});

// セレクター
export const selectAllGuitarPractices = (state: RootState) => state.guitarPractice.practices;
export const selectGuitarPracticeById = (state: RootState, id: string) =>
  state.guitarPractice.practices.find((practice) => practice._id === id);
export const selectMilestonePractices = (state: RootState) =>
  state.guitarPractice.practices.filter((practice) => practice.isMilestone);

export default guitarPracticeSlice.reducer;
