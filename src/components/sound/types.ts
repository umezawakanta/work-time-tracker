// Local type definitions
export interface MealRecord {
  id: string;
  date: string;
  categories: { [key: string]: number };
  notes?: string;
}

export interface FoodCategory {
  id: string;
  name: string;
  sound: {
    frequency: number;
    duration: number;
    volume: number;
  };
  color: string;
  instrument: string;
  noteMapping: string;
}

export interface ScoreData {
  notes: Array<{
    pitch: string;
    duration: string;
    time: number;
    instrument: string;
  }>;
  timeSignature?: string;
  key?: string;
}

// Saved records
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
  scoreData?: ScoreData; // Add score data
}

// Editable song data
export interface ComposedSong {
  id: string;
  name: string;
  createdDate: string;
  records: SavedRecord[];
  genre: string;
  isEdited: boolean;
  fullScore?: ScoreData; // Complete score
}

// Food category definitions (with note mapping)
export const foodCategories: FoodCategory[] = [
  {
    id: "staple",
    name: "主食",
    sound: { frequency: 220, duration: 0.5, volume: 0.7 },
    color: "#8B4513",
    instrument: "🥁 ドラム",
    noteMapping: "C/3", // VexFlow format
  },
  {
    id: "side",
    name: "副菜",
    sound: { frequency: 330, duration: 0.4, volume: 0.6 },
    color: "#228B22",
    instrument: "🎸 ベース",
    noteMapping: "E/3", // VexFlow format (uppercase)
  },
  {
    id: "miso",
    name: "味噌",
    sound: { frequency: 440, duration: 0.3, volume: 0.5 },
    color: "#D2691E",
    instrument: "🎺 トランペット",
    noteMapping: "A/4", // VexFlow format (uppercase)
  },
  {
    id: "meat",
    name: "肉",
    sound: { frequency: 110, duration: 0.8, volume: 0.9 },
    color: "#DC143C",
    instrument: "🎸 エレキギター",
    noteMapping: "A/2", // VexFlow format (uppercase)
  },
  {
    id: "fish",
    name: "魚",
    sound: { frequency: 880, duration: 0.6, volume: 0.8 },
    color: "#4169E1",
    instrument: "🎹 シンセサイザー",
    noteMapping: "A/5", // VexFlow format (uppercase)
  },
  {
    id: "vegetable",
    name: "野菜",
    sound: { frequency: 660, duration: 0.4, volume: 0.7 },
    color: "#32CD32",
    instrument: "🎹 ピアノ",
    noteMapping: "E/5", // VexFlow format (uppercase)
  },
];

// Category ratio interface
export interface CategoryRatio {
  id: string;
  name: string;
  ratio: number;
  category: string;
  volume: number;
  note: string;
  detune?: number; // Optional detune in cents
  sound?: {
    frequency: number;
    duration: number;
    volume: number;
  };
  instrument?: string;
  noteMapping?: string;
}

// Music genre interface
export interface MusicGenre {
  id: string;
  name: string;
  baseTempo: number;
  instruments: string[];
  description: string;
  keySignature: string;
}

// Instrument interface
export interface Instrument {
  triggerAttackRelease: (note: string, duration: string) => void;
  volume: {
    value: number;
  };
  connect?: (destination: any) => void;
  toDestination?: () => void;
}

// Error interface for better error handling
export interface AppError {
  code: string;
  message: string;
  details?: string;
  timestamp: string;
  userAgent: string;
}

// Pattern interface for rhythm generation
export interface RhythmPattern {
  time: number;
  note: string;
  category: string;
  volume: number;
  detune?: number;
}