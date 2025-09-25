import * as Tone from "tone";
import { ensureAudioContextReady } from "./AudioContextUtils";

// グローバルでTone.jsの初期化状態を管理（ユーザー操作時のみ初期化）
let globalToneInitialized = false;
let toneInitializationPromise: Promise<boolean> | null = null;
let isInitializing = false;

// Tone.jsの自動初期化を防ぐ
Tone.context.latencyHint = "interactive";
try {
  if (Tone.context.state !== 'closed') {
    Tone.context.dispose();
  }
} catch (error) {
  console.log("Tone.js context already disposed or not initialized");
}

// カテゴリに応じた音符を取得する関数
const getNoteForCategory = (categoryId: string, genre?: string, frequency?: number): string => {
  // 主食や日本風の場合は固定のドラム音
  if (categoryId === "staple" || genre === "japanese") {
    return "C2";
  }
  
  // その他の場合は周波数から音符を生成
  if (frequency) {
    try {
      return Tone.Frequency(frequency, "hz").toNote();
    } catch (freqError) {
      throw new Error(`Invalid frequency (${frequency}Hz) specified for note conversion`);
    }
  }
  
  // デフォルトの音符
  return "C4";
};

// 8bit風エフェクトチェーンを作成（遅延初期化）
export const create8bitEffects = async () => {
  // Tone.jsが初期化されているか確認
  if (!globalToneInitialized) {
    const initialized = await initializeTone();
    if (!initialized) {
      console.warn("Tone.js not initialized for creating effects");
      return null;
    }
  }

  // AudioContextが準備できているか確認
  const isReady = await ensureAudioContextReady();
  if (!isReady) {
    console.warn("AudioContext is not ready for creating effects");
    return null;
  }

  try {
    // ビットクラッシュエフェクト（8bit風のデジタル歪み）
    const bitCrusher = new Tone.BitCrusher(4); // 4bitにクラッシュ（8bit風）

    // ローパスフィルター（8bit風の音質制限）
    const lowpassFilter = new Tone.Filter({
      type: "lowpass",
      frequency: 2000,
    });

    // デジタルディストーション
    const distortion = new Tone.Distortion({
      distortion: 0.2,
      wet: 0.4,
    });

    // エフェクトチェーンを構築
    bitCrusher.chain(lowpassFilter, distortion, Tone.Destination);
    
    return bitCrusher;
  } catch (error) {
    console.error("Failed to create 8bit effects:", error);
    return null;
  }
};

// 明和電機風の8bit音色を作成（エフェクト付き）
export const createMeiwaInstrument = async (categoryId: string) => {
  // Tone.jsが初期化されているか確認
  if (!globalToneInitialized) {
    const initialized = await initializeTone();
    if (!initialized) {
      console.warn("Tone.js not initialized for creating Meiwa instrument");
      return null;
    }
  }

  try {
    const effects = await create8bitEffects();
    if (!effects) {
      return null;
    }

    // カテゴリ別の明和電機風音色設定（エフェクト付き）
    switch (categoryId) {
      case "staple":
        // ドラム風の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "square" as const,
            detune: -12, // 低音にデチューン
          },
          envelope: { 
            attack: 0.001, 
            decay: 0.05, 
            sustain: 0.0, 
            release: 0.1 
          },
          filter: {
            type: "lowpass" as const,
            frequency: 400,
          },
        }).connect(effects);

      case "side":
        // ベース風の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "sawtooth",
            detune: -6,
          },
          envelope: { 
            attack: 0.01, 
            decay: 0.1, 
            sustain: 0.3, 
            release: 0.2 
          },
          filter: {
            type: "lowpass",
            frequency: 600,
          },
        }).connect(effects);

      case "miso":
        // メロディー風の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "square",
            detune: 0,
          },
          envelope: { 
            attack: 0.001, 
            decay: 0.02, 
            sustain: 0.1, 
            release: 0.15 
          },
          filter: {
            type: "lowpass",
            frequency: 1200,
          },
        }).connect(effects);

      case "meat":
        // リード風の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "sawtooth",
            detune: 3,
          },
          envelope: { 
            attack: 0.001, 
            decay: 0.03, 
            sustain: 0.2, 
            release: 0.1 
          },
          filter: {
            type: "lowpass",
            frequency: 800,
          },
        }).connect(effects);

      case "fish":
        // 高音域の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "triangle",
            detune: 6,
          },
          envelope: { 
            attack: 0.001, 
            decay: 0.01, 
            sustain: 0.05, 
            release: 0.08 
          },
          filter: {
            type: "lowpass",
            frequency: 2000,
          },
        }).connect(effects);

      case "vegetable":
        // ピアノ風の8bit音
        return new Tone.MonoSynth({
          oscillator: { 
            type: "square",
            detune: -3,
          },
          envelope: { 
            attack: 0.001, 
            decay: 0.05, 
            sustain: 0.1, 
            release: 0.2 
          },
          filter: {
            type: "lowpass",
            frequency: 1000,
          },
        }).connect(effects);

      default:
        return new Tone.MonoSynth({
          oscillator: { 
            type: "square",
            detune: 0,
          },
          envelope: { 
            attack: 0.001, 
            decay: 0.02, 
            sustain: 0.0, 
            release: 0.1 
          },
          filter: {
            type: "lowpass",
            frequency: 1000,
          },
        }).connect(effects);
    }
  } catch (error) {
    console.error("Failed to create Meiwa instrument:", error);
    return null;
  }
};

