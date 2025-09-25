import React, { useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  Beam,
  Accidental,
} from "vexflow";
import "./SoundAppComponent.css";

// グローバルでTone.jsの初期化状態を管理
let globalToneInitialized = false;

// 楽譜データの型定義
export interface NoteData {
  pitch: string;
  duration: string;
  time: number;
  instrument: string;
}

export interface ScoreData {
  notes: NoteData[];
  timeSignature: string;
  tempo: number;
  key: string;
}

// 食事カテゴリの定義
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
  noteMapping?: string; // 音符へのマッピング
}

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

// 定数定義
const IDEAL_BALANCE_RATIOS = {
  staple: 0.4,
  side: 0.3,
  miso: 0.1,
  meat: 0.1,
  fish: 0.05,
  vegetable: 0.05,
} as const;

const PLAYBACK_DURATION = 15000;
const TEMPO_RANGE = { MIN: 60, MAX: 200 } as const;
const REPEAT_OPTIONS = {
  NONE: 0,
  ONCE: 1,
  TWICE: 2,
  THREE_TIMES: 3,
  LOOP: -1,
} as const;

// VexFlow調号検証用の正規表現パターン（より包括的）
const VEXFLOW_KEY_SIGNATURE_PATTERN = /^(?:[A-G](?:b|#)?|Cb|F#|G#|D#|A#|E#|B#)$/i;

// VexFlowでサポートされている調号のリスト（メジャー・マイナー両方）
const SUPPORTED_KEY_SIGNATURES = [
  // メジャーキー
  'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#',
  'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb',
  // マイナーキー
  'Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m',
  'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm', 'Dbm', 'Gbm'
] as const;

// Voice.Modeの型安全なアクセス
const VOICE_MODE_SOFT = 3; // VexFlowの定数値

// 周波数→音名の手動マップは未使用のため削除（Tone.Frequencyで変換）

// 音楽ジャンルの定義（拡張版）
export interface MusicGenre {
  id: string;
  name: string;
  baseTempo: number;
  instruments: string[];
  description: string;
  synthSettings?: any;
  keySignature?: string; // 調号
}

// 食事記録の型定義
export interface MealRecord {
  id: string;
  date: string;
  time?: string;
  categories: { [key: string]: number };
  notes?: string;
}

interface SoundAppComponentProps {
  showSoundApp: boolean;
  setShowSoundApp: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
}

const SoundAppComponent: React.FC<SoundAppComponentProps> = ({
  showSoundApp,
  setShowSoundApp,
  closeOtherFeatures,
}) => {
  // 食事カテゴリの定義（音符マッピング追加）
  const foodCategories: FoodCategory[] = [
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

  // 拡張された音楽ジャンル（明和電機風に強化）
  const musicGenres: MusicGenre[] = [
    {
      id: "balanced",
      name: "バランス",
      baseTempo: 120,
      instruments: ["piano", "strings"],
      description: "バランスの取れた食事の時",
      keySignature: "C",
    },
    {
      id: "meiwa",
      name: "明和電機",
      baseTempo: 120,
      instruments: ["8bit", "chip"],
      description: "8bit風のチップチューン・明和電機風",
      keySignature: "C",
    },
    {
      id: "rock",
      name: "ロック",
      baseTempo: 140,
      instruments: ["distortion", "drums", "bass"],
      description: "パワフルなロックサウンド",
      keySignature: "A",
    },
    {
      id: "techno",
      name: "テクノ",
      baseTempo: 128,
      instruments: ["synth", "electronic"],
      description: "明和電機風の電子音楽",
      keySignature: "Am",
    },
    {
      id: "classical",
      name: "クラシック",
      baseTempo: 80,
      instruments: ["strings", "piano", "orchestra"],
      description: "優雅なクラシック",
      keySignature: "G",
    },
    {
      id: "japanese",
      name: "和楽器",
      baseTempo: 100,
      instruments: ["shamisen", "taiko", "koto"],
      description: "明和電機風の機械音",
      keySignature: "Dm",
    },
    {
      id: "jazz",
      name: "ジャズ",
      baseTempo: 110,
      instruments: ["saxophone", "piano", "bass"],
      description: "スウィングジャズ",
      keySignature: "F",
    },
    {
      id: "ambient",
      name: "アンビエント",
      baseTempo: 60,
      instruments: ["pad", "atmosphere"],
      description: "環境音楽",
      keySignature: "C",
    },
    {
      id: "custom",
      name: "カスタム",
      baseTempo: 120,
      instruments: ["piano"],
      description: "ユーザー設定",
      keySignature: "C",
    },
  ];

  // 状態管理
  const [selectedGenre, setSelectedGenre] = useState<string>("balanced");
  const [customTempo, setCustomTempo] = useState<number>(120);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string>("");
  const [repeatMode, setRepeatMode] = useState<number>(REPEAT_OPTIONS.THREE_TIMES);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [currentMeal, setCurrentMeal] = useState<MealRecord>({
    id: Date.now().toString(),
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().split(" ")[0],
    categories: {},
  });

  // 新機能の状態
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);
  const [composedSongs, setComposedSongs] = useState<ComposedSong[]>([]);
  const [viewMode, setViewMode] = useState<
    "input" | "history" | "compose" | "edit" | "score"
  >("input");
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "week" | "month"
  >("day");
  const [editingSong, setEditingSong] = useState<ComposedSong | null>(null);
  const [customInstruments, setCustomInstruments] = useState<string[]>([
    "piano",
  ]);
  const [currentScore, setCurrentScore] = useState<ScoreData | null>(null);
  const [showScore, setShowScore] = useState<boolean>(true);

  // 参照管理
  const instrumentsRef = useRef<{ [key: string]: any }>({});
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const scoreContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);

  // LocalStorageから保存データを読み込み
  useEffect(() => {
    const saved = localStorage.getItem("soundAppRecords");
    if (saved) {
      setSavedRecords(JSON.parse(saved));
    }
    const songs = localStorage.getItem("composedSongs");
    if (songs) {
      setComposedSongs(JSON.parse(songs));
    }
  }, []);

  // 楽譜を描画する関数
  const renderScore = useCallback((scoreData: ScoreData) => {
    if (!scoreContainerRef.current) {
      return;
    }

    // 既存の楽譜をクリア
    scoreContainerRef.current.innerHTML = "";

    try {
      // レンダラーの作成
      const renderer = new Renderer(
        scoreContainerRef.current,
        Renderer.Backends.SVG
      );
      renderer.resize(800, 200);
      const context = renderer.getContext();
      context.setFont("Arial", 10);

      // 譜表の作成（位置を少し調整）
      const stave = new Stave(10, 40, 780);

      // 拍子記号と調号を追加（VexFlowが解釈できない場合はCにフォールバック）
      const keyForVexflow =
        typeof scoreData.key === "string" &&
        SUPPORTED_KEY_SIGNATURES.includes(scoreData.key as any)
          ? scoreData.key
          : "C";
      stave
        .addClef("treble")
        .addTimeSignature(scoreData.timeSignature || "4/4")
        .addKeySignature(keyForVexflow);

      stave.setContext(context).draw();

      // 音符の作成
      const notes = scoreData.notes.map((note) => {
        // VexFlowは大文字の音名を期待（C/4, F#/3形式）
        const vfPitch = note.pitch && note.pitch.includes('/') 
          ? note.pitch.replace(/^([a-g])/, (_, p1) => p1.toUpperCase())
          : "C/4"; // デフォルト値
        const staveNote = new StaveNote({
          clef: "treble",
          keys: [vfPitch],
          duration: note.duration,
          autoStem: true,
        });

        // シャープやフラットを追加（メソッド名を修正）
        if (note.pitch && note.pitch.includes("#")) {
          staveNote.addModifier(new Accidental("#"), 0); // シャープをaddModifierで追加
        } else if (note.pitch && note.pitch.includes("b")) {
          staveNote.addModifier(new Accidental("b"), 0); // フラットをaddModifierで追加
        }

        return staveNote;
      });

      // 音符がない場合は休符を追加
      if (notes.length === 0) {
        notes.push(
          new StaveNote({
            clef: "treble", // ← clefを追加
            keys: ["b/4"],
            duration: "w",
          })
        );
      }

      // Voice の作成
      try {
        const voice = new Voice({
          numBeats: 4,
          beatValue: 4,
        });

        // setMode: SOFT モード（型安全な定数を使用）
        voice.setMode(VOICE_MODE_SOFT);
        voice.addTickables(notes);

        // Formatterで配置
        const formatter = new Formatter();

        // シンプルな形式でフォーマット（まず基本を動作させる）
        formatter.joinVoices([voice]);
        formatter.format([voice], 750);

        // 描画
        voice.draw(context, stave);

        // ビームの追加（後で対応）
        // 一旦コメントアウトして基本描画を確認
      } catch (voiceError) {
        console.error("Voice error:", voiceError);
        // エラー詳細を表示
        console.error("Voice error details:", {
          notesLength: notes.length,
          scoreData: scoreData,
        });
      }

      rendererRef.current = renderer;
    } catch (error) {
      console.error("Score rendering error:", error);
      // エラー詳細を表示
      console.error("Error details:", {
        scoreData: scoreData,
        containerExists: !!scoreContainerRef.current,
      });
    }
  }, []);

  // 楽譜データを生成する関数
  const generateScoreData = useCallback(
    (categoryRatios: any[], genre: MusicGenre): ScoreData => {
      const notes: NoteData[] = [];
      let currentTime = 0;

      // アクティブなカテゴリから音符を生成
      categoryRatios
        .filter((cat) => cat.ratio > 0)
        .forEach((category, index) => {
          const foodCat = foodCategories.find((fc) => fc.id === category.id);
          if (foodCat && foodCat.noteMapping) {
            // 音の長さを音符の長さに変換
            let duration = "q"; // デフォルトは四分音符
            if (category.sound.duration > 0.6) {
              duration = "h"; // 二分音符
            }
            if (category.sound.duration < 0.3) {
              duration = "8"; // 八分音符
            }

            notes.push({
              pitch: foodCat.noteMapping, // すでに正しいVexFlow形式
              duration: duration,
              time: currentTime,
              instrument: foodCat.instrument,
            });

            currentTime += category.sound.duration;
          }
        });

      return {
        notes,
        timeSignature: "4/4",
        tempo: genre.baseTempo,
        key: genre.keySignature || "C",
      };
    },
    [foodCategories]
  );

  // 楽譜をPDFとしてエクスポートする関数
  const exportScoreToPDF = useCallback(() => {
    if (!scoreContainerRef.current) {
      showMessage("楽譜がありません", 2000);
      return;
    }

    // SVGをcanvasに変換してPDF化（簡易実装）
    const svg = scoreContainerRef.current.querySelector("svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `score_${Date.now()}.svg`;
      link.click();

      URL.revokeObjectURL(url);
      showMessage("楽譜をダウンロードしました", 2000);
    }
  }, []);

  // Tone.jsの初期化
  const initializeTone = useCallback(async () => {
    if (globalToneInitialized) {
      return true;
    }

    try {
      await Tone.start();
      console.log("Tone.js started successfully");
      globalToneInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize Tone.js:", error);
      return false;
    }
  }, []);

  // ジャンルに応じた楽器を作成
  const createInstrumentForGenre = useCallback(
    (categoryId: string, genre: string) => {
      // 初期化されていない場合はnullを返す（エラーを防ぐ）
      if (!globalToneInitialized) {
        console.warn(
          "Tone.js not initialized yet. Please click play button first."
        );
        return null;
      }

      let instrument = null;

      // ジャンル別の音色設定（明和電機風に強化）
      switch (genre) {
        case "rock":
          instrument = new Tone.FMSynth({
            harmonicity: 3.0,
            modulationIndex: 25,
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.001, decay: 0.3, sustain: 0.2, release: 0.5 },
            modulation: { type: "square" },
            modulationEnvelope: {
              attack: 0.01,
              decay: 0.3,
              sustain: 0.8,
              release: 0.2,
            },
          }).toDestination();
          break;

        case "techno":
          // 明和電機風の電子音
          instrument = new Tone.MonoSynth({
            oscillator: { 
              type: "pulse",
              width: 0.3,
            },
            envelope: { attack: 0.001, decay: 0.05, sustain: 0.1, release: 0.1 },
            filterEnvelope: {
              attack: 0.001,
              decay: 0.1,
              sustain: 0.3,
              release: 0.2,
              baseFrequency: 200,
              octaves: 6,
            },
            filter: {
              type: "lowpass",
              frequency: 800,
              rolloff: -24,
            },
          }).toDestination();
          break;

        case "classical":
          instrument = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sine" },
            envelope: { attack: 0.1, decay: 0.5, sustain: 0.7, release: 1.5 },
          }).toDestination();
          break;

        case "japanese":
          // 明和電機風の機械音
          instrument = new Tone.FMSynth({
            harmonicity: 1.5,
            modulationIndex: 15,
            oscillator: { type: "triangle" },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.4 },
            modulation: { type: "sawtooth" },
            modulationEnvelope: {
              attack: 0.02,
              decay: 0.1,
              sustain: 0.5,
              release: 0.3,
            },
          }).toDestination();
          break;

        case "jazz":
          instrument = new Tone.MonoSynth({
            oscillator: { type: "sine" },
            envelope: { attack: 0.02, decay: 0.3, sustain: 0.6, release: 0.8 },
            filterEnvelope: {
              attack: 0.02,
              decay: 0.3,
              sustain: 0.6,
              release: 0.8,
              baseFrequency: 250,
              octaves: 2,
            },
          }).toDestination();
          break;

        case "ambient":
          const reverb = new Tone.Reverb({
            decay: 5,
            wet: 0.8,
          }).toDestination();
          instrument = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.5, decay: 1, sustain: 0.8, release: 3 },
          }).connect(reverb);
          break;

        case "meiwa":
          // 明和電機専用の8bit風音色
          instrument = new Tone.MonoSynth({
            oscillator: { 
              type: "square",
              detune: 0,
            } as any,
            envelope: { 
              attack: 0.001, 
              decay: 0.01, 
              sustain: 0.0, 
              release: 0.1 
            },
            filterEnvelope: {
              attack: 0.001,
              decay: 0.01,
              sustain: 0.0,
              release: 0.1,
              baseFrequency: 1000,
              octaves: 2,
            },
            filter: {
              type: "lowpass",
              frequency: 2000,
              rolloff: -12,
            } as any,
          }).toDestination();
          break;

        default:
          instrument = getOrCreateInstrument(categoryId);
      }

      return instrument;
    },
    []
  );

  // 基本楽器の作成（明和電機風に強化）
  const getOrCreateInstrument = useCallback((categoryId: string) => {
    if (!globalToneInitialized) {
      return null;
    }

    if (instrumentsRef.current[categoryId]) {
      return instrumentsRef.current[categoryId];
    }

    let instrument = null;

    switch (categoryId) {
      case "staple":
        // 明和電機風のドラム音
        instrument = new Tone.MembraneSynth({
          pitchDecay: 0.02,
          octaves: 12,
          oscillator: { 
            type: "sawtooth",
            detune: 5,
          } as any,
          envelope: { 
            attack: 0.001, 
            decay: 0.2, 
            sustain: 0.01, 
            release: 0.8 
          },
        }).toDestination();
        break;

      case "side":
        // 明和電機風のベース音
        instrument = new Tone.FMSynth({
          harmonicity: 2.5,
          modulationIndex: 20,
          oscillator: { 
            type: "sawtooth",
            detune: -10,
          } as any,
          envelope: { 
            attack: 0.01, 
            decay: 0.2, 
            sustain: 0.3, 
            release: 0.4 
          },
          modulation: { 
            type: "square",
            detune: 5,
          } as any,
          modulationEnvelope: {
            attack: 0.01,
            decay: 0.1,
            sustain: 0.6,
            release: 0.3,
          },
        }).toDestination();
        break;

      case "miso":
        // 明和電機風のトランペット音
        instrument = new Tone.FMSynth({
          harmonicity: 1.8,
          modulationIndex: 25,
          oscillator: { 
            type: "triangle",
            detune: 3,
          } as any,
          envelope: { 
            attack: 0.02, 
            decay: 0.1, 
            sustain: 0.6, 
            release: 0.2 
          },
          modulation: { 
            type: "sine",
            detune: -2,
          } as any,
          modulationEnvelope: {
            attack: 0.01,
            decay: 0.05,
            sustain: 0.8,
            release: 0.1,
          },
        }).toDestination();
        break;

      case "meat":
        // 明和電機風のエレキギター音
        instrument = new Tone.FMSynth({
          harmonicity: 4.0,
          modulationIndex: 35,
          oscillator: { 
            type: "sawtooth",
            detune: 8,
          } as any,
          envelope: { 
            attack: 0.001, 
            decay: 0.2, 
            sustain: 0.1, 
            release: 0.3 
          },
          modulation: { 
            type: "square",
            detune: -8,
          } as any,
          modulationEnvelope: {
            attack: 0.005,
            decay: 0.3,
            sustain: 0.1,
            release: 0.05,
          },
        }).toDestination();
        break;

      case "fish":
        // 明和電機風のシンセサイザー音
        instrument = new Tone.FMSynth({
          harmonicity: 1.2,
          modulationIndex: 18,
          oscillator: { 
            type: "sawtooth",
            detune: 12,
          } as any,
          envelope: { 
            attack: 0.01, 
            decay: 0.05, 
            sustain: 0.2, 
            release: 0.3 
          },
          modulation: { 
            type: "triangle",
            detune: -5,
          } as any,
          modulationEnvelope: {
            attack: 0.02,
            decay: 0.1,
            sustain: 0.4,
            release: 0.2,
          },
        }).toDestination();
        break;

      case "vegetable":
        // 明和電機風のピアノ音
        instrument = new Tone.FMSynth({
          harmonicity: 0.5,
          modulationIndex: 8,
          oscillator: { 
            type: "sine",
            detune: 2,
          } as any,
          envelope: { 
            attack: 0.005, 
            decay: 0.2, 
            sustain: 0.4, 
            release: 0.8 
          },
          modulation: { 
            type: "sine",
            detune: 1,
          } as any,
          modulationEnvelope: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.2,
            release: 0.5,
          },
        }).toDestination();
        break;
    }

    if (instrument) {
      instrumentsRef.current[categoryId] = instrument;
    }

    return instrument;
  }, []);

  // メッセージ表示
  const showMessage = (message: string, duration: number = 3000) => {
    setUserMessage(message);
    setTimeout(() => setUserMessage(""), duration);
  };

  // 音を再生
  const playSound = useCallback(
    (
      categoryId: string,
      frequency: number,
      duration: number,
      volume: number,
      genre?: string
    ) => {
      const instrument = genre
        ? createInstrumentForGenre(categoryId, genre)
        : getOrCreateInstrument(categoryId);
      if (!instrument) {
        return;
      }

      try {
        const volumeDb = Math.log10(Math.max(0.001, volume)) * 20;
        instrument.volume.value = volumeDb;

        if (categoryId === "staple" || genre === "japanese") {
          instrument.triggerAttackRelease("C2", duration + "s");
        } else {
          let note;
          try {
            note = Tone.Frequency(frequency, "hz").toNote();
          } catch (freqError) {
            throw new Error(`Failed to convert frequency ${frequency} Hz to a musical note: ${freqError instanceof Error ? freqError.message : String(freqError)}`);
          }
          instrument.triggerAttackRelease(note, duration + "s");
        }
      } catch (error) {
        console.log(`Could not play sound for ${categoryId}:`, error);
      }
    },
    [getOrCreateInstrument, createInstrumentForGenre]
  );

  // 和音の定義（明和電機風に強化）
  const chordProgressions = {
    major: [
      { name: "C", notes: ["C4", "E4", "G4"] },
      { name: "F", notes: ["F4", "A4", "C5"] },
      { name: "G", notes: ["G4", "B4", "D5"] },
      { name: "Am", notes: ["A4", "C5", "E5"] },
    ],
    minor: [
      { name: "Am", notes: ["A3", "C4", "E4"] },
      { name: "Dm", notes: ["D4", "F4", "A4"] },
      { name: "Em", notes: ["E4", "G4", "B4"] },
      { name: "G", notes: ["G3", "B3", "D4"] },
    ],
    jazz: [
      { name: "CMaj7", notes: ["C4", "E4", "G4", "B4"] },
      { name: "Dm7", notes: ["D4", "F4", "A4", "C5"] },
      { name: "G7", notes: ["G3", "B3", "D4", "F4"] },
      { name: "Am7", notes: ["A3", "C4", "E4", "G4"] },
    ],
    japanese: [
      { name: "Iyoushi", notes: ["C4", "D4", "F4"] },
      { name: "Youshi", notes: ["C4", "E4", "G4"] },
      { name: "Ritsu", notes: ["D4", "E4", "A4"] },
      { name: "Min", notes: ["E4", "F4", "B4"] },
    ],
    meiwa: [
      // 明和電機風の8bitメロディー（シンプルな音階）
      { name: "Meiwa1", notes: ["C4", "D4", "E4", "F4"] },
      { name: "Meiwa2", notes: ["G4", "A4", "B4", "C5"] },
      { name: "Meiwa3", notes: ["F4", "E4", "D4", "C4"] },
      { name: "Meiwa4", notes: ["G4", "F4", "E4", "D4"] },
    ],
  };

  // ジャンルに応じた和音進行を選択（明和電機風に強化）
  const getChordProgression = (genre: string, balanceScore: number) => {
    if (genre === "meiwa") {
      return chordProgressions.meiwa;
    }
    if (genre === "jazz") {
      return chordProgressions.jazz;
    }
    if (genre === "japanese") {
      return chordProgressions.japanese;
    }
    if (genre === "classical" || balanceScore > 0.7) {
      return chordProgressions.major;
    }
    return chordProgressions.minor;
  };

  // 音楽を生成（明和電機風に強化）
  const generateMusic = useCallback(
    (categoryRatios: any[], balanceScore: number, genre: MusicGenre) => {
      playTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      playTimeoutsRef.current = [];

      const { baseTempo } = genre;
      let adjustedTempo = baseTempo;
      
      // 明和電機風の場合は固定テンポ
      if (genre.id === "meiwa") {
        adjustedTempo = 120; // 8bit風のテンポ
      } else {
        adjustedTempo = Math.max(80, Math.min(160, baseTempo * (0.7 + balanceScore * 0.3)));
      }
      
      const beatDuration = 60 / adjustedTempo;

      const activeCats = categoryRatios
        .filter((cat) => cat.ratio > 0)
        .sort((a, b) => b.ratio - a.ratio);

      // 楽譜データを生成
      const scoreData = generateScoreData(categoryRatios, genre);
      setCurrentScore(scoreData);

      // 楽譜を表示
      if (showScore && scoreData) {
        setTimeout(() => renderScore(scoreData), 100);
      }

      // 明和電機風の8bitメロディー生成
      if (genre.id === "meiwa") {
        // 8bit風のシンプルなメロディー
        const melodyNotes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
        const melodyPattern = [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 4, 5, 4, 3, 2, 1];
        
        melodyPattern.forEach((noteIndex, index) => {
          const delay = index * beatDuration * 200; // より速いテンポ
          const note = melodyNotes[noteIndex % melodyNotes.length];
          const frequency = Tone.Frequency(note).toFrequency();
          const duration = 0.1; // 短いビープ音
          const volume = 0.8;

          const timeout = setTimeout(() => {
            playSound("staple", frequency, duration, volume, genre.id);
          }, delay);

          playTimeoutsRef.current.push(timeout);
        });
      } else {
        // 通常のメロディーラインを生成
        activeCats.forEach((category, index) => {
          const delay = index * beatDuration * 800;
          const frequency = category.sound.frequency * (0.9 + balanceScore * 0.2);
          const duration = category.sound.duration * (1.0 + balanceScore * 0.6);
          const volume = Math.min(0.6, category.sound.volume * (0.5 + balanceScore * 0.5));

          const timeout = setTimeout(() => {
            playSound(category.id, frequency, duration, volume, genre.id);

            // リアルタイムで楽譜をハイライト（視覚的フィードバック）
            if (scoreContainerRef.current) {
              const notes = scoreContainerRef.current.querySelectorAll(".vf-stavenote");
              if (notes[index]) {
                notes[index].classList.add("playing");
                setTimeout(() => notes[index].classList.remove("playing"), duration * 1000);
              }
            }
          }, delay);

          playTimeoutsRef.current.push(timeout);
        });
      }

      // 和音進行を追加（明和電機風以外）
      if (genre.id !== "meiwa") {
        const chordProg = getChordProgression(genre.id, balanceScore);

        if (balanceScore > 0.4) {
          const harmonyStartDelay = activeCats.length * beatDuration * 800 + 500;

          chordProg.forEach((chord, chordIndex) => {
            const chordDelay = harmonyStartDelay + chordIndex * beatDuration * 1000;

            const timeout = setTimeout(() => {
              const pianoInst = getOrCreateInstrument("vegetable");
              if (pianoInst) {
                try {
                  const chordVolume = balanceScore > 0.7 ? 0.5 : 0.3;
                  pianoInst.volume.value = Math.log10(Math.max(0.001, chordVolume)) * 20;
                  // 和音を個別の音符として順次再生
                  chord.notes.forEach((note, index) => {
                    setTimeout(() => {
                      pianoInst.triggerAttackRelease(note, "2s");
                    }, index * 50); // 50ms間隔で順次再生
                  });
                } catch (e) {
                  console.error("Chord playback failed:", e);
                }
              }
            }, chordDelay);

            playTimeoutsRef.current.push(timeout);
          });
        }
      }
    },
    [
      playSound,
      getOrCreateInstrument,
      generateScoreData,
      renderScore,
      showScore,
    ]
  );

  // メイン再生関数
  const playMealBalance = useCallback(async () => {
    if (!globalToneInitialized) {
      const success = await initializeTone();
      if (!success) {
        showMessage("音声システムの初期化に失敗しました", 3000);
        return;
      }
      showMessage("音声システムを起動しました！", 2000);
    }

    if (isPlaying && !isLooping) {
      showMessage("再生中です...", 2000);
      return;
    }

    const totalItems = Object.values(currentMeal.categories).reduce(
      (sum, count) => sum + count,
      0
    );
    if (totalItems === 0) {
      showMessage("食事を記録してください", 3000);
      return;
    }

    setIsPlaying(true);
    const genre =
      musicGenres.find((g) => g.id === selectedGenre) || musicGenres[0];

    const categoryRatios = foodCategories.map((category) => ({
      ...category,
      ratio: (currentMeal.categories[category.id] || 0) / totalItems,
    }));

    const balanceScore =
      categoryRatios.reduce((score, category) => {
        const ideal =
          IDEAL_BALANCE_RATIOS[
            category.id as keyof typeof IDEAL_BALANCE_RATIOS
          ] || 0;
        return score + (1 - Math.abs(ideal - category.ratio));
      }, 0) / categoryRatios.length;

    generateMusic(categoryRatios, balanceScore, genre);

    const message =
      balanceScore > 0.7
        ? "素晴らしいバランスです！🎵"
        : balanceScore > 0.4
        ? "まあまあのバランスです"
        : "バランスを改善しましょう";
    showMessage(message, 4000);

    if (repeatMode === REPEAT_OPTIONS.LOOP) {
      setIsLooping(true);
      const loop = () => {
        generateMusic(categoryRatios, balanceScore, genre);
        loopTimeoutRef.current = setTimeout(loop, PLAYBACK_DURATION);
      };
      loopTimeoutRef.current = setTimeout(loop, PLAYBACK_DURATION);
    } else if (repeatMode > 0) {
      let count = 0;
      const repeat = () => {
        if (++count < repeatMode) {
          generateMusic(categoryRatios, balanceScore, genre);
          setTimeout(repeat, PLAYBACK_DURATION);
        } else {
          setIsPlaying(false);
        }
      };
      setTimeout(repeat, PLAYBACK_DURATION);
    } else {
      setTimeout(() => setIsPlaying(false), PLAYBACK_DURATION);
    }
  }, [
    currentMeal,
    selectedGenre,
    repeatMode,
    isPlaying,
    isLooping,
    foodCategories,
    musicGenres,
    initializeTone,
    generateMusic,
    showMessage,
  ]);

  // その他の関数（省略：既存のコードと同じ）
  const stopPlayback = () => {
    setIsPlaying(false);
    setIsLooping(false);
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
    playTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    playTimeoutsRef.current = [];
  };

  const updateCategoryCount = (categoryId: string, count: number) => {
    setCurrentMeal((prev) => ({
      ...prev,
      categories: { ...prev.categories, [categoryId]: Math.max(0, count) },
    }));
  };

  const resetMeal = () => {
    setCurrentMeal((prev) => ({
      ...prev,
      categories: {},
      time: new Date().toTimeString().split(" ")[0],
    }));
    setCurrentScore(null);
  };

  return (
    <div className="sound-app-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">🎵</span>
          音アプリ（楽譜表示版）
        </h2>
        <button
          onClick={() => setShowSoundApp(!showSoundApp)}
          className={
            showSoundApp ? "close-section-button" : "show-section-button"
          }
        >
          {showSoundApp ? "✕" : "▶"}
        </button>
      </div>

      {showSoundApp && (
        <div className="sound-app-content">
          <div className="app-description">
            <p>食事のバランスを音と楽譜で表現します 🎼</p>
            {!globalToneInitialized && (
              <p className="tone-init-hint">初回は音ボタンをクリックしてください</p>
            )}
          </div>

          {/* 楽譜表示エリア */}
          {showScore && (
            <div className="score-section">
              <div className="score-header">
                <h3>🎼 楽譜</h3>
                <div className="score-controls">
                  <button onClick={() => setShowScore(!showScore)}>
                    {showScore ? "楽譜を隠す" : "楽譜を表示"}
                  </button>
                  <button onClick={exportScoreToPDF} disabled={!currentScore}>
                    📥 楽譜をダウンロード
                  </button>
                </div>
              </div>
              <div
                ref={scoreContainerRef}
                className="score-container"
              />
            </div>
          )}

          {/* ビューモード切り替え */}
          <div className="view-mode-tabs">
            <button
              className={viewMode === "input" ? "active" : ""}
              onClick={() => setViewMode("input")}
            >
              入力
            </button>
            <button
              className={viewMode === "score" ? "active" : ""}
              onClick={() => setViewMode("score")}
            >
              楽譜設定
            </button>
          </div>

          {/* 入力ビュー */}
          {viewMode === "input" && (
            <>
              <div className="genre-selection">
                <h3>🎼 音楽ジャンル</h3>
                <div className="genre-grid">
                  {musicGenres.map((genre) => (
                    <button
                      key={genre.id}
                      className={`genre-button ${
                        selectedGenre === genre.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedGenre(genre.id)}
                    >
                      <div>{genre.name}</div>
                      <small>{genre.description}</small>
                      <small>調: {genre.keySignature}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="meal-recording">
                <h3>🍽️ 食事記録</h3>
                <div className="category-grid">
                  {foodCategories.map((category) => (
                    <div key={category.id} className="category-item">
                  <span
                    className={`category-color-square cat-${category.id}`}
                    aria-hidden="true"
                  ></span>
                      <span>{category.name}</span>
                      <span>{category.instrument}</span>
                      <span className="note-display">
                        ♪{category.noteMapping}
                      </span>
                      <div className="count-controls">
                        <button
                          onClick={() =>
                            updateCategoryCount(
                              category.id,
                              (currentMeal.categories[category.id] || 0) - 1
                            )
                          }
                        >
                          -
                        </button>
                        <span>{currentMeal.categories[category.id] || 0}</span>
                        <button
                          onClick={() =>
                            updateCategoryCount(
                              category.id,
                              (currentMeal.categories[category.id] || 0) + 1
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={resetMeal}>リセット</button>
              </div>

              <div className="sound-controls">
                <button
                  onClick={playMealBalance}
                  disabled={
                    isPlaying ||
                    Object.values(currentMeal.categories).every((c) => c === 0)
                  }
                  className={`play-button ${isPlaying ? "playing" : ""}`}
                >
                  {!globalToneInitialized
                    ? "🎵 クリックして起動"
                    : isPlaying
                    ? "再生中..."
                    : "再生"}
                </button>
                {isLooping && <button onClick={stopPlayback}>停止</button>}
              </div>
            </>
          )}

          {/* 楽譜設定ビュー */}
          {viewMode === "score" && (
            <div className="score-settings">
              <h3>🎼 楽譜設定</h3>
              <div className="settings-grid">
                <div className="setting-item">
                  <label htmlFor="score-display-checkbox">楽譜表示</label>
                  <input
                    id="score-display-checkbox"
                    type="checkbox"
                    checked={showScore}
                    onChange={(e) => setShowScore(e.target.checked)}
                    aria-label="楽譜の表示切り替え"
                  />
                </div>
                <div className="setting-item">
                  <label htmlFor="note-color-select">音符の色分け</label>
                  <select id="note-color-select" aria-label="音符の色分け設定">
                    <option>カテゴリー別</option>
                    <option>楽器別</option>
                    <option>なし</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label htmlFor="score-size-range">楽譜のサイズ</label>
                  <input
                    id="score-size-range"
                    type="range"
                    min="50"
                    max="150"
                    defaultValue="100"
                    aria-label="楽譜のサイズ調整"
                  />
                </div>
              </div>
            </div>
          )}

      {userMessage && (
        <div className="user-message user-message-box">{userMessage}</div>
      )}
        </div>
      )}
    </div>
  );
};

export default SoundAppComponent;
