import { MealRecord, FoodCategory } from "./MealRecording";
import { ScoreData } from "./ScoreDisplay";

// 保存された記録
export interface SavedRecord {
  id: string;
  date: string;
  mealData: MealRecord;
  genre: string;
  customSettings?: {
    tempo: number;
    instruments: string[];
  };
  balanceScore: number;
  scoreData?: ScoreData; // 楽譜データを追加
}

// 編集可能な曲データ
export interface ComposedSong {
  id: string;
  name: string;
  createdDate: string;
  records: SavedRecord[];
  genre: string;
  isEdited: boolean;
  fullScore?: ScoreData; // 完全な楽譜
}

// 食事カテゴリの定義（音符マッピング追加）
export const foodCategories: FoodCategory[] = [
  {
    id: "staple",
    name: "主食",
    sound: { frequency: 220, duration: 0.5, volume: 0.7 },
    color: "#8B4513",
    instrument: "🥁 ドラム",
    noteMapping: "C/3", // VexFlow形式（大文字）
  },
  {
    id: "side",
    name: "副菜",
    sound: { frequency: 330, duration: 0.4, volume: 0.6 },
    color: "#228B22",
    instrument: "🎸 ベース",
    noteMapping: "E/3", // VexFlow形式（大文字）
  },
  {
    id: "miso",
    name: "味噌",
    sound: { frequency: 440, duration: 0.3, volume: 0.5 },
    color: "#D2691E",
    instrument: "🎺 トランペット",
    noteMapping: "A/4", // VexFlow形式（大文字）
  },
  {
    id: "meat",
    name: "肉",
    sound: { frequency: 110, duration: 0.8, volume: 0.9 },
    color: "#DC143C",
    instrument: "🎸 エレキギター",
    noteMapping: "A/2", // VexFlow形式（大文字）
  },
  {
    id: "fish",
    name: "魚",
    sound: { frequency: 880, duration: 0.6, volume: 0.8 },
    color: "#4169E1",
    instrument: "🎹 シンセサイザー",
    noteMapping: "A/5", // VexFlow形式（大文字）
  },
  {
    id: "vegetable",
    name: "野菜",
    sound: { frequency: 660, duration: 0.4, volume: 0.7 },
    color: "#32CD32",
    instrument: "🎹 ピアノ",
    noteMapping: "E/5", // VexFlow形式（大文字）
  },
];