// Tone.jsの初期化（ユーザー操作時のみ）
export const initializeTone = async (): Promise<boolean> => {
  if (globalToneInitialized) {
    return true;
  }

  // 既に初期化中の場合は同じPromiseを返す
  if (toneInitializationPromise) {
    return toneInitializationPromise;
  }

  // 初期化中フラグを設定
  if (isInitializing) {
    return false;
  }

  isInitializing = true;

  toneInitializationPromise = (async () => {
    try {
      // ユーザー操作後にAudioContextを確実に準備
      const audioReady = await ensureAudioContextReady();
      if (!audioReady) {
        throw new Error("AudioContext is not ready");
      }

      // Tone.jsを明示的に開始（ユーザー操作後なので安全）
      console.log("Starting Tone.js after user interaction...");
      await Tone.start();
      
      console.log("Tone.js started successfully");
      globalToneInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize Tone.js:", error);
      globalToneInitialized = false;
      return false;
    } finally {
      toneInitializationPromise = null;
      isInitializing = false;
    }
  })();

  return toneInitializationPromise;
};

// 音を再生
export const playSound = async (
  categoryId: string,
  frequency: number,
  duration: number,
  volume: number,
  genre?: string,
  instrumentsRef?: { [key: string]: any },
  createInstrumentForGenre?: (categoryId: string, genre: string) => Promise<any>,
  getOrCreateInstrument?: (categoryId: string) => Promise<any>
) => {
  // Tone.jsが初期化されているか確認
  if (!globalToneInitialized) {
    const initialized = await initializeTone();
    if (!initialized) {
      console.warn("Tone.js not initialized, skipping sound playback");
      return;
    }
  }

  // AudioContextの状態を確認し、必要に応じて再開
  const isReady = await ensureAudioContextReady();
  if (!isReady) {
    console.warn("AudioContext is not ready, skipping sound playback");
    return;
  }


  try {
    let instrument = null;
    
    if (genre && createInstrumentForGenre) {
      instrument = await createInstrumentForGenre(categoryId, genre);
    } else if (getOrCreateInstrument) {
      instrument = await getOrCreateInstrument(categoryId);
    }
    
    if (!instrument) {
      return;
    }

    const volumeDb = Math.log10(Math.max(0.001, volume)) * 20;
    instrument.volume.value = volumeDb;

    const noteToPlay = getNoteForCategory(categoryId, genre, frequency);
    instrument.triggerAttackRelease(noteToPlay, duration + "s");
  } catch (error) {
    console.error(`Could not play sound for ${categoryId}:`, error);
  }
};

export { globalToneInitialized };
