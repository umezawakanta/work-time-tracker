import { createSlice } from '@reduxjs/toolkit';

// 作業時間の状態の形を定義
interface WorkTimeState {
  isTracking: boolean;
  startTime: number | null;
  endTime: number | null;
  totalTime: number;
  breaks: { start: number; end: number | null }[];
}

// 初期状態を定義
const initialState: WorkTimeState = {
  isTracking: false,
  startTime: null,
  endTime: null,
  totalTime: 0,
  breaks: [],
};

// 作業時間スライスを作成
const workTimeSlice = createSlice({
  name: 'workTime',
  initialState,
  reducers: {
    startTracking: (state) => {
      state.isTracking = true;
      state.startTime = Date.now();
      state.endTime = null;
    },
    stopTracking: (state) => {
      state.isTracking = false;
      state.endTime = Date.now();
      if (state.startTime) {
        state.totalTime += state.endTime - state.startTime;
      }
    },
    resetTracking: () => initialState,
    startBreak: (state) => {
      state.breaks.push({ start: Date.now(), end: null });
    },
    endBreak: (state) => {
      const currentBreak = state.breaks[state.breaks.length - 1];
      if (currentBreak && currentBreak.end === null) {
        currentBreak.end = Date.now();
      }
    },
    updateTotalTime: (state) => {
      if (state.isTracking && state.startTime) {
        const currentTime = Date.now();
        state.totalTime = currentTime - state.startTime - calculateBreakTime(state.breaks);
      }
    },
  },
});

// 休憩時間の合計を計算するヘルパー関数
const calculateBreakTime = (breaks: { start: number; end: number | null }[]): number => {
  return breaks.reduce((total, breakPeriod) => {
    if (breakPeriod.end) {
      return total + (breakPeriod.end - breakPeriod.start);
    }
    return total;
  }, 0);
};

// アクションとリデューサーをエクスポート
export const {
  startTracking,
  stopTracking,
  resetTracking,
  startBreak,
  endBreak,
  updateTotalTime,
} = workTimeSlice.actions;

export default workTimeSlice.reducer;

// フォーマットされた合計時間を取得するセレクター
export const selectFormattedTotalTime = (state: { workTime: WorkTimeState }) => {
  const totalSeconds = Math.floor(state.workTime.totalTime / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};